'use client';

import {
  useCallback,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { useTheme } from '../themes';

export type TkxShareTarget =
  | 'native'
  | 'whatsapp'
  | 'telegram'
  | 'sms'
  | 'email'
  | 'copy'
  | 'twitter'
  | 'facebook';

export interface TkxShareSheetProps {
  /** Headline / message body shared to messaging targets. */
  text?: string;
  /** URL shared. Optional — some targets (copy, sms) work text-only. */
  url?: string;
  /** Title shown in native share sheet. */
  title?: string;
  /** Subset of targets to enable. Default: all. */
  targets?: ReadonlyArray<TkxShareTarget>;
  /** Localized labels. */
  labels?: Partial<Record<TkxShareTarget | 'copied', string>>;
  /** Called once a share target completes (or the user cancels). */
  onShared?: (target: TkxShareTarget) => void;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

const DEFAULT_TARGETS: ReadonlyArray<TkxShareTarget> = [
  'native',
  'whatsapp',
  'telegram',
  'sms',
  'email',
  'copy',
];

const DEFAULT_LABELS: Record<TkxShareTarget | 'copied', string> = {
  native: 'Share',
  whatsapp: 'WhatsApp',
  telegram: 'Telegram',
  sms: 'SMS',
  email: 'Email',
  copy: 'Copy link',
  twitter: 'X',
  facebook: 'Facebook',
  copied: 'Copied',
};

function buildShareUrl(
  target: TkxShareTarget,
  { text, url, title }: { text?: string; url?: string; title?: string },
): string | null {
  const t = encodeURIComponent(text ?? '');
  const u = encodeURIComponent(url ?? '');
  const ti = encodeURIComponent(title ?? '');
  switch (target) {
    case 'whatsapp':
      // wa.me is universal — works on web, opens app on mobile.
      return `https://wa.me/?text=${[t, u].filter(Boolean).join('%20')}`;
    case 'telegram':
      return `https://t.me/share/url?url=${u}&text=${t}`;
    case 'sms':
      return `sms:?&body=${[t, u].filter(Boolean).join('%20')}`;
    case 'email':
      return `mailto:?subject=${ti}&body=${[t, u].filter(Boolean).join('%0A')}`;
    case 'twitter':
      return `https://twitter.com/intent/tweet?text=${t}${url ? `&url=${u}` : ''}`;
    case 'facebook':
      return `https://www.facebook.com/sharer/sharer.php?u=${u}`;
    default:
      return null;
  }
}

/**
 * Cross-platform share helper. Uses navigator.share when available (mobile
 * web on iOS Safari + Android Chrome / WebView) and falls back to deep
 * links for WhatsApp / Telegram / SMS / email + a copy-to-clipboard option.
 */
export function TkxShareSheet({
  text,
  url,
  title,
  targets = DEFAULT_TARGETS,
  labels,
  onShared,
  className,
  style,
  children,
}: TkxShareSheetProps) {
  const theme = useTheme();
  const L = { ...DEFAULT_LABELS, ...labels };
  const [copied, setCopied] = useState(false);

  const shareNative = useCallback(async () => {
    if (typeof navigator === 'undefined' || typeof navigator.share !== 'function') {
      return false;
    }
    try {
      await navigator.share({ title, text, url });
      onShared?.('native');
      return true;
    } catch {
      // User cancelled — silently swallow.
      return true;
    }
  }, [title, text, url, onShared]);

  const shareCopy = useCallback(async () => {
    const payload = [text, url].filter(Boolean).join(' ');
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(payload);
      } else if (typeof document !== 'undefined') {
        // Last-resort fallback for very old browsers.
        const ta = document.createElement('textarea');
        ta.value = payload;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
      onShared?.('copy');
    } catch {
      /* clipboard unavailable — noop */
    }
  }, [text, url, onShared]);

  const handleClick = useCallback(
    async (target: TkxShareTarget) => {
      if (target === 'native') {
        const ok = await shareNative();
        if (!ok) await shareCopy();
        return;
      }
      if (target === 'copy') {
        await shareCopy();
        return;
      }
      const u = buildShareUrl(target, { text, url, title });
      if (!u) return;
      window.open(u, '_blank', 'noopener,noreferrer');
      onShared?.(target);
    },
    [shareNative, shareCopy, text, url, title, onShared],
  );

  const visibleTargets = targets.filter((t) => {
    if (t === 'native') {
      return typeof navigator !== 'undefined' && typeof navigator.share === 'function';
    }
    return true;
  });

  return (
    <div
      className={className}
      data-tkx-share-sheet=""
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 8,
        alignItems: 'center',
        ...style,
      }}
    >
      {children}
      {visibleTargets.map((t) => (
        <button
          key={t}
          type="button"
          onClick={() => handleClick(t)}
          data-tkx-share-target={t}
          style={{
            padding: '8px 12px',
            borderRadius: 8,
            border: `1px solid ${theme.border}`,
            background: theme.surface,
            color: theme.text,
            cursor: 'pointer',
            fontSize: '0.875rem',
          }}
        >
          {t === 'copy' && copied ? L.copied : L[t]}
        </button>
      ))}
    </div>
  );
}

TkxShareSheet.displayName = 'TkxShareSheet';
