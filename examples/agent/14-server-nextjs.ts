// ─────────────────────────────────────────────────────────────────────────────
// #14 · Server runtime — Next.js route + browser client
// File: app/api/agent/route.ts
// ─────────────────────────────────────────────────────────────────────────────

import {
  AnthropicProvider,
  createAgentRoute,
} from 'tekivex-ui/agent';

export const runtime = 'edge';

export const POST = createAgentRoute({
  agent: async (req) => ({
    provider: new AnthropicProvider({
      apiKey: process.env.ANTHROPIC_API_KEY!,
    }),
    model: 'claude-opus-4-7',
    system: 'You are a helpful assistant for our customers.',
  }),
});

// ─── Browser side ────────────────────────────────────────────────────────────
//
//   import { createAgentClient } from 'tekivex-ui/agent';
//
//   const client = createAgentClient({ endpoint: '/api/agent' });
//   for await (const evt of client.run('Hello')) {
//     if (evt.type === 'text_delta') append(evt.text);
//   }
//
// The same handler works on Hono, Bun, Cloudflare Workers, Deno Deploy.
