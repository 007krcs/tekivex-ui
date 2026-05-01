'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { TkxWatermark, type TkxWatermarkProps } from './TkxWatermark';
import { fnv1aHash } from '../engine/quantum';

export interface TkxDynamicWatermarkProps
  extends Omit<TkxWatermarkProps, 'text' | 'children'> {
  children: ReactNode;
  /** Stable per-session id (e.g., draft id from the API). */
  sessionId: string;
  /** Optional user-visible label, shown alongside the session id. */
  label?: string;
  /** Refresh the timestamp line every N seconds. Default 30. Set to 0 to keep
   *  the watermark static at first render. */
  refreshSeconds?: number;
  /** Include a hash of navigator.userAgent in the watermark for additional
   *  forensic context. Off by default to keep the watermark short. */
  includeUserAgentHash?: boolean;
  /** Provide an additional line — e.g., a redacted phone number — that should
   *  appear in the watermark for traceability. */
  extraLine?: string;
}

/**
 * Extends TkxWatermark with per-session metadata: a short forensic id, a
 * timestamp line, and an optional user-agent hash. If a screenshot leaks, the
 * watermark identifies which session produced it.
 */
export function TkxDynamicWatermark({
  children,
  sessionId,
  label,
  refreshSeconds = 30,
  includeUserAgentHash = false,
  extraLine,
  ...rest
}: TkxDynamicWatermarkProps) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (refreshSeconds <= 0) return;
    const id = window.setInterval(() => setTick((t) => t + 1), refreshSeconds * 1000);
    return () => window.clearInterval(id);
  }, [refreshSeconds]);

  const text = useMemo(() => {
    const lines: string[] = [];
    const idShort = sessionId.length > 12 ? sessionId.slice(0, 12) : sessionId;
    lines.push(label ? `${label} • ${idShort}` : idShort);
    lines.push(new Date().toISOString().slice(0, 19).replace('T', ' '));
    if (extraLine) lines.push(extraLine);
    if (includeUserAgentHash && typeof navigator !== 'undefined') {
      lines.push(`ua:${fnv1aHash(navigator.userAgent || '')}`);
    }
    return lines;
    // tick intentionally pulls the timestamp forward even though it is not read
    // directly — the dependency forces the memo to recompute.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, label, extraLine, includeUserAgentHash, tick]);

  return (
    <TkxWatermark text={text} {...rest}>
      {children}
    </TkxWatermark>
  );
}

TkxDynamicWatermark.displayName = 'TkxDynamicWatermark';
