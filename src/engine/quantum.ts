// ── Quantum Render Engine ────────────────────────────────────────────────────
// FNV-1a hashing, LRU memoization, priority render queues, microtask batching

// ── FNV-1a Hash ─────────────────────────────────────────────────────────────

const FNV_OFFSET = 2166136261;
const FNV_PRIME = 16777619;

export function fnv1aHash(input: string): string {
  let hash = FNV_OFFSET;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = (Math.imul(hash, FNV_PRIME)) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

// ── LRU Cache ────────────────────────────────────────────────────────────────

export class LRUCache<K, V> {
  private cache = new Map<K, V>();
  private hits = 0;
  private misses = 0;
  readonly ceiling: number;

  constructor(ceiling = 512) {
    this.ceiling = Math.min(ceiling, 512);
  }

  get(key: K): V | undefined {
    if (!this.cache.has(key)) {
      this.misses++;
      return undefined;
    }
    this.hits++;
    const value = this.cache.get(key)!;
    // Move to end (most-recently-used)
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.ceiling) {
      // Evict least-recently-used (first in insertion order)
      this.cache.delete(this.cache.keys().next().value!);
    }
    this.cache.set(key, value);
  }

  has(key: K): boolean {
    return this.cache.has(key);
  }

  invalidate(key?: K): void {
    if (key !== undefined) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  get size(): number {
    return this.cache.size;
  }

  get cacheHitRate(): number {
    const total = this.hits + this.misses;
    return total === 0 ? 0 : (this.hits / total) * 100;
  }
}

// ── Memoization via global LRU cache ────────────────────────────────────────

const globalCache = new LRUCache<string, unknown>(512);

export function memoize<T>(key: string, fn: () => T): T {
  const cached = globalCache.get(key);
  if (cached !== undefined) return cached as T;
  const result = fn();
  globalCache.set(key, result);
  return result;
}

// ── Priority Render Queue ────────────────────────────────────────────────────

export type Priority = 'critical' | 'normal' | 'low';

const PRIORITY_WEIGHTS: Record<Priority, number> = {
  critical: 3,
  normal: 2,
  low: 1,
};

interface QueueEntry {
  id: string;
  priority: Priority;
  task: () => void;
  weight: number;
}

export class RenderQueue {
  private queue: QueueEntry[] = [];

  enqueue(id: string, task: () => void, priority: Priority = 'normal'): void {
    this.queue.push({ id, task, priority, weight: PRIORITY_WEIGHTS[priority] });
  }

  flush(): void {
    this.queue.sort((a, b) => b.weight - a.weight);
    for (const entry of this.queue) {
      try {
        entry.task();
      } catch {
        // Swallow per-task errors so the queue continues
      }
    }
    this.queue = [];
  }

  get depth(): number {
    return this.queue.length;
  }
}

// ── Microtask Batch Updates ──────────────────────────────────────────────────

interface RenderMetric {
  duration: number;
  timestamp: number;
}

const pendingBatch: Array<() => void> = [];
let scheduledFlush = false;
const renderMetrics: RenderMetric[] = [];
let totalRenderTime = 0;
let renderCount = 0;

function flushBatch(): void {
  const tasks = pendingBatch.splice(0);
  const start = performance.now();
  for (const task of tasks) {
    try {
      task();
    } catch {
      // Continue queue on error
    }
  }
  const duration = performance.now() - start;
  totalRenderTime += duration;
  renderCount++;
  renderMetrics.push({ duration, timestamp: Date.now() });
  if (renderMetrics.length > 100) renderMetrics.shift();
}

export function batchUpdate(fn: () => void): void {
  pendingBatch.push(fn);
  if (!scheduledFlush) {
    scheduledFlush = true;
    queueMicrotask(() => {
      flushBatch();
      scheduledFlush = false;
    });
  }
}

// ── Profiling API ────────────────────────────────────────────────────────────

export interface Metrics {
  avgRenderTime: number;
  cacheHitRate: number;
  renderCount: number;
}

export function getMetrics(n?: number): Metrics & { recent: RenderMetric[] } {
  const recent = n !== undefined ? renderMetrics.slice(-n) : renderMetrics.slice();
  return {
    avgRenderTime: renderCount === 0 ? 0 : totalRenderTime / renderCount,
    cacheHitRate: globalCache.cacheHitRate,
    renderCount,
    recent,
  };
}

export function invalidateCache(key?: string): void {
  if (key !== undefined) {
    globalCache.invalidate(key);
  } else {
    globalCache.invalidate();
  }
}

export const Quantum = {
  hash: fnv1aHash,
  memoize,
  batchUpdate,
  invalidate: invalidateCache,
  get avgRenderTime() {
    return renderCount === 0 ? 0 : totalRenderTime / renderCount;
  },
  get cacheHitRate() {
    return globalCache.cacheHitRate;
  },
  getMetrics,
};
