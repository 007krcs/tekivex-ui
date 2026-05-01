'use client';

import { type CSSProperties, type ReactNode } from 'react';
import {
  TkxScreenshotGuard,
  type TkxScreenshotGuardProps,
} from './TkxScreenshotGuard';
import { TkxPrintGuard, type TkxPrintGuardProps } from './TkxPrintGuard';
import {
  TkxClipboardGuard,
  type TkxClipboardGuardProps,
} from './TkxClipboardGuard';
import {
  TkxDevToolsGuard,
  type TkxDevToolsGuardProps,
} from './TkxDevToolsGuard';
import {
  TkxDynamicWatermark,
  type TkxDynamicWatermarkProps,
} from './TkxDynamicWatermark';
import type { GuardEvent } from '../engine/protect';

export interface TkxBiodataPreviewProps {
  /** Stable per-session id — bound into the dynamic watermark for forensic
   *  tracing of leaked screenshots. */
  sessionId: string;
  children: ReactNode;
  /** Brand label rendered alongside the session id in the watermark. */
  watermarkLabel?: string;
  /** Optional additional watermark line (e.g., a redacted phone number). */
  watermarkExtraLine?: string;
  /** Watermark visual options (rotation, gap, font size, color, opacity).
   *  Forwarded to TkxDynamicWatermark. */
  watermark?: Omit<
    TkxDynamicWatermarkProps,
    'children' | 'sessionId' | 'label' | 'extraLine'
  >;
  /** Disable individual guards selectively. By default all guards are armed. */
  disableScreenshot?: boolean;
  disablePrint?: boolean;
  disableClipboard?: boolean;
  disableDevTools?: boolean;
  /** Forwarded to the individual guards if the host needs lower-level control. */
  screenshotProps?: Partial<TkxScreenshotGuardProps>;
  printProps?: Partial<TkxPrintGuardProps>;
  clipboardProps?: Partial<TkxClipboardGuardProps>;
  devToolsProps?: Partial<TkxDevToolsGuardProps>;
  /** Aggregated callback fired by any guard's detection event. Useful for
   *  audit logging — plug in audit() from src/engine/security. */
  onAttempt?: (event: GuardEvent) => void;
  /** Replacement node shown when one of the guards blanks the preview. */
  hiddenFallback?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/**
 * Drop-in protected preview shell for the biodata. Composes (in order):
 *
 *   TkxScreenshotGuard
 *     → TkxPrintGuard
 *       → TkxClipboardGuard
 *         → TkxDevToolsGuard
 *           → TkxDynamicWatermark (always outermost-visible so the
 *             watermark survives even if a guard blanks the inner content)
 *               → children
 *
 * Every guard fires onAttempt when an attempt is detected. The host should
 * forward this to its audit log (engine/security.audit) and optionally to a
 * server-side telemetry endpoint to track repeated leak attempts per session.
 */
export function TkxBiodataPreview({
  sessionId,
  children,
  watermarkLabel,
  watermarkExtraLine,
  watermark,
  disableScreenshot,
  disablePrint,
  disableClipboard,
  disableDevTools,
  screenshotProps,
  printProps,
  clipboardProps,
  devToolsProps,
  onAttempt,
  hiddenFallback,
  className,
  style,
}: TkxBiodataPreviewProps) {
  return (
    <div
      className={className}
      style={style}
      data-tkx-biodata-preview={sessionId.slice(0, 12)}
    >
      <TkxScreenshotGuard
        disabled={disableScreenshot}
        onAttempt={onAttempt}
        hiddenFallback={hiddenFallback}
        {...screenshotProps}
      >
        <TkxPrintGuard
          disabled={disablePrint}
          onAttempt={onAttempt}
          hiddenFallback={hiddenFallback}
          {...printProps}
        >
          <TkxClipboardGuard
            disabled={disableClipboard}
            onAttempt={onAttempt}
            {...clipboardProps}
          >
            <TkxDevToolsGuard
              disabled={disableDevTools}
              onChange={onAttempt}
              hiddenFallback={hiddenFallback}
              {...devToolsProps}
            >
              <TkxDynamicWatermark
                sessionId={sessionId}
                label={watermarkLabel}
                extraLine={watermarkExtraLine}
                {...(watermark ?? {})}
              >
                {children}
              </TkxDynamicWatermark>
            </TkxDevToolsGuard>
          </TkxClipboardGuard>
        </TkxPrintGuard>
      </TkxScreenshotGuard>
    </div>
  );
}

TkxBiodataPreview.displayName = 'TkxBiodataPreview';
