// ══════════════════════════════════════════════════════════════════════════════
// RETRY / BACKOFF MIDDLEWARE (#2)
// Wraps a Transport with exponential backoff + jitter on 429/5xx.
// ══════════════════════════════════════════════════════════════════════════════

import type { Transport, TransportRequest, TransportResponse } from '../core/Transport';

export interface RetryOptions {
  maxRetries?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  factor?: number;
  jitter?: boolean;
  retryOn?(res: TransportResponse): boolean;
  retryOnError?(err: unknown): boolean;
}

export function withRetry(base: Transport, opts: RetryOptions = {}): Transport {
  const maxRetries = opts.maxRetries ?? 3;
  const initial = opts.initialDelayMs ?? 500;
  const max = opts.maxDelayMs ?? 30_000;
  const factor = opts.factor ?? 2;
  const jitter = opts.jitter ?? true;
  const retryOn =
    opts.retryOn ?? ((res) => res.status === 429 || (res.status >= 500 && res.status < 600));
  const retryOnError = opts.retryOnError ?? (() => true);

  return {
    async request(req: TransportRequest): Promise<TransportResponse> {
      let attempt = 0;
      let lastError: unknown;
      while (attempt <= maxRetries) {
        try {
          const res = await base.request(req);
          if (attempt < maxRetries && retryOn(res)) {
            await sleep(delayFor(attempt, initial, max, factor, jitter), req.signal);
            attempt++;
            continue;
          }
          return res;
        } catch (err) {
          lastError = err;
          if (req.signal?.aborted) throw err;
          if (attempt >= maxRetries || !retryOnError(err)) throw err;
          await sleep(delayFor(attempt, initial, max, factor, jitter), req.signal);
          attempt++;
        }
      }
      throw lastError ?? new Error('retry: exhausted');
    },
  };
}

function delayFor(
  attempt: number,
  initial: number,
  max: number,
  factor: number,
  jitter: boolean,
): number {
  const base = Math.min(initial * Math.pow(factor, attempt), max);
  return jitter ? Math.random() * base : base;
}

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new Error('aborted'));
      return;
    }
    const t = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, ms);
    const onAbort = () => {
      clearTimeout(t);
      reject(new Error('aborted'));
    };
    signal?.addEventListener('abort', onAbort, { once: true });
  });
}
