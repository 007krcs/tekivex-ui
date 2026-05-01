'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import {
  watchScreenshot,
  PROTECT_CSS_INLINE,
  type GuardEvent,
  type WatchScreenshotOptions,
} from '../engine/protect';

export interface TkxScreenshotGuardProps {
  children: ReactNode;
  /** Disable the guard while still rendering the children unchanged. */
  disabled?: boolean;
  /** Called whenever a screenshot signal is detected. Useful for audit logging. */
  onAttempt?: (event: GuardEvent) => void;
  /** Hide the protected region for this many ms after each detected event.
   *  Set to 0 to never hide (useful when you only want logging). Default 1500. */
  hideMs?: number;
  /** Optional message rendered in place of the content while it is hidden. */
  hiddenFallback?: ReactNode;
  /** Apply CSS that disables text selection, drag, and the iOS callout menu.
   *  Default true. */
  applyProtectiveCss?: boolean;
  /** Forwarded to engine/protect.watchScreenshot. */
  options?: WatchScreenshotOptions;
  className?: string;
  style?: CSSProperties;
}

/**
 * Wraps children in a region that listens for screenshot signals (PrintScreen,
 * macOS / Windows shortcut keys, window blur, tab hidden, fullscreen exit) and
 * blanks the content briefly when an attempt is detected.
 *
 * Browsers cannot truly block OS-level screen capture; this raises the cost of
 * casual leakage and pairs with TkxDynamicWatermark for forensic traceability.
 */
export function TkxScreenshotGuard({
  children,
  disabled = false,
  onAttempt,
  hideMs = 1500,
  hiddenFallback,
  applyProtectiveCss = true,
  options,
  className,
  style,
}: TkxScreenshotGuardProps) {
  const [hidden, setHidden] = useState(false);
  const timerRef = useRef<number | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current != null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (disabled) return;
    const stop = watchScreenshot((evt) => {
      onAttempt?.(evt);
      if (hideMs > 0) {
        setHidden(true);
        clearTimer();
        timerRef.current = window.setTimeout(() => setHidden(false), hideMs);
      }
    }, options);
    return () => {
      stop();
      clearTimer();
    };
  }, [disabled, onAttempt, hideMs, options, clearTimer]);

  const protectiveCss: CSSProperties = applyProtectiveCss
    ? Object.fromEntries(
        PROTECT_CSS_INLINE.split(';').map((kv) => {
          const [k, v] = kv.split(':');
          return [
            k.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase()),
            v,
          ];
        }),
      )
    : {};

  return (
    <div
      className={className}
      style={{ position: 'relative', ...protectiveCss, ...style }}
      data-tkx-screenshot-guard={disabled ? 'off' : hidden ? 'hidden' : 'armed'}
    >
      <div style={{ visibility: hidden ? 'hidden' : 'visible' }}>{children}</div>
      {hidden && hiddenFallback && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          {hiddenFallback}
        </div>
      )}
    </div>
  );
}

TkxScreenshotGuard.displayName = 'TkxScreenshotGuard';
