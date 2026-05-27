// ══════════════════════════════════════════════════════════════════════════════
// AGENT — SHARED TYPES
// Normalized message + content shape that every provider maps to.
// ══════════════════════════════════════════════════════════════════════════════

export type Role = 'system' | 'user' | 'assistant' | 'tool';

export type ContentBlock =
  | { type: 'text'; text: string; cacheControl?: CacheControl }
  | { type: 'image'; source: ImageSource }
  | { type: 'tool_use'; id: string; name: string; input: unknown }
  | { type: 'tool_result'; toolUseId: string; name?: string; output: unknown; isError?: boolean };

export interface CacheControl {
  type: 'ephemeral';
}

export interface ImageSource {
  kind: 'base64' | 'url';
  data: string;
  mediaType?: string;
}

export interface Message {
  role: Role;
  content: string | ContentBlock[];
}

export type JSONSchema = Record<string, unknown>;

export type StopReason =
  | 'end_turn'
  | 'tool_use'
  | 'max_tokens'
  | 'stop_sequence'
  | 'error';

export interface Usage {
  inputTokens?: number;
  outputTokens?: number;
  cachedInputTokens?: number;
}
