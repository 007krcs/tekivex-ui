import { describe, expect, it } from 'vitest';
import { SlidingWindowMemory } from '../../src/agent/memory/SlidingWindowMemory';
import { SummarizingMemory } from '../../src/agent/memory/SummarizingMemory';
import { VectorMemory } from '../../src/agent/memory/VectorMemory';

describe('SlidingWindowMemory', () => {
  it('keeps only the last N messages', () => {
    const m = new SlidingWindowMemory(3);
    for (let i = 0; i < 5; i++) m.append({ role: 'user', content: `msg ${i}` });
    const all = m.all();
    expect(all).toHaveLength(3);
    expect(all[0].content).toBe('msg 2');
    expect(all[2].content).toBe('msg 4');
  });

  it('clear empties the store', () => {
    const m = new SlidingWindowMemory(5);
    m.append({ role: 'user', content: 'a' });
    m.clear();
    expect(m.all()).toEqual([]);
  });

  it('throws on invalid windowSize', () => {
    expect(() => new SlidingWindowMemory(0)).toThrow();
  });
});

describe('SummarizingMemory', () => {
  it('summarizes older messages when threshold is exceeded', async () => {
    let calls = 0;
    const m = new SummarizingMemory({
      threshold: 4,
      keepRecent: 2,
      summarizer: async (msgs) => {
        calls++;
        return `summary of ${msgs.length}`;
      },
    });
    for (let i = 0; i < 5; i++) await m.append({ role: 'user', content: `m${i}` });
    const all = await m.all();
    expect(calls).toBeGreaterThanOrEqual(1);
    expect(all[0].role).toBe('system');
    expect(all[0].content).toContain('summary');
    expect(all.length).toBe(3); // system + 2 recent
  });
});

describe('VectorMemory', () => {
  it('includes retrieved context with recent messages', async () => {
    const m = new VectorMemory({
      retriever: {
        retrieve: async () => [
          { text: 'doc A', score: 0.9 },
          { text: 'doc B', score: 0.8 },
        ],
      },
      keepRecent: 2,
      topK: 2,
    });
    await m.append({ role: 'user', content: 'first' });
    await m.append({ role: 'assistant', content: 'response' });
    await m.append({ role: 'user', content: 'follow up' });
    const all = await m.all();
    expect(all[0].role).toBe('system');
    expect(all[0].content).toContain('doc A');
    expect(all[0].content).toContain('doc B');
  });

  it('returns only recent when no retrieval results', async () => {
    const m = new VectorMemory({ retriever: { retrieve: async () => [] }, keepRecent: 4 });
    await m.append({ role: 'user', content: 'q' });
    const all = await m.all();
    expect(all[0].role).toBe('user');
  });
});
