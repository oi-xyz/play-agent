import {readFile} from 'node:fs/promises';
import {parseEvaluationJsonl, scoreEvaluation} from '../src/evaluation';

const inputPath = process.argv[2];
if (!inputPath) {
  throw new Error('Usage: npm run evaluate -- <trials.jsonl|->');
}

async function readInput() {
  if (inputPath !== '-') return readFile(inputPath, 'utf8');

  let content = '';
  process.stdin.setEncoding('utf8');
  for await (const chunk of process.stdin) content += chunk;
  return content;
}

const trials = parseEvaluationJsonl(await readInput());
process.stdout.write(`${JSON.stringify(scoreEvaluation(trials), null, 2)}\n`);
