// ══════════════════════════════════════════════════════════════════════════════
// SUMMARIZING MEMORY (#5b) — collapses old turns into a rolling summary.
// Caller provides the summarizer function (typically a cheap-model call).
// ══════════════════════════════════════════════════════════════════════════════

import type { Memory } from '../core/Memory';
import type { Message } from '../core/types';

export interface SummarizingMemoryOptions {
  threshold: number;
  keepRecent?: number;
  summarizer(messages: Message[]): string | Promise<string>;
}

export class SummarizingMemory implements Memory {
  private messages: Message[] = [];
  private summary = '';

  constructor(private readonly opts: SummarizingMemoryOptions) {
    if (opts.threshold < 2) throw new Error('threshold must be >= 2');
  }

  async append(message: Message): Promise<void> {
    this.messages.push(message);
    const keep = this.opts.keepRecent ?? 4;
    if (this.messages.length > this.opts.threshold) {
      const toSummarize = this.messages.slice(0, this.messages.length - keep);
      this.messages = this.messages.slice(-keep);
      const next = await this.opts.summarizer(toSummarize);
      this.summary = this.summary ? `${this.summary}\n${next}` : next;
    }
  }

  all(): Message[] {
    if (!this.summary) return this.messages.slice();
    return [
      { role: 'system', content: `Prior conversation summary:\n${this.summary}` },
      ...this.messages,
    ];
  }

  clear(): void {
    this.messages = [];
    this.summary = '';
  }
}
