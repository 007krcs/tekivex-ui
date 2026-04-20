'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export interface WebSocketOptions {
  url: string;
  protocols?: string | string[];
  reconnect?: boolean;
  reconnectDelay?: number;
  reconnectAttempts?: number;
  heartbeatInterval?: number;
  heartbeatMessage?: string;
  onOpen?: (event: Event) => void;
  onClose?: (event: CloseEvent) => void;
  onError?: (event: Event) => void;
  onMessage?: (data: unknown) => void;
}

export interface WebSocketState<T = unknown> {
  status: 'connecting' | 'connected' | 'disconnected' | 'error';
  lastMessage: T | null;
  messages: T[];
  send: (data: string | object) => void;
  connect: () => void;
  disconnect: () => void;
  reconnectCount: number;
  latency: number | null;
}

/**
 * Headless WebSocket hook with auto-reconnect, heartbeat, latency tracking,
 * and a send queue that flushes on connect.
 *
 * @example
 * const ws = useWebSocket({ url: 'wss://example.com/ws' });
 * ws.send({ type: 'subscribe', channel: 'updates' });
 */
export function useWebSocket<T = unknown>(options: WebSocketOptions): WebSocketState<T> {
  const {
    url,
    protocols,
    reconnect = true,
    reconnectDelay = 1000,
    reconnectAttempts = 10,
    heartbeatInterval = 30000,
    heartbeatMessage = 'ping',
    onOpen,
    onClose,
    onError,
    onMessage,
  } = options;

  const [status, setStatus] = useState<WebSocketState<T>['status']>('disconnected');
  const [lastMessage, setLastMessage] = useState<T | null>(null);
  const [messages, setMessages] = useState<T[]>([]);
  const [reconnectCount, setReconnectCount] = useState(0);
  const [latency, setLatency] = useState<number | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectCountRef = useRef(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const heartbeatTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pingTimeRef = useRef<number | null>(null);
  const sendQueueRef = useRef<Array<string | object>>([]);
  const mountedRef = useRef(true);
  const manualDisconnectRef = useRef(false);

  // Keep option callbacks in refs so connect() closure stays stable
  const onOpenRef = useRef(onOpen);
  const onCloseRef = useRef(onClose);
  const onErrorRef = useRef(onError);
  const onMessageRef = useRef(onMessage);
  onOpenRef.current = onOpen;
  onCloseRef.current = onClose;
  onErrorRef.current = onError;
  onMessageRef.current = onMessage;

  const clearTimers = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    if (heartbeatTimerRef.current) {
      clearInterval(heartbeatTimerRef.current);
      heartbeatTimerRef.current = null;
    }
  }, []);

  const flushQueue = useCallback((ws: WebSocket) => {
    while (sendQueueRef.current.length > 0) {
      const msg = sendQueueRef.current.shift();
      if (msg !== undefined) {
        ws.send(typeof msg === 'string' ? msg : JSON.stringify(msg));
      }
    }
  }, []);

  const connect = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) return;

    manualDisconnectRef.current = false;
    clearTimers();

    if (mountedRef.current) setStatus('connecting');

    const ws = new WebSocket(url, protocols);
    wsRef.current = ws;

    ws.onopen = (event) => {
      if (!mountedRef.current) return;
      setStatus('connected');
      reconnectCountRef.current = 0;
      setReconnectCount(0);
      onOpenRef.current?.(event);
      flushQueue(ws);

      // Start heartbeat
      heartbeatTimerRef.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          pingTimeRef.current = Date.now();
          try {
            ws.send(JSON.stringify({ type: 'ping', t: pingTimeRef.current }));
          } catch {
            // If send fails the error handler will manage reconnect
          }
        }
      }, heartbeatInterval);
    };

    ws.onmessage = (event) => {
      if (!mountedRef.current) return;

      let parsed: T;
      try {
        parsed = JSON.parse(event.data as string) as T;
      } catch {
        parsed = event.data as unknown as T;
      }

      // Latency tracking: respond to pong
      const asRecord = parsed as Record<string, unknown>;
      if (
        asRecord &&
        typeof asRecord === 'object' &&
        asRecord.type === 'pong' &&
        typeof asRecord.t === 'number'
      ) {
        setLatency(Date.now() - asRecord.t);
        return;
      }

      // Also measure latency if message text matches heartbeatMessage
      if (parsed === heartbeatMessage && pingTimeRef.current !== null) {
        setLatency(Date.now() - pingTimeRef.current);
        pingTimeRef.current = null;
        return;
      }

      setLastMessage(parsed);
      setMessages(prev => {
        const next = [...prev, parsed];
        return next.length > 100 ? next.slice(next.length - 100) : next;
      });
      onMessageRef.current?.(parsed);
    };

    ws.onerror = (event) => {
      if (!mountedRef.current) return;
      setStatus('error');
      onErrorRef.current?.(event);
    };

    ws.onclose = (event) => {
      if (!mountedRef.current) return;
      clearTimers();
      setStatus('disconnected');
      onCloseRef.current?.(event);

      if (
        !manualDisconnectRef.current &&
        reconnect &&
        reconnectCountRef.current < reconnectAttempts
      ) {
        const attempt = reconnectCountRef.current;
        const delay = reconnectDelay * Math.pow(1.5, attempt);
        reconnectCountRef.current += 1;
        setReconnectCount(reconnectCountRef.current);
        reconnectTimerRef.current = setTimeout(() => {
          if (mountedRef.current) connect();
        }, delay);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, protocols, reconnect, reconnectDelay, reconnectAttempts, heartbeatInterval, heartbeatMessage, clearTimers, flushQueue]);

  const disconnect = useCallback(() => {
    manualDisconnectRef.current = true;
    clearTimers();
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (mountedRef.current) setStatus('disconnected');
  }, [clearTimers]);

  const send = useCallback((data: string | object) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(typeof data === 'string' ? data : JSON.stringify(data));
    } else {
      sendQueueRef.current.push(data);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    connect();
    return () => {
      mountedRef.current = false;
      manualDisconnectRef.current = true;
      clearTimers();
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  // connect is stable (useCallback with stable deps), so this is intentional
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { status, lastMessage, messages, send, connect, disconnect, reconnectCount, latency };
}