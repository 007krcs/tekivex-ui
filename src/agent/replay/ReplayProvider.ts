// ══════════════════════════════════════════════════════════════════════════════
// REPLAY PROVIDER (#15) — Implements Provider by replaying recorded StreamEvents.
// Pair with `Recorder` to get deterministic agent runs for tests + UI dev.
// ══════════════════════════════════════════════════════════════════════════════

import type { ChatOptions, Provider, StreamEvent } from '../core/Provider';
import type { Recording } from './recorder';

const STREAM_EVENT_TYPES = new Set([
  'text_delta',
  'tool_call_start',
  'tool_call_delta',
  'tool_call_end',
  'message_stop',
  'error',
]);

export interface ReplayProviderOptions {
  recording: Recording;
  delayMsBetweenEvents?: number;
}

export class ReplayProvider implements Provider {
  readonly name = 'replay';
  private readonly events: StreamEvent[];

  constructor(private readonly opts: ReplayProviderOptions) {
    this.events = opts.recording.events.filter((e) =>
      STREAM_EVENT_TYPES.has(e.type),
    ) as StreamEvent[];
  }

  async *stream(_opts: ChatOptions): AsyncGenerator<StreamEvent> {
    for (const e of this.events) {
      if (this.opts.delayMsBetweenEvents) {
        await new Promise((r) => setTimeout(r, this.opts.delayMsBetweenEvents));
      }
      yield e;
      if (e.type === 'message_stop') return;
    }
  }
}
