// ══════════════════════════════════════════════════════════════════════════════
// VANILLA CONTROLLER (#13 base) — Framework-free state controller.
// All bindings (React, Vue, Svelte, Solid) sit on top of this.
// ══════════════════════════════════════════════════════════════════════════════

import { Agent, type AgentOptions } from '../core/Agent';
import { InMemoryStore } from '../core/Memory';
import type { Message } from '../core/types';

export interface AgentControllerState {
  messages: Message[];
  streamingText: string;
  isStreaming: boolean;
  error: Error | null;
}

export interface AgentController {
  getState(): AgentControllerState;
  subscribe(listener: (state: AgentControllerState) => void): () => void;
  send(text: string): Promise<void>;
  stop(): void;
  reset(): void;
  dispose(): void;
}

export function createAgentController(opts: AgentOptions): AgentController {
  const memory = opts.memory ?? new InMemoryStore();
  const agent = new Agent({ ...opts, memory });

  let state: AgentControllerState = {
    messages: [],
    streamingText: '',
    isStreaming: false,
    error: null,
  };
  const listeners = new Set<(s: AgentControllerState) => void>();
  let controller: AbortController | null = null;

  function setState(patch: Partial<AgentControllerState>): void {
    state = { ...state, ...patch };
    for (const l of listeners) l(state);
  }

  return {
    getState: () => state,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    async send(text: string) {
      if (!text.trim()) return;
      setState({
        error: null,
        streamingText: '',
        isStreaming: true,
        messages: [...state.messages, { role: 'user', content: text }],
      });
      controller = new AbortController();
      let buffer = '';
      try {
        for await (const evt of agent.run({ message: text, signal: controller.signal })) {
          if (evt.type === 'text_delta') {
            buffer += evt.text;
            setState({ streamingText: buffer });
          }
        }
        const all = await Promise.resolve(memory.all());
        setState({ messages: all, streamingText: '', isStreaming: false });
      } catch (e) {
        setState({
          error: e instanceof Error ? e : new Error(String(e)),
          isStreaming: false,
        });
      } finally {
        controller = null;
      }
    },
    stop() {
      controller?.abort();
    },
    reset() {
      void Promise.resolve(memory.clear());
      setState({ messages: [], streamingText: '', error: null });
    },
    dispose() {
      controller?.abort();
      listeners.clear();
    },
  };
}
