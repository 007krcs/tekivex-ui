# Launch content — v2.6.0

**Status:** draft  
**Target channels:** Hacker News, X/Twitter, r/reactjs, Product Hunt

---

## HN post

**Title:** `Show HN: Tekivex-UI – React components with a built-in security kernel`

**Body:**

Hi HN. I've been building tekivex-ui, a React 19 component library that ships a static security kernel alongside the components.

Most libraries ship *components*. We also ship `SecurityCore`: a zero-dep module that covers 15 attack classes the component itself can't prevent — URL sanitization (javascript:/data:), Unicode homoglyph + Trusted Types, PII scrubbing, rate limiters, audit hashing (FNV-1a), CSP builders.

Why: `<a href={userUrl}>` is a component you already have. `sanitizeHref(userUrl)` is what stops the XSS. A library that ships one without the other is half a product.

Free + MIT. 80+ components. WCAG 2.1 AAA. 27 locales.

Two CLIs in the same release:

- `npm create tekivex-app` — scaffolds a project with CSP + Trusted Types + SecurityCore pre-wired
- `npx @tekivex/audit .` — scans any React project for 15 security + accessibility regressions (dangerouslySetInnerHTML without DOMPurify, missing CSP, auth tokens in localStorage, `<img>` without alt, etc.), maps findings to OWASP/CWE refs

Would love to hear what other attack classes you'd expect in something called a "security kernel." Not looking to replace Snyk or eslint-plugin-jsx-a11y — trying to fill the code-level gap between them.

Docs: https://tekivex.dev  
GitHub: https://github.com/tekivex/tekivex-ui  
Threat model: /THREAT-MODEL.md in the repo

---

## X / Twitter thread

**1/** Shipping tekivex-ui v2.6.0 today. 80+ React components + a built-in security kernel. MIT, free forever.

A component library that sanitizes its own outputs. 🧵

**2/** Every `<a>` takes a URL. Every URL is a potential `javascript:` XSS. Most libraries leave that to you. We ship `sanitizeHref()` in the same package.

**3/** 15 attack classes covered in SecurityCore: URL sanitization, Unicode homoglyph defense (CVE-2021-42574), Trusted Types, PII scrubbing, rate limiters, FNV-1a audit hashing, CSP builders.

**4/** Two CLIs in the same release:

→ `npm create tekivex-app` — scaffolds CSP + Trusted Types pre-wired  
→ `npx @tekivex/audit .` — scans any React codebase for 15 sec+a11y regressions

**5/** Accessibility isn't bolted on either: WCAG 2.1 AAA out of the box, 27 locales, RTL, screen-reader tested.

**6/** We dogfooded the audit tool on our own demo. Found 9 errors + 67 warnings in our own code on the first run. Fixed them. Shipped the fix. That's why I trust it.

**7/** Free forever. Pro tier adds support + SLAs + Figma kit when we're ready. Not pushing that today — use the library, break it, tell me what's missing.

**8/** Docs: https://tekivex.dev  
Repo: https://github.com/tekivex/tekivex-ui  
GitHub issues are open. ⬇️

---

## r/reactjs post

**Title:** `I built a React library that ships with a security audit CLI — found 9 XSS vectors in my own code on the first run`

**Body:**

Been working on tekivex-ui, 80+ React components with a built-in `SecurityCore` module. To make sure I wasn't lying about the security story, I also built `@tekivex/audit` — a static-analysis CLI that scans any React project for 15 known regressions:

- `dangerouslySetInnerHTML` without DOMPurify
- `href="javascript:..."`
- `eval()` / `new Function()`
- Hardcoded API keys
- Auth tokens in localStorage
- `target="_blank"` without `rel="noopener"`
- Missing CSP meta tag
- `<img>` without alt
- Empty `<button>` / `<a>`
- `onClick` on `<div>` / `<span>`
- `<input>` without a label
- `autoFocus` on page load

Mapped to OWASP / CWE / WCAG refs so you can defend findings in code review.

Ran it on my own demo. 9 errors. Fixed all of them before launch. If you're working on a React codebase of any size: `npx @tekivex/audit .` costs you 10 seconds and tells you exactly where to look.

MIT, zero config. Feedback welcome.

---

## Product Hunt listing

**Tagline:** React components with a security kernel built in — and the audit CLI to prove it

**Description:**

Tekivex-UI is 80+ React 19 components that ship with SecurityCore, a zero-dep module covering 15 attack classes most libraries leave to you. URL sanitization, Unicode homoglyph defense, Trusted Types, PII scrubbing, CSP builders, audit hashing.

Paired with two CLIs:
- `create-tekivex-app` — scaffolds a new project with CSP + SecurityCore pre-wired
- `@tekivex/audit` — scans any React codebase for 15 known security + accessibility regressions, mapped to OWASP/CWE/WCAG refs

Free, MIT, WCAG 2.1 AAA, 27 locales.

**First comment:**

Hey PH. Maker here. I got tired of libraries saying "we care about security" and then shipping `<a>` with no URL sanitizer. Tekivex-UI is my attempt to fix that at the library level — if an attack class is preventable in library code, we prevent it. If it's preventable in scaffolding, we scaffold it in. If it's preventable in a lint rule, we ship the lint rule as a CLI.

Would love to hear what you expect a "React library with a security kernel" to include that we missed.
