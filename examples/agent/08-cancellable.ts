// ─────────────────────────────────────────────────────────────────────────────
// #8 · Cancellable tools — AbortSignal propagates end-to-end
// ─────────────────────────────────────────────────────────────────────────────

import {
  AnthropicProvider,
  cancellable,
  createAgent,
  defineTool,
} from 'tekivex-ui/agent';

const fetchUrl = cancellable(defineTool<{ url: string }, string>({
  name: 'fetch_url',
  description: 'Fetches a URL and returns the body.',
  inputSchema: {
    type: 'object',
    properties: { url: { type: 'string' } },
    required: ['url'],
  },
  async execute({ url }, ctx) {
    const res = await fetch(url, { signal: ctx.signal });
    return await res.text();
  },
}));

const agent = createAgent({
  provider: new AnthropicProvider({ endpoint: '/api/anthropic' }),
  model: 'claude-opus-4-7',
  tools: [fetchUrl],
});

async function main() {
  const controller = new AbortController();
  setTimeout(() => controller.abort(), 3_000);

  try {
    for await (const evt of agent.run({
      message: 'Fetch https://slow.example/data and summarize.',
      signal: controller.signal,
    })) {
      if (evt.type === 'text_delta') process.stdout.write(evt.text);
    }
  } catch (e) {
    console.log('\naborted cleanly:', (e as Error).message);
  }
}

main();
