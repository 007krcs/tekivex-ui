# SOC 2 Evidence Pack — outline

**Status:** draft  
**Scope:** Type II readiness for tekivex-ui (the open-source org) and the hosted tekivex.dev surface  
**Auditor target:** any AICPA-licensed firm; shortlist: Prescient Assurance, Johanson Group, A-LIGN

> We are not a SaaS, so Trust Services Criteria apply narrowly — mostly Security, partially Availability. This outline is what a Pro/Enterprise customer procurement team will ask for *before* we're SOC 2 certified, and what we'll hand the auditor when we pursue certification.

## Trust Services Criteria mapping

| TSC | In scope | Evidence artefact |
|---|---|---|
| **CC1 Control Environment** | Y | `GOVERNANCE.md`, code-of-conduct, org chart |
| **CC2 Communication** | Y | `SECURITY.md` disclosure policy, CHANGELOG |
| **CC3 Risk Assessment** | Y | `THREAT-MODEL.md`, annual review minutes |
| **CC4 Monitoring** | Y | CI logs, dependabot, audit tool runs |
| **CC5 Control Activities** | Y | Branch protection, required reviews, signed tags |
| **CC6 Logical Access** | Y | GitHub 2FA enforced, npm 2FA enforced, token rotation log |
| **CC7 System Operations** | Y | Incident runbook, post-mortem template |
| **CC8 Change Management** | Y | PR template, release checklist, semver policy |
| **CC9 Risk Mitigation** | Y | Pen-test attestation, CVE embargo process |
| **A1 Availability** | Partial | Uptime report for tekivex.dev (Render) |
| **C1 Confidentiality** | N/A | No customer data processed |
| **P1 Privacy** | N/A | No PII collected |

## Evidence artefacts required

### Organization
- [ ] `GOVERNANCE.md` — who decides what, how
- [ ] `SECURITY.md` — disclosure policy, contact, embargo window
- [ ] `CODE_OF_CONDUCT.md` (exists)
- [ ] Org chart — maintainer list with roles
- [ ] Vendor inventory — npm, GitHub, Render, Cloudflare, email

### Risk
- [ ] `THREAT-MODEL.md` (exists — tekivex-ui runtime threats)
- [ ] `SUPPLY-CHAIN-THREAT-MODEL.md` — npm/GitHub/CDN attacks
- [ ] Annual risk review — dated meeting notes

### Access control
- [ ] GitHub org 2FA enforcement screenshot + policy doc
- [ ] npm org 2FA enforcement screenshot
- [ ] Access review log — quarterly who-has-what audit
- [ ] Token rotation schedule (CI tokens every 90 days)
- [ ] Offboarding checklist

### Change management
- [ ] PR template (required sections: threat impact, test plan)
- [ ] Branch protection settings export (main: required reviews, required checks, no force push)
- [ ] Release checklist — includes audit CLI run, changelog, tag signing
- [ ] Signed git tags policy
- [ ] Semver policy document

### Development
- [ ] CI configuration — lint, type-check, test, build, audit
- [ ] Dependabot / Renovate configuration
- [ ] `npm audit` + `@tekivex/audit` in CI
- [ ] SAST: CodeQL config
- [ ] Secret scanning — GitHub native + gitleaks

### Incident response
- [ ] Runbook: CVE report intake → triage → fix → embargo → disclosure
- [ ] Communication plan: advisory template, affected-users notification
- [ ] Post-mortem template
- [ ] Historical incident log (can be empty + reviewed quarterly)

### Third-party assurance
- [ ] Pen-test attestation letter (see `06-pentest-rfp.md`)
- [ ] SBOM — `syft` output per release, published alongside dist tarball
- [ ] Signed build artefacts (sigstore / npm provenance)

### Availability (tekivex.dev only)
- [ ] Uptime monitoring export (UptimeRobot / BetterStack)
- [ ] Render deploy logs retention policy
- [ ] Backup / restore procedure for the static site

## Timeline to readiness

| Month | Milestone |
|---|---|
| 1 | Populate all `docs/` artefacts above, enforce 2FA everywhere |
| 2 | Pen-test engagement begins |
| 3 | Pen-test report + remediation |
| 4 | Pick auditor, sign engagement letter |
| 5–7 | Type I audit (point-in-time) |
| 8–13 | Evidence collection for Type II observation window |
| 14 | Type II report issued |

## Deliverable for procurement teams (pre-certification)

A single `tekivex-trust-center.pdf` that says:

> We are not SOC 2 Type II certified yet (target: 14 months out). In the meantime, here is every artefact a Type II auditor would ask for:
> - Threat model, reviewed quarterly
> - Pen-test attestation by [vendor], [date]
> - SBOM for every release since v2.0
> - 2FA enforced across GitHub + npm orgs
> - Branch protection, signed tags, required reviews on main
> - Incident runbook and disclosure policy
> - CI/CD configuration, dependency scanning, secret scanning
>
> All artefacts linked below. Ask us anything we missed.

This buys most enterprise deals without waiting for the certification itself.
