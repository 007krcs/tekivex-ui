// ══════════════════════════════════════════════════════════════════════════════
// TOOL — Typed function the agent can call.
// `inputSchema` is universal JSON Schema (sent to the model).
// `parse` is an optional runtime validator — plug Zod/Valibot/Yup here.
// ══════════════════════════════════════════════════════════════════════════════

import type { JSONSchema, Message } from './types';

export interface ToolContext {
  signal?: AbortSignal;
  messages: Message[];
}

export interface Tool<TInput = unknown, TOutput = unknown> {
  name: string;
  description: string;
  inputSchema: JSONSchema;
  parse?(raw: unknown): TInput;
  execute(input: TInput, ctx: ToolContext): Promise<TOutput>;
}

export function defineTool<TInput, TOutput>(
  tool: Tool<TInput, TOutput>,
): Tool<TInput, TOutput> {
  return tool;
}
