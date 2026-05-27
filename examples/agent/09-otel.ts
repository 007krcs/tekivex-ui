// ─────────────────────────────────────────────────────────────────────────────
// #9 · OpenTelemetry — wire spans + events into your existing tracer
// ─────────────────────────────────────────────────────────────────────────────

import { trace } from '@opentelemetry/api';
import {
  AnthropicProvider,
  createAgent,
  otelMiddleware,
} from 'tekivex-ui/agent';

const tracer = trace.getTracer('tekivex-agent');

const otel = otelMiddleware({
  serviceName: 'my-app',
  sink: {
    spanStart(name, attrs) {
      const span = tracer.startSpan(name, { attributes: attrs as Record<string, string | number | boolean> });
      return {
        end(extra) {
          if (extra) span.setAttributes(extra as Record<string, string | number | boolean>);
          span.end();
        },
      };
    },
    event(name, attrs) {
      trace.getActiveSpan()?.addEvent(name, attrs as Record<string, string | number | boolean>);
    },
  },
});

export const agent = createAgent({
  provider: new AnthropicProvider({ endpoint: '/api/anthropic' }),
  model: 'claude-opus-4-7',
  middleware: [otel],
});
