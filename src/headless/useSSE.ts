'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export interface SSEOptions {
  url: string;
  events?: string[];
  withCredentials?: boolean;
  reconnect?: boolean;
  reconnectDelay?: number;
  onOpen?: () => void;
  onError?: (error: Event) => void;
}

export interface SSEState<T = unknown> {
  status: 'connecting' | 'connected' | 'error' | 'closed';
  lastEvent: { type: string; data: T; id?: string } | null;
  events: Array<{ type: string; data: T; id?: string; timestamp: number }>;
  connect: () => void;
  disconnect: () => void;
  eventCount: number;
}

/**
 * Headless Server-Sent Events hook supporting multiple named event types,
 * auto-reconnect, and JSON auto-parsing.
 *
 * @example
 * const sse = useSSE({ url: '/api/stream', events: ['update', 'notification'] });
 * console.log(sse.lastEvent);
 */
export function useSSE<T = unknown>(options: SSEOptions): SSEState<T> {
  const {
    url,
    events = ['message'],
    withCredentials = false,
    reconnect = true,
    reconnectDelay = 3000,
    onOpen,
    onError,
  } = options;

  const [status, setStatus] = useState<SSEState<T>['status']>('connecting');
  const [lastEvent, setLastEvent] = useState<SSEState<T>['lastEvent']>(null);
  const [eventList, setEventList] = useState<SSEState<T>['events']>([]);
  const [eventCount, setEventCount] = useState(0);

  const esRef = useRef<EventSource | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);
  const manualCloseRef = useRef(false);

  const onOpenRef = useRef(onOpen);
  const onErrorRef = useRef(onError);
  onOpenRef.current = onOpen;
  onErrorRef.current = onError;

  const clearReconnectTimer = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
  }, []);

  const connect = useCallback(() => {
    if (typeof EventSource === 'undefined') {
      if (mountedRef.current) setStatus('error');
      return;
    }

    manualCloseRef.current = false;
    clearReconnectTimer();

    if (esRef.current) {
      esRef.current.close();
      esRef.current = null;
    }

    if (mountedRef.current) setStatus('connecting');

    const es = new EventSource(url, { withCredentials });
    esRef.current = es;

    es.onopen = () => {
      if (!mountedRef.current) return;
      setStatus('connected');
      onOpenRef.current?.();
    };

    es.onerror = (event) => {
      if (!mountedRef.current) return;
      setStatus('error');
      onErrorRef.current?.(event);

      if (!manualCloseRef.current && reconnect) {
        clearReconnectTimer();
        reconnectTimerRef.current = setTimeout(() => {
          if (mountedRef.current) connect();
        }, reconnectDelay);
      }
    };

    const handleEvent = (type: string) => (raw: MessageEvent) => {
      if (!mountedRef.current) return;

      let parsed: T;
      try {
        parsed = JSON.parse(raw.data as string) as T;
      } catch {
        parsed = raw.data as unknown as T;
      }

      const entry: SSEState<T>['events'][number] = {
        type,
        data: parsed,
        timestamp: Date.now(),
        ...(raw.lastEventId ? { id: raw.lastEventId } : {}),
      };

      setLastEvent({ type: entry.type, data: entry.data, id: entry.id });
      setEventList(prev => {
        const next = [...prev, entry];
        return next.length > 200 ? next.slice(next.length - 200) : next;
      });
      setEventCount(c => c + 1);
    };

    for (const eventType of events) {
      es.addEventListener(eventType, handleEvent(eventType) as EventListener);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, withCredentials, reconnect, reconnectDelay, clearReconnectTimer]);

  const disconnect = useCallback(() => {
    manualCloseRef.current = true;
    clearReconnectTimer();
    if (esRef.current) {
      esRef.current.close();
      esRef.current = null;
    }
    if (mountedRef.current) setStatus('closed');
  }, [clearReconnectTimer]);

  useEffect(() => {
    mountedRef.current = true;
    connect();
    return () => {
      mountedRef.current = false;
      manualCloseRef.current = true;
      clearReconnectTimer();
      if (esRef.current) {
        esRef.current.close();
        esRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    status,
    lastEvent,
    events: eventList,
    connect,
    disconnect,
    eventCount,
  };
}