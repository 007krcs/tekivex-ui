'use client';

// ─────────────────────────────────────────────────────────────────────────────
// TkxSecurityDashboard — make the security kernel's invisible work visible.
//
// The tekivex-ui security kernel silently blocks XSS, Trojan-Source unicode,
// PII leaks, clickjacking, and rate-limit abuse. Consumers never SEE it work.
// This surfaces the live event stream (from the kernel's onSecurityEvent
// pub/sub) as a dashboard: counts by type + severity, a scrolling event log,
// and a one-click JSON export for a SIEM / incident report.
//
// Three pieces:
//   - useSecurityEvents()      — the core hook. Self-subscribing; no provider
//                                needed. Returns { events, counts, clear, export }.
//   - SecurityProvider         — OPTIONAL. Shares one event buffer app-wide so
//                                multiple dashboards / widgets stay in sync.
//   - TkxSecurityDashboard     — the drop-in UI.
//
// Zero-config: <TkxSecurityDashboard /> works on its own.
// ─────────────────────────────────────────────────────────────────────────────

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
  type ReactNode,
  type CSSProperties,
} from 'react';
import { useTheme } from '../themes';
import {
  onSecurityEvent,
  getRecentSecurityEvents,
  clearSecurityEvents,
  type SecurityEvent,
  type SecurityEventType,
  type SecuritySeverity,
} from '../engine/security';

// ── Core hook ────────────────────────────────────────────────────────────────

export interface SecurityEventsState {
  events: readonly SecurityEvent[];
  counts: Record<SecurityEventType, number>;
  bySeverity: Record<SecuritySeverity, number>;
  clear: () => void;
  /** Serialise the current buffer to a JSON string (for download / SIEM). */
  toJSON: () => string;
}

const EMPTY_COUNTS = (): Record<SecurityEventType, number> => ({
  'xss-sanitized': 0,
  'unicode-stripped': 0,
  'pii-redacted': 0,
  audit: 0,
  'clickjacking-detected': 0,
  'rate-limited': 0,
  'mime-rejected': 0,
});

/**
 * Subscribe to the live security event stream. Self-contained — does NOT
 * require SecurityProvider. Seeds from the kernel's ring buffer on mount.
 */
export function useSecurityEvents(maxEvents = 200): SecurityEventsState {
  const ctx = useContext(SecurityContext);
  const [local, setLocal] = useState<readonly SecurityEvent[]>(() =>
    ctx ? ctx.events : getRecentSecurityEvents().slice(-maxEvents),
  );

  useEffect(() => {
    if (ctx) return; // provider drives state instead
    const unsub = onSecurityEvent((evt) => {
      setLocal((prev) => {
        const next = [...prev, evt];
        return next.length > maxEvents ? next.slice(-maxEvents) : next;
      });
    });
    return unsub;
  }, [ctx, maxEvents]);

  const events = ctx ? ctx.events : local;

  const counts = useMemo(() => {
    const c = EMPTY_COUNTS();
    for (const e of events) c[e.type] = (c[e.type] ?? 0) + 1;
    return c;
  }, [events]);

  const bySeverity = useMemo(() => {
    const s: Record<SecuritySeverity, number> = { info: 0, warning: 0, critical: 0 };
    for (const e of events) s[e.severity] = (s[e.severity] ?? 0) + 1;
    return s;
  }, [events]);

  const clear = useCallback(() => {
    clearSecurityEvents();
    if (ctx) ctx.clear();
    else setLocal([]);
  }, [ctx]);

  const toJSON = useCallback(
    () => JSON.stringify({ exportedAt: new Date().toISOString(), events }, null, 2),
    [events],
  );

  return { events, counts, bySeverity, clear, toJSON };
}

// ── Optional provider (app-wide aggregation) ─────────────────────────────────

interface SecurityContextValue {
  events: readonly SecurityEvent[];
  clear: () => void;
}
const SecurityContext = createContext<SecurityContextValue | null>(null);

export interface SecurityProviderProps {
  children: ReactNode;
  /** Cap the in-memory buffer (default 200). */
  maxEvents?: number;
}

export function SecurityProvider({ children, maxEvents = 200 }: SecurityProviderProps) {
  const [events, setEvents] = useState<readonly SecurityEvent[]>(() =>
    getRecentSecurityEvents().slice(-maxEvents),
  );
  useEffect(() => {
    const unsub = onSecurityEvent((evt) => {
      setEvents((prev) => {
        const next = [...prev, evt];
        return next.length > maxEvents ? next.slice(-maxEvents) : next;
      });
    });
    return unsub;
  }, [maxEvents]);

  const value = useMemo<SecurityContextValue>(
    () => ({ events, clear: () => { clearSecurityEvents(); setEvents([]); } }),
    [events],
  );
  return <SecurityContext.Provider value={value}>{children}</SecurityContext.Provider>;
}

// ── Dashboard UI ─────────────────────────────────────────────────────────────

const TYPE_LABEL: Record<SecurityEventType, string> = {
  'xss-sanitized': 'XSS sanitized',
  'unicode-stripped': 'Trojan-Source stripped',
  'pii-redacted': 'PII redacted',
  audit: 'Audit entries',
  'clickjacking-detected': 'Clickjacking',
  'rate-limited': 'Rate-limited',
  'mime-rejected': 'MIME rejected',
};

export interface TkxSecurityDashboardProps {
  /** Max events to retain in the log (default 200). */
  maxEvents?: number;
  /** Hide the JSON export button. */
  hideExport?: boolean;
  /** Compact mode — summary tiles only, no event log. */
  compact?: boolean;
  className?: string;
  style?: CSSProperties;
}

export function TkxSecurityDashboard({
  maxEvents = 200,
  hideExport = false,
  compact = false,
  className,
  style,
}: TkxSecurityDashboardProps) {
  const theme = useTheme();
  const { events, counts, bySeverity, clear, toJSON } = useSecurityEvents(maxEvents);

  const sevColor = (s: SecuritySeverity) =>
    s === 'critical' ? theme.css.danger : s === 'warning' ? theme.css.warning : theme.css.textMuted;

  const download = useCallback(() => {
    if (typeof document === 'undefined') return;
    const blob = new Blob([toJSON()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tekivex-security-events-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [toJSON]);

  const tiles: Array<{ key: SecurityEventType; label: string }> = [
    { key: 'xss-sanitized', label: TYPE_LABEL['xss-sanitized'] },
    { key: 'unicode-stripped', label: TYPE_LABEL['unicode-stripped'] },
    { key: 'pii-redacted', label: TYPE_LABEL['pii-redacted'] },
    { key: 'audit', label: TYPE_LABEL.audit },
  ];

  const cardStyle: CSSProperties = {
    background: theme.css.surface,
    border: `1px solid ${theme.css.border}`,
    borderRadius: 12,
    padding: 16,
    color: theme.css.text,
    fontFamily: 'inherit',
    ...style,
  };

  return (
    <section
      className={className}
      style={cardStyle}
      role="region"
      aria-label="Security event dashboard"
    >
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: theme.css.text }}>
            Security kernel — live events
          </h3>
          <p style={{ margin: '2px 0 0', fontSize: 12, color: theme.css.textMuted }}>
            {events.length === 0
              ? 'No defensive actions yet. Events appear as the kernel blocks threats.'
              : `${events.length} event${events.length === 1 ? '' : 's'} · ${bySeverity.critical} critical · ${bySeverity.warning} warning`}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {!hideExport && (
            <button
              type="button"
              onClick={download}
              disabled={events.length === 0}
              style={{
                padding: '6px 12px', fontSize: 12, fontWeight: 600, borderRadius: 6,
                border: `1px solid ${theme.css.border}`, background: theme.css.surfaceAlt,
                color: theme.css.text, cursor: events.length ? 'pointer' : 'not-allowed',
                opacity: events.length ? 1 : 0.5, fontFamily: 'inherit',
              }}
            >
              Export JSON
            </button>
          )}
          <button
            type="button"
            onClick={clear}
            disabled={events.length === 0}
            style={{
              padding: '6px 12px', fontSize: 12, fontWeight: 600, borderRadius: 6,
              border: `1px solid ${theme.css.border}`, background: 'transparent',
              color: theme.css.textMuted, cursor: events.length ? 'pointer' : 'not-allowed',
              opacity: events.length ? 1 : 0.5, fontFamily: 'inherit',
            }}
          >
            Clear
          </button>
        </div>
      </header>

      {/* Summary tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 10, marginBottom: compact ? 0 : 16 }}>
        {tiles.map((t) => (
          <div key={t.key} style={{ background: theme.css.surfaceAlt, border: `1px solid ${theme.css.border}`, borderRadius: 8, padding: '10px 12px' }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: counts[t.key] > 0 ? theme.css.primary : theme.css.textMuted, lineHeight: 1.1, fontVariantNumeric: 'tabular-nums' }}>
              {counts[t.key]}
            </div>
            <div style={{ fontSize: 11, color: theme.css.textMuted, marginTop: 2 }}>{t.label}</div>
          </div>
        ))}
      </div>

      {/* Event log */}
      {!compact && (
        <div
          role="log"
          aria-live="polite"
          aria-label="Security event log"
          style={{
            maxHeight: 260, overflowY: 'auto', border: `1px solid ${theme.css.border}`,
            borderRadius: 8, background: theme.css.bg, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 12,
          }}
        >
          {events.length === 0 ? (
            <div style={{ padding: 16, color: theme.css.textMuted }}>
              Waiting for security events…
            </div>
          ) : (
            [...events].reverse().map((e) => (
              <div
                key={e.id}
                style={{ display: 'flex', gap: 10, padding: '8px 12px', borderBottom: `1px solid ${theme.css.border}`, alignItems: 'baseline' }}
              >
                <span style={{ color: theme.css.textMuted, flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>
                  {new Date(e.timestamp).toLocaleTimeString()}
                </span>
                <span
                  style={{
                    flexShrink: 0, fontWeight: 700, color: sevColor(e.severity),
                    textTransform: 'uppercase', fontSize: 10, letterSpacing: '0.04em',
                    minWidth: 56,
                  }}
                >
                  {e.severity}
                </span>
                <span style={{ color: theme.css.text }}>{e.message}</span>
              </div>
            ))
          )}
        </div>
      )}
    </section>
  );
}
