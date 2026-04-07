import {
  useCallback,
  useRef,
  useEffect,
  type ReactNode,
  type KeyboardEvent,
} from 'react';
import { useTheme } from '../themes';
import { sanitizeString } from '../engine/security';
import { useReducedMotion } from '../hooks';
import { tkx } from '../engine/tkx';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface BottomNavItem {
  id: string;
  label: string;
  icon: ReactNode;
  badge?: number;
}

export interface TkxBottomNavProps {
  items: BottomNavItem[];
  activeId?: string;
  onChange?: (id: string) => void;
  showLabels?: boolean;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const MAX_ITEMS = 5;
const NAV_HEIGHT = 56;

// ── Keyframe injection ──────────────────────────────────────────────────────

let injected = false;
function injectKeyframes() {
  if (injected || typeof document === 'undefined') return;
  injected = true;
  const style = document.createElement('style');
  style.id = 'tkx-bottom-nav-kf';
  style.textContent = `
    @keyframes tkx-bottom-nav-pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.15); }
      100% { transform: scale(1); }
    }
  `;
  document.head.appendChild(style);
}

// ── Component ─────────────────────────────────────────────────────────────────

export function TkxBottomNav({
  items,
  activeId,
  onChange,
  showLabels = true,
}: TkxBottomNavProps) {
  const theme = useTheme();
  const reduced = useReducedMotion();
  const navRef = useRef<HTMLElement>(null);

  // Inject keyframes once
  useEffect(() => {
    injectKeyframes();
  }, []);

  // Clamp to max 5 items
  const visibleItems = items.slice(0, MAX_ITEMS);

  const handleSelect = useCallback(
    (id: string) => {
      onChange?.(id);
    },
    [onChange],
  );

  // ── Keyboard navigation (left/right arrows) ────────────────────────────

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLElement>) => {
      const nav = navRef.current;
      if (!nav) return;

      const buttons = Array.from(
        nav.querySelectorAll<HTMLButtonElement>('[role="tab"]'),
      );
      const currentIndex = buttons.findIndex(
        (btn) => btn === document.activeElement,
      );
      if (currentIndex === -1) return;

      let nextIndex = currentIndex;

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        nextIndex = (currentIndex + 1) % buttons.length;
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        nextIndex = (currentIndex - 1 + buttons.length) % buttons.length;
      } else if (e.key === 'Home') {
        e.preventDefault();
        nextIndex = 0;
      } else if (e.key === 'End') {
        e.preventDefault();
        nextIndex = buttons.length - 1;
      }

      if (nextIndex !== currentIndex) {
        buttons[nextIndex].focus();
        handleSelect(visibleItems[nextIndex].id);
      }
    },
    [handleSelect, visibleItems],
  );

  // ── Transition ──────────────────────────────────────────────────────────

  const transition = reduced ? 'none' : 'color 200ms ease, transform 150ms ease';

  return (
    <nav
      ref={navRef}
      role="navigation"
      aria-label="Bottom navigation"
      className={tkx('fixed bottom-0 left-0 right-0 z-[1000] font-sans')}
      style={{
        height: NAV_HEIGHT,
        backgroundColor: theme.surface,
        borderTop: `1px solid ${theme.border}`,
        boxShadow: `0 -2px 12px ${theme.bg}44`,
      }}
    >
      <div
        role="tablist"
        aria-label="Navigation tabs"
        className={tkx('flex items-center justify-around h-full')}
        onKeyDown={handleKeyDown}
      >
        {visibleItems.map((item) => {
          const isActive = item.id === activeId;
          const safeLabel = sanitizeString(item.label);
          const color = isActive ? theme.primary : theme.textMuted;

          return (
            <button
              key={item.id}
              role="tab"
              aria-selected={isActive}
              aria-label={safeLabel}
              tabIndex={isActive ? 0 : -1}
              onClick={() => handleSelect(item.id)}
              className={tkx(
                'flex flex-col items-center justify-center gap-0.5',
                'bg-transparent border-none cursor-pointer p-1',
                'flex-1 h-full relative',
                'focus-visible:focus-ring',
              )}
              style={{
                color,
                transition,
                outline: 'none',
              }}
            >
              {/* Active indicator bar */}
              {isActive && (
                <div
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: '25%',
                    right: '25%',
                    height: 3,
                    borderRadius: '0 0 3px 3px',
                    backgroundColor: theme.primary,
                    transition: reduced ? 'none' : 'width 200ms ease',
                  }}
                />
              )}

              {/* Icon wrapper with badge */}
              <div
                className={tkx('relative flex items-center justify-center')}
                style={{
                  animation:
                    isActive && !reduced
                      ? 'tkx-bottom-nav-pulse 300ms ease-out'
                      : 'none',
                }}
              >
                {item.icon}

                {/* Badge */}
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    aria-label={`${item.badge} notifications`}
                    className={tkx(
                      'absolute flex items-center justify-center',
                      'text-[10px] font-bold leading-none rounded-full',
                    )}
                    style={{
                      top: -4,
                      right: -8,
                      minWidth: 16,
                      height: 16,
                      padding: '0 4px',
                      backgroundColor: theme.danger,
                      color: theme.bg,
                    }}
                  >
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>

              {/* Label */}
              {showLabels && (
                <span
                  className={tkx('text-[10px] leading-tight mt-0.5')}
                  style={{
                    fontWeight: isActive ? 600 : 400,
                    maxWidth: '100%',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {safeLabel}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
