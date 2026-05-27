import { describe, expect, it } from 'vitest';
import { withRetry } from '../../src/agent/middleware/retry';
import type { Transport, TransportResponse } from '../../src/agent/core/Transport';

function mockResponse(status: number): TransportResponse {
  return {
    status,
    headers: {},
    body: null,
    json: async () => ({}),
    text: async () => `status ${status}`,
  };
}

describe('withRetry', () => {
  it('returns immediately on 2xx', async () => {
    let calls = 0;
    const t: Transport = {
      async request() {
        calls++;
        return mockResponse(200);
      },
    };
    const wrapped = withRetry(t, { maxRetries: 3, initialDelayMs: 1, jitter: false });
    const res = await wrapped.request({ url: 'x', method: 'GET' });
    expect(res.status).toBe(200);
    expect(calls).toBe(1);
  });

  it('retries on 429 until success', async () => {
    let calls = 0;
    const t: Transport = {
      async request() {
        calls++;
        return calls < 3 ? mockResponse(429) : mockResponse(200);
      },
    };
    const wrapped = withRetry(t, { maxRetries: 3, initialDelayMs: 1, jitter: false });
    const res = await wrapped.request({ url: 'x', method: 'GET' });
    expect(res.status).toBe(200);
    expect(calls).toBe(3);
  });

  it('retries on 5xx', async () => {
    let calls = 0;
    const t: Transport = {
      async request() {
        calls++;
        return calls < 2 ? mockResponse(503) : mockResponse(200);
      },
    };
    const wrapped = withRetry(t, { maxRetries: 2, initialDelayMs: 1, jitter: false });
    await wrapped.request({ url: 'x', method: 'GET' });
    expect(calls).toBe(2);
  });

  it('gives up after maxRetries', async () => {
    let calls = 0;
    const t: Transport = {
      async request() {
        calls++;
        return mockResponse(500);
      },
    };
    const wrapped = withRetry(t, { maxRetries: 2, initialDelayMs: 1, jitter: false });
    const res = await wrapped.request({ url: 'x', method: 'GET' });
    expect(res.status).toBe(500);
    expect(calls).toBe(3);
  });

  it('retries on thrown errors', async () => {
    let calls = 0;
    const t: Transport = {
      async request() {
        calls++;
        if (calls < 2) throw new Error('network');
        return mockResponse(200);
      },
    };
    const wrapped = withRetry(t, { maxRetries: 2, initialDelayMs: 1, jitter: false });
    const res = await wrapped.request({ url: 'x', method: 'GET' });
    expect(res.status).toBe(200);
    expect(calls).toBe(2);
  });
});
