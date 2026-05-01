'use client';

import {
  useEffect,
  useRef,
  type CSSProperties,
  type ReactNode,
} from 'react';
import {
  watchClipboard,
  watchContextMenu,
  type GuardEvent,
  type WatchClipboardOptions,
} from '../engine/protect';

export interface TkxClipboardGuardProps {
  children: ReactNode;
  disabled?: boolean;
  /** Called whenever a copy / cut / paste / drag attempt is observed. */
  onAttempt?: (event: GuardEvent) => void;
  /** Block right-click context menu inside the guarded region. Default true. */
  blockContextMenu?: boolean;
  /** Forwarded to engine/protect.watchClipboard. */
  options?: WatchClipboardOptions;
  className?: string;
  style?: CSSProperties;
}

/**
 * Suppresses clipboard operations on the wrapped content. Optionally writes a
 * decoy string into the clipboard so a forced copy yields the watermark line
 * instead of the biodata text.
 */
export function TkxClipboardGuard({
  children,
  disabled = false,
  onAttempt,
  blockContextMenu = true,
  options,
  className,
  style,
}: TkxClipboardGuardProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (disabled || !ref.current) return;
    const target = ref.current;
    const teardowns: Array<() => void> = [];
    teardowns.push(
      watchClipboard(target, (evt) => onAttempt?.(evt), {
        blockOps: true,
        ...options,
      }),
    );
    if (blockContextMenu) {
      teardowns.push(watchContextMenu(target, (evt) => onAttempt?.(evt), true));
    }
    return () => {
      for (const t of teardowns) t();
    };
  }, [disabled, onAttempt, blockContextMenu, options]);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        userSelect: disabled ? 'auto' : 'none',
        WebkitUserSelect: disabled ? 'auto' : 'none',
        WebkitTouchCallout: disabled ? 'default' : 'none',
        ...style,
      }}
      data-tkx-clipboard-guard={disabled ? 'off' : 'armed'}
    >
      {children}
    </div>
  );
}

TkxClipboardGuard.displayName = 'TkxClipboardGuard';
