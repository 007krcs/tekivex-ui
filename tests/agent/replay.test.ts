import { describe, expect, it } from 'vitest';
import { Recorder } from '../../src/agent/replay/recorder';
import { ReplayProvider } from '../../src/agent/replay/ReplayProvider';

describe('Recorder', () => {
  it('captures events and serializes to JSONL', () => {
    const r = new Recorder();
    r.record({ type: 'text_delta', text: 'hello' });
    r.record({ type: 'message_stop', reason: 'end_turn' });
    const lines = r.toJSONL().split('\n');
    expect(lines).toHaveLength(2);
    expect(JSON.parse(lines[0])).toEqual({ type: 'text_delta', text: 'hello' });
  });

  it('serializes Error fields', () => {
    const r = new Recorder();
    r.record({ type: 'error', error: new Error('boom') });
    const parsed = JSON.parse(r.toJSONL());
    expect(parsed.error.message).toBe('boom');
  });

  it('round-trips through JSONL', () => {
    const r = new Recorder();
    r.record({ type: 'text_delta', text: 'hi' });
    r.record({ type: 'message_stop', reason: 'end_turn' });
    const recording = Recorder.fromJSONL(r.toJSONL());
    expect(recording.events).toHaveLength(2);
  });
});

describe('ReplayProvider', () => {
  it('replays text + stop', async () => {
    const provider = new ReplayProvider({
      recording: {
        events: [
          { type: 'text_delta', text: 'hello' },
          { type: 'message_stop', reason: 'end_turn' },
        ],
        startedAt: 0,
      },
    });
    const out = [];
    for await (const evt of provider.stream({ model: 'replay', messages: [] })) {
      out.push(evt);
    }
    expect(out).toHaveLength(2);
    expect(out[0]).toEqual({ type: 'text_delta', text: 'hello' });
  });

  it('filters non-StreamEvent entries from the recording', async () => {
    const provider = new ReplayProvider({
      recording: {
        events: [
          { type: 'step_start', step: 0 } as never,
          { type: 'text_delta', text: 'ok' },
          { type: 'message_stop', reason: 'end_turn' },
        ],
        startedAt: 0,
      },
    });
    const out = [];
    for await (const evt of provider.stream({ model: 'replay', messages: [] })) {
      out.push(evt);
    }
    expect(out).toHaveLength(2);
    expect(out[0].type).toBe('text_delta');
  });
});
