import { type ReactNode, useEffect } from 'react';
import { useTheme } from '../themes';
import { sanitizeString } from '../engine/security';
import { useAnnounce } from '../hooks';
import { tkx } from '../engine/tkx';

export type AlertVariant = 'info' | 'success' | 'warning' | 'danger';

export interface TkxAlertProps {
  variant: AlertVariant;
  title?: string;
  children: ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
  icon?: ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

const ICONS: Record<AlertVariant, ReactNode> = {
  info: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
    </svg>
  ),
  success: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm-2 14.5l-4-4 1.41-1.41L10 13.67l6.59-6.59L18 8.5l-8 8z" />
    </svg>
  ),
  warning: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
    </svg>
  ),
  danger: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
    </svg>
  ),
};

export function TkxAlert({ variant, title, children, dismissible, onDismiss, icon, style, className }: TkxAlertProps) {
  const theme = useTheme();
  const announce = useAnnounce();
  const safeTitle = title ? sanitizeString(title) : undefined;

  useEffect(() => {
    if (safeTitle) {
      announce(safeTitle, variant === 'danger' || variant === 'warning' ? 'assertive' : 'polite');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safeTitle, variant]);

  const colorMap: Record<AlertVariant, string> = {
    info: theme.info, success: theme.success, warning: theme.warning, danger: theme.danger,
  };
  const accentColor = colorMap[variant];
  const role = variant === 'danger' || variant === 'warning' ? 'alert' : 'status';

  return (
    <div
      role={role}
      className={tkx('flex items-start gap-3 px-4 py-3 rounded-lg border animate-fade-in font-sans', className ?? '')}
      style={{ backgroundColor: `${accentColor}18`, borderColor: accentColor, color: theme.text, ...style }}
    >
      <span className={tkx('shrink-0 mt-[1px]')} style={{ color: accentColor }}>
        {icon ?? ICONS[variant]}
      </span>

      <div className={tkx('flex-1 min-w-0')}>
        {safeTitle && (
          <p className={tkx('m-0 font-semibold text-sm mb-1')}>{safeTitle}</p>
        )}
        <div className={tkx('text-sm leading-relaxed')}>{children}</div>
      </div>

      {dismissible && onDismiss && (
        <button
          aria-label="Dismiss alert"
          onClick={onDismiss}
          className={tkx('bg-transparent border-none cursor-pointer rounded p-[2px] shrink-0 flex items-center justify-center focus-visible:focus-ring')}
          style={{ color: theme.textMuted }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
    </div>
  );
}
