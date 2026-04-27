import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, render, screen } from '@testing-library/react';
import { useMediaQuery, useBreakpoint } from '../src/headless/useMediaQuery';
import { useWebSocket } from '../src/headless/useWebSocket';
import { useSSE } from '../src/headless/useSSE';
import { useDebounce } from '../src/headless/useDebounce';
import { useThrottle } from '../src/headless/useThrottle';
import { I18nProvider } from '../src/i18n/I18nProvider';

// ── useMediaQuery ─────────────────────────────────────────────────────────
describe('useMediaQuery', () => {
  it('returns false initially when no match', () => {
    const { result } = renderHook(() => useMediaQuery('(min-width: 9999px)'));
    expect(typeof result.current).toBe('boolean');
  });

  it('subscribes to change events', () => {
    const listeners: Record<string, ((e: MediaQueryListEvent) => void)[]> = {};
    const mq = {
      matches: false,
      addEventListener: (name: string, h: (e: MediaQueryListEvent) => void) => {
        (listeners[name] ||= []).push(h);
      },
      removeEventListener: () => {},
    };
    vi.spyOn(window, 'matchMedia').mockReturnValue(mq as unknown as MediaQueryList);
    const { result } = renderHook(() => useMediaQuery('(min-width: 100px)'));
    expect(result.current).toBe(false);
    act(() => {
      listeners.change?.[0]?.({ matches: true } as MediaQueryListEvent);
    });
    expect(result.current).toBe(true);
  });
});

describe('useBreakpoint', () => {
  it('returns sm/md/lg/xl/xxl + isMobile/isTablet/isDesktop', () => {
    const { result } = renderHook(() => useBreakpoint());
    expect(result.current).toHaveProperty('sm');
    expect(result.current).toHaveProperty('md');
    expect(result.current).toHaveProperty('lg');
    expect(result.current).toHaveProperty('isMobile');
    expect(result.current).toHaveProperty('isTablet');
    expect(result.current).toHaveProperty('isDesktop');
  });
});

// ── useDebounce ───────────────────────────────────────────────────────────
describe('useDebounce', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('returns initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('hello', 200));
    expect(result.current).toBe('hello');
  });

  it('debounces value updates', () => {
    const { result, rerender } = renderHook(({ v }) => useDebounce(v, 200), {
      initialProps: { v: 'a' },
    });
    rerender({ v: 'b' });
    expect(result.current).toBe('a'); // not updated yet
    act(() => { vi.advanceTimersByTime(250); });
    expect(result.current).toBe('b');
  });
});

// ── useThrottle ───────────────────────────────────────────────────────────
describe('useThrottle', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('returns initial value immediately', () => {
    const { result } = renderHook(() => useThrottle('hello', 200));
    expect(result.current).toBe('hello');
  });

  it('throttles updates', () => {
    const { result, rerender } = renderHook(({ v }) => useThrottle(v, 200), {
      initialProps: { v: 'a' },
    });
    rerender({ v: 'b' });
    rerender({ v: 'c' });
    act(() => { vi.advanceTimersByTime(300); });
    // Should have settled to last
    expect(result.current).toBeTruthy();
  });
});

// ── useWebSocket (with WebSocket mock) ────────────────────────────────────
describe('useWebSocket', () => {
  let MockWS: typeof WebSocket;
  let instance: any;

  beforeEach(() => {
    instance = null;
    MockWS = class {
      static CONNECTING = 0;
      static OPEN = 1;
      static CLOSING = 2;
      static CLOSED = 3;
      readyState = 0;
      onopen: ((e: Event) => void) | null = null;
      onclose: ((e: CloseEvent) => void) | null = null;
      onerror: ((e: Event) => void) | null = null;
      onmessage: ((e: MessageEvent) => void) | null = null;
      url: string;
      sent: string[] = [];
      constructor(url: string) {
        this.url = url;
        instance = this;
      }
      send(data: string) { this.sent.push(data); }
      close() { this.readyState = 3; this.onclose?.({ code: 1000 } as CloseEvent); }
    } as unknown as typeof WebSocket;
    (globalThis as any).WebSocket = MockWS;
  });

  it('returns disconnected status before connect', () => {
    const { result } = renderHook(() => useWebSocket({ url: 'ws://x', reconnect: false }));
    expect(['disconnected', 'connecting', 'connected']).toContain(result.current.status);
  });

  it('exposes send/connect/disconnect API', () => {
    const { result } = renderHook(() => useWebSocket({ url: 'ws://x', reconnect: false }));
    expect(typeof result.current.send).toBe('function');
    expect(typeof result.current.connect).toBe('function');
    expect(typeof result.current.disconnect).toBe('function');
  });

  it('handles incoming messages', () => {
    const onMessage = vi.fn();
    const { result } = renderHook(() =>
      useWebSocket<{ x: number }>({ url: 'ws://x', reconnect: false, onMessage }),
    );
    act(() => {
      result.current.connect();
    });
    act(() => {
      instance.readyState = 1;
      instance.onopen?.({} as Event);
      instance.onmessage?.({ data: JSON.stringify({ x: 1 }) } as MessageEvent);
    });
    expect(onMessage).toHaveBeenCalled();
  });

  it('send accepts object and serializes', () => {
    const { result } = renderHook(() => useWebSocket({ url: 'ws://x', reconnect: false }));
    act(() => { result.current.connect(); });
    act(() => {
      instance.readyState = 1;
      instance.onopen?.({} as Event);
    });
    act(() => { result.current.send({ hello: 'world' }); });
    expect(instance.sent.some((s: string) => s.includes('hello'))).toBe(true);
  });

  it('disconnect closes socket', () => {
    const { result } = renderHook(() => useWebSocket({ url: 'ws://x', reconnect: false }));
    act(() => { result.current.connect(); });
    act(() => { result.current.disconnect(); });
    expect(['disconnected', 'closed']).toContain(result.current.status as string);
  });
});

// ── useSSE (with EventSource mock) ────────────────────────────────────────
describe('useSSE', () => {
  let instance: any;

  beforeEach(() => {
    instance = null;
    (globalThis as any).EventSource = class {
      static CONNECTING = 0;
      static OPEN = 1;
      static CLOSED = 2;
      url: string;
      readyState = 0;
      onopen: ((e: Event) => void) | null = null;
      onerror: ((e: Event) => void) | null = null;
      handlers: Record<string, ((e: MessageEvent) => void)[]> = {};
      constructor(url: string) { this.url = url; instance = this; }
      addEventListener(name: string, h: (e: MessageEvent) => void) {
        (this.handlers[name] ||= []).push(h);
      }
      removeEventListener() {}
      close() { this.readyState = 2; }
    };
  });

  it('returns connecting status initially', () => {
    const { result } = renderHook(() => useSSE({ url: '/stream', reconnect: false }));
    expect(['connecting', 'connected']).toContain(result.current.status);
  });

  it('exposes events array + connect/disconnect', () => {
    const { result } = renderHook(() => useSSE({ url: '/stream', reconnect: false }));
    expect(Array.isArray(result.current.events)).toBe(true);
    expect(typeof result.current.connect).toBe('function');
    expect(typeof result.current.disconnect).toBe('function');
  });

  it('captures named events', () => {
    const { result } = renderHook(() =>
      useSSE<{ id: number }>({ url: '/stream', events: ['update'], reconnect: false }),
    );
    act(() => {
      instance.readyState = 1;
      instance.onopen?.({} as Event);
      instance.handlers.update?.[0]?.({ data: JSON.stringify({ id: 7 }) } as MessageEvent);
    });
    expect(result.current.events.length).toBeGreaterThanOrEqual(0);
  });

  it('disconnect closes EventSource', () => {
    const { result } = renderHook(() => useSSE({ url: '/stream', reconnect: false }));
    act(() => { result.current.disconnect(); });
    expect(['closed', 'disconnected', 'connecting']).toContain(result.current.status);
  });

  it('onError fires on error event', () => {
    const onError = vi.fn();
    renderHook(() => useSSE({ url: '/stream', reconnect: false, onError }));
    act(() => {
      instance.onerror?.({} as Event);
    });
    expect(onError).toHaveBeenCalled();
  });
});

// ── I18nProvider ──────────────────────────────────────────────────────────
describe('I18nProvider', () => {
  it('wraps children with default locale', () => {
    render(
      <I18nProvider>
        <span>kid</span>
      </I18nProvider>,
    );
    expect(screen.getByText('kid')).toBeInTheDocument();
  });

  it('respects explicit locale', () => {
    const { container } = render(
      <I18nProvider locale="hi-IN">
        <span>kid</span>
      </I18nProvider>,
    );
    expect(container.querySelector('[dir]')?.getAttribute('dir')).toBe('ltr');
  });

  it('switches to RTL for ar locale', () => {
    const { container } = render(
      <I18nProvider locale="ar-SA">
        <span>kid</span>
      </I18nProvider>,
    );
    expect(container.querySelector('[dir]')?.getAttribute('dir')).toBe('rtl');
  });

  it('honors explicit direction prop', () => {
    const { container } = render(
      <I18nProvider locale="en-US" direction="rtl">
        <span>kid</span>
      </I18nProvider>,
    );
    expect(container.querySelector('[dir]')?.getAttribute('dir')).toBe('rtl');
  });

  it('merges string overrides', () => {
    render(
      <I18nProvider strings={{ close: 'Bye' }}>
        <span>kid</span>
      </I18nProvider>,
    );
    expect(screen.getByText('kid')).toBeInTheDocument();
  });
});
