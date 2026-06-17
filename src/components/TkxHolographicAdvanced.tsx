'use client';

// ─────────────────────────────────────────────────────────────────────────────
// TkxHolographic — extended family
//
// Builds on the base TkxHolographic primitives with four higher-level
// patterns that come up in HUDs / mission-control / dashboard layouts:
//
//   TkxHolographicPanel    — multi-section card (header / body / footer
//                            with optional tab strip)
//   TkxHolographicGauge    — circular 0..100 gauge with iridescent ring
//   TkxHolographicProgress — linear progress bar with shimmer fill
//   TkxHolographicTerminal — scrolling monospaced text with blinking cursor
//
// All four reuse the holographic CSS injected by TkxHolographic — call
// injectHolographicStyles() once on the page and the foil shader is live.
// They're zero-dep and respect prefers-reduced-motion.
// ─────────────────────────────────────────────────────────────────────────────

import {
  forwardRef,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { injectHolographicStyles } from './TkxHolographic';
import { useTheme, tkxThemeVars } from '../themes';

// Make sure CSS is registered the first time any extended component renders.
function useEnsureStyles() {
  useEffect(() => {
    injectHolographicStyles();
  }, []);
}

// ── TkxHolographicPanel — multi-section card with optional tabs ─────────────

export interface TkxHolographicPanelProps extends HTMLAttributes<HTMLDivElement> {
  /** Header slot — usually a title + status badge. */
  header?: ReactNode;
  /** Footer slot — usually action buttons. */
  footer?: ReactNode;
  /** Optional tab strip; selecting a tab is the parent's job. */
  tabs?: { id: string; label: string }[];
  /** Currently active tab id (controlled). */
  activeTabId?: string;
  /** Fired when the user clicks a tab. */
  onTabChange?: (id: string) => void;
  /** Accent color for the foil + selected tab underline. */
  accent?: string;
  children?: ReactNode;
}

export const TkxHolographicPanel = forwardRef<HTMLDivElement, TkxHolographicPanelProps>(
  function TkxHolographicPanel(
    { header, footer, tabs, activeTabId, onTabChange, accent = '#00f5d4', children, style, ...rest },
    ref,
  ) {
    useEnsureStyles();
    const theme = useTheme();
    return (
      <div
        ref={ref}
        className="tkx-holo-root"
        style={{
          ...tkxThemeVars(theme),
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          borderRadius: 14,
          background: 'linear-gradient(180deg, rgba(13,13,20,0.85), rgba(8,8,14,0.85))',
          border: `1px solid ${accent}33`,
          boxShadow: `0 0 0 1px ${accent}11, 0 12px 40px rgba(0,0,0,0.5)`,
          overflow: 'hidden',
          color: theme.text,
          ...style,
        }}
        {...rest}
      >
        <span className="tkx-holo-foil" aria-hidden="true" />
        {header && (
          <div
            style={{
              padding: '12px 16px',
              borderBottom: `1px solid ${accent}22`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              position: 'relative',
              zIndex: 1,
            }}
          >
            {header}
          </div>
        )}
        {tabs && tabs.length > 0 && (
          <div
            role="tablist"
            style={{
              display: 'flex',
              gap: 0,
              borderBottom: `1px solid ${accent}22`,
              position: 'relative',
              zIndex: 1,
            }}
          >
            {tabs.map((t) => {
              const on = t.id === activeTabId;
              return (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  onClick={() => onTabChange?.(t.id)}
                  style={{
                    padding: '10px 14px',
                    minHeight: 38,
                    border: 'none',
                    background: 'transparent',
                    color: on ? accent : theme.textMuted,
                    fontWeight: 600,
                    fontSize: 12,
                    cursor: 'pointer',
                    borderBottom: `2px solid ${on ? accent : 'transparent'}`,
                  }}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        )}
        <div style={{ padding: 16, flex: 1, position: 'relative', zIndex: 1, minHeight: 0 }}>
          {children}
        </div>
        {footer && (
          <div
            style={{
              padding: '12px 16px',
              borderTop: `1px solid ${accent}22`,
              position: 'relative',
              zIndex: 1,
            }}
          >
            {footer}
          </div>
        )}
      </div>
    );
  },
);

// ── TkxHolographicGauge — circular 0..100 ring ──────────────────────────────

export interface TkxHolographicGaugeProps {
  /** 0..100. Values outside the range are clamped. */
  value: number;
  /** Diameter in pixels. Default 140. */
  size?: number;
  /** Stroke width as a fraction of size. Default 0.12. */
  thickness?: number;
  /** Accent color for the ring. Default cyan. */
  accent?: string;
  /** Inner label. Defaults to `${value}%`. */
  label?: ReactNode;
  /** Caption below the value. */
  caption?: ReactNode;
  /** ARIA-friendly value text (overrides aria-valuetext). */
  ariaValueText?: string;
  className?: string;
  style?: CSSProperties;
}

export function TkxHolographicGauge({
  value,
  size = 140,
  thickness = 0.12,
  accent = '#00f5d4',
  label,
  caption,
  ariaValueText,
  className,
  style,
}: TkxHolographicGaugeProps) {
  useEnsureStyles();
  const theme = useTheme();
  const v = Math.max(0, Math.min(100, value));
  const stroke = size * thickness;
  const r = (size - stroke) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const C = 2 * Math.PI * r;
  const filled = (v / 100) * C;

  const id = useRef(`holo-gauge-${Math.random().toString(36).slice(2, 8)}`).current;

  return (
    <div
      role="meter"
      aria-valuenow={v}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuetext={ariaValueText ?? `${v.toFixed(0)} percent`}
      className={className}
      style={{
        ...tkxThemeVars(theme),
        position: 'relative',
        width: size,
        height: size,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...style,
      }}
    >
      <svg width={size} height={size} aria-hidden="true" style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={accent} stopOpacity={0.95} />
            <stop offset="50%" stopColor="#7b2ff7" stopOpacity={0.95} />
            <stop offset="100%" stopColor={accent} stopOpacity={0.95} />
          </linearGradient>
        </defs>
        {/* Track */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={`${accent}1a`}
          strokeWidth={stroke}
        />
        {/* Filled arc */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={`url(#${id})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${filled} ${C}`}
          transform={`rotate(-90 ${cx} ${cy})`}
          style={{
            filter: `drop-shadow(0 0 6px ${accent}aa)`,
            transition: 'stroke-dasharray 600ms cubic-bezier(.2,.8,.2,1)',
          }}
        />
      </svg>
      <div
        style={{
          position: 'relative',
          textAlign: 'center',
          zIndex: 1,
          color: theme.text,
        }}
      >
        <div
          style={{
            fontSize: size * 0.22,
            fontWeight: 800,
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            fontVariantNumeric: 'tabular-nums',
            color: accent,
            lineHeight: 1,
            textShadow: `0 0 16px ${accent}88`,
          }}
        >
          {label ?? `${v.toFixed(0)}%`}
        </div>
        {caption && (
          <div style={{ fontSize: 10, color: theme.textMuted, marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            {caption}
          </div>
        )}
      </div>
    </div>
  );
}

// ── TkxHolographicProgress — linear bar with shimmer fill ───────────────────

export interface TkxHolographicProgressProps {
  /** 0..1 fraction. Values outside the range are clamped. */
  value: number;
  /** Optional label shown above the bar. */
  label?: ReactNode;
  /** Optional value text shown to the right of the label. */
  valueLabel?: ReactNode;
  /** Bar height in pixels. Default 8. */
  height?: number;
  /** Accent color. Default cyan. */
  accent?: string;
  /** Show animated shimmer overlay on the fill. Default true. */
  shimmer?: boolean;
  className?: string;
  style?: CSSProperties;
}

export function TkxHolographicProgress({
  value,
  label,
  valueLabel,
  height = 8,
  accent = '#00f5d4',
  shimmer = true,
  className,
  style,
}: TkxHolographicProgressProps) {
  useEnsureStyles();
  const theme = useTheme();
  const v = Math.max(0, Math.min(1, value));
  return (
    <div className={className} style={{ ...tkxThemeVars(theme), ...style }}>
      {(label || valueLabel) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6, fontSize: 12 }}>
          <span style={{ color: theme.textMuted, fontWeight: 600 }}>{label}</span>
          <span style={{ color: accent, fontFamily: 'ui-monospace, monospace', fontVariantNumeric: 'tabular-nums' }}>
            {valueLabel ?? `${(v * 100).toFixed(0)}%`}
          </span>
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={Math.round(v * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
        style={{
          position: 'relative',
          height,
          width: '100%',
          borderRadius: height,
          background: `${accent}14`,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            width: `${v * 100}%`,
            background: `linear-gradient(90deg, ${accent}, #7b2ff7, ${accent})`,
            backgroundSize: '200% 100%',
            animation: shimmer ? 'tkx-holo-shimmer 3s linear infinite' : undefined,
            boxShadow: `0 0 12px ${accent}88`,
            transition: 'width 600ms cubic-bezier(.2,.8,.2,1)',
            borderRadius: height,
          }}
        />
      </div>
    </div>
  );
}

// ── TkxHolographicTerminal — scrolling lines with blinking cursor ───────────

export interface TkxHolographicTerminalProps {
  /** Lines to display, oldest first; the bottom is auto-scrolled into view. */
  lines: string[];
  /** Type-on animation ms per character. Default 12. Set 0 to disable. */
  typeSpeed?: number;
  /** Show prompt prefix on each line. Default '$ '. */
  prompt?: string;
  /** Max visible lines (taller terminals scroll). Default 10. */
  maxLines?: number;
  /** Outer height in pixels. Default 220. */
  height?: number;
  /** Accent color. Default cyan. */
  accent?: string;
  className?: string;
  style?: CSSProperties;
}

export function TkxHolographicTerminal({
  lines,
  typeSpeed = 12,
  prompt = '$ ',
  maxLines = 10,
  height = 220,
  accent = '#00f5d4',
  className,
  style,
}: TkxHolographicTerminalProps) {
  useEnsureStyles();
  const theme = useTheme();
  const wrapRef = useRef<HTMLDivElement | null>(null);
  // Type-on: render each new line character-by-character.
  const [typed, setTyped] = useState<string[]>(() => (typeSpeed === 0 ? lines : []));
  const renderedCount = useRef(0);

  useEffect(() => {
    if (typeSpeed === 0) {
      setTyped(lines);
      return;
    }
    if (lines.length <= renderedCount.current) {
      // Lines were pruned; resync.
      setTyped(lines);
      renderedCount.current = lines.length;
      return;
    }
    let cancelled = false;
    const startIdx = renderedCount.current;
    const target = lines[startIdx] ?? '';
    let i = 0;
    setTyped((prev) => [...prev.slice(0, startIdx), '']);
    const tick = () => {
      if (cancelled) return;
      i += 1;
      setTyped((prev) => {
        const next = prev.slice();
        next[startIdx] = target.slice(0, i);
        return next;
      });
      if (i < target.length) setTimeout(tick, typeSpeed);
      else {
        renderedCount.current = startIdx + 1;
        // If more lines queued, recurse via effect re-run by appending
        // the next typed slot (state change triggers another effect run).
        if (lines.length > renderedCount.current) {
          setTyped((prev) => [...prev, '']);
        }
      }
    };
    tick();
    return () => {
      cancelled = true;
    };
  }, [lines, typeSpeed]);

  // Auto-scroll on every typed change.
  useEffect(() => {
    const el = wrapRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [typed]);

  const visible = typed.slice(-maxLines);
  return (
    <div
      ref={wrapRef}
      role="log"
      aria-live="polite"
      className={className}
      style={{
        ...tkxThemeVars(theme),
        position: 'relative',
        height,
        padding: 12,
        borderRadius: 10,
        background:
          'linear-gradient(180deg, rgba(0,10,20,0.7), rgba(0,5,10,0.9))',
        border: `1px solid ${accent}33`,
        color: accent,
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
        fontSize: 12,
        lineHeight: 1.5,
        overflowY: 'auto',
        boxShadow: `inset 0 0 24px ${accent}14`,
        ...style,
      }}
    >
      <span className="tkx-holo-foil" aria-hidden="true" style={{ borderRadius: 10 }} />
      <pre style={{ margin: 0, position: 'relative', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
        {visible.map((line, i) => (
          <div key={i}>
            <span style={{ color: theme.textMuted }}>{prompt}</span>
            <span style={{ color: accent }}>{line}</span>
            {i === visible.length - 1 && (
              <span
                aria-hidden="true"
                style={{
                  display: 'inline-block',
                  width: '0.6ch',
                  height: '1em',
                  marginLeft: 2,
                  background: accent,
                  verticalAlign: 'text-bottom',
                  animation: 'tkx-holo-cursor 1.1s steps(2) infinite',
                }}
              />
            )}
          </div>
        ))}
      </pre>
      <style>{`
        @keyframes tkx-holo-cursor {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
