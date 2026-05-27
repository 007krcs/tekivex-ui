import { describe, expect, it } from 'vitest';
import { Agent } from '../../src/agent/core/Agent';
import { InMemoryStore } from '../../src/agent/core/Memory';
import { defineTool } from '../../src/agent/core/Tool';
import type { AgentEvent } from '../../src/agent/core/events';
import { delta, scriptedProvider, stop, toolCall } from './_helpers';

describe('Agent', () => {
  it('streams text and finishes on end_turn', async () => {
    const provider = scriptedProvider([[delta('Hello '), delta('world'), stop()]]);
    const agent = new Agent({ provider, model: 'test' });
    let out = '';
    for await (const evt of agent.run({ message: 'hi' })) {
      if (evt.type === 'text_delta') out += evt.text;
    }
    expect(out).toBe('Hello world');
  });

  it('dispatches a tool call and continues the loop', async () => {
    const provider = scriptedProvider([
      [...toolCall('t1', 'echo', { x: 1 }), stop('tool_use')],
      [delta('after-tool'), stop()],
    ]);
    const tool = defineTool({
      name: 'echo',
      description: 'echoes',
      inputSchema: { type: 'object' },
      execute: async (input) => input,
    });
    const agent = new Agent({ provider, model: 'test', tools: [tool] });
    const types: string[] = [];
    let text = '';
    for await (const evt of agent.run({ message: 'go' })) {
      types.push(evt.type);
      if (evt.type === 'text_delta') text += evt.text;
    }
    expect(text).toBe('after-tool');
    expect(types).toContain('tool_call_start');
    expect(types).toContain('tool_result');
    expect(types).toContain('done');
  });

  it('emits tool_error and continues when tool throws', async () => {
    const provider = scriptedProvider([
      [...toolCall('t1', 'fail', {}), stop('tool_use')],
      [delta('ok'), stop()],
    ]);
    const tool = defineTool({
      name: 'fail',
      description: 'fails',
      inputSchema: { type: 'object' },
      execute: async () => {
        throw new Error('boom');
      },
    });
    const agent = new Agent({ provider, model: 'test', tools: [tool] });
    const errors: Error[] = [];
    for await (const evt of agent.run({ message: 'go' })) {
      if (evt.type === 'tool_error') errors.push(evt.error);
    }
    expect(errors).toHaveLength(1);
    expect(errors[0].message).toBe('boom');
  });

  it('stops at maxSteps when tools keep being called', async () => {
    const scripts: ReturnType<typeof toolCall>[] = [];
    for (let i = 0; i < 20; i++) {
      scripts.push([...toolCall(`t${i}`, 'echo', {}), stop('tool_use')]);
    }
    const provider = scriptedProvider(scripts as never);
    const tool = defineTool({
      name: 'echo',
      description: 'echoes',
      inputSchema: { type: 'object' },
      execute: async () => ({ ok: true }),
    });
    const agent = new Agent({ provider, model: 'test', tools: [tool], maxSteps: 3 });
    let stepCount = 0;
    let doneReason: string | undefined;
    for await (const evt of agent.run({ message: 'go' })) {
      if (evt.type === 'step_start') stepCount++;
      if (evt.type === 'done') doneReason = evt.reason;
    }
    expect(stepCount).toBe(3);
    expect(doneReason).toBe('max_tokens');
  });

  it('reports tool_error for unknown tool name', async () => {
    const provider = scriptedProvider([
      [...toolCall('t1', 'missing', {}), stop('tool_use')],
      [delta('ok'), stop()],
    ]);
    const agent = new Agent({ provider, model: 'test', tools: [] });
    const errored: string[] = [];
    for await (const evt of agent.run({ message: 'go' })) {
      if (evt.type === 'tool_error') errored.push(evt.name);
    }
    expect(errored).toEqual(['missing']);
  });

  it('appends user, assistant, and tool messages to memory in order', async () => {
    const provider = scriptedProvider([
      [...toolCall('t1', 'echo', { x: 1 }), stop('tool_use')],
      [delta('done'), stop()],
    ]);
    const tool = defineTool({
      name: 'echo',
      description: 'echoes',
      inputSchema: { type: 'object' },
      execute: async (input) => input,
    });
    const memory = new InMemoryStore();
    const agent = new Agent({ provider, model: 'test', tools: [tool], memory });
    for await (const _ of agent.run({ message: 'hi' })) {
      /* drain */
    }
    const msgs = memory.all();
    expect(msgs.map((m) => m.role)).toEqual(['user', 'assistant', 'tool', 'assistant']);
  });

  it('invokes middleware onEvent', async () => {
    const provider = scriptedProvider([[delta('hi'), stop()]]);
    const seen: AgentEvent[] = [];
    const agent = new Agent({
      provider,
      model: 'test',
      middleware: [{ name: 'spy', onEvent: (e) => seen.push(e) }],
    });
    for await (const _ of agent.run({ message: 'go' })) {
      /* drain */
    }
    const types = seen.map((e) => e.type);
    expect(types).toContain('step_start');
    expect(types).toContain('text_delta');
    expect(types).toContain('message_stop');
  });

  it('swallows middleware errors without breaking the loop', async () => {
    const provider = scriptedProvider([[delta('hi'), stop()]]);
    const agent = new Agent({
      provider,
      model: 'test',
      middleware: [
        {
          name: 'bad',
          onEvent: () => {
            throw new Error('observer crashed');
          },
        },
      ],
    });
    let text = '';
    for await (const evt of agent.run({ message: 'go' })) {
      if (evt.type === 'text_delta') text += evt.text;
    }
    expect(text).toBe('hi');
  });
});
