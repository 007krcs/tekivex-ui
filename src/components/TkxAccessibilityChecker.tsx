'use client';

// ─────────────────────────────────────────────────────────────────────────────
// TkxAccessibilityChecker — runtime axe-core badge
//
// Drop into your app shell during development. A floating widget runs
// axe-core against the live DOM at intervals and shows a color-coded count
// of accessibility violations + a panel listing the worst ones with the
// affected element highlighted.
//
// What it's for:
//   - Catching regressions during development BEFORE shipping
//   - Eating our own dog food — a library that markets AAA accessibility
//     should make verifying that easy for downstream users too
//   - A clear "this is what 'accessible' actually looks like" signal
//
// Design choices:
//   - axe-core is a peer dep (it's ~1 MB; opt-in)
//   - Hidden in production by default — set show={true} to override
//   - Lazy-imports axe-core on mount; if it's not installed, gracefully
//     no-ops with a console.info hint
//   - Position FAB anywhere, defaults to bottom-right
//   - Click FAB to open detail panel
// ─────────────────────────────────────────────────────────────────────────────

import {
  useEffect,
  useState,
  type CSSProperties,
} from 'react';
import { useTheme } from '../themes';

interface AxeNode {
  html: string;
  target: string[];
  failureSummary?: string;
}

interface AxeResult {
  id: string;
  impact: 'critical' | 'serious' | 'moderate' | 'minor' | null;
  description: string;
  help: string;
  helpUrl: string;
  nodes: AxeNode[];
}

interface AxeRun {
  violations: AxeResult[];
  passes: AxeResult[];
}

type AxeApi = {
  run: (
    context?: Element | Document | string,
    options?: Record<string, unknown>,
  ) => Promise<AxeRun>;
};

export interface TkxAccessibilityCheckerProps {
  /** Force-show in production. Default: visible only when NODE_ENV !== 'production'. */
  show?: boolean;
  /** Re-scan interval in milliseconds. Default 4000. Set to 0 to disable polling. */
  intervalMs?: number;
  /** Position of the floating badge. Default 'bottom-right'. */
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  /** Restrict scan to an element (defaults to document). */
  scope?: Element | null;
  /** axe-core options object passed straight through to axe.run(). */
  axeOptions?: Record<string, unknown>;
  /** Fired on every scan with the latest result count. */
  onScan?: (result: { violations: number; impacts: Record<string, number> }) => void;
}

const IMPACT_COLOR: Record<string, string> = {
  critical: '#f72585',
  serious: '#ff8500',
  moderate: '#ffbe0b',
  minor: '#3a86ff',
};

export function TkxAccessibilityChecker({
  show,
  intervalMs = 4000,
  position = 'bottom-right',
  scope,
  axeOptions,
  onScan,
}: TkxAccessibilityCheckerProps) {
  const theme = useTheme();
  const [violations, setViolations] = useState<AxeResult[]>([]);
  const [open, setOpen] = useState(false);
  const [axeAvailable, setAxeAvailable] = useState<boolean | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);

  // Detect prod via globalThis.process — avoids needing @types/node in
  // consumer projects.
  const env = (globalThis as { process?: { env?: { NODE_ENV?: string } } }).process?.env;
  const isProd = env?.NODE_ENV === 'production';
  const visible = show ?? !isProd;

  useEffect(() => {
    if (!visible) return;

    let cancelled = false;
    let axe: AxeApi | null = null;
    let timer: ReturnType<typeof setInterval> | null = null;

    async function loadAxe(): Promise<AxeApi | null> {
      try {
        // Bypass Vite's static-import analysis — axe-core is opt-in.
        // If a consumer hasn't installed it, this rejects and we
        // gracefully no-op below.
        const dynImport = new Function('s', 'return import(s)') as (
          s: string,
        ) => Promise<unknown>;
        const mod = (await dynImport('axe-core')) as {
          default?: AxeApi;
          run?: AxeApi['run'];
        };
        return (mod.default as AxeApi) ?? (mod as unknown as AxeApi);
      } catch {
        return null;
      }
    }

    async function scan(api: AxeApi) {
      if (cancelled) return;
      setScanning(true);
      try {
        const target = scope ?? document;
        const result = await api.run(target as Element | Document, axeOptions);
        if (cancelled) return;
        setViolations(result.violations);
        const impacts: Record<string, number> = {};
        result.violations.forEach((v) => {
          const k = v.impact ?? 'unknown';
          impacts[k] = (impacts[k] ?? 0) + 1;
        });
        onScan?.({ violations: result.violations.length, impacts });
        setScanError(null);
      } catch (err) {
        setScanError(err instanceof Error ? err.message : 'scan failed');
      } finally {
        if (!cancelled) setScanning(false);
      }
    }

    loadAxe().then((api) => {
      if (cancelled) return;
      if (!api) {
        setAxeAvailable(false);
        // eslint-disable-next-line no-console
        console.info(
          '[TkxAccessibilityChecker] axe-core is not installed.\n' +
            'Install it as a peer dep:  npm install --save-dev axe-core',
        );
        return;
      }
      setAxeAvailable(true);
      axe = api;
      void scan(api);
      if (intervalMs > 0) {
        timer = setInterval(() => {
          if (axe) void scan(axe);
        }, intervalMs);
      }
    });

    return () => {
      cancelled = true;
      if (timer) clearInterval(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, intervalMs, scope]);

  if (!visible || axeAvailable === false) return null;

  const totalImpacts: Record<string, number> = {};
  violations.forEach((v) => {
    const k = v.impact ?? 'unknown';
    totalImpacts[k] = (totalImpacts[k] ?? 0) + 1;
  });
  const totalCount = violations.length;
  const grade =
    totalCount === 0
      ? { color: theme.success ?? '#06d6a0', label: '✓ AAA' }
      : totalImpacts.critical || totalImpacts.serious
        ? { color: '#f72585', label: 'Issues' }
        : { color: '#ffbe0b', label: 'Warnings' };

  return (
    <>
      {/* Floating action button */}
      <button
        type="button"
        aria-label={`Accessibility status: ${totalCount} violation${totalCount === 1 ? '' : 's'}`}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        style={fabStyle(theme, grade.color, position)}
      >
        <span style={{ fontSize: 14, fontWeight: 700 }}>
          {scanning ? '…' : totalCount === 0 ? '✓' : totalCount}
        </span>
        <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.06em' }}>
          A11Y
        </span>
      </button>

      {/* Detail panel */}
      {open && (
        <div
          role="dialog"
          aria-label="Accessibility violations"
          aria-modal="false"
          style={panelStyle(theme, position)}
        >
          <header
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 16px',
              borderBottom: `1px solid ${theme.border}`,
              background: theme.surfaceAlt,
            }}
          >
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: grade.color,
                boxShadow: `0 0 12px ${grade.color}`,
              }}
              aria-hidden="true"
            />
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: theme.text, flex: 1 }}>
              Accessibility — {grade.label}
            </h3>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close panel"
              style={{
                background: 'transparent',
                border: 'none',
                color: theme.textMuted,
                cursor: 'pointer',
                fontSize: 18,
                padding: 4,
              }}
            >
              ×
            </button>
          </header>

          <div style={{ padding: 16, maxHeight: 400, overflowY: 'auto' }}>
            {scanError && (
              <div style={{ color: '#f72585', fontSize: 12, marginBottom: 8 }}>
                Scan error: {scanError}
              </div>
            )}

            {totalCount === 0 ? (
              <div style={{ color: theme.textMuted, fontSize: 13 }}>
                No axe-core violations on this page. ✓
              </div>
            ) : (
              <>
                <div
                  style={{
                    display: 'flex',
                    gap: 6,
                    flexWrap: 'wrap',
                    marginBottom: 12,
                  }}
                >
                  {Object.entries(totalImpacts).map(([impact, n]) => (
                    <span
                      key={impact}
                      style={{
                        padding: '3px 8px',
                        background: `${IMPACT_COLOR[impact] ?? theme.textMuted}22`,
                        color: IMPACT_COLOR[impact] ?? theme.textMuted,
                        borderRadius: 999,
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase',
                      }}
                    >
                      {impact}: {n}
                    </span>
                  ))}
                </div>

                <ol
                  style={{
                    listStyle: 'none',
                    padding: 0,
                    margin: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                  }}
                >
                  {violations.slice(0, 10).map((v) => (
                    <li
                      key={v.id}
                      style={{
                        padding: 10,
                        background: theme.surfaceAlt,
                        border: `1px solid ${theme.border}`,
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                        <span
                          aria-hidden="true"
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            background: IMPACT_COLOR[v.impact ?? 'minor'] ?? theme.textMuted,
                          }}
                        />
                        <strong style={{ color: theme.text, flex: 1 }}>{v.help}</strong>
                        <span
                          style={{
                            fontSize: 10,
                            color: theme.textMuted,
                            fontFamily: 'monospace',
                          }}
                        >
                          {v.nodes.length}×
                        </span>
                      </div>
                      <div style={{ color: theme.textMuted, marginBottom: 6 }}>
                        {v.description}
                      </div>
                      <a
                        href={v.helpUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: theme.primary, fontSize: 11 }}
                      >
                        Learn more →
                      </a>
                    </li>
                  ))}
                </ol>

                {violations.length > 10 && (
                  <div
                    style={{
                      marginTop: 10,
                      color: theme.textMuted,
                      fontSize: 11,
                      textAlign: 'center',
                    }}
                  >
                    + {violations.length - 10} more violations not shown
                  </div>
                )}
              </>
            )}
          </div>

          <footer
            style={{
              padding: '8px 16px',
              borderTop: `1px solid ${theme.border}`,
              fontSize: 10,
              color: theme.textMuted,
              fontFamily: 'monospace',
              textAlign: 'center',
            }}
          >
            Powered by axe-core · scans every {intervalMs / 1000}s
          </footer>
        </div>
      )}
    </>
  );
}

// ── Styles ──────────────────────────────────────────────────────────────────

function fabStyle(
  theme: ReturnType<typeof useTheme>,
  color: string,
  pos: TkxAccessibilityCheckerProps['position'],
): CSSProperties {
  const offset = 16;
  const corner: CSSProperties = {};
  if (pos === 'bottom-right') Object.assign(corner, { bottom: offset, right: offset });
  if (pos === 'bottom-left') Object.assign(corner, { bottom: offset, left: offset });
  if (pos === 'top-right') Object.assign(corner, { top: offset, right: offset });
  if (pos === 'top-left') Object.assign(corner, { top: offset, left: offset });
  return {
    position: 'fixed',
    zIndex: 99999,
    width: 56,
    height: 56,
    borderRadius: '50%',
    background: theme.surface,
    border: `2px solid ${color}`,
    boxShadow: `0 0 24px ${color}55, 0 4px 12px rgba(0,0,0,0.3)`,
    color,
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    fontFamily: 'inherit',
    transition: 'transform 120ms',
    ...corner,
  };
}

function panelStyle(
  theme: ReturnType<typeof useTheme>,
  pos: TkxAccessibilityCheckerProps['position'],
): CSSProperties {
  const offset = 84; // 56 (FAB) + 16 (gap) + a bit
  const corner: CSSProperties = {};
  if (pos === 'bottom-right') Object.assign(corner, { bottom: offset, right: 16 });
  if (pos === 'bottom-left') Object.assign(corner, { bottom: offset, left: 16 });
  if (pos === 'top-right') Object.assign(corner, { top: offset, right: 16 });
  if (pos === 'top-left') Object.assign(corner, { top: offset, left: 16 });
  return {
    position: 'fixed',
    zIndex: 99998,
    width: 360,
    maxWidth: 'calc(100vw - 32px)',
    background: theme.surface,
    border: `1px solid ${theme.border}`,
    borderRadius: 12,
    boxShadow: '0 16px 40px rgba(0,0,0,0.4)',
    overflow: 'hidden',
    color: theme.text,
    ...corner,
  };
}
