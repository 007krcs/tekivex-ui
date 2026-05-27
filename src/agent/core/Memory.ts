// ══════════════════════════════════════════════════════════════════════════════
// MEMORY — Conversation store. Default: in-memory. Pluggable (Redis, IDB, etc).
// ══════════════════════════════════════════════════════════════════════════════

import type { Message } from './types';

export interface Memory {
  append(message: Message): void | Promise<void>;
  all(): Message[] | Promise<Message[]>;
  clear(): void | Promise<void>;
}

export class InMemoryStore implements Memory {
  private messages: Message[] = [];

  append(message: Message): void {
    this.messages.push(message);
  }

  all(): Message[] {
    return this.messages.slice();
  }

  clear(): void {
    this.messages = [];
  }
}
