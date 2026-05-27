// ══════════════════════════════════════════════════════════════════════════════
// OLLAMA PROVIDER — local models via /api/chat. NDJSON stream (not SSE).
// Ollama emits complete tool calls (not arg deltas) — exposed as start → delta → end.
// ══════════════════════════════════════════════════════════════════════════════

import type { ChatOptions, Provider, StreamEvent, ToolDefinition } from '../core/Provider';
import { fetchTransport, type Transport } from '../core/Transport';
import type { ContentBlock, Message, StopReason } from '../core/types';

export interface OllamaProviderOptions {
  endpoint?: string;
  transport?: Transport;
  headers?: Record<string, string>;
}

const DEFAULT_ENDPOINT = 'http://localhost:11434/api/chat';

interface OllamaChunk {
  message?: {
    role?: string;
    content?: string;
    tool_calls?: Array<{ function?: { name?: string; arguments?: unknown } }>;
  };
  done?: boolean;
  done_reason?: string;
  prompt_eval_count?: number;
  eval_count?: number;
  error?: string;
}

export class OllamaProvider implements Provider {
  readonly name = 'ollama';
  private readonly transport: Transport;

  constructor(private readonly opts: OllamaProviderOptions = {}) {
    this.transport = opts.transport ?? fetchTransport;
  }

  async *stream(opts: ChatOptions): AsyncGenerator<StreamEvent> {
    const headers: Record<string, string> = {
      'content-type': 'application/json',
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
      yield { type: 'error', error: new Error(`Ollama ${res.status}: ${text}`) };
      return;
    }
    if (!res.body) {
      yield { type: 'error', error: new Error('Ollama: empty response body') };
      return;
    }

    let stopReason: StopReason = 'end_turn';
    let usage: { inputTokens?: number; outputTokens?: number } | undefined;
    let toolSeq = 0;
    let hadToolCalls = false;

    for await (const line of parseNDJSON(res.body)) {
      let chunk: OllamaChunk;
      try {
        chunk = JSON.parse(line) as OllamaChunk;
      } catch {
        continue;
      }
      if (chunk.error) {
        yield { type: 'error', error: new Error(chunk.error) };
        return;
      }
      if (typeof chunk.prompt_eval_count === 'number' || typeof chunk.eval_count === 'number') {
        usage = {
          inputTokens: chunk.prompt_eval_count,
          outputTokens: chunk.eval_count,
        };
      }

      const msg = chunk.message;
      if (msg?.content) {
        yield { type: 'text_delta', text: msg.content };
      }
      if (msg?.tool_calls?.length) {
        hadToolCalls = true;
        for (const tc of msg.tool_calls) {
          const name = tc.function?.name;
          if (!name) continue;
          const args = tc.function?.arguments ?? {};
          const id = `ollama_call_${toolSeq++}`;
          yield { type: 'tool_call_start', id, name };
          yield { type: 'tool_call_delta', id, argsDelta: JSON.stringify(args) };
          yield { type: 'tool_call_end', id, input: args };
        }
      }

      if (chunk.done) {
        if (hadToolCalls) stopReason = 'tool_use';
        else if (chunk.done_reason === 'length') stopReason = 'max_tokens';
        else stopReason = 'end_turn';
        yield { type: 'message_stop', reason: stopReason, usage };
        return;
      }
    }
  }
}

async function* parseNDJSON(stream: ReadableStream<Uint8Array>): AsyncGenerator<string> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      let nl = buffer.indexOf('\n');
      while (nl !== -1) {
        const line = buffer.slice(0, nl).trim();
        buffer = buffer.slice(nl + 1);
        if (line) yield line;
        nl = buffer.indexOf('\n');
      }
    }
    if (buffer.trim()) yield buffer.trim();
  } finally {
    reader.releaseLock();
  }
}

function serializeRequest(opts: ChatOptions) {
  const messages: unknown[] = [];
  if (opts.system) messages.push({ role: 'system', content: opts.system });
  for (const m of opts.messages) {
    if (m.role === 'tool') {
      const blocks = Array.isArray(m.content) ? m.content : [];
      for (const b of blocks) {
        if (b.type === 'tool_result') {
          messages.push({
            role: 'tool',
            content: typeof b.output === 'string' ? b.output : JSON.stringify(b.output),
          });
        }
      }
    } else if (typeof m.content === 'string') {
      messages.push({ role: m.role, content: m.content });
    } else {
      const text = m.content
        .filter((b): b is Extract<ContentBlock, { type: 'text' }> => b.type === 'text')
        .map((b) => b.text)
        .join('');
      const toolCalls = m.content.filter(
        (b): b is Extract<ContentBlock, { type: 'tool_use' }> => b.type === 'tool_use',
      );
      const out: { role: string; content: string; tool_calls?: unknown[] } = {
        role: m.role,
        content: text,
      };
      if (toolCalls.length) {
        out.tool_calls = toolCalls.map((tc) => ({
          function: { name: tc.name, arguments: tc.input },
        }));
      }
      messages.push(out);
    }
  }
  return {
    model: opts.model,
    messages,
    tools: opts.tools?.map(serializeTool),
    stream: true,
    options: {
      temperature: opts.temperature,
      top_p: opts.topP,
      num_predict: opts.maxTokens,
      stop: opts.stopSequences,
    },
  };
}

function serializeTool(t: ToolDefinition) {
  return {
    type: 'function',
    function: {
      name: t.name,
      description: t.description,
      parameters: t.inputSchema,
    },
  };
}
