# Design Partner Program — operational kit

This directory is the playbook for landing the first 5 design-partner logos on
the tekivex-ui landing page. The landing-page slot is already scaffolded
(`landing/src/sections/DesignPartners.tsx`) — once we have a signed quote, we
add the entry to that file and ship.

## Why this matters (short version)

A skeptical procurement / staff-eng evaluator reads the landing page top to
bottom. With **zero logos**, the threat-model / AAA pitch reads as
"vapor — nobody has shipped this in production." With **one named logo + one
named quote from a regulated industry**, the same pitch reads as "they took
the security narrative seriously enough that a real bank/hospital/agency bet
on it." That single delta drives most of the launch credibility.

Goal: **3 signed logos before public launch**, 5 within 90 days.

## Ideal partner profile (qualification rubric)

A partner is a good fit if **all five** of the following hold:

1. **Regulated industry** — healthtech, fintech, public sector, edtech, legal,
   or insurance. (NOT: consumer apps, indie SaaS, agency projects.)
2. **Team size** — between 5 and 200 engineers. Big enough that "we picked this
   library" is a real decision; small enough that we can talk to a real human.
3. **Active React adoption** — already shipping a React app or about to start one.
   Not "considering React for v2."
4. **Compliance pressure** — they have a real obligation: HIPAA, PCI-DSS,
   SOC 2, ISO 27001, EAA, Section 508, FedRAMP, GDPR with regulator interest.
   This is what makes the threat-model story land.
5. **Decision-maker access** — we can get a quote from a VP Eng, CTO, CISO,
   Head of Platform, or equivalent. NOT an IC unless they have the title to
   sign off on the public statement.

If 4 of 5 hold, still pursue. If 3 of 5 hold, deprioritize.

## What we offer (write this in every outreach)

- **Free white-glove integration** — 1:1 Slack/Discord with maintainers (007krcs,
  seemaalmas), priority issue response (<24h), pair-programming sessions for the
  first sprint.
- **Custom components on demand** — if a partner needs a primitive that doesn't
  exist (e.g. `TkxHIPAAConsent`, `TkxKYBForm`), we build it for them within 2 weeks,
  open-source the result.
- **Pre-publication review** — partner gets to read every blog post / Show HN /
  Product Hunt copy before it ships, with veto power on anything that
  misrepresents their use case.
- **Named in the case study** — but partner controls the exact wording of their
  quote, gets a copy of the final case study PDF, and can pull the quote at any
  time with 30 days notice.
- **Direct line on the threat model** — partner's security team gets a private
  channel to escalate vulnerabilities; we ship a CVE-coordinated fix within
  the SLA documented in `SECURITY.md`.

## What we ask in return

- One company logo (SVG, monochrome preferred) on `ui.tekivex.com`.
- One quote (2-3 sentences) from a named decision-maker on the landing page.
- One short case study (~600 words) we can publish at `/case-studies/<slug>`.
- Permission to mention them in conference talks, podcast appearances, and one
  press release at launch.

We do NOT ask for: payment, exclusivity, refund clauses, or anything that
would make a procurement team uncomfortable.

---

## Outreach templates

Send these from `partners@tekivex.com`. Reply-to should be a real human (007krcs).

### Template A — Cold outreach, healthtech / EHR vendor

**Subject:** A React component kit with a published threat model — design-partner spot for [Company]?

> Hi [Name],
>
> I'm [007krcs], maintainer of TekiVex UI — a React component library that ships
> with a published threat model, magic-byte file-upload verification, Trusted
> Types, and a tamper-evident SHA-256 audit trail. It's MIT, zero runtime deps,
> WCAG 2.1 AAA target (third-party audit booked).
>
> I'm onboarding our first 5 design partners before public launch. I noticed
> [Company] ships [specific product / specific compliance need — DO YOUR HOMEWORK
> HERE], and I think we'd be a useful fit because [one specific reason — e.g.
> "your HIPAA audit team will care about the threat model"].
>
> The offer: free white-glove integration, custom components if you need them,
> direct line to maintainers, named on the landing page as one of our first
> regulated-industry adopters. In exchange we'd ask for a 2-3 sentence quote
> from your VP Eng / CTO once you've shipped something with it.
>
> Worth a 20-minute call? I can show you the security primitives in action and
> walk through the threat model.
>
> — [007krcs]
> Threat model: https://ui.tekivex.com/docs/security-threat-model
> SBOM: https://ui.tekivex.com/security/sbom.json
> GitHub: https://github.com/007krcs/tekivex-ui

### Template B — Warm intro, fintech

**Subject:** [Intro name] suggested we talk — design partner for TekiVex UI

> Hi [Name],
>
> [Intro name] mentioned you're shipping [product] and dealing with [SOC 2 / PCI
> DSS / similar]. I'm building TekiVex UI — a React component library that's
> trying to be the boring, defensible choice for regulated-industry frontend
> teams. Published threat model, magic-byte MIME on file upload, Luhn-validated
> PII redaction, SHA-256 audit trail, WCAG 2.1 AAA target.
>
> We're onboarding 5 design partners before public launch. Free white-glove
> integration in exchange for being named on the landing page once you've
> shipped something with it.
>
> 15 minutes this week or next?
>
> — [007krcs]

### Template C — Inbound qualification (use when someone asks "what's TekiVex?")

> Thanks for reaching out! Short version: tekivex-ui is a React component library
> targeting regulated-industry teams. 116 production components, WCAG 2.1 AAA
> target, zero runtime deps in core, published threat model.
>
> Before I send the docs, two quick questions:
>
>   1. What's the compliance regime you're shipping under? (HIPAA / PCI / SOC 2 /
>      gov / etc.)
>   2. Roughly how many engineers on the React side?
>
> If you're in a regulated industry, we have a design-partner program with free
> white-glove integration — would that be interesting? Otherwise the npm package
> + docs site has everything you need to evaluate.

---

## Process — once a partner says yes

1. **Kickoff call (30 min)** — agenda below. 007krcs + seemaalmas + partner CTO/VP Eng + their lead frontend.
2. **Shared Slack/Discord channel** created within 24h. Pin: threat model, SBOM, SECURITY.md.
3. **First integration sprint (2 weeks)** — pair-program one screen / one form / one DataGrid usage. Goal: partner ships *something* using tekivex-ui within 14 days.
4. **Quote collection** at week 4: short async questionnaire (5 questions, <10 min). They write the quote, we lightly copyedit, they approve final.
5. **Logo + quote shipped** to `landing/src/sections/DesignPartners.tsx` within 48h of approval.
6. **Case study draft** by week 8 (we write, they review, they approve).
7. **Launch coordination** — partner gets 7 days advance notice of any HN/Reddit/Twitter announcement that mentions them.

### Kickoff call agenda template

- (5 min) Introductions, the team behind tekivex-ui
- (10 min) Their use case — what are they building, what's the compliance pressure
- (10 min) Library walkthrough — threat model, the 3 most relevant primitives for their stack
- (5 min) Logistics — Slack channel, escalation path, quote process

---

## Storage convention

Once we have a partner signed:

- `landing/public/partners/<slug>.svg` — logo (monochrome, 24px tall, ~2 kB)
- `docs/design-partners/<slug>.eml` — written quote-permission email (proof for audit)
- `docs/design-partners/<slug>.md` — internal notes (their stack, contacts, escalation path)
- `docs-site/src/content/docs/case-studies/<slug>.mdx` — public case study
- Update `landing/src/sections/DesignPartners.tsx` PARTNERS array with the entry

---

## Status — who we've contacted

| Date | Company | Vertical | Contact | Status | Notes |
|---|---|---|---|---|---|
| _none yet_ | _Add entries here as outreach happens._ |  |  |  |  |

Update this table after every send. It's the single source of truth for the
program.

## Anti-patterns — do NOT

- Do NOT promise SLAs we can't deliver (we are not 24/7 enterprise support).
- Do NOT offer exclusivity to one partner per vertical — that kills the
  "trusted by N healthtechs" narrative.
- Do NOT publish a quote without written email approval. Screenshots and Slack
  messages are not consent.
- Do NOT name-drop a partner before their first integration ships — premature
  logos read as paid endorsements.
- Do NOT pursue consumer-app companies. The pitch doesn't land; their procurement
  doesn't care about a threat model.
