'use client';

// ─────────────────────────────────────────────────────────────────────────────
// TkxThemeStudio — visual theme editor
//
// Pick colors with native <input type="color">, see a live preview of every
// major component primitive, get a real-time WCAG contrast badge, then
// export as JSON, TypeScript, or CSS variables.
//
// Why this shipped now:
//   - Designers don't want to file PRs to tweak brand colors
//   - Per-token contrast verification is the audit risk for AAA claims
//   - One component delivers the demo + the actual product (eats own dog food)
// ─────────────────────────────────────────────────────────────────────────────

import {
  useCallback,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import type { ThemeTokens } from '../themes';
import { useTheme, ThemeProvider } from '../themes';

// ── Token metadata: which tokens are editable + how they group ──────────────

interface TokenSlot {
  key: keyof ThemeTokens;
  label: string;
  group: 'surface' | 'text' | 'brand' | 'status';
  /** When set, contrast must meet the threshold against this paired token. */
  contrastAgainst?: keyof ThemeTokens;
  /** AAA threshold for normal text = 7. AA for large text = 4.5. */
  threshold?: number;
}

const SLOTS: TokenSlot[] = [
  { key: 'bg', label: 'Page background', group: 'surface' },
  { key: 'surface', label: 'Card surface', group: 'surface' },
  { key: 'surfaceAlt', label: 'Alt surface', group: 'surface' },
  { key: 'border', label: 'Border', group: 'surface' },
  { key: 'text', label: 'Body text', group: 'text', contrastAgainst: 'bg', threshold: 7 },
  { key: 'textMuted', label: 'Muted text', group: 'text', contrastAgainst: 'bg', threshold: 4.5 },
  { key: 'primary', label: 'Primary', group: 'brand', contrastAgainst: 'bg', threshold: 4.5 },
  { key: 'secondary', label: 'Secondary', group: 'brand', contrastAgainst: 'bg', threshold: 4.5 },
  { key: 'success', label: 'Success', group: 'status', contrastAgainst: 'bg', threshold: 4.5 },
  { key: 'warning', label: 'Warning', group: 'status', contrastAgainst: 'bg', threshold: 4.5 },
  { key: 'danger', label: 'Danger', group: 'status', contrastAgainst: 'bg', threshold: 4.5 },
  { key: 'info', label: 'Info', group: 'status', contrastAgainst: 'bg', threshold: 4.5 },
];

const GROUP_LABEL: Record<TokenSlot['group'], string> = {
  surface: 'Surfaces',
  text: 'Text',
  brand: 'Brand',
  status: 'Status colors',
};

// ── WCAG contrast math ──────────────────────────────────────────────────────

function srgbToLinear(c: number): number {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

function relativeLuminance(hex: string): number {
  const m = hex.replace(/^#/, '').match(/^([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
  if (!m) return 0;
  const [r, g, b] = [m[1], m[2], m[3]].map((h) => parseInt(h, 16));
  return (
    0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b)
  );
}

function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

function gradeContrast(ratio: number): { label: string; color: string } {
  if (ratio >= 7) return { label: 'AAA', color: '#06d6a0' };
  if (ratio >= 4.5) return { label: 'AA', color: '#ffbe0b' };
  if (ratio >= 3) return { label: 'AA Large', color: '#ff8500' };
  return { label: 'fail', color: '#f72585' };
}

// ── Output formats ──────────────────────────────────────────────────────────

function asJSON(tokens: ThemeTokens): string {
  return JSON.stringify(tokens, null, 2);
}

function asTypeScript(tokens: ThemeTokens, name = 'myTheme'): string {
  const lines = [`import type { ThemeTokens } from 'tekivex-ui';`, ``];
  lines.push(`export const ${name}: ThemeTokens = {`);
  for (const [k, v] of Object.entries(tokens)) {
    lines.push(`  ${k}: ${JSON.stringify(v)},`);
  }
  lines.push(`};`);
  return lines.join('\n');
}

function asCSSVars(tokens: ThemeTokens): string {
  const lines = [':root {'];
  for (const [k, v] of Object.entries(tokens)) {
    lines.push(`  --tkx-${k}: ${v};`);
  }
  lines.push('}');
  return lines.join('\n');
}

// ── Public API ──────────────────────────────────────────────────────────────

export interface TkxThemeStudioProps {
  /** Initial theme to load. Default = the current ThemeProvider's theme. */
  initialTheme?: ThemeTokens;
  /** Fired on every change. */
  onChange?: (tokens: ThemeTokens) => void;
  /** Fired when user clicks "Export". */
  onExport?: (format: 'json' | 'ts' | 'css', text: string) => void;
  /** Custom preview slot. Default renders sample components. */
  preview?: ReactNode;
  /** Variable name for the TypeScript export. Default 'myTheme'. */
  exportName?: string;
  className?: string;
  style?: CSSProperties;
}

export function TkxThemeStudio({
  initialTheme,
  onChange,
  onExport,
  preview,
  exportName = 'myTheme',
  className,
  style,
}: TkxThemeStudioProps) {
  const ambient = useTheme();
  const start = initialTheme ?? ambient;
  const [tokens, setTokens] = useState<ThemeTokens>(start);
  const [format, setFormat] = useState<'json' | 'ts' | 'css'>('ts');
  const [copied, setCopied] = useState(false);

  const setToken = useCallback(
    (key: keyof ThemeTokens, value: string) => {
      setTokens((t) => {
        const next = { ...t, [key]: value };
        onChange?.(next);
        return next;
      });
    },
    [onChange],
  );

  const exportText = useMemo(() => {
    if (format === 'json') return asJSON(tokens);
    if (format === 'ts') return asTypeScript(tokens, exportName);
    return asCSSVars(tokens);
  }, [tokens, format, exportName]);

  const reset = useCallback(() => {
    setTokens(start);
    onChange?.(start);
  }, [start, onChange]);

  const groups = useMemo(() => {
    const g: Record<TokenSlot['group'], TokenSlot[]> = {
      surface: [],
      text: [],
      brand: [],
      status: [],
    };
    for (const slot of SLOTS) g[slot.group].push(slot);
    return g;
  }, []);

  const wrap: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'minmax(300px, 380px) 1fr',
    gap: 16,
    color: ambient.text,
    ...style,
  };

  return (
    <div className={className} style={wrap} role="region" aria-label="Theme editor">
      <style>{`
        @media (max-width: 760px) {
          .tk-studio-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* ── Editor panel ─────────────────────────────────────────────────── */}
      <aside
        style={{
          background: ambient.surface,
          border: `1px solid ${ambient.border}`,
          borderRadius: 12,
          padding: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          maxHeight: '80vh',
          overflowY: 'auto',
        }}
      >
        <header style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <h2
            style={{
              margin: 0,
              fontSize: 16,
              fontWeight: 800,
              letterSpacing: '-0.01em',
              flex: 1,
            }}
          >
            Theme Studio
          </h2>
          <button
            type="button"
            onClick={reset}
            style={resetBtn(ambient)}
            aria-label="Reset to original theme"
          >
            ↺ Reset
          </button>
        </header>

        {(Object.keys(groups) as TokenSlot['group'][]).map((group) => (
          <section key={group}>
            <h3
              style={{
                margin: '0 0 10px',
                fontSize: 11,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: ambient.textMuted,
              }}
            >
              {GROUP_LABEL[group]}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {groups[group].map((slot) => (
                <TokenRow
                  key={slot.key as string}
                  slot={slot}
                  value={tokens[slot.key] as string}
                  pairedValue={
                    slot.contrastAgainst
                      ? (tokens[slot.contrastAgainst] as string)
                      : undefined
                  }
                  onChange={(v) => setToken(slot.key, v)}
                />
              ))}
            </div>
          </section>
        ))}

        {/* Export block */}
        <section style={{ marginTop: 8 }}>
          <h3
            style={{
              margin: '0 0 10px',
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: ambient.textMuted,
            }}
          >
            Export
          </h3>
          <div role="tablist" style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
            {(['ts', 'json', 'css'] as const).map((f) => (
              <button
                key={f}
                role="tab"
                type="button"
                aria-selected={format === f}
                onClick={() => setFormat(f)}
                style={tabBtn(ambient, format === f)}
              >
                {f.toUpperCase()}
              </button>
            ))}
          </div>
          <pre
            style={{
              margin: 0,
              padding: 12,
              background: ambient.bg,
              border: `1px solid ${ambient.border}`,
              borderRadius: 8,
              fontSize: 11,
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              color: ambient.text,
              maxHeight: 200,
              overflow: 'auto',
              lineHeight: 1.5,
              whiteSpace: 'pre',
            }}
          >
            <code>{exportText}</code>
          </pre>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard?.writeText(exportText);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
              style={primaryBtn(ambient)}
            >
              {copied ? '✓ Copied' : '📋 Copy'}
            </button>
            <button
              type="button"
              onClick={() => onExport?.(format, exportText)}
              disabled={!onExport}
              style={secondaryBtn(ambient, !onExport)}
            >
              Save…
            </button>
          </div>
        </section>
      </aside>

      {/* ── Preview panel — live components rendered with current tokens ──── */}
      <section
        aria-label="Theme preview"
        style={{
          background: tokens.bg,
          border: `1px solid ${tokens.border}`,
          borderRadius: 12,
          padding: 24,
          minHeight: 480,
          color: tokens.text,
        }}
      >
        <ThemeProvider theme={tokens}>{preview ?? <DefaultPreview />}</ThemeProvider>
      </section>
    </div>
  );
}

// ── Subcomponents ───────────────────────────────────────────────────────────

function TokenRow({
  slot,
  value,
  pairedValue,
  onChange,
}: {
  slot: TokenSlot;
  value: string;
  pairedValue?: string;
  onChange: (v: string) => void;
}) {
  const ambient = useTheme();
  const ratio = pairedValue ? contrastRatio(value, pairedValue) : null;
  const grade = ratio ? gradeContrast(ratio) : null;
  const hits = slot.threshold && ratio !== null ? ratio >= slot.threshold : null;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '32px 1fr auto',
        gap: 10,
        alignItems: 'center',
      }}
    >
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={`${slot.label} color`}
        style={{
          width: 32,
          height: 32,
          padding: 0,
          border: `1px solid ${ambient.border}`,
          borderRadius: 6,
          background: 'transparent',
          cursor: 'pointer',
        }}
      />
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: ambient.text }}>{slot.label}</div>
        <input
          type="text"
          value={value}
          onChange={(e) => {
            const v = e.target.value;
            if (/^#[0-9a-f]{0,6}$/i.test(v)) onChange(v);
          }}
          aria-label={`${slot.label} hex`}
          style={{
            background: 'transparent',
            border: 'none',
            color: ambient.textMuted,
            fontFamily: 'monospace',
            fontSize: 12,
            padding: 0,
            outline: 'none',
            width: '100%',
          }}
        />
      </div>
      {grade && (
        <span
          title={`Contrast vs ${slot.contrastAgainst}: ${ratio?.toFixed(2)}:1 — needs ${slot.threshold}:1`}
          style={{
            padding: '3px 8px',
            borderRadius: 999,
            fontSize: 10,
            fontWeight: 700,
            background: hits === false ? '#f7258522' : `${grade.color}22`,
            color: hits === false ? '#f72585' : grade.color,
            letterSpacing: '0.04em',
            whiteSpace: 'nowrap',
          }}
        >
          {ratio?.toFixed(1)} · {grade.label}
        </span>
      )}
    </div>
  );
}

function DefaultPreview() {
  const t = useTheme();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: t.text }}>
        Live preview
      </h2>
      <p style={{ margin: 0, color: t.textMuted }}>
        Edit the tokens on the left. Sample components render here with the current
        theme. Contrast badges flag any token that fails WCAG.
      </p>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button style={btnSwatch(t.primary, t.bg)}>Primary</button>
        <button style={btnSwatch(t.secondary, t.bg)}>Secondary</button>
        <button style={btnSwatch(t.success, t.bg)}>Success</button>
        <button style={btnSwatch(t.warning, t.bg)}>Warning</button>
        <button style={btnSwatch(t.danger, t.bg)}>Danger</button>
        <button style={btnSwatch(t.info, t.bg)}>Info</button>
      </div>

      <div
        style={{
          padding: 16,
          background: t.surface,
          border: `1px solid ${t.border}`,
          borderRadius: 12,
        }}
      >
        <h3 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 700, color: t.text }}>
          Card surface
        </h3>
        <p style={{ margin: 0, color: t.textMuted, fontSize: 13 }}>
          Cards use the <code>surface</code> token with <code>border</code> as outline.
        </p>
      </div>

      <div
        style={{
          padding: 16,
          background: t.surfaceAlt,
          border: `1px solid ${t.border}`,
          borderRadius: 12,
        }}
      >
        <h3 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 700, color: t.text }}>
          Alt surface
        </h3>
        <p style={{ margin: 0, color: t.textMuted, fontSize: 13 }}>
          Used for nested panels (e.g. modal headers, kanban cards).
        </p>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {(['primary', 'secondary', 'success', 'warning', 'danger', 'info'] as const).map((k) => (
          <span key={k} style={badgeSwatch(t[k] as string)}>
            {k}
          </span>
        ))}
      </div>

      <input
        type="text"
        placeholder="Sample input"
        style={{
          background: t.surface,
          border: `1px solid ${t.border}`,
          color: t.text,
          padding: '10px 14px',
          borderRadius: 8,
          fontSize: 14,
          outline: 'none',
          minHeight: 44,
        }}
      />

      <p style={{ color: t.text, fontSize: 14, margin: 0 }}>
        Body text on page background — must be 7:1 for AAA.
      </p>
      <p style={{ color: t.textMuted, fontSize: 13, margin: 0 }}>
        Muted text — must be at least 4.5:1.
      </p>
    </div>
  );
}

// ── Style helpers ───────────────────────────────────────────────────────────

const resetBtn = (t: ThemeTokens): CSSProperties => ({
  background: 'transparent',
  border: `1px solid ${t.border}`,
  color: t.textMuted,
  padding: '6px 12px',
  borderRadius: 6,
  fontSize: 12,
  cursor: 'pointer',
  fontWeight: 600,
});

const tabBtn = (t: ThemeTokens, active: boolean): CSSProperties => ({
  flex: 1,
  background: active ? t.primary : 'transparent',
  color: active ? t.bg : t.text,
  border: `1px solid ${active ? t.primary : t.border}`,
  padding: '6px 10px',
  borderRadius: 6,
  fontSize: 11,
  fontWeight: 700,
  cursor: 'pointer',
  letterSpacing: '0.05em',
});

const primaryBtn = (t: ThemeTokens): CSSProperties => ({
  flex: 1,
  background: t.primary,
  color: t.bg,
  border: 'none',
  padding: '8px 14px',
  borderRadius: 6,
  fontSize: 12,
  fontWeight: 700,
  cursor: 'pointer',
  minHeight: 36,
});

const secondaryBtn = (t: ThemeTokens, disabled: boolean): CSSProperties => ({
  flex: 1,
  background: 'transparent',
  color: t.textMuted,
  border: `1px solid ${t.border}`,
  padding: '8px 14px',
  borderRadius: 6,
  fontSize: 12,
  fontWeight: 600,
  cursor: disabled ? 'not-allowed' : 'pointer',
  opacity: disabled ? 0.5 : 1,
  minHeight: 36,
});

const btnSwatch = (bg: string, fg: string): CSSProperties => ({
  background: bg,
  color: fg,
  padding: '8px 14px',
  border: 'none',
  borderRadius: 6,
  fontWeight: 700,
  fontSize: 12,
  cursor: 'pointer',
  minHeight: 36,
});

const badgeSwatch = (color: string): CSSProperties => ({
  padding: '4px 10px',
  background: `${color}22`,
  color,
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
  borderRadius: 999,
  border: `1px solid ${color}55`,
});
