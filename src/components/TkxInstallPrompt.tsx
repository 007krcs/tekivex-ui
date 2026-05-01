'use client';

import {
  useCallback,
  useEffect,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { useTheme } from '../themes';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export interface TkxInstallPromptProps {
  /** Override the call-to-action button label. */
  label?: string;
  /** Override the small explanatory message. */
  message?: string;
  /** Render-prop for full UI customisation — receives whether the prompt is
   *  available and the trigger function. When provided, the default banner
   *  is suppressed. */
  children?: (state: {
    available: boolean;
    install: () => Promise<'accepted' | 'dismissed' | 'unavailable'>;
    dismiss: () => void;
  }) => ReactNode;
  /** Called after the user accepts or dismisses. */
  onChoice?: (outcome: 'accepted' | 'dismissed' | 'unavailable') => void;
  /** Localized hide button text. */
  hideLabel?: string;
  className?: string;
  style?: CSSProperties;
}

/**
 * "Add to Home Screen" prompt for installable PWAs. Listens for the
 * `beforeinstallprompt` event, stashes it, and exposes a button that triggers
 * the browser's install dialog. Hides itself when not installable (already
 * installed, unsupported browser, user dismissed in this session).
 */
export function TkxInstallPrompt({
  label = 'Install ShubhBio',
  message = 'Get fast offline access from your home screen.',
  children,
  onChoice,
  hideLabel = 'Not now',
  className,
  style,
}: TkxInstallPromptProps) {
  const theme = useTheme();
  const [event, setEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onBefore = (e: Event): void => {
      e.preventDefault();
      setEvent(e as BeforeInstallPromptEvent);
    };
    const onInstalled = (): void => {
      setEvent(null);
      setHidden(true);
    };
    window.addEventListener('beforeinstallprompt', onBefore as EventListener);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBefore as EventListener);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const install = useCallback(async (): Promise<'accepted' | 'dismissed' | 'unavailable'> => {
    if (!event) {
      onChoice?.('unavailable');
      return 'unavailable';
    }
    try {
      await event.prompt();
      const choice = await event.userChoice;
      onChoice?.(choice.outcome);
      setEvent(null);
      return choice.outcome;
    } catch {
      onChoice?.('unavailable');
      return 'unavailable';
    }
  }, [event, onChoice]);

  const dismiss = useCallback((): void => {
    setHidden(true);
    onChoice?.('dismissed');
  }, [onChoice]);

  const available = event !== null && !hidden;

  if (children) return <>{children({ available, install, dismiss })}</>;

  if (!available) return null;

  return (
    <div
      className={className}
      data-tkx-install-prompt="visible"
      style={{
        display: 'flex',
        gap: 12,
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        background: theme.surface,
        border: `1px solid ${theme.border}`,
        boxShadow: '0 6px 20px rgba(0,0,0,0.08)',
        ...style,
      }}
    >
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, color: theme.text }}>{label}</div>
        <div style={{ fontSize: '0.875rem', color: theme.textMuted }}>{message}</div>
      </div>
      <button
        type="button"
        onClick={() => {
          void install();
        }}
        style={{
          padding: '8px 14px',
          background: theme.primary,
          color: '#fff',
          border: 'none',
          borderRadius: 8,
          cursor: 'pointer',
          fontWeight: 500,
        }}
      >
        {label}
      </button>
      <button
        type="button"
        onClick={dismiss}
        style={{
          padding: '8px 10px',
          background: 'transparent',
          color: theme.textMuted,
          border: 'none',
          cursor: 'pointer',
          fontSize: '0.875rem',
        }}
      >
        {hideLabel}
      </button>
    </div>
  );
}

TkxInstallPrompt.displayName = 'TkxInstallPrompt';
