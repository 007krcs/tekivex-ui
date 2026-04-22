# @tekivex/security-core

> **The security kernel extracted from [tekivex-ui](https://ui.tekivex.com).** Framework-agnostic. Zero runtime dependencies. Pure TypeScript.

[![npm](https://img.shields.io/npm/v/@tekivex/security-core.svg)](https://npmjs.com/package/@tekivex/security-core)
[![MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![types](https://img.shields.io/npm/types/@tekivex/security-core.svg)](https://npmjs.com/package/@tekivex/security-core)

If you ship web code, you defend against XSS, CSP gaps, DOM clobbering, Unicode Trojan Source, clickjacking, prototype pollution, MIME confusion, PII leakage, and rate-limit abuse. **`@tekivex/security-core` gives you one small, audited module to do all of that.**

```bash
npm i @tekivex/security-core
```

Works with React, Vue, Svelte, Solid, vanilla TS, Node, Deno, Bun, Cloudflare Workers.

---

## Quick start

```ts
import {
  sanitizeHref,
  sanitizeHTML,
  sanitizeUnicode,
  scrubPII,
  buildTkxCSP,
  createRateLimiter,
  isFramed,
  installFrameBuster,
  deepFreeze,
} from '@tekivex/security-core';

// Block dangerous URL schemes
sanitizeHref('javascript:alert(1)');   // → null
sanitizeHref('https://example.com');   // → 'https://example.com'

// Neutralise Unicode Trojan Source (CVE-2021-42574)
sanitizeUnicode('admin\u202E\u2066 evil');  // → 'admin evil'

// Redact PII before logging
scrubPII('call 415-555-0100 or email a@b.com');
// → 'call [PHONE] or email [EMAIL]'

// Build a Content-Security-Policy header
buildTkxCSP({ nonce: 'r4nd0m', strict: true });
// → "default-src 'self'; frame-ancestors 'none'; ..."

// Token-bucket rate limiter
const limiter = createRateLimiter(3, 2000); // 3 per 2s
if (limiter.take('form-submit')) { /* allowed */ }

// Clickjacking defense
if (isFramed()) { /* we're in an iframe — react accordingly */ }
installFrameBuster(() => location.href = '/security-notice');

// Prototype pollution prevention
const config = deepFreeze({ api: { key: '...' } });
```

## What it defends against

Each export maps to a specific attack class. Full threat model is published at
[SECURITY-THREAT-MODEL.md](./THREAT-MODEL.md).

| Function | Defeats | Reference |
|---|---|---|
| `sanitizeHref` | XSS via `javascript:` / `data:` / `vbscript:` URLs | OWASP XSS Prevention |
| `sanitizeHTML` | HTML injection, stored XSS | OWASP XSS |
| `sanitizeCSS` | CSS expression() / url(javascript:) | CWE-79 |
| `sanitizeJSON` | Prototype pollution via `__proto__` / `constructor` | CWE-1321 |
| `sanitizeUnicode` | Bidi-override Trojan Source | **CVE-2021-42574** |
| `isSafeAttrName` | DOM clobbering via `name="cookie"` etc. | CWE-79 |
| `buildTkxCSP` | Framing, inline-script XSS, mixed content | CSP Level 3 |
| `installTrustedTypes` | DOM XSS via sink bypass | W3C Trusted Types |
| `isFramed`, `installFrameBuster` | Clickjacking | OWASP Clickjacking |
| `createRateLimiter` | Brute force, credential stuffing | CWE-307 |
| `sniffMimeType` | MIME-type confusion | OWASP File Upload |
| `scrubPII` | Accidental PII in logs / errors | GDPR / CCPA |
| `deepFreeze` | Prototype pollution, config tampering | CWE-1321 |
| `audit` + `verifyAuditIntegrity` | Tamper-evident security log | NIST SP 800-92 |

## Zero dependencies

`@tekivex/security-core` does not import anything. Not even a polyfill. This is deliberate:

- Every `npm install` of your app installs exactly one new file
- No transitive-dependency supply-chain risk (xz backdoor, colors.js, etc.)
- Runs anywhere ES2020 runs — browser, Node, Workers, Deno, Bun, React Native

## Bundle impact

```
index.js   ~7 KB min
index.cjs  ~7 KB min
         0 runtime deps
```

## License

MIT © tekivex-ui contributors
