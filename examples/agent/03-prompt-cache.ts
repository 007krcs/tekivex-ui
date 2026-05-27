// ─────────────────────────────────────────────────────────────────────────────
// #3 · Anthropic prompt cache via `cacheable()` content block
// ─────────────────────────────────────────────────────────────────────────────

import {
  Agent,
  AnthropicProvider,
  cacheable,
  textBlock,
  InMemoryStore,
} from 'tekivex-ui/agent';

const longDocument = '...100k tokens of context...';

const memory = new InMemoryStore();
// Seed memory with a user message that includes a cached block.
memory.append({
  role: 'user',
  content: [
    cacheable(longDocument), // marked cache_control: ephemeral
    textBlock('Now answer questions about this document.'),
  ],
});

const agent = new Agent({
  provider: new AnthropicProvider({ endpoint: '/api/anthropic' }),
  model: 'claude-opus-4-7',
  memory,
});

// Subsequent runs hit the cache, dropping input cost dramatically.
for await (const evt of agent.run({ message: 'Summarize section 3.' })) {
  if (evt.type === 'text_delta') process.stdout.write(evt.text);
}
