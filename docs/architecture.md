# TekiVex UI — Architecture

## Layer Model

```
┌─────────────────────────────────┐
│         Application Layer        │  Your app using TekiVex components
├─────────────────────────────────┤
│         Component Layer          │  14 WCAG-compliant React components
├─────────────────────────────────┤
│    Theme Layer + A11y Layer      │  Themes, Hooks, Primitives
├─────────────────────────────────┤
│         Engine Layer             │  Quantum Render | Security | WCAG | TKX-CSS
└─────────────────────────────────┘
```

## Data Flow

1. **Props Enter** → `SecurityShield.sanitize()` strips XSS vectors
2. **Theme Resolved** → `ThemeContext` provides WCAG-verified color tokens
3. **Contrast Verified** → WCAG engine confirms AA/AAA compliance
4. **Render Cached** → Quantum engine memoizes via FNV-1a hash
5. **A11y Applied** → ARIA attributes, focus rings, keyboard handlers
6. **Audit Logged** → SecurityShield records immutable render entry
7. **CSS Generated** → TKX engine creates content-hashed class names

## Engine Files

| File | Responsibility |
|------|---------------|
| `quantum.ts` | FNV-1a hashing, LRU cache, render queues, microtask batching |
| `security.ts` | XSS sanitization, CSP, prop validation, audit trail |
| `wcag.ts` | Contrast ratios, focus traps, keyboard patterns, announcer |
| `css.ts` | Content-hashed classes, responsive, keyframes, SSR extraction |

## Dependency Graph

```
quantum.ts ─────────────────────────────────┐
wcag.ts ──────────────────────────────────┐ │
security.ts (imports quantum.ts) ───────┐ │ │
css.ts (imports quantum.ts) ──────────┐ │ │ │
                                      └─┴─┴─┤
themes/index.ts ──────────────────────────┤ │
hooks/index.ts ─────────────────────────┤ │ │
a11y/index.tsx ────────────────────────┤ │ │ │
                                       └─┴─┴─┤
Components (14) ──────────────────────────┤
                                           │
index.ts (barrel) ─────────────────────────┘
```

## Security Model

- All string props automatically pass through `Shield.sanitize()` — HTML entities prevent XSS
- Per-component Content Security Policies restrict what each component can load
- Runtime prop validation catches type errors and range violations
- Immutable audit trail with FNV-1a chain hashes — any tampering is detectable

## WCAG 2.1 Compliance

All 14 components meet:
- **1.4.6 Contrast (Enhanced) AAA** — body text ≥ 7:1
- **2.1.1 Keyboard** — all controls reachable via keyboard
- **2.4.7 Focus Visible** — 2px primary-color focus rings
- **2.5.8 Target Size AAA** — minimum 44×44px interactive targets
- **4.1.2 Name, Role, Value** — all elements have accessible names
