'use client';

import { forwardRef, useId, type ButtonHTMLAttributes } from 'react';
import { useTheme } from '../themes';
import { useReducedMotion } from '../hooks';
import { validateProps } from '../engine/security';
import { tkx, cx } from '../engine/tkx';

export type ToggleSize = 'sm' | 'md' | 'lg';

export interface TkxToggleProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  size?: ToggleSize;
  hideLabel?: boolean;
}

const SIZES: Record<ToggleSize, { tw: number; th: number; td: number; gap: number }> = {
  sm: { tw: 28, th: 16, td: 10, gap: 3 },
  md: { tw: 40, th: 22, td: 14, gap: 4 },
  lg: { tw: 52, th: 28, td: 18, gap: 5 },
};

export const TkxToggle = forwardRef<HTMLButtonElement, TkxToggleProps>(
  ({ checked, onChange, label, size = 'md', hideLabel, disabled, className, style, ...rest }, ref) => {
    const theme = useTheme();
    const reducedMotion = useReducedMotion();
    const id = useId();

    validateProps(
      { label, checked },
      { label: { type: 'string', required: true }, checked: { type: 'boolean', required: true } },
    );

    const { tw, th, td, gap } = SIZES[size];
    const thumbOffset = checked ? tw - td - gap : gap;
    const trackBg = checked ? theme.primary : theme.border;

    return (
      <div
        className={cx(tkx('inline-flex items-center gap-2', disabled ? 'opacity-50' : ''), className)}
        style={style}
      >
        {!hideLabel && (
          <label
            htmlFor={id}
            className={tkx('text-sm font-sans', disabled ? 'cursor-not-allowed' : 'cursor-pointer', 'select-none')}
            style={{ color: theme.text }}
          >
            {label}
          </label>
        )}
        <button
          ref={ref}
          id={id}
          role="switch"
          aria-checked={checked}
          aria-label={hideLabel ? label : undefined}
          disabled={disabled}
          onClick={() => !disabled && onChange(!checked)}
          onKeyDown={(e) => {
            if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
              e.preventDefault();
              onChange(!checked);
            }
          }}
          className={cx(
            tkx('relative border-none p-0 outline-none shrink-0 focus-visible:focus-ring',
              disabled ? 'cursor-not-allowed' : 'cursor-pointer',
              !reducedMotion && 'transition-colors duration-200',
            ),
          )}
          style={{ width: tw, height: th, borderRadius: th, backgroundColor: trackBg }}
          {...rest}
        >
          <span
            aria-hidden="true"
            className={tkx('absolute rounded-full')}
            style={{
              top: '50%', left: thumbOffset,
              width: td, height: td,
              transform: 'translateY(-50%)',
              backgroundColor: '#ffffff',
              boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
              transition: reducedMotion ? 'none' : 'left 200ms ease',
            }}
          />
        </button>
      </div>
    );
  },
);

TkxToggle.displayName = 'TkxToggle';