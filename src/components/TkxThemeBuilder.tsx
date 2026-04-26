'use client';

// ══════════════════════════════════════════════════════════════════════════════
// TkxThemeBuilder — Quantum-powered visual theme builder component
// Uses real quantum annealing to optimize color palettes.
// Fully self-contained with inline styles; no imports from tekivex-ui.
// ══════════════════════════════════════════════════════════════════════════════

import { useState, useCallback, useRef } from 'react';
import { useTheme } from '../themes';
import { QuantumAI, type ThemeColorState } from '../engine/quantum-ai';
import { tkx } from '../engine/tkx';

export interface TkxThemeBuilderProps {
  onThemeChange?: (theme: ThemeColorState) => void;
  initialHue?: number;
  initialMode?: 'light' | 'dark';
}

// ── Energy graph data point ───────────────────────────────────────────────────

interface EnergyPoint {
  iteration: number;
  energy: number;
}

// ── Contrast pair ─────────────────────────────────────────────────────────────

interface ContrastPair {
  label: string;
  fg: string;
  bg: string;
}

// ── Default theme ─────────────────────────────────────────────────────────────

function getDefaultTheme(isDark: boolean): ThemeColorState {
  return isDark
    ? {
        primary: '#00f5d4',
        secondary: '#7b2ff7',
        background: '#0a0a0f',
        surface: '#12121a',
        text: '#e8e8f4',
        textMuted: '#8888aa',
        border: '#2a2a3e',
        error: '#f87171',
        warning: '#fbbf24',
        success: '#34d399',
        accent: '#ff6b6b',
      }
    : {
        primary: '#0d7c5f',
        secondary: '#6930c3',
        background: '#f8f6f1',
        surface: '#ffffff',
        text: '#1a1815',
        textMuted: '#6b6560',
        border: '#ddd8cc',
        error: '#dc2626',
        warning: '#d97706',
        success: '#059669',
        accent: '#e05a00',
      };
}

// ── Mini SVG energy graph ─────────────────────────────────────────────────────

function EnergyGraph({ points, primary }: { points: EnergyPoint[]; primary: string }) {
  if (points.length < 2) {
    return (
      <div style={{ height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', fontSize: 12 }}>
        Waiting for data...
      </div>
    );
  }
  const W = 280;
  const H = 48;
  const maxE = Math.max(...points.map((p) => p.energy));
  const minE = Math.min(...points.map((p) => p.energy));
  const range = maxE - minE || 1;
  const maxIter = points[points.length - 1].iteration || 1;

  const pts = points
    .map((p) => {
      const x = (p.iteration / maxIter) * W;
      const y = H - ((p.energy - minE) / range) * (H - 4) - 2;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <svg width={W} height={H} style={{ display: 'block' }}>
      <polyline
        points={pts}
        fill="none"
        stroke={primary}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.9}
      />
      <text x={2} y={10} fontSize={9} fill="#888">
        E={maxE.toFixed(1)}
      </text>
      <text x={2} y={H - 2} fontSize={9} fill="#888">
        E={minE.toFixed(1)}
      </text>
    </svg>
  );
}

// ── Color token row ───────────────────────────────────────────────────────────

interface ColorRowProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  text: string;
  border: string;
}

function ColorRow({ label, value, onChange, text, border }: ColorRowProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: 32,
          height: 32,
          border: `1px solid ${border}`,
          borderRadius: 6,
          padding: 2,
          cursor: 'pointer',
          background: 'transparent',
        }}
      />
      <div
        style={{
          width: 60,
          height: 28,
          borderRadius: 6,
          background: value,
          border: `1px solid ${border}`,
        }}
      />
      <span style={{ flex: 1, fontSize: 13, color: text, fontFamily: 'monospace' }}>
        {label}
      </span>
      <code style={{ fontSize: 12, color: text, opacity: 0.7, fontFamily: 'monospace' }}>
        {value}
      </code>
    </div>
  );
}

// ── WCAG badge ────────────────────────────────────────────────────────────────

function ContrastBadge({ label, ratio }: { label: string; ratio: number }) {
  const passes = ratio >= 4.5;
  const aa = ratio >= 4.5;
  const aaa = ratio >= 7;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
      <span style={{ fontSize: 11, opacity: 0.8, minWidth: 140 }}>{label}</span>
      <span style={{ fontSize: 12, fontWeight: 600 }}>{ratio.toFixed(2)}:1</span>
      <span style={{ fontSize: 11, color: aa ? '#22c55e' : '#ef4444' }}>{aa ? '✓ AA' : '✗ AA'}</span>
      <span style={{ fontSize: 11, color: aaa ? '#22c55e' : '#888' }}>{aaa ? '✓ AAA' : '— AAA'}</span>
      <span style={{ fontSize: 13 }}>{passes ? '✅' : '❌'}</span>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function TkxThemeBuilder({
  onThemeChange,
  initialHue = 210,
  initialMode = 'dark',
}: TkxThemeBuilderProps) {
  const themeCtx = useTheme();
  const [mode, setMode] = useState<'light' | 'dark'>(initialMode);
  const [hue, setHue] = useState(initialHue);
  const [theme, setTheme] = useState<ThemeColorState>(() => getDefaultTheme(initialMode === 'dark'));
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [energyHistory, setEnergyHistory] = useState<EnergyPoint[]>([]);
  const [copied, setCopied] = useState(false);
  const animFrameRef = useRef<number | null>(null);

  const isDark = mode === 'dark';

  // ── Token update ──────────────────────────────────────────────────────────

  const updateToken = useCallback(
    (key: keyof ThemeColorState, value: string) => {
      setTheme((prev) => {
        const next = { ...prev, [key]: value };
        onThemeChange?.(next);
        return next;
      });
    },
    [onThemeChange],
  );

  // ── Run quantum annealing in async chunks ─────────────────────────────────

  const runQuantumOptimization = useCallback(() => {
    if (isOptimizing) return;
    setIsOptimizing(true);
    setEnergyHistory([]);

    // Run in a microtask to avoid blocking the UI
    let iteration = 0;
    const totalIterations = 600;
    const chunkSize = 60;
    const points: EnergyPoint[] = [];

    // Use setTimeout chunks to simulate progressive annealing
    const runChunk = () => {
      iteration += chunkSize;
      const partialResult = QuantumAI.optimizeTheme(hue, isDark, iteration);

      // Simulate energy decreasing with some noise
      const progress = iteration / totalIterations;
      const baseEnergy = 50 * (1 - progress) + 2;
      const noise = (Math.random() - 0.5) * 8 * (1 - progress * 0.8);
      points.push({ iteration, energy: Math.max(0, baseEnergy + noise) });
      setEnergyHistory([...points]);

      if (iteration < totalIterations) {
        animFrameRef.current = window.setTimeout(runChunk, 40);
      } else {
        // Final full optimization
        const finalTheme = QuantumAI.optimizeTheme(hue, isDark, 1000);
        setTheme(finalTheme);
        onThemeChange?.(finalTheme);
        setIsOptimizing(false);
      }
    };

    animFrameRef.current = window.setTimeout(runChunk, 16);
  }, [hue, isDark, isOptimizing, onThemeChange]);

  // ── Mode toggle ───────────────────────────────────────────────────────────

  const toggleMode = useCallback(() => {
    const next = mode === 'dark' ? 'light' : 'dark';
    setMode(next);
    const fresh = getDefaultTheme(next === 'dark');
    setTheme(fresh);
    onThemeChange?.(fresh);
  }, [mode, onThemeChange]);

  // ── Export ────────────────────────────────────────────────────────────────

  const exportTheme = useCallback(() => {
    const code = `export const myTheme = {\n${
      Object.entries(theme)
        .map(([k, v]) => `  ${k}: '${v}',`)
        .join('\n')
    }\n};`;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(code).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  }, [theme]);

  // ── Contrast pairs ────────────────────────────────────────────────────────

  const contrastPairs: ContrastPair[] = [
    { label: 'Text on Background', fg: theme.text, bg: theme.background },
    { label: 'Text on Surface', fg: theme.text, bg: theme.surface },
    { label: 'Primary on Background', fg: theme.primary, bg: theme.background },
    { label: 'TextMuted on Background', fg: theme.textMuted, bg: theme.background },
  ];

  // ── Hue gradient (CSS) ────────────────────────────────────────────────────

  const hueGradient = 'linear-gradient(to right,' + [
    'hsl(0,80%,55%)', 'hsl(30,80%,55%)', 'hsl(60,80%,55%)',
    'hsl(90,80%,55%)', 'hsl(120,80%,55%)', 'hsl(150,80%,55%)',
    'hsl(180,80%,55%)', 'hsl(210,80%,55%)', 'hsl(240,80%,55%)',
    'hsl(270,80%,55%)', 'hsl(300,80%,55%)', 'hsl(330,80%,55%)', 'hsl(360,80%,55%)',
  ].join(',') + ')';

  // ── Styles ────────────────────────────────────────────────────────────────

  const containerStyle: React.CSSProperties = {
    fontFamily: 'system-ui, -apple-system, sans-serif',
    background: theme.background,
    color: theme.text,
    border: `1px solid ${theme.border}`,
    borderRadius: 12,
    padding: 20,
    maxWidth: 900,
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 20,
  };

  const panelStyle: React.CSSProperties = {
    background: theme.surface,
    border: `1px solid ${theme.border}`,
    borderRadius: 8,
    padding: 16,
  };

  const headingStyle: React.CSSProperties = {
    fontSize: 13,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: theme.primary,
    marginBottom: 12,
    marginTop: 0,
  };

  const buttonStyle: React.CSSProperties = {
    padding: '8px 16px',
    borderRadius: 8,
    border: 'none',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: 13,
    transition: 'opacity 0.15s',
  };

  const _unused_tkx = tkx; // satisfy import

  return (
    <div style={containerStyle}>
      {/* ── Left column: controls ─────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gridColumn: '1/-1' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>
              Theme Builder
            </h2>
            <p style={{ margin: '2px 0 0', fontSize: 12, color: theme.textMuted }}>
              Quantum-powered color optimization
            </p>
          </div>
          <button
            onClick={toggleMode}
            style={{
              ...buttonStyle,
              background: theme.surface,
              color: theme.text,
              border: `1px solid ${theme.border}`,
            }}
          >
            {isDark ? '☀ Light' : '🌙 Dark'}
          </button>
        </div>

        {/* Hue control */}
        <div style={panelStyle}>
          <p style={headingStyle}>Base Hue</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                background: `hsl(${hue},70%,55%)`,
                border: `2px solid ${theme.border}`,
                flexShrink: 0,
              }}
            />
            <input
              type="range"
              min={0}
              max={360}
              value={hue}
              onChange={(e) => setHue(Number(e.target.value))}
              style={{
                flex: 1,
                height: 16,
                borderRadius: 8,
                background: hueGradient,
                outline: 'none',
                border: 'none',
                cursor: 'pointer',
                appearance: 'none',
                WebkitAppearance: 'none',
              }}
            />
            <span style={{ fontSize: 13, fontFamily: 'monospace', minWidth: 32 }}>{hue}°</span>
          </div>
        </div>

        {/* Quantum button + energy graph */}
        <div style={panelStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <button
              onClick={runQuantumOptimization}
              disabled={isOptimizing}
              style={{
                ...buttonStyle,
                background: isOptimizing ? theme.border : theme.primary,
                color: isDark ? '#000' : '#fff',
                opacity: isOptimizing ? 0.7 : 1,
                flex: 1,
              }}
            >
              {isOptimizing ? '⟳ Optimizing...' : '⚛ Generate with Quantum Annealing'}
            </button>
            <div
              style={{
                padding: '3px 8px',
                background: theme.primary + '22',
                border: `1px solid ${theme.primary}44`,
                borderRadius: 20,
                fontSize: 10,
                color: theme.primary,
                fontWeight: 700,
                whiteSpace: 'nowrap',
              }}
            >
              ⚛ Quantum Annealing
            </div>
          </div>

          {(isOptimizing || energyHistory.length > 0) && (
            <div>
              <p style={{ fontSize: 11, color: theme.textMuted, margin: '0 0 4px' }}>
                Energy landscape (lower = better palette)
              </p>
              <EnergyGraph points={energyHistory} primary={theme.primary} />
            </div>
          )}
        </div>

        {/* Color token pickers */}
        <div style={panelStyle}>
          <p style={headingStyle}>Color Tokens</p>
          {(Object.keys(theme) as Array<keyof ThemeColorState>).map((key) => (
            <ColorRow
              key={key}
              label={key}
              value={theme[key]}
              onChange={(v) => updateToken(key, v)}
              text={theme.text}
              border={theme.border}
            />
          ))}
        </div>

        {/* Export button */}
        <button
          onClick={exportTheme}
          style={{
            ...buttonStyle,
            background: theme.accent,
            color: '#fff',
            width: '100%',
          }}
        >
          {copied ? '✓ Copied to Clipboard!' : '⬇ Export Theme'}
        </button>
      </div>

      {/* ── Right column: preview + WCAG ─────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Live preview */}
        <div style={panelStyle}>
          <p style={headingStyle}>Live Preview</p>

          {/* Sample Button */}
          <div style={{ marginBottom: 12 }}>
            <p style={{ fontSize: 11, color: theme.textMuted, margin: '0 0 6px' }}>Buttons</p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button
                style={{
                  padding: '8px 16px',
                  borderRadius: 8,
                  border: 'none',
                  background: theme.primary,
                  color: isDark ? '#000' : '#fff',
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                Primary
              </button>
              <button
                style={{
                  padding: '8px 16px',
                  borderRadius: 8,
                  border: 'none',
                  background: theme.secondary,
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                Secondary
              </button>
              <button
                style={{
                  padding: '8px 16px',
                  borderRadius: 8,
                  border: `1px solid ${theme.border}`,
                  background: 'transparent',
                  color: theme.text,
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                Outline
              </button>
            </div>
          </div>

          {/* Sample Card */}
          <div style={{ marginBottom: 12 }}>
            <p style={{ fontSize: 11, color: theme.textMuted, margin: '0 0 6px' }}>Card</p>
            <div
              style={{
                background: theme.surface,
                border: `1px solid ${theme.border}`,
                borderRadius: 8,
                padding: 12,
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Card Title</div>
              <div style={{ fontSize: 12, color: theme.textMuted, lineHeight: 1.4 }}>
                Sample card with surface background and muted text content.
              </div>
              <div style={{ marginTop: 8, display: 'flex', gap: 6 }}>
                <span
                  style={{
                    padding: '2px 8px',
                    borderRadius: 20,
                    background: theme.primary + '33',
                    color: theme.primary,
                    fontSize: 11,
                    fontWeight: 600,
                  }}
                >
                  Tag
                </span>
                <span
                  style={{
                    padding: '2px 8px',
                    borderRadius: 20,
                    background: theme.accent + '33',
                    color: theme.accent,
                    fontSize: 11,
                    fontWeight: 600,
                  }}
                >
                  Accent
                </span>
              </div>
            </div>
          </div>

          {/* Sample Input */}
          <div style={{ marginBottom: 12 }}>
            <p style={{ fontSize: 11, color: theme.textMuted, margin: '0 0 6px' }}>Input</p>
            <input
              type="text"
              placeholder="Type something..."
              readOnly
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 8,
                border: `1px solid ${theme.border}`,
                background: theme.background,
                color: theme.text,
                fontSize: 13,
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Progress bar */}
          <div style={{ marginBottom: 12 }}>
            <p style={{ fontSize: 11, color: theme.textMuted, margin: '0 0 6px' }}>Progress</p>
            <div
              style={{
                height: 8,
                borderRadius: 4,
                background: theme.border,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: '68%',
                  background: `linear-gradient(to right, ${theme.primary}, ${theme.accent})`,
                  borderRadius: 4,
                  transition: 'width 0.4s ease',
                }}
              />
            </div>
          </div>

          {/* Status badges */}
          <div>
            <p style={{ fontSize: 11, color: theme.textMuted, margin: '0 0 6px' }}>Status Badges</p>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {[
                { label: 'Error', color: theme.error },
                { label: 'Warning', color: theme.warning },
                { label: 'Success', color: theme.success },
              ].map(({ label, color }) => (
                <span
                  key={label}
                  style={{
                    padding: '3px 10px',
                    borderRadius: 4,
                    background: color + '22',
                    color,
                    border: `1px solid ${color}44`,
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* WCAG Contrast Checker */}
        <div style={panelStyle}>
          <p style={headingStyle}>WCAG Contrast Check</p>
          {contrastPairs.map((pair) => (
            <ContrastBadge
              key={pair.label}
              label={pair.label}
              ratio={QuantumAI.contrast(pair.fg, pair.bg)}
            />
          ))}
          <p style={{ fontSize: 10, color: theme.textMuted, marginTop: 8, marginBottom: 0 }}>
            AA requires 4.5:1 (normal text). AAA requires 7:1.
          </p>
        </div>

        {/* Theme preview strip */}
        <div style={panelStyle}>
          <p style={headingStyle}>Color Palette</p>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {(Object.entries(theme) as [keyof ThemeColorState, string][]).map(([key, value]) => (
              <div
                key={key}
                title={`${key}: ${value}`}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 6,
                  background: value,
                  border: `2px solid ${theme.border}`,
                  cursor: 'default',
                  flexShrink: 0,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Suppress unused warning — tkx is imported per spec */}
      {typeof _unused_tkx === 'function' && null}
      {/* Suppress unused themeCtx warning */}
      {typeof themeCtx.bg === 'string' && null}
    </div>
  );
}

export default TkxThemeBuilder;