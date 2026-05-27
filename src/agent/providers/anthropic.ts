// ══════════════════════════════════════════════════════════════════════════════
// ANTHROPIC PROVIDER — maps Messages API SSE → normalized StreamEvent.
// Uses the injected Transport (no direct fetch). In the browser, point endpoint
// at your proxy — never put `apiKey` in a bundled web build.
// ══════════════════════════════════════════════════════════════════════════════

import type { ChatOptions, Provider, StreamEvent, ToolDefinition } from '../core/Provider';
import { parseSSE } from '../core/sse';
import { fetchTransport, type Transport } from '../core/Transport';
import type { ContentBlock, Message, StopReason } from '../core/types';

export interface AnthropicProviderOptions {
  endpoint?: string;
  apiKey?: string;
  apiVersion?: string;
  transport?: Transport;
  headers?: Record<string, string>;
}

const DEFAULT_ENDPOINT = 'https://api.anthropic.com/v1/messages';
const DEFAULT_VERSION = '2023-06-01';

interface AnthropicEvent {
  type?: string;
  index?: number;
  content_block?: { type?: string; id?: string; name?: string };
  delta?: {
    type?: string;
    text?: string;
    partial_json?: string;
    stop_reason?: string;
  };
  usage?: { input_tokens?: number; output_tokens?: number };
  error?: { message?: string };
}

export class AnthropicProvider implements Provider {
  readonly name = 'anthropic';
  private readonly transport: Transport;

  constructor(private readonly opts: AnthropicProviderOptions = {}) {
    this.transport = opts.transport ?? fetchTransport;
  }

  async *stream(opts: ChatOptions): AsyncGenerator<StreamEvent> {
    const headers: Record<string, string> = {
      'content-type': 'application/json',
      'accept': 'text/event-stream',
      'anthropic-version': this.opts.apiVersion ?? DEFAULT_VERSION,
      ...(this.opts.apiKey ? { 'x-api-key': this.opts.apiKey } : {}),
      ...this.opts.headers,
    };

    const res = await this.transport.request({
      url: this.opts.endpoint ?? DEFAULT_ENDPOINT,
      method: 'POST',
      headers,
      body: JSON.stringify(serializeRequest(opts)),
      signal: opts.signal,
    });

    if (res.status >= 400) {
      const text = await res.text();
      yield { type: 'error', error: new Error(`Anthropic ${res.status}: ${text}`) };
      return;
    }
    if (!res.body) {
      yield { type: 'error', error: new Error('Anthropic: empty response body') };
      return;
    }

    const toolAccum = new Map<number, { id: string; name: string; json: string }>();
    let stopReason: StopReason = 'end_turn';
    let usage: { inputTokens?: number; outputTokens?: number } | undefined;

    for await (const msg of parseSSE(res.body)) {
      let payload: AnthropicEvent;
      try {
        payload = JSON.parse(msg.data) as AnthropicEvent;
      } catch {
        continue;
      }
      const type = payload.type ?? msg.event;
      const index = payload.index ?? 0;

      if (type === 'content_block_start') {
        const block = payload.content_block;
        if (block?.type === 'tool_use' && block.id && block.name) {
          toolAccum.set(index, { id: block.id, name: block.name, json: '' });
          yield { type: 'tool_call_start', id: block.id, name: block.name };
        }
      } else if (type === 'content_block_delta') {
        const delta = payload.delta;
        if (delta?.type === 'text_delta' && typeof delta.text === 'string') {
          yield { type: 'text_delta', text: delta.text };
        } else if (delta?.type === 'input_json_delta' && typeof delta.partial_json === 'string') {
          const acc = toolAccum.get(index);
          if (acc) {
            acc.json += delta.partial_json;
            yield { type: 'tool_call_delta', id: acc.id, argsDelta: delta.partial_json };
          }
        }
      } else if (type === 'content_block_stop') {
        const acc = toolAccum.get(index);
        if (acc) {
          let input: unknown = {};
          if (acc.json) {
            try {
              input = JSON.parse(acc.json);
            } catch (err) {
              yield { type: 'error', error: err as Error };
              return;
            }
          }
          yield { type: 'tool_call_end', id: acc.id, input };
          toolAccum.delete(index);
        }
      } else if (type === 'message_delta') {
        if (payload.delta?.stop_reason) {
          stopReason = mapStopReason(payload.delta.stop_reason);
        }
        if (payload.usage) {
          usage = {
            inputTokens: payload.usage.input_tokens,
            outputTokens: payload.usage.output_tokens,
          };
        }
      } else if (type === 'message_stop') {
        yield { type: 'message_stop', reason: stopReason, usage };
        return;
      } else if (type === 'error') {
        yield {
          type: 'error',
          error: new Error(payload.error?.message ?? 'Anthropic stream error'),
        };
        return;
      }
    }
  }
}

function mapStopReason(r: string): StopReason {
  switch (r) {
    case 'end_turn':
    case 'tool_use':
    case 'max_tokens':
    case 'stop_sequence':
      return r;
    default:
      return 'end_turn';
  }
}

function serializeRequest(opts: ChatOptions) {
  return {
    model: opts.model,
    max_tokens: opts.maxTokens ?? 4096,
    system: opts.system,
    messages: opts.messages.filter((m) => m.role !== 'system').map(serializeMessage),
    tools: opts.tools?.map(serializeTool),
    temperature: opts.temperature,
    top_p: opts.topP,
    stop_sequences: opts.stopSequences,
    stream: true,
  };
}

function serializeTool(t: ToolDefinition) {
  return {
    name: t.name,
    description: t.description,
    input_schema: t.inputSchema,
  };
}

function serializeMessage(m: Message) {
  if (m.role === 'tool') {
    const blocks = Array.isArray(m.content) ? m.content : [];
    return { role: 'user' as const, content: blocks.map(serializeContentBlock) };
  }
  if (typeof m.content === 'string') {
    return { role: m.role as 'user' | 'assistant', content: m.content };
  }
  return {
    role: m.role as 'user' | 'assistant',
    content: m.content.map(serializeContentBlock),
  };
}

function serializeContentBlock(b: ContentBlock) {
  switch (b.type) {
    case 'text':
      return b.cacheControl
        ? { type: 'text', text: b.text, cache_control: b.cacheControl }
        : { type: 'text', text: b.text };
    case 'image':
      return {
        type: 'image',
        source:
          b.source.kind === 'base64'
            ? {
                type: 'base64',
                media_type: b.source.mediaType ?? 'image/png',
                data: b.source.data,
              }
            : { type: 'url', url: b.source.data },
      };
    case 'tool_use':
      return { type: 'tool_use', id: b.id, name: b.name, input: b.input };
    case 'tool_result':
      return {
        type: 'tool_result',
        tool_use_id: b.toolUseId,
        content: typeof b.output === 'string' ? b.output : JSON.stringify(b.output),
        is_error: b.isError,
      };
  }
}
