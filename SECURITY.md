# Security policy

We take security seriously. tekivex-ui ships a dedicated security kernel (`@tekivex/security-core`) and an audit CLI (`@tekivex/audit`); we hold our own code to the same bar.

## Supported versions

| Version   | Supported          |
| --------- | ------------------ |
| 2.6.x     | ✅ active           |
| 2.5.x     | ✅ security fixes   |
| ≤ 2.4.x   | ❌ upgrade required |

Pro-tier customers: see SLA terms in your contract.

## Reporting a vulnerability

**Do not open a public GitHub issue.** Disclose privately:

- **Email:** `novaai0401@gmail.com` (PGP key: [link when live])
- **GitHub Security Advisories:** <https://github.com/007krcs/tekivex-ui/security/advisories/new>

The same channels are advertised machine-readably per [RFC 9116](https://www.rfc-editor.org/rfc/rfc9116):

- **security.txt:** <https://www.tekivex.com/ui/.well-known/security.txt>
- **CycloneDX SBOM (1.5):** <https://www.tekivex.com/ui/security/sbom.json>

Regenerate the SBOM locally with `npm run sbom:generate`.

Include:
- Affected package and version (`tekivex-ui@2.6.0`, `@tekivex/security-core@0.1.0`, etc.)
- Proof-of-concept or reproduction steps
- Your assessment of impact
- Whether you want credit in the advisory

## Response SLA

| Audience | First response | Triage decision | Patch target |
|---|---|---|---|
| Public disclosure (community) | 3 business days | 7 business days | Next minor release |
| Pro customers | 24 hours (business days) | 48 hours | Patch release, embargoed |
| Enterprise customers | Per contract (typically 4h) | Per contract | Private hotfix branch |

## Embargo process

1. Acknowledge receipt within the SLA window
2. Assign a CVE ID via [GitHub / MITRE]
3. Build + verify fix on a private branch
4. Notify Pro + Enterprise customers with advisory (embargo window: 30 days default, extendable by reporter request)
5. Public release + advisory + credit
6. Post-mortem published to the repo within 14 days of disclosure

## What's in scope

- `tekivex-ui` — all exports
- `@tekivex/security-core` — all exports
- `@tekivex/audit` — check accuracy, CLI safety
- `create-tekivex-app` — scaffolded-output safety
- `tekivex.dev` — hosted docs site

## What's out of scope

- Attacks requiring physical access to the victim's device
- Social engineering of maintainers
- Third-party dependencies (report to the upstream project; we'll update our lockfile)
- npm registry compromises (report to npm, we'll rotate our tokens)

## Safe harbor

Good-faith security research against the scopes above is explicitly permitted. We will not pursue legal action for:
- Reasonable vulnerability testing against the packages above
- Disclosing findings privately through the channels above
- Abiding by the embargo window while we ship a fix

This policy is modelled on [disclose.io](https://disclose.io/).

## Hall of fame

Researchers who report valid vulnerabilities will be credited in the advisory and listed below (with permission).

_No entries yet — first reporter gets the top line forever._
