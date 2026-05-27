// ══════════════════════════════════════════════════════════════════════════════
// retrievalTool — Wraps any Retriever as a Tool so the model can call it.
// The model decides when to search; results are injected as a tool_result.
// ══════════════════════════════════════════════════════════════════════════════

import { defineTool, type Tool } from '../core/Tool';
import type { Retriever } from './Retriever';

export interface RetrievalToolOptions {
  retriever: Retriever;
  name?: string;
  description?: string;
  topK?: number;
}

export function retrievalTool(
  opts: RetrievalToolOptions,
): Tool<{ query: string }, string> {
  return defineTool<{ query: string }, string>({
    name: opts.name ?? 'search_knowledge',
    description:
      opts.description ??
      'Search the internal knowledge base. Use this whenever the user asks about content that may exist in stored documents.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'A complete question or topic phrase — not a single keyword.',
        },
      },
      required: ['query'],
    },
    async execute({ query }, ctx) {
      const results = await opts.retriever.retrieve(query, {
        topK: opts.topK ?? 4,
        signal: ctx.signal,
      });
      if (results.length === 0) return 'No relevant documents found.';
      return results
        .map((r, i) => `[Source ${i + 1} | score=${r.score.toFixed(3)}]\n${r.text}`)
        .join('\n\n---\n\n');
    },
  });
}
