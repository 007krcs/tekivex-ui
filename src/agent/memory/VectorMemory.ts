// ══════════════════════════════════════════════════════════════════════════════
// VECTOR MEMORY (#5c) — long-term recall via a Retriever.
// On each `all()`, retrieves docs relevant to the most recent user query.
// Plug a Retriever that writes appended messages back to the store.
// ══════════════════════════════════════════════════════════════════════════════

import type { Memory } from '../core/Memory';
import type { Retriever } from '../rag/Retriever';
import type { Message } from '../core/types';

export interface VectorMemoryOptions {
  retriever: Retriever;
  topK?: number;
  keepRecent?: number;
  onAppend?(message: Message): void | Promise<void>;
}

export class VectorMemory implements Memory {
  private messages: Message[] = [];

  constructor(private readonly opts: VectorMemoryOptions) {}

  async append(message: Message): Promise<void> {
    this.messages.push(message);
    await this.opts.onAppend?.(message);
  }

  async all(): Promise<Message[]> {
    const keepRecent = this.opts.keepRecent ?? 6;
    const recent = this.messages.slice(-keepRecent);
    const lastUser = [...this.messages].reverse().find((m) => m.role === 'user');
    if (!lastUser) return recent;

    const query = typeof lastUser.content === 'string' ? lastUser.content : '';
    if (!query) return recent;

    const results = await this.opts.retriever.retrieve(query, {
      topK: this.opts.topK ?? 4,
    });
    if (results.length === 0) return recent;

    const context = results
      .map((r, i) => `[${i + 1}] (score=${r.score.toFixed(3)}) ${r.text}`)
      .join('\n\n');
    return [
      { role: 'system', content: `Long-term memory recall:\n${context}` },
      ...recent,
    ];
  }

  clear(): void {
    this.messages = [];
  }
}
