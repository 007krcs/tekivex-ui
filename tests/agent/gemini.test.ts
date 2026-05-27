import { describe, expect, it } from 'vitest';
import { GeminiProvider } from '../../src/agent/providers/gemini';
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

describe('GeminiProvider', () => {
  it('builds the streamGenerateContent URL and appends key', async () => {
    const { transport, captured } = captureTransport(
      makeSSE('data: {"candidates":[{"finishReason":"STOP"}]}\n\n'),
    );
    const p = new GeminiProvider({ transport, apiKey: 'k123' });
    for await (const _ of p.stream({ model: 'gemini-2', messages: [] })) {
      /* drain */
    }
    expect(captured[0].url).toContain('models/gemini-2:streamGenerateContent');
    expect(captured[0].url).toContain('alt=sse');
    expect(captured[0].url).toContain('key=k123');
  });

  it('serializes system as systemInstruction', async () => {
    const { transport, captured } = captureTransport(
      makeSSE('data: {"candidates":[{"finishReason":"STOP"}]}\n\n'),
    );
    const p = new GeminiProvider({ transport });
    for await (const _ of p.stream({
      model: 'gemini-2',
      messages: [{ role: 'user', content: 'hi' }],
      system: 'be helpful',
    })) {
      /* drain */
    }
    const body = JSON.parse(captured[0].body as string);
    expect(body.systemInstruction).toEqual({ parts: [{ text: 'be helpful' }] });
    expect(body.contents[0]).toEqual({ role: 'user', parts: [{ text: 'hi' }] });
  });

  it('maps text parts to text_delta', async () => {
    const sse =
      'data: {"candidates":[{"content":{"role":"model","parts":[{"text":"hello"}]}}]}\n\n' +
      'data: {"candidates":[{"content":{"role":"model","parts":[{"text":" world"}]},"finishReason":"STOP"}]}\n\n';
    const { transport } = captureTransport(makeSSE(sse));
    const p = new GeminiProvider({ transport });
    const events = [];
    for await (const evt of p.stream({ model: 'gemini-2', messages: [] })) events.push(evt);
    const texts = events.filter((e) => e.type === 'text_delta').map((e) => (e as { text: string }).text);
    expect(texts.join('')).toBe('hello world');
    const stop = events.find((e) => e.type === 'message_stop') as { reason: string };
    expect(stop.reason).toBe('end_turn');
  });

  it('maps functionCall part to tool_call start/end with full args', async () => {
    const sse =
      'data: {"candidates":[{"content":{"role":"model","parts":[{"functionCall":{"name":"get_weather","args":{"city":"Paris"}}}]},"finishReason":"STOP"}]}\n\n';
    const { transport } = captureTransport(makeSSE(sse));
    const p = new GeminiProvider({ transport });
    const events = [];
    for await (const evt of p.stream({ model: 'gemini-2', messages: [] })) events.push(evt);
    const start = events.find((e) => e.type === 'tool_call_start') as { name: string };
    const end = events.find((e) => e.type === 'tool_call_end') as { input: unknown };
    expect(start.name).toBe('get_weather');
    expect(end.input).toEqual({ city: 'Paris' });
  });

  it('maps MAX_TOKENS finishReason', async () => {
    const sse = 'data: {"candidates":[{"finishReason":"MAX_TOKENS"}]}\n\n';
    const { transport } = captureTransport(makeSSE(sse));
    const p = new GeminiProvider({ transport });
    const events = [];
    for await (const evt of p.stream({ model: 'gemini-2', messages: [] })) events.push(evt);
    const stop = events.find((e) => e.type === 'message_stop') as { reason: string };
    expect(stop.reason).toBe('max_tokens');
  });
});
