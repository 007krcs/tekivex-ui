import { describe, expect, it } from 'vitest';
import { defineTool } from '../../src/agent/core/Tool';
import { ToolAbortError, cancellable } from '../../src/agent/tools/cancellable';

describe('cancellable', () => {
  it('throws ToolAbortError if signal is already aborted', async () => {
    const tool = cancellable(
      defineTool({
        name: 't',
        description: '',
        inputSchema: {},
        execute: async () => 'ok',
      }),
    );
    const c = new AbortController();
    c.abort();
    await expect(
      tool.execute({}, { signal: c.signal, messages: [] }),
    ).rejects.toThrow(ToolAbortError);
  });

  it('passes through when no signal', async () => {
    const tool = cancellable(
      defineTool({
        name: 't',
        description: '',
        inputSchema: {},
        execute: async () => 'ok',
      }),
    );
    const r = await tool.execute({}, { signal: undefined, messages: [] });
    expect(r).toBe('ok');
  });

  it('aborts mid-execution', async () => {
    const tool = cancellable(
      defineTool({
        name: 't',
        description: '',
        inputSchema: {},
        execute: () =>
          new Promise<string>((resolve) => setTimeout(() => resolve('finished'), 200)),
      }),
    );
    const c = new AbortController();
    const promise = tool.execute({}, { signal: c.signal, messages: [] });
    setTimeout(() => c.abort(), 10);
    await expect(promise).rejects.toThrow(ToolAbortError);
  });
});
