// ══════════════════════════════════════════════════════════════════════════════
// OBSERVABILITY MIDDLEWARE (#9)
// Vendor-neutral span/event sink. Wire to OpenTelemetry, Datadog, Honeycomb.
// ══════════════════════════════════════════════════════════════════════════════

import type { AgentEvent } from '../core/events';
import type { Middleware } from '../core/Middleware';

export interface OTelSpan {
  end(attrs?: Record<string, unknown>): void;
}

export interface OTelSink {
  spanStart(name: string, attrs?: Record<string, unknown>): OTelSpan;
  event(name: string, attrs?: Record<string, unknown>): void;
}

export interface OTelMiddlewareOptions {
  sink: OTelSink;
  serviceName?: string;
}

export function otelMiddleware(opts: OTelMiddlewareOptions): Middleware {
  let stepSpan: OTelSpan | null = null;
  const toolSpans = new Map<string, OTelSpan>();

  return {
    name: 'otel',
    beforeRequest(req) {
      opts.sink.event('agent.http.request', {
        url: req.url,
        method: req.method,
        service: opts.serviceName,
      });
      return req;
    },
    afterResponse(res, req) {
      opts.sink.event('agent.http.response', { url: req.url, status: res.status });
      return res;
    },
    onEvent(evt: AgentEvent) {
      if (evt.type === 'step_start') {
        stepSpan?.end();
        stepSpan = opts.sink.spanStart('agent.step', { step: evt.step });
      } else if (evt.type === 'tool_call_start') {
        toolSpans.set(evt.id, opts.sink.spanStart('agent.tool', { name: evt.name, id: evt.id }));
      } else if (evt.type === 'tool_result') {
        toolSpans.get(evt.id)?.end({ ok: true });
        toolSpans.delete(evt.id);
      } else if (evt.type === 'tool_error') {
        toolSpans.get(evt.id)?.end({ ok: false, error: evt.error.message });
        toolSpans.delete(evt.id);
      } else if (evt.type === 'message_stop') {
        opts.sink.event('agent.message_stop', {
          reason: evt.reason,
          inputTokens: evt.usage?.inputTokens,
          outputTokens: evt.usage?.outputTokens,
        });
      } else if (evt.type === 'done') {
        stepSpan?.end({ reason: evt.reason });
        stepSpan = null;
      }
    },
    onError(error) {
      opts.sink.event('agent.error', { message: error.message });
      stepSpan?.end({ error: true });
      stepSpan = null;
    },
  };
}
