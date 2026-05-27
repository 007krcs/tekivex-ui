// ─────────────────────────────────────────────────────────────────────────────
// #4 · Structured output — typed JSON guaranteed
// ─────────────────────────────────────────────────────────────────────────────

import { AnthropicProvider, generateObject } from 'tekivex-ui/agent';

interface TripPlan {
  city: string;
  days: number;
  itinerary: Array<{ day: number; activities: string[] }>;
}

const provider = new AnthropicProvider({ endpoint: '/api/anthropic' });

async function main() {
  const plan = await generateObject<TripPlan>({
    provider,
    model: 'claude-opus-4-7',
    prompt: 'Plan a 3-day trip to Tokyo focused on food and architecture.',
    schema: {
      type: 'object',
      properties: {
        city: { type: 'string' },
        days: { type: 'integer', minimum: 1 },
        itinerary: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              day: { type: 'integer' },
              activities: { type: 'array', items: { type: 'string' } },
            },
            required: ['day', 'activities'],
          },
        },
      },
      required: ['city', 'days', 'itinerary'],
    },
    // Optional: bring a Zod parser
    // parse: (raw) => MySchema.parse(raw),
    maxRetries: 2,
  });

  console.log(plan.itinerary[0].activities);
}

main();
