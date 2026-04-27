# Test coverage — current state + roadmap to 90%

This document is the public, audit-grade record of `tekivex-ui` test coverage. It exists so adopters can see exactly what's tested, what isn't, and the trajectory.

## Current numbers (snapshot 2026-04-27)

| Metric | Coverage |
|---|---|
| **Lines** | 56% (5,486 / 9,784) |
| **Functions** | 43% (1,041 / 2,444) |
| **Branches** | 49% (4,837 / 9,902) |
| **Statements** | 53% (5,232 / 9,847) |
| **Tests passing** | 794 across 76 files |
| **Components with explicit unit tests** | 64 of 99 |
| **Components with smoke tests (renders + key props)** | 99 of 99 |

CI gate is set at the current numbers, not aspirational. Builds fail if any metric drops. They never go down; each release ratchets up.

## Coverage policy

Three rules:

1. **Ratchet only** — thresholds in `vitest.config.ts` represent the floor we've earned. They never decrease in a PR. They go up when a release legitimately raises the number.
2. **Critical-path components must be at 80%+** — security primitives, KYC validators, payments, form validation. These are the audit risk surface. Test counts and per-file numbers below.
3. **Real-time + canvas-heavy components are smoke-tested only** — jsdom doesn't run a real canvas or timer loop. Their coverage comes from Playwright visual regression at `tests/visual/`, not unit tests.

## Where coverage is high (≥ 80%)

These components have thorough explicit tests covering the security or business-logic surface:

| Component | Lines | Notes |
|---|---|---|
| TkxAadhaarInput | 90%+ | Verhoeff checksum exhaustively tested |
| TkxKycInputs (PAN, Voter ID, DL) | 90%+ | Format + entity-char validation |
| TkxCurrencyInput | 85%+ | Lakh/crore + 20 currencies |
| TkxAddressInput | 85%+ | PIN lookup + error paths |
| TkxCalendarLunar | 80%+ | Tithi/Hijri/Hebrew/Buddhist |
| TkxPaymentButton | 80%+ | Provider switching + error paths |
| TkxSubscription helpers | 85%+ | Proration math |
| TkxSEO | 95%+ | All schema factories tested |
| TkxSortable | 80%+ | Reorder logic + keyboard |
| TkxButton | 90%+ | Variants/sizes/loading |
| TkxBadge | 90%+ | All variants |
| TkxAlert | 85%+ | role mapping per variant |
| TkxInput | 85%+ | Sanitisation + validation |
| TkxThemeProvider | 90%+ | mode resolution |
| TkxPagination | 90%+ | All localised labels |
| TkxFontProvider | 90%+ | All 24 scripts |
| TkxCaptcha (validation surface) | 80%+ | Test mode + sitekey validation |
| TkxPhoneInput | 80%+ | E.164 + 50 countries |

## Where coverage is medium (50-80%)

Most components fall here. They have good test coverage of the public API but don't exercise every internal branch.

## Where coverage is low (< 50%)

| Component | Why | Fix path |
|---|---|---|
| TkxLiveMetrics, TkxLiveLog, TkxLiveFeed | Timer + stream logic — jsdom limited | Vitest fake timers |
| TkxImageEditor, TkxSignaturePad | Canvas — jsdom doesn't render | Visual regression in `tests/visual/` |
| TkxDatePicker | 1100-line component, complex | Granular test split |
| TkxColorPicker | HSV gradient logic | Per-mode test |
| TkxCascader, TkxTransferList, TkxMentions | DnD + custom-pattern UIs | Pointer-event mocks |
| TkxStatistic | Animation timing | Fake timers |
| TkxSlider | Drag + keyboard reorder | Pointer-event mocks |

## Roadmap to 90%

| Release | Target | Effort |
|---|---|---|
| **v2.9.0** (now) | Lines 55%, Functions 40%, Branches 45% | Baseline established |
| v2.10 | Lines 65%, Functions 50%, Branches 55% | ~12 hours: Vitest fake timers for real-time, focused tests for ColorPicker/Cascader/TransferList |
| v2.11 | Lines 75%, Functions 60%, Branches 65% | ~10 hours: TkxDatePicker split into per-feature test files, DnD pointer-event mocks |
| v3.0 | Lines 90%, Functions 90%, Branches 85% | ~16 hours: canvas component coverage via Playwright integration, full real-time test suite |

This is ~38 hours of test-writing across 3 minor releases. We're not promising to do it overnight; we're committing to the ratchet.

## What's NOT in the unit-test number

Three layers of testing that don't show in the coverage percentage but exist:

| Layer | Where | Coverage |
|---|---|---|
| **Visual regression** | `tests/visual/` (Playwright) | 28 routes baselined across 4 device/theme combos |
| **A11y static analysis** | `scripts/a11y-audit.mjs` (axe-core) | All 99 components scanned per CI run |
| **Screen-reader matrix** | `docs/a11y-screen-reader-matrix.md` | 470 cells — 88% pass across NVDA / JAWS / VO / iOS / TalkBack |
| **Bundler smoke tests** | `examples/bundler-tests/` | 6 bundlers build a representative slice on every push |

Adding these as a "real" coverage number is hard (different tools, different scopes). But the *coverage of risk* is higher than the unit-test % alone suggests.

## CI enforcement

`.github/workflows/coverage.yml` runs `npm run test:coverage` on every PR. The thresholds in `vitest.config.ts` are enforced — drop below them and CI fails. The current state is the new floor.

## How to read this honestly

If an audit asks "is tekivex-ui at 100% test coverage" the answer is **no, it's at 56% lines**. If they ask "is the security surface at 100%" the answer is **the security primitives — Aadhaar Verhoeff, KYC validators, sanitiseHref, sanitizeUnicode, scrubPII — are 90%+**. If they ask "is there a ratchet" the answer is **yes, in `vitest.config.ts`, enforced in CI**. If they ask "what's the path to 90%" the answer is **3 milestones, ~38 hours of work, planned for v2.10 / v2.11 / v3.0**.

That's the honest audit story. Numbers we can defend, gaps we acknowledge, plan we commit to.
