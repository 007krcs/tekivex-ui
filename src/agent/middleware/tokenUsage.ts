// ══════════════════════════════════════════════════════════════════════════════
// TOKEN USAGE + COST MIDDLEWARE (#1)
// Aggregates usage from message_stop events. Optional per-token pricing.
// ══════════════════════════════════════════════════════════════════════════════

import type { Middleware } from '../core/Middleware';
import type { AgentEvent } from '../core/events';

export interface TokenUsageTotals {
  inputTokens: number;
  outputTokens: number;
  cachedInputTokens: number;
  totalCostUSD: number;
  byModel: Record<string, { inputTokens: number; outputTokens: number; costUSD: number }>;
}

export interface TokenPricing {
  inputPerMillion: number;
  outputPerMillion: number;
  cachedInputPerMillion?: number;
}

export interface TokenUsageMiddlewareOptions {
  pricing?: Record<string, TokenPricing>;
  model?: string;
  onUpdate?(totals: TokenUsageTotals): void;
}

export function createTokenUsageTracker(opts: TokenUsageMiddlewareOptions = {}): {
  middleware: Middleware;
  totals(): TokenUsageTotals;
  reset(): void;
} {
  const totals: TokenUsageTotals = {
    inputTokens: 0,
    outputTokens: 0,
    cachedInputTokens: 0,
    totalCostUSD: 0,
    byModel: {},
  };

  function bumpModel(model: string, input: number, output: number): number {
    const m = (totals.byModel[model] ??= { inputTokens: 0, outputTokens: 0, costUSD: 0 });
    m.inputTokens += input;
    m.outputTokens += output;
    const price = opts.pricing?.[model];
    let cost = 0;
    if (price) {
      cost =
        (input * price.inputPerMillion) / 1_000_000 +
        (output * price.outputPerMillion) / 1_000_000;
      m.costUSD += cost;
    }
    return cost;
  }

  const middleware: Middleware = {
    name: 'token-usage',
    onEvent(evt: AgentEvent) {
      if (evt.type !== 'message_stop' || !evt.usage) return;
      const inp = evt.usage.inputTokens ?? 0;
      const out = evt.usage.outputTokens ?? 0;
      const cached = evt.usage.cachedInputTokens ?? 0;
      totals.inputTokens += inp;
      totals.outputTokens += out;
      totals.cachedInputTokens += cached;
      if (opts.model) totals.totalCostUSD += bumpModel(opts.model, inp, out);
      opts.onUpdate?.(structuredClone(totals));
    },
  };

  return {
    middleware,
    totals: () => structuredClone(totals),
    reset() {
      totals.inputTokens = 0;
      totals.outputTokens = 0;
      totals.cachedInputTokens = 0;
      totals.totalCostUSD = 0;
      totals.byModel = {};
    },
  };
}
