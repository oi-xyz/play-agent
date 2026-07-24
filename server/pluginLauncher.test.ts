import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {chmod, mkdir, mkdtemp, rm, symlink, writeFile} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import readline from 'node:readline';
import {test} from 'node:test';

const repositoryRoot = path.resolve(import.meta.dirname, '..');
const pluginRoot = path.join(repositoryRoot, 'plugins', 'play-agent');
const launcher = path.join(pluginRoot, 'bin', 'play-agent-mcp');

async function initializeWithEnvironment(environment: NodeJS.ProcessEnv) {
  const child = spawn(launcher, [], {
    cwd: pluginRoot,
    env: environment,
    stdio: ['pipe', 'pipe', 'pipe'],
  });
  const output = readline.createInterface({input: child.stdout, crlfDelay: Infinity});
  const response = new Promise<Record<string, unknown>>((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Timed out waiting for the launcher response.')), 5000);
    output.once('line', (line) => {
      clearTimeout(timeout);
      resolve(JSON.parse(line) as Record<string, unknown>);
    });
    child.once('error', reject);
  });

  child.stdin.write(`${JSON.stringify({
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
      protocolVersion: '2025-06-18',
      capabilities: {},
      clientInfo: {name: 'launcher-test', version: '1.0.0'},
    },
  })}\n`);

  try {
    return await response;
  } finally {
    output.close();
    child.stdin.end();
    child.kill();
  }
}

test('plugin launcher finds a default fnm Node when GUI PATH omits node', async () => {
  const temporaryHome = await mkdtemp(path.join(os.tmpdir(), 'play-agent-launcher-'));
  const fnmNode = path.join(temporaryHome, '.local', 'share', 'fnm', 'aliases', 'default', 'bin', 'node');
  await mkdir(path.dirname(fnmNode), {recursive: true});
  await symlink(process.execPath, fnmNode);

  try {
    const response = await initializeWithEnvironment({
      HOME: temporaryHome,
      PATH: '/usr/bin:/bin',
    });
    assert.equal(
      (response.result as {serverInfo?: {name?: string}} | undefined)?.serverInfo?.name,
      'play-agent',
    );
  } finally {
    await rm(temporaryHome, {recursive: true, force: true});
  }
});

test('plugin launcher rejects an explicit Node below the supported version', async () => {
  const temporaryDirectory = await mkdtemp(path.join(os.tmpdir(), 'play-agent-old-node-'));
  const oldNode = path.join(temporaryDirectory, 'node');
  await writeFile(oldNode, '#!/bin/sh\n[ "$1" = "--version" ] && printf "v18.20.0\\n"\n', 'utf8');
  await chmod(oldNode, 0o755);

  const child = spawn(launcher, [], {
    cwd: pluginRoot,
    env: {
      HOME: temporaryDirectory,
      PATH: '/usr/bin:/bin',
      PLAY_AGENT_NODE: oldNode,
    },
    stdio: ['ignore', 'ignore', 'pipe'],
  });
  let stderr = '';
  child.stderr.setEncoding('utf8');
  child.stderr.on('data', (chunk) => {
    stderr += chunk;
  });

  try {
    const exitCode = await new Promise<number | null>((resolve, reject) => {
      child.once('exit', resolve);
      child.once('error', reject);
    });
    assert.equal(exitCode, 1);
    assert.match(stderr, /Node\.js 20\+/);
  } finally {
    await rm(temporaryDirectory, {recursive: true, force: true});
  }
});
