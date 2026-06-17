'use client';

import {
  useRef,
  useState,
  useCallback,
  type ReactNode,
  type CSSProperties,
  type KeyboardEvent,
} from 'react';
import { useTheme } from '../themes';
import { sanitizeString } from '../engine/security';
import { useReducedMotion } from '../hooks';
import { tkx } from '../engine/tkx';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ToolbarItem {
  id: string;
  icon?: ReactNode;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  active?: boolean;
  type?: 'button' | 'separator' | 'toggle';
}

export interface TkxToolbarProps {
  items: ToolbarItem[];
  orientation?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outlined' | 'filled';
  ariaLabel?: string;
  className?: string;
  style?: CSSProperties;
}

// ── Size map ────────────────────────────────────────────────────────────────

interface SizeConfig {
  buttonPx: number;
  buttonPy: number;
  fontSize: number;
  iconSize: number;
  gap: number;
  separatorSize: number;
}

const SIZE_MAP: Record<'sm' | 'md' | 'lg', SizeConfig> = {
  sm: { buttonPx: 6, buttonPy: 4, fontSize: 12, iconSize: 14, gap: 2, separatorSize: 16 },
  md: { buttonPx: 8, buttonPy: 6, fontSize: 13, iconSize: 16, gap: 4, separatorSize: 20 },
  lg: { buttonPx: 12, buttonPy: 8, fontSize: 14, iconSize: 18, gap: 6, separatorSize: 24 },
};

// ── Component ───────────────────────────────────────────────────────────────

export function TkxToolbar({
  items,
  orientation = 'horizontal',
  size = 'md',
  variant = 'default',
  ariaLabel = 'Toolbar',
  className,
  style,
}: TkxToolbarProps) {
  const theme = useTheme();
  const reducedMotion = useReducedMotion();
  const sizeConfig = SIZE_MAP[size];
  const isHorizontal = orientation === 'horizontal';

  const itemRefs = useRef<Map<string, HTMLElement>>(new Map());

  // Collect focusable (non-separator, non-disabled) item ids
  const focusableIds = items
    .filter((item) => item.type !== 'separator' && !item.disabled)
    .map((item) => item.id);

  // Roving tabindex: track which item is currently tabbable. Default to the
  // first focusable item; updated on focus so Tab returns to the last-focused.
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const rovingId =
    focusedId !== null && focusableIds.includes(focusedId)
      ? focusedId
      : focusableIds[0];

  const focusItem = useCallback((id: string) => {
    itemRefs.current.get(id)?.focus();
  }, []);

  // Roving tabindex keyboard handling
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLElement>, itemId: string) => {
      const currentIdx = focusableIds.indexOf(itemId);
      if (currentIdx < 0) return;

      const nextKey = isHorizontal ? 'ArrowRight' : 'ArrowDown';
      const prevKey = isHorizontal ? 'ArrowLeft' : 'ArrowUp';

      switch (e.key) {
        case nextKey: {
          e.preventDefault();
          const next = currentIdx + 1 < focusableIds.length ? currentIdx + 1 : 0;
          focusItem(focusableIds[next]);
          break;
        }
        case prevKey: {
          e.preventDefault();
          const prev = currentIdx - 1 >= 0 ? currentIdx - 1 : focusableIds.length - 1;
          focusItem(focusableIds[prev]);
          break;
        }
        case 'Home': {
          e.preventDefault();
          focusItem(focusableIds[0]);
          break;
        }
        case 'End': {
          e.preventDefault();
          focusItem(focusableIds[focusableIds.length - 1]);
          break;
        }
      }
    },
    [focusableIds, focusItem, isHorizontal],
  );

  // Variant styles for the toolbar container
  const containerVariantStyle = (): CSSProperties => {
    switch (variant) {
      case 'outlined':
        return {
          backgroundColor: 'transparent',
          border: `1px solid ${theme.border}`,
        };
      case 'filled':
        return {
          backgroundColor: theme.surfaceAlt,
          border: 'none',
        };
      default:
        return {
          backgroundColor: theme.surface,
          border: `1px solid ${theme.border}`,
        };
    }
  };

  const getButtonStyle = (item: ToolbarItem): CSSProperties => {
    const isToggle = item.type === 'toggle';
    const isActive = item.active;

    const base: CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
      padding: `${sizeConfig.buttonPy}px ${sizeConfig.buttonPx}px`,
      fontSize: sizeConfig.fontSize,
      borderRadius: 6,
      border: 'none',
      cursor: item.disabled ? 'not-allowed' : 'pointer',
      backgroundColor: isActive ? `${theme.primary}20` : 'transparent',
      color: isActive ? theme.primary : item.disabled ? theme.textMuted : theme.text,
      opacity: item.disabled ? 0.5 : 1,
      outline: 'none',
      transition: reducedMotion ? 'none' : 'all 100ms ease',
      whiteSpace: 'nowrap',
      lineHeight: 1,
    };

    return base;
  };

  return (
    <div
      role="toolbar"
      aria-label={ariaLabel}
      aria-orientation={orientation}
      className={tkx(
        'inline-flex items-center rounded-lg font-sans',
        isHorizontal ? 'flex-row' : 'flex-col',
        className ?? '',
      )}
      style={{
        ...containerVariantStyle(),
        padding: sizeConfig.gap,
        gap: sizeConfig.gap,
        ...style,
      }}
    >
      {items.map((item, idx) => {
        // Separator
        if (item.type === 'separator') {
          return (
            <div
              key={item.id}
              role="separator"
              aria-orientation={isHorizontal ? 'vertical' : 'horizontal'}
              className={tkx('flex-shrink-0')}
              style={{
                ...(isHorizontal
                  ? { width: 1, height: sizeConfig.separatorSize, marginLeft: 2, marginRight: 2 }
                  : { height: 1, width: sizeConfig.separatorSize, marginTop: 2, marginBottom: 2 }),
                backgroundColor: theme.border,
              }}
            />
          );
        }

        const safeLabel = sanitizeString(item.label);
        const isFocusable = !item.disabled;
        const isRoving = rovingId === item.id;

        return (
          <button
            key={item.id}
            ref={(el) => {
              if (el) itemRefs.current.set(item.id, el);
              else itemRefs.current.delete(item.id);
            }}
            type="button"
            role={item.type === 'toggle' ? undefined : undefined}
            aria-pressed={item.type === 'toggle' ? item.active : undefined}
            aria-label={safeLabel}
            aria-disabled={item.disabled || undefined}
            tabIndex={isFocusable && isRoving ? 0 : -1}
            disabled={item.disabled}
            onFocus={() => {
              if (!item.disabled) setFocusedId(item.id);
            }}
            onClick={() => {
              if (!item.disabled) item.onClick?.();
            }}
            onKeyDown={(e) => {
              handleKeyDown(e, item.id);
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                if (!item.disabled) item.onClick?.();
              }
            }}
            className={tkx(
              'focus-visible:ring-2 focus-visible:ring-offset-1',
            )}
            style={getButtonStyle(item)}
            onMouseEnter={(e) => {
              if (!item.disabled && !item.active) {
                (e.currentTarget as HTMLElement).style.backgroundColor = theme.surfaceAlt;
              }
            }}
            onMouseLeave={(e) => {
              if (!item.disabled) {
                (e.currentTarget as HTMLElement).style.backgroundColor = item.active
                  ? `${theme.primary}20`
                  : 'transparent';
              }
            }}
          >
            {item.icon && (
              <span
                aria-hidden="true"
                style={{ width: sizeConfig.iconSize, height: sizeConfig.iconSize, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                {item.icon}
              </span>
            )}
            {!item.icon && safeLabel}
          </button>
        );
      })}
    </div>
  );
}

export default TkxToolbar;