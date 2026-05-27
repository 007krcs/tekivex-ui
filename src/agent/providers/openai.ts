// ══════════════════════════════════════════════════════════════════════════════
// OPENAI PROVIDER — maps Chat Completions API SSE → normalized StreamEvent.
// ══════════════════════════════════════════════════════════════════════════════

import type { ChatOptions, Provider, StreamEvent, ToolDefinition } from '../core/Provider';
import { parseSSE } from '../core/sse';
import { fetchTransport, type Transport } from '../core/Transport';
import type { ContentBlock, Message, StopReason } from '../core/types';

export interface OpenAIProviderOptions {
  endpoint?: string;
  apiKey?: string;
  organization?: string;
  transport?: Transport;
  headers?: Record<string, string>;
}

const DEFAULT_ENDPOINT = 'https://api.openai.com/v1/chat/completions';

interface OpenAIChunk {
  choices?: Array<{
    index?: number;
    delta?: {
      role?: string;
      content?: string | null;
      tool_calls?: Array<{
        index: number;
        id?: string;
        type?: 'function';
        function?: { name?: string; arguments?: string };
      }>;
    };
    finish_reason?: string | null;
  }>;
  usage?: { prompt_tokens?: number; completion_tokens?: number };
  error?: { message?: string };
}

export class OpenAIProvider implements Provider {
  readonly name = 'openai';
  private readonly transport: Transport;

  constructor(private readonly opts: OpenAIProviderOptions = {}) {
    this.transport = opts.transport ?? fetchTransport;
  }

  async *stream(opts: ChatOptions): AsyncGenerator<StreamEvent> {
    const headers: Record<string, string> = {
      'content-type': 'application/json',
      accept: 'text/event-stream',
      ...(this.opts.apiKey ? { authorization: `Bearer ${this.opts.apiKey}` } : {}),
      ...(this.opts.organization ? { 'openai-organization': this.opts.organization } : {}),
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
      yield { type: 'error', error: new Error(`OpenAI ${res.status}: ${text}`) };
      return;
    }
    if (!res.body) {
      yield { type: 'error', error: new Error('OpenAI: empty response body') };
      return;
    }

    interface ToolAccum {
      id: string;
      name: string;
      args: string;
      started: boolean;
    }
    const toolCalls = new Map<number, ToolAccum>();
    let stopReason: StopReason = 'end_turn';
    let usage: { inputTokens?: number; outputTokens?: number } | undefined;

    for await (const msg of parseSSE(res.body)) {
      if (msg.data === '[DONE]') break;
      let chunk: OpenAIChunk;
      try {
        chunk = JSON.parse(msg.data) as OpenAIChunk;
      } catch {
        continue;
      }
      if (chunk.error) {
        yield { type: 'error', error: new Error(chunk.error.message ?? 'OpenAI error') };
        return;
      }
      if (chunk.usage) {
        usage = {
          inputTokens: chunk.usage.prompt_tokens,
          outputTokens: chunk.usage.completion_tokens,
        };
      }
      const choice = chunk.choices?.[0];
      if (!choice) continue;

      if (choice.delta?.content) {
        yield { type: 'text_delta', text: choice.delta.content };
      }

      if (choice.delta?.tool_calls) {
        for (const tc of choice.delta.tool_calls) {
          let entry = toolCalls.get(tc.index);
          if (!entry) {
            entry = { id: tc.id ?? `tool_${tc.index}`, name: '', args: '', started: false };
            toolCalls.set(tc.index, entry);
          }
          if (tc.id) entry.id = tc.id;
          if (tc.function?.name) entry.name = tc.function.name;
          if (!entry.started && entry.id && entry.name) {
            yield { type: 'tool_call_start', id: entry.id, name: entry.name };
            entry.started = true;
          }
          if (tc.function?.arguments) {
            entry.args += tc.function.arguments;
            if (entry.started) {
              yield { type: 'tool_call_delta', id: entry.id, argsDelta: tc.function.arguments };
            }
          }
        }
      }

      if (choice.finish_reason) {
        for (const entry of toolCalls.values()) {
          let input: unknown = {};
          if (entry.args) {
            try {
              input = JSON.parse(entry.args);
            } catch {
              input = entry.args;
            }
          }
          yield { type: 'tool_call_end', id: entry.id, input };
        }
        stopReason = mapStopReason(choice.finish_reason);
        yield { type: 'message_stop', reason: stopReason, usage };
        return;
      }
    }
  }
}

function mapStopReason(r: string): StopReason {
  switch (r) {
    case 'stop':
      return 'end_turn';
    case 'tool_calls':
    case 'function_call':
      return 'tool_use';
    case 'length':
      return 'max_tokens';
    case 'content_filter':
      return 'stop_sequence';
    default:
      return 'end_turn';
  }
}

function serializeRequest(opts: ChatOptions) {
  const messages: unknown[] = [];
  if (opts.system) messages.push({ role: 'system', content: opts.system });

  for (const m of opts.messages) {
    if (m.role === 'system') {
      messages.push({ role: 'system', content: stringContent(m.content) });
    } else if (m.role === 'tool') {
      const blocks = Array.isArray(m.content) ? m.content : [];
      for (const b of blocks) {
        if (b.type === 'tool_result') {
          messages.push({
            role: 'tool',
            tool_call_id: b.toolUseId,
            content: typeof b.output === 'string' ? b.output : JSON.stringify(b.output),
          });
        }
      }
    } else if (m.role === 'assistant') {
      messages.push(serializeAssistant(m));
    } else {
      messages.push({ role: 'user', content: serializeUserContent(m.content) });
    }
  }

  return {
    model: opts.model,
    messages,
    tools: opts.tools?.map(serializeTool),
    max_tokens: opts.maxTokens,
    temperature: opts.temperature,
    top_p: opts.topP,
    stop: opts.stopSequences,
    stream: true,
  };
}

function serializeTool(t: ToolDefinition) {
  return {
    type: 'function' as const,
    function: { name: t.name, description: t.description, parameters: t.inputSchema },
  };
}

function serializeAssistant(m: Message) {
  if (typeof m.content === 'string') {
    return { role: 'assistant', content: m.content };
  }
  const texts: string[] = [];
  const toolCalls: unknown[] = [];
  for (const b of m.content) {
    if (b.type === 'text') texts.push(b.text);
    else if (b.type === 'tool_use') {
      toolCalls.push({
        id: b.id,
        type: 'function',
        function: { name: b.name, arguments: JSON.stringify(b.input) },
      });
    }
  }
  const out: { role: string; content: string | null; tool_calls?: unknown[] } = {
    role: 'assistant',
    content: texts.length ? texts.join('') : null,
  };
  if (toolCalls.length) out.tool_calls = toolCalls;
  return out;
}

function stringContent(c: string | ContentBlock[]): string {
  if (typeof c === 'string') return c;
  return c.filter((b): b is Extract<ContentBlock, { type: 'text' }> => b.type === 'text')
    .map((b) => b.text)
    .join('');
}

function serializeUserContent(c: string | ContentBlock[]): unknown {
  if (typeof c === 'string') return c;
  const parts: unknown[] = [];
  for (const b of c) {
    if (b.type === 'text') parts.push({ type: 'text', text: b.text });
    else if (b.type === 'image') {
      const url =
        b.source.kind === 'base64'
          ? `data:${b.source.mediaType ?? 'image/png'};base64,${b.source.data}`
          : b.source.data;
      parts.push({ type: 'image_url', image_url: { url } });
    }
  }
  return parts;
}
