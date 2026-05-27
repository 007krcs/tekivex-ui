import { describe, expect, it } from 'vitest';
import { OpenAIProvider } from '../../src/agent/providers/openai';
import type { Transport, TransportRequest, TransportResponse } from '../../src/agent/core/Transport';

function makeSSE(body: string): TransportResponse {
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

describe('OpenAIProvider', () => {
  it('sets bearer authorization header', async () => {
    const { transport, captured } = captureTransport(
      makeSSE('data: {"choices":[{"index":0,"finish_reason":"stop","delta":{}}]}\n\ndata: [DONE]\n\n'),
    );
    const p = new OpenAIProvider({ endpoint: '/x', transport, apiKey: 'sk-test' });
    for await (const _ of p.stream({ model: 'gpt-4', messages: [] })) {
      /* drain */
    }
    expect(captured[0].headers!.authorization).toBe('Bearer sk-test');
  });

  it('prepends system as a system message', async () => {
    const { transport, captured } = captureTransport(
      makeSSE('data: {"choices":[{"index":0,"finish_reason":"stop","delta":{}}]}\n\ndata: [DONE]\n\n'),
    );
    const p = new OpenAIProvider({ endpoint: '/x', transport });
    for await (const _ of p.stream({
      model: 'gpt-4',
      messages: [{ role: 'user', content: 'hi' }],
      system: 'be helpful',
    })) {
      /* drain */
    }
    const body = JSON.parse(captured[0].body as string);
    expect(body.messages[0]).toEqual({ role: 'system', content: 'be helpful' });
    expect(body.stream).toBe(true);
  });

  it('emits text_delta from choices[0].delta.content', async () => {
    const sse =
      'data: {"choices":[{"index":0,"delta":{"content":"hello"},"finish_reason":null}]}\n\n' +
      'data: {"choices":[{"index":0,"delta":{"content":" world"},"finish_reason":null}]}\n\n' +
      'data: {"choices":[{"index":0,"delta":{},"finish_reason":"stop"}]}\n\n' +
      'data: [DONE]\n\n';
    const { transport } = captureTransport(makeSSE(sse));
    const p = new OpenAIProvider({ endpoint: '/x', transport });
    const events = [];
    for await (const evt of p.stream({ model: 'gpt-4', messages: [] })) events.push(evt);
    const texts = events.filter((e) => e.type === 'text_delta').map((e) => (e as { text: string }).text);
    expect(texts.join('')).toBe('hello world');
    expect(events[events.length - 1].type).toBe('message_stop');
  });

  it('accumulates tool_calls across deltas and emits end on finish', async () => {
    const sse =
      'data: {"choices":[{"index":0,"delta":{"tool_calls":[{"index":0,"id":"call_abc","type":"function","function":{"name":"get_weather","arguments":""}}]},"finish_reason":null}]}\n\n' +
      'data: {"choices":[{"index":0,"delta":{"tool_calls":[{"index":0,"function":{"arguments":"{\\"city\\":"}}]},"finish_reason":null}]}\n\n' +
      'data: {"choices":[{"index":0,"delta":{"tool_calls":[{"index":0,"function":{"arguments":"\\"NYC\\"}"}}]},"finish_reason":null}]}\n\n' +
      'data: {"choices":[{"index":0,"delta":{},"finish_reason":"tool_calls"}]}\n\n' +
      'data: [DONE]\n\n';
    const { transport } = captureTransport(makeSSE(sse));
    const p = new OpenAIProvider({ endpoint: '/x', transport });
    const events = [];
    for await (const evt of p.stream({ model: 'gpt-4', messages: [] })) events.push(evt);
    const start = events.find((e) => e.type === 'tool_call_start') as { id: string; name: string };
    const end = events.find((e) => e.type === 'tool_call_end') as { id: string; input: unknown };
    const stop = events.find((e) => e.type === 'message_stop') as { reason: string };
    expect(start.id).toBe('call_abc');
    expect(start.name).toBe('get_weather');
    expect(end.input).toEqual({ city: 'NYC' });
    expect(stop.reason).toBe('tool_use');
  });

  it('emits error on HTTP 4xx', async () => {
    const transport: Transport = {
      async request() {
        return {
          status: 401,
          headers: {},
          body: null,
          json: async () => ({}),
          text: async () => 'unauthorized',
        };
      },
    };
    const p = new OpenAIProvider({ endpoint: '/x', transport });
    const events = [];
    for await (const evt of p.stream({ model: 'gpt-4', messages: [] })) events.push(evt);
    expect(events[0].type).toBe('error');
    expect((events[0] as { error: Error }).error.message).toContain('OpenAI 401');
  });
});
