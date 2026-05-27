// ══════════════════════════════════════════════════════════════════════════════
// MIDDLEWARE — Cross-cutting hooks: auth, redaction, logging, retry, metrics.
// HTTP hooks (beforeRequest/afterResponse) are applied via `applyMiddleware()`.
// Event/error hooks (onEvent/onError) are applied by the Agent loop.
// ══════════════════════════════════════════════════════════════════════════════

import type { AgentEvent } from './events';
import type { Transport, TransportRequest, TransportResponse } from './Transport';

export interface Middleware {
  name?: string;
  beforeRequest?(req: TransportRequest): TransportRequest | Promise<TransportRequest>;
  afterResponse?(
    res: TransportResponse,
    req: TransportRequest,
  ): TransportResponse | Promise<TransportResponse>;
  onEvent?(event: AgentEvent): void | Promise<void>;
  onError?(error: Error): void | Promise<void>;
}

export function applyMiddleware(
  transport: Transport,
  middleware: Middleware[],
): Transport {
  if (middleware.length === 0) return transport;
  return {
    async request(req) {
      let current = req;
      for (const m of middleware) {
        if (m.beforeRequest) current = await m.beforeRequest(current);
      }
      let res = await transport.request(current);
      for (const m of middleware) {
        if (m.afterResponse) res = await m.afterResponse(res, current);
      }
      return res;
    },
  };
}
