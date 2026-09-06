# {{APP_NAME}}

Scaffolded with `create-tekivex-app --template secure`.

## What's pre-wired

| Defense | Where |
|---|---|
| Content-Security-Policy (strict + `frame-ancestors 'none'`) | `index.html` meta tag |
| X-Content-Type-Options: nosniff | `index.html` meta tag |
| Referrer-Policy: strict-origin-when-cross-origin | `index.html` meta tag |
| Trusted Types policy | `src/main.tsx` — `installTrustedTypes()` |
| Clickjacking defense (prod only) | `src/main.tsx` — `installFrameBuster()` |
| Live SecurityCore demos | `src/App.tsx` |

## Develop

```bash
npm run dev
```

## Production hardening checklist

- [ ] Move CSP from meta tag to HTTP header on your server/CDN
- [ ] Use a server-generated `nonce` with `buildTkxCSP({ nonce })` for strict CSP
- [ ] Add `Strict-Transport-Security` header
- [ ] Review [tekivex-ui threat model](https://www.tekivex.com/ui/#/security)
- [ ] Run `npx tekivex audit` before every release
