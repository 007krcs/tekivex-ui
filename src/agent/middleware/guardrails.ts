// ══════════════════════════════════════════════════════════════════════════════
// GUARDRAILS (#11)
// Input/output filters for PII redaction, prompt-injection detection, profanity.
// Two surfaces:
//  - guardrailsMiddleware([...]) — silently redacts request bodies pre-send
//  - checkGuardrails(text, [...], direction) — explicit call for output checks
// ══════════════════════════════════════════════════════════════════════════════

import type { Middleware } from '../core/Middleware';

export interface GuardrailVerdict {
  allow: boolean;
  replacement?: string;
  reason?: string;
}

export interface Guardrail {
  name: string;
  checkInput?(text: string): GuardrailVerdict | Promise<GuardrailVerdict>;
  checkOutput?(text: string): GuardrailVerdict | Promise<GuardrailVerdict>;
}

export class GuardrailViolation extends Error {
  constructor(public readonly guardrailName: string, public readonly reason: string) {
    super(`Guardrail violation [${guardrailName}]: ${reason}`);
    this.name = 'GuardrailViolation';
  }
}

export async function checkGuardrails(
  text: string,
  guardrails: Guardrail[],
  direction: 'input' | 'output',
): Promise<GuardrailVerdict> {
  let current = text;
  for (const g of guardrails) {
    const fn = direction === 'input' ? g.checkInput : g.checkOutput;
    if (!fn) continue;
    const v = await fn(current);
    if (!v.allow) return { allow: false, reason: v.reason, replacement: current };
    if (v.replacement) current = v.replacement;
  }
  return { allow: true, replacement: current };
}

export function guardrailsMiddleware(guardrails: Guardrail[]): Middleware {
  return {
    name: 'guardrails',
    async beforeRequest(req) {
      if (typeof req.body !== 'string') return req;
      let body: unknown;
      try {
        body = JSON.parse(req.body);
      } catch {
        return req;
      }
      const msgs = (body as { messages?: Array<{ role: string; content: unknown }> }).messages;
      if (!Array.isArray(msgs)) return req;
      let modified = false;
      for (const m of msgs) {
        if (m.role !== 'user') continue;
        if (typeof m.content !== 'string') continue;
        const verdict = await checkGuardrails(m.content, guardrails, 'input');
        if (!verdict.allow) {
          throw new GuardrailViolation('input', verdict.reason ?? 'blocked');
        }
        if (verdict.replacement && verdict.replacement !== m.content) {
          m.content = verdict.replacement;
          modified = true;
        }
      }
      return modified ? { ...req, body: JSON.stringify(body) } : req;
    },
  };
}

// ── Built-in guardrails ──────────────────────────────────────────────────────

const PII_PATTERNS: Array<{ regex: RegExp; label: string }> = [
  { regex: /\b\d{3}-\d{2}-\d{4}\b/g, label: 'SSN' },
  { regex: /\b(?:\d[ -]*?){13,16}\b/g, label: 'CREDIT_CARD' },
  { regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, label: 'EMAIL' },
];

export const piiRedactor: Guardrail = {
  name: 'pii-redactor',
  checkInput(text) {
    let out = text;
    for (const { regex, label } of PII_PATTERNS) {
      out = out.replace(regex, `[REDACTED:${label}]`);
    }
    return { allow: true, replacement: out };
  },
};

const INJECTION_TRIPWIRES = [
  /ignore (?:all )?previous instructions/i,
  /disregard (?:the )?system prompt/i,
  /you are now (?:a |an )?different/i,
];

export const promptInjectionDetector: Guardrail = {
  name: 'prompt-injection',
  checkInput(text) {
    for (const tw of INJECTION_TRIPWIRES) {
      if (tw.test(text)) {
        return { allow: false, reason: `potential prompt injection: ${tw}` };
      }
    }
    return { allow: true };
  },
};
