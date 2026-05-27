# TekiVex UI — Development Roadmap

_Last reviewed: 2026-05-26 (post-marketing-readiness pass + preview-slice ship)._
_Maintainer: 007krcs · seemaalmas · novaai0401-ui._

> **Status note (2026-05-26):** A preview slice pulled forward from v3.19 /
> v3.20 / v3.21 has landed in the `[Unreleased]` section of [`CHANGELOG.md`](../CHANGELOG.md).
> Items marked **(✓ landed)** below are already shipped on `main`; items
> marked **(◐ in progress)** have partial work; everything else remains
> ahead of us.

This is the single source of truth for what ships next. Each line item has a
**version target**, an **owner**, and a **definition of done**. If a row is
not on this page, we're not committing to it.

## Operating principles

1. **Marketing is bottlenecked on people, not code.** Code is already
   defensible. Don't ship features as a substitute for sending outreach
   emails. (See `docs/outreach/STATUS.md`.)
2. **Ratchet, don't promise.** Coverage / locale-count / component-count
   numbers go UP between releases, never DOWN. Don't set a target we can't
   defend in CI.
3. **Honest deprecation.** Anything we move to `experimental/` stays in
   `experimental/` for at least two minor releases before deletion.
4. **One narrative, two products.** The story is "the React UI library that
   ships with a threat model." Don't dilute it with side-quests (no more 3D /
   holographic / quantum branding additions — those already exist, ship them
   honestly, don't add more).

## Release cadence

- **Patch (3.17.x):** bug fixes only. Ship whenever needed. Auto-publish
  from green CI.
- **Minor (3.18, 3.19, ...):** every 4-6 weeks. Two minor releases between
  now and a stable v4.0.
- **Major (4.0):** Q4 2026. The breaking-change milestone. See "v4.0" below.

---

## v3.18 — "Land the audit + first partner" (target: 2026-07-15)

**Theme:** finish the marketing-launch checklist. No new components. No
breaking changes. The point of this release is to be the version on the
landing page when we go to HN.

### Critical-path (blocks public launch)

| Item | Owner | Definition of done |
|---|---|---|
| Sign a SOW with Deque / TPGi / WebAIM | 007krcs | Landing page line changes from "audit-firm engagement open" → "Audit underway with [Firm], report expected [Q3]" |
| Land 1 design-partner logo + quote | 007krcs | `landing/src/sections/DesignPartners.tsx` has 1 real entry; logo SVG at `landing/public/partners/`; `.eml` proof at `docs/design-partners/` |
| Lift `TkxDataGrid` coverage from 30 → 50+ tests | maintainer | Add column-resize, virtual-scroll, infinite-scroll, keyboard-nav-across-pages tests |
| Refresh `docs/a11y-screen-reader-matrix.md` | maintainer | Re-run the 470-cell matrix against current HEAD; pass rate ≥ 90% |
| Public SBOM at https://ui.tekivex.com/security/sbom.json | done | ✓ ships in build (deploy gated by `verify:security-artifacts`) |
| Public security.txt at /.well-known/ | done | ✓ ships in build |
| Real `novaai0401@gmail.com` inbox monitored | 007krcs | Gmail filter set, response cadence < 24h |

### Nice-to-have (slip to v3.19 if needed)

| Item | Owner |
|---|---|
| socket.dev badge on README + CI integration | maintainer |
| Public per-commit axe-core results at `ui.tekivex.com/security/a11y/` | maintainer |
| Storybook proper (in addition to existing `tkx-book`) | maintainer |

---

## v3.19 — "Coverage + DataGrid completeness" (target: 2026-09-01)

**Theme:** ratchet test coverage from 64.84% lines → 75%+ lines, and finish
the DataGrid feature gaps competitors will count.

### Coverage ratchet

| File group | Current | Target | Effort |
|---|---|---|---|
| `TkxSelect` | **(✓ landed)** 25+ tests | 25+ tests | Portal, virtual scroll, group navigation, typeahead, multi-select edge cases |
| `TkxDatePicker` | **(✓ landed)** 57+ tests | 30+ tests | Range + multi, all 13 presets, custom format tokens, locale parsing |
| `TkxMenu` | **(✓ landed)** 33 tests (2 todo) | 15+ tests | Nested submenus, keyboard nav, RTL flip |
| `TkxOrgChart` | **(✓ landed)** 12+ tests | 12+ tests | Layout determinism, pan/zoom, custom renderer |
| `TkxTreeView` | **(✓ landed)** 14+ tests | 15+ tests | Expand/collapse, keyboard, selection |
| **Overall** | 64.84% lines | **75%+ lines** | CI ratchet enforces |

### DataGrid feature completeness

| Feature | Why | Test count target |
|---|---|---|
| **(✓ landed)** Column pinning (left + right) | MUI Pro has it, ag-grid has it, free DataGrid roundup will list it | 8+ |
| Row grouping with aggregations | Same as above | 10+ |
| **(✓ landed)** Cell-level editing with validation | Power-user demand, table stakes for "MUI-Pro killer" claim | 12+ |
| Tree data / hierarchical rows | Common in enterprise dashboards | 8+ |

### Bug-bash window (last week of cycle)

- 1-week dedicated cycle to triage every open issue on GitHub
- Anything > 60 days old that's still relevant: fix or close with rationale
- Anything < 30 days old: triage to next release

---

## v3.20 — "Forms + i18n depth" (target: 2026-10-15)

**Theme:** the form story and the localization story both have gaps. Close
them.

### Forms

| Item | Definition of done |
|---|---|
| **(✓ landed)** Zod resolver for `TkxForm` | `useFormWithZod(schema)` ships; existing `useFormState` keeps working |
| **(✓ landed)** Valibot resolver for `TkxForm` | `useFormWithValibot(schema)` ships |
| React Hook Form adapter | `<TkxRHFField>` wrapper components for the 8 most-used inputs |
| **(✓ landed)** Async field validation | `validate: async (val) => ...` works, with debouncing + loading state |
| **(✓ landed)** Form-level errors (`_root`) | Cross-field validation pattern documented + tested |

### i18n

| Item | Definition of done |
|---|---|
| String-extraction sweep | The 380 remaining hardcoded strings drop to < 100 |
| New locales: bg, hr, et, fi, lt, lv, sk, sl, no | 35 → 44 locales (target: 70 by v4.0) |
| Plural-rules engine | `t('items', { count })` handles `zero`, `one`, `two`, `few`, `many`, `other` per CLDR |
| Per-locale tree-shaking docs | Clearly document the `import { enUS } from 'tekivex-ui/i18n'` per-locale pattern + measured bundle savings |

---

## v3.21 — "Charts + visualizations" (target: 2026-12-01)

**Theme:** the chart-types list is the second most common feature request
behind DataGrid pinning.

### New chart components

| Component | Built on | Test count |
|---|---|---|
| `TkxHeatmap` | recharts ScatterChart base | 10+ |
| **(✓ landed)** `TkxFunnelChart` | own SVG primitive | 8+ |
| **(✓ landed)** `TkxTreemap` | own SVG primitive (squarified algo) | 8+ |
| **(✓ landed)** `TkxGauge` | own SVG primitive | 10+ |
| **(✓ landed)** `TkxSparkline` | own SVG primitive, zero-deps | 8+ |
| `TkxCalendarHeatmap` | already exists — extend with year-view + export | 6+ |

### Visualization features

- Per-chart download as PNG (one-line API)
- Per-chart download as CSV
- Cross-chart linking (brush on one chart filters another) — pattern doc + example

---

## v3.22+ — Backlog (no firm release target)

These items have clear value but aren't on the critical-path. They land
opportunistically.

### Components

- `TkxKanban` improvements (custom card renderer, swimlanes, WIP limits)
- `TkxScheduler` (calendar week/day views — currently only month via `TkxDatePicker`)
- `TkxImageEditor` v2 (vector overlays, undo stack)
- `TkxRichEditor` v2 (Tiptap alternative — own minimal primitive)
- `TkxMapView` (Leaflet-backed primitive — interest-driven)
- `TkxVoiceInput` (Web Speech API wrapper — accessibility win)

### Tooling

- VS Code extension (snippets + prop type IntelliSense)
- WebStorm plugin (same)
- Figma plugin proper (we have `figma-kit` for tokens; this is the
  components-as-Figma-objects layer)
- Auto-codemod for v3 → v4 breaking changes (when v4 ships)

### Performance

- Server Components (RSC) verified for the components that don't need
  hydration (publish a marked list in the docs)
- Tree-shake `i18n` to per-locale chunks by default (lazy-load other locales)
- Bundle visualizer at `ui.tekivex.com/bundle-explorer/` (interactive)

---

## v4.0 — "Stable" (target: 2026-12 to 2027-Q1)

**Theme:** consolidate. Breaking changes. The version that becomes the
quoted "production" tag for the next 18 months.

### Breaking changes (ship behind feature flags first in v3.x)

| Change | Rationale |
|---|---|
| Drop React 18 support (require React 19+) | React 19 is GA, RSC stable, useTransition / useOptimistic patterns are mainstream |
| Drop Node 20.x support (require Node 22+) | Node 20 enters maintenance Q2 2026 |
| Remove `TkxQuantum*` from `experimental/` if no production-partner request lands | "Experimental" components that nobody uses get cut, not stabilized |
| Move `tekivex-ui/headless` hooks that overlap with React 19 (`useFormState`, `useOptimistic`) to thin wrappers | Don't compete with framework primitives |
| Consolidate `tekivex-ui/realtime` into `tekivex-ui/headless` | Two entries with overlapping scope is noise |
| Rename `TkxDataGrid` → `TkxGrid` (or keep both with deprecation) | "DataGrid" is MUI-speak; ours has diverged enough to deserve its own name |

### Non-breaking v4.0 deliverables

| Item | Definition of done |
|---|---|
| Third-party WCAG 2.1 AAA VPAT published | PDF at `ui.tekivex.com/security/vpat-2.5.pdf`, linked from README + landing |
| 90/90/85 test coverage achieved | CI ratchet enforces |
| 70+ locales | Match Ant Design's coverage |
| 5 published case studies | Real partners, real production deployments, named decision-makers |
| Storybook + tkx-book parity | Storybook proper at `ui.tekivex.com/storybook/`, tkx-book stays as the lighter alternative |
| Companion package roadmap committed | `tekivex-3d` v1.0, `tekivex-pdf` v1.0, `tekivex-india` v1.0 — each with their own ROADMAP |

### v4.0 migration tooling

- `npx @tekivex/codemod-v4` — automated import + prop renames
- `tekivex-ui/v3-compat` subpath — re-exports v3-named symbols as deprecation-wrapped aliases for 6 months
- Migration guide at `docs/migration/v3-to-v4.md` with side-by-side diffs
- Side-by-side changelog comparing v3.17 → v4.0 in one table

---

## What we WILL NOT do

These come up regularly. The answer is no, with reasons.

| Request | Why no |
|---|---|
| Add a Tailwind preset / plugin | The TKX engine is the differentiator. Tailwind-equivalence collapses the moat. |
| Become a CSS-in-JS library (Emotion / styled-components compatibility) | Same reason. The atomic CSS engine is the value. |
| Add a paid Pro tier | Indie / regulated-industry positioning depends on MIT + "all features free." Going paid kills the marketing story. |
| Match Chakra's prop-style system (`<Box px={4} bg="red">`) | Chakra owns that pattern; aping it = perception of derivative. |
| Build our own LLM provider in `tekivex-ui/agent` | Provider-agnostic is the wedge — we win by being neutral, not by being a 5th provider. |
| Build a CLI for app scaffolding beyond `create-tekivex-app` | Vite / Next / Remix already own that surface. We integrate, we don't replace. |
| Build a backend / API framework | Out of scope. Forever. |

---

## Status reporting

This file is the public roadmap. Internal status (who's working on what,
what's blocked, what's slipped) lives in:

- `docs/outreach/STATUS.md` — outreach pipeline
- GitHub Projects board at `github.com/007krcs/tekivex-ui/projects` —
  per-release execution
- GitHub Milestones — date-anchored release scope

If something is on this roadmap but you don't see progress in those places,
it's not actually being worked on. Tell the maintainers.

## How to propose a change to this roadmap

1. Open an issue with the `roadmap-proposal` label
2. State: (a) what to add/remove/change, (b) which release, (c) why
3. Maintainers respond within 5 business days with accept / defer / decline
4. Accepted proposals edit this file in the next PR

Do not lobby on Twitter / Reddit / HN for roadmap changes. The issue tracker
is the only valid venue.
