'use client';

import {
  useEffect,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import {
  watchDevTools,
  type GuardEvent,
  type WatchDevToolsOptions,
} from '../engine/protect';

export interface TkxDevToolsGuardProps {
  children: ReactNode;
  disabled?: boolean;
  /** Called once when DevTools is heuristically detected as open / closed. */
  onChange?: (event: GuardEvent) => void;
  /** Hide the protected region while DevTools is open. Default true. */
  hideWhenOpen?: boolean;
  /** Replacement node rendered while DevTools is open. */
  hiddenFallback?: ReactNode;
  /** Forwarded to engine/protect.watchDevTools. */
  options?: WatchDevToolsOptions;
  className?: string;
  style?: CSSProperties;
}

/**
 * Detects when DevTools is opened (window-size delta + debugger-timing) and
 * blanks the protected region. Heuristic, not foolproof — false negatives on
 * undocked DevTools are expected.
 */
export function TkxDevToolsGuard({
  children,
  disabled = false,
  onChange,
  hideWhenOpen = true,
  hiddenFallback,
  options,
  className,
  style,
}: TkxDevToolsGuardProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (disabled) return;
    const stop = watchDevTools(
      (evt) => {
        onChange?.(evt);
        if (evt.type === 'devtools-open') setOpen(true);
        else if (evt.type === 'devtools-close') setOpen(false);
      },
      // The debugger probe interrupts paused DevTools sessions for everyone,
      // so default it off when the host has not opted in.
      { disableDebuggerProbe: true, ...options },
    );
    return stop;
  }, [disabled, onChange, options]);

  return (
    <div
      className={className}
      style={style}
      data-tkx-devtools-guard={disabled ? 'off' : open ? 'open' : 'armed'}
    >
      <div style={{ visibility: hideWhenOpen && open ? 'hidden' : 'visible' }}>
        {children}
      </div>
      {hideWhenOpen && open && hiddenFallback && (
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

TkxDevToolsGuard.displayName = 'TkxDevToolsGuard';
