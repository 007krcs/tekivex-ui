// ══════════════════════════════════════════════════════════════════════════════
// a2aTool (#17) — Expose a remote A2A agent as a callable Tool.
// ══════════════════════════════════════════════════════════════════════════════

import { defineTool, type Tool } from '../core/Tool';
import { A2AClient } from './A2AClient';

export interface A2AToolOptions {
  name: string;
  description: string;
  client: A2AClient;
  inputDescription?: string;
}

export function a2aTool(opts: A2AToolOptions): Tool<{ input: string }, string> {
  return defineTool<{ input: string }, string>({
    name: opts.name,
    description: opts.description,
    inputSchema: {
      type: 'object',
      properties: {
        input: {
          type: 'string',
          description: opts.inputDescription ?? 'Task for the remote agent.',
        },
      },
      required: ['input'],
    },
    async execute({ input }, ctx) {
      const res = await opts.client.sendTask(
        {
          id: A2AClient.newTaskId(),
          message: { role: 'user', parts: [{ type: 'text', text: input }] },
        },
        ctx.signal,
      );
      const agentMsgs = res.messages.filter((m) => m.role === 'agent');
      const text = agentMsgs.flatMap((m) => m.parts.map((p) => p.text)).join('');
      if (res.status === 'failed') return `Remote agent failed: ${text || '(no detail)'}`;
      return text || '(no response)';
    },
  });
}
