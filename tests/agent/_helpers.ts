import type { ChatOptions, Provider, StreamEvent } from '../../src/agent/core/Provider';

export function scriptedProvider(scripts: StreamEvent[][]): Provider {
  let i = 0;
  return {
    name: 'scripted',
    async *stream(_opts: ChatOptions): AsyncGenerator<StreamEvent> {
      const script = scripts[i++] ?? [];
      for (const evt of script) yield evt;
    },
  };
}

export function delta(text: string): StreamEvent {
  return { type: 'text_delta', text };
}

export function stop(
  reason: 'end_turn' | 'tool_use' | 'max_tokens' | 'stop_sequence' = 'end_turn',
): StreamEvent {
  return { type: 'message_stop', reason };
}

export function toolCall(id: string, name: string, input: unknown): StreamEvent[] {
  return [
    { type: 'tool_call_start', id, name },
    { type: 'tool_call_delta', id, argsDelta: JSON.stringify(input) },
    { type: 'tool_call_end', id, input },
  ];
}
