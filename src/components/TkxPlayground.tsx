// ── TkxPlayground ─────────────────────────────────────────────────────────────
// In-browser live component playground. Type JSX, see it render instantly.
// Uses new Function() evaluation, an error boundary, quantum component
// suggestions via AmplitudeAmplifier, and real-time render-time metrics.

import { useState, useCallback, useRef, useEffect, type ReactNode } from 'react';
import React from 'react';
import { useTheme } from '../themes';
import { AmplitudeAmplifier } from '../engine/quantum-ai';

// ── Public API ────────────────────────────────────────────────────────────────

export interface PlaygroundExample {
  label: string;
  code: string;
}

export interface TkxPlaygroundProps {
  defaultCode?: string;
  examples?: PlaygroundExample[];
  height?: number;
  imports?: Record<string, unknown>;
}

// ── Built-in examples ─────────────────────────────────────────────────────────

const BUILT_IN_EXAMPLES: PlaygroundExample[] = [
  {
    label: 'Hello World',
    code: `<div style={{ padding: 24, fontFamily: 'sans-serif', color: '#e8e8f4' }}>
  <h2 style={{ margin: 0 }}>👋 Hello, TkxPlayground!</h2>
  <p style={{ marginTop: 8, opacity: 0.7 }}>Edit the code on the left to see live updates.</p>
</div>`,
  },
  {
    label: 'Button Styles',
    code: `<div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', padding: 24 }}>
  {['primary', 'success', 'danger', 'warning', 'info'].map(color => (
    <button
      key={color}
      style={{
        padding: '8px 18px',
        borderRadius: 8,
        border: 'none',
        background: color === 'primary' ? '#00f5d4' : color === 'success' ? '#06d6a0' : color === 'danger' ? '#f72585' : color === 'warning' ? '#ffbe0b' : '#3a86ff',
        color: '#0a0a0f',
        fontWeight: 700,
        cursor: 'pointer',
        textTransform: 'capitalize',
      }}
    >
      {color}
    </button>
  ))}
</div>`,
  },
  {
    label: 'Card Grid',
    code: `<div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, padding: 24 }}>
  {['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta'].map(name => (
    <div key={name} style={{
      background: '#1a1a2e',
      borderRadius: 10,
      border: '1px solid #2a2a3e',
      padding: '16px',
    }}>
      <div style={{ fontWeight: 700, color: '#00f5d4', marginBottom: 4 }}>{name}</div>
      <div style={{ fontSize: 12, color: '#8888aa' }}>Quantum module {name.toLowerCase()}</div>
    </div>
  ))}
</div>`,
  },
  {
    label: 'Animated Counter',
    code: `(() => {
  const [count, setCount] = React.useState(0);
  return (
    <div style={{ padding: 32, textAlign: 'center', fontFamily: 'sans-serif' }}>
      <div style={{ fontSize: 64, fontWeight: 900, color: '#00f5d4', marginBottom: 16 }}>
        {count}
      </div>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
        <button onClick={() => setCount(c => c - 1)} style={{ padding: '8px 20px', borderRadius: 8, border: '1px solid #2a2a3e', background: '#1a1a2e', color: '#e8e8f4', fontSize: 20, cursor: 'pointer' }}>−</button>
        <button onClick={() => setCount(0)} style={{ padding: '8px 20px', borderRadius: 8, border: '1px solid #2a2a3e', background: '#1a1a2e', color: '#8888aa', cursor: 'pointer' }}>Reset</button>
        <button onClick={() => setCount(c => c + 1)} style={{ padding: '8px 20px', borderRadius: 8, border: '1px solid #2a2a3e', background: '#1a1a2e', color: '#e8e8f4', fontSize: 20, cursor: 'pointer' }}>+</button>
      </div>
    </div>
  );
})()`,
  },
  {
    label: 'Data Table',
    code: `(() => {
  const rows = [
    { id: 1, name: 'Hydrogen', symbol: 'H', mass: 1.008 },
    { id: 2, name: 'Helium',   symbol: 'He', mass: 4.003 },
    { id: 3, name: 'Lithium',  symbol: 'Li', mass: 6.941 },
    { id: 4, name: 'Carbon',   symbol: 'C',  mass: 12.011 },
    { id: 5, name: 'Nitrogen', symbol: 'N',  mass: 14.007 },
  ];
  const cell = { padding: '8px 14px', borderBottom: '1px solid #2a2a3e', color: '#e8e8f4', fontSize: 13 };
  const hcell = { ...cell, color: '#8888aa', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' };
  return (
    <div style={{ padding: 16 }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'sans-serif' }}>
        <thead>
          <tr>{['ID','Element','Symbol','Atomic Mass'].map(h => <th key={h} style={hcell}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.id} style={{ transition: 'background 0.15s' }}>
              <td style={cell}>{r.id}</td>
              <td style={cell}>{r.name}</td>
              <td style={{ ...cell, color: '#00f5d4', fontWeight: 700 }}>{r.symbol}</td>
              <td style={cell}>{r.mass}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
})()`,
  },
];

// ── Error Boundary (class component) ─────────────────────────────────────────

interface ErrorBoundaryProps {
  children: ReactNode;
  onError: (msg: string) => void;
}
interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }
  componentDidCatch(error: Error) {
    this.props.onError(error.message);
  }
  componentDidUpdate(prev: ErrorBoundaryProps) {
    // Reset when children change (new render)
    if (prev.children !== this.props.children && this.state.hasError) {
      this.setState({ hasError: false });
    }
  }
  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

// ── Code evaluator ────────────────────────────────────────────────────────────

function evalCode(
  code: string,
  importsObj: Record<string, unknown>,
): { element: ReactNode | null; error: string | null; renderMs: number } {
  const t0 = performance.now();
  try {
    // Wrap raw JSX expression: if it looks like JSX (starts with <) wrap in parens
    const wrapped = code.trim();
    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    const fn = new Function(
      'React',
      'imports',
      `
      "use strict";
      const { ${Object.keys(importsObj).join(', ')} } = imports;
      return (${wrapped});
    `,
    ) as (r: typeof React, i: Record<string, unknown>) => ReactNode;
    const element = fn(React, importsObj);
    const renderMs = parseFloat((performance.now() - t0).toFixed(2));
    return { element, error: null, renderMs };
  } catch (err) {
    const renderMs = parseFloat((performance.now() - t0).toFixed(2));
    return { element: null, error: err instanceof Error ? err.message : String(err), renderMs };
  }
}

// ── Line numbers overlay ──────────────────────────────────────────────────────

function LineNumbers({ code, lineHeight }: { code: string; lineHeight: number }) {
  const lines = code.split('\n');
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '36px',
        padding: '12px 0',
        textAlign: 'right',
        paddingRight: '8px',
        userSelect: 'none',
        pointerEvents: 'none',
        fontSize: '12px',
        lineHeight: `${lineHeight}px`,
        color: '#555577',
        fontFamily: '"Fira Code", "Cascadia Code", "Consolas", monospace',
        boxSizing: 'border-box',
      }}
    >
      {lines.map((_, i) => (
        <div key={i}>{i + 1}</div>
      ))}
    </div>
  );
}

// ── Amplifier (amplitude-based suggestions) ───────────────────────────────────

const COMPONENT_CORPUS = [
  'TkxButton', 'TkxInput', 'TkxCard', 'TkxModal', 'TkxTable',
  'TkxSelect', 'TkxCheckbox', 'TkxRadio', 'TkxSwitch', 'TkxSlider',
  'TkxBadge', 'TkxAlert', 'TkxToast', 'TkxTooltip', 'TkxPopover',
  'TkxTabs', 'TkxAccordion', 'TkxDrawer', 'TkxDropdown', 'TkxMenu',
  'TkxForm', 'TkxDataGrid', 'TkxChart', 'TkxSpinner', 'TkxSkeleton',
  'TkxAvatar', 'TkxTag', 'TkxDivider', 'TkxProgress', 'TkxStatistic',
  'TkxQuantumForm', 'TkxPlayground',
];

const amplifier = new AmplitudeAmplifier();

function extractLastToken(code: string): string {
  const match = code.match(/([A-Z][a-zA-Z0-9]*)$/);
  return match ? match[1] : '';
}

function querySuggestions(query: string, topK = 4): { name: string; amplitude: number }[] {
  if (!query || query.length < 2) return [];
  const q = query.toLowerCase();
  const results = amplifier.amplify(
    COMPONENT_CORPUS,
    (name) => {
      const lower = name.toLowerCase();
      if (lower.startsWith(q)) return 1.0;
      if (lower.includes(q)) return 0.7;
      // bigram overlap
      let score = 0;
      for (let i = 0; i < q.length - 1; i++) {
        if (lower.includes(q.slice(i, i + 2))) score += 0.15;
      }
      return Math.min(score, 0.5);
    },
    0.1,
  );
  return results.slice(0, topK).map((r) => ({
    name: COMPONENT_CORPUS[r.index] ?? '',
    amplitude: parseFloat(r.combined.toFixed(3)),
  })).filter((s) => s.name !== '');
}

// ── Main Playground Component ─────────────────────────────────────────────────

export function TkxPlayground({
  defaultCode,
  examples: userExamples,
  height = 480,
  imports = {},
}: TkxPlaygroundProps) {
  const theme = useTheme();
  const allExamples = [...BUILT_IN_EXAMPLES, ...(userExamples ?? [])];
  const initialCode = defaultCode ?? BUILT_IN_EXAMPLES[0]!.code;

  const [code, setCode] = useState(initialCode);
  const [preview, setPreview] = useState<{ element: ReactNode | null; error: string | null; renderMs: number }>({
    element: null,
    error: null,
    renderMs: 0,
  });
  const [boundaryError, setBoundaryError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<{ name: string; amplitude: number }[]>([]);
  const [copied, setCopied] = useState(false);
  const [activeExample, setActiveExample] = useState<number>(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const LINE_HEIGHT = 18;

  // Debounced evaluation
  const evalTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runEval = useCallback(
    (src: string) => {
      setBoundaryError(null);
      const result = evalCode(src, imports);
      setPreview(result);
    },
    [imports],
  );

  useEffect(() => {
    if (evalTimerRef.current) clearTimeout(evalTimerRef.current);
    evalTimerRef.current = setTimeout(() => runEval(code), 300);
    return () => {
      if (evalTimerRef.current) clearTimeout(evalTimerRef.current);
    };
  }, [code, runEval]);

  // Initial render
  useEffect(() => {
    runEval(initialCode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCodeChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const val = e.target.value;
      setCode(val);
      // Quantum suggestions
      const token = extractLastToken(val);
      if (token.length >= 2) {
        setSuggestions(querySuggestions(token, 4));
      } else {
        setSuggestions([]);
      }
    },
    [],
  );

  const handleExampleSelect = useCallback(
    (idx: number) => {
      const ex = allExamples[idx];
      if (!ex) return;
      setActiveExample(idx);
      setCode(ex.code);
      setSuggestions([]);
    },
    [allExamples],
  );

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  }, [code]);

  const handleReset = useCallback(() => {
    setCode(initialCode);
    setActiveExample(0);
    setSuggestions([]);
  }, [initialCode]);

  const applySuggestion = useCallback(
    (name: string) => {
      const token = extractLastToken(code);
      if (token) {
        setCode((prev) => prev.slice(0, prev.lastIndexOf(token)) + name);
      }
      setSuggestions([]);
    },
    [code],
  );

  const hasError = preview.error !== null || boundaryError !== null;
  const errorMsg = preview.error ?? boundaryError ?? '';

  const editorBg = theme.bg;
  const previewBg = theme.surfaceAlt;
  const borderColor = theme.border;
  const statusBg = theme.surface;

  const editorAreaStyle: React.CSSProperties = {
    width: '50%',
    display: 'flex',
    flexDirection: 'column',
    borderRight: `1px solid ${borderColor}`,
    position: 'relative',
  };

  const toolbarStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 10px',
    borderBottom: `1px solid ${borderColor}`,
    backgroundColor: theme.surface,
    flexWrap: 'wrap',
  };

  const iconBtnStyle: React.CSSProperties = {
    padding: '3px 10px',
    borderRadius: '6px',
    border: `1px solid ${borderColor}`,
    backgroundColor: 'transparent',
    color: theme.textMuted,
    fontSize: '11px',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'color 0.15s, border-color 0.15s',
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        border: `1px solid ${borderColor}`,
        borderRadius: '12px',
        overflow: 'hidden',
        backgroundColor: editorBg,
        fontFamily: 'inherit',
        boxSizing: 'border-box',
        position: 'relative',
      }}
    >
      {/* ── Header bar ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 14px',
          borderBottom: `1px solid ${borderColor}`,
          backgroundColor: theme.surface,
        }}
      >
        <span style={{ fontSize: '12px', fontWeight: 700, color: theme.primary, letterSpacing: '0.05em' }}>
          ⚛ TkxPlayground
        </span>
        <span style={{ fontSize: '10px', color: theme.textMuted }}>Live JSX Preview</span>
      </div>

      {/* ── Example tabs ── */}
      <div
        style={{
          display: 'flex',
          gap: '4px',
          padding: '6px 10px',
          borderBottom: `1px solid ${borderColor}`,
          backgroundColor: theme.surface,
          overflowX: 'auto',
        }}
      >
        {allExamples.map((ex, i) => (
          <button
            key={i}
            onClick={() => handleExampleSelect(i)}
            style={{
              padding: '3px 10px',
              borderRadius: '6px',
              border: `1px solid ${i === activeExample ? theme.primary : borderColor}`,
              backgroundColor: i === activeExample ? `${theme.primary}20` : 'transparent',
              color: i === activeExample ? theme.primary : theme.textMuted,
              fontSize: '11px',
              fontWeight: i === activeExample ? 700 : 400,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              fontFamily: 'inherit',
              transition: 'all 0.15s',
            }}
          >
            {ex.label}
          </button>
        ))}
      </div>

      {/* ── Split pane ── */}
      <div style={{ display: 'flex', height: `${height}px` }}>
        {/* Left: Editor */}
        <div style={editorAreaStyle}>
          {/* Toolbar */}
          <div style={toolbarStyle}>
            <span style={{ fontSize: '11px', color: theme.textMuted, marginRight: 'auto' }}>editor.tsx</span>
            <button onClick={handleCopy} style={iconBtnStyle} title="Copy code">
              {copied ? '✓ Copied' : '⎘ Copy'}
            </button>
            <button onClick={handleReset} style={iconBtnStyle} title="Reset to default">
              ↺ Reset
            </button>
          </div>

          {/* Code area */}
          <div style={{ position: 'relative', flex: 1, overflow: 'hidden' }}>
            <LineNumbers code={code} lineHeight={LINE_HEIGHT} />
            <textarea
              ref={textareaRef}
              value={code}
              onChange={handleCodeChange}
              spellCheck={false}
              autoCorrect="off"
              autoCapitalize="off"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                padding: '12px 12px 12px 44px',
                margin: 0,
                border: 'none',
                outline: 'none',
                resize: 'none',
                backgroundColor: editorBg,
                color: theme.text,
                fontSize: '12px',
                lineHeight: `${LINE_HEIGHT}px`,
                fontFamily: '"Fira Code", "Cascadia Code", "Consolas", "Courier New", monospace',
                boxSizing: 'border-box',
                overflowY: 'auto',
                tabSize: 2,
              }}
            />
          </div>

          {/* Quantum suggestions overlay */}
          {suggestions.length > 0 && (
            <div
              style={{
                position: 'absolute',
                bottom: '40px',
                left: '44px',
                zIndex: 10,
                backgroundColor: theme.surface,
                border: `1px solid ${theme.primary}44`,
                borderRadius: '8px',
                overflow: 'hidden',
                boxShadow: `0 4px 16px rgba(0,0,0,0.3)`,
                minWidth: '180px',
              }}
            >
              <div
                style={{
                  padding: '4px 10px 4px',
                  fontSize: '10px',
                  color: theme.primary,
                  fontWeight: 700,
                  borderBottom: `1px solid ${borderColor}`,
                  letterSpacing: '0.05em',
                }}
              >
                ⚛ Quantum Suggestions
              </div>
              {suggestions.map((s) => (
                <button
                  key={s.name}
                  onClick={() => applySuggestion(s.name)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: '6px 10px',
                    border: 'none',
                    backgroundColor: 'transparent',
                    color: theme.text,
                    fontSize: '12px',
                    fontFamily: '"Fira Code", monospace',
                    cursor: 'pointer',
                    textAlign: 'left',
                    gap: '12px',
                  }}
                >
                  <span>{s.name}</span>
                  <span
                    style={{
                      fontSize: '10px',
                      color: theme.textMuted,
                      flexShrink: 0,
                    }}
                  >
                    {Math.round(s.amplitude * 100)}%
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Preview */}
        <div
          style={{
            width: '50%',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              padding: '6px 10px',
              borderBottom: `1px solid ${borderColor}`,
              backgroundColor: theme.surface,
              fontSize: '11px',
              color: theme.textMuted,
              fontWeight: 600,
            }}
          >
            Preview
          </div>
          <div
            style={{
              flex: 1,
              overflow: 'auto',
              backgroundColor: previewBg,
              position: 'relative',
            }}
          >
            {hasError ? (
              <div
                style={{
                  padding: '16px',
                  color: theme.danger,
                  fontFamily: '"Fira Code", monospace',
                  fontSize: '12px',
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                <div
                  style={{
                    marginBottom: '8px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                  </svg>
                  Runtime Error
                </div>
                {errorMsg}
              </div>
            ) : (
              <ErrorBoundary onError={setBoundaryError}>
                <div style={{ minHeight: '100%' }}>{preview.element}</div>
              </ErrorBoundary>
            )}
          </div>
        </div>
      </div>

      {/* ── Status bar ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          padding: '4px 12px',
          backgroundColor: statusBg,
          borderTop: `1px solid ${borderColor}`,
          fontSize: '11px',
          color: theme.textMuted,
        }}
      >
        {/* Error / OK indicator */}
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            color: hasError ? theme.danger : theme.success,
            fontWeight: 600,
          }}
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: hasError ? theme.danger : theme.success,
              display: 'inline-block',
            }}
          />
          {hasError ? 'Error' : 'OK'}
        </span>

        {/* Render time */}
        <span>⏱ {preview.renderMs} ms</span>

        {/* Lines */}
        <span>{code.split('\n').length} lines</span>

        {/* Characters */}
        <span>{code.length} chars</span>

        {/* Quantum suggestions hint */}
        {suggestions.length > 0 && (
          <span style={{ marginLeft: 'auto', color: theme.primary, fontWeight: 600 }}>
            ⚛ {suggestions.length} suggestion{suggestions.length > 1 ? 's' : ''}
          </span>
        )}
      </div>
    </div>
  );
}

TkxPlayground.displayName = 'TkxPlayground';
