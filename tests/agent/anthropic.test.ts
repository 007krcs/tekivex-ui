import { describe, expect, it } from 'vitest';
import { AnthropicProvider } from '../../src/agent/providers/anthropic';
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
  const transport: Transport = {
    async request(req) {
      captured.push(req);
      return response;
    },
  };
  return { transport, captured };
}

describe('AnthropicProvider', () => {
  it('sets anthropic-version header', async () => {
    const { transport, captured } = captureTransport(
      makeSSE('data: {"type":"message_stop"}\n\n'),
    );
    const p = new AnthropicProvider({
      endpoint: '/x',
      transport,
      apiVersion: '2024-01-01',
    });
    for await (const _ of p.stream({ model: 'm', messages: [] })) {
      /* drain */
    }
    expect(captured[0].headers!['anthropic-version']).toBe('2024-01-01');
  });

  it('serializes system as top-level field', async () => {
    const { transport, captured } = captureTransport(
      makeSSE('data: {"type":"message_stop"}\n\n'),
    );
    const p = new AnthropicProvider({ endpoint: '/x', transport });
    for await (const _ of p.stream({
      model: 'm',
      messages: [{ role: 'user', content: 'hi' }],
      system: 'be helpful',
    })) {
      /* drain */
    }
    const body = JSON.parse(captured[0].body as string);
    expect(body.system).toBe('be helpful');
    expect(body.stream).toBe(true);
    expect(body.messages[0]).toEqual({ role: 'user', content: 'hi' });
  });

  it('maps content_block_delta text → text_delta event', async () => {
    const sse =
      'event: content_block_delta\ndata: {"type":"content_block_delta","index":0,"delta":{"type":"text_delta","text":"hello"}}\n\n' +
      'event: message_stop\ndata: {"type":"message_stop"}\n\n';
    const { transport } = captureTransport(makeSSE(sse));
    const p = new AnthropicProvider({ endpoint: '/x', transport });
    const events = [];
    for await (const evt of p.stream({ model: 'm', messages: [] })) events.push(evt);
    expect(events[0]).toEqual({ type: 'text_delta', text: 'hello' });
    expect(events[1].type).toBe('message_stop');
  });

  it('maps tool_use content_block → tool_call_start / end events', async () => {
    const sse =
      'event: content_block_start\ndata: {"type":"content_block_start","index":0,"content_block":{"type":"tool_use","id":"call_1","name":"get_weather"}}\n\n' +
      'event: content_block_delta\ndata: {"type":"content_block_delta","index":0,"delta":{"type":"input_json_delta","partial_json":"{\\"city\\":\\"Tokyo\\"}"}}\n\n' +
      'event: content_block_stop\ndata: {"type":"content_block_stop","index":0}\n\n' +
      'event: message_delta\ndata: {"type":"message_delta","delta":{"stop_reason":"tool_use"}}\n\n' +
      'event: message_stop\ndata: {"type":"message_stop"}\n\n';
    const { transport } = captureTransport(makeSSE(sse));
    const p = new AnthropicProvider({ endpoint: '/x', transport });
    const events = [];
    for await (const evt of p.stream({ model: 'm', messages: [] })) events.push(evt);
    const types = events.map((e) => e.type);
    expect(types).toContain('tool_call_start');
    expect(types).toContain('tool_call_delta');
    expect(types).toContain('tool_call_end');
    const stopEvt = events.find((e) => e.type === 'message_stop') as { reason: string };
    expect(stopEvt.reason).toBe('tool_use');
    const endEvt = events.find((e) => e.type === 'tool_call_end') as { input: unknown };
    expect(endEvt.input).toEqual({ city: 'Tokyo' });
  });

  it('emits error event on HTTP 4xx', async () => {
    const transport: Transport = {
      async request() {
        return {
          status: 400,
          headers: {},
          body: null,
          json: async () => ({}),
          text: async () => 'bad request',
        };
      },
    };
    const p = new AnthropicProvider({ endpoint: '/x', transport });
    const events = [];
    for await (const evt of p.stream({ model: 'm', messages: [] })) events.push(evt);
    expect(events[0].type).toBe('error');
    expect((events[0] as { error: Error }).error.message).toContain('Anthropic 400');
  });
});
