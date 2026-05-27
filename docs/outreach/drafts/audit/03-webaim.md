# Draft 3 — WebAIM

**To:** `audit@webaim.org` (published on their services page at https://webaim.org/services/audit)

**Subject:** Phased WCAG 2.1 AAA audit quote — open-source React UI library (115 components)

**mailto:** [Click to open in mail client](mailto:audit@webaim.org?subject=Phased%20WCAG%202.1%20AAA%20audit%20quote%20%E2%80%94%20open-source%20React%20UI%20library%20%28115%20components%29&body=Hi%20WebAIM%20team%2C%0A%0AI%20maintain%20TekiVex%20UI%2C%20an%20open-source%20React%20component%20library%20with%20115%20production%20components%2C%20and%20we%27re%20scoping%20a%20third-party%20AAA%20audit%20before%20public%20launch.%20We%27re%20getting%20quotes%20from%20Deque%20and%20TPGi%20but%20want%20to%20consider%20firms%20that%20can%20move%20faster%20or%20scope%20down%20to%20fit%20a%20%245%E2%80%9310k%20v1%20audit.%0A%0AFull%20context%20follows%20%E2%80%94%20happy%20to%20jump%20on%20a%20call%20if%20easier.)

**Sending checklist:**
- [ ] Email composed and personalized
- [ ] Used `novaai0401@gmail.com` as From
- [ ] BCC'd self for record
- [ ] Set calendar reminder for 5-day follow-up

---

Hi WebAIM team,

I maintain TekiVex UI — an MIT-licensed open-source React component library with 115 production components — and we're scoping a third-party WCAG 2.1 AAA audit before public launch. We're getting quotes from Deque and TPGi but want to consider firms that can move faster, scope down to a phased engagement, or work with our open-source / pre-revenue context.

**Why WebAIM specifically:** your reputation in the a11y community is unmatched, and your survey work (the WebAIM Million, the screen-reader user surveys) is the data the rest of the industry quotes. A WebAIM-signed VPAT carries real weight even at smaller dollar figures.

**Project:** WCAG 2.1 Level AAA audit of TekiVex UI v3.17.0
**Repo:** https://github.com/007krcs/tekivex-ui (MIT, public, ~$0 revenue today)
**Demo:** https://ui.tekivex.com (live playground for all components)

**The phased scope I'm proposing — would this fit a $5–10k v1?**

**Phase 1 (target: $5–10k, 4-6 weeks):**
- Audit the 7 most complex components: TkxDataGrid, TkxSelect, TkxDatePicker, TkxModal, TkxMenu, TkxCommand, TkxFlowChart
- Sign-off on the color / keyboard / RTL baseline across the remaining 103 components (sample-based, not exhaustive)
- WCAG 2.1 AAA conformance statement
- VPAT 2.5 covering the audited surface

**Phase 2 (later release, separately priced):**
- Full per-component AAA audit across all 110
- Per-screen-reader transcript matrix (JAWS / NVDA / VO / iOS / TalkBack)
- Re-issued VPAT

**What we'd offer in return:**
- Permission to use your firm name + logo on our landing page from SOW-signing forward
- Public case study at https://ui.tekivex.com/case-studies/webaim-audit when the report lands
- Promotion in our launch blog post + Show HN

**Existing artifacts we'd share at kickoff:**
- `docs/a11y-screen-reader-matrix.md` (470 cells self-tested, 88% pass)
- `docs/SECURITY-THREAT-MODEL.md` (15 STRIDE-mapped threats)
- axe-core CI pipeline, 1,777 passing tests
- Per-component prop tables and usage examples

**Two questions:**

1. Is a $5–10k phased v1 audit something WebAIM can engage on?
2. Open-source / nonprofit pricing — what does your typical discount look like?

Happy to set up a 30-minute call this week or next.

Best,
[YOUR NAME]
Maintainer, TekiVex UI
https://github.com/007krcs/tekivex-ui
novaai0401@gmail.com

---

**Notes for sender:**
- WebAIM is genuinely receptive to phased scopes and open-source pricing — don't be afraid to ask
- They reply on a 3-5 business day cadence, not 24 hours like Deque
- If they suggest phasing differently than I've proposed, take their advice — they've audited 1000s of React apps
