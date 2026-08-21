'use client';

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useId,
  type ReactNode,
  type CSSProperties,
} from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from '../themes';
import { useLocale } from '../i18n';
import { sanitizeString } from '../engine/security';
import { useReducedMotion } from '../hooks';
import { tkx } from '../engine/tkx';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface TkxSnackbarProps {
  message: string;
  isOpen: boolean;
  onClose?: () => void;
  action?: { label: string; onClick: () => void };
  variant?: 'default' | 'success' | 'error' | 'warning' | 'info';
  position?: 'bottom-left' | 'bottom-center' | 'bottom-right' | 'top-center';
  autoHideDuration?: number;
  icon?: ReactNode;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const DEFAULT_DURATION = 5000;

// ── Keyframe injection ──────────────────────────────────────────────────────

let injected = false;
function injectKeyframes() {
  if (injected || typeof document === 'undefined') return;
  injected = true;
  const style = document.createElement('style');
  style.id = 'tkx-snackbar-kf';
  style.textContent = `
    @keyframes tkx-snackbar-slide-up {
      from { opacity: 0; transform: translateY(24px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes tkx-snackbar-slide-down {
      from { opacity: 0; transform: translateY(-24px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes tkx-snackbar-fade-out {
      from { opacity: 1; }
      to   { opacity: 0; transform: translateY(8px); }
    }
  `;
  document.head.appendChild(style);
}

// ── Variant icons ───────────────────────────────────────────────────────────

const VARIANT_ICONS: Record<string, ReactNode> = {
  success: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm-2 14.5l-4-4 1.41-1.41L10 13.67l6.59-6.59L18 8.5l-8 8z" />
    </svg>
  ),
  error: (
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

// ── Position styles ─────────────────────────────────────────────────────────

const POSITION_STYLES: Record<string, CSSProperties> = {
  'bottom-left': {
    bottom: 24,
    left: 24,
  },
  'bottom-center': {
    bottom: 24,
    left: '50%',
    transform: 'translateX(-50%)',
  },
  'bottom-right': {
    bottom: 24,
    right: 24,
  },
  'top-center': {
    top: 24,
    left: '50%',
    transform: 'translateX(-50%)',
  },
};

// ── Component ─────────────────────────────────────────────────────────────────

export function TkxSnackbar({
  message,
  isOpen,
  onClose,
  action,
  variant = 'default',
  position = 'bottom-center',
  autoHideDuration = DEFAULT_DURATION,
  icon,
}: TkxSnackbarProps) {
  const theme = useTheme();
  const t = useLocale();
  const reduced = useReducedMotion();
  const labelId = useId();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);

  // Inject keyframes
  useEffect(() => {
    injectKeyframes();
  }, []);

  // ── Open / close lifecycle ──────────────────────────────────────────────

  useEffect(() => {
    if (isOpen) {
      setExiting(false);
      setVisible(true);
    } else if (visible) {
      // Begin exit animation
      if (reduced) {
        setVisible(false);
      } else {
        setExiting(true);
        const exitTimer = setTimeout(() => {
          setVisible(false);
          setExiting(false);
        }, 250);
        return () => clearTimeout(exitTimer);
      }
    }
  }, [isOpen, reduced, visible]);

  // ── Auto-hide timer ─────────────────────────────────────────────────────

  useEffect(() => {
    if (!isOpen || autoHideDuration <= 0 || !onClose) return;

    timerRef.current = setTimeout(() => {
      onClose();
    }, autoHideDuration);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isOpen, autoHideDuration, onClose]);

  // ── Pause timer on hover ────────────────────────────────────────────────

  const handleMouseEnter = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (isOpen && autoHideDuration > 0 && onClose) {
      timerRef.current = setTimeout(() => onClose(), autoHideDuration);
    }
  }, [isOpen, autoHideDuration, onClose]);

  // ── Variant colors ──────────────────────────────────────────────────────

  const variantColorMap: Record<string, string> = {
    default: theme.css.textMuted,
    success: theme.css.success,
    error: theme.css.danger,
    warning: theme.css.warning,
    info: theme.css.info,
  };

  const accentColor = variantColorMap[variant];
  const safeMessage = sanitizeString(message);

  // ── Don't render when not visible ───────────────────────────────────────

  if (!visible || typeof document === 'undefined') return null;

  // ── Animation ───────────────────────────────────────────────────────────

  const isTop = position === 'top-center';
  const enterAnimation = isTop
    ? 'tkx-snackbar-slide-down'
    : 'tkx-snackbar-slide-up';

  let animationStyle: CSSProperties = {};
  if (!reduced) {
    if (exiting) {
      animationStyle = {
        animation: 'tkx-snackbar-fade-out 250ms ease forwards',
      };
    } else {
      animationStyle = {
        animation: `${enterAnimation} 250ms cubic-bezier(0.16,1,0.3,1) both`,
      };
    }
  }

  // ── Determine icon to show ──────────────────────────────────────────────

  const displayIcon = icon ?? VARIANT_ICONS[variant] ?? null;

  return createPortal(
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      aria-live={variant === 'error' ? 'assertive' : 'polite'}
      aria-atomic="true"
      aria-labelledby={labelId}
      className={tkx('fixed z-[9500] font-sans')}
      style={{
        ...POSITION_STYLES[position],
        ...animationStyle,
        pointerEvents: 'auto',
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className={tkx(
          'flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg',
          'min-w-[280px] max-w-[480px]',
        )}
        style={{
          backgroundColor: theme.css.surface,
          border: `1px solid ${accentColor}44`,
          boxShadow: `0 8px 24px ${theme.css.bg}aa`,
          color: theme.css.text,
        }}
      >
        {/* Icon */}
        {displayIcon && (
          <span
            className={tkx('shrink-0 flex items-center')}
            style={{ color: accentColor }}
          >
            {displayIcon}
          </span>
        )}

        {/* Message */}
        <span
          id={labelId}
          className={tkx('flex-1 text-sm leading-snug')}
        >
          {safeMessage}
        </span>

        {/* Action button */}
        {action && (
          <button
            onClick={() => {
              action.onClick();
              onClose?.();
            }}
            className={tkx(
              'bg-transparent border-none cursor-pointer p-0 ml-2',
              'text-sm font-semibold shrink-0',
              'focus-visible:focus-ring',
            )}
            style={{ color: theme.css.primary }}
          >
            {sanitizeString(action.label)}
          </button>
        )}

        {/* Close button */}
        {onClose && (
          <button
            aria-label={t.dismiss ?? t.close ?? 'Dismiss'}
            onClick={onClose}
            className={tkx(
              'bg-transparent border-none cursor-pointer rounded p-[2px] ml-1',
              'shrink-0 flex items-center justify-center',
              'focus-visible:focus-ring',
            )}
            style={{ color: theme.css.textMuted }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>
    </div>,
    document.body,
  );
}