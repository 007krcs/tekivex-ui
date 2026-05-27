// ─────────────────────────────────────────────────────────────────────────────
// #7 · Eval framework — golden test cases + LLM-as-judge
// ─────────────────────────────────────────────────────────────────────────────

import {
  AnthropicProvider,
  createAgent,
  judgeWithLLM,
  runEval,
} from 'tekivex-ui/agent';

const provider = new AnthropicProvider({ endpoint: '/api/anthropic' });
const agent = createAgent({ provider, model: 'claude-opus-4-7' });

const cases = [
  { name: 'capital', input: 'Capital of France?', expected: 'Paris' },
  { name: 'math',    input: 'What is 17 * 19?',    expected: '323' },
  {
    name: 'tone-child',
    input: 'Explain quantum entanglement to a 10-year-old.',
    judge: judgeWithLLM(
      provider,
      'claude-haiku-4-5-20251001',
      'Answer must be accurate AND understandable by a 10-year-old (no jargon).',
    ),
  },
];

async function main() {
  const summary = await runEval(agent, cases, {
    onProgress: (d, t) => console.log(`  ${d}/${t}`),
  });
  console.log(`\n${summary.passed}/${summary.total} passed (${(summary.passRate * 100).toFixed(0)}%)`);
  for (const r of summary.results) {
    console.log(`  ${r.passed ? '✓' : '✗'} ${r.name} (${r.durationMs}ms)`);
    if (!r.passed) console.log(`     output: ${r.output.slice(0, 100)}...`);
  }
}

main();
