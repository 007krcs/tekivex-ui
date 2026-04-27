# tkx-book

> Component playground for tekivex-ui. Pure Vite + React, built on a tiny addon API. **Storybook-feature-parity without the Storybook dependency.**

## Why

Storybook is the industry standard, but it dictates your bundler matrix. (Vite 8 ↔ Storybook 9 ERESOLVE was the trigger here.) `tkx-book` solves the same problem with ~5 MB of code, zero peer-dep gymnastics, and a 50-line addon API.

## Features (v0.2)

| Storybook offers | tkx-book offers | Built on |
|---|---|---|
| Sidebar + canvas + bottom panel | ✅ | Pure Vite + React |
| Controls panel | ✅ | Auto-render from story `controls` spec |
| Docs (MDX) tab alongside stories | ✅ | `@mdx-js/rollup` (Vite plugin) |
| A11y addon | ✅ | `axe-core` (same engine Storybook uses) |
| Mobile-emulation panel | ✅ | 8 device profiles, CSS device-frame outlines |
| Chromatic-style visual regression | ✅ (local) | SVG-foreignObject snapshot + pixel diff |
| Interactions addon | ✅ | Plain DOM event capture/replay |
| CSF format compatibility | ✅ | Auto-detect Storybook stories on import |
| Industry recognition | ⚠️ | Time + adoption problem; codebase can't fix this |

## Run

```bash
cd packages/tkx-book
npm install
npm run dev      # → http://localhost:5174
npm run build    # → dist/
```

## Adding a story (native format)

```tsx
// stories/my-component.tsx
import { MyComponent } from 'tekivex-ui';
import type { Story } from '../src/types';

export const myComponent: Story = {
  name: 'MyComponent',
  controls: {
    size: { type: 'select', options: ['sm', 'md', 'lg'], default: 'md' },
    disabled: { type: 'boolean', default: false },
    label: { type: 'text', default: 'Click me' },
  },
  render: (props) => <MyComponent {...props} />,
};
```

Register in `stories/index.ts`. Optionally add `stories/my-component.mdx` so the Docs tab has content.

## CSF compatibility (Storybook stories work as-is)

The `src/csf.ts` adapter detects Storybook's CSF v3 format on import and auto-converts. Drop an existing CSF file into `stories/`:

```tsx
import { TkxButton } from 'tekivex-ui';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof TkxButton> = {
  title: 'Components/Button',
  component: TkxButton,
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary'] },
    disabled: { control: 'boolean' },
  },
};
export default meta;

export const Primary: StoryObj<typeof TkxButton> = {
  args: { variant: 'primary', children: 'Click me' },
};
```

Works unchanged. Anyone with existing Storybook stories can drop them in.

## Addons API — 50 lines, no plugin manager

An addon is a React component that owns one tab:

```tsx
// src/addons/my.tsx
import type { Addon } from './registry';

export const myAddon: Addon = {
  id: 'my',
  title: 'My Tab',
  badge: (ctx) => null,
  render: (ctx) => <MyPanel {...ctx} />,
};
```

Register in `src/addons/index.ts`. `ctx` exposes:

```ts
interface AddonContext {
  story: Story;                                  // active story
  slug: string;                                  // its url slug
  containerRef: { current: HTMLElement | null }; // rendered DOM
  props: Record<string, any>;                    // current control values
}
```

If you can write a React component, you can write an addon. No plugin manager, no build-time codegen, no addon-config side-channel.

## URL state — every view is a shareable link

Every UI choice persists to query params:

- `?story=button` — active story
- `?theme=dark` — light / dark / auto
- `?viewport=mobile` — viewport switcher
- `?addon=a11y` — active panel tab

Copy the URL bar to share an exact view with anyone.

## What this covers vs Storybook

| Audit-driven need | Where in tkx-book |
|---|---|
| Public component browsing | Sidebar + canvas |
| Live prop tweaking | Controls addon |
| Per-component a11y check | A11y addon (axe-core) |
| Mobile / device preview | Viewport addon (8 profiles) |
| Documentation alongside | Docs addon (MDX) |
| Visual regression in dev | Snapshot addon (local) |
| Visual regression in CI | `tests/visual/` via Playwright |
| Interaction recording | Interactions addon |
| Recruiter familiarity | CSF compat — Storybook stories work in tkx-book |

## Status

**v0.2.0-preview.** 14 stories, 6 addons, ~1,500 lines of source total. Source-available; npm publish on demand.
