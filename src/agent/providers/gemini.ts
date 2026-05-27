// ══════════════════════════════════════════════════════════════════════════════
// GEMINI PROVIDER — maps streamGenerateContent SSE → normalized StreamEvent.
// Note: Gemini emits complete functionCall objects (not arg deltas) — we expose
// them as start → delta(full json) → end so consumers see a consistent shape.
// ══════════════════════════════════════════════════════════════════════════════

import type { ChatOptions, Provider, StreamEvent, ToolDefinition } from '../core/Provider';
import { parseSSE } from '../core/sse';
import { fetchTransport, type Transport } from '../core/Transport';
import type { ContentBlock, Message, StopReason } from '../core/types';

export interface GeminiProviderOptions {
  endpoint?: string;
  apiKey?: string;
  transport?: Transport;
  headers?: Record<string, string>;
}

const DEFAULT_BASE = 'https://generativelanguage.googleapis.com/v1beta';

interface GeminiPart {
  text?: string;
  functionCall?: { name?: string; args?: unknown };
}

interface GeminiChunk {
  candidates?: Array<{
    content?: { role?: string; parts?: GeminiPart[] };
    finishReason?: string;
  }>;
  usageMetadata?: { promptTokenCount?: number; candidatesTokenCount?: number };
  error?: { message?: string };
}

export class GeminiProvider implements Provider {
  readonly name = 'gemini';
  private readonly transport: Transport;

  constructor(private readonly opts: GeminiProviderOptions = {}) {
    this.transport = opts.transport ?? fetchTransport;
  }

  async *stream(opts: ChatOptions): AsyncGenerator<StreamEvent> {
    const headers: Record<string, string> = {
      'content-type': 'application/json',
      accept: 'text/event-stream',
      ...this.opts.headers,
    };

    const res = await this.transport.request({
      url: this.buildUrl(opts.model),
      method: 'POST',
      headers,
      body: JSON.stringify(serializeRequest(opts)),
      signal: opts.signal,
    });

    if (res.status >= 400) {
      const text = await res.text();
      yield { type: 'error', error: new Error(`Gemini ${res.status}: ${text}`) };
      return;
    }
    if (!res.body) {
      yield { type: 'error', error: new Error('Gemini: empty response body') };
      return;
    }

    let stopReason: StopReason = 'end_turn';
    let usage: { inputTokens?: number; outputTokens?: number } | undefined;
    let toolIdSeq = 0;

    for await (const msg of parseSSE(res.body)) {
      let chunk: GeminiChunk;
      try {
        chunk = JSON.parse(msg.data) as GeminiChunk;
      } catch {
        continue;
      }
      if (chunk.error) {
        yield { type: 'error', error: new Error(chunk.error.message ?? 'Gemini error') };
        return;
      }
      if (chunk.usageMetadata) {
        usage = {
          inputTokens: chunk.usageMetadata.promptTokenCount,
          outputTokens: chunk.usageMetadata.candidatesTokenCount,
        };
      }
      const candidate = chunk.candidates?.[0];
      if (!candidate) continue;

      for (const part of candidate.content?.parts ?? []) {
        if (typeof part.text === 'string' && part.text.length > 0) {
          yield { type: 'text_delta', text: part.text };
        } else if (part.functionCall?.name) {
          const id = `gemini_call_${toolIdSeq++}`;
          const argsJson = JSON.stringify(part.functionCall.args ?? {});
          yield { type: 'tool_call_start', id, name: part.functionCall.name };
          yield { type: 'tool_call_delta', id, argsDelta: argsJson };
          yield { type: 'tool_call_end', id, input: part.functionCall.args ?? {} };
        }
      }

      if (candidate.finishReason) {
        stopReason = mapStopReason(candidate.finishReason);
        yield { type: 'message_stop', reason: stopReason, usage };
        return;
      }
    }
  }

  private buildUrl(model: string): string {
    const base = this.opts.endpoint ?? DEFAULT_BASE;
    const path = `${base}/models/${model}:streamGenerateContent?alt=sse`;
    return this.opts.apiKey ? `${path}&key=${encodeURIComponent(this.opts.apiKey)}` : path;
  }
}

function mapStopReason(r: string): StopReason {
  switch (r) {
    case 'STOP':
      return 'end_turn';
    case 'MAX_TOKENS':
      return 'max_tokens';
    case 'SAFETY':
    case 'RECITATION':
      return 'stop_sequence';
    default:
      return 'end_turn';
  }
}

function serializeRequest(opts: ChatOptions) {
  return {
    contents: opts.messages.filter((m) => m.role !== 'system').map(serializeMessage),
    systemInstruction: opts.system ? { parts: [{ text: opts.system }] } : undefined,
    tools: opts.tools?.length
      ? [{ functionDeclarations: opts.tools.map(serializeTool) }]
      : undefined,
    generationConfig: {
      maxOutputTokens: opts.maxTokens,
      temperature: opts.temperature,
      topP: opts.topP,
      stopSequences: opts.stopSequences,
    },
  };
}

function serializeTool(t: ToolDefinition) {
  return {
    name: t.name,
    description: t.description,
    parameters: t.inputSchema,
  };
}

function serializeMessage(m: Message) {
  if (m.role === 'tool') {
    const blocks = Array.isArray(m.content) ? m.content : [];
    return {
      role: 'function',
      parts: blocks.flatMap((b) =>
        b.type === 'tool_result'
          ? [
              {
                functionResponse: {
                  name: b.name ?? '',
                  response:
                    typeof b.output === 'object' && b.output !== null
                      ? (b.output as Record<string, unknown>)
                      : { result: String(b.output) },
                },
              },
            ]
          : [],
      ),
    };
  }
  const role = m.role === 'assistant' ? 'model' : 'user';
  if (typeof m.content === 'string') {
    return { role, parts: [{ text: m.content }] };
  }
  return { role, parts: m.content.flatMap(serializePart) };
}

function serializePart(b: ContentBlock): unknown[] {
  if (b.type === 'text') return [{ text: b.text }];
  if (b.type === 'image') {
    if (b.source.kind === 'base64') {
      return [
        {
          inlineData: {
            mimeType: b.source.mediaType ?? 'image/png',
            data: b.source.data,
          },
        },
      ];
    }
    return [{ fileData: { fileUri: b.source.data, mimeType: b.source.mediaType } }];
  }
  if (b.type === 'tool_use') {
    return [{ functionCall: { name: b.name, args: b.input } }];
  }
  return [];
}
