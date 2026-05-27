import { describe, expect, it } from 'vitest';
import { createAgentController } from '../../src/agent/bindings/vanilla';
import { delta, scriptedProvider, stop } from './_helpers';

describe('createAgentController', () => {
  it('emits state updates as messages stream', async () => {
    const provider = scriptedProvider([[delta('hello'), delta(' world'), stop()]]);
    const ctrl = createAgentController({ provider, model: 'test' });
    const streamingHistory: string[] = [];
    ctrl.subscribe((s) => streamingHistory.push(s.streamingText));
    await ctrl.send('hi');
    expect(streamingHistory).toContain('hello');
    expect(streamingHistory).toContain('hello world');
    expect(ctrl.getState().streamingText).toBe('');
    expect(ctrl.getState().messages.length).toBeGreaterThan(0);
  });

  it('flips isStreaming back to false on completion', async () => {
    const provider = scriptedProvider([[delta('hi'), stop()]]);
    const ctrl = createAgentController({ provider, model: 'test' });
    const isStreaming: boolean[] = [];
    ctrl.subscribe((s) => isStreaming.push(s.isStreaming));
    await ctrl.send('hi');
    expect(isStreaming.includes(true)).toBe(true);
    expect(isStreaming[isStreaming.length - 1]).toBe(false);
  });

  it('reset clears messages and error', async () => {
    const provider = scriptedProvider([[delta('hi'), stop()]]);
    const ctrl = createAgentController({ provider, model: 'test' });
    await ctrl.send('hello');
    expect(ctrl.getState().messages.length).toBeGreaterThan(0);
    ctrl.reset();
    expect(ctrl.getState().messages).toEqual([]);
    expect(ctrl.getState().error).toBeNull();
  });

  it('unsubscribe stops further updates', async () => {
    const provider = scriptedProvider([[delta('hi'), stop()]]);
    const ctrl = createAgentController({ provider, model: 'test' });
    let count = 0;
    const unsub = ctrl.subscribe(() => count++);
    unsub();
    await ctrl.send('hi');
    expect(count).toBe(0);
  });
});
