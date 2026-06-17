# Changelog

All notable changes to TekiVex UI will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.22.0] — 2026-06-17

### Added — TkxAutoForm (schema-to-UI form generator)

Renders a complete, themed, accessible, security-hardened form from a
`FormSchema` (the same model `TkxFormBuilder` produces) — no manual field
wiring. String values pass through the security kernel on submit (so a
`TkxSecurityDashboard` lights up). Per-field `aria-invalid`/`aria-describedby`,
a focus-managed error summary, `defaultValues`/`onSubmit`/`sanitize`/`redactPII`.

### Fixed — library-wide component audit (user-perspective sweep)

A 122-component audit (recorded in `docs/COMPONENT-AUDIT.md`) drove a wave of
correctness, theming, accessibility, and honesty fixes:

- **TkxQRCode now produces a *scannable* code.** The previous render filled the
  data region with a seeded-random pattern and did not scan. Replaced with a
  real dependency-free ISO/IEC 18004 encoder (GF(256) Reed–Solomon, byte +
  alphanumeric, auto version 1–10, L/M/Q/H, all 8 masks, BCH format/version
  bits), verified against the canonical "HELLO WORLD" spec codeword vector.
- **Light-mode theming.** Editor/grid components (`TkxFlowChart`,
  `TkxFormBuilder`, `TkxFormulaBar`, `TkxGantt`, `TkxMindMap`, `TkxPivotTable`,
  `TkxSpreadsheet`, `TkxHolographicAdvanced`) referenced `--tkx-*` CSS variables
  the theme never defined, so they were dark-only. New `tkxThemeVars(theme)`
  helper binds them to the live theme. Plus hardcoded-hex cleanups in
  `TkxStepper`, `TkxToggle`, `TkxSlider`, `TkxAvatar`, `TkxCarousel`,
  `TkxAIConfidenceBar`, `TkxAIThinking`.
- **TkxCalendarHeatmap** timezone off-by-one — a point dated `2026-06-17` could
  land on the wrong day. Date handling is now local-calendar consistent.
- **TkxBreadcrumb** collapse ellipsis was a no-op (collapsed items unreachable);
  it now expands in place.
- **TkxWatermark** ran a 1s `setInterval` on every instance; now only when
  `intensifyOnDevtools` is set.
- **A11y:** roving tabindex now follows focus in `TkxToolbar`/`TkxTransferList`
  (was a tab-trap); `TkxTour` has a real focus trap; `TkxSignaturePad` canvas is
  keyboard-operable (Backspace clears, Ctrl/Cmd+Z undoes).
- **TkxCurrencyInput** caret-position restoration on reformat is now implemented.
- **TkxPagination** rows-per-page selector now recomputes totals for uncontrolled
  use; removed dead code.
- **Passthrough:** `className`/`style` added on `TkxAppBar`, `TkxBottomNav`,
  `TkxList`, `TkxLiveFeed`, `TkxRealTimeChart`, `TkxResult`, `TkxTimeline`,
  `TkxSegmented`, `TkxSpin`.
- **Honesty:** removed false claims / dead props — `TkxCascader.multiple`
  (no-op), `TkxClock.theme` (unused), `TkxLiveMetrics.refreshInterval` (no-op),
  `TkxCheckout.steps` (nonexistent), `TkxImageEditor` pinch-zoom/pan claims,
  `TkxAIThinking` "Quantum AI" marketing subtitle; `TkxMindMap` labels are now
  sanitized.

### Documentation

18 new component pages for previously-undocumented components (`gauge`,
`heatmap`, `funnel-chart`, `treemap`, `sparkline`, `auto-form`,
`calendar-heatmap`, `command-palette`, `flow-chart`, `form-builder`, `kanban`,
`spreadsheet`, `pivot-table`, `rich-editor`, `gantt`, `mind-map`,
`theme-studio`, `message-thread`) — each with a real props table and the
non-obvious working details surfaced by the audit.

## [3.21.0] — 2026-06-16

### Added — the security kernel is now observable (`TkxSecurityDashboard`)

The security kernel has always blocked XSS, Trojan-Source unicode, PII
leaks, clickjacking, rate-limit abuse, and MIME forgery — but silently.
Consumers had no way to *see* it work. This release surfaces every
defensive action as an observable event stream and ships a drop-in
dashboard to render it.

**New security-event stream** (`src/engine/security.ts`):

- `onSecurityEvent(listener)` — subscribe to defensive actions; returns
  an unsubscribe function.
- `getRecentSecurityEvents()` — snapshot of a bounded (500-entry) ring
  buffer.
- `clearSecurityEvents()` — clear the in-memory buffer (does **not**
  touch the SHA-256 audit chain).
- `emitSecurityEvent(type, message, severity?, detail?)` — public so
  consumers can record their own signals.
- Types: `SecurityEvent`, `SecurityEventType`, `SecuritySeverity`.

All seven event types are now emitted by the primitives themselves:
`xss-sanitized` (`sanitizeString`), `unicode-stripped` (`sanitizeUnicode`
— the Trojan-Source / CVE-2021-42574 vector, severity `critical`),
`pii-redacted` (`scrubPII`, with redaction count), `audit` (every
`audit()` entry), `clickjacking-detected` (`installFrameBuster`),
`rate-limited` (`createRateLimiter` on bucket exhaustion), and
`mime-rejected` (`sniffMimeType` on magic-byte mismatch). Emission is
**zero-overhead** when no listener is attached and nothing is blocked,
and a throwing listener can never break the primitive that emitted.

**New component** (`tekivex-ui` root export):

- `<TkxSecurityDashboard />` — zero-config drop-in. Summary tiles
  (XSS / Trojan-Source / PII / audit counts), a live scrolling event log
  (severity-coloured, `aria-live`), one-click JSON export for a SIEM /
  incident report, and a clear button. `compact` and `hideExport` props.
- `useSecurityEvents(maxEvents?)` — the underlying hook. Self-
  subscribing; needs **no** provider. Returns
  `{ events, counts, bySeverity, clear, toJSON }`.
- `<SecurityProvider>` — **optional**. Shares one event buffer app-wide
  so multiple dashboards / widgets stay in sync.

12 new tests in `tests/security-events.test.ts` cover the pub/sub
contract, the bounded ring buffer, throwing-listener resilience, and
every primitive's emission (and non-emission on clean input).

## [3.20.1] — 2026-05-31

Documentation-only patch. No code changes — the dist tarball is
byte-identical to 3.20.0 except for `README.md` and `CHANGELOG.md`.

### Added — npm page now communicates the 14-package ecosystem

The `tekivex-ui` README now opens with a "14-package ecosystem at a
glance" install matrix covering every sibling package on npm
(`create-tekivex-app`, `tekivex-security-core`, `tekivex-audit`,
`tekivex-india`, `tekivex-india-admin`, `tekivex-finance`,
`tekivex-content`, `tekivex-pdf`, `tekivex-templates`, `tekivex-3d`,
`tekivex-figma-kit`, `tekivex-add`, `tekivex-form`). Consumers landing
on https://www.npmjs.com/package/tekivex-ui can now see in one screen
which package to install for which job, without having to visit the
docs site.

Reason for the patch publish: the npm package page only renders the
README from the most recently published version. The matrix went onto
master after 3.20.0 shipped, so a tiny patch publish is the only way
to get it onto the npm page without waiting for the next code release.

### Related — docs

- New full reference at https://ui.tekivex.com/ecosystem/ (grouped by
  intent, with collision callouts for tekivex-india vs tekivex-india-admin,
  tekivex-form vs tekivex-ui, tekivex-add vs create-tekivex-app).

## [3.20.0] — 2026-05-30

The **address-cascade** release. Closes the v3.20 roadmap item for
`TkxAddressInput` raised by Indian-market consumers who need explicit
Country → State → District → Sub-district dropdowns. Net non-breaking;
existing code paths render byte-for-byte the same UI as v3.19.

### Added — `TkxAddressInput` cascading-divisions support

- **`divisionsSource?: DivisionsLoader` prop** on `TkxAddressInput`.
  When supplied, the component prepends a cascading row of four
  dropdowns above the PIN field — Country, State / UT, District, and a
  per-state-labelled Sub-district. When omitted, the UI is identical to
  v3.19 (PIN-only).
- **`DivisionsLoader` interface** — pluggable async data source with
  four methods (`countries`, `states`, `districts`, `subDistricts`) plus
  an optional regional-naming hook `subDistrictLabel(country, state)`.
  Returning `"Taluka"` for Maharashtra, `"Tehsil"` for UP, `"Mandal"`
  for AP, `"Block"` for West Bengal, etc. — the dropdown label and the
  helper-text use whatever string the loader returns, falling back to
  `"Sub-district"`.
- **`AdminDivision` interface** — `{ code, name, localName? }`. `code`
  is stable (ISO 3166-1 alpha-2 / ISO 3166-2 / LGD); `localName` is the
  regional-script display name.

### Added — `AddressValue` schema (additive fields, all optional)

- `subDistrict?: string` — display name of the picked sub-district.
- `countryCode?: string`, `stateCode?: string`, `districtCode?: string`,
  `subDistrictCode?: string` — stable codes from the loader. Useful for
  storing the structured value in a database without normalising on
  display strings.

No existing field changed shape. `pin`, `postOffice`, `city`, `state`,
`country`, `line1`, `line2` are all still typed identically.

### Why

Two consumer reports surfaced the same gap: the team needed a form with
explicit Country → State → District → Taluka dropdowns, but
`AddressValue` had no sub-district field and `TkxAddressInput` only
shipped the PIN-lookup path. The right fix was to add a pluggable data
source so consumers in any region can use any data they want — and ship
a companion package (`tekivex-india-admin`, v0.1, separate npm) that
provides the LGD snapshot for India. The companion package is on its
own release schedule because GoI admin boundaries change (district
splits, UT reorganisations) and that data updates shouldn't gate
library versions.

### Tests

13 tests on `TkxAddressInput` total — 6 backward-compat (PIN lookup,
6-digit gate, dropdown render, error states, address lines) + 7 new
covering the cascade path (no-source-no-dropdowns, source-renders-4,
country → states call, full cascade emit shape, regional label
switching MH↔AP, downstream-clear on upstream pick, PIN-still-works).

### Companion package roadmap

- `tekivex-india-admin` v0.1 — separate npm package, ships
  `lgdSnapshot()` returning a `DivisionsLoader`. Currently in license
  audit (GODL-India) before data ingestion. Not blocking v3.20.

## [3.19.1] — 2026-05-29

The **`/headless` security re-exports** patch. Pure additive — no API
breaks, no behavior changes, no bundle-size impact for existing consumers.

### Added — `tekivex-ui/headless` now re-exports the full security kernel

The security primitives that the components use internally are now reachable
from the headless subpath directly. Previously the recipes documented
imports from `tekivex-ui` (the main entry), which pulls in component types
even for server-side / Node / Edge consumers who only want the engine.

New re-exports from `tekivex-ui/headless`:

- **Input sanitization** — `sanitizeUnicode`, `sanitizeJSON` (joining
  `sanitizeString`, `sanitizeProps` which were already there)
- **Magic-byte file type verification** — `sniffMimeType`
- **PII redaction (Luhn-validated)** — `scrubPII`
- **Tamper-evident audit log** — `audit`, `getAuditLog`,
  `verifyAuditIntegrity`, `sha256Hex`
- **CSP + Trusted Types** — `buildTkxCSP`, `installTrustedTypes`
- **Environment checks** — `isFramed`
- **Client-side rate limiting** — `createRateLimiter`

Plus the supporting types: `AuditEntry`, `AuditFilter`, `CSPDirectives`,
`TkxCSPOptions`, `RateLimiter`, `PropSchema`, `ValidationResult`,
`ComponentPermissions`.

Same implementations the components use internally — exposed here so
server-side consumers, Node/Edge runtimes, and custom-UI builders can
reach them without pulling in the full component bundle. The recipes at
`/recipes/secure-file-upload`, `/recipes/audit-trail`, and
`/recipes/pii-redaction-before-llm` will be updated to prefer the
`tekivex-ui/headless` import path in a docs follow-up.

### Why

Server-side consumers (Next.js Route Handlers, Remix loaders, RSC, Edge
functions) writing audit entries or scrubbing PII before logs shouldn't
need the React component types in scope. The `/headless` subpath is the
right home for behavior-only primitives. This patch closes the gap.

## [3.19.0] — 2026-05-29

The **stabilization + scope-cleanup** release. Closes the v3.19 named
roadmap items: `TkxPeerChat` promotion, DataGrid tree data, and a
documentation honesty sweep. Net non-breaking; `TkxMessageThread`
preserved as a deprecated alias for one minor cycle.

### Added — peer chat

- **`TkxPeerChat`** — the v3.18.x `TkxMessageThread` preview is now the
  stable v3.19 name. Same component, same props, same source file. The
  prop API is frozen for the v3.x cycle.
- **Typing indicator** on `TkxPeerChat`. New `typingUserIds`,
  `onTypingStart`, `onTypingStop` props. Component renders the indicator
  below the message list — "Priya is typing…" (1), "Priya and Marcus are
  typing…" (2), "Several people are typing…" (3+). Unknown sender IDs
  fall back to "Unknown" so raw IDs never leak. Animated three-dot
  ellipsis under `prefers-reduced-motion: no-preference`, static `…`
  otherwise. `role="status"` + `aria-live="polite"`. Consumer drives
  `typingUserIds` from their presence channel; consumer reacts to
  `onTypingStart` / `onTypingStop` to broadcast their own typing state
  (`onTypingStart` fires on first keystroke of a session; `onTypingStop`
  fires on 3s idle, blur, or send).

### Added — data grid

- **Tree data / hierarchical rows** on `TkxDataGrid`. New `childRowsKey`
  prop + `defaultExpandedRows` + `onRowExpand` + `indentSize` + per-column
  `tree: boolean`. Parent rows render with a disclosure caret; children
  indent by depth; table role becomes `treegrid` with proper
  `aria-level` / `aria-expanded` / `aria-setsize` / `aria-posinset`.
  Leaf rows render a space-reserving placeholder so columns stay aligned.
  Tree-data + cell editing, selection, sorting (per-depth), and
  pagination (flat visible row list) all interoperate; tree-data is
  ignored when `groupBy` is set (groupBy wins, dev warning logged).
  Recursion is capped at 32 levels to defend against circular references.
  11 new tests; 81 total on `TkxDataGrid`.

### Added — playground demo

- **`/playground/components/message-thread`** — live demo of the new
  `TkxPeerChat`. Includes a 2-person code-review chat, a 4-person
  incident-response group with reply threading + edited message +
  soft-delete + failed-delivery state, and an attachment showcase using
  real public URLs for image / audio / video / file. v3.18.2 shipped the
  component but had no live preview; this fixes that.

### Changed

- **`TkxMessageThread` deprecated as an alias for `TkxPeerChat`.** Same
  function reference (verified by reference-equality smoke test); zero
  bundle impact (tree-shakers drop whichever name the consumer doesn't
  import). Will be removed in v3.20. Update consumer imports at your
  leisure.

### Docs — honesty sweep

- **Documentation overclaim sweep**: 59 edits across 54 files. Hard
  claims of "WCAG 2.1 AAA compliant" / "fully accessible — AAA
  compliant" replaced with "self-tested against WCAG 2.1 AAA criteria
  via the internal `meetsAAA()` helper. Third-party audit on roadmap,
  not completed." Hit:
  - 48 component MDX files under `docs-site/`
  - `docs-site/src/content/docs/index.mdx` — also stripped a fabricated
    "Trusted by — 940 weekly downloads on npm" claim with no backing
    logos. Replaced with neutral install-footprint copy.
  - `docs-site/src/content/docs/components/index.mdx` and
    `typography.mdx`
  - `docs-site/src/content/docs/components/experimental/quantum-form.mdx`
  - `docs-site/astro.config.mjs` (site description)
  - `landing/src/pages/About.tsx` (page meta + body)
  - `landing/src/sections/Hero.tsx` (the old 3D hero, now at
    `/examples/3d`, still had "audit-firm engagement open" copy)
  - `demo/docs/ChatPage.tsx` (two "AAA compliant" demo strings)
  - `scripts/generate-component-mdx.mjs` (the template that would have
    re-introduced the overclaim on next regeneration)

### Coverage

- 1,798 → **1,819 tests** (+21: 11 DataGrid tree-data + 10 typing
  indicator). 125 test files, 0 todos, 0 failures, typecheck clean.

### Bumped

- `package.json` version: 3.18.2 → 3.19.0.

## [3.18.2] — 2026-05-28

The **honest scope** release. Consumer feedback caught that none of
the existing chat components (`TkxChat`, `TkxAIChatBubble`,
`TkxAgentMessage`) fit peer-to-peer messaging — they're all LLM
conversation primitives. v3.18.2 ships a real P2P primitive without
faking it, and clarifies the scope on the existing components so the
mistake doesn't repeat. Also bumps headline counts to reflect the new
component.

### Added

- **`TkxMessageThread`** — a peer-to-peer chat primitive (742 LOC,
  21 tests). Covers arbitrary `senders: Record<string, PeerSender>`
  identity, image / file / audio / video attachments (with
  magic-byte verification via `sniffMimeType` — mismatched files are
  refused per-file with an inline warning, good files still flow
  through to `onAttach`), reactions with a configurable emoji
  picker, one-level reply threading rendered both as a quoted block
  above the bubble AND as a cancellable chip above the composer,
  inline edit + soft-delete actions, five delivery-state icons on
  own messages (sending / sent / delivered / read / failed), and
  "Today" / "Yesterday" / locale-formatted day separators with
  consecutive-message grouping in 5-minute windows.

  Backend-dependent features (typing indicators, real-time message
  arrival, delivery-state transitions, presence updates, upload
  progress, end-to-end encryption) are explicitly NOT implemented
  and called out at the bottom of the source file as consumer
  responsibilities. Pre-1.0: API may shift; the stable `TkxPeerChat`
  promotion is named in [`docs/ROADMAP.md`](./docs/ROADMAP.md) v3.19.

### Changed

- **`TkxChat`** scope clarified in JSDoc — it's an LLM conversation
  primitive (OpenAI / Anthropic role model, string content), not a
  peer-to-peer messenger. Points consumers at `TkxMessageThread` if
  they need attachments / reactions / threading / real sender
  identity. No behavioural change.

### Docs

- `docs/ROADMAP.md` v3.19 section adds a named `TkxPeerChat`
  commitment with the full prop sketch as a promotion target for the
  v3.18.x `TkxMessageThread` preview.

## [3.18.1] — 2026-05-28

### Fixed

- **Subpath type declarations missing from the tarball** ([reported by
  consumer](https://github.com/007krcs/tekivex-ui/issues/), thank you).
  `package.json` `exports` declared `types` fields for 8 subpaths
  (`./themes`, `./charts`, `./headless`, `./i18n`, `./quantum`,
  `./realtime`, `./agent`, `./experimental`) pointing at `./dist/*.d.ts`,
  but only `dist/index.d.ts` actually shipped. TypeScript consumers
  importing from any subpath got `TS2307: Cannot find module
  'tekivex-ui/<subpath>'` — runtime worked, types broke.

  Root cause: shim `.d.ts` files were created manually before publish
  during v3.18.0 prep, but `prepublishOnly` re-ran `npm run build`
  immediately before the tarball went up and wiped them.

  Fix: new `scripts/emit-dts-shims.mjs` runs as the final step of
  `npm run build`. It writes one `dist/<entry>.d.ts` per subpath that
  re-exports from `./src/<entry>/index` (where `tsc` actually emits the
  full declarations). The script exits non-zero if any backing
  declaration is missing, so a broken tarball can't accidentally ship
  again.

  Verified with the exact repro from the consumer's issue:
  `npx tsc --noEmit` on `import { TkxLineChart } from 'tekivex-ui/charts'`
  + agent + themes now exits 0.

## [3.18.0] — 2026-05-28

The **Next.js compatibility + consumer-feedback** release. Pulls forward
v3.19 / v3.20 / v3.21 roadmap items in one ratchet and fixes every issue
the v3.17 consumer review surfaced — most critically the webpack/RSC chunk
format incompatibility that made the library unusable in Next.js.

Everything below is non-breaking and opt-in. See
[`docs/ROADMAP.md`](./docs/ROADMAP.md) for the full timeline and
[`TROUBLESHOOTING.md`](./TROUBLESHOOTING.md) for integration guidance.

### Added — security mailbox + SBOM + threat-model deploys

- **Tamper-evident SHA-256 audit chain** replaces FNV-1a for `audit()` and
  `verifyAuditIntegrity()`. Pure-JS FIPS 180-4 implementation, sync API
  preserved.
- **Luhn (mod-10) validation** in `scrubPII()` credit-card matcher — no
  more false positives on 13-digit order IDs.
- **`sanitizeUnicode`** wired into 6 additional inputs: `TkxMentions`,
  `TkxRichEditor`, `TkxAutocomplete`, `TkxOTP`, `TkxNumberInput`,
  `TkxFormulaBar`. Trojan Source / bidi / zero-width chars stripped on
  user-typed input across the board.
- **`sanitizeJSON`** dogfooded in `useWebSocket` — incoming WS payloads now
  parse-and-scrub `__proto__` / `constructor` / `prototype` keys by default.
- **CycloneDX SBOM** published at `landing/public/security/sbom.json` →
  `https://ui.tekivex.com/security/sbom.json` after redeploy.
- **`security.txt`** (RFC 9116) at `/.well-known/security.txt`. Mailbox:
  `novaai0401@gmail.com`.
- **`scripts/verify-security-artifacts.mjs`** — pre-deploy guard. Validates
  security.txt + SBOM + SECURITY.md and aborts build if missing or stale.
  Wired into `scripts/build-unified-site.mjs` as step 6.
- **`scripts/generate-sbom.mjs`** — regenerate the SBOM on every release
  (`npm run sbom:generate`).
- **socket.dev + SBOM badges** added to README.

### Added — components

- **`TkxSparkline`** (own-SVG, zero deps) — inline trend chart for
  dashboards. Variants: line / area / bar. Optional points, smoothing,
  inline value display.
- **`TkxGauge`** (own-SVG, zero deps) — speedometer/arc gauge with
  thresholds, ticks, formatValue, `role="meter"` + full ARIA.
- **`TkxHeatmap`** (own-SVG, zero deps) — categorical matrix heatmap with
  sequential / diverging / custom color scales, contrast-aware value
  labels, click handlers.
- **`TkxFunnelChart`** (own-SVG, zero deps) — conversion funnel with stage labels, drop-off percentages, vertical / horizontal orientations.
- **`TkxTreemap`** (own-SVG, zero deps) — squarified treemap with value-proportional rectangles, contrast-aware labels, click handlers.

### Added — forms

- **`zodResolver()` + `useFormWithZod()`** in `tekivex-ui/headless`. Zod is
  a structural-type peer (not a hard dep); consumer brings their own.
- **`valibotResolver()` + `useFormWithValibot()`** — same pattern for
  Valibot.
- **`createRHFBindings({ Controller })`** — React Hook Form adapter for 5+
  components (`TkxRHFInput`, `TkxRHFSelect`, `TkxRHFCheckbox`, `TkxRHFToggle`,
  `TkxRHFRadio`, plus `TkxRHFNumberInput` / `TkxRHFDatePicker`). RHF is a
  structural-type peer (no hard dep) — consumer passes their own `Controller`.

### Added — data grid

- **`pinned: 'left' | 'right'`** column prop on `TkxDataGrid`. Sticky
  positioning with scroll-aware boundary shadow. DOM order preserved so
  ARIA `aria-colindex` and CSV export reflect logical column order, not
  visual.
- **Row grouping + aggregations** on `TkxDataGrid`. New `groupBy` prop
  buckets rows by a column key; each group renders a collapsible header
  with row count plus per-column `aggregate` values (`sum` / `avg` /
  `count` / `min` / `max` or a custom function). `defaultExpandedGroups`
  controls initial state, `onGroupToggle` reports changes,
  `aria-expanded` reflects open/closed. Pagination spans groups; CSV
  export emits detail rows only.
- **Cell-level editing** on `TkxDataGrid`. Per-column `editable` flag
  (or predicate), `editor: 'text' | 'number' | 'select' | (custom render)`,
  `validateCell()` blocks invalid commits with inline error, `onCellEdit`
  fires with `(rowId, columnKey, newValue, oldValue, row)`. Double-click
  or `Enter` / `F2` opens the editor; Escape cancels; blur commits.
  Promise return on `onCellEdit` shows loading state.

### Added — i18n

- **9 new locales** — `bg` (Bulgarian), `hr` (Croatian), `et` (Estonian),
  `fi` (Finnish), `lt` (Lithuanian), `lv` (Latvian), `sk` (Slovak),
  `sl` (Slovenian), `no` (Norwegian Bokmål). Total **35 → 44** locales
  toward the v4.0 target of 70.
- **CLDR plural-rules engine** in `tekivex-ui/i18n` — `getPluralCategory(locale, n)`
  returns `'zero' | 'one' | 'two' | 'few' | 'many' | 'other'` via
  `Intl.PluralRules`. Companion `pluralize(locale, n, forms)` substitutes
  `{count}` into the chosen form. Fallback for environments without
  `Intl.PluralRules`.

### Forms — extended

- **Async field validation** in `useFormState`. New `validateAsync: { [field]: async (val, values) => string | null }`
  + `debounceMs` (default 300). Surfaces `validating[field]: boolean` and
  separate `asyncErrors` map so consumers can render "Checking…" vs the
  final error message. In-flight calls cancel when the field value
  changes again.
- **Form-level errors** — validators may now return a `_root` key that
  surfaces as `rootError`. Useful for cross-field validation and
  server-rejected submissions.

### Added — experimental subpath

- New `tekivex-ui/experimental` entry. The 4 `TkxAI*` / `TkxQuantumForm`
  components moved here. Source unchanged; opt-in import keeps the
  production component count defensible at 110.

### Changed

- README rewritten around a single positioning sentence: *"The React
  component library that ships with a threat model."* Component count
  reconciled to **116 production + 4 experimental** across README,
  package.json, landing page, About page.
- Test badge count corrected to **1,798 passing** (was stale "1,300+" /
  "1,034").
- Locale count corrected to **44** (was stale "27"). 9 new locales added: bg, hr, et, fi, lt, lv, sk, sl, no.
- `WCAG 2.1 AAA` claim softened to **"AAA target (audit-firm engagement
  open)"** until a third-party VPAT signs.
- Repo URL canonicalized to `github.com/007krcs/tekivex-ui` across all
  docs, packages, and scripts.
- Hero tagline replaced; "And a 3D toolkit. And a spreadsheet. And…"
  removed.
- `./themes` and `./styles` package exports verified to resolve to real
  built files.
- `three` declared as optional peer to match the existing `recharts`
  pattern.

### Coverage

- `TkxDataGrid`: 5 → 66+ tests (column pinning, row grouping, cell editing).
- `TkxSelect`: 8 → 51 tests.
- `TkxDatePicker`: 14 → 57+ tests (range + multi modes, presets, format/parsing, view modes, keyboard, locale, edge cases).
- `TkxMenu`: smoke → 33 tests (incl. submenu open-on-click + open-on-ArrowRight, bug fixed in this slice).
- `TkxOrgChart`: smoke → 12+ tests.
- `TkxTreeView`: smoke → 14+ tests.
- Security engine: 77 tests, all passing under SHA-256 audit chain.
- Overall: 1,429 → **1,798** tests (+333 across the slice). **0 todos** —
  first time since v2.x.

### Tooling

- `npm run partner:add` CLI — append a design-partner entry to the
  landing page with quote-permission-proof guard.
- `npm run verify:security-artifacts` — standalone validator for
  security.txt + SBOM + SECURITY.md freshness.
- `docs/outreach/` — ready-to-send email drafts + mailto launcher for the
  3 audit-firm and 5 partner-vertical outreach tracks.
- `docs/wcag-audit/` — Deque / TPGi / WebAIM scoping playbook.
- `docs/design-partners/` — partner-acquisition playbook with 3 outreach
  templates.
- `docs/ROADMAP.md` — public, version-anchored roadmap through v4.0 with
  a "what we will NOT do" section.

### Removed

- README boasts: "*No `src/` in npm tarball (IP protection)*",
  "*demand-driven release*" line, the "27 locales / 1034 tests / 99 / 113
  components" stale numbers.
- `Encryption:` and `Acknowledgments:` lines from `security.txt` —
  pointed at URLs that didn't resolve.

### Fixed

- **Style-conflict warning**: removed simultaneous shorthand-and-longhand
  background usage in `TkxStepper` connector elements. Both horizontal and
  vertical `Connector` components were setting `background` (shorthand) and
  `backgroundImage` (longhand) on the same element, triggering React's
  *"Updating a style property during rerender (background) when a conflicting
  property is set (backgroundImage)"* warning ~5× per render in a real
  consumer's Next.js dev console. Switched to longhand-only
  (`backgroundColor` + `backgroundImage`) — now silent.
- **ThemeProvider SSR**: `mode="auto"` no longer causes hydration mismatch
  — first render uses deterministic default, `prefers-color-scheme`
  resolution moved to `useEffect`. New `themeInitScript()` helper for
  FOUC-free auto detection. New `suppressHydrationWarning` prop for
  strictest opt-in.
- **Critical**: dist no longer emits Vite's chunked runtime format. Each
  public entry (`index`, `themes`, `charts`, `headless`, `i18n`, `quantum`,
  `realtime`, `agent`, `experimental`) is now a self-contained single-file
  bundle, eliminating webpack incompatibility in Next.js / React Server
  Components. Previously consumers hit
  `TypeError: Cannot read properties of undefined (reading 'call') at
  mountLazyComponent in react-server-dom-webpack-client` because Vite's
  multi-entry lib mode emitted `chunk-*.js` files in Vite's runtime format,
  which webpack's RSC module factory map cannot register — even with
  `transpilePackages: ['tekivex-ui']` in `next.config.mjs`. The build now
  runs `vite build` once per entry with `inlineDynamicImports: true`
  (driven by `scripts/build-all-entries.mjs`), producing universally
  consumable output across Vite, webpack, esbuild, Rollup, Parcel, and
  Turbopack. Trade-off: the dist tarball grows ~30% from duplicated shared
  internals (security engine, TKX CSS engine, etc.); tree-shaking keeps
  the per-app runtime cost flat.
- **`TkxMenu` submenu panel rendered empty when opened via click or
  ArrowRight** — `onClick` on submenu items and the `ArrowRight` handler
  only set `openSubmenuId` but not the required `submenuPos`, leaving the
  portal panel blank. Both paths now call `openSubmenu(item, el)` which
  sets both. Hover interaction was already correct.
- **`TkxDatePicker` re-opened immediately after Escape close** — the
  Escape handler restores focus to the input, which triggered `onFocus`'s
  `setOpen(true)` and re-opened the picker on the same tick. Now suppresses
  the next focus-driven open with a one-shot `suppressNextFocusOpen` ref.
- Previously-`it.todo` tests for both bugs converted to real assertions;
  all pass.
- **TKX engine arbitrary CSS-property test activated** — the test for
  `tkx('[--my-var:red]')` was an `it.todo` placeholder; the engine fix
  shipped in v3.17.0 but the test was never enabled. Now a real assertion.
  Suite reaches **0 todos** for the first time since v2.x.

## [3.17.0] — 2026-05-18

### Added — `tekivex-ui/agent`

New zero-dependency, provider-agnostic agent runtime under the `tekivex-ui/agent` sub-export.
Built on a Ports & Adapters architecture: every external concern (model, transport, memory,
sanitization, observability, retrieval) is behind an interface.

**Providers**: `AnthropicProvider`, `OpenAIProvider`, `GeminiProvider`, `OllamaProvider`.

**Core**: `Agent` / `createAgent`, `Tool` / `defineTool`, `Memory` (`InMemoryStore`,
`SlidingWindowMemory`, `SummarizingMemory`, `VectorMemory`), `Transport` interface +
`fetchTransport`, `Sanitizer`, `Middleware`.

**Capabilities**:
- Token usage + cost tracking middleware
- Retry / backoff middleware
- Anthropic prompt cache passthrough (`cacheable()`)
- `generateObject()` — structured JSON output
- MCP (Model Context Protocol) client + tool adapter
- `runEval()` + `judgeWithLLM()`
- `cancellable()` tool wrapper
- OpenTelemetry middleware (vendor-neutral sink)
- Guardrails (PII redaction, prompt-injection detector)
- `createDeepResearch()`
- A2A (Agent-to-Agent) client + tool + server route
- `Recorder` + `ReplayProvider`
- DevTools panel + `useEventCollector` hook

**UI components**: `TkxAgentMessage`, `TkxToolCallCard`, `TkxReasoningTrace`.

**Framework bindings**: React (`useAgent`), Vue, Svelte, Solid — all on the same vanilla controller.

**Server runtime**: `createAgentRoute()` for Next/Hono/Bun/Workers/Deno + `createAgentClient()`.

**Tests**: 79 unit tests across 15 files + 4 live tests against a real Ollama server.

**Docs**: `docs/AGENT.md` reference + cookbook at `examples/agent/01..18-*.ts`.

**Demo page**: New `/agent` route in the demo site with live ReplayProvider chat,
tool-call card, reasoning trace, and a live "Try with your local Ollama" section that
auto-detects local models and streams responses without a backend.

### Fixed

- TKX engine: arbitrary CSS custom-property values (e.g. `[--my-var:red]`) are now
  emitted correctly. The custom-property check now runs before the allowlist-gated
  general arbitrary-property handler.

## [3.16.1] — 2026-05-04

### Fixed

- **`sanitizeString` no longer renders the literal word "undefined"**
  ([#25](https://github.com/007krcs/tekivex-ui/pull/25)). Passing an absent
  optional prop (e.g. a missing `label`, `placeholder`, or `hint`) used to
  surface the string `"undefined"` in the UI because `String(undefined)`
  returns the literal `"undefined"`. The sanitizer now treats `null` and
  `undefined` as the empty string. This is a one-line root-cause fix that
  silently corrects every component that pipes an optional prop through
  the sanitizer (≈200 call-sites: `TkxInput`, `TkxAutocomplete`,
  `TkxBreadcrumb`, `TkxBottomNav`, `TkxCascader`, `TkxChat`,
  `TkxCheckbox`, `TkxClock`, `TkxFileUpload`, `TkxAppBar`, and others).
- **`TkxAppBar` now has a real `leading` slot**
  ([#25](https://github.com/007krcs/tekivex-ui/pull/25)). The component's
  documented slots were `title / logo / actions / navigation` — there was
  no `leading` prop, so consumers passing `leading={<BackButton/>}` saw
  their back-arrow silently dropped. The new `leading?: ReactNode` prop
  renders before the logo and is the canonical home for back arrows and
  drawer toggles. The `navigation` prop continues to host full nav menus.

### Tests

- Regression test asserting `sanitizeString(null)` and
  `sanitizeString(undefined)` return `''`, and that the literal word
  `"undefined"` never appears in their output.
- Smoke test asserting `TkxAppBar` renders the `leading` slot, and that
  passing no optional props produces no `"undefined"` in the rendered text.

### Migration

No code changes required. Behavior changes:

- `sanitizeString(null)` now returns `''` (previously `'null'`).
- `sanitizeString(undefined)` now returns `''` (previously `'undefined'`).

If you were relying on the old behavior anywhere, pass an explicit string.

## [2.2.0] — 2026-04-07

### Added
- **Form Component** (`TkxForm`, `TkxFormField`, `useTkxForm`) — Context-based form controller with field-level validation, error propagation, and submit handling
- **Layout System** (`TkxLayout`, `TkxHeader`, `TkxSider`, `TkxContent`, `TkxFooter`) — Composable page layout with collapsible sidebar
- **Grid System** (`TkxRow`, `TkxCol`) — 24-column responsive grid with breakpoints
- **ConfigProvider** (`TkxConfigProvider`, `useConfig`) — Global configuration for locale, direction, component defaults
- **Typography** (`TkxTitle`, `TkxText`, `TkxParagraph`) — Semantic text components with copy support
- **Spin** (`TkxSpin`) — Loading indicator with overlay, delay, and fullscreen modes
- **Empty** (`TkxEmpty`) — Empty state display with illustration and action slot
- **Statistic** (`TkxStatistic`, `TkxCountdown`) — KPI display with formatting and countdown timer
- **Theme Palette** — `generatePalette(hex)` generates 50-900 color shades from any hex
- **Design Tokens** — Exported `typography`, `spacing`, `breakpoints`, `shadows`, `zIndex`, `radii` scales

### Changed
- Expanded `ThemeTokens` exports to include palette generator and design token scales
- Updated root exports with all new components and utilities

## [2.1.0] — 2026-04-07

### Added
- **13 Enterprise Components**: Breadcrumb, Popover, Autocomplete, TreeView, Toolbar, TransferList, SpeedDial, AppBar, BottomNav, Snackbar, DataGrid, Masonry, RichTextDisplay
- **20 Component Test Files** (143 test cases) covering Input, Badge, Card, Toggle, Alert, Modal, Checkbox, Radio, Select, Progress, Tooltip, Avatar, Skeleton, Divider, Accordion, Tabs, Slider, Pagination, Rating, OTP
- **i18n/RTL System** — `I18nProvider` with 6 locales (en-US, es-ES, ar-SA, fr-FR, de-DE, ja-JP) and RTL detection
- **TKX CSS Recipes** — 5 practical patterns (Card Grid, Form, Nav, Stats, TKX vs Tailwind)
- Reduced-motion fixes for Card, Modal, Tooltip
- Touch support for Slider (`touch-action: none`) and Select (`touch-action: manipulation`)
- SSR guard for `useEscapeKey` hook

### Fixed
- Tree-shaking: refined `sideEffects` in package.json
- Doc pages: Carousel, Clock, Command, NumberInput, VideoPlayer now use DemoSection with code examples

## [2.0.2] — 2026-04-07

### Fixed
- Updated LICENSE and README copyright year to 2026
- Added homepage URL (https://ui.tekivex.com/) to package.json

## [2.0.1] — 2026-04-07

### Fixed
- Added homepage URL to npm package metadata

## [2.0.0] — 2026-04-06

### Added
- **9 New Components**: Menu, Clock, VideoPlayer, Stepper, ColorPicker, NumberInput, OTP, Command, Carousel
- **Rewrites**: Select (portal dropdown, multi-select), Accordion (5 variants, true height animation), DatePicker (range/multi, presets, time picker)
- **3 New Templates**: Blog/CMS, Admin Settings, Landing Page — all with "Build Your Own" code examples
- **Responsive Templates** — All 7 templates work on mobile/tablet/desktop
- **About Us** and **License** pages with enterprise positioning
- Icon component wired into navigation
- Slider improvements: vertical, tooltip, formatValue, onChangeEnd, gradient
- Video Player improvements: skip 10s, volume slider, loading spinner, error retry, chapter markers

### Fixed
- 4 runtime crashes (ChatPage, RatingPage, PortfolioTemplate, EcommerceTemplate)
- Mobile responsive layout with hamburger menu and sidebar toggle
- DatePicker rangeValue format (tuple vs object)
- Clock size prop (string enum vs number)
- Admin Settings crash (Tabs activeIndex, Avatar props)
- Supply Chain "undefined" label (missing Input label prop)
- Stepper clipping in DemoSection
- OTP page now shows code examples

## [1.0.0] — 2026-03-01

### Added
- Initial release with 28 components
- Quantum Dark and Aurora Light themes
- TKX Atomic CSS Engine
- WCAG 2.1 AAA compliance
- Zero-trust security engine
- Full TypeScript support
