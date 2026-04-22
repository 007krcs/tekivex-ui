<!-- PR template — delete sections that don't apply, but think about all of them. -->

## Summary

<!-- 1–2 sentences: what this changes and why. -->

## Type
- [ ] Bug fix (non-breaking)
- [ ] Feature (non-breaking)
- [ ] Breaking change
- [ ] Docs / tooling only
- [ ] Security (coordinate via `security@` first — do NOT describe the vulnerability here until patched)

## Test plan
<!-- Reproducible steps the reviewer can run. "Ran existing tests" is not enough for new behavior. -->
- [ ] `npm run typecheck`
- [ ] `npm run lint`
- [ ] `npm test`
- [ ] Manual verification: …

## Security impact
<!-- Does this change touch: URL handling, HTML rendering, auth, storage, external requests, CSP?
     If yes, list the attack class(es) considered and how this PR doesn't open them. -->

## Accessibility impact
<!-- Does this change add an interactive element, color, or focus behavior? If yes:
     keyboard reachable? focus visible? ARIA role/state correct? SR label? contrast AA+? -->

## Breaking changes
<!-- Public API removed or renamed? Migration path documented? Codemod available? -->

## Screenshots / recordings
<!-- For visual changes. Paste before/after. -->

## Checklist
- [ ] CHANGELOG.md updated (under `Unreleased`)
- [ ] Docs updated if public API changed
- [ ] Added or updated tests
- [ ] Existing tests still pass
- [ ] No new dependencies without review
