# tekivex-* bundle sizes

_Generated 2026-05-01 from local source._

Sizes are real — measured from each package's built `dist/`. Tarball is what
npm uploads. Gzip and Brotli sizes are what the browser actually downloads.

| Package | Version | Main entry (raw / gzip / brotli) | Tarball | Files |
|---|---|---|---|---|
| [`tekivex-ui`](https://www.npmjs.com/package/tekivex-ui) | 3.1.0 | 424.9 KB / 115.1 KB / 91.0 KB | 452.4 KB | 164 |
| [`tekivex-3d`](https://www.npmjs.com/package/tekivex-3d) | 0.1.0 | 1.4 KB / 523 B / 462 B | 11.2 KB | 14 |
| [`tekivex-pdf`](https://www.npmjs.com/package/tekivex-pdf) | 0.1.2 | 1.6 KB / 447 B / 382 B | 25.4 KB | 47 |
| [`tekivex-templates`](https://www.npmjs.com/package/tekivex-templates) | 0.1.2 | 793 B / 363 B / 282 B | 3.0 KB | 5 |
| [`tekivex-form`](https://www.npmjs.com/package/tekivex-form) | 0.1.1 | 3.3 KB / 614 B / 498 B | 2.6 KB | 4 |
| [`tekivex-india`](https://www.npmjs.com/package/tekivex-india) | 0.1.2 | 778 B / 404 B / 323 B | 2.2 KB | 4 |
| [`tekivex-finance`](https://www.npmjs.com/package/tekivex-finance) | 0.1.2 | 909 B / 432 B / 343 B | 2.6 KB | 4 |
| [`tekivex-content`](https://www.npmjs.com/package/tekivex-content) | 0.1.2 | 427 B / 215 B / 172 B | 1.6 KB | 4 |
| [`tekivex-security-core`](https://www.npmjs.com/package/tekivex-security-core) | 0.1.2 | 20.4 KB / 6.3 KB / 5.5 KB | 17.9 KB | 8 |
| [`tekivex-audit`](https://www.npmjs.com/package/tekivex-audit) | 0.1.2 | _(no built main)_ | 5.0 KB | 4 |
| [`tekivex-add`](https://www.npmjs.com/package/tekivex-add) | 0.1.1 | _(no built main)_ | 5.6 KB | 4 |
| [`create-tekivex-app`](https://www.npmjs.com/package/create-tekivex-app) | 0.1.2 | _(no built main)_ | 5.9 KB | 19 |
| [`tekivex-figma-kit`](https://www.npmjs.com/package/tekivex-figma-kit) | 0.1.0 | _(no built main)_ | 12.5 KB | 6 |

## How this is measured
- **Main entry raw** — the first file Node loads when you `import "<pkg>"`.
- **Gzip / Brotli** — what an HTTP server with compression sends to a browser.
- **Tarball** — `npm pack --dry-run --json`, the actual file uploaded to the registry.
- **Files** — number of files in the published tarball.

## Caveats
- These are **whole-package** sizes. Tree-shaking eliminates unused exports;
  your real bundle will be smaller. Use [bundlephobia.com](https://bundlephobia.com)
  for per-import sizes.
- `tekivex-3d` numbers do **not** include `three` — it's a peer dependency,
  so the consumer's bundler decides whether to include it.