// ══════════════════════════════════════════════════════════════════════════════
// SLIDING WINDOW MEMORY (#5a) — keeps last N messages.
// ══════════════════════════════════════════════════════════════════════════════

import type { Memory } from '../core/Memory';
import type { Message } from '../core/types';

export class SlidingWindowMemory implements Memory {
  private messages: Message[] = [];

  constructor(private readonly windowSize: number) {
    if (windowSize < 1) throw new Error('windowSize must be >= 1');
  }

  append(message: Message): void {
    this.messages.push(message);
    while (this.messages.length > this.windowSize) {
      this.messages.shift();
    }
  }

  all(): Message[] {
    return this.messages.slice();
  }

  clear(): void {
    this.messages = [];
  }
}
