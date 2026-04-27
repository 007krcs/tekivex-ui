# tkx-book

> Component playground for tekivex-ui. Pure Vite + React. **Zero playground-specific dependencies.**

Built because Storybook has its own peer-dependency dance with Vite, and we don't want our component-explorer story tied to a third-party tool's release schedule.

## What it does

- Browse every component in `tekivex-ui` from a sidebar
- Each component has one or more **stories** — small example renders
- Live controls panel for tweaking variant / size / colorScheme / disabled props
- Light / dark / auto theme switcher
- Mobile / tablet / desktop viewport switcher
- Bookmarkable URLs — `?component=button&story=variants` → shareable links
- Static-build-friendly — `npm run build` outputs a deployable static site

## Run locally

```bash
cd packages/tkx-book
npm install
npm run dev      # http://localhost:5174
```

## Build

```bash
npm run build    # outputs dist/
```

## Adding a story

Create a file in `stories/<slug>.tsx`:

```tsx
import { TkxButton } from 'tekivex-ui';
import type { Story } from '../src/types';

export const button: Story = {
  name: 'TkxButton',
  description: 'Primary action button',
  controls: {
    variant: { type: 'select', options: ['primary', 'secondary', 'outline', 'ghost', 'link'], default: 'primary' },
    size:    { type: 'select', options: ['sm', 'md', 'lg'], default: 'md' },
    disabled:{ type: 'boolean', default: false },
    label:   { type: 'text', default: 'Click me' },
  },
  render: (props) => <TkxButton {...props}>{props.label}</TkxButton>,
};
```

Add it to `stories/index.ts`:

```ts
export { button } from './button';
```

It shows up in the sidebar automatically.

## Why not Storybook?

| Concern | Storybook | tkx-book |
|---|---|---|
| Bundler peer-dep | Pinned to specific Vite/Webpack majors | Whatever you have |
| Bundle size | ~30 MB install | ~5 MB |
| Cold start | 8–15s | <2s |
| Story format | CSF + dynamic addon stack | Plain TS object literal |
| Customisation | Addon API | It's all in `src/` — fork freely |

The trade-off: no Chromatic, no built-in interaction tests, no MDX. We ship Playwright visual regression separately (`tests/visual/`), and stories are typed React components — debugging is just React debugging.

## Status

Preview. Source-available; npm publish on demand.
