import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import readline from 'node:readline';
import {fileURLToPath} from 'node:url';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDirectory, '..');
const pluginRoot = path.resolve(process.argv[2] ?? path.join(repositoryRoot, 'plugins', 'play-agent'));
const config = JSON.parse(await readFile(path.join(pluginRoot, '.mcp.json'), 'utf8'));
const entries = Object.entries(config.mcpServers ?? {});

assert.equal(entries.length, 1, 'Expected exactly one bundled MCP server.');

const [serverName, server] = entries[0];
assert.equal(serverName, 'play-agent');
assert.equal(typeof server.command, 'string');
assert.ok(server.command.length > 0, 'The MCP command must not be empty.');

const serverCwd = path.resolve(pluginRoot, server.cwd ?? '.');
const childEnvironment = {...process.env, ...(server.env ?? {})};
if (process.env.PLAY_AGENT_SMOKE_PATH !== undefined) {
  childEnvironment.PATH = process.env.PLAY_AGENT_SMOKE_PATH;
  delete childEnvironment.PLAY_AGENT_SMOKE_PATH;
}
const child = spawn(server.command, server.args ?? [], {
  cwd: serverCwd,
  env: childEnvironment,
  stdio: ['pipe', 'pipe', 'pipe'],
});

let stderr = '';
let nextRequestId = 1;
let startupError;
const pending = new Map();
const output = readline.createInterface({input: child.stdout, crlfDelay: Infinity});

child.stderr.setEncoding('utf8');
child.stderr.on('data', (chunk) => {
  stderr += chunk;
});
child.on('error', (error) => {
  startupError = error;
  for (const {reject} of pending.values()) {
    reject(error);
  }
  pending.clear();
});
output.on('line', (line) => {
  let message;
  try {
    message = JSON.parse(line);
  } catch {
    return;
  }
  const request = pending.get(message.id);
  if (!request) return;
  clearTimeout(request.timeout);
  pending.delete(message.id);
  request.resolve(message);
});

function request(method, params) {
  if (startupError) return Promise.reject(startupError);
  const id = nextRequestId++;
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      pending.delete(id);
      reject(new Error(`Timed out waiting for ${method}. stderr: ${stderr.trim() || '(empty)'}`));
    }, 5000);
    pending.set(id, {resolve, reject, timeout});
    child.stdin.write(`${JSON.stringify({jsonrpc: '2.0', id, method, params})}\n`);
  });
}

try {
  const initialized = await request('initialize', {
    protocolVersion: '2025-06-18',
    capabilities: {},
    clientInfo: {name: 'play-agent-plugin-smoke-test', version: '1.0.0'},
  });
  assert.equal(initialized.result?.serverInfo?.name, 'play-agent');

  const tools = await request('tools/list');
  assert.deepEqual(tools.result?.tools?.map((tool) => tool.name), ['present_work_map']);
  const resourceUri = tools.result.tools[0]?._meta?.ui?.resourceUri;
  assert.equal(resourceUri, 'ui://play-agent/work-map.html');

  const resource = await request('resources/read', {uri: resourceUri});
  const appHtml = resource.result?.contents?.[0]?.text;
  assert.equal(resource.result?.contents?.[0]?.mimeType, 'text/html;profile=mcp-app');
  assert.match(appHtml, /<html/);
  assert.match(appHtml, /window\.openai/);

  const presented = await request('tools/call', {
    name: 'present_work_map',
    arguments: {
      title: 'Bundled plugin smoke test',
      authorRole: 'agent',
      entryNodeId: 'evidence-runtime',
      nodes: [
        {
          id: 'evidence-runtime',
          kind: 'evidence',
          title: 'The bundled MCP runtime responds',
        },
        {
          id: 'decision-tool-path',
          kind: 'decision',
          title: 'Use the connected MCP tool for host delivery',
        },
      ],
      edges: [
        {
          from: 'evidence-runtime',
          to: 'decision-tool-path',
          relation: 'supports',
        },
      ],
    },
  });
  assert.equal(presented.result?.structuredContent?.snapshot?.nodes?.length, 2);
  assert.equal(presented.result?._meta?.ui?.resourceUri, resourceUri);

  console.log(`Verified ${serverName}: startup, tool discovery, App resource, and tool call.`);
} finally {
  output.close();
  child.stdin.end();
  child.kill();
  if (child.exitCode === null && child.signalCode === null) {
    await Promise.race([
      once(child, 'exit'),
      new Promise((resolve) => setTimeout(resolve, 1000)),
    ]);
  }
}
