# tekivex-ui bundle sizes

_Generated 2026-05-26 from local source (v3.17.0)._

Sizes are real — measured from each entry's built `dist/` file. Gzip is what an
HTTP server with `Content-Encoding: gzip` sends to a browser. The numbers in
**bold** below are the only numbers a consumer's bundler will actually ship —
the chunk files are split internals that browsers download once and cache
across every sub-export that needs them.

## `tekivex-ui` v3.17.0 — per sub-export

| Sub-export | Import path | Raw | **Gzip** | Notes |
|---|---|---:|---:|---|
| Core | `tekivex-ui` | 536.2 kB | **145.4 kB** | All 116 production components + theme + engine. The "everything" entry. |
| Themes | `tekivex-ui/themes` | 0.4 kB | **0.3 kB** | Re-exports of `quantumDark`, `auroraLight`, `createTheme`. |
| Headless | `tekivex-ui/headless` | 1.1 kB | **0.6 kB** | `useDisclosure`, `useFormState`, `useListSelection`, etc. — zero-style hooks. |
| Charts | `tekivex-ui/charts` | 20.4 kB | **6.2 kB** | 7 chart types. **Add `recharts` (~80 kB gz) — declared as optional peer.** |
| Realtime | `tekivex-ui/realtime` | 17.5 kB | **6.5 kB** | `TkxRealTimeChart`, `TkxLiveMetrics`, `TkxLiveLog`, `TkxLiveFeed`. |
| Experimental | `tekivex-ui/experimental` | 18.8 kB | **6.2 kB** | `TkxQuantumForm`, `TkxAIChatBubble`, `TkxAIConfidenceBar`, `TkxAIThinking`. Opt-in; API not stable. |
| Quantum | `tekivex-ui/quantum` | 25.3 kB | **7.8 kB** | Quantum-inspired UI primitives. |
| Agent | `tekivex-ui/agent` | 43.8 kB | **13.2 kB** | Anthropic/OpenAI/Gemini/Ollama providers, MCP, A2A, tools, RAG, replay. |
| i18n | `tekivex-ui/i18n` | 58.3 kB | **17.7 kB** | 44 locales incl. RTL (`ar-SA`, `he-IL`, `fa-IR`). |
| CSS | `tekivex-ui/styles` | 2.4 kB | **1.0 kB** | One CSS file: token vars + reset + utility classes. Side-effect import. |

**Tarball (published to npm)**: ~620 kB (whole `dist/` directory + README + LICENSE).

## Sister packages (`@tekivex/*`)

| Package | Version | Raw | Gzip | Notes |
|---|---|---:|---:|---|
| [`tekivex-3d`](https://www.npmjs.com/package/tekivex-3d) | 0.7.0 | 1.4 kB | 0.5 kB | 14 spatial primitives. Requires `three` (peer, optional). |
| [`tekivex-pdf`](https://www.npmjs.com/package/tekivex-pdf) | 0.3.0 | 1.6 kB | 0.4 kB | 15 PDF primitives + raster. |
| [`tekivex-templates`](https://www.npmjs.com/package/tekivex-templates) | 0.1.2 | 0.8 kB | 0.4 kB | 7 PDF templates re-exported from `tekivex-pdf`. |
| [`tekivex-form`](https://www.npmjs.com/package/tekivex-form) | 0.1.1 | 3.3 kB | 0.6 kB | Form validation helpers. |
| [`tekivex-india`](https://www.npmjs.com/package/tekivex-india) | 0.1.2 | 0.8 kB | 0.4 kB | India vertical pack — re-exports Aadhaar, PAN, Voter ID, DL, etc. |
| [`tekivex-finance`](https://www.npmjs.com/package/tekivex-finance) | 0.1.2 | 0.9 kB | 0.4 kB | Finance vertical pack. |
| [`tekivex-content`](https://www.npmjs.com/package/tekivex-content) | 0.1.2 | 0.4 kB | 0.2 kB | Content vertical pack. |
| [`tekivex-security-core`](https://www.npmjs.com/package/tekivex-security-core) | 0.1.2 | 20.4 kB | 6.3 kB | Standalone SecurityCore (sanitisation, CSP, audit, PII, magic-byte MIME). |

## How this is measured

- **Raw** — bytes of the built JS/CSS file on disk (`wc -c`).
- **Gzip** — bytes after `gzip -9` (matches what NGINX / Cloudflare / S3 serve with default compression).
- **Tarball** — output of `npm pack --dry-run` — the actual file uploaded to the registry.

Run `npm run bundle:report` to regenerate these numbers.

## Caveats — read these before quoting numbers

- These are **whole-entry** sizes. Tree-shaking eliminates unused exports. If
  you import only `TkxButton + TkxCard + ThemeProvider`, the real shipped
  bundle is closer to **8–12 kB gzip**, not 145 kB. Use
  [bundlephobia.com](https://bundlephobia.com) for per-import sizes.
- The core (`tekivex-ui`) bundle includes **all 116 production components**.
  This is intentional — most consumers import 30–60 of them across an app,
  and the bundler's tree-shaker drops everything else per-route.
- **As of the next release, dist no longer emits shared `chunk-*.js`
  files.** Each entry (`index`, `headless`, `charts`, etc.) is built as a
  self-contained bundle with `inlineDynamicImports: true`. This fixes a
  hard-blocker for Next.js consumers (webpack's RSC module factory map
  cannot register Vite's chunk runtime format — see CHANGELOG `[Unreleased]`
  → Fixed). Trade-off: shared internals (security engine, TKX CSS engine,
  i18n base, etc.) are now duplicated across entries, so the raw tarball
  is ~30% larger. Tree-shaking keeps per-app runtime cost flat: an app
  that only imports from `tekivex-ui` (core) downloads exactly what it did
  before — the duplication only matters if you import from multiple
  sub-exports in the same app, in which case each sub-export brings its
  own copy of the shared internals.
- `tekivex-3d`, `tekivex-pdf`, and the `tekivex-ui/charts` sub-export each
  pull a heavy peer dep (`three`, `@react-pdf/renderer`, `recharts`) that
  dominates the real bundle. Those peers are **not** included in the numbers
  above — your bundler handles them.
- The `i18n` entry includes all 44 locales by default. If you tree-shake
  per-locale (`import { enUS } from 'tekivex-ui/i18n'`), real cost drops to
  ~0.6 kB gzip per locale.
- The `agent` entry is provider-agnostic — importing a single provider
  (e.g. only `AnthropicProvider`) tree-shakes the others away.

## Historical sizes (core entry only)

| Version | Date | Raw | Gzip | Δ |
|---|---|---:|---:|---|
| 3.17.0 | 2026-05-26 | 536.2 kB | 145.4 kB | +30.3 kB raw vs 3.1.0 (added 14 components, agent runtime, formula engine) |
| 3.1.0 | 2026-04-27 | 424.9 kB | 115.1 kB | baseline |

The increase is concentrated in `TkxSpreadsheet` (Pratt parser),
`TkxFlowChart` (pan/zoom/edit), `TkxFormBuilder` (schema editor), and
`src/agent/` (16 kB gz on its own).
