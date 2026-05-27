# Draft 1 — Deque Systems

**To:** Send via web form at `https://www.deque.com/contact/` (Deque does not publish a sales email; the contact form routes to their sales team within 24 hours)

**Subject:** Quote request — WCAG 2.1 AAA audit + VPAT for an MIT React UI library (115 components, open source)

**mailto:** _N/A — use web form_

**Sending checklist:**
- [ ] Filled out web form (Subject: paste the line above, Body: paste below)
- [ ] Selected "Services" or "Audit" from any dropdown
- [ ] Used `novaai0401@gmail.com` in the email field
- [ ] Confirmed reply received within 48 hours (set calendar reminder)

---

Hi,

I maintain TekiVex UI — an MIT-licensed React component library with 115 production components, a published security threat model, and a self-attested WCAG 2.1 AAA target. We're approaching a public launch and we want a third-party Deque audit + VPAT before announcing the AAA claim publicly.

Quick context: the library is open-source, the demo site is live at https://ui.tekivex.com, and we already run axe-core in CI on every PR (passes clean). We're not starting from a hostile baseline — we want the third-party rigor we can't self-attest to.

**Scope:**
- 115 production React components in the `tekivex-ui` npm package
- Live demo: https://ui.tekivex.com (interactive playground for each component)
- Theming system (light + dark themes, contrast ratios)
- Keyboard-navigation patterns across the 7 most complex components (TkxDataGrid, TkxSelect, TkxDatePicker, TkxModal, TkxMenu, TkxCommand, TkxFlowChart)

**Out of scope:** 4 experimental components in `tekivex-ui/experimental`, the `tekivex-3d` and `tekivex-pdf` sister packages.

**Test environments requested:** Chrome + macOS VoiceOver · Firefox + NVDA on Windows · Safari + iOS VoiceOver · Chrome + Android TalkBack · JAWS on Windows.

**Deliverables we need:**
1. Full WCAG 2.1 AAA conformance report
2. VPAT 2.5 suitable for U.S. federal procurement
3. Per-component findings with severity (critical / major / minor / advisory)
4. ACR for public publication
5. Re-audit pricing for our next minor release

**Three specific questions:**

1. Rough quote envelope for the scope as described?
2. Earliest SOW signing date — we want to put "Audit underway with Deque" on our landing page **before** the report lands?
3. Anything in our scope you'd recommend descoping for a v1 audit to hit a budget or timeline target?

Existing accessibility artifacts we can share on request:
- `docs/a11y-screen-reader-matrix.md` — 470 cells, 88% pass across NVDA / JAWS / VO / iOS / TalkBack (self-tested)
- `docs/SECURITY-THREAT-MODEL.md` — 15 STRIDE-mapped threats, CWE references
- 1,777 unit tests, axe-core in CI, ratchet enforced

Happy to set up a 30-minute scoping call. The earlier we can sign, the sooner we can name your firm on our launch page.

Best,
[YOUR NAME]
Maintainer, TekiVex UI
https://github.com/007krcs/tekivex-ui
novaai0401@gmail.com

---

**Notes for sender:**
- Replace `[YOUR NAME]` with your real name
- If Deque's web form has a budget dropdown, select `$15k–$25k`
- If they ask for company name, "TekiVex UI (open-source maintainer)" is fine
- Expected reply: 24–48 hours from a sales rep, then a 30-min discovery call
