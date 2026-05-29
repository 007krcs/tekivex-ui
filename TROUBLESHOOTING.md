# Troubleshooting — TekiVex UI

This file collects every consumer-reported integration issue we've seen,
with the root cause and the working fix. If you hit something not listed
here, open an issue at
[github.com/007krcs/tekivex-ui/issues](https://github.com/007krcs/tekivex-ui/issues)
and we'll add it.

Last updated: 2026-05-28 (v3.17.x).

---

## TL;DR — common-case quick reference

| Symptom | Likely cause | Fix |
|---|---|---|
| `Cannot read properties of undefined (reading 'call')` in Next.js | Pre-v3.18 chunk runtime format | Upgrade to **v3.18+** (single-file-per-entry bundles, webpack-compatible) |
| Hydration mismatch with `ThemeProvider mode="auto"` | `prefers-color-scheme` read on client only | Use `mode="light"` / `mode="dark"` OR upgrade to v3.18+ and use `themeInitScript()` |
| `Unknown prop "isDisabled"` warning | Wrong prop name — there is no `isDisabled` | Use the native HTML `disabled`. v3.18+ accepts `isDisabled` as a deprecated alias and warns. |
| `Updating a style property during rerender (background)` | Internal animation conflict, pre-v3.18 | Upgrade to v3.18+ |
| `Module not found: 'three'` | Optional peer not installed | `npm install three` only if you use `tekivex-3d` or `TkxHolographic*` |
| Stale chunks in Next.js dev | `.next/` cache + service worker | Clear `.next/`, unregister service workers in DevTools → Application |
| About to hand-roll a div for a banner / form / placeholder | Discoverability gap — the library probably already covers it | Skim [`/quick-reference/`](https://ui.tekivex.com/quick-reference/) first |

---

## 1. Next.js / App Router / RSC

### Symptom

```
TypeError: Cannot read properties of undefined (reading 'call')
    at mountLazyComponent in react-server-dom-webpack-client
```

Or any variant of "chunks failed to load" / "webpack module factory missing".

### Root cause (pre-v3.18)

Versions before v3.18 were built with `vite build` in multi-entry library
mode. That emitted `chunk-[hash].js` files using Vite's internal chunk
runtime format. Next.js's webpack RSC client expects its own chunk format
and cannot register Vite-shaped chunks in its module factory map. Even
`transpilePackages: ['tekivex-ui']` in `next.config.mjs` doesn't help —
the issue is the chunk shape, not the source syntax.

### Fix in v3.18+

The build now runs `vite build` once per public entry with
`inlineDynamicImports: true`, producing a single self-contained bundle per
entry. No chunk runtime is emitted. The output is the plain-bundle shape
that webpack, esbuild, parcel, turbopack, and rolldown all consume
identically.

```bash
npm install tekivex-ui@latest
```

Trade-off: shared internals (security engine, CSS engine) are duplicated
across entries, growing the tarball ~30%. Tree-shaking handles the runtime
cost — your app bundle does not grow proportionally.

### Recommended Next.js setup

`next.config.mjs`:

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Not strictly required after v3.18, but explicit is safer:
  transpilePackages: ['tekivex-ui'],
};

export default nextConfig;
```

`app/providers.tsx` (the SSR-safe wrapper):

```tsx
'use client';

import { useEffect, useState } from 'react';
import { ThemeProvider, quantumDark } from 'tekivex-ui';
import 'tekivex-ui/styles';

export function Providers({ children }: { children: React.ReactNode }) {
  // Mount-gate: SSR HTML = first client paint = no hydration mismatch.
  // Same pattern next-themes documents. Required because ThemeProvider
  // injects portal roots + theme-class wrappers that only exist after
  // useEffect runs.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <>{children}</>;

  return <ThemeProvider theme={quantumDark}>{children}</ThemeProvider>;
}
```

`app/layout.tsx`:

```tsx
import { Providers } from './providers';
import { themeInitScript } from 'tekivex-ui';  // v3.18+ only

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Optional but eliminates FOUC. Sets data-theme before React hydrates. */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript({ defaultMode: 'dark' }) }} />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

---

## 2. ThemeProvider hydration mismatch

### Symptom (pre-v3.18)

React 18 hydration error in the console, often something like:

```
Hydration failed because the initial UI does not match what was rendered
on the server.
```

…even though your code looks correct.

### Root cause

`mode="auto"` reads `window.matchMedia('(prefers-color-scheme: dark)')`
to pick a theme. The server cannot know this preference, so server HTML
diverges from the first client render.

### Fix

**Option A — fixed mode (works in any version):**

```tsx
<ThemeProvider theme={quantumDark} mode="dark">
```

**Option B — v3.18+ deterministic `auto`:**

In v3.18+, `mode="auto"` is SSR-safe by default. First render uses the
deterministic default (light), then `prefers-color-scheme` is consulted in
a post-mount `useEffect`. No hydration mismatch.

**Option C — eliminate FOUC with `themeInitScript()` (v3.18+):**

```tsx
import { themeInitScript } from 'tekivex-ui';

// In app/layout.tsx <head>:
<script dangerouslySetInnerHTML={{ __html: themeInitScript() }} />
```

This sets `document.documentElement.dataset.theme` synchronously before
React hydrates, so the page paints with the correct theme on first frame.

**Option D — opt into strict mount-gate (v3.18+):**

```tsx
<ThemeProvider theme={quantumDark} suppressHydrationWarning>
  {children}
</ThemeProvider>
```

The provider emits a no-op wrapper on SSR + first client render, then
applies the theme post-mount. Slowest first-paint of the four options;
use only if A/B/C don't suit your stack.

---

## 3. `isDisabled` is not a real prop

### Symptom (pre-v3.18)

```
Warning: Received `true` for a non-boolean attribute `isDisabled`.
If you want to write it to the DOM, pass a string instead: ...
```

### Root cause

The API has `isLoading` and `isFullWidth` so consumers reasonably reach
for `isDisabled` by analogy. But TkxButton extends standard
`ButtonHTMLAttributes`, so the real prop name is the native HTML
`disabled`. Pre-v3.18, the unknown prop was destructured into `{...rest}`
and forwarded to the DOM, triggering React's unknown-attribute warning on
every render.

### Fix

**Code change:**

```tsx
// Before
<TkxButton isDisabled>Save</TkxButton>

// After
<TkxButton disabled>Save</TkxButton>
```

**v3.18+ backstop:** the library now absorbs `isDisabled` as a deprecated
alias and emits a one-time dev-mode warning instead of polluting the DOM.
Your existing code keeps working; clean it up at your leisure before v4.0.

---

## 4. `background` + `backgroundImage` shorthand conflict

### Symptom (pre-v3.18)

```
Warning: Updating a style property during rerender (background) when a
conflicting property is set (backgroundImage). Resolve to a consistent
ordering.
```

Repeated 5× per render. Comes from a hashed internal chunk.

### Root cause

Some animation utility set both the `background` shorthand and the
`backgroundImage` longhand on the same element during re-render. React
warns because the shorthand wins last-write-wins and the longhand becomes
unpredictable.

### Fix

Upgrade to v3.18+. The offending utility now uses only longhand
properties (`backgroundColor` + `backgroundImage` + `backgroundPosition`).

---

## 4½. "I hand-rolled a div for something the library probably ships"

### Symptom

You're already using 15-25 `Tkx*` components from the library, but you
reach for raw `<div>` / `<input>` / `<button>` HTML for a "small one-off"
that the library actually covers. Common cases reported by consumers:

- Hand-rolled emerald banner for a success notification → `TkxAlert variant="success"` with `title` + `children` slots
- Raw `<input>` + `<button>` on auth pages → `TkxInput` + `TkxButton`
- Custom error-state card → `TkxCard variant="elevated"` wrapping `TkxAlert variant="danger"`
- "No results yet" placeholder → `TkxEmpty`
- Recharts directly → `tekivex-ui/charts` subpath (built-in + 5 own-SVG primitives)

### Root cause

Discoverability gap. With 116 production components, even teams who've
adopted 20+ of them can't always remember what else is shipping. The
component-index pages are alphabetical, not use-case-indexed, so "I need
a success banner" doesn't map to "look under A for Alert."

### Fix

Skim **[`/quick-reference/`](https://ui.tekivex.com/quick-reference/)**
before hand-rolling. It's a 60-second use-case index — "you want to show
a success/error banner → TkxAlert" — grouped by what you're trying to
build, not by component name. Most consumers find 3-5 components they
should have been using when they read it.

If something's missing from the quick reference, open an issue. The fact
that a real use case sits between "I hand-rolled this" and "the right
component" is exactly the signal we want.

---

## 5. `three` is missing / `Module not found: 'three'`

### Symptom

```
Module not found: Error: Can't resolve 'three'
```

…during build or dev.

### Root cause

`three` is an **optional peer dependency** declared in `package.json` so
that bundlers don't flag it as a missing required dep. You only need it
if you import `tekivex-3d`, `TkxHolographic*`, or render the home page
(which historically used the 3D toolkit).

### Fix

If you use any of the above:
```bash
npm install three
```

If you don't:
```bash
# Tell webpack/Vite to externalise it so the missing import is silent
# next.config.mjs
const nextConfig = {
  webpack: (config) => {
    config.externals = [...(config.externals ?? []), 'three'];
    return config;
  },
};
```

The same pattern applies to `recharts` — it's declared optional and only
needed if you import from `tekivex-ui/charts`.

---

## 6. Stale chunks / dev cache issues

### Symptom

Errors that appear, get fixed by clearing the cache, then come back on
the next recompile. Confusing chunk paths (`/app/packages/web/src/...`)
that don't exist in your codebase.

### Root cause

Two possible causes:

1. **`.next/` cache rot** after a dep change or `prisma generate`.
2. **Service worker** from a previous project on the same `localhost:port`
   intercepting your dev server's responses.

### Fix

**Clear Next.js cache:**
```bash
rm -rf .next
npm run dev
```

**Unregister service workers:** Chrome DevTools → Application →
Service Workers → Unregister all. Then Application → Clear storage →
Clear site data.

The service-worker issue is browser state, not anything tekivex-ui can
fix from the package side. But the URL-encoded chunk paths in the error
are the giveaway — if you see `%2F` in chunk URLs, suspect a SW.

---

## 7. Optional: verifying the install before integration

If you want to confirm tekivex-ui installed correctly before wiring it
into your app:

```bash
# Verify the package exists on the registry and shows correct metadata
npm view tekivex-ui

# Verify the published files (no surprise binaries)
npm pack tekivex-ui --dry-run

# Verify the SBOM (lists peer deps + zero runtime deps)
curl https://ui.tekivex.com/security/sbom.json | jq '.metadata.component, .components'

# Verify the threat model (15 STRIDE-mapped threats, public)
open https://github.com/007krcs/tekivex-ui/blob/main/docs/SECURITY-THREAT-MODEL.md
```

---

## 8. Reporting a new issue

If you hit a problem not in this file:

1. **Check this file first** — most consumer-reported issues end up here.
2. **Open a GitHub issue:**
   [github.com/007krcs/tekivex-ui/issues/new](https://github.com/007krcs/tekivex-ui/issues/new)
   Include: tekivex-ui version (`npm list tekivex-ui`), React version,
   Next.js / Vite / framework version, Node version, browser, the
   minimal reproduction.
3. **Security issues** → `novaai0401@gmail.com` per
   [SECURITY.md](./SECURITY.md). Do NOT open a public issue for security
   problems.
4. **Need a fix faster than the maintainer cadence?** The design-partner
   program ([docs/design-partners/](./docs/design-partners/README.md))
   gets a direct Slack channel + priority response for regulated-industry
   adopters. Free white-glove integration.

## Maintainer transparency

This project is currently maintained by [007krcs](https://github.com/007krcs)
on `novaai0401@gmail.com`. We're pre-1.0; treat that the way you would
treat any pre-1.0 library:

- **Pin your version** (`"tekivex-ui": "3.17.0"` not `"^3.17.0"`)
- **Read the changelog** before upgrading minor versions
- **Audit the SBOM** before deploying to production
- **Check the threat model** if you're in a regulated industry
- **Expect breaking changes at v4.0** — see [docs/ROADMAP.md](./docs/ROADMAP.md)

The threat model is published, the SBOM is published, the test suite is
1,798 tests, the audit chain is SHA-256-verifiable, and the supply chain
is reviewable on socket.dev. Pre-1.0 doesn't mean unaudited; it means the
API surface isn't frozen yet.
