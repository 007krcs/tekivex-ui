# WCAG 2.1 AAA Audit — engagement kit

This directory is the operational playbook for landing a third-party WCAG 2.1
AAA accessibility audit. Until a firm countersigns the SOW, the README and
landing page must say "audit-firm engagement open" — not "audit in progress."

## Why we need this (short version)

The README and landing page claim **"WCAG 2.1 AAA target"** as a competitive
differentiator. Without a third-party VPAT or ACR signed by a credible firm,
the claim is self-attested — which a critical Hacker News commenter will
surface in the first hour of any launch. The threat-model story is real; the
AAA story is currently a promise.

Goal: **signed SOW with one of Deque / TPGi / Level Access within 30 days.**
Audit report doesn't need to land before launch — but a signed SOW + firm name
on the landing page does.

Budget envelope: **$8k – $25k** depending on scope (see "Scope brief" below).
Smaller firms quote $4–8k; the three majors quote $15–25k for a full
component-library audit + VPAT.

## Vendor options (ranked by fit)

### 1. Deque Systems — `https://www.deque.com/services/`

- **Why first**: They built `axe-core`, the de-facto accessibility test engine
  most of the industry uses. Their VPAT carries more weight than any other
  firm's. They publish public audit reports for clients who allow it
  (Microsoft, Stripe).
- **Lead time**: 4–6 weeks from SOW to draft report.
- **Quote-request**: contact form at deque.com/contact. Sales rep replies
  within 2 business days.
- **Typical scope for a component library**: $18k–$25k for ~100 components +
  VPAT + remediation guidance.
- **Best for**: enterprise-credibility. A Deque badge is the gold standard.

### 2. TPGi — `https://www.tpgi.com/services/`

- **Why second**: Vispero subsidiary, built the JAWS screen reader. Strong on
  cross-platform assistive-tech testing. Cheaper than Deque, comparable
  rigor.
- **Lead time**: 3–5 weeks.
- **Typical scope**: $12k–$18k.
- **Best for**: if budget is tighter and we want JAWS/NVDA/VoiceOver matrix
  testing alongside the WCAG conformance review.

### 3. Level Access — `https://www.levelaccess.com/`

- **Why third**: Big team, lots of public-sector and Fortune 500 work. Their
  process is a bit heavier (more meetings, longer cycle) but they produce
  audit-defensible documentation.
- **Lead time**: 5–8 weeks.
- **Typical scope**: $15k–$22k.
- **Best for**: if we're chasing a specific U.S. federal-contract opportunity
  where Level Access is already on the agency's approved-vendor list.

### Honorable mentions (smaller / cheaper)

- **Accessible360** (accessible360.com) — $5–10k, faster turnaround, less
  brand weight.
- **Pope Tech** (pope.tech) — automated-first, lighter manual review. Good
  for budget-constrained interim audits.
- **WebAIM** (webaim.org/services/audit) — academic / nonprofit roots, modest
  pricing, high credibility in the a11y community.

**Recommendation**: send the same inquiry to Deque + TPGi + WebAIM
simultaneously, pick based on quote + timeline.

## Scope brief (send with every inquiry)

Copy-paste the section below into the body of the outreach email after the
template paragraph.

---

**Project:** WCAG 2.1 Level AAA conformance audit of TekiVex UI v3.17.0

**Repo:** https://github.com/007krcs/tekivex-ui (MIT-licensed, public)

**Live demo site:** https://ui.tekivex.com (115 production components,
interactive playground for each)

**Surface to audit (in-scope):**
- 115 production React components in the `tekivex-ui` npm package
- All component variants documented at https://ui.tekivex.com/docs
- Theming system (light + dark themes, contrast ratios)
- Keyboard-navigation patterns across the 7 most complex components
  (TkxDataGrid, TkxSelect, TkxDatePicker, TkxModal, TkxMenu, TkxCommand,
  TkxFlowChart)

**Out of scope:**
- The 4 experimental components in `tekivex-ui/experimental`
- The `tekivex-3d` and `tekivex-pdf` sister packages (audited separately)
- Consumer applications built with TekiVex UI

**Test environments requested:**
- Chrome + macOS VoiceOver
- Firefox + NVDA on Windows
- Safari + iOS VoiceOver
- Chrome + Android TalkBack
- JAWS on Windows

**Deliverables we need:**
1. Full conformance report mapped to WCAG 2.1 Level AAA success criteria
2. VPAT 2.5 (or current revision) suitable for U.S. federal procurement
3. Per-component findings list with severity (critical / major / minor /
   advisory) and remediation guidance
4. ACR (Accessibility Conformance Report) for public publication
5. Re-audit pricing for the next minor release (v3.18 or v3.19)

**Existing self-attestation we'd like you to validate:**
- Color contrast meets AAA (≥7:1 for normal text, ≥4.5:1 for large) — we have
  internal `meetsAA()` / `meetsAAA()` checkers but want third-party
  verification
- Keyboard reachability of all interactive elements
- ARIA usage matches WAI-ARIA 1.2 patterns
- Reduced-motion preference respected on all animations
- RTL support correctness for `ar-SA`, `he-IL`, `fa-IR` locales

**Existing artifacts we'll provide:**
- `docs/a11y-screen-reader-matrix.md` (470 cells, 88% pass across NVDA / JAWS
  / VO / iOS / TalkBack — self-tested)
- `docs/SECURITY-THREAT-MODEL.md` (15 STRIDE-mapped threats, CWE references)
- `scripts/a11y-audit.mjs` (axe-core CI integration — passes clean on every
  PR)
- Per-component test files at `tests/*.test.tsx` (1,777 tests, ratchet
  enforced in CI)
- Screen-reader test transcripts on request

**Public-relations question:** Can we use your firm's name + logo on
https://ui.tekivex.com once the SOW is signed (before the audit completes)?
Specifically: "Audit underway with [Firm Name] — report expected [Q3 2026]."
This is critical for our launch credibility timeline.

---

## Outreach templates

Send from `novaai0401@gmail.com`. Subject lines tested against published audit
firm-marketing pages.

### Template A — Deque

**Subject:** Quote request — WCAG 2.1 AAA audit + VPAT for an MIT React UI library (115 components)

> Hi,
>
> I maintain TekiVex UI — an MIT-licensed React component library with 110
> production components, a published security threat model, and a self-attested
> WCAG 2.1 AAA target. We're approaching a public launch and want a third-party
> Deque audit + VPAT before announcing the AAA claim publicly.
>
> Quick context: the library is open-source, the demo site is live at
> ui.tekivex.com, and we already run axe-core in CI on every PR (passes clean).
> We're not starting from a hostile baseline — we're looking for the third-party
> rigor we can't self-attest to.
>
> Scope brief and existing accessibility artifacts attached below. Three
> questions:
>
>   1. Rough quote envelope for the scope as described?
>   2. Earliest SOW signing date — we'd like to put "Audit underway with
>      Deque" on our landing page before the report lands?
>   3. Anything in our scope that you'd recommend descoping for a v1 audit to
>      hit a budget / timeline target?
>
> Happy to set up a 30-minute scoping call. The earlier we can sign, the
> sooner we can name your firm on our launch page.
>
> Best,
> [007krcs]
>
> [paste Scope brief block from above]

### Template B — TPGi

**Subject:** WCAG 2.1 AAA audit quote — open-source React UI library, looking for JAWS/NVDA/VoiceOver matrix

> Hi,
>
> I'm reaching out about a third-party WCAG 2.1 AAA conformance audit for
> TekiVex UI — an MIT-licensed React component library with 115 production
> components. We're particularly interested in TPGi because we need real
> JAWS testing (our self-test matrix currently leans heavier on NVDA / VO).
>
> [same as Template A from "Quick context" onward]

### Template C — Smaller firm (WebAIM / Accessible360 / Pope Tech)

**Subject:** Quote request — WCAG 2.1 AAA audit, open-source React UI library, flexible scope

> Hi,
>
> I maintain TekiVex UI, an open-source React component library with 110
> production components, and we're scoping a third-party AAA audit before
> public launch. We're getting quotes from Deque and TPGi but want to
> consider firms that can move faster or scope down to fit a $5–10k v1 audit.
>
> Would you be open to a phased engagement? Phase 1: audit the 7 most
> complex components (TkxDataGrid, TkxSelect, TkxDatePicker, TkxModal,
> TkxMenu, TkxCommand, TkxFlowChart) + sign off on the
> color/keyboard/RTL baseline across the remaining 103. Phase 2 (later
> release): full per-component AAA.
>
> Existing artifacts attached.
>
> Best,
> [007krcs]
>
> [paste Scope brief block]

---

## Negotiation cheat-sheet

When the quote arrives, expect these levers:

| Lever | Direction | Typical impact |
|---|---|---|
| Phase the audit (7 most complex now, rest later) | ↓ budget | $5–8k cheaper |
| Drop the VPAT 2.5 doc | ↓ budget | $1–3k cheaper, but VPAT is the procurement-defensible artifact — don't drop unless desperate |
| Drop JAWS / iOS VoiceOver from the test matrix | ↓ budget | $2–4k cheaper, but undermines the cross-AT story |
| Permission to publish firm name on landing page before report lands | ↑ value | Free; some firms decline, some welcome the marketing exposure |
| Re-audit discount on minor releases | ↑ value | Negotiate ~50% off if signed in the same SOW |
| Open-source / nonprofit pricing | ↓ budget | 10–25% off at WebAIM and Accessible360; Deque rarely budges |

## Process — once a firm says yes

1. **Sign SOW** — get firm name + estimated report date in writing.
2. **Update README + landing page** within 24h: change "audit-firm
   engagement open" → "Audit underway with [Firm]. Report expected [date]."
3. **Update `landing/src/sections/DesignPartners.tsx`** with a dedicated
   "Audit partner" card.
4. **Send the engagement-kickoff artifacts**:
   - Live demo site URL
   - GitHub repo URL
   - `docs/a11y-screen-reader-matrix.md`
   - `docs/SECURITY-THREAT-MODEL.md`
   - `scripts/a11y-audit.mjs` output from the latest CI run
5. **Pause on adding new components** during the audit window — don't move
   the target.
6. **On report receipt**: triage findings into a public GitHub project board,
   commit to a remediation timeline for critical + major, ship the VPAT at
   `https://ui.tekivex.com/security/vpat-2.5.pdf` next to the SBOM.
7. **Public announcement**: blog post + Show HN once the report lands +
   findings are resolved.

## Status — who we've contacted

| Date | Firm | Contact | Quote | Status | Notes |
|---|---|---|---|---|---|
| _none yet_ | _Add entries as outreach happens._ |  |  |  |  |

Update this table after every send. It's the single source of truth.

## Anti-patterns — do NOT

- Do NOT use "Audit certified by [Firm]" until the report is signed AND
  published. "Audit underway with [Firm]" is honest; "certified" is not.
- Do NOT pay for a "WCAG AAA badge" from a no-name firm — those don't
  withstand scrutiny and can backfire (search "WCAG fake badge" on Reddit).
- Do NOT skip the VPAT to save money unless we have no federal-contract
  ambitions. Without a VPAT, U.S. agency procurement teams cannot evaluate us
  at all.
- Do NOT promise the audit firm we'll fix every finding. Commit to fixing
  critical + major; defer minor + advisory to a public roadmap with named
  releases.
