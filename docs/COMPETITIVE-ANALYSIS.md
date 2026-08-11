# Competitive analysis — tekivex-ui vs the React UI landscape

_Compiled 2026-08-10 from primary sources (npm registry + downloads API, GitHub API,
bundlephobia, official docs/pricing pages). Download figures are the week of
2026-08-03 → 2026-08-09 and fluctuate. Every number below carries its source in
the per-library sections. Opinions are labeled as opinions._

**Honesty contract:** this document states losses as plainly as wins. It exists
so we never make a claim a competitor's docs page can refute.

---

## The one-table summary

| | tekivex-ui | MUI | Ant Design | Mantine | Chakra UI | shadcn/ui (+Base UI/Radix) | HeroUI | React Aria |
|---|---|---|---|---|---|---|---|---|
| Weekly npm downloads | **85** | 10.15M | 3.62M | 2.33M | 1.74M | 7.8M (CLI) | 341k | 1.12M |
| GitHub stars | **0** | 98.7k | 99.0k | 31.5k | 40.6k | 121k | 23k | 15.8k |
| Age | 4 months | ~12 yrs | ~10 yrs | ~5 yrs | ~6 yrs | ~3.5 yrs | ~4 yrs | ~6 yrs |
| Components (their own docs index) | 116 (+4 experimental) | 62 (≈50 real widgets) | 73 core | 143 (all packages) | ~128 (≈100–110 real) | 79 (copy-in) | 75+ | ~50 + 40 hooks |
| Full-import gzip | ~145 kB | 153 kB | 452 kB | n/a (modular) | n/a | n/a (copy-in) | n/a | n/a |
| Direct runtime deps | **0** | 12 | 48 | 5 | 7 | copied code + primitives | several | few |
| CSS strategy | inline + one 1 kB token CSS file | Emotion (Pigment opt-in) | cssinjs → CSS vars | CSS Modules | Emotion (Panda-*flavored*) | Tailwind | Tailwind v4 | unstyled |
| Built-in locales | 44 | 60 | 73 | 0 (BYO strings) | Intl-based | 0 (copy-in) | — | — |
| Paid tier | none | $299–$1,399/dev/yr (MUI X) | none | none | $149–$249 (Pro templates) | free + 3rd-party paid | free | free |
| Threat model + SBOM published | **yes** | no (verified absent) | no | no | no | no | no | no |
| Third-party a11y audit | **no** (internal APG audit, all 35 findings fixed) | no (X Data Grid has VPAT) | no | no | no | no (inherits primitives) | no | Adobe a11y team + multi-screen-reader testing |
| Test suite | 2,168 tests / 74 suites | 74.4% coverage | **100% line coverage** | jest-axe + unit | unit | n/a (copy-in) | unit | extensive, SR-tested |

---

## Where tekivex-ui loses, plainly

1. **Adoption and trust.** 85 downloads/week and 0 GitHub stars against libraries
   at 1.7M–10M/week with decade-long track records. No production case studies,
   no community, no Stack Overflow corpus, no third-party audits of any kind.
   For most teams this alone is disqualifying today, and pretending otherwise
   would be dishonest.
2. **Bus factor.** Effectively one maintainer. Mantine gets criticized for the
   same thing — at 2.3M downloads/week and 500+ contributors. We are that
   criticism, magnified.
3. **Accessibility pedigree.** Our APG audit was internal (adversarially
   verified, all 35 findings fixed with regression tests — but internal).
   React Aria is maintained by Adobe's accessibility team and tested against
   VoiceOver/NVDA/JAWS/TalkBack; Radix has years of screen-reader-tested
   reputation. We claim AA-target honesty; they have earned institutional trust.
4. **Ecosystem depth.** No Figma kit, no CLI scaffolding ecosystem at shadcn's
   scale, no admin boilerplate at Ant Design Pro's scale, no commercial support
   tier with SLAs like MUI X. Mantine's satellite packages (tiptap editor,
   dropzone, spotlight) and MUI X (Data Grid Pro, Scheduler) go deeper in their
   specialties than our equivalents.
5. **Battle-testing.** Ant Design enforces 100% line coverage and runs at Ant
   Group scale. Our 2,168 tests are genuine but jsdom-only — no cross-browser
   grid, no screen-reader lab, no years of production edge cases.

## Where tekivex-ui genuinely wins (verified against the market)

1. **Shipped security kernel — no mainstream equivalent found.** Prop-boundary
   URL sanitisation, Unicode homoglyph/bidi (Trojan Source) defence, PII
   scrubbing, Trusted Types installer, published threat model, published
   CycloneDX SBOM. Searches across MUI/antd/Chakra/Mantine/shadcn/HeroUI found
   these only as app-level guides or standalone lint/CI tools — never inside a
   component library. Chakra and MUI have SECURITY.md disclosure policies;
   Mantine has none at repo root; nobody publishes a threat model or SBOM.
2. **India-first form suite — unique as an integrated suite.** PAN/Voter
   ID/driving-licence validated inputs + PIN-code cascading address
   (Country→State→District→Sub-district). Fragments exist as utilities
   (react-pincode, postalcodes-india, validator packages); the closest library
   (IndiaCN UI) ships 25 generic components and none of these. No kit ships the
   suite.
3. **Zero runtime dependencies.** 0 direct deps (4 peers, 2 optional) vs MUI's
   12, antd's 48, Chakra's 7. Smallest possible supply-chain surface — and it
   composes with point 1 into a coherent security story no competitor tells.
4. **Honest a11y accounting.** We are the only library in this table that
   published its own failed audit (35 confirmed APG violations), fixed all 35
   with regression tests, and documented the two partial-fix deferrals until
   they closed. Ant Design's maintainers responded to a community a11y audit
   with "no specific plans yet." MUI declines blanket WCAG conformance claims.
   This doesn't outrank React Aria's pedigree — but it beats every *styled* kit
   on transparency.
5. **44 built-in locales incl. RTL + Indic scripts** — behind antd's 73, ahead
   of MUI's 60 on Indic coverage, and far ahead of Mantine/shadcn (zero
   built-in strings).
6. **Bundle discipline.** ~145 kB gz for all 116 components with real subpath
   entries (charts 6.2 kB, headless 0.6 kB, i18n 17.7 kB) — same class as MUI's
   153 kB for ~50 widgets, a third of antd's 452 kB.

## Claims we must NOT make (audit of our own marketing)

- ❌ "Unique browser-native PDF generation." **False as stated.**
  @react-pdf/renderer, PDFx ("shadcn/ui for PDFs", resume templates included),
  and react-print-pdf all do Puppeteer-free React PDFs. Defensible version:
  *"the only general-purpose UI kit that also bundles it."*
- ❌ "The only tamper-evident audit log in npm." tamper-evident-log and
  AuditKit exist. Defensible: *"the only UI component library shipping
  hash-chained audit primitives built in."*
- ❌ Any unqualified "WCAG 2.1 AAA" (already scrubbed repo-wide, v3.29–v3.32).
- ⚠️ "116 components vs their 62" — count comparisons flatter us because
  competitors count conservatively (MUI's 62 includes utils; our 116 includes
  small primitives). Use counts descriptively, never as a quality argument.

## Per-competitor notes (condensed; full agent fact sheets in section below)

- **MUI** — 10.15M dl/wk, 98.7k stars, v9.3.1 (v8 skipped to align with MUI X).
  62 listed components, Emotion by default (Pigment CSS opt-in), all client
  components. $299–$1,399/dev/yr for X Pro/Premium/Enterprise. 12 deps,
  0 advisories in 2 yrs, 60 locales, 74.4% coverage. Pain points (opinion):
  runtime CSS-in-JS overhead, customization verbosity, migration churn.
- **Ant Design** — 3.62M dl/wk, 99k stars, v6.6.0. 73 core components, CSS-vars
  mode, App Router needs a registry package. Everything free (ProComponents
  included). 48 deps, 0 advisories, 73 locales, 100% line coverage.
  Documented weakness: accessibility (invalid ARIA, nested interactive
  elements, maintainer "no specific plans yet").
- **Mantine** — 2.33M dl/wk, 31.5k stars, v9.5.1. 143 components + 82 hooks
  across satellites. CSS Modules, 5 deps, no SECURITY.md, no paid tier
  (OpenCollective). A11y: jest-axe baseline, screen-reader testing admittedly
  deprioritized. Bus factor: one lead maintainer.
- **Chakra UI** — 1.74M dl/wk, 40.6k stars, v3.36.1. ~128 listed components on
  an Ark UI behavior core — but still **Emotion runtime** CSS-in-JS despite
  Panda-flavored branding. $149–$249 Pro templates. SECURITY.md, 7 deps.
- **shadcn/ui** — 7.8M CLI dl/wk, 121k stars. Copy-in model: you own (and must
  patch) every component forever; July 2026 switched default primitives from
  Radix to Base UI. Best Tailwind/RSC story; no built-in i18n; CLI itself had
  CVE-2026-0621 (bundled MCP SDK ReDoS). A11y inherited from primitives; fixes
  don't propagate to copied code.
- **HeroUI** — 341k dl/wk, 23k stars, v3 rewrite (Mar 2026) on React Aria +
  Tailwind v4. 75+ components.
- **React Aria** — 1.12M dl/wk. ~50 unstyled components + 40 hooks. The a11y
  gold standard (Adobe a11y team, multi-screen-reader tested). Not a styled kit
  — it's the layer others build on, and the benchmark our keyboard models chase.

## Positioning that survives this analysis

**"The security-first React component kit — for teams that need a threat model,
an SBOM, zero runtime dependencies, and India-grade forms more than they need a
million-download badge."**

Realistic wedge markets where the trade actually favors us: (1) India-market
products needing the KYC/address suite; (2) security/compliance-sensitive small
teams that value SBOM + threat model + 0-dep supply chain over ecosystem size;
(3) greenfield apps wanting one versioned kit spanning charts + realtime + PDF
+ i18n without assembling five libraries. Everyone else should — honestly —
pick Mantine (batteries, free), shadcn (ownership, Tailwind), MUI (enterprise
support), or antd (data-dense admin, free Pro layer) today, and we should aim
to change that verdict release by release, not copy by copy.

---

_Full per-library fact sheets with per-claim source URLs were gathered by three
research passes on 2026-08-10; key sources: registry.npmjs.org,
api.npmjs.org/downloads, api.github.com, bundlephobia.com/api, mui.com/pricing,
mui.com/material-ui/all-components, ant.design/components/overview,
mantine.dev/about, chakra-ui.com/docs/components/concepts/overview,
ui.shadcn.com/docs/changelog, react-aria.adobe.com, heroui.com, park-ui.com,
plus the differentiator searches cited inline above._
