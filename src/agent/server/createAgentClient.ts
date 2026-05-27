// ══════════════════════════════════════════════════════════════════════════════
// AGENT CLIENT (#14) — Consume an SSE agent route from the browser.
// ══════════════════════════════════════════════════════════════════════════════

import type { AgentEvent } from '../core/events';
import { parseSSE } from '../core/sse';
import { fetchTransport, type Transport } from '../core/Transport';

export interface AgentClientOptions {
  endpoint: string;
  transport?: Transport;
  headers?: Record<string, string>;
}

export interface AgentClient {
  run(message: string, signal?: AbortSignal): AsyncIterable<AgentEvent>;
}

export function createAgentClient(opts: AgentClientOptions): AgentClient {
  const transport = opts.transport ?? fetchTransport;
  return {
    async *run(message: string, signal?: AbortSignal): AsyncGenerator<AgentEvent> {
      const res = await transport.request({
        url: opts.endpoint,
        method: 'POST',
        headers: { 'content-type': 'application/json', ...opts.headers },
        body: JSON.stringify({ message }),
        signal,
      });
      if (!res.body) return;
      if (res.status >= 400) {
        const text = await res.text();
        throw new Error(`Agent route ${res.status}: ${text}`);
      }
      for await (const msg of parseSSE(res.body)) {
        if (msg.data === '[DONE]') return;
        let evt: AgentEvent;
        try {
          const parsed = JSON.parse(msg.data) as Record<string, unknown>;
          if (parsed.error && typeof (parsed.error as { message?: string }).message === 'string') {
            parsed.error = new Error((parsed.error as { message: string }).message);
          }
          evt = parsed as unknown as AgentEvent;
        } catch {
          continue;
        }
        yield evt;
      }
    },
  };
}
