// ══════════════════════════════════════════════════════════════════════════════
// STRUCTURED OUTPUT (#4) — `generateObject({ schema, prompt })`.
// Forces JSON output. Strips code fences; optional retry on parse failure.
// ══════════════════════════════════════════════════════════════════════════════

import type { Provider } from '../core/Provider';
import type { JSONSchema } from '../core/types';

export interface GenerateObjectOptions<T> {
  provider: Provider;
  model: string;
  schema: JSONSchema;
  prompt: string;
  system?: string;
  maxTokens?: number;
  temperature?: number;
  maxRetries?: number;
  parse?(raw: unknown): T;
  signal?: AbortSignal;
}

export class StructuredOutputError extends Error {
  constructor(message: string, public readonly raw: string) {
    super(message);
    this.name = 'StructuredOutputError';
  }
}

export async function generateObject<T = unknown>(
  opts: GenerateObjectOptions<T>,
): Promise<T> {
  const baseSystem = opts.system ? `${opts.system}\n\n` : '';
  const system =
    `${baseSystem}You MUST respond with valid JSON only — no commentary, no markdown fences. ` +
    `The JSON must conform to this JSON Schema:\n${JSON.stringify(opts.schema, null, 2)}`;

  const maxRetries = opts.maxRetries ?? 1;
  let lastRaw = '';
  let lastErr: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    let buffer = '';
    for await (const evt of opts.provider.stream({
      model: opts.model,
      messages: [{ role: 'user', content: opts.prompt }],
      system,
      maxTokens: opts.maxTokens,
      temperature: opts.temperature ?? 0,
      signal: opts.signal,
    })) {
      if (evt.type === 'text_delta') buffer += evt.text;
      if (evt.type === 'error') throw evt.error;
    }
    lastRaw = buffer;
    try {
      const extracted = extractJSON(buffer);
      const parsed = JSON.parse(extracted) as unknown;
      return opts.parse ? opts.parse(parsed) : (parsed as T);
    } catch (err) {
      lastErr = err instanceof Error ? err : new Error(String(err));
    }
  }
  throw new StructuredOutputError(
    `Failed to parse JSON after ${maxRetries + 1} attempt(s): ${lastErr?.message}`,
    lastRaw,
  );
}

function extractJSON(s: string): string {
  const trimmed = s.trim();
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]+?)\s*```/);
  if (fence) return fence[1].trim();
  const start = Math.min(
    ...['[', '{'].map((c) => {
      const i = trimmed.indexOf(c);
      return i === -1 ? Infinity : i;
    }),
  );
  const end = Math.max(trimmed.lastIndexOf(']'), trimmed.lastIndexOf('}'));
  if (start !== Infinity && end > start) return trimmed.slice(start, end + 1);
  return trimmed;
}
