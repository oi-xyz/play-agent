import readline from 'node:readline';
import {handleMcpRequest} from './mcpProtocol';

function writeMessage(message: unknown) {
  process.stdout.write(`${JSON.stringify(message)}\n`);
}

const lines = readline.createInterface({
  input: process.stdin,
  crlfDelay: Infinity,
});

lines.on('line', (line) => {
  if (line.trim().length === 0) {
    return;
  }

  void (async () => {
    const request = JSON.parse(line);
    const response = await handleMcpRequest(request);
    if (response) {
      writeMessage(response);
    }
  })().catch((error: unknown) => {
    writeMessage({
      jsonrpc: '2.0',
      id: null,
      error: {
        code: -32700,
        message: error instanceof Error ? error.message : 'Failed to parse MCP JSON-RPC line.',
      },
    });
  });
});
