# Component audit — user-perspective flaw sweep (2026-06)

A honest, developer-as-user audit of all **122** components in `src/components/`,
across three lenses:

1. **DX / missing features** — does the public API do what a real user expects
   (controlled+uncontrolled, ref forwarding, `className`/`style`/`id`/`name`
   passthrough, keyboard + focus a11y, sensible callbacks, theme tokens, SSR
   safety, `'use client'`)?
2. **Bundling** — heavy unconditional imports, non-tree-shakeable patterns,
   should-be-lazy/subpath.
3. **Usability / docs** — is the API complex with no/thin docs? If hard to use,
   the behaviour must be documented.

Method: 12 parallel review agents read each component's source + doc + test.
"none" was a valid finding; nothing was fabricated.

---

## Cross-cutting themes (fix once, help many)

### A. Theme violations — hardcoded hex instead of `useTheme()` (light-mode breakage)
These ignore the active theme and render dark-only / off-palette:

- **Dark-only (whole component):** `TkxMindMap`, `TkxPivotTable`, `TkxFlowChart`,
  `TkxFormBuilder`, `TkxFormulaBar`, `TkxGantt`, `TkxHolographicAdvanced`,
  `TkxSpreadsheet`, `TkxThemeBuilder`.
- **Partial hardcoded hex:** `TkxStepper` (`#fff`), `TkxToggle` (`#fff` + shadow),
  `TkxSlider` (`#fff`/`#888`), `TkxTreemap` (8-colour neon palette),
  `TkxAvatar` (status colours), `TkxModal`/`TkxTour`/`TkxSpeedDial` (overlays),
  `TkxThemeStudio` (WCAG badges), `TkxCarousel` (arrows/dots),
  `TkxAIConfidenceBar`/`TkxAIThinking` (status colours).

### B. Bundle bomb — `engine/quantum-ai.ts` (1045 lines) imported unconditionally
`TkxPlayground`, `TkxThemeBuilder`, and `TkxQuantumForm` statically import a full
quantum-computing engine (Complex, Qubit, QuantumRegister, QuantumAnnealer,
QuantumBoltzmannMachine) for cosmetic "suggestions". Should be lazy `import()`
or dropped.

### C. Missing `className`/`style`/`ref` passthrough
`TkxAppBar`, `TkxBottomNav`, `TkxList`, `TkxLiveFeed`, `TkxLiveMetrics`,
`TkxMasonry`, `TkxRealTimeChart`, `TkxResult`, `TkxTimeline`, `TkxSnackbar`,
`TkxSegmented`, `TkxSpin`, `TkxToolbar`, `TkxTransferList`, and others.

### D. Missing `'use client'` (Next RSC breakage)
`TkxMindMap`, `TkxSparkline` use hooks but lack the directive that every sibling
carries.

### E. Dead / misleading props & doc claims (honesty)
- `TkxLiveMetrics.refreshInterval` — declared, never used (no-op).
- `TkxClock.theme` — destructured out, never used.
- `TkxCheckout.steps` — documented, prop doesn't exist.
- `TkxCurrencyInput` — header claims caret restoration; not implemented.
- `TkxImageEditor` — header claims pinch-zoom/pan + `+`/`-`/`R` keys; not implemented.
- `TkxCascader.multiple` — prop exists, never renders multi-select (no-op).
- `TkxAffix` — imports `sanitizeString` only for a dead constant.
- `TkxPagination` — dead `buildPageRange` (unreachable); `pageSize` selector
  doesn't recompute totals for uncontrolled users.
- `TkxMasonry` — round-robin (not shortest-column), so not true masonry; dead
  `sanitizeString`/`theme` imports.
- `TkxThemeBuilder` — header falsely claims "no imports from tekivex-ui".

### F. A11y — roving-tabindex / keyboard bugs
- Roving tabindex never follows focus: `TkxToolbar`, `TkxTreeView`,
  `TkxTransferList`, `TkxAccordion` (no arrow-key nav at all).
- Trigger not keyboard-activatable: `TkxPopover`, `TkxDropdown` (div trigger),
  `TkxBreadcrumb`.
- SVG click handlers mouse-only (no keyboard): `TkxTreemap`, `TkxHeatmap`,
  `TkxFunnelChart`, `TkxRealTimeChart`.
- False WCAG claims: `TkxSignaturePad` ("keyboard-clear" — no focusable element),
  `TkxTour` ("focus trap" — Tab escapes), `TkxSortable` (Space-grab not implemented).

---

## HIGH-severity items (correctness / trust traps)

| Component | Issue |
|---|---|
| `TkxQRCode` | **Not a real QR code** — fills the data area with seeded-random density; output is decorative and unscannable. Trust trap. |
| `TkxBreadcrumb` | Collapse ellipsis button `onClick` is an empty no-op — collapsed items are permanently unreachable. |
| `TkxAadhaarInput` | Default masking breaks editing — display is `XXXX XXXX 1234`, first 8 digits can't be seen/edited in controlled mode. |
| `TkxCalendarHeatmap` | `toISOString()` tz handling lands data points on the wrong day across timezones (off-by-one). |
| `TkxWatermark` | Runs a 1s `setInterval` per instance **always** (even when `intensifyOnDevtools=false`); devtools heuristic false-positives blur real content. |
| `TkxThemeBuilder` | Unconditional 1045-line `quantum-ai` import; raw `window.setTimeout` (no SSR guard); false "no imports" comment. |
| `TkxPlayground` | Unconditional 1045-line `quantum-ai` import for suggestions; no tests for a security-sensitive `new Function` eval. |
| `TkxQuantumForm` | Uncontrolled-only, no `className`/`style`/ref; "quantum" theatrics are cosmetic; unconditional quantum-ai weight. |
| `TkxMindMap` | No `useTheme` (dark-only), no `'use client'`, labels not run through `sanitizeString`. |
| `TkxPivotTable` | No `useTheme` (dark-only); unreadable in light mode. |

---

## Missing doc pages (DOC-NEEDED)

`TkxAIChatBubble`, `TkxAIConfidenceBar`, `TkxAIThinking`, `TkxAccessibilityChecker`,
`TkxAutoForm`, `TkxCalendarHeatmap`, `TkxCommandPalette`, `TkxFlowChart`,
`TkxFormBuilder`, `TkxFormulaBar`, `TkxFunnelChart`, `TkxGantt`, `TkxGauge`,
`TkxHeatmap`, `TkxHolographic`, `TkxHolographicAdvanced`, `TkxKanban`,
`TkxMessageThread`/`TkxPeerChat`, `TkxMindMap`, `TkxPivotTable`, `TkxQuantumForm`,
`TkxRichEditor`, `TkxSparkline`, `TkxSpreadsheet`, `TkxThemeStudio`, `TkxTreemap`.

---

## Fix waves

1. **HIGH-severity correctness + bundle bombs** — QRCode, Breadcrumb, CalendarHeatmap, Watermark, quantum-ai lazy-load.
2. **Theme violations** — route hardcoded hex through `useTheme()`.
3. **Dead/misleading props + honesty** — remove no-op props, fix false doc claims, add missing `'use client'`.
4. **Passthrough + a11y** — add `className`/`style`/`ref`; fix roving-tabindex/keyboard.
5. **Docs** — author the 26 missing pages, prioritising the hard-to-use ones.

Components that held up cleanly (SEV none): `TkxCard`, `TkxDivider`, `TkxSkeleton`, `TkxTag`.
