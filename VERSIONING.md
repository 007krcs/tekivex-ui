# Versioning + Deprecation Policy

This document is the public contract for how `tekivex-ui` and its companion packages evolve. It exists so that enterprise adopters can take dependency on this library with confidence about what will change, and when.

## Semver

We follow [Semantic Versioning 2.0](https://semver.org/) **strictly** for the public API surface — meaning any export from `tekivex-ui` (root or any `/i18n`, `/charts`, `/headless`, `/quantum`, `/realtime`, `/themes` subpath).

| Bump | When |
|---|---|
| **Major** (`x` of `x.y.z`) | A breaking change to any public type, prop name, prop type, exported function signature, or runtime behaviour. |
| **Minor** (`y`) | New components, new props on existing components (where the prop is optional), new locales, new exports, new optional fields on existing interfaces. |
| **Patch** (`z`) | Bug fixes that don't change public types. CSS adjustments. Performance improvements. Docs. |

Pre-release labels (`-preview`, `-rc.N`) are used on all companion packages currently below 1.0 (`@tekivex/security-core`, `@tekivex/audit`, `@tekivex/pdf`, `@tekivex/figma-kit`, `@tekivex/add`).

## What is "the public API"

- ✅ Anything exported from `tekivex-ui`'s package.json `exports` map
- ✅ Anything exported from `index.ts` (root barrel)
- ✅ TypeScript types accompanying the above
- ✅ The runtime CSS class names exposed on rendered DOM (e.g. `.tkx-button`)
- ✅ The CSS custom properties that consumers set (`--tkx-primary`, etc.)
- ❌ Internal `src/` modules not re-exported from the barrel
- ❌ Internal data structures held in component state
- ❌ Implementation details of `tkx()` and `cx()` engines (return value shape)
- ❌ Output of `metrics:collect` / `figma:build` scripts (best-effort tooling)

## Major release cadence

Major releases happen **at most once per quarter**, and only when there's substantive value to deliver — not just to clear deprecations. Recent + planned majors:

| Version | Released | Theme |
|---|---|---|
| 2.0 | 2025-09 | Atomic CSS engine + first 70 components |
| 2.5 | 2026-01 | Charts, headless layer, DataGrid rewrite |
| 2.6 | 2026-04 | SecurityCore + TkxOrgChart |
| 2.7 | 2026-04 | v2.7 platform — image editor, phone, captcha, watermark v2, 35 locales |
| 2.8 | 2026-04 | gap closure — payments, signature, address, currency, sortable, confetti, SEO, calendar lunar, checkout, shadcn-style CLI |
| 3.0 | 2026-Q3 (target) | Stable `@tekivex/pdf` v1, full i18n component sweep |

## Deprecation policy

A public API can only be removed in a **major** release. Between the announcement and removal, every deprecated API:

1. **Continues to work identically.** Removing functionality silently is a breaking change masquerading as a non-breaking one — we don't.
2. **Logs a one-time `console.warn`** at first use, identifying the replacement. Warnings are deduplicated per session.
3. **Carries a `@deprecated` JSDoc tag** with a one-line replacement note and a link to the migration doc.
4. **Is documented in the `CHANGELOG.md`** under "Deprecated".

The deprecation window is **at least one minor release** between announcement and removal. Practically: a v2.7 deprecation can earliest be removed in v3.0 (or any major after).

```
┌─ minor v2.x ─┐  ┌─ minor v2.y ─┐  ┌─ MAJOR v3.0 ─┐
│ deprecate    │→ │ still works  │→ │ removed       │
│ + console    │  │ + console    │  │               │
│   warning    │  │   warning    │  │               │
└──────────────┘  └──────────────┘  └───────────────┘
```

## Breaking change disclosure

Every major release ships:

- A **migration guide** at `docs/migrations/v<old>-to-v<new>.md`
- An entry in `CHANGELOG.md` under "**BREAKING**" with rationale
- A codemod (when feasible) at `packages/codemods/v<old>-to-v<new>/`

If we ship a major and a consumer's app stops compiling against it, that's our bug to document — not a surprise to debug.

## Companion packages

Companion packages follow the same semver rules but on **independent version trains**:

| Package | Versioning | Notes |
|---|---|---|
| `tekivex-ui` | semver, tracked above | Main library |
| `@tekivex/security-core` | semver | Independent — tracks its own breaking changes |
| `@tekivex/audit` | semver | CLI tool — major bumps only on rule changes that require config updates |
| `@tekivex/pdf` | semver from 1.0 onward | Currently in `0.x-preview`; 1.0 ships with `tekivex-ui` 3.0 |
| `@tekivex/figma-kit` | semver | Token format aligned with the W3C draft |
| `@tekivex/add` | semver | Registry schema versioned independently |
| `create-tekivex-app` | semver | Templates pin `tekivex-ui` versions; minor bumps when templates update |

A `tekivex-ui` major bump never requires a coordinated bump across companion packages. Each is independently consumable.

## Pre-release builds

For early-access testing of upcoming releases:

```bash
npm install tekivex-ui@next       # latest pre-release candidate
npm install tekivex-ui@2.8.0-rc.1 # specific candidate
```

Pre-releases are **not** covered by deprecation guarantees. Any `-preview`, `-rc.N`, or `-next` build can change shape between iterations.

## What this commits us to

If you take a dependency on `tekivex-ui ^2.6.0` today:

1. Your build will not break on any future 2.x release.
2. You may see new deprecation warnings (informational only).
3. Removed APIs will not appear before 3.0.
4. A migration path (doc + codemod where feasible) ships with every major.
5. The companion package versions you depend on (`@tekivex/security-core` etc.) follow the same contract on their own trains.

## What this does NOT commit us to

- **Indefinite support of removed APIs.** Once removed in a major, an API is gone.
- **Backporting fixes to old majors.** We support the latest major + the previous one for security-only patches. Older majors are end-of-life.
- **Pinning peer dependencies.** React 18 / 19 are both supported on the current major; we may drop support for an older React major when its own upstream EOL is reached.

## Security backports

Security-relevant fixes (`SECURITY.md` issues, CVE patches) are backported to:

- The current major (always)
- The previous major (for 6 months after the new major's release)

A security-only patch on an old major bumps the patch version on that major (e.g. `2.5.16 → 2.5.17`).

## Reporting a breaking change

If you upgrade and something breaks that's not in the migration guide, that's a bug. [Open an issue](https://github.com/007krcs/tekivex-ui/issues/new) with:

- The version you upgraded **from** and **to**
- A minimal reproduction (CodeSandbox or single file)
- The error or behaviour you saw

We'll either patch the regression (most often) or document the change retroactively.

## Questions

- For breaking-change rationale: see the matching `CHANGELOG.md` entry
- For deprecation timing: search the source for `@deprecated`
- For long-term support arrangements (SLA, paid support): contact via [GitHub issue](https://github.com/007krcs/tekivex-ui/issues/new)

---

This policy itself is versioned. Material changes are announced in `CHANGELOG.md` under "**POLICY**".
