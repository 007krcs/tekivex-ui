'use client';

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useId,
  type ReactNode,
  type CSSProperties,
  type KeyboardEvent,
} from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from '../themes';
import { sanitizeString } from '../engine/security';
import { useReducedMotion, useEscapeKey } from '../hooks';
import { tkx } from '../engine/tkx';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface SpeedDialAction {
  id: string;
  icon: ReactNode;
  label: string;
  onClick?: () => void;
}

export interface TkxSpeedDialProps {
  actions: SpeedDialAction[];
  icon?: ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right';
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  className?: string;
  style?: CSSProperties;
}

// ── Default plus icon ───────────────────────────────────────────────────────

function PlusIcon({ color, rotated, reducedMotion }: { color: string; rotated: boolean; reducedMotion: boolean }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      style={{
        transform: rotated ? 'rotate(45deg)' : 'rotate(0deg)',
        transition: reducedMotion ? 'none' : 'transform 200ms ease',
      }}
    >
      <path
        d="M12 5v14M5 12h14"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ── Position styles ─────────────────────────────────────────────────────────

type PositionKey = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';

const POSITION_STYLES: Record<PositionKey, CSSProperties> = {
  'bottom-right': { bottom: 24, right: 24 },
  'bottom-left': { bottom: 24, left: 24 },
  'top-right': { top: 24, right: 24 },
  'top-left': { top: 24, left: 24 },
};

// ── Direction offsets for action placement ──────────────────────────────────

function getActionOffset(
  direction: 'up' | 'down' | 'left' | 'right',
  index: number,
  spacing: number,
): CSSProperties {
  const offset = (index + 1) * spacing;
  switch (direction) {
    case 'up':
      return { bottom: offset, left: '50%', transform: 'translateX(-50%)' };
    case 'down':
      return { top: offset, left: '50%', transform: 'translateX(-50%)' };
    case 'left':
      return { right: offset, top: '50%', transform: 'translateY(-50%)' };
    case 'right':
      return { left: offset, top: '50%', transform: 'translateY(-50%)' };
  }
}

// ── Tooltip placement relative to action button direction ───────────────────

function getTooltipPlacement(direction: 'up' | 'down' | 'left' | 'right'): CSSProperties {
  switch (direction) {
    case 'up':
    case 'down':
      return { right: '100%', top: '50%', transform: 'translateY(-50%)', marginRight: 10 };
    case 'left':
      return { bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: 10 };
    case 'right':
      return { bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: 10 };
  }
}

// ── Component ───────────────────────────────────────────────────────────────

const MAIN_BUTTON_SIZE = 56;
const ACTION_BUTTON_SIZE = 48;
const SPACING = 64;

export function TkxSpeedDial({
  actions = [],
  icon,
  direction = 'up',
  position = 'bottom-right',
  className,
  style,
}: TkxSpeedDialProps) {
  const theme = useTheme();
  const reducedMotion = useReducedMotion();
  const menuId = useId();

  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const actionRefs = useRef<Map<number, HTMLButtonElement>>(new Map());

  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev);
    setFocusedIndex(-1);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setFocusedIndex(-1);
  }, []);

  useEscapeKey(close, isOpen);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: PointerEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        close();
      }
    };
    document.addEventListener('pointerdown', handler);
    return () => document.removeEventListener('pointerdown', handler);
  }, [isOpen, close]);

  // Focus management
  useEffect(() => {
    if (focusedIndex >= 0) {
      actionRefs.current.get(focusedIndex)?.focus();
    }
  }, [focusedIndex]);

  const handleMainKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggle();
    }
    if (isOpen) {
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        setFocusedIndex(0);
      }
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault();
        setFocusedIndex(0);
      }
    }
  };

  const handleActionKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    switch (e.key) {
      case 'ArrowUp':
      case 'ArrowLeft': {
        e.preventDefault();
        setFocusedIndex(index > 0 ? index - 1 : actions.length - 1);
        break;
      }
      case 'ArrowDown':
      case 'ArrowRight': {
        e.preventDefault();
        setFocusedIndex(index < actions.length - 1 ? index + 1 : 0);
        break;
      }
      case 'Enter':
      case ' ': {
        e.preventDefault();
        actions[index].onClick?.();
        close();
        break;
      }
      case 'Escape': {
        close();
        break;
      }
      case 'Home': {
        e.preventDefault();
        setFocusedIndex(0);
        break;
      }
      case 'End': {
        e.preventDefault();
        setFocusedIndex(actions.length - 1);
        break;
      }
    }
  };

  const getAnimationDelay = (index: number): string => {
    if (reducedMotion) return '0ms';
    return `${index * 40}ms`;
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && typeof document !== 'undefined' &&
        createPortal(
          <div
            aria-hidden="true"
            onClick={close}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.3)',
              zIndex: 9000,
              transition: reducedMotion ? 'none' : 'opacity 200ms ease',
            }}
          />,
          document.body,
        )}

      {/* Speed dial container */}
      <div
        ref={containerRef}
        className={tkx('fixed z-[9100] font-sans', className ?? '')}
        style={{
          ...POSITION_STYLES[position],
          ...style,
        }}
      >
        {/* Action buttons */}
        {isOpen &&
          actions.map((action, index) => {
            const safeLabel = sanitizeString(action.label);
            const offsetStyle = getActionOffset(direction, index, SPACING);
            const tooltipStyle = getTooltipPlacement(direction);

            return (
              <div
                key={action.id}
                className={tkx('absolute')}
                style={{
                  ...offsetStyle,
                  opacity: reducedMotion ? 1 : 0,
                  animation: reducedMotion
                    ? 'none'
                    : `tkxSpeedDialIn 180ms ease forwards`,
                  animationDelay: getAnimationDelay(index),
                }}
              >
                <div className={tkx('relative inline-flex')}>
                  {/* Tooltip */}
                  <span
                    className={tkx(
                      'absolute z-10 whitespace-nowrap text-xs py-1 px-2 rounded-md pointer-events-none',
                    )}
                    style={{
                      ...tooltipStyle,
                      backgroundColor: theme.surfaceAlt,
                      color: theme.text,
                      border: `1px solid ${theme.border}`,
                      boxShadow: `0 2px 8px rgba(0,0,0,0.15)`,
                    }}
                    role="tooltip"
                  >
                    {safeLabel}
                  </span>

                  {/* Action button */}
                  <button
                    ref={(el) => {
                      if (el) actionRefs.current.set(index, el);
                      else actionRefs.current.delete(index);
                    }}
                    type="button"
                    aria-label={safeLabel}
                    tabIndex={isOpen ? 0 : -1}
                    onClick={() => {
                      action.onClick?.();
                      close();
                    }}
                    onKeyDown={(e) => handleActionKeyDown(e, index)}
                    className={tkx(
                      'inline-flex items-center justify-center rounded-full border-none cursor-pointer',
                      'outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                      'shadow-lg',
                    )}
                    style={{
                      width: ACTION_BUTTON_SIZE,
                      height: ACTION_BUTTON_SIZE,
                      backgroundColor: theme.surface,
                      color: theme.text,
                      border: `1px solid ${theme.border}`,
                      boxShadow: `0 4px 12px rgba(0,0,0,0.15)`,
                      transition: reducedMotion ? 'none' : 'all 150ms ease',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.backgroundColor = theme.surfaceAlt;
                      (e.currentTarget as HTMLElement).style.transform = 'scale(1.1)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.backgroundColor = theme.surface;
                      (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
                    }}
                  >
                    {action.icon}
                  </button>
                </div>
              </div>
            );
          })}

        {/* Main FAB */}
        <button
          type="button"
          aria-label={isOpen ? 'Close actions menu' : 'Open actions menu'}
          aria-expanded={isOpen}
          aria-controls={menuId}
          aria-haspopup="true"
          onClick={toggle}
          onKeyDown={handleMainKeyDown}
          className={tkx(
            'inline-flex items-center justify-center rounded-full border-none cursor-pointer',
            'outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          )}
          style={{
            width: MAIN_BUTTON_SIZE,
            height: MAIN_BUTTON_SIZE,
            backgroundColor: theme.primary,
            color: theme.bg,
            boxShadow: `0 6px 20px ${theme.primary}40`,
            transition: reducedMotion ? 'none' : 'all 200ms ease',
            position: 'relative',
            zIndex: 1,
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 28px ${theme.primary}60`;
            if (!reducedMotion) {
              (e.currentTarget as HTMLElement).style.transform = 'scale(1.05)';
            }
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.boxShadow = `0 6px 20px ${theme.primary}40`;
            (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
          }}
        >
          {icon ?? (
            <PlusIcon
              color={theme.bg}
              rotated={isOpen}
              reducedMotion={reducedMotion}
            />
          )}
        </button>

        {/* Hidden menu region for a11y */}
        <div id={menuId} role="menu" aria-label="Speed dial actions" style={{ display: 'none' }}>
          {actions.map((action) => (
            <div key={action.id} role="menuitem">
              {sanitizeString(action.label)}
            </div>
          ))}
        </div>
      </div>

      {/* Keyframes */}
      {isOpen && !reducedMotion && (
        <style>{`
          @keyframes tkxSpeedDialIn {
            from { opacity: 0; transform: translateX(-50%) scale(0.5); }
            to { opacity: 1; transform: translateX(-50%) scale(1); }
          }
        `}</style>
      )}
    </>
  );
}

export default TkxSpeedDial;