# Draft — Fintech / payments / lending company cold outreach

**To:** Find on LinkedIn — target VP Engineering, CTO, Head of Platform, or Security Engineering Lead at a regulated fintech

**Subject:** [INTRO NAME] said we should talk — TekiVex UI design partner for [COMPANY]?

(If no warm intro: drop the bracket and use: "Threat-model-first React UI library — design-partner spot for [COMPANY]?")

**mailto template:** [Click to open in mail client](mailto:?subject=%5BINTRO%20NAME%5D%20said%20we%20should%20talk%20%E2%80%94%20TekiVex%20UI%20design%20partner%20for%20%5BCOMPANY%5D%3F&body=Hi%20%5BNAME%5D%2C%0A%0A%5BINTRO%20NAME%5D%20mentioned%20you%27re%20shipping%20%5BPRODUCT%5D%20and%20dealing%20with%20%5BSOC%202%20%2F%20PCI-DSS%20%2F%20similar%5D.%20I%27m%20building%20TekiVex%20UI%20%E2%80%94%20a%20React%20component%20library%20that%27s%20trying%20to%20be%20the%20boring%2C%20defensible%20choice%20for%20regulated-industry%20frontend%20teams.)

---

Hi [NAME],

[INTRO NAME] mentioned you're shipping [PRODUCT — e.g. "the new merchant onboarding flow," "the small-business lending portal," "the new compliance dashboard"] and dealing with [SOC 2 / PCI-DSS / regulator-specific framework].

I'm building TekiVex UI — a React component library that's trying to be the boring, defensible choice for regulated-industry frontend teams. Specifically:

- **Published threat model** with 15 STRIDE-mapped threats, CWE references, per-component coverage matrix. The only mainstream React UI library that publishes one.
- **PII redaction with Luhn-validated credit cards** — `scrubPII()` runs regex + mod-10 check so 13-digit order IDs don't false-positive as card numbers when you log them.
- **Magic-byte MIME verification** on file uploads — verifies actual signature bytes, defends against polyglot files and Content-Type spoofing.
- **Tamper-evident SHA-256 hash-chained audit trail** — every component render is loggable, the chain is verifiable, useful for SOC 2 audit evidence.
- **Trusted Types policy installer** — one call locks down DOM XSS sinks at the browser level.
- **Zero runtime dependencies in core** — clean SBOM at https://ui.tekivex.com/security/sbom.json. No transitive-deps surprises during vendor review.
- **MIT licensed**, 116 production components, 1,798 unit tests, WCAG 2.1 AAA target (third-party audit-firm engagement open).

**The design-partner ask:**

I'm onboarding 5 design partners before public launch. Free white-glove integration — direct Slack with maintainers, custom components on demand, priority response. In exchange we'd ask for a 2-3 sentence quote from your VP Eng / CTO once you've shipped something with it, plus permission to use [COMPANY]'s logo on the landing page.

No payment, no exclusivity, no refund clauses. You retain copy approval on anything we publish about you.

15 minutes this week or next? Happy to walk through the security primitives — if it's a fit you'll know in 5 minutes, and if not we both saved time.

Best,
[YOUR NAME]
Maintainer, TekiVex UI

Threat model: https://ui.tekivex.com/docs/security-threat-model
SBOM:         https://ui.tekivex.com/security/sbom.json
GitHub:       https://github.com/007krcs/tekivex-ui
Reply to:     novaai0401@gmail.com

---

**Notes for sender:**
- Fintech leads are typically PCI-DSS, SOC 2 Type II, ISO 27001, or BSA/AML for lenders
- Warm intros via mutual LinkedIn or your network outperform cold by 5-10×. Always try for the intro first.
- Target companies (Q2 2026):
  - Plaid, Stripe, Adyen, Marqeta (payments infra)
  - Brex, Ramp, Mercury, Relay (business banking)
  - Wealthfront, Betterment, Public, Robinhood (investing)
  - Affirm, Klarna, Sezzle (BNPL)
  - Chime, Varo, Cash App (consumer banking)
  - Lendio, Funding Circle, OnDeck (small-business lending)
- Do NOT contact JPMorgan, Goldman, BofA — they build internally and don't take design-partner pitches from outside
