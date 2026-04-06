import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { useTheme } from '../themes';
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
    const Tag = (as ?? (isClickable ? 'button' : 'div')) as 'div';

    const variantStyle: React.CSSProperties = {
      default: { backgroundColor: theme.surface, border: `1px solid ${theme.border}` },
      glass: { backgroundColor: `${theme.surface}cc`, backdropFilter: 'blur(12px)', border: `1px solid ${theme.border}55`, boxShadow: `0 4px 24px ${theme.bg}40` },
      quantum: { backgroundColor: theme.surfaceAlt, border: `1px solid ${theme.primary}33`, boxShadow: `0 0 24px ${theme.primary}18` },
      elevated: { backgroundColor: theme.surface, boxShadow: `0 4px 20px ${theme.bg}60` },
      outlined: { backgroundColor: 'transparent', border: `2px solid ${theme.border}` },
    }[variant];

    const base = tkx(
      'rounded-xl w-full text-left block font-sans focus-visible:focus-ring',
      PADDING_CLASS[padding],
      (isHoverable || isClickable) && 'transition-transform duration-150 hover:scale-[1.01]',
      isClickable ? 'cursor-pointer' : 'cursor-default',
    );

    return (
      <Tag
        ref={ref as React.Ref<HTMLDivElement>}
        className={cx('tkx-card', base, className)}
        style={{ color: theme.text, ...variantStyle, ...style }}
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
  title?: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
}

export function TkxCardHeader({ title, subtitle, action, children, className, ...rest }: TkxCardHeaderProps) {
  const theme = useTheme();
  return (
    <div className={cx(tkx('flex justify-between items-start mb-4'), className)} {...rest}>
      <div className={tkx('flex-1 min-w-0')}>
        {title && <h3 className={tkx('text-base font-semibold m-0')} style={{ color: theme.text }}>{title}</h3>}
        {subtitle && <p className={tkx('text-sm mt-1 mb-0')} style={{ color: theme.textMuted }}>{subtitle}</p>}
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
      style={{ borderTop: `1px solid ${theme.border}`, ...style }}
      {...rest}
    >
      {children}
    </div>
  );
}
