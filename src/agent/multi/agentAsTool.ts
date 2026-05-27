// ══════════════════════════════════════════════════════════════════════════════
// agentAsTool — Expose an Agent as a Tool so other agents can delegate to it.
// Sub-agent's full run accumulates into a single text response.
// Composition pattern: one orchestrator agent + N specialist sub-agents.
// ══════════════════════════════════════════════════════════════════════════════

import type { Agent } from '../core/Agent';
import { defineTool, type Tool } from '../core/Tool';

export interface AgentAsToolOptions {
  name: string;
  description: string;
  agent: Agent;
  inputDescription?: string;
}

export function agentAsTool(
  opts: AgentAsToolOptions,
): Tool<{ input: string }, string> {
  return defineTool<{ input: string }, string>({
    name: opts.name,
    description: opts.description,
    inputSchema: {
      type: 'object',
      properties: {
        input: {
          type: 'string',
          description: opts.inputDescription ?? 'Task or question for this sub-agent.',
        },
      },
      required: ['input'],
    },
    async execute({ input }, ctx) {
      let answer = '';
      for await (const evt of opts.agent.run({ message: input, signal: ctx.signal })) {
        if (evt.type === 'text_delta') answer += evt.text;
      }
      return answer || '(sub-agent produced no output)';
    },
  });
}
