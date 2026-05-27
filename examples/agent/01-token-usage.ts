// ─────────────────────────────────────────────────────────────────────────────
// #1 · Token usage + cost tracking
// ─────────────────────────────────────────────────────────────────────────────

import {
  AnthropicProvider,
  createAgent,
  createTokenUsageTracker,
} from 'tekivex-ui/agent';

async function main() {
  const tracker = createTokenUsageTracker({
    model: 'claude-opus-4-7',
    pricing: {
      'claude-opus-4-7': { inputPerMillion: 15, outputPerMillion: 75 },
      'claude-haiku-4-5-20251001': { inputPerMillion: 1, outputPerMillion: 5 },
    },
    onUpdate: (t) => console.log(`running cost: $${t.totalCostUSD.toFixed(4)}`),
  });

  const agent = createAgent({
    provider: new AnthropicProvider({ endpoint: '/api/anthropic' }),
    model: 'claude-opus-4-7',
    middleware: [tracker.middleware],
  });

  for await (const evt of agent.run({ message: 'Write 3 haikus about TypeScript.' })) {
    if (evt.type === 'text_delta') process.stdout.write(evt.text);
  }

  console.log('\nfinal totals:', tracker.totals());
}

main();
