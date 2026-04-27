# Bundler smoke tests

Six tiny React apps, each built with a different bundler, each importing the **same** `tekivex-ui` slice. CI runs every build and fails if any one of them errors or warns.

If `npm install tekivex-ui` doesn't work cleanly under your bundler, this harness catches it before users do.

## Bundlers covered

| Folder | Bundler | Why |
|---|---|---|
| `vite/` | Vite 8 | Reference platform |
| `webpack/` | Webpack 5 | Most-used in production |
| `esbuild/` | esbuild | Speed-first, used inside other tools |
| `rollup/` | Rollup 4 | Library author surface |
| `parcel/` | Parcel 2 | Zero-config |
| `next/` | Next.js 15 (App Router) | RSC + transpilePackages |

Each app:
1. Wraps an `<App>` in `<ThemeProvider mode="auto">`
2. Imports `tekivex-ui/styles` once
3. Renders 12 components covering the full TKX engine surface (Button, Input, Card, Modal, Form, Table, Toast, DataGrid, DatePicker, Watermark, Markdown, Carousel)
4. Builds via the bundler's standard production command
5. Asserts the build produces a single bundle and exits 0

## Run locally

```bash
# Install + build all six
npm run test:bundlers

# Just one
npm --prefix examples/bundler-tests/vite run build
```

## CI

`.github/workflows/bundlers.yml` runs every push. A failure pinpoints exactly which bundler regressed and on which commit.

## Why this matters

The TKX atomic CSS engine extracts class names at runtime. Different bundlers tree-shake differently, hoist CSS imports differently, and resolve conditional `package.json` exports differently. Catching `tkx()` resolution bugs across all six is cheaper than catching them via user reports.

The harness also doubles as a copy-paste reference: if a user is wiring tekivex-ui into a Webpack 5 monorepo, they can crib `examples/bundler-tests/webpack/webpack.config.js` directly.
