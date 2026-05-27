// ══════════════════════════════════════════════════════════════════════════════
// EVAL FRAMEWORK (#7) — Run a batch of test cases against an Agent.
// Judges:
//  - exact / contains string match (default)
//  - custom predicate (sync or async)
//  - LLM-as-judge via `judgeWithLLM(provider, model)`
// ══════════════════════════════════════════════════════════════════════════════

import type { Agent } from '../core/Agent';
import type { Provider } from '../core/Provider';

export interface EvalCase {
  name: string;
  input: string;
  expected?: string;
  judge?(output: string, expected?: string): boolean | Promise<boolean>;
  meta?: Record<string, unknown>;
}

export interface EvalResult {
  name: string;
  input: string;
  output: string;
  passed: boolean;
  durationMs: number;
  error?: Error;
  meta?: Record<string, unknown>;
}

export interface EvalSummary {
  total: number;
  passed: number;
  failed: number;
  passRate: number;
  totalDurationMs: number;
  results: EvalResult[];
}

export async function runEval(
  agent: Agent,
  cases: EvalCase[],
  opts?: { signal?: AbortSignal; onProgress?(done: number, total: number): void },
): Promise<EvalSummary> {
  const results: EvalResult[] = [];
  let i = 0;
  for (const c of cases) {
    const start = Date.now();
    let output = '';
    let err: Error | undefined;
    try {
      for await (const evt of agent.run({ message: c.input, signal: opts?.signal })) {
        if (evt.type === 'text_delta') output += evt.text;
        if (evt.type === 'error') throw evt.error;
      }
    } catch (e) {
      err = e instanceof Error ? e : new Error(String(e));
    }
    const durationMs = Date.now() - start;
    let passed = false;
    if (!err) {
      if (c.judge) {
        passed = await c.judge(output, c.expected);
      } else if (c.expected !== undefined) {
        passed = output.toLowerCase().includes(c.expected.toLowerCase());
      } else {
        passed = output.length > 0;
      }
    }
    results.push({
      name: c.name,
      input: c.input,
      output,
      passed,
      durationMs,
      error: err,
      meta: c.meta,
    });
    opts?.onProgress?.(++i, cases.length);
  }
  const passedCount = results.filter((r) => r.passed).length;
  return {
    total: results.length,
    passed: passedCount,
    failed: results.length - passedCount,
    passRate: results.length === 0 ? 0 : passedCount / results.length,
    totalDurationMs: results.reduce((s, r) => s + r.durationMs, 0),
    results,
  };
}

export function judgeWithLLM(
  provider: Provider,
  model: string,
  criteria: string,
): (output: string, expected?: string) => Promise<boolean> {
  return async (output, expected) => {
    const prompt =
      `Criteria: ${criteria}\n\n` +
      (expected ? `Expected: ${expected}\n\n` : '') +
      `Actual output:\n${output}\n\n` +
      `Respond with exactly "PASS" or "FAIL".`;
    let buf = '';
    for await (const evt of provider.stream({
      model,
      messages: [{ role: 'user', content: prompt }],
      maxTokens: 8,
      temperature: 0,
    })) {
      if (evt.type === 'text_delta') buf += evt.text;
    }
    return /pass/i.test(buf.trim());
  };
}
