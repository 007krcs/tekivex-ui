# Incident response runbook

For CVE reports, supply-chain compromises, and availability incidents in `@tekivex/*` packages or `tekivex.dev`.

## Severity matrix

| Level | Example | First response | Patch target |
|---|---|---|---|
| **P0** | RCE or XSS in shipped code, compromised npm token | 1 hour | Same day |
| **P1** | Auth bypass, secret leak, CSP bypass in template | 4 hours | 3 days |
| **P2** | Accessibility regression, non-exploitable bug | 1 business day | Next minor |
| **P3** | Cosmetic, docs | 3 business days | Next minor |

## Intake

1. Report arrives via `security@tekivex.com` or GitHub Security Advisory
2. **On-call responder** acknowledges within SLA (see `SECURITY.md`)
3. Open a **private fork** or draft advisory — do not commit to public main
4. Create an internal tracking issue in a private repo or encrypted notes; include:
   - Reporter name + preferred credit
   - Affected package + version range
   - Initial severity guess
   - Embargo deadline
   - Assigned responder

## Triage (within 48h)

- [ ] Reproduce independently
- [ ] Confirm severity
- [ ] Assign CVE ID (GitHub → MITRE path)
- [ ] Identify affected version range (what's the earliest vulnerable tag?)
- [ ] Identify fix approach — 3 options, rank by blast radius

## Fix

- [ ] Branch from latest release tag (not main) — `hotfix/CVE-YYYY-NNNN`
- [ ] Minimum viable patch (don't bundle unrelated changes)
- [ ] Regression test that **fails before the fix, passes after**
- [ ] `@tekivex/audit` rule added if the class of bug is catchable statically
- [ ] Review: founder + 1 security responder, not the patch author
- [ ] CHANGELOG entry under `### Security` (placeholder until public)

## Pre-disclosure (for P0/P1)

- [ ] Notify Pro customers via private channel (embargo list)
- [ ] Notify Enterprise customers per contract
- [ ] Prep public advisory draft
- [ ] Prep blog post if externally interesting
- [ ] Rotate any potentially-leaked secrets (npm tokens, signing keys)

## Release

1. Tag from hotfix branch, signed (`git tag -s`)
2. `npm publish` with `--provenance` flag
3. Verify install: `npm i tekivex-ui@<new>` in a scratch repo, confirm fix
4. Publish GitHub Security Advisory
5. Publish CVE via MITRE if not already
6. Public changelog entry with advisory link
7. Social post (X, HN if severe)

## Post-mortem (within 14 days)

Published to `docs/post-mortems/YYYY-MM-DD-short-name.md`. Must include:

1. **Timeline** — report to resolution, hour by hour
2. **Root cause** — technical and process
3. **Impact** — who was affected, how (worst-case assumption if unknown)
4. **Detection** — how it came in, how it could have been caught earlier
5. **Remediation** — what's been fixed
6. **Prevention** — what we changed so the class of bug can't recur
7. **Action items** — with owners and due dates, tracked to completion

## Supply-chain compromise specifics

If npm token / GitHub token / signing key is compromised:
1. **Revoke first, investigate second** — stop the bleeding
2. Check the npm registry for unauthorized publishes (all packages, not just the flagged one)
3. If a bad version shipped: `npm deprecate` with warning, publish clean patch, open advisory
4. Rotate ALL tokens, not just the known-bad one
5. Re-enable with hardware 2FA requirement if not already
6. Post-mortem mandatory, public within 14 days

## Availability incidents (tekivex.dev only)

Render outage or DNS failure:
1. Check Render status page + Cloudflare status
2. If ours: identify last deploy, roll back via Render UI
3. Update status at `status.tekivex.dev` (or pinned GitHub issue)
4. Post-mortem if > 30 min downtime

## Owner roster

Security responders on rotation (must always be ≥ 2):
- 007krcs (primary)
- _TBD — second responder needed before Pro launch_

Contact shortcuts in password manager under `tekivex-incident-response`.
