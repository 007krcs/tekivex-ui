// ─────────────────────────────────────────────────────────────────────────────
// #2 · Retry / backoff middleware
// ─────────────────────────────────────────────────────────────────────────────

import {
  AnthropicProvider,
  createAgent,
  fetchTransport,
  withRetry,
} from 'tekivex-ui/agent';

const transport = withRetry(fetchTransport, {
  maxRetries: 4,
  initialDelayMs: 250,
  maxDelayMs: 10_000,
  factor: 2,
  jitter: true,
  // Retry on 429, 5xx, AND transient connection errors.
  retryOn: (res) => res.status === 429 || (res.status >= 500 && res.status < 600),
  retryOnError: (err) => !(err instanceof DOMException && err.name === 'AbortError'),
});

const agent = createAgent({
  provider: new AnthropicProvider({ endpoint: '/api/anthropic', transport }),
  model: 'claude-opus-4-7',
});

export { agent };
