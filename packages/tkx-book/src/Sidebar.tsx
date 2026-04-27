import { useMemo, useState, type CSSProperties } from 'react';
import { stories } from '../stories';

export interface SidebarProps {
  activeSlug: string;
  onActivate: (slug: string) => void;
}

export function Sidebar({ activeSlug, onActivate }: SidebarProps) {
  const [filter, setFilter] = useState('');
  const list = useMemo(() => {
    const f = filter.trim().toLowerCase();
    const slugs = Object.keys(stories);
    if (!f) return slugs;
    return slugs.filter((s) => s.toLowerCase().includes(f) || stories[s].name.toLowerCase().includes(f));
  }, [filter]);

  const inputStyle: CSSProperties = {
    width: '100%',
    padding: '8px 10px',
    border: '1px solid var(--tkx-border)',
    borderRadius: 6,
    background: 'var(--tkx-bg)',
    color: 'var(--tkx-text)',
    fontSize: 13,
    outline: 'none',
  };

  const linkStyle = (active: boolean): CSSProperties => ({
    display: 'block',
    padding: '8px 12px',
    borderLeft: `3px solid ${active ? 'var(--tkx-primary)' : 'transparent'}`,
    background: active ? 'var(--tkx-surfaceAlt, #1a1a2e)' : 'transparent',
    color: 'var(--tkx-text)',
    textDecoration: 'none',
    fontSize: 13,
    cursor: 'pointer',
    border: 'none',
    width: '100%',
    textAlign: 'left',
    borderRadius: 0,
    fontWeight: active ? 600 : 400,
  });

  return (
    <div style={{ padding: 12 }}>
      <input
        type="text"
        placeholder="Filter…"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        style={inputStyle}
        aria-label="Filter stories"
      />
      <div style={{ marginTop: 8 }}>
        {list.map((slug) => (
          <button
            key={slug}
            type="button"
            onClick={() => onActivate(slug)}
            style={linkStyle(slug === activeSlug)}
          >
            {stories[slug].name}
          </button>
        ))}
        {list.length === 0 && (
          <div style={{ padding: 12, fontSize: 12, color: 'var(--tkx-textMuted)' }}>
            No matches.
          </div>
        )}
      </div>
    </div>
  );
}
