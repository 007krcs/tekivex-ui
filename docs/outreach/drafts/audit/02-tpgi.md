# Draft 2 — TPGi (Vispero)

**To:** Send via web form at `https://www.tpgi.com/contact/` — TPGi routes inquiries through the same form as Deque

**Subject:** WCAG 2.1 AAA audit quote — open-source React UI library, prioritizing JAWS / NVDA / VoiceOver matrix

**mailto:** _N/A — use web form_

**Sending checklist:**
- [ ] Filled out TPGi contact form
- [ ] Selected "Accessibility Audit" or similar from any service dropdown
- [ ] Used `novaai0401@gmail.com` in the email field
- [ ] Set calendar reminder for 48-hour follow-up

---

Hi,

I'm reaching out about a third-party WCAG 2.1 AAA conformance audit for TekiVex UI — an MIT-licensed React component library with 115 production components. We're particularly interested in TPGi because we need real JAWS testing — our self-test matrix currently leans heavier on NVDA and VoiceOver, and Vispero/TPGi's screen-reader expertise is the differentiator that matters to us.

**Project:** WCAG 2.1 Level AAA conformance audit of TekiVex UI v3.17.0

**Repo:** https://github.com/007krcs/tekivex-ui (MIT, public)

**Live demo site:** https://ui.tekivex.com (interactive playground for all 115 components)

**Scope:**
- 115 production React components
- Theming system (light + dark, AAA contrast ratios self-attested)
- The 7 most complex components for deep keyboard / screen-reader testing: TkxDataGrid, TkxSelect, TkxDatePicker, TkxModal, TkxMenu, TkxCommand, TkxFlowChart
- RTL correctness for ar-SA, he-IL, fa-IR locales

**Out of scope:** 4 experimental components, the `tekivex-3d` / `tekivex-pdf` sister packages.

**Test matrix requested (this is the part we'd really love TPGi's expertise on):**
- JAWS on Windows
- NVDA on Windows
- macOS VoiceOver
- iOS VoiceOver
- Android TalkBack

**Deliverables:**
1. WCAG 2.1 AAA conformance report
2. VPAT 2.5 (federal procurement-ready)
3. Per-component findings list (critical / major / minor / advisory)
4. ACR for public publication
5. Re-audit quote for our next minor release

**Questions:**

1. Quote envelope for scope as described?
2. Earliest SOW signing date — we want to name TPGi on our launch landing page **before** the report lands?
3. Can you produce per-screen-reader transcripts as part of the deliverable, or is that scoped separately?
4. Open-source / nonprofit pricing available?

Existing artifacts we can share:
- `docs/a11y-screen-reader-matrix.md` — 470 cells self-tested, 88% pass
- 1,777 unit tests, axe-core in CI on every PR
- `docs/SECURITY-THREAT-MODEL.md` (15 STRIDE-mapped threats with CWE refs)

Happy to set up a 30-minute scoping call this week or next.

Best,
[YOUR NAME]
Maintainer, TekiVex UI
https://github.com/007krcs/tekivex-ui
novaai0401@gmail.com

---

**Notes for sender:**
- Mention the JAWS angle prominently — it's TPGi's differentiator vs Deque
- TPGi quotes typically come back $5k cheaper than Deque for comparable scope
- If they offer to call you, accept — TPGi sales is consultative, not pushy
