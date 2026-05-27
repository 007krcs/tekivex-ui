// ══════════════════════════════════════════════════════════════════════════════
// RECORDER (#15) — Capture AgentEvents to a buffer / JSONL for later replay.
// ══════════════════════════════════════════════════════════════════════════════

import type { AgentEvent } from '../core/events';
import type { Middleware } from '../core/Middleware';

export interface Recording {
  events: AgentEvent[];
  startedAt: number;
}

export class Recorder {
  private events: AgentEvent[] = [];
  private started = Date.now();

  record(event: AgentEvent): void {
    this.events.push(event);
  }

  snapshot(): Recording {
    return { events: this.events.slice(), startedAt: this.started };
  }

  toJSONL(): string {
    return this.events.map((e) => JSON.stringify(serialize(e))).join('\n');
  }

  static fromJSONL(jsonl: string): Recording {
    const events = jsonl
      .split('\n')
      .filter((l) => l.trim())
      .map((l) => deserialize(JSON.parse(l)));
    return { events, startedAt: Date.now() };
  }

  reset(): void {
    this.events = [];
    this.started = Date.now();
  }

  asMiddleware(): Middleware {
    return {
      name: 'recorder',
      onEvent: (evt) => this.record(evt),
    };
  }
}

function serialize(e: AgentEvent): unknown {
  if ('error' in e && e.error instanceof Error) {
    return { ...e, error: { message: e.error.message, name: e.error.name } };
  }
  return e;
}

function deserialize(raw: unknown): AgentEvent {
  if (
    raw &&
    typeof raw === 'object' &&
    'error' in raw &&
    typeof (raw as { error: unknown }).error === 'object'
  ) {
    const r = raw as { error: { message?: string } };
    return { ...(raw as object), error: new Error(r.error?.message ?? 'unknown') } as AgentEvent;
  }
  return raw as AgentEvent;
}
