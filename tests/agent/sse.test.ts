import { describe, expect, it } from 'vitest';
import { parseSSE } from '../../src/agent/core/sse';

function makeStream(chunks: string[]): ReadableStream<Uint8Array> {
  const enc = new TextEncoder();
  let i = 0;
  return new ReadableStream({
    pull(controller) {
      if (i < chunks.length) controller.enqueue(enc.encode(chunks[i++]));
      else controller.close();
    },
  });
}

async function collect(stream: ReadableStream<Uint8Array>) {
  const out: Array<{ event?: string; data: string; id?: string }> = [];
  for await (const m of parseSSE(stream)) out.push(m);
  return out;
}

describe('parseSSE', () => {
  it('parses a single data event', async () => {
    const out = await collect(makeStream(['data: hello\n\n']));
    expect(out).toEqual([{ data: 'hello' }]);
  });

  it('parses event name', async () => {
    const out = await collect(makeStream(['event: foo\ndata: bar\n\n']));
    expect(out[0]).toEqual({ event: 'foo', data: 'bar' });
  });

  it('handles CRLF line endings', async () => {
    const out = await collect(makeStream(['event: a\r\ndata: 1\r\n\r\ndata: 2\r\n\r\n']));
    expect(out).toHaveLength(2);
    expect(out[0]).toEqual({ event: 'a', data: '1' });
    expect(out[1].data).toBe('2');
  });

  it('joins multi-line data with \\n', async () => {
    const out = await collect(makeStream(['data: line1\ndata: line2\n\n']));
    expect(out[0].data).toBe('line1\nline2');
  });

  it('ignores comments', async () => {
    const out = await collect(makeStream([': comment\ndata: real\n\n']));
    expect(out[0].data).toBe('real');
  });

  it('joins chunks split across event boundaries', async () => {
    const out = await collect(makeStream(['data: hel', 'lo\n\nda', 'ta: world\n\n']));
    expect(out.map((m) => m.data)).toEqual(['hello', 'world']);
  });

  it('flushes a final trailing event without terminator', async () => {
    const out = await collect(makeStream(['data: trailing']));
    expect(out[0].data).toBe('trailing');
  });

  it('strips one leading space from data', async () => {
    const out = await collect(makeStream(['data:  two-leading-spaces\n\n']));
    expect(out[0].data).toBe(' two-leading-spaces');
  });
});
