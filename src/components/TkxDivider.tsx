'use client';

import { forwardRef, type HTMLAttributes } from 'react';
import { useTheme } from '../themes';
import { sanitizeString } from '../engine/security';
import { tkx, cx } from '../engine/tkx';

export interface TkxDividerProps extends HTMLAttributes<HTMLElement> {
  orientation?: 'horizontal' | 'vertical';
  label?: string;
  variant?: 'solid' | 'dashed' | 'dotted';
}

export const TkxDivider = forwardRef<HTMLHRElement, TkxDividerProps>(
  ({ orientation = 'horizontal', label, variant = 'solid', className, style, ...rest }, ref) => {
    const theme = useTheme();
    const safeLabel = label ? sanitizeString(label) : undefined;
    const isVertical = orientation === 'vertical';
    const borderProp = isVertical ? 'borderLeft' : 'borderTop';
    const borderVal = `1px ${variant} ${theme.border}`;

    if (safeLabel) {
      return (
        <div
          role="separator"
          aria-orientation={orientation}
          className={cx(tkx('flex items-center gap-3 text-xs'), className)}
          style={{ color: theme.textMuted, ...style }}
          {...(rest as HTMLAttributes<HTMLDivElement>)}
        >
          <hr className={tkx('flex-1 m-0 border-none')} style={{ [borderProp]: borderVal }} />
          <span>{safeLabel}</span>
          <hr className={tkx('flex-1 m-0 border-none')} style={{ [borderProp]: borderVal }} />
        </div>
      );
    }

    return (
      <hr
        ref={ref}
        role="separator"
        aria-orientation={orientation}
        className={cx(tkx(isVertical ? 'inline-block self-stretch border-none w-0 h-full' : 'w-full border-none m-0'), className)}
        style={{ [borderProp]: borderVal, ...style }}
        {...rest}
      />
    );
  },
);

TkxDivider.displayName = 'TkxDivider';