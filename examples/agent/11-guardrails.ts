// ─────────────────────────────────────────────────────────────────────────────
// #11 · Guardrails — PII redaction + prompt-injection detection
// ─────────────────────────────────────────────────────────────────────────────

import {
  AnthropicProvider,
  createAgent,
  guardrailsMiddleware,
  piiRedactor,
  promptInjectionDetector,
  checkGuardrails,
  type Guardrail,
} from 'tekivex-ui/agent';

// Custom guardrail — block company-confidential phrases
const noLeaks: Guardrail = {
  name: 'no-leaks',
  checkOutput(text) {
    if (/PROJECT_FALCON|internal only/i.test(text)) {
      return { allow: false, reason: 'mentions confidential project' };
    }
    return { allow: true };
  },
};

const guardrails = [piiRedactor, promptInjectionDetector, noLeaks];

const agent = createAgent({
  provider: new AnthropicProvider({ endpoint: '/api/anthropic' }),
  model: 'claude-opus-4-7',
  // Input guardrails run silently at the HTTP layer
  middleware: [guardrailsMiddleware(guardrails)],
});

async function safeRender(text: string) {
  const verdict = await checkGuardrails(text, guardrails, 'output');
  if (!verdict.allow) {
    return `[blocked: ${verdict.reason}]`;
  }
  return verdict.replacement ?? text;
}

export { agent, safeRender };
