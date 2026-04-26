# Release checklist

For every publish of `tekivex-ui`, `@tekivex/security-core`, `@tekivex/audit`, or `create-tekivex-app`. Paste into the release PR and tick through.

## Pre-flight

- [ ] Working tree clean: `git status`
- [ ] On `main`, up to date: `git fetch && git status -sb`
- [ ] CHANGELOG.md entry exists and is accurate
- [ ] Version bump is correct per semver (reviewer confirms)
- [ ] README / docs reference the new version if relevant

## Quality gates

- [ ] `npm run typecheck`
- [ ] `npm run lint`
- [ ] `npm test` — 100% pass, no `.skip`
- [ ] `npm run build` — clean, no warnings
- [ ] `npm run a11y:audit` — 0 errors
- [ ] `npm run security:audit` — 0 errors
- [ ] `npx @tekivex/audit .` on the demo — 0 errors (warnings reviewed)
- [ ] `npm pack --dry-run` — size within expected range, no stray files
- [ ] `npm audit --production` — 0 high/critical

## Security

- [ ] No new dependencies added, OR new deps reviewed (purpose, license, last-publish date, maintainer reputation)
- [ ] No new `dangerouslySetInnerHTML` without sanitization
- [ ] No new `eval` / `new Function`
- [ ] No hardcoded secrets (git-grep before tagging)
- [ ] If public API changed: threat model section updated

## Accessibility

- [ ] Any new interactive component has: keyboard nav, ARIA role/state, focus management, screen-reader label
- [ ] Any new color has contrast ≥ AA in both themes (`createTheme` warnings clean)
- [ ] Storybook a11y addon clean on any new stories

## Release

- [ ] Tag created and signed: `git tag -s vX.Y.Z -m "..."`
- [ ] `npm publish --provenance --access public`
- [ ] Verify: `npm view tekivex-ui dist-tags`
- [ ] Smoke install: `npx create-tekivex-app@latest /tmp/smoke && cd /tmp/smoke && npm run build`
- [ ] GitHub release created with CHANGELOG excerpt
- [ ] Docs deployed: `tekivex.dev` serves new version header

## Post-release

- [ ] Tweet / social post for minor+ releases
- [ ] Close milestone on GitHub
- [ ] Open milestone for next version
- [ ] Update `roadmap/` if scope shifted

## If anything goes wrong

- **Bad version published** → `npm deprecate tekivex-ui@X.Y.Z "..."`, publish patch, do not unpublish (breaks consumers' lockfiles)
- **Tag pushed but publish failed** → delete tag, fix, re-tag with same version
- **Secret committed by accident** → rotate immediately (see incident-response.md), force-push only if unreleased
