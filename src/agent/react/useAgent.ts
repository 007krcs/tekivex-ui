'use client';

// ══════════════════════════════════════════════════════════════════════════════
// useAgent — React hook that drives an Agent and exposes streaming state.
// ══════════════════════════════════════════════════════════════════════════════

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Agent, type AgentOptions } from '../core/Agent';
import { InMemoryStore } from '../core/Memory';
import type { Message } from '../core/types';

export interface UseAgentReturn {
  messages: Message[];
  streamingText: string;
  isStreaming: boolean;
  error: Error | null;
  send(text: string): Promise<void>;
  stop(): void;
  reset(): void;
}

export function useAgent(opts: AgentOptions): UseAgentReturn {
  const memoryRef = useRef(opts.memory ?? new InMemoryStore());

  const agent = useMemo(
    () => new Agent({ ...opts, memory: memoryRef.current }),
    // Re-construct only when the provider or model identity changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [opts.provider, opts.model],
  );

  const [messages, setMessages] = useState<Message[]>([]);
  const [streamingText, setStreamingText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const send = useCallback(
    async (text: string) => {
      if (!text.trim()) return;
      setError(null);
      setStreamingText('');
      setIsStreaming(true);

      const controller = new AbortController();
      abortRef.current = controller;
      setMessages((prev) => [...prev, { role: 'user', content: text }]);

      let buffer = '';
      try {
        for await (const evt of agent.run({ message: text, signal: controller.signal })) {
          if (evt.type === 'text_delta') {
            buffer += evt.text;
            setStreamingText(buffer);
          }
        }
        const all = await Promise.resolve(memoryRef.current.all());
        setMessages(all);
        setStreamingText('');
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [agent],
  );

  const stop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const reset = useCallback(() => {
    void Promise.resolve(memoryRef.current.clear());
    setMessages([]);
    setStreamingText('');
    setError(null);
  }, []);

  useEffect(() => () => abortRef.current?.abort(), []);

  return { messages, streamingText, isStreaming, error, send, stop, reset };
}
