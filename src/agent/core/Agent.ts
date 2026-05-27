// ══════════════════════════════════════════════════════════════════════════════
// AGENT — Provider-agnostic loop:
//   stream provider → forward deltas → on tool_use: execute → append → loop
// All external concerns (model, transport, memory, observability) are injected
// as ports. Core has zero runtime dependencies.
// ══════════════════════════════════════════════════════════════════════════════

import type { AgentEvent } from './events';
import { InMemoryStore, type Memory } from './Memory';
import type { Middleware } from './Middleware';
import type { ChatOptions, Provider, ToolDefinition } from './Provider';
import type { Tool } from './Tool';
import type { ContentBlock, StopReason } from './types';

export interface AgentOptions {
  provider: Provider;
  model: string;
  system?: string;
  tools?: Tool[];
  memory?: Memory;
  middleware?: Middleware[];
  maxSteps?: number;
  maxTokens?: number;
  temperature?: number;
}

export interface AgentRunInput {
  message: string;
  signal?: AbortSignal;
}

export class Agent {
  private readonly memory: Memory;
  private readonly toolByName: Map<string, Tool>;
  private readonly toolDefs: ToolDefinition[];

  constructor(private readonly opts: AgentOptions) {
    this.memory = opts.memory ?? new InMemoryStore();
    this.toolByName = new Map((opts.tools ?? []).map((t) => [t.name, t]));
    this.toolDefs = (opts.tools ?? []).map((t) => ({
      name: t.name,
      description: t.description,
      inputSchema: t.inputSchema,
    }));
  }

  async *run(runInput: AgentRunInput): AsyncGenerator<AgentEvent> {
    const middleware = this.opts.middleware ?? [];
    const maxSteps = this.opts.maxSteps ?? 10;

    await Promise.resolve(
      this.memory.append({ role: 'user', content: runInput.message }),
    );

    for (let step = 0; step < maxSteps; step++) {
      const stepEvent: AgentEvent = { type: 'step_start', step };
      yield stepEvent;
      await emit(middleware, stepEvent);

      const messages = await Promise.resolve(this.memory.all());
      const assistantBlocks: ContentBlock[] = [];
      const toolCalls = new Map<string, { name: string; input: unknown }>();
      let currentText = '';
      let stopReason: StopReason = 'end_turn';

      const streamOpts: ChatOptions = {
        model: this.opts.model,
        messages,
        system: this.opts.system,
        tools: this.toolDefs.length ? this.toolDefs : undefined,
        maxTokens: this.opts.maxTokens,
        temperature: this.opts.temperature,
        signal: runInput.signal,
      };

      try {
        for await (const evt of this.opts.provider.stream(streamOpts)) {
          if (evt.type === 'text_delta') {
            currentText += evt.text;
            yield evt;
            await emit(middleware, evt);
          } else if (evt.type === 'tool_call_start') {
            if (currentText) {
              assistantBlocks.push({ type: 'text', text: currentText });
              currentText = '';
            }
            toolCalls.set(evt.id, { name: evt.name, input: undefined });
            yield evt;
            await emit(middleware, evt);
          } else if (evt.type === 'tool_call_delta') {
            yield evt;
            await emit(middleware, evt);
          } else if (evt.type === 'tool_call_end') {
            const tc = toolCalls.get(evt.id);
            if (tc) {
              tc.input = evt.input;
              assistantBlocks.push({
                type: 'tool_use',
                id: evt.id,
                name: tc.name,
                input: evt.input,
              });
            }
            yield evt;
            await emit(middleware, evt);
          } else if (evt.type === 'message_stop') {
            if (currentText) {
              assistantBlocks.push({ type: 'text', text: currentText });
              currentText = '';
            }
            stopReason = evt.reason;
            yield evt;
            await emit(middleware, evt);
          } else if (evt.type === 'error') {
            yield evt;
            await emit(middleware, evt);
            await emitError(middleware, evt.error);
            yield { type: 'done', reason: 'error' };
            return;
          }
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        const errEvent: AgentEvent = { type: 'error', error };
        yield errEvent;
        await emit(middleware, errEvent);
        await emitError(middleware, error);
        yield { type: 'done', reason: 'error' };
        return;
      }

      if (assistantBlocks.length > 0) {
        await Promise.resolve(
          this.memory.append({ role: 'assistant', content: assistantBlocks }),
        );
      }

      if (stopReason !== 'tool_use' || toolCalls.size === 0) {
        yield { type: 'done', reason: stopReason };
        return;
      }

      const toolResults: ContentBlock[] = [];
      for (const [id, { name, input }] of toolCalls) {
        const tool = this.toolByName.get(name);
        if (!tool) {
          const error = new Error(`Tool not registered: ${name}`);
          const errEvent: AgentEvent = { type: 'tool_error', id, name, error };
          yield errEvent;
          await emit(middleware, errEvent);
          toolResults.push({
            type: 'tool_result',
            toolUseId: id,
            output: `Error: tool '${name}' is not registered`,
            isError: true,
          });
          continue;
        }
        try {
          const parsed = tool.parse ? tool.parse(input) : input;
          const output = await tool.execute(parsed, {
            signal: runInput.signal,
            messages: await Promise.resolve(this.memory.all()),
          });
          const resultEvent: AgentEvent = { type: 'tool_result', id, name, output };
          yield resultEvent;
          await emit(middleware, resultEvent);
          toolResults.push({ type: 'tool_result', toolUseId: id, name, output });
        } catch (err) {
          const error = err instanceof Error ? err : new Error(String(err));
          const errEvent: AgentEvent = { type: 'tool_error', id, name, error };
          yield errEvent;
          await emit(middleware, errEvent);
          await emitError(middleware, error);
          toolResults.push({
            type: 'tool_result',
            toolUseId: id,
            output: error.message,
            isError: true,
          });
        }
      }

      await Promise.resolve(
        this.memory.append({ role: 'tool', content: toolResults }),
      );
    }

    yield { type: 'done', reason: 'max_tokens' };
  }
}

export function createAgent(opts: AgentOptions): Agent {
  return new Agent(opts);
}

async function emit(middleware: Middleware[], event: AgentEvent): Promise<void> {
  for (const m of middleware) {
    if (!m.onEvent) continue;
    try {
      await m.onEvent(event);
    } catch {
      /* observer errors don't break the loop */
    }
  }
}

async function emitError(middleware: Middleware[], error: Error): Promise<void> {
  for (const m of middleware) {
    if (!m.onError) continue;
    try {
      await m.onError(error);
    } catch {
      /* observer errors don't break the loop */
    }
  }
}
