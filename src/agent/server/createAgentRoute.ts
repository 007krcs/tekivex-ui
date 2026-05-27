// ══════════════════════════════════════════════════════════════════════════════
// SERVER ROUTE (#14) — fetch-style handler for Next.js / Hono / Bun / Workers / Deno.
// Streams agent events as SSE. Keeps API keys server-side.
// ══════════════════════════════════════════════════════════════════════════════

import { Agent, type AgentOptions } from '../core/Agent';
import { InMemoryStore } from '../core/Memory';

export interface CreateAgentRouteOptions {
  agent: (req: Request) => AgentOptions | Promise<AgentOptions>;
  parseInput?(req: Request, body: unknown): { message: string } | Promise<{ message: string }>;
}

export function createAgentRoute(opts: CreateAgentRouteOptions) {
  return async (req: Request): Promise<Response> => {
    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return new Response('Invalid JSON', { status: 400 });
    }
    const parsed = opts.parseInput
      ? await opts.parseInput(req, body)
      : (body as { message?: string });
    const message = (parsed as { message?: string }).message;
    if (typeof message !== 'string' || !message.trim()) {
      return new Response('Missing message', { status: 400 });
    }

    const agentOpts = await opts.agent(req);
    const agent = new Agent({ ...agentOpts, memory: agentOpts.memory ?? new InMemoryStore() });
    const encoder = new TextEncoder();

    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        function send(obj: unknown): void {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));
        }
        try {
          for await (const evt of agent.run({ message })) {
            send(serializeEvent(evt));
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        } catch (err) {
          send({
            type: 'error',
            error: { message: err instanceof Error ? err.message : String(err) },
          });
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      status: 200,
      headers: {
        'content-type': 'text/event-stream',
        'cache-control': 'no-cache, no-transform',
        connection: 'keep-alive',
      },
    });
  };
}

function serializeEvent(evt: unknown): unknown {
  if (evt && typeof evt === 'object' && 'error' in evt && (evt as { error: unknown }).error instanceof Error) {
    const e = evt as { error: Error };
    return { ...evt, error: { message: e.error.message, name: e.error.name } };
  }
  return evt;
}
