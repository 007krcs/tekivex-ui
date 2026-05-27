import { describe, expect, it } from 'vitest';
import { createTokenUsageTracker } from '../../src/agent/middleware/tokenUsage';

describe('createTokenUsageTracker', () => {
  it('accumulates tokens across message_stop events', async () => {
    const tracker = createTokenUsageTracker({
      model: 'm1',
      pricing: { m1: { inputPerMillion: 10, outputPerMillion: 50 } },
    });
    await tracker.middleware.onEvent!({
      type: 'message_stop',
      reason: 'end_turn',
      usage: { inputTokens: 1000, outputTokens: 500 },
    });
    await tracker.middleware.onEvent!({
      type: 'message_stop',
      reason: 'end_turn',
      usage: { inputTokens: 2000, outputTokens: 1000 },
    });
    const totals = tracker.totals();
    expect(totals.inputTokens).toBe(3000);
    expect(totals.outputTokens).toBe(1500);
    expect(totals.totalCostUSD).toBeCloseTo(0.105, 5);
    expect(totals.byModel.m1.inputTokens).toBe(3000);
  });

  it('skips events without usage', async () => {
    const tracker = createTokenUsageTracker();
    await tracker.middleware.onEvent!({ type: 'message_stop', reason: 'end_turn' });
    expect(tracker.totals().inputTokens).toBe(0);
  });

  it('invokes onUpdate callback per event', async () => {
    const seen: number[] = [];
    const tracker = createTokenUsageTracker({ onUpdate: (t) => seen.push(t.inputTokens) });
    await tracker.middleware.onEvent!({
      type: 'message_stop',
      reason: 'end_turn',
      usage: { inputTokens: 100, outputTokens: 50 },
    });
    expect(seen).toEqual([100]);
  });

  it('reset clears totals', async () => {
    const tracker = createTokenUsageTracker();
    await tracker.middleware.onEvent!({
      type: 'message_stop',
      reason: 'end_turn',
      usage: { inputTokens: 100, outputTokens: 50 },
    });
    tracker.reset();
    expect(tracker.totals().inputTokens).toBe(0);
  });
});
