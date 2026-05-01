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
  watchPrint,
  type GuardEvent,
  type WatchPrintOptions,
} from '../engine/protect';

export interface TkxPrintGuardProps {
  children: ReactNode;
  disabled?: boolean;
  /** Called when Ctrl+P / Cmd+P, beforeprint, or window.print is invoked. */
  onAttempt?: (event: GuardEvent) => void;
  /** Hide the protected region between beforeprint and afterprint. Default true. */
  hideDuringPrint?: boolean;
  /** Replacement message shown while the page is being printed. */
  hiddenFallback?: ReactNode;
  /** Forwarded to engine/protect.watchPrint. */
  options?: WatchPrintOptions;
  className?: string;
  style?: CSSProperties;
}

/**
 * Intercepts the browser print pipeline so a "Save as PDF" attempt either
 * fails silently or yields a blank page. Combine with the @media print CSS
 * the host stylesheet ships for full coverage.
 */
export function TkxPrintGuard({
  children,
  disabled = false,
  onAttempt,
  hideDuringPrint = true,
  hiddenFallback,
  options,
  className,
  style,
}: TkxPrintGuardProps) {
  const [printing, setPrinting] = useState(false);
  const printingRef = useRef(false);

  const handle = useCallback(
    (evt: GuardEvent) => {
      onAttempt?.(evt);
      if (!hideDuringPrint) return;
      if (evt.type === 'print-attempt' && !printingRef.current) {
        printingRef.current = true;
        setPrinting(true);
      } else if (evt.type === 'print-after' && printingRef.current) {
        printingRef.current = false;
        setPrinting(false);
      }
    },
    [hideDuringPrint, onAttempt],
  );

  useEffect(() => {
    if (disabled) return;
    const stop = watchPrint(handle, options);
    return stop;
  }, [disabled, handle, options]);

  return (
    <div
      className={className}
      style={style}
      data-tkx-print-guard={disabled ? 'off' : printing ? 'printing' : 'armed'}
    >
      <div
        style={{
          visibility: hideDuringPrint && printing ? 'hidden' : 'visible',
          // Belt-and-braces print suppression: reapply at print time.
          ['--tkx-print-display' as string]: hideDuringPrint && printing ? 'none' : 'block',
        }}
      >
        {children}
      </div>
      {hideDuringPrint && printing && hiddenFallback}
    </div>
  );
}

TkxPrintGuard.displayName = 'TkxPrintGuard';
