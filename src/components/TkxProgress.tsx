import { forwardRef, type HTMLAttributes } from 'react';
import { useTheme } from '../themes';
import { useReducedMotion } from '../hooks';
import { validateProps } from '../engine/security';
import { tkx, cx } from '../engine/tkx';

export type ProgressVariant = 'linear' | 'circular';
export type ProgressSize = 'sm' | 'md' | 'lg';

export interface TkxProgressProps extends HTMLAttributes<HTMLDivElement> {
  value?: number;
  variant?: ProgressVariant;
  size?: ProgressSize;
  label?: string;
  showValue?: boolean;
  color?: string;
}

const LINEAR_H: Record<ProgressSize, string> = { sm: '4px', md: '8px', lg: '12px' };
const CIRCLE_PX: Record<ProgressSize, number> = { sm: 32, md: 48, lg: 64 };

export const TkxProgress = forwardRef<HTMLDivElement, TkxProgressProps>(
  ({ value, variant = 'linear', size = 'md', label, showValue, color, className, style, ...rest }, ref) => {
    const theme = useTheme();
    const reducedMotion = useReducedMotion();
    const fillColor = color ?? theme.primary;
    const isIndeterminate = value === undefined;
    const clamped = value !== undefined ? Math.min(100, Math.max(0, value)) : 0;

    if (value !== undefined) {
      const { errors } = validateProps({ value }, { value: { type: 'number', min: 0, max: 100 } });
      if (errors.length > 0) {
        // eslint-disable-next-line no-console
        console.warn('[TkxProgress]', errors.join(', '));
      }
    }

    if (variant === 'circular') {
      const px = CIRCLE_PX[size];
      const strokeW = size === 'sm' ? 3 : size === 'md' ? 4 : 5;
      const r = (px - strokeW * 2) / 2;
      const circ = 2 * Math.PI * r;
      const offset = isIndeterminate ? 0 : circ - (clamped / 100) * circ;

      return (
        <div
          ref={ref}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={isIndeterminate ? undefined : clamped}
          aria-label={label ?? (isIndeterminate ? 'Loading' : `${clamped}%`)}
          className={cx(tkx('inline-flex flex-col items-center gap-1'), className)}
          style={style}
          {...rest}
        >
          <svg width={px} height={px} viewBox={`0 0 ${px} ${px}`} aria-hidden="true">
            <circle cx={px / 2} cy={px / 2} r={r} fill="none" stroke={theme.border} strokeWidth={strokeW} />
            <circle
              cx={px / 2} cy={px / 2} r={r} fill="none"
              stroke={fillColor} strokeWidth={strokeW} strokeLinecap="round"
              strokeDasharray={circ} strokeDashoffset={offset}
              transform={`rotate(-90 ${px / 2} ${px / 2})`}
              style={{
                transition: reducedMotion ? 'none' : 'stroke-dashoffset 300ms ease',
                animation: isIndeterminate && !reducedMotion ? 'tkx-spin 1s linear infinite' : undefined,
              }}
            />
          </svg>
          {showValue && !isIndeterminate && (
            <span className={tkx('text-xs')} style={{ color: theme.textMuted }}>{clamped}%</span>
          )}
        </div>
      );
    }

    const h = LINEAR_H[size];
    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={isIndeterminate ? undefined : clamped}
        aria-label={label ?? (isIndeterminate ? 'Loading' : `${clamped}%`)}
        className={cx(tkx('flex flex-col gap-1 w-full'), className)}
        style={style}
        {...rest}
      >
        {label && (
          <div className={tkx('flex justify-between text-sm')} style={{ color: theme.text }}>
            <span>{label}</span>
            {showValue && !isIndeterminate && <span>{clamped}%</span>}
          </div>
        )}
        <div
          className={tkx('w-full overflow-hidden')}
          style={{ height: h, borderRadius: h, backgroundColor: theme.border }}
        >
          <div
            style={{
              height: '100%', borderRadius: h, backgroundColor: fillColor,
              width: isIndeterminate ? '40%' : `${clamped}%`,
              transition: reducedMotion ? 'none' : 'width 300ms ease',
              animation: isIndeterminate && !reducedMotion ? 'tkx-shimmer 1.5s ease-in-out infinite' : undefined,
            }}
          />
        </div>
      </div>
    );
  },
);

TkxProgress.displayName = 'TkxProgress';
