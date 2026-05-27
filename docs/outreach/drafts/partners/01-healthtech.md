# Draft — Healthtech / EHR vendor cold outreach

**To:** Find on `[COMPANY].com/contact` or LinkedIn — target VP Engineering, CTO, or Head of Frontend at a HIPAA-regulated company

**Subject:** A React component kit with a published threat model — design-partner spot for [COMPANY]?

**mailto template:** [Click to open in mail client (you'll still need to set the To: field)](mailto:?subject=A%20React%20component%20kit%20with%20a%20published%20threat%20model%20%E2%80%94%20design-partner%20spot%20for%20%5BCOMPANY%5D%3F&body=Hi%20%5BNAME%5D%2C%0A%0AI%27m%20%5BYOUR%20NAME%5D%2C%20maintainer%20of%20TekiVex%20UI%20%E2%80%94%20a%20React%20component%20library%20that%20ships%20with%20a%20published%20threat%20model%2C%20magic-byte%20file-upload%20verification%2C%20Trusted%20Types%2C%20and%20a%20tamper-evident%20SHA-256%20audit%20trail.%20It%27s%20MIT%2C%20zero%20runtime%20deps%20in%20core%2C%20WCAG%202.1%20AAA%20target%20%28third-party%20audit-firm%20engagement%20open%29.)

---

Hi [NAME],

I'm [YOUR NAME], maintainer of TekiVex UI — a React component library that ships with a published threat model, magic-byte file-upload verification, Trusted Types, and a tamper-evident SHA-256 audit trail. It's MIT, zero runtime deps in core, WCAG 2.1 AAA target (third-party audit-firm engagement open).

I'm onboarding our first 5 design partners before public launch. I noticed [COMPANY] ships [SPECIFIC PRODUCT — e.g. "an EHR for outpatient cardiology," "a HIPAA-compliant patient portal," "a clinical-trial enrollment platform"], and I think we'd be a useful fit because:

- Your HIPAA audit team will care about the threat model — most React UI libraries don't publish one, and security review of an off-the-shelf component kit usually costs 2-4 weeks of engineering time. Ours is documented at https://ui.tekivex.com/docs/security-threat-model with 15 STRIDE-mapped threats and CWE references.
- We ship magic-byte MIME verification on file uploads (real signature bytes, not just the Content-Type header) — directly relevant for clinical-document upload flows.
- A tamper-evident SHA-256 hash-chained audit trail is built into the library — useful for the audit-log requirements in 21 CFR Part 11 and similar.
- Zero runtime dependencies in the core means no transitive-deps surprises when your SBOM gets reviewed.

**What we offer:**
- Free white-glove integration — direct Slack channel with maintainers, priority issue response within 24 hours, pair-programming sessions for the first sprint
- Custom components on demand — if you need a primitive that doesn't exist (e.g. `TkxHIPAAConsent`), we build it within 2 weeks and open-source the result
- Pre-publication review of any case study mentioning [COMPANY] — your team has veto power on copy

**What we ask in return:**
- One company logo on https://ui.tekivex.com
- One 2-3 sentence quote from a named decision-maker (VP Eng / CTO / Head of Engineering)
- Permission to mention [COMPANY] in our launch blog post and one Show HN

We do NOT ask for payment, exclusivity, or refund clauses.

Worth a 20-minute call? I can walk through the security primitives and the threat model. If now isn't the right time, no worries — happy to circle back when you're ready.

Best,
[YOUR NAME]
Maintainer, TekiVex UI

Threat model: https://ui.tekivex.com/docs/security-threat-model
SBOM:         https://ui.tekivex.com/security/sbom.json
GitHub:       https://github.com/007krcs/tekivex-ui
Reply to:     novaai0401@gmail.com

---

**Notes for sender:**
- Personalize [NAME], [COMPANY], [SPECIFIC PRODUCT], [YOUR NAME] before sending
- Look up the recipient on LinkedIn first — if they're under "Director of Engineering" or lower, write to their VP instead
- Healthtech-specific qualifying signals: "HIPAA," "HITECH," "21 CFR Part 11," "BAA," "PHI"
- Target companies (Q2 2026 — research current funding stage):
  - Headway, Spring Health, Lyra (mental health)
  - Carbon Health, Forward, One Medical (primary care)
  - Curative, Color, Galleri (diagnostics)
  - Maven, Tia, Folx (specialty care)
  - Truepill, Capsule, Alto (pharmacy)
  - Veeva, Florence, Medable (clinical-trial tech)
- Do NOT contact Epic, Cerner/Oracle Health, Athena — they have internal component teams
