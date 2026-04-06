import {
  useState,
  useRef,
  useCallback,
  useId,
  type KeyboardEvent,
  type MouseEvent,
} from 'react';
import { useTheme } from '../themes';
import { sanitizeString } from '../engine/security';
import { useReducedMotion } from '../hooks';
import { tkx, cx } from '../engine/tkx';

export type RatingSize = 'sm' | 'md' | 'lg' | 'xl';

export interface TkxRatingProps {
  value?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
  max?: number;
  precision?: 0.5 | 1;
  size?: RatingSize;
  isReadOnly?: boolean;
  isDisabled?: boolean;
  label?: string;
  showValue?: boolean;
  colorScheme?: 'warning' | 'primary' | 'danger';
  emptyIcon?: 'star' | 'heart' | 'circle';
  filledIcon?: 'star' | 'heart' | 'circle';
}

const SIZE_MAP: Record<RatingSize, number> = { sm: 16, md: 24, lg: 32, xl: 40 };

// ── Icon SVGs ─────────────────────────────────────────────────────────────────

function StarIcon({ size, filled, color, halfFilled, id }: { size: number; filled: boolean; color: string; halfFilled?: boolean; id?: string }) {
  const gradId = id ? `hg-${id}` : undefined;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" style={{ display: 'block' }}>
      {halfFilled && gradId && (
        <defs>
          <linearGradient id={gradId} x1="0" x2="1" y1="0" y2="0">
            <stop offset="50%" stopColor={color} />
            <stop offset="50%" stopColor="transparent" />
          </linearGradient>
        </defs>
      )}
      <polygon
        points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
        fill={halfFilled && gradId ? `url(#${gradId})` : filled ? color : 'none'}
        stroke={color}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
    </svg>
  );
}

function HeartIcon({ size, filled, color, halfFilled, id }: { size: number; filled: boolean; color: string; halfFilled?: boolean; id?: string }) {
  const gradId = id ? `hg-${id}` : undefined;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" style={{ display: 'block' }}>
      {halfFilled && gradId && (
        <defs>
          <linearGradient id={gradId} x1="0" x2="1" y1="0" y2="0">
            <stop offset="50%" stopColor={color} />
            <stop offset="50%" stopColor="transparent" />
          </linearGradient>
        </defs>
      )}
      <path
        d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
        fill={halfFilled && gradId ? `url(#${gradId})` : filled ? color : 'none'}
        stroke={color}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CircleIcon({ size, filled, color, halfFilled, id }: { size: number; filled: boolean; color: string; halfFilled?: boolean; id?: string }) {
  const gradId = id ? `hg-${id}` : undefined;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" style={{ display: 'block' }}>
      {halfFilled && gradId && (
        <defs>
          <linearGradient id={gradId} x1="0" x2="1" y1="0" y2="0">
            <stop offset="50%" stopColor={color} />
            <stop offset="50%" stopColor="transparent" />
          </linearGradient>
        </defs>
      )}
      <circle
        cx="12" cy="12" r="9"
        fill={halfFilled && gradId ? `url(#${gradId})` : filled ? color : 'none'}
        stroke={color}
        strokeWidth={1.5}
      />
    </svg>
  );
}

type IconType = 'star' | 'heart' | 'circle';

function RatingIcon({ type, size, filled, color, halfFilled, uid }: {
  type: IconType; size: number; filled: boolean; color: string; halfFilled?: boolean; uid?: string;
}) {
  const props = { size, filled, color, halfFilled, id: uid };
  if (type === 'heart') return <HeartIcon {...props} />;
  if (type === 'circle') return <CircleIcon {...props} />;
  return <StarIcon {...props} />;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function snapToPrecision(raw: number, precision: 0.5 | 1): number {
  if (precision === 1) return Math.round(raw);
  return Math.round(raw * 2) / 2;
}

function getHoverValue(e: MouseEvent<HTMLSpanElement>, index: number, precision: 0.5 | 1): number {
  if (precision === 1) return index + 1;
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
  const midpoint = rect.left + rect.width / 2;
  return e.clientX < midpoint ? index + 0.5 : index + 1;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function TkxRating({
  value: controlledValue,
  defaultValue = 0,
  onChange,
  max = 5,
  precision = 1,
  size = 'md',
  isReadOnly = false,
  isDisabled = false,
  label,
  showValue = false,
  colorScheme = 'warning',
  emptyIcon = 'star',
  filledIcon = 'star',
}: TkxRatingProps) {
  const theme = useTheme();
  const reducedMotion = useReducedMotion();
  const groupId = useId();
  const isControlled = controlledValue !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const activeValue = isControlled ? (controlledValue ?? 0) : internalValue;
  const displayValue = hoverValue ?? activeValue;

  const colorMap: Record<string, string> = {
    warning: theme.warning,
    primary: theme.primary,
    danger:  theme.danger,
  };
  const iconColor = colorMap[colorScheme] ?? theme.warning;
  const px = SIZE_MAP[size];
  const isInteractive = !isReadOnly && !isDisabled;

  const commit = useCallback((val: number) => {
    if (!isControlled) setInternalValue(val);
    onChange?.(val);
  }, [isControlled, onChange]);

  const handleMouseMove = useCallback((e: MouseEvent<HTMLSpanElement>, index: number) => {
    if (!isInteractive) return;
    setHoverValue(getHoverValue(e, index, precision));
  }, [isInteractive, precision]);

  const handleMouseLeave = useCallback(() => {
    if (!isInteractive) return;
    setHoverValue(null);
  }, [isInteractive]);

  const handleClick = useCallback((e: MouseEvent<HTMLSpanElement>, index: number) => {
    if (!isInteractive) return;
    const val = getHoverValue(e, index, precision);
    // Toggle off if clicking the same value
    const next = val === activeValue ? 0 : val;
    commit(next);
  }, [isInteractive, precision, activeValue, commit]);

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLDivElement>) => {
    if (!isInteractive) return;
    const step = precision;
    let next = activeValue;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { e.preventDefault(); next = clamp(activeValue + step, 0, max); }
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { e.preventDefault(); next = clamp(activeValue - step, 0, max); }
    else if (e.key === 'Home') { e.preventDefault(); next = 0; }
    else if (e.key === 'End') { e.preventDefault(); next = max; }
    else return;
    next = snapToPrecision(next, precision);
    commit(next);
  }, [isInteractive, activeValue, max, precision, commit]);

  const safeLabel = label ? sanitizeString(label) : 'Rating';

  return (
    <div
      className={cx(
        tkx('inline-flex items-center gap-2 font-sans'),
        isDisabled ? tkx('opacity-50') : '',
      )}
    >
      <div
        ref={rootRef}
        role="radiogroup"
        aria-label={safeLabel}
        aria-disabled={isDisabled}
        aria-readonly={isReadOnly}
        tabIndex={isInteractive ? 0 : -1}
        onKeyDown={handleKeyDown}
        onMouseLeave={handleMouseLeave}
        className={tkx('flex items-center gap-0.5 outline-none')}
        style={{ cursor: isInteractive ? 'pointer' : 'default' }}
      >
        {Array.from({ length: max }, (_, i) => {
          const starValue = i + 1;
          const halfValue = i + 0.5;
          const isFilled = displayValue >= starValue;
          const isHalf = !isFilled && precision === 0.5 && displayValue >= halfValue;
          const uid = `${groupId}-${i}`;

          return (
            <span
              key={i}
              role="radio"
              aria-checked={
                precision === 0.5
                  ? activeValue === halfValue || activeValue === starValue
                  : activeValue === starValue
              }
              aria-label={
                precision === 0.5
                  ? `${halfValue} star${halfValue !== 1 ? 's' : ''} / ${starValue} star${starValue !== 1 ? 's' : ''}`
                  : `${starValue} star${starValue !== 1 ? 's' : ''}`
              }
              tabIndex={-1}
              onMouseMove={(e) => handleMouseMove(e, i)}
              onClick={(e) => handleClick(e, i)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                lineHeight: 0,
                transition: reducedMotion ? 'none' : 'transform 120ms ease',
                transform: hoverValue !== null && displayValue >= halfValue && isInteractive
                  ? 'scale(1.15)'
                  : 'scale(1)',
              }}
            >
              <RatingIcon
                type={isFilled || isHalf ? filledIcon : emptyIcon}
                size={px}
                filled={isFilled}
                halfFilled={isHalf}
                color={isFilled || isHalf ? iconColor : theme.border}
                uid={isHalf ? uid : undefined}
              />
            </span>
          );
        })}
      </div>

      {showValue && (
        <span
          className={tkx('text-sm tabular-nums')}
          style={{ color: theme.textMuted }}
          aria-live="polite"
          aria-atomic="true"
        >
          {activeValue % 1 === 0 ? activeValue.toFixed(0) : activeValue.toFixed(1)} / {max}
        </span>
      )}
    </div>
  );
}
