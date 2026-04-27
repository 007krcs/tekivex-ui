// ─────────────────────────────────────────────────────────────────────────────
// Addon registry — tkx-book's "Storybook addon API" equivalent.
//
// An addon is a React component that owns a single tab in the bottom panel.
// It receives the active story + its container DOM ref + the current prop
// values. From there it can: read the rendered DOM (a11y), record events
// (interactions), display companion content (docs), capture snapshots
// (visual regression).
//
// To add a new addon: drop a file in src/addons/ that exports an Addon
// object, then register it in src/addons/index.ts. Done. No plugin
// architecture, no manager API — just a plain registry of React components.
// ─────────────────────────────────────────────────────────────────────────────

import type { ReactNode } from 'react';
import type { Story } from '../types';

export interface AddonContext {
  /** The currently-active story. */
  story: Story;
  /** Slug of the active story (for keying caches by story). */
  slug: string;
  /** Live ref to the rendered story's container DOM node. May be null briefly during transitions. */
  containerRef: { current: HTMLElement | null };
  /** Current control values (the props passed to story.render). */
  props: Record<string, any>;
}

export interface Addon {
  /** Unique id, used for tab key + URL state. */
  id: string;
  /** Tab label shown in the panel. */
  title: string;
  /** Optional badge — e.g. violation count for a11y. */
  badge?: (ctx: AddonContext) => ReactNode | null;
  /** Render function for the tab's content area. */
  render: (ctx: AddonContext) => ReactNode;
}
