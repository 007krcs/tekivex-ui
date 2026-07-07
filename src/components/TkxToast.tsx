'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  useId,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from '../themes';
import { useLocale } from '../i18n';
import { sanitizeString } from '../engine/security';
import { useReducedMotion } from '../hooks';
import { tkx } from '../engine/tkx';

// ── Types ─────────────────────────────────────────────────────────────────────

export type ToastVariant = 'default' | 'success' | 'danger' | 'warning' | 'info';
export type ToastPosition = 'top-right' | 'top-left' | 'top-center' | 'bottom-right' | 'bottom-left' | 'bottom-center';

export interface ToastItem {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
  action?: { label: string; onClick: () => void };
  /** Fires when the toast leaves the screen (timeout, close button, or programmatic dismiss). */
  onDismiss?: (id: string) => void;
}

export interface TkxToastProps {
  position?: ToastPosition;
  /**
   * Use a private store scoped to this provider instead of the shared global
   * store. Toasts fired via `useToast()` inside this subtree land here only;
   * the module-level `toast()` and any non-isolated provider are unaffected.
   * Use this to run a second toast region without the two mirroring each other.
   */
  isolated?: boolean;
  children?: React.ReactNode;
}

// ── Store factory (one per provider; a shared default for back-compat) ─────────

const MAX_VISIBLE = 5;
type Listener = (toasts: ToastItem[]) => void;

interface TimerRecord {
  handle: ReturnType<typeof setTimeout> | null;
  remaining: number;
  startedAt: number;
}

export interface ToastStore {
  add(item: Omit<ToastItem, 'id'>): string;
  remove(id: string): void;
  dismissAll(): void;
  pause(): void;
  resume(): void;
  subscribe(fn: Listener): () => void;
  getSnapshot(): ToastItem[];
}

function createToastStore(): ToastStore {
  let queue: ToastItem[] = [];
  let visible: ToastItem[] = [];
  const listeners = new Set<Listener>();
  const timers = new Map<string, TimerRecord>();
  let paused = false;

  const notify = () => {
    const snapshot = [...visible];
    listeners.forEach((fn) => fn(snapshot));
  };

  const schedule = (id: string, duration: number) => {
    if (duration === 0) return; // sticky
    const rec: TimerRecord = { handle: null, remaining: duration, startedAt: Date.now() };
    if (!paused) {
      rec.startedAt = Date.now();
      rec.handle = setTimeout(() => remove(id), duration);
    }
    timers.set(id, rec);
  };

  const remove = (id: string) => {
    const rec = timers.get(id);
    if (rec?.handle) clearTimeout(rec.handle);
    timers.delete(id);
    const removed = visible.find((t) => t.id === id) ?? queue.find((t) => t.id === id);
    const wasVisible = visible.some((t) => t.id === id);
    visible = visible.filter((t) => t.id !== id);
    queue = queue.filter((t) => t.id !== id);
    if (wasVisible && queue.length > 0 && visible.length < MAX_VISIBLE) {
      const next = queue.shift()!;
      visible = [...visible, next];
      schedule(next.id, next.duration ?? 4000);
    }
    notify();
    removed?.onDismiss?.(id);
  };

  const add = (item: Omit<ToastItem, 'id'>): string => {
    const id = `tkx-toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const toast: ToastItem = { ...item, id, duration: item.duration ?? 4000 };
    if (visible.length < MAX_VISIBLE) {
      visible = [...visible, toast];
      schedule(id, toast.duration!);
    } else {
      queue = [...queue, toast];
    }
    notify();
    return id;
  };

  const dismissAll = () => {
    const dismissed = [...visible, ...queue];
    timers.forEach((rec) => rec.handle && clearTimeout(rec.handle));
    timers.clear();
    visible = [];
    queue = [];
    notify();
    dismissed.forEach((t) => t.onDismiss?.(t.id));
  };

  // Pause every running countdown, banking the remaining time.
  const pause = () => {
    if (paused) return;
    paused = true;
    const now = Date.now();
    timers.forEach((rec) => {
      if (rec.handle) {
        clearTimeout(rec.handle);
        rec.handle = null;
        rec.remaining = Math.max(0, rec.remaining - (now - rec.startedAt));
      }
    });
  };

  // Resume from the banked remaining time (not a reset).
  const resume = () => {
    if (!paused) return;
    paused = false;
    const now = Date.now();
    timers.forEach((rec, id) => {
      if (!rec.handle) {
        rec.startedAt = now;
        rec.handle = setTimeout(() => remove(id), rec.remaining);
      }
    });
  };

  return {
    add,
    remove,
    dismissAll,
    pause,
    resume,
    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    getSnapshot: () => [...visible],
  };
}

/** The shared default store — target of the module-level `toast()` and of
 *  `useToast()` when called outside any (non-isolated) provider. */
const globalStore = createToastStore();

const ToastStoreContext = createContext<ToastStore | null>(null);

// ── Public imperative API ──────────────────────────────────────────────────────

/**
 * Fire a toast from outside React (e.g. an API-error interceptor). Targets the
 * shared default store, so at least one non-isolated `TkxToastProvider` must be
 * mounted to show it. Provider-scoped (`isolated`) stores are not reachable here.
 */
export function toast(item: Omit<ToastItem, 'id'>): string {
  return globalStore.add(item);
}

export function useToast() {
  const ctx = useContext(ToastStoreContext);
  const store = ctx ?? globalStore;
  const toastFn = useCallback((item: Omit<ToastItem, 'id'>) => store.add(item), [store]);
  const dismiss = useCallback((id: string) => store.remove(id), [store]);
  const dismissAllToasts = useCallback(() => store.dismissAll(), [store]);
  return { toast: toastFn, dismiss, dismissAll: dismissAllToasts };
}

// Only one non-isolated provider renders the shared store, so two default
// providers no longer mirror each other. Tracked at module scope.
let globalRendererMounted = false;

// ── Variant config ────────────────────────────────────────────────────────────

const VARIANT_ICONS: Record<ToastVariant, ReactNode> = {
  default: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
    </svg>
  ),
  success: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm-2 14.5l-4-4 1.41-1.41L10 13.67l6.59-6.59L18 8.5l-8 8z" />
    </svg>
  ),
  danger: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
    </svg>
  ),
  warning: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
    </svg>
  ),
  info: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
    </svg>
  ),
};

// ── Position styles ───────────────────────────────────────────────────────────

const POSITION_STYLES: Record<ToastPosition, React.CSSProperties> = {
  'top-right':    { top: 16, right: 16, alignItems: 'flex-end' },
  'top-left':     { top: 16, left: 16, alignItems: 'flex-start' },
  'top-center':   { top: 16, left: '50%', transform: 'translateX(-50%)', alignItems: 'center' },
  'bottom-right': { bottom: 16, right: 16, alignItems: 'flex-end' },
  'bottom-left':  { bottom: 16, left: 16, alignItems: 'flex-start' },
  'bottom-center':{ bottom: 16, left: '50%', transform: 'translateX(-50%)', alignItems: 'center' },
};

function slideInStyle(position: ToastPosition, reduced: boolean): React.CSSProperties {
  if (reduced) return {};
  const isTop = position.startsWith('top');
  return {
    animation: `tkx-toast-slide-${isTop ? 'down' : 'up'} 220ms cubic-bezier(0.16,1,0.3,1) both`,
  };
}

// ── Single toast card ─────────────────────────────────────────────────────────

interface ToastCardProps {
  toast: ToastItem;
  position: ToastPosition;
  onDismiss: (id: string) => void;
  reduced: boolean;
}

function ToastCard({ toast, position, onDismiss, reduced }: ToastCardProps) {
  const theme = useTheme();
  const t = useLocale();
  const labelId = useId();

  const variantColorMap: Record<ToastVariant, string> = {
    default: theme.textMuted,
    success: theme.success,
    danger:  theme.danger,
    warning: theme.warning,
    info:    theme.info,
  };

  const variant = toast.variant ?? 'default';
  const accentColor = variantColorMap[variant];
  const isDanger = variant === 'danger';
  const safeTitle = toast.title ? sanitizeString(toast.title) : undefined;
  const safeDesc  = toast.description ? sanitizeString(toast.description) : undefined;

  return (
    <div
      role={isDanger ? 'alert' : 'status'}
      aria-live={isDanger ? 'assertive' : 'polite'}
      aria-atomic="true"
      aria-labelledby={safeTitle ? labelId : undefined}
      className={tkx('flex items-start gap-3 px-4 py-3 rounded-lg shadow-lg font-sans min-w-[280px] max-w-[380px]')}
      style={{
        backgroundColor: theme.surface,
        border: `1px solid ${accentColor}55`,
        boxShadow: `0 8px 24px ${theme.bg}cc`,
        color: theme.text,
        ...slideInStyle(position, reduced),
      }}
    >
      <span className={tkx('shrink-0 mt-[2px]')} style={{ color: accentColor }}>
        {VARIANT_ICONS[variant]}
      </span>

      <div className={tkx('flex-1 min-w-0')}>
        {safeTitle && (
          <p id={labelId} className={tkx('m-0 font-semibold text-sm leading-snug')}>
            {safeTitle}
          </p>
        )}
        {safeDesc && (
          <p className={tkx('m-0 text-xs mt-[2px] leading-relaxed')} style={{ color: theme.textMuted }}>
            {safeDesc}
          </p>
        )}
        {toast.action && (
          <button
            onClick={() => { toast.action!.onClick(); onDismiss(toast.id); }}
            className={tkx('border-none bg-transparent cursor-pointer p-0 mt-2 text-xs font-semibold focus-visible:focus-ring')}
            style={{ color: accentColor }}
          >
            {sanitizeString(toast.action.label)}
          </button>
        )}
      </div>

      <button
        aria-label={t.close}
        onClick={() => onDismiss(toast.id)}
        className={tkx('bg-transparent border-none cursor-pointer rounded p-[2px] shrink-0 flex items-center justify-center focus-visible:focus-ring')}
        style={{ color: theme.textMuted }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}

// ── Provider ──────────────────────────────────────────────────────────────────

export function TkxToastProvider({ position = 'top-right', isolated = false, children }: TkxToastProps) {
  // Isolated providers own a private store; default providers share the global.
  const storeRef = useRef<ToastStore | null>(null);
  if (storeRef.current === null) {
    storeRef.current = isolated ? createToastStore() : globalStore;
  }
  const store = storeRef.current;

  const [toasts, setToasts] = useState<ToastItem[]>(() => store.getSnapshot());
  const reduced = useReducedMotion();
  const tStrings = useLocale();

  // A default (shared-store) provider renders only if it's the first one; extra
  // default providers still supply context but don't paint, so the shared store
  // is never mirrored. Isolated providers always render their own store.
  const [isRenderer, setIsRenderer] = useState(false);
  useEffect(() => {
    let renderer = true;
    if (!isolated) {
      if (globalRendererMounted) {
        renderer = false;
        const __proc = (globalThis as { process?: { env?: { NODE_ENV?: string } } }).process;
        if (__proc?.env?.NODE_ENV !== 'production') {
          // eslint-disable-next-line no-console
          console.warn(
            'TkxToast: multiple non-isolated <TkxToastProvider>s are mounted. Only the first renders the shared toasts. Pass `isolated` to run a second, independent toast region.',
          );
        }
      } else {
        globalRendererMounted = true;
      }
    }
    setIsRenderer(renderer);
    setToasts([...store.getSnapshot()]);
    const unsub = store.subscribe((next) => setToasts([...next]));
    return () => {
      unsub();
      if (!isolated && renderer) globalRendererMounted = false;
    };
  }, [isolated, store]);

  // Inject keyframes once
  const injectedRef = useRef(false);
  useEffect(() => {
    if (injectedRef.current || typeof document === 'undefined') return;
    injectedRef.current = true;
    if (!document.getElementById('tkx-toast-kf')) {
      const style = document.createElement('style');
      style.id = 'tkx-toast-kf';
      style.textContent = `
        @keyframes tkx-toast-slide-down {
          from { opacity: 0; transform: translateY(-16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes tkx-toast-slide-up {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  const wrap = (node: ReactNode) => (
    <ToastStoreContext.Provider value={store}>{node}</ToastStoreContext.Provider>
  );

  if (typeof document === 'undefined' || !isRenderer) return wrap(children);

  const isBottom = position.startsWith('bottom');
  const posStyle = POSITION_STYLES[position];
  const ordered = isBottom ? [...toasts].reverse() : toasts;

  return wrap(
    <>
      {children}
      {createPortal(
        <div
          aria-label={tStrings.notifications ?? 'Notifications'}
          className={tkx('fixed z-[9999] flex flex-col gap-2 pointer-events-none')}
          style={posStyle}
          // Pause auto-dismiss while the pointer is over the stack.
          onMouseEnter={store.pause}
          onMouseLeave={store.resume}
        >
          {ordered.map((t) => (
            <div key={t.id} className={tkx('pointer-events-auto')}>
              <ToastCard toast={t} position={position} onDismiss={store.remove} reduced={reduced} />
            </div>
          ))}
        </div>,
        document.body,
      )}
    </>,
  );
}
