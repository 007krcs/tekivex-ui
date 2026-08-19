# TekiVex UI — Security Threat Model

**Version:** v3.0.3
**Last updated:** 2026-04-27
**Audience:** Security engineers, enterprise architects, procurement teams, auditors.

---

## TL;DR

TekiVex UI is the first mainstream React component library to ship a **first-class security kernel (`SecurityCore`)** as part of its public API. Every component that accepts user-controlled strings, URLs, HTML, or files routes that input through `SecurityCore` by default. This document explains which threats are in scope, how each is defended against, and what is **not** covered (so you know what to compensate for at the application layer).

No other major React UI library (MUI, Ant Design, Chakra, Mantine, Radix, HeroUI, shadcn/ui) ships equivalent defenses as part of its component contract. If you are building a product where a component vulnerability becomes a CVE against *your* brand, this is the wedge.

---

## Threats in scope

| # | Threat | Category | OWASP / CWE | Defense |
|---|---|---|---|---|
| T1 | Reflected / stored XSS via component props | Injection | OWASP A03, CWE-79 | React text escaping + `sanitizeString` (control chars), `sanitizeHTML` (allow-list DOMParser), `escapeHTML` for HTML sinks |
| T2 | `javascript:` / `vbscript:` / `data:text/html` URL injection | Injection | CWE-601, CWE-79 | `sanitizeHref` allow-list |
| T3 | CSS-based injection (`expression()`, `url(javascript:)`, `@import`, `-moz-binding`) | Injection | CWE-79 | `sanitizeCSS` |
| T4 | Prototype pollution via `JSON.parse` | Injection | CWE-1321 | `sanitizeJSON` with `__proto__` / `constructor` / `prototype` reviver scrub |
| T5 | DOM clobbering via user-controlled `name`/`id` | Injection | CWE-913 | `isSafeAttrName` blocklist (form/document property names) |
| T6 | Trojan Source / homograph attacks (zero-width + bidi-override Unicode) | Deception | CVE-2021-42574 | `sanitizeUnicode` strips U+200B–U+200F, U+202A–U+202E, U+2060–U+206F, U+FEFF, U+00AD |
| T7 | Clickjacking (component embedded in hostile iframe) | UI Redress | CWE-1021 | `isFramed()` detection + `tkx:framed-*` events + CSP `frame-ancestors 'none'` |
| T8 | File upload smuggling (content-type spoofing) | Injection | CWE-434 | `sniffMimeType` magic-byte detection |
| T9 | Path traversal in uploaded filenames | Injection | CWE-22 | TkxFileUpload regex guard on `../`, `..\`, control chars |
| T10 | Client-side DoS via unbounded user actions | DoS | CWE-400 | `createRateLimiter` token-bucket |
| T11 | PII leakage to third-party services (LLMs, analytics) | Data Exposure | GDPR Art. 32 | `scrubPII` (SSN, CC, email, phone, API keys) |
| T12 | Missing / weak CSP | Misconfig | CWE-16 | `buildTkxCSP` opinionated strict builder |
| T13 | `innerHTML` assignment bypassing sanitization | Injection | CWE-79 | `installTrustedTypes` registers a "tkx" Trusted Types policy |
| T14 | Stale / tampered client config | Integrity | CWE-1104 | `deepFreeze` |
| T15 | Source-code theft / IP leakage via npm tarball | IP | — | No `src/` in tarball, terser toplevel+property mangle, no sourcemaps, no d.ts comments, anonymous chunk filenames |

---

## Threats explicitly **out of scope**

Honest scope matters. These are the application layer's responsibility — TekiVex does not solve them:

- **Server-side SSRF, SQL injection, auth bypass** — server problems, not UI problems
- **Supply-chain compromise of `tekivex-ui` itself** — mitigated by our build discipline, but you should still pin versions + use `npm audit` / Snyk / Socket
- **CSRF token generation** — your backend's job; TekiVex forms don't inject tokens
- **Secrets management** — never put secrets in component props; that's your bundler's problem
- **Cookie security (HttpOnly, SameSite, Secure flags)** — server-set headers
- **DDoS against your origin** — use Cloudflare/Fastly; our rate limiter is client-side only
- **Browser-level memory attacks (Spectre, Meltdown)** — out of any lib's scope

If you need a defense for one of the above, reach for a purpose-built tool. We don't pretend.

---

## Defense catalogue

### `SecurityCore` — the public surface

Every defense below is exported from `tekivex-ui` and reachable via `import { SecurityCore } from 'tekivex-ui'`. The aggregate is `Object.freeze`d; individual tree-shake-friendly named exports exist too.

```ts
import {
  sanitizeString, sanitizeHref, sanitizeHTML, sanitizeCSS, sanitizeJSON,
  sanitizeUnicode, isSafeAttrName, buildTkxCSP, installTrustedTypes,
  isFramed, installFrameBuster, createRateLimiter, sniffMimeType,
  scrubPII, deepFreeze, SecurityCore,
} from 'tekivex-ui';
```

### Per-threat detail

#### T1 — XSS (Cross-Site Scripting)

**Attack:** `<TkxInput label="<script>alert(1)</script>" />` → script executes.

**Defense:** Text props never reach an HTML parser. They are rendered as React
text children/attributes, which React escapes on output (client and server
renderers alike) — a `<script>` string becomes an inert text node, never an
element. `sanitizeString` runs on every such prop to strip NUL and C0 control
characters, which can smuggle payloads past naïve downstream filters.

> **v4.0.0 correction.** Before v4, `sanitizeString` *also* HTML-entity-escaped
> `< > & ' " \``. Because React escapes independently, that was a second pass:
> it produced visible `&amp;` / `&quot;` in the UI ("Review & ATS" rendering as
> "Review &amp; ATS") and corrupted form values on their way to consumer
> servers. It added no protection React was not already providing. Escaping now
> lives in the explicit `escapeHTML()`, for actual HTML sinks only.

Rich-HTML props (TkxMarkdown, TkxRichTextDisplay) go through `sanitizeHTML`, which:
1. Parses through `DOMParser`
2. Walks the tree, dropping any tag not on the allow-list (47 safe tags)
3. Strips every `on*` event handler attribute
4. Re-validates every `href`/`src` through `sanitizeHref`
5. Blocks DOM-clobbering `name`/`id` values via `isSafeAttrName`

**Coverage:** All 80+ components. String props and children sanitized at render time. `dangerouslySetInnerHTML` is never used inside TekiVex components.

#### T2 — Dangerous URL schemes

**Attack:** `<TkxButton href="javascript:alert(document.cookie)">X</TkxButton>`.

**Defense:** `sanitizeHref` runs a strict allow-list:
- Accepts: `http:`, `https:`, `mailto:`, `tel:`, `#fragment`, `/relative`, `./relative`
- Rejects: `javascript:`, `vbscript:`, `data:` (except `data:image/*`), `file:`
- Strips control characters (U+0000–U+001F, U+007F)
- Case-insensitive match (blocks `JAVASCRIPT:` too)

Components with URL props: TkxButton (`href`), TkxAvatar (`src`), TkxImage (`src`), TkxVideoPlayer (`src`), TkxOrgChart (avatar URLs), TkxMarkdown (all anchor hrefs).

#### T3 — CSS injection

**Attack:** `style="background: url(javascript:alert(1))"` or `behavior: url(xss.htc)`.

**Defense:** `sanitizeCSS` strips:
- `expression(...)` (legacy IE XSS vector)
- `url(javascript:...)`, `url(vbscript:...)`, `url(data:...)`
- `@import` rules
- `behavior:` (IE)
- `-moz-binding:` (Firefox legacy XBL)
- `<` and `>` characters (HTML-escape prevention)
- Control characters

Used internally by any component accepting user-controllable style fragments (TkxTheme customization entry points).

#### T4 — Prototype pollution

**Attack:** `JSON.parse('{"__proto__": {"isAdmin": true}}')` → pollutes `Object.prototype`.

**Defense:** `sanitizeJSON`:
1. Uses `JSON.parse` reviver to reject `__proto__`, `constructor`, `prototype` keys
2. Recursively scrubs the parsed object tree for the same keys (catches nested pollution)
3. Returns `null` on malformed input (never throws silently)

```ts
sanitizeJSON<{ x: number }>('{"__proto__":{"x":1}}')
// => null-prototyped object with __proto__ removed
```

#### T5 — DOM clobbering

**Attack:** User-controlled `<input name="submit">` inside a form clobbers `form.submit()` → app breaks or is exploited.

**Defense:** `isSafeAttrName` rejects any name that:
- Collides with `HTMLFormElement` properties: `submit`, `reset`, `action`, `method`, `enctype`, `target`, `elements`
- Collides with `HTMLDocument` properties: `cookie`, `domain`, `location`, `body`, `head`, `title`, `documentElement`
- Collides with traversal properties: `children`, `firstChild`, `nextSibling`, `parentNode`, `ownerDocument`
- Contains `__proto__`, `constructor`, `prototype`
- Contains control characters, `<`, `>`, `"`

Used inside `sanitizeHTML` for attribute filtering and available for form-building code.

#### T6 — Trojan Source

**Attack:** Hidden bidi-override character in a username (`"admin\u202Eexploit"`) flips rendering to hide malicious content from reviewers (CVE-2021-42574).

**Defense:** `sanitizeUnicode` strips all 32 characters in the dangerous set:
- U+200B–U+200F (zero-width space, joiner, non-joiner, LRM, RLM)
- U+202A–U+202E (LRE, RLE, PDF, LRO, RLO — bidi overrides)
- U+2060–U+206F (word joiner, invisible separators, deprecated formatting)
- U+FEFF (byte-order mark / zero-width no-break space)
- U+00AD (soft hyphen)

TkxInput applies this by default (`unicodeSafe={true}`). Opt-out explicitly for translation / i18n editing UIs.

#### T7 — Clickjacking

**Attack:** Your app is iframed by `evil.com` with 0% opacity; victim thinks they're clicking "Like" but actually clicks "Transfer funds" in your app.

**Defense:** Three layers:
1. **Detection:** `isFramed()` returns `true` if `window.top !== window.self` (or cross-origin access throws)
2. **Component-level:** TkxModal and TkxDrawer dispatch `tkx:framed-modal` / `tkx:framed-drawer` CustomEvents when opened inside a hostile frame. Consumers subscribe and can refuse interactions.
3. **Navigation-level:** `installFrameBuster(onDetect?)` breaks out of the frame (or invokes your callback for a softer handling)
4. **Network-level:** `buildTkxCSP()` emits `frame-ancestors 'none'` — the modern, authoritative clickjacking defense (supersedes `X-Frame-Options`)

#### T8 — File upload content-type spoofing

**Attack:** Attacker renames `evil.exe` → `photo.png`, uploads via your file picker. Your backend trusts `file.type = "image/png"`.

**Defense:** `sniffMimeType(file)` reads the first 12 bytes and matches against magic-byte signatures:

| Bytes | Type |
|---|---|
| `89 50 4E 47` | `image/png` |
| `FF D8 FF` | `image/jpeg` |
| `47 49 46 38` | `image/gif` |
| `42 4D` | `image/bmp` |
| `52 49 46 46 … 57 45 42 50` | `image/webp` |
| `25 50 44 46` | `application/pdf` |
| `50 4B 03 04` | `application/zip` |
| `7B` or `5B` | `application/json` |

TkxFileUpload runs this check after every file drop. Claimed-vs-actual mismatch raises `mime-mismatch` error.

#### T9 — Path traversal

**Attack:** Filename `../../../etc/passwd` uploaded; naive server concatenates into a filesystem path.

**Defense:** TkxFileUpload rejects filenames matching `/[\u0000-\u001F\u007F]|\.\.\/|\.\.\\/`. Component-side first line of defense; **you still must sanitize on the server** (this is out of scope for a browser library, flagged for clarity).

#### T10 — Client-side DoS

**Attack:** User clicks "Submit" 1000 times/sec via devtools; your optimistic UI melts.

**Defense:** `createRateLimiter(n, intervalMs)` returns a token-bucket limiter:

```ts
const rl = createRateLimiter(5, 1000);  // 5 actions/sec
if (rl.check()) submit();
```

#### T11 — PII leakage to third parties

**Attack:** User types their SSN into a chat component that sends transcripts to an LLM provider.

**Defense:** `scrubPII(text)` redacts:
- SSN: `123-45-6789` → `[redacted-ssn]`
- Credit card: 13–19 digit sequences → `[redacted-card]`
- Email addresses → `[redacted-email]`
- Phone numbers (with/without country code) → `[redacted-phone]`
- API keys matching `sk-*`, `pk-*`, `rk-*` patterns → `[redacted-key]`

Use before forwarding user-typed data to any third-party endpoint. Not a GDPR compliance substitute, but a compliance-assistance tool.

#### T12 — Content Security Policy

**Attack:** Missing or weak CSP lets a single XSS hole turn into account takeover.

**Defense:** `buildTkxCSP(opts)` emits a strict, TekiVex-compatible CSP header value:

```
default-src 'self';
script-src 'self' 'nonce-...';
style-src 'self' 'unsafe-inline';
img-src 'self' data: https:;
font-src 'self' https: data:;
connect-src 'self';
frame-ancestors 'none';
form-action 'self';
base-uri 'self';
object-src 'none';
upgrade-insecure-requests;
```

Options for nonce, report-uri, report-only mode, and additional hosts.

#### T13 — Trusted Types

**Attack:** Any `innerHTML = userInput` assignment anywhere in the bundle (including third-party code) bypasses your sanitizer.

**Defense:** `installTrustedTypes()` registers a Trusted Types policy named `"tkx"`:
- `createHTML` routes through `sanitizeHTML`
- `createScriptURL` routes through `sanitizeHref`
- `createScript` throws unconditionally (inline scripts forbidden)

Combined with CSP `require-trusted-types-for 'script'`, this turns every `innerHTML =` assignment in your app into a policy-gated operation. **This is the strongest XSS defense available to browser apps today.**

#### T14 — Config integrity

**Attack:** Runtime code mutates your theme/config objects, breaking security invariants.

**Defense:** `deepFreeze(obj)` recursively freezes objects (including nested arrays). Themes and SecurityCore itself are deep-frozen at export time.

#### T15 — IP / source-code protection

**Attack:** Attacker `npm i tekivex-ui`, extracts the tarball, reads your internal architecture and algorithms.

**Defense (v2.5.16+):**
- Published tarball contains `dist/` only (no `src/`)
- Terser with `toplevel: true`, property mangle regex `/^_[a-zA-Z0-9]/`, 3-pass compression, `drop_console: true`
- Sourcemaps disabled
- `.d.ts` files stripped of comments (`removeComments: true`)
- Declaration sourcemaps disabled (`declarationMap: false`)
- Chunk filenames anonymized (`chunk-[hash].js`)
- `sideEffects` limited to CSS only → enables aggressive tree-shaking on consumer builds

Verification: `npm pack --dry-run` shows 147 files, 386 kB, no `.tsx`, no sourcemaps.

---

## Threat-to-component matrix

| Component | Relevant threats | Status |
|---|---|---|
| TkxInput | T1, T6 | `sanitizeString` on label/hint/error; `sanitizeUnicode` on value (default on) |
| TkxButton | T1, T2 | `sanitizeString` on label; `sanitizeHref` on href |
| TkxModal | T1, T7 | `sanitizeString` on title; `isFramed()` → `tkx:framed-modal` event |
| TkxDrawer | T1, T7 | `sanitizeString` on title; `isFramed()` → `tkx:framed-drawer` event |
| TkxFileUpload | T8, T9 | `sniffMimeType` magic-byte check; path-traversal regex |
| TkxMarkdown | T1, T2, T3 | `sanitizeHTML` on rendered output |
| TkxRichTextDisplay | T1, T2, T3 | `sanitizeHTML` on rendered output |
| TkxAvatar | T1, T2 | `sanitizeString` on alt; URL validated |
| TkxImage | T2 | `sanitizeHref` on src |
| TkxOrgChart | T1, T2 | `sanitizeString` on labels; `safeAvatarHref` on avatars |
| TkxTable | T1 | `sanitizeString` on string-typed cells and caption |
| TkxToast | T1 | `sanitizeString` on title/description/action label |
| TkxMenu / TkxDropdown | T1 | `sanitizeString` on all text fields |
| TkxForm | T1 | `sanitizeString` on labels/errors/help |
| All others | T1 | All rendered text routed through `sanitizeString` |

---

## Audit trail

TekiVex exports `audit(action, component, detail?)` and `getAuditLog()`. Every component emits an audit event on meaningful state transitions (dialog open, file accepted/rejected, form submit). Combined with `verifyAuditIntegrity()` (chained hashes), you can detect in-memory tampering of the audit log.

```ts
import { audit, getAuditLog, verifyAuditIntegrity } from 'tekivex-ui';

// During incident response:
const logs = getAuditLog({ since: Date.now() - 60_000 });
if (!verifyAuditIntegrity()) alert('Audit log tampered');
```

---

## Dependency surface

TekiVex UI has **zero runtime dependencies** other than `react` / `react-dom` (peer). This is a security decision:

- No transitive supply-chain to worry about
- No `event-stream`-style compromises (see CVE-2018-1000620)
- Every line of code shipped is authored by this project and auditable

The `dist/` tarball is 386 kB (gzip ~96 kB). Compare with MUI Core (several MB, 60+ transitive deps).

---

## Responsible disclosure

Found a security issue? Please do **not** open a public GitHub issue. Instead:

1. Email: novaai0401@gmail.com (placeholder until we set up the alias)
2. Include: version, reproduction steps, impact assessment
3. Expected response SLA: 72 hours for acknowledgment, 30 days for patch + advisory
4. CVE coordination: we will file CVEs for any confirmed vulnerability via GitHub Security Advisories

Coordinated disclosure is the only path. We do not pay bounties yet but we will credit reporters in release notes.

---

## What this document is not

- **Not a compliance certification.** SOC 2, ISO 27001, FedRAMP, PCI-DSS are attestations about *organizations and processes*, not libraries. TekiVex UI can be a building block inside a compliant system.
- **Not a penetration test report.** This is the vendor's threat model. You should commission your own pen test for your deployment.
- **Not a warranty.** See LICENSE. No software is bug-free.

---

## Changelog

- **v2.6.0 (2026-04-22)** — Expanded SecurityCore: added `sanitizeHTML`, `sanitizeCSS`, `sanitizeJSON`, `sanitizeUnicode`, `sanitizeHref`, `isSafeAttrName`, `buildTkxCSP`, `installTrustedTypes`, `isFramed`, `installFrameBuster`, `createRateLimiter`, `sniffMimeType`, `scrubPII`, `deepFreeze`. Clickjacking defense wired into TkxModal and TkxDrawer. TkxFileUpload magic-byte verification. TkxInput Unicode sanitization. 87 new test cases.
- **v2.5.16 (2026-04-22)** — IP protection hardening: removed `src/` from tarball, terser mangling, no sourcemaps.
- **v2.5.x** — Base `sanitizeString`, `sanitizeProps`, `validateProps`, audit trail.

---

© 2026 TekiVex / 007krcs — Licensed under the project LICENSE.
