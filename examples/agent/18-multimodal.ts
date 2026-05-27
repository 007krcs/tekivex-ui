// ─────────────────────────────────────────────────────────────────────────────
// #18 · Multimodal content helpers — text + image + cached blocks
// ─────────────────────────────────────────────────────────────────────────────

import {
  AnthropicProvider,
  Agent,
  cacheable,
  imageBlock,
  textBlock,
  InMemoryStore,
} from 'tekivex-ui/agent';

const memory = new InMemoryStore();
memory.append({
  role: 'user',
  content: [
    textBlock('Describe the differences between these two diagrams.'),
    imageBlock({ url: 'https://example.com/diagram-a.png' }),
    imageBlock({ url: 'https://example.com/diagram-b.png' }),
    cacheable('Background context for these diagrams: ...long text...'),
  ],
});

const agent = new Agent({
  provider: new AnthropicProvider({ endpoint: '/api/anthropic' }),
  model: 'claude-opus-4-7',
  memory,
});

for await (const evt of agent.run({ message: 'Now compare them.' })) {
  if (evt.type === 'text_delta') process.stdout.write(evt.text);
}
