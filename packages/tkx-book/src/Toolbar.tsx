import type { CSSProperties } from 'react';
import type { ColorScheme } from 'tekivex-ui';

type Viewport = 'mobile' | 'tablet' | 'desktop';

export interface ToolbarProps {
  theme: ColorScheme;
  onTheme: (t: ColorScheme) => void;
  viewport: Viewport;
  onViewport: (v: Viewport) => void;
  storyName?: string;
  shareUrl: string;
}

export function Toolbar({ theme, onTheme, viewport, onViewport, storyName, shareUrl }: ToolbarProps) {
  const wrap: CSSProperties = {
    height: 48,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '0 16px',
    borderBottom: '1px solid var(--tkx-border)',
    background: 'var(--tkx-surface)',
    color: 'var(--tkx-text)',
    fontSize: 13,
  };

  const btn = (active: boolean): CSSProperties => ({
    padding: '4px 10px',
    border: `1px solid ${active ? 'var(--tkx-primary)' : 'var(--tkx-border)'}`,
    borderRadius: 4,
    background: active ? 'var(--tkx-primary)' : 'transparent',
    color: active ? 'var(--tkx-bg)' : 'var(--tkx-text)',
    cursor: 'pointer',
    fontSize: 12,
    fontWeight: 500,
  });

  return (
    <div style={wrap}>
      <strong style={{ color: 'var(--tkx-primary)' }}>tkx-book</strong>
      <span style={{ color: 'var(--tkx-textMuted)', fontSize: 12 }}>
        {storyName ?? 'tekivex-ui playground'}
      </span>
      <div style={{ flex: 1 }} />

      <span style={{ color: 'var(--tkx-textMuted)', fontSize: 11 }}>VIEWPORT</span>
      {(['mobile', 'tablet', 'desktop'] as const).map((v) => (
        <button
          key={v}
          type="button"
          onClick={() => onViewport(v)}
          style={btn(viewport === v)}
          aria-pressed={viewport === v}
        >
          {v}
        </button>
      ))}

      <span style={{ color: 'var(--tkx-textMuted)', fontSize: 11, marginLeft: 12 }}>THEME</span>
      {(['light', 'dark', 'auto'] as const).map((t) => (
        <button
          key={t}
          type="button"
          onClick={() => onTheme(t)}
          style={btn(theme === t)}
          aria-pressed={theme === t}
        >
          {t}
        </button>
      ))}

      <button
        type="button"
        onClick={() => navigator.clipboard?.writeText(shareUrl)}
        style={{ ...btn(false), marginLeft: 12 }}
        title="Copy shareable URL"
      >
        copy URL
      </button>
    </div>
  );
}
