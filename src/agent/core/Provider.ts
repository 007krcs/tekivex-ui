// ══════════════════════════════════════════════════════════════════════════════
// PROVIDER — MODEL ADAPTER INTERFACE
// Every provider (Anthropic, OpenAI, Gemini, Ollama, custom) implements this
// one interface. Adding a new model family = one file, ~80 lines.
// ══════════════════════════════════════════════════════════════════════════════

import type { JSONSchema, Message, StopReason, Usage } from './types';

export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: JSONSchema;
}

export interface ChatOptions {
  model: string;
  messages: Message[];
  system?: string;
  tools?: ToolDefinition[];
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  stopSequences?: string[];
  signal?: AbortSignal;
}

export type StreamEvent =
  | { type: 'text_delta'; text: string }
  | { type: 'tool_call_start'; id: string; name: string }
  | { type: 'tool_call_delta'; id: string; argsDelta: string }
  | { type: 'tool_call_end'; id: string; input: unknown }
  | { type: 'message_stop'; reason: StopReason; usage?: Usage }
  | { type: 'error'; error: Error };

export interface Provider {
  readonly name: string;
  stream(opts: ChatOptions): AsyncIterable<StreamEvent>;
}
