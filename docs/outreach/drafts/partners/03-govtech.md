# Draft — GovTech / public sector vendor cold outreach

**To:** Find on LinkedIn — target VP Engineering, Head of Platform, or Chief Architect at a company building for U.S. federal, state, local, or EU public-sector buyers

**Subject:** WCAG AAA + Section 508 + published threat model — design partner for [COMPANY]?

**mailto template:** [Click to open in mail client](mailto:?subject=WCAG%20AAA%20%2B%20Section%20508%20%2B%20published%20threat%20model%20%E2%80%94%20design%20partner%20for%20%5BCOMPANY%5D%3F&body=Hi%20%5BNAME%5D%2C%0A%0AI%27m%20%5BYOUR%20NAME%5D%2C%20maintainer%20of%20TekiVex%20UI.%20We%27re%20a%20React%20component%20library%20designed%20for%20vendors%20selling%20into%20regulated%20public-sector%20buyers.%20Specifically%3A%20WCAG%202.1%20AAA%20target%20%28Deque%2FTPGi%20audit%20engagement%20open%29%2C%20Section%20508%20VPAT-ready%2C%20published%20threat%20model%20with%2015%20STRIDE-mapped%20threats%2C%20MIT%20license.)

---

Hi [NAME],

I'm [YOUR NAME], maintainer of TekiVex UI. We're a React component library designed specifically for vendors selling into regulated public-sector buyers. The specifics:

- **WCAG 2.1 AAA target** with third-party audit-firm engagement open (Deque, TPGi, WebAIM). Once the SOW signs we'll be one of the very few component libraries with a defensible AAA story.
- **Section 508 VPAT** — included as a Phase 1 deliverable on the audit. EU EAA (European Accessibility Act, in force since June 2025) covered by the same VPAT.
- **Published threat model** at https://ui.tekivex.com/docs/security-threat-model — 15 STRIDE-mapped threats, CWE references, per-component coverage matrix. No other mainstream React UI library publishes one.
- **CycloneDX SBOM** at https://ui.tekivex.com/security/sbom.json — clean SBOM, zero runtime dependencies in core, ready for the FedRAMP / StateRAMP supply-chain attestations.
- **Trusted Types + CSP builder + magic-byte MIME verification + tamper-evident SHA-256 audit trail** — primitives that make agency-side security review faster.
- **MIT licensed**, 116 production components, 1,798 unit tests, 44-locale i18n with RTL.

[COMPANY]'s [SPECIFIC PRODUCT — e.g. "permit-issuance platform," "court e-filing portal," "Medicaid eligibility dashboard"] is exactly the kind of project where this checklist matters — agencies' procurement teams parse the VPAT and SBOM before they parse the demo.

**The design-partner ask:**

I'm onboarding 5 design partners before public launch. Free white-glove integration, direct Slack with maintainers, custom components on demand (if you need `TkxFEIN`, `TkxSAMRegistrant`, or similar government-specific primitives, we build them and open-source the result). In exchange: [COMPANY]'s logo on the landing page, one 2-3 sentence quote from a named decision-maker, permission to mention you in our launch announcement.

No payment, no exclusivity, full copy approval on your end.

Worth 20 minutes to walk through it?

Best,
[YOUR NAME]
Maintainer, TekiVex UI

Threat model: https://ui.tekivex.com/docs/security-threat-model
SBOM:         https://ui.tekivex.com/security/sbom.json
GitHub:       https://github.com/007krcs/tekivex-ui
Reply to:     novaai0401@gmail.com

---

**Notes for sender:**
- Public-sector software vendors care about: WCAG AAA (Section 508 / EAA / state-specific), SBOM (FedRAMP / StateRAMP), threat model (CMMC for defense work), VPAT
- Decision cycles are longer — expect 3-6 weeks for first response, longer for legal review
- Target companies (Q2 2026):
  - **U.S. federal vendors:** Nava PBC, Truss, Ad Hoc, Skylight, 18F alumni shops
  - **State/local:** Code for America, Bloom Works, Tyler Technologies (cautiously — large)
  - **Justice tech:** Fines & Fees Justice Center vendors, ODR platforms
  - **Health-public-sector:** Medicaid managed-care platforms (Centene, Molina vendors), 211 platforms
  - **EU public sector:** German GovTech vendors (Govdigital, polyteia), French (beta.gouv.fr alumni shops)
- Do NOT contact: Palantir, Booz Allen, Leidos, SAIC, large primes — they don't take design-partner pitches
