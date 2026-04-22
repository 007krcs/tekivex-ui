# @tekivex/audit

> CLI that scans React projects for security + accessibility regressions.

```bash
npx @tekivex/audit .
# or, if installed globally
tekivex audit . --format md --out audit.md
```

15 built-in checks covering OWASP XSS, CWE-95/-79/-798, reverse tabnabbing, CSP presence, and WCAG 1.1.1 / 2.1.1 / 2.4.3 / 2.4.4 / 3.3.2 / 4.1.2 violations.

## Why another linter?

- **eslint-plugin-jsx-a11y** checks syntax, not attack classes. It won't flag a missing CSP header, hardcoded API keys, or auth tokens in localStorage.
- **Snyk / Dependabot** check dependency CVEs, not your code.
- **tekivex-audit** focuses on the _gap between them_: static checks for real attack surface in first-party code, mapped to OWASP / CWE references so you can defend them in review.

## Exit codes

- `0` — clean, or only warnings (depending on `--fail-on`)
- `1` — errors found

## Integrate with CI

```yaml
# .github/workflows/audit.yml
- run: npx @tekivex/audit . --fail-on warn --format md --out audit.md
- uses: actions/upload-artifact@v4
  with: { name: audit-report, path: audit.md }
```

## License

MIT
