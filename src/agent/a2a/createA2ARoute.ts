// ══════════════════════════════════════════════════════════════════════════════
// createA2ARoute (#17) — Server side. Expose an Agent as an A2A endpoint.
// ══════════════════════════════════════════════════════════════════════════════

import { Agent, type AgentOptions } from '../core/Agent';
import { InMemoryStore } from '../core/Memory';
import type { A2ATaskRequest, A2ATaskResponse } from './A2AClient';

export interface CreateA2ARouteOptions {
  agent: (req: Request) => AgentOptions | Promise<AgentOptions>;
}

export function createA2ARoute(opts: CreateA2ARouteOptions) {
  return async (req: Request): Promise<Response> => {
    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }
    let task: A2ATaskRequest;
    try {
      task = (await req.json()) as A2ATaskRequest;
    } catch {
      return new Response('Invalid JSON', { status: 400 });
    }
    const userText =
      task.message?.parts
        ?.filter((p) => p.type === 'text')
        .map((p) => p.text)
        .join('') ?? '';
    if (!userText) {
      return new Response('Empty task', { status: 400 });
    }

    const agentOpts = await opts.agent(req);
    const agent = new Agent({ ...agentOpts, memory: agentOpts.memory ?? new InMemoryStore() });
    let buffer = '';
    try {
      for await (const evt of agent.run({ message: userText })) {
        if (evt.type === 'text_delta') buffer += evt.text;
      }
      const res: A2ATaskResponse = {
        id: task.id,
        status: 'completed',
        messages: [{ role: 'agent', parts: [{ type: 'text', text: buffer }] }],
      };
      return new Response(JSON.stringify(res), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    } catch (e) {
      const res: A2ATaskResponse = {
        id: task.id,
        status: 'failed',
        messages: [
          {
            role: 'agent',
            parts: [{ type: 'text', text: e instanceof Error ? e.message : String(e) }],
          },
        ],
      };
      return new Response(JSON.stringify(res), {
        status: 500,
        headers: { 'content-type': 'application/json' },
      });
    }
  };
}
