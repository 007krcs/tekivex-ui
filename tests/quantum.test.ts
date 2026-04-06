import { describe, it, expect, vi } from 'vitest';
import { fnv1aHash, LRUCache, RenderQueue, batchUpdate, getMetrics } from '../src/engine/quantum';

describe('fnv1aHash', () => {
  it('returns an 8-character hex string', () => {
    expect(fnv1aHash('hello')).toMatch(/^[0-9a-f]{8}$/);
  });

  it('is deterministic', () => {
    expect(fnv1aHash('tekivex')).toBe(fnv1aHash('tekivex'));
  });

  it('empty string returns offset basis in hex', () => {
    // FNV-1a offset basis 2166136261 = 0x811c9dc5
    expect(fnv1aHash('')).toBe('811c9dc5');
  });

  it('different inputs produce different hashes', () => {
    expect(fnv1aHash('foo')).not.toBe(fnv1aHash('bar'));
  });
});

describe('LRUCache', () => {
  it('stores and retrieves values', () => {
    const cache = new LRUCache<string, number>(10);
    cache.set('a', 1);
    expect(cache.get('a')).toBe(1);
  });

  it('returns undefined for missing keys', () => {
    const cache = new LRUCache<string, number>(10);
    expect(cache.get('missing')).toBeUndefined();
  });

  it('evicts LRU entry when ceiling is exceeded', () => {
    const cache = new LRUCache<string, number>(3);
    cache.set('a', 1);
    cache.set('b', 2);
    cache.set('c', 3);
    cache.set('d', 4); // 'a' should be evicted
    expect(cache.get('a')).toBeUndefined();
    expect(cache.get('b')).toBe(2);
    expect(cache.get('d')).toBe(4);
  });

  it('updates LRU order on get (moves to end)', () => {
    const cache = new LRUCache<string, number>(3);
    cache.set('a', 1);
    cache.set('b', 2);
    cache.set('c', 3);
    // Access 'a' to make it recently used
    cache.get('a');
    cache.set('d', 4); // 'b' should now be evicted (oldest unused)
    expect(cache.get('a')).toBe(1);
    expect(cache.get('b')).toBeUndefined();
  });

  it('invalidates a specific key', () => {
    const cache = new LRUCache<string, number>(10);
    cache.set('x', 99);
    cache.invalidate('x');
    expect(cache.get('x')).toBeUndefined();
  });

  it('invalidates all keys when called without argument', () => {
    const cache = new LRUCache<string, number>(10);
    cache.set('a', 1);
    cache.set('b', 2);
    cache.invalidate();
    expect(cache.size).toBe(0);
  });

  it('tracks cache hit rate', () => {
    const cache = new LRUCache<string, number>(10);
    cache.set('a', 1);
    cache.get('a'); // hit
    cache.get('missing'); // miss
    expect(cache.cacheHitRate).toBe(50);
  });

  it('caps ceiling at 512', () => {
    const cache = new LRUCache<string, number>(9999);
    expect(cache.ceiling).toBe(512);
  });
});

describe('RenderQueue', () => {
  it('flushes tasks in priority order (critical first)', () => {
    const order: string[] = [];
    const queue = new RenderQueue();
    queue.enqueue('low', () => order.push('low'), 'low');
    queue.enqueue('critical', () => order.push('critical'), 'critical');
    queue.enqueue('normal', () => order.push('normal'), 'normal');
    queue.flush();
    expect(order).toEqual(['critical', 'normal', 'low']);
  });

  it('clears the queue after flush', () => {
    const queue = new RenderQueue();
    queue.enqueue('t', () => {}, 'normal');
    queue.flush();
    expect(queue.depth).toBe(0);
  });

  it('continues after a task throws', () => {
    const results: number[] = [];
    const queue = new RenderQueue();
    queue.enqueue('a', () => { throw new Error('fail'); }, 'normal');
    queue.enqueue('b', () => results.push(1), 'normal');
    expect(() => queue.flush()).not.toThrow();
    expect(results).toEqual([1]);
  });
});

describe('batchUpdate', () => {
  it('batches multiple calls into a single microtask flush', async () => {
    const results: number[] = [];
    batchUpdate(() => results.push(1));
    batchUpdate(() => results.push(2));
    batchUpdate(() => results.push(3));
    expect(results).toEqual([]); // Not yet flushed
    await Promise.resolve(); // Flush microtask
    expect(results).toEqual([1, 2, 3]);
  });
});

describe('getMetrics', () => {
  it('returns metrics object with expected keys', () => {
    const metrics = getMetrics();
    expect(metrics).toHaveProperty('avgRenderTime');
    expect(metrics).toHaveProperty('cacheHitRate');
    expect(metrics).toHaveProperty('renderCount');
    expect(metrics).toHaveProperty('recent');
  });

  it('getMetrics(n) returns last N items', async () => {
    batchUpdate(() => {}); // trigger a flush
    await Promise.resolve();
    const metrics = getMetrics(1);
    expect(metrics.recent.length).toBeLessThanOrEqual(1);
  });
});
