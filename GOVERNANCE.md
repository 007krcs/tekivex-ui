# Governance

tekivex-ui is an open-source project maintained under benevolent-dictator-for-now governance with a documented path to formalized maintainer council as the community grows.

## Roles

### Founder / BDFN
- **007krcs** — final decision on architecture, releases, security advisories, and licensing. Has admin on GitHub org and owner on npm org.

### Maintainers
- Hold write access to the primary repo
- Required to review PRs outside their own work
- Enforce the code of conduct
- Required 2FA on GitHub + npm (no exceptions)

### Contributors
- Anyone who has opened a merged PR
- Granted issue-triage permissions after 3 merged PRs
- Invited to maintainer status after 10 merged PRs + 6 months of sustained participation

### Security responders
- Subset of maintainers who opt in to the security@ inbox rotation
- Minimum of 2 at any time (no single point of failure)

## Decision-making

### Day-to-day (bugs, doc fixes, incremental features)
- Any maintainer may merge their own or another's PR after 1 approving review from a different maintainer
- For cosmetic / doc-only changes: 1 approval from founder OR any 2 maintainers

### Architectural changes (new public API, breaking changes, dependency additions)
- Requires an RFC (markdown file in `docs/rfcs/NNNN-title.md`)
- 7-day comment window
- Merge requires founder approval + 1 maintainer approval
- Recorded in CHANGELOG under a dedicated RFC link

### Security disclosures
- Security responders triage via private process (see `SECURITY.md`)
- Fix reviewed by founder + 1 security responder before release
- Advisory drafted collaboratively, published via GitHub Security Advisories

## Release cadence

- **Patch releases** — as needed, same day for security
- **Minor releases** — roughly monthly, gated on changelog + passing CI + `npm run security:audit` + `npm run a11y:audit` + pen-test attestation status
- **Major releases** — gated on an RFC, migration guide, and `create-tekivex-app` template parity

## Conflict resolution

1. Technical dispute → RFC thread, founder decides if unresolved after 7 days
2. Interpersonal dispute → escalate to code-of-conduct handler; if that's the party involved, escalate to any other maintainer
3. Licensing / IP dispute → founder + legal counsel; community notified within 30 days

## Succession

If the founder is unavailable for 30 consecutive days without notice:
- Maintainer council (all active maintainers in the last 90 days) elects an interim lead
- Interim lead has founder-equivalent authority for 90 days
- Founder re-appears → original structure resumes
- Founder absent at 120 days → council formalizes successor

## Transparency

- All governance changes go through PR against this file
- Quarterly state-of-the-project posts: metrics, roadmap, blockers
- Annual retrospective published to the repo

## Amendments

Amendments to this document require:
- PR against `GOVERNANCE.md`
- 14-day comment window (longer than normal RFC)
- Founder approval + 2 maintainer approvals
- Announced in the next release changelog
