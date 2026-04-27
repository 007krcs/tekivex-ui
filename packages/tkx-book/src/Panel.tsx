// ─────────────────────────────────────────────────────────────────────────────
// Bottom panel — tabbed addon container.
//
// Each tab is contributed by an Addon. The active tab is persisted to
// the URL (?addon=controls) so links share full state.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState, type CSSProperties } from 'react';
import { ADDONS } from './addons';
import type { AddonContext } from './addons/registry';

export interface PanelProps {
  ctx: AddonContext;
}

export function Panel({ ctx }: PanelProps) {
  const [active, setActive] = useState<string>(() => {
    const q = new URLSearchParams(window.location.search);
    return q.get('addon') ?? ADDONS[0].id;
  });

  // Persist to URL.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    q.set('addon', active);
    window.history.replaceState({}, '', `${window.location.pathname}?${q.toString()}`);
  }, [active]);

  const activeAddon = ADDONS.find((a) => a.id === active) ?? ADDONS[0];

  const wrap: CSSProperties = {
    borderTop: '1px solid var(--tkx-border)',
    display: 'grid',
    gridTemplateRows: '36px 1fr',
    overflow: 'hidden',
    background: 'var(--tkx-surface)',
  };
  const tabsRow: CSSProperties = {
    display: 'flex',
    borderBottom: '1px solid var(--tkx-border)',
    background: 'var(--tkx-bg)',
    overflow: 'auto',
  };
  const tabBtn = (selected: boolean): CSSProperties => ({
    padding: '0 14px',
    height: '100%',
    border: 'none',
    background: 'transparent',
    color: selected ? 'var(--tkx-primary)' : 'var(--tkx-textMuted)',
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    cursor: 'pointer',
    borderBottom: `2px solid ${selected ? 'var(--tkx-primary)' : 'transparent'}`,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
  });
  const body: CSSProperties = { overflow: 'hidden', minHeight: 0 };

  return (
    <div style={wrap}>
      <div style={tabsRow} role="tablist">
        {ADDONS.map((a) => {
          const badge = a.badge?.(ctx);
          return (
            <button
              key={a.id}
              type="button"
              role="tab"
              aria-selected={a.id === active}
              onClick={() => setActive(a.id)}
              style={tabBtn(a.id === active)}
            >
              {a.title}
              {badge !== null && badge !== undefined && (
                <span
                  style={{
                    fontSize: 10,
                    padding: '1px 6px',
                    borderRadius: 8,
                    background: 'var(--tkx-danger)',
                    color: 'white',
                  }}
                >
                  {badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
      <div style={body}>{activeAddon.render(ctx)}</div>
    </div>
  );
}
