// ─────────────────────────────────────────────────────────────────────────────
// #17 · A2A — call a remote agent + expose one for others to call
// ─────────────────────────────────────────────────────────────────────────────

import {
  A2AClient,
  AnthropicProvider,
  a2aTool,
  createA2ARoute,
  createAgent,
} from 'tekivex-ui/agent';

// ── Consume a remote A2A agent as a tool ────────────────────────────────────
const partner = new A2AClient({
  endpoint: 'https://partner.example/agent',
  headers: { authorization: `Bearer ${process.env.PARTNER_TOKEN}` },
});

const myAgent = createAgent({
  provider: new AnthropicProvider({ endpoint: '/api/anthropic' }),
  model: 'claude-opus-4-7',
  tools: [
    a2aTool({
      name: 'inventory_check',
      description: 'Ask partner-co whether a SKU is in stock.',
      client: partner,
    }),
  ],
});

// ── Expose YOUR agent as an A2A endpoint ────────────────────────────────────
// file: app/api/a2a/route.ts
export const POST = createA2ARoute({
  agent: async () => ({
    provider: new AnthropicProvider({ apiKey: process.env.ANTHROPIC_API_KEY! }),
    model: 'claude-opus-4-7',
    system: 'You answer questions about our product catalog.',
  }),
});

export { myAgent };
