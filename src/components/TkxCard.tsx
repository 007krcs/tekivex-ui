'use client';

import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { useTheme } from '../themes';
import { useReducedMotion } from '../hooks';
import { tkx, cx } from '../engine/tkx';

export type CardVariant = 'default' | 'glass' | 'quantum' | 'elevated' | 'outlined';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

export interface TkxCardProps extends HTMLAttributes<HTMLElement> {
  variant?: CardVariant;
  isHoverable?: boolean;
  isClickable?: boolean;
  padding?: CardPadding;
  as?: 'div' | 'article' | 'section' | 'button';
}

const PADDING_CLASS: Record<CardPadding, string> = {
  none: '', sm: 'p-3', md: 'p-5', lg: 'p-7',
};

export const TkxCard = forwardRef<HTMLElement, TkxCardProps>(
  ({ variant = 'default', isHoverable, isClickable, padding = 'md', as, children, className, style, ...rest }, ref) => {
    const theme = useTheme();
    const reducedMotion = useReducedMotion();
    const Tag = (as ?? (isClickable ? 'button' : 'div')) as 'div';

    const variantStyle: React.CSSProperties = {
      default: { backgroundColor: theme.css.surface, border: `1px solid ${theme.css.border}` },
      glass: { backgroundColor: `${theme.css.surface}cc`, backdropFilter: 'blur(12px)', border: `1px solid ${theme.css.border}55`, boxShadow: `0 4px 24px ${theme.css.bg}40` },
      quantum: { backgroundColor: theme.css.surfaceAlt, border: `1px solid ${theme.css.primary}33`, boxShadow: `0 0 24px ${theme.css.primary}18` },
      elevated: { backgroundColor: theme.css.surface, boxShadow: `0 4px 20px ${theme.css.bg}60` },
      outlined: { backgroundColor: 'transparent', border: `2px solid ${theme.css.border}` },
    }[variant];

    const base = tkx(
      'rounded-xl w-full text-left block font-sans focus-visible:focus-ring',
      PADDING_CLASS[padding],
      (isHoverable || isClickable) && !reducedMotion && 'transition-transform duration-150 hover:scale-[1.01]',
      isClickable ? 'cursor-pointer' : 'cursor-default',
    );

    return (
      <Tag
        ref={ref as React.Ref<HTMLDivElement>}
        className={cx('tkx-card', base, className)}
        style={{ color: theme.css.text, ...variantStyle, ...style }}
        {...(rest as HTMLAttributes<HTMLDivElement>)}
      >
        {children}
      </Tag>
    );
  },
);

TkxCard.displayName = 'TkxCard';

// ── Sub-components ────────────────────────────────────────────────────────────

export interface TkxCardHeaderProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /**
   * Card title. Rendered inside `titleAs` (an `<h3>` by default).
   *
   * If you pass your own heading element or component (e.g. `<TkxTitle>`),
   * set `titleAs="div"` — otherwise you get a heading nested inside a heading,
   * which is invalid HTML and throws a hydration mismatch during SSR.
   */
  title?: ReactNode;
  /**
   * Element used to wrap `title`. Defaults to `'h3'`. Use a non-heading value
   * (`'div'` / `'span'`) when `title` already contains its own heading, or a
   * different level to fit the surrounding document outline.
   */
  titleAs?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div' | 'span';
  subtitle?: ReactNode;
  action?: ReactNode;
}

export function TkxCardHeader({ title, titleAs, subtitle, action, children, className, ...rest }: TkxCardHeaderProps) {
  const theme = useTheme();
  const TitleTag = titleAs ?? 'h3';
  return (
    <div className={cx(tkx('flex justify-between items-start mb-4'), className)} {...rest}>
      <div className={tkx('flex-1 min-w-0')}>
        {title && <TitleTag className={tkx('text-base font-semibold m-0')} style={{ color: theme.css.text }}>{title}</TitleTag>}
        {subtitle && <p className={tkx('text-sm mt-1 mb-0')} style={{ color: theme.css.textMuted }}>{subtitle}</p>}
        {children}
      </div>
      {action && <div className={tkx('ml-3 shrink-0')}>{action}</div>}
    </div>
  );
}

export function TkxCardBody({ children, className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cx(tkx(''), className)} {...rest}>{children}</div>;
}

export function TkxCardFooter({ children, className, style, ...rest }: HTMLAttributes<HTMLDivElement>) {
  const theme = useTheme();
  return (
    <div
      className={cx(tkx('flex items-center justify-end gap-2 mt-4 pt-4'), className)}
      style={{ borderTop: `1px solid ${theme.css.border}`, ...style }}
      {...rest}
    >
      {children}
    </div>
  );
}