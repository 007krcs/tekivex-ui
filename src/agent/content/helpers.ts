// ══════════════════════════════════════════════════════════════════════════════
// CONTENT HELPERS (#3 prompt cache + #18 multimodal)
// Ergonomic builders for ContentBlock unions.
// ══════════════════════════════════════════════════════════════════════════════

import type { CacheControl, ContentBlock } from '../core/types';

export function textBlock(
  text: string,
  opts?: { cacheControl?: CacheControl },
): ContentBlock {
  return opts?.cacheControl
    ? { type: 'text', text, cacheControl: opts.cacheControl }
    : { type: 'text', text };
}

export function cacheable(text: string): ContentBlock {
  return { type: 'text', text, cacheControl: { type: 'ephemeral' } };
}

export function imageBlock(
  input: { url: string; mediaType?: string } | { base64: string; mediaType?: string },
): ContentBlock {
  if ('base64' in input) {
    return {
      type: 'image',
      source: {
        kind: 'base64',
        data: input.base64,
        mediaType: input.mediaType ?? 'image/png',
      },
    };
  }
  return {
    type: 'image',
    source: { kind: 'url', data: input.url, mediaType: input.mediaType },
  };
}

export function toolUseBlock(id: string, name: string, input: unknown): ContentBlock {
  return { type: 'tool_use', id, name, input };
}

export function toolResultBlock(
  toolUseId: string,
  output: unknown,
  opts?: { name?: string; isError?: boolean },
): ContentBlock {
  return {
    type: 'tool_result',
    toolUseId,
    output,
    name: opts?.name,
    isError: opts?.isError,
  };
}
