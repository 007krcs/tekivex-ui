// ─────────────────────────────────────────────────────────────────────────────
// Viewport addon — device-frame chrome around the canvas.
//
// Goes beyond the basic mobile/tablet/desktop switcher in the toolbar.
// Renders a CSS-only device outline (notch, rounded corners, status bar)
// around the story so consumers see how it looks in actual device
// geometry — not just "375 px wide".
//
// This addon is special: it doesn't render a panel tab; instead it
// modifies the canvas frame style. We expose it as a side-effect tab
// that just contains a device picker.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState, type CSSProperties } from 'react';
import type { Addon, AddonContext } from './registry';

export type DeviceProfile = {
  id: string;
  name: string;
  width: number;
  height: number;
  /** Override user-agent for the story iframe (currently unused — story renders inline). */
  userAgent?: string;
  /** CSS for the device frame. Optional — we use an SVG notch overlay if absent. */
  frame?: CSSProperties;
};

export const DEVICE_PROFILES: DeviceProfile[] = [
  { id: 'iphone-14',         name: 'iPhone 14',         width: 390, height: 844 },
  { id: 'iphone-se',         name: 'iPhone SE',         width: 375, height: 667 },
  { id: 'pixel-7',           name: 'Pixel 7',           width: 412, height: 915 },
  { id: 'galaxy-s23',        name: 'Galaxy S23',        width: 360, height: 780 },
  { id: 'ipad-mini',         name: 'iPad Mini',         width: 744, height: 1133 },
  { id: 'ipad-pro-11',       name: 'iPad Pro 11',       width: 834, height: 1194 },
  { id: 'macbook-13',        name: 'MacBook 13"',       width: 1280, height: 800 },
  { id: 'desktop-1440',      name: 'Desktop 1440',      width: 1440, height: 900 },
];

// Custom event channel for the canvas to listen to.
const VIEWPORT_EVENT = 'tkx-book-viewport-change';

export function dispatchViewport(profile: DeviceProfile | null) {
  window.dispatchEvent(new CustomEvent(VIEWPORT_EVENT, { detail: profile }));
}

export function useViewport(): DeviceProfile | null {
  const [profile, setProfile] = useState<DeviceProfile | null>(null);
  useEffect(() => {
    const handler = (e: Event) => setProfile((e as CustomEvent).detail as DeviceProfile | null);
    window.addEventListener(VIEWPORT_EVENT, handler);
    return () => window.removeEventListener(VIEWPORT_EVENT, handler);
  }, []);
  return profile;
}

function ViewportPanel({}: AddonContext) {
  const [active, setActive] = useState<string | null>(null);

  const choose = (id: string | null) => {
    setActive(id);
    const p = id ? DEVICE_PROFILES.find((d) => d.id === id) : null;
    dispatchViewport(p ?? null);
  };

  const wrap: CSSProperties = { padding: 16, height: '100%', overflow: 'auto' };
  const grid: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: 8,
  };
  const card = (selected: boolean): CSSProperties => ({
    padding: 12,
    borderRadius: 8,
    border: `1px solid ${selected ? 'var(--tkx-primary)' : 'var(--tkx-border)'}`,
    background: selected ? 'var(--tkx-primary)' : 'var(--tkx-bg)',
    color: selected ? 'var(--tkx-bg)' : 'var(--tkx-text)',
    cursor: 'pointer',
    fontSize: 12,
    textAlign: 'left',
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  });

  return (
    <div style={wrap}>
      <div style={{ marginBottom: 12, fontSize: 12, color: 'var(--tkx-textMuted)' }}>
        Pick a device profile to render the canvas at exact geometry. Click again to reset.
      </div>
      <div style={grid}>
        <button type="button" onClick={() => choose(null)} style={card(active === null)}>
          <strong>Reset</strong>
          <span>Fluid width</span>
        </button>
        {DEVICE_PROFILES.map((d) => (
          <button
            key={d.id}
            type="button"
            onClick={() => choose(d.id)}
            style={card(active === d.id)}
          >
            <strong>{d.name}</strong>
            <span>{d.width} × {d.height}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export const viewportAddon: Addon = {
  id: 'viewport',
  title: 'Viewport',
  render: (ctx) => <ViewportPanel {...ctx} />,
};
