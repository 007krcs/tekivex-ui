import { forwardRef, type HTMLAttributes } from 'react';
import { cssTokens } from '../themes/cssTokens';
import { getAccessibleForeground } from '../engine/wcag';
import { sanitizeString } from '../engine/security';
import { tkx, cx } from '../engine/tkx';

export type BadgeVariant = 'default' | 'primary' | 'secondary' | 'danger' | 'warning' | 'success' | 'info';
export type BadgeSize = 'sm' | 'md' | 'lg';

export interface TkxBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  pulse?: boolean;
  outlined?: boolean;
}

const SIZE_CLASS: Record<BadgeSize, string> = {
  sm: 'text-xs px-1.5 py-[2px] min-h-[16px]',
  md: 'text-xs px-2 py-[3px] min-h-[20px]',
  lg: 'text-sm px-3 py-1 min-h-[24px]',
};

const DOT_SIZE: Record<BadgeSize, string> = { sm: 'size-[6px]', md: 'size-2', lg: 'size-2.5' };

export const TkxBadge = forwardRef<HTMLSpanElement, TkxBadgeProps>(
  ({ variant = 'default', size = 'md', dot = false, pulse = false, outlined = false, children, className, style, ...rest }, ref) => {

    const colorMap: Record<BadgeVariant, string> = {
      default: cssTokens.border, primary: cssTokens.primary, secondary: cssTokens.secondary,
      danger: cssTokens.danger, warning: cssTokens.warning, success: cssTokens.success, info: cssTokens.info,
    };
    const bgColor = colorMap[variant] || '#666666';
    const textColor = getAccessibleForeground(bgColor, ['#ffffff', '#000000', cssTokens.bg || '#000000']);

    const safeChildren = typeof children === 'string' ? sanitizeString(children) : children;

    if (dot) {
      return (
        <span
          ref={ref}
          aria-label={typeof children === 'string' ? sanitizeString(children) : undefined}
          className={cx(tkx('inline-block rounded-full', DOT_SIZE[size], pulse && 'animate-pulse'), className)}
          style={{ backgroundColor: bgColor, ...style }}
          {...rest}
        />
      );
    }

    return (
      <span
        ref={ref}
        className={cx(tkx(
          'inline-flex items-center justify-center rounded-full font-semibold font-sans tracking-wide',
          SIZE_CLASS[size],
          pulse && 'animate-pulse',
        ), className)}
        style={{
          backgroundColor: outlined ? 'transparent' : bgColor,
          color: outlined ? bgColor : textColor,
          border: outlined ? `1px solid ${bgColor}` : 'none',
          ...style,
        }}
        {...rest}
      >
        {safeChildren}
      </span>
    );
  },
);

TkxBadge.displayName = 'TkxBadge';