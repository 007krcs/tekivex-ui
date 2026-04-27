// ─────────────────────────────────────────────────────────────────────────────
// A11y addon — runs axe-core against the rendered story DOM and surfaces
// violations grouped by impact level.
//
// Why axe-core: it's the same engine Storybook's a11y addon uses, the
// same engine Pa11y / Lighthouse / Cypress-axe use. It's a 600KB pure-JS
// library with no native deps. Runs entirely in the browser.
//
// We re-run on every prop change + every story switch, debounced to 500ms.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState, type CSSProperties } from 'react';
import type { Addon, AddonContext } from './registry';

interface AxeViolation {
  id: string;
  impact: 'minor' | 'moderate' | 'serious' | 'critical' | null;
  description: string;
  help: string;
  helpUrl: string;
  nodes: Array<{ html: string; target: string[]; failureSummary?: string }>;
}

// Lazy-load axe-core. ~600KB but only loaded when the a11y tab is active.
let axePromise: Promise<typeof import('axe-core')> | null = null;
function loadAxe() {
  if (!axePromise) axePromise = import('axe-core');
  return axePromise;
}

const IMPACT_COLOR: Record<string, string> = {
  critical: '#f72585',
  serious: '#ff6b35',
  moderate: '#ffbe0b',
  minor: '#3a86ff',
};

const IMPACT_RANK: Record<string, number> = {
  critical: 0,
  serious: 1,
  moderate: 2,
  minor: 3,
};

function A11yPanel({ containerRef, slug, props }: AddonContext) {
  const [state, setState] = useState<{
    violations: AxeViolation[];
    passes: number;
    running: boolean;
    error: string | null;
  }>({ violations: [], passes: 0, running: false, error: null });

  useEffect(() => {
    if (!containerRef.current) return;
    let cancelled = false;
    setState((s) => ({ ...s, running: true, error: null }));

    // Debounce — wait for any prop-driven re-render to settle.
    const t = setTimeout(async () => {
      try {
        const axe = await loadAxe();
        const target = containerRef.current;
        if (!target || cancelled) return;
        const result = await axe.default.run(target, {
          rules: {
            'region': { enabled: false }, // playground content isn't a landmark page
            'page-has-heading-one': { enabled: false },
          },
        });
        if (cancelled) return;
        const violations: AxeViolation[] = result.violations.map((v) => ({
          id: v.id,
          impact: v.impact ?? null,
          description: v.description,
          help: v.help,
          helpUrl: v.helpUrl,
          nodes: v.nodes.map((n) => ({
            html: n.html,
            target: n.target as string[],
            failureSummary: n.failureSummary,
          })),
        }));
        // Sort by impact severity.
        violations.sort(
          (a, b) =>
            (IMPACT_RANK[a.impact ?? 'minor'] ?? 9) -
            (IMPACT_RANK[b.impact ?? 'minor'] ?? 9),
        );
        setState({
          violations,
          passes: result.passes.length,
          running: false,
          error: null,
        });
      } catch (err) {
        if (!cancelled) {
          setState({
            violations: [],
            passes: 0,
            running: false,
            error: (err as Error)?.message ?? 'axe-core failed',
          });
        }
      }
    }, 500);

    return () => {
      cancelled = true;
      clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, JSON.stringify(props)]);

  const wrapStyle: CSSProperties = { padding: 16, height: '100%', overflow: 'auto' };
  const summaryStyle: CSSProperties = {
    display: 'flex',
    gap: 12,
    alignItems: 'center',
    marginBottom: 12,
    fontSize: 13,
  };
  const chipStyle = (color: string): CSSProperties => ({
    padding: '2px 8px',
    borderRadius: 12,
    background: color,
    color: 'white',
    fontSize: 11,
    fontWeight: 700,
  });

  if (state.running && state.violations.length === 0) {
    return <div style={wrapStyle}>Running axe-core…</div>;
  }
  if (state.error) {
    return <div style={{ ...wrapStyle, color: '#f72585' }}>axe error: {state.error}</div>;
  }

  return (
    <div style={wrapStyle}>
      <div style={summaryStyle}>
        {state.violations.length === 0 ? (
          <span style={chipStyle('#06d6a0')}>0 violations</span>
        ) : (
          <span style={chipStyle('#f72585')}>
            {state.violations.length} violation{state.violations.length === 1 ? '' : 's'}
          </span>
        )}
        <span style={{ color: 'var(--tkx-textMuted)' }}>{state.passes} passes</span>
        {state.running && <span style={{ color: 'var(--tkx-textMuted)' }}>· re-running…</span>}
      </div>

      {state.violations.length === 0 && (
        <div style={{ color: 'var(--tkx-textMuted)', fontSize: 13 }}>
          No accessibility issues detected by axe-core. (This is a static
          check; pair with the screen-reader matrix at{' '}
          <code>docs/a11y-screen-reader-matrix.md</code> for full coverage.)
        </div>
      )}

      {state.violations.map((v) => (
        <div
          key={v.id}
          style={{
            border: '1px solid var(--tkx-border)',
            borderRadius: 8,
            padding: 12,
            marginBottom: 8,
            background: 'var(--tkx-bg)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={chipStyle(IMPACT_COLOR[v.impact ?? 'minor'] ?? '#888')}>
              {v.impact ?? 'unknown'}
            </span>
            <strong style={{ fontSize: 13, color: 'var(--tkx-text)' }}>{v.help}</strong>
          </div>
          <div style={{ fontSize: 12, color: 'var(--tkx-textMuted)', marginBottom: 6 }}>
            {v.description}
          </div>
          <a
            href={v.helpUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: 11, color: 'var(--tkx-primary)' }}
          >
            How to fix →
          </a>
          {v.nodes.length > 0 && (
            <details style={{ marginTop: 6 }}>
              <summary style={{ fontSize: 11, cursor: 'pointer', color: 'var(--tkx-textMuted)' }}>
                {v.nodes.length} affected node{v.nodes.length === 1 ? '' : 's'}
              </summary>
              <pre
                style={{
                  fontSize: 10,
                  background: 'var(--tkx-surfaceAlt)',
                  padding: 8,
                  borderRadius: 4,
                  overflow: 'auto',
                  margin: '6px 0 0',
                  color: 'var(--tkx-textMuted)',
                }}
              >
                {v.nodes.map((n, i) => `[${i}] ${n.target.join(' ')}\n${n.html}`).join('\n\n')}
              </pre>
            </details>
          )}
        </div>
      ))}
    </div>
  );
}

export const a11yAddon: Addon = {
  id: 'a11y',
  title: 'A11y',
  badge: () => null, // dynamic badge would require running axe per story up-front
  render: (ctx) => <A11yPanel {...ctx} />,
};
