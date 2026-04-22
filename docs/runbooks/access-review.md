# Quarterly access review

Run on the first Monday of each quarter. Takes ~20 minutes. Output: a dated markdown note under `docs/access-reviews/YYYY-QN.md` (git-committed).

## Scope

| Surface | What to check |
|---|---|
| GitHub org `tekivex` | Owners, members, 2FA compliance, outside collaborators, personal access tokens |
| npm org `@tekivex` | Owners, developers, 2FA enforcement, access tokens, automation tokens |
| Render workspace | Team members, deploy hooks, environment variables |
| Cloudflare account | Users, API tokens |
| Domain registrar | Account MFA, transfer lock, privacy |
| Password manager | Shared vault membership, entry-level permissions |
| `security@` inbox | Forwarding rules, authorized readers |

## Per-surface checklist

### GitHub
- [ ] List all org members: `gh api orgs/tekivex/members --jq '.[].login'`
- [ ] Confirm all members have 2FA: `gh api orgs/tekivex/members?filter=2fa_disabled --jq '.[].login'` → must be empty
- [ ] List outside collaborators per repo: remove any no longer active
- [ ] Review branch protection on `main`: required reviews ≥ 1, required status checks on, no force push, signed commits required
- [ ] List PATs under Settings → Developer settings → revoke unused

### npm
- [ ] `npm team ls @tekivex:developers`
- [ ] 2FA enforcement is on (org setting): confirm in UI
- [ ] List automation tokens: revoke unused, rotate any > 90 days old
- [ ] Confirm CI uses scoped automation token, not a personal one

### Render / Cloudflare
- [ ] Team members list — remove anyone no longer active
- [ ] API tokens: rotate any > 90 days
- [ ] Deploy hooks: confirm in use, rotate URL if suspect

## Red flags

- Any member without 2FA → remove from org, notify, re-invite after 2FA
- Any PAT / automation token with no audit trail of last use → revoke
- Any shared password for shared accounts → migrate to per-user SSO

## Output template

```markdown
# Access review — YYYY QN

**Date:** YYYY-MM-DD  
**Reviewer:** @handle

## Findings
- Removed X from GitHub org (no longer active)
- Rotated npm automation token `tkx-ci-*` (90 days old)
- ...

## Still open
- [ ] ...

## Confirmed healthy
- GitHub org: N members, all with 2FA
- npm org: N developers, 2FA enforced
- ...
```
