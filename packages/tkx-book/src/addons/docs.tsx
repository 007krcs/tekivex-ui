// ─────────────────────────────────────────────────────────────────────────────
// Docs addon — renders an MDX companion file alongside each story.
//
// Convention: a story file at `stories/<slug>.tsx` can have a sibling
// `stories/<slug>.mdx` that gets rendered in this tab.
//
// Implementation approach: we use Vite's import.meta.glob to enumerate
// all .mdx files at build time and lazy-load the matching one when the
// docs tab is active. The MDX is compiled to a React component by
// @mdx-js/rollup at build time — so by the time it reaches us, it's just
// a regular React component.
// ─────────────────────────────────────────────────────────────────────────────

import { Suspense, lazy, useMemo, type CSSProperties } from 'react';
import type { Addon, AddonContext } from './registry';

// Vite will compile every .mdx file in stories/ at build time and produce
// a default-exported React component for each. We index by slug.
//
// The eager:false form keeps each MDX in its own chunk so the docs tab
// only downloads the active story's docs.
const mdxModules = import.meta.glob<{ default: React.ComponentType }>(
  '../../stories/*.mdx',
);

function DocsPanel({ slug, story }: AddonContext) {
  const Doc = useMemo(() => {
    const key = Object.keys(mdxModules).find((k) =>
      k.endsWith(`/${slug}.mdx`),
    );
    if (!key) return null;
    return lazy(mdxModules[key]);
  }, [slug]);

  const wrap: CSSProperties = {
    padding: 16,
    height: '100%',
    overflow: 'auto',
    color: 'var(--tkx-text)',
    fontSize: 14,
    lineHeight: 1.6,
  };

  if (!Doc) {
    return (
      <div style={wrap}>
        <div style={{ color: 'var(--tkx-textMuted)', fontSize: 13 }}>
          No docs file found for this story.
        </div>
        <p style={{ fontSize: 12, color: 'var(--tkx-textMuted)' }}>
          Drop a file at <code>stories/{slug}.mdx</code> to add docs alongside this story.
          MDX content can include any React component — including <code>{story.name}</code> itself.
        </p>
      </div>
    );
  }

  return (
    <div style={wrap}>
      <Suspense fallback={<div>Loading docs…</div>}>
        <Doc />
      </Suspense>
    </div>
  );
}

export const docsAddon: Addon = {
  id: 'docs',
  title: 'Docs',
  render: (ctx) => <DocsPanel {...ctx} />,
};
