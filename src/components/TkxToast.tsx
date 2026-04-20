'use client';

import {
  useState,
  useEffect,
  useCallback,
  useRef,
  useId,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from '../themes';
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
}

export interface TkxToastProps {
  position?: ToastPosition;
  children?: React.ReactNode;
}

// ── Module-level store ────────────────────────────────────────────────────────

type Listener = (toasts: ToastItem[]) => void;

const MAX_VISIBLE = 5;
let queue: ToastItem[] = [];
let visible: ToastItem[] = [];
const listeners = new Set<Listener>();
const timers = new Map<string, ReturnType<typeof setTimeout>>();

function notify() {
  const snapshot = [...visible];
  listeners.forEach((fn) => fn(snapshot));
}

function scheduleRemove(id: string, duration: number) {
  if (duration === 0) return;
  timers.set(id, setTimeout(() => removeToast(id), duration));
}

function removeToast(id: string) {
  clearTimeout(timers.get(id));
  timers.delete(id);
  const wasVisible = visible.some((t) => t.id === id);
  visible = visible.filter((t) => t.id !== id);
  queue = queue.filter((t) => t.id !== id);
  if (wasVisible && queue.length > 0 && visible.length < MAX_VISIBLE) {
    const next = queue.shift()!;
    visible = [...visible, next];
    scheduleRemove(next.id, next.duration ?? 4000);
  }
  notify();
}

function addToast(item: Omit<ToastItem, 'id'>): string {
  const id = `tkx-toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const toast: ToastItem = { ...item, id, duration: item.duration ?? 4000 };
  if (visible.length < MAX_VISIBLE) {
    visible = [...visible, toast];
    scheduleRemove(id, toast.duration!);
  } else {
    queue = [...queue, toast];
  }
  notify();
  return id;
}

function dismissAll() {
  timers.forEach((t) => clearTimeout(t));
  timers.clear();
  visible = [];
  queue = [];
  notify();
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useToast() {
  const toast = useCallback((item: Omit<ToastItem, 'id'>) => addToast(item), []);
  const dismiss = useCallback((id: string) => removeToast(id), []);
  const dismissAllToasts = useCallback(() => dismissAll(), []);
  return { toast, dismiss, dismissAll: dismissAllToasts };
}

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
        aria-label="Dismiss notification"
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

export function TkxToastProvider({ position = 'top-right', children }: TkxToastProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([...visible]);
  const reduced = useReducedMotion();

  useEffect(() => {
    setToasts([...visible]);
    const handler: Listener = (next) => setToasts([...next]);
    listeners.add(handler);
    return () => { listeners.delete(handler); };
  }, []);

  const isBottom = position.startsWith('bottom');
  const posStyle = POSITION_STYLES[position];

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

  if (typeof document === 'undefined') return <>{children}</>;

  const ordered = isBottom ? [...toasts].reverse() : toasts;

  return <>{children}{createPortal(
    <div
      aria-label="Notifications"
      className={tkx('fixed z-[9999] flex flex-col gap-2 pointer-events-none')}
      style={posStyle}
    >
      {ordered.map((t) => (
        <div key={t.id} className={tkx('pointer-events-auto')}>
          <ToastCard toast={t} position={position} onDismiss={removeToast} reduced={reduced} />
        </div>
      ))}
    </div>,
    document.body,
  )}</>;
}