import { describe, expect, it } from 'vitest';
import { OllamaProvider } from '../../src/agent/providers/ollama';
import type { Transport, TransportRequest, TransportResponse } from '../../src/agent/core/Transport';

function makeNDJSON(body: string): TransportResponse {
  const enc = new TextEncoder();
  return {
    status: 200,
    headers: {},
    body: new ReadableStream({
      start(c) {
        c.enqueue(enc.encode(body));
        c.close();
      },
    }),
    json: async () => ({}),
    text: async () => '',
  };
}

function captureTransport(response: TransportResponse): {
  transport: Transport;
  captured: TransportRequest[];
} {
  const captured: TransportRequest[] = [];
  return {
    transport: {
      async request(req) {
        captured.push(req);
        return response;
      },
    },
    captured,
  };
}

describe('OllamaProvider', () => {
  it('posts to default localhost endpoint with stream: true', async () => {
    const { transport, captured } = captureTransport(
      makeNDJSON('{"done":true,"done_reason":"stop"}\n'),
    );
    const p = new OllamaProvider({ transport });
    for await (const _ of p.stream({ model: 'llama3', messages: [] })) {
      /* drain */
    }
    expect(captured[0].url).toContain('localhost:11434/api/chat');
    const body = JSON.parse(captured[0].body as string);
    expect(body.stream).toBe(true);
    expect(body.model).toBe('llama3');
  });

  it('emits text_delta from message.content chunks', async () => {
    const ndjson =
      '{"message":{"role":"assistant","content":"hello"},"done":false}\n' +
      '{"message":{"role":"assistant","content":" world"},"done":false}\n' +
      '{"done":true,"done_reason":"stop"}\n';
    const { transport } = captureTransport(makeNDJSON(ndjson));
    const p = new OllamaProvider({ transport });
    const events = [];
    for await (const evt of p.stream({ model: 'llama3', messages: [] })) events.push(evt);
    const text = events
      .filter((e) => e.type === 'text_delta')
      .map((e) => (e as { text: string }).text)
      .join('');
    expect(text).toBe('hello world');
    expect(events[events.length - 1].type).toBe('message_stop');
  });

  it('maps tool_calls to start/delta/end events and tool_use stop reason', async () => {
    const ndjson =
      '{"message":{"role":"assistant","content":"","tool_calls":[{"function":{"name":"get_time","arguments":{"tz":"UTC"}}}]},"done":true}\n';
    const { transport } = captureTransport(makeNDJSON(ndjson));
    const p = new OllamaProvider({ transport });
    const events = [];
    for await (const evt of p.stream({ model: 'llama3', messages: [] })) events.push(evt);
    const start = events.find((e) => e.type === 'tool_call_start') as { name: string };
    const end = events.find((e) => e.type === 'tool_call_end') as { input: unknown };
    const stop = events.find((e) => e.type === 'message_stop') as { reason: string };
    expect(start.name).toBe('get_time');
    expect(end.input).toEqual({ tz: 'UTC' });
    expect(stop.reason).toBe('tool_use');
  });

  it('handles NDJSON split across chunks', async () => {
    const enc = new TextEncoder();
    const response: TransportResponse = {
      status: 200,
      headers: {},
      body: new ReadableStream({
        start(c) {
          c.enqueue(enc.encode('{"message":{"content":"hi'));
          c.enqueue(enc.encode('"},"done":false}\n{"done":true,"done_reason":"stop"}\n'));
          c.close();
        },
      }),
      json: async () => ({}),
      text: async () => '',
    };
    const transport: Transport = { request: async () => response };
    const p = new OllamaProvider({ transport });
    const events = [];
    for await (const evt of p.stream({ model: 'llama3', messages: [] })) events.push(evt);
    const text = events
      .filter((e) => e.type === 'text_delta')
      .map((e) => (e as { text: string }).text)
      .join('');
    expect(text).toBe('hi');
  });

  it('emits error on HTTP 5xx', async () => {
    const transport: Transport = {
      async request() {
        return {
          status: 500,
          headers: {},
          body: null,
          json: async () => ({}),
          text: async () => 'oops',
        };
      },
    };
    const p = new OllamaProvider({ transport });
    const events = [];
    for await (const evt of p.stream({ model: 'llama3', messages: [] })) events.push(evt);
    expect(events[0].type).toBe('error');
    expect((events[0] as { error: Error }).error.message).toContain('Ollama 500');
  });
});
