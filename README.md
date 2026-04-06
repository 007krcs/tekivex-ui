# ⚡ TekiVex UI

> Production-ready React component library — WCAG 2.1 AAA · WAI-ARIA 1.2 · TKX Atomic CSS · Zero-Trust Security

[![License: MIT](https://img.shields.io/badge/License-MIT-00f5d4.svg)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61dafb.svg)](https://react.dev/)
[![WCAG 2.1 AAA](https://img.shields.io/badge/WCAG-2.1%20AAA-green.svg)](https://www.w3.org/TR/WCAG21/)

---

## What is TekiVex UI?

TekiVex UI is a fully-typed React component library built for teams that need **accessibility**, **security**, and **design consistency** without compromise. It ships with:

- **14+ production-ready components** — Button, Card, Input, Badge, Progress, Toggle, Alert, Modal, Tabs, Tooltip, Skeleton, Avatar, Table, Divider
- **TKX Atomic CSS Engine** — utility-first CSS system with conflict resolution, variants, and arbitrary values
- **WCAG 2.1 AAA Engine** — contrast ratio calculation, accessible color generation, reduced-motion support
- **Zero-Trust Security Layer** — prop sanitization, XSS prevention, audit logging with integrity verification
- **Full TypeScript** — every prop, variant, and token is typed
- **Interactive Demo** — live component docs + 4 full-page templates (Dashboard, Portfolio, E-commerce, Supply Chain)

---

## Installation

```bash
npm install @tekivex/ui
```

---

## Quick Start

```tsx
import { ThemeProvider, quantumDark, TkxButton, TkxCard } from '@tekivex/ui';
import '@tekivex/ui/styles';

function App() {
  return (
    <ThemeProvider theme={quantumDark}>
      <TkxCard variant="elevated">
        <TkxButton variant="primary" size="md">
          Get Started
        </TkxButton>
      </TkxCard>
    </ThemeProvider>
  );
}
```

---

## Components

| Component | Description |
|-----------|-------------|
| `TkxButton` | 5 variants, 3 sizes, loading state, icon support, glow effect |
| `TkxCard` | 5 variants, sub-components (Header/Body/Footer), hoverable & clickable |
| `TkxInput` | Labels, error/hint, addons (icon/text), all input types |
| `TkxBadge` | 7 variants, dot badges, pulse animation, outlined |
| `TkxProgress` | Linear & circular, indeterminate, custom color |
| `TkxToggle` | 3 sizes, controlled & uncontrolled, `aria-checked` |
| `TkxAlert` | 4 variants, dismissible, icon slot |
| `TkxModal` | 4 sizes, focus trap, scroll lock, animated |
| `TkxTabs` | Keyboard navigation, ARIA tabs pattern |
| `TkxTooltip` | 4 placements, portal rendering, reduced-motion aware |
| `TkxSkeleton` | Text, circular, rectangular, wave/pulse animation |
| `TkxAvatar` | Image + initials fallback, 4 statuses, group stacking |
| `TkxTable` | Sortable columns, striped, bordered, responsive |
| `TkxDivider` | Horizontal/vertical, with label |

---

## TKX Atomic CSS Engine

```tsx
import { tkx, tx, cx } from '@tekivex/ui';

// String, array, or object input
const cls = tkx('flex items-center p-4 hover:bg-surface @md:p-8');

// Conflict resolution — last wins
tkx('p-4 p-8'); // → padding: 32px only

// Arbitrary values
tkx('w-[42px] [--my-var:red]');

// Conditional classes
cx('base-class', isActive && 'active', hasError ? 'error' : 'ok');
```

---

## Theming

```tsx
import { ThemeProvider, createTheme, quantumDark, auroraLight } from '@tekivex/ui';

// Use built-in themes
<ThemeProvider theme={quantumDark}>...</ThemeProvider>
<ThemeProvider theme={auroraLight}>...</ThemeProvider>

// Or create your own
const brandTheme = createTheme({
  primary: '#6366f1',
  secondary: '#8b5cf6',
  bg: '#0f0f23',
  surface: '#1a1a3e',
  text: '#f0f0ff',
});
```

---

## Accessibility

Every component is built against WCAG 2.1 AAA:

- Minimum **4.5:1** contrast ratio (7:1 for AAA text)
- Full **keyboard navigation** — Tab, Enter, Space, Arrow keys, Escape
- Correct **ARIA roles, states, and properties** (WAI-ARIA 1.2)
- **Focus management** — focus trap in modals, focus-visible rings
- **Reduced-motion** support — animations respect `prefers-reduced-motion`
- **Screen reader** tested — live regions, sr-only text, meaningful alt text

```tsx
import { WCAGEngine, contrastRatio, meetsAAA } from '@tekivex/ui';

const ratio = contrastRatio('#00f5d4', '#0a0f1a'); // → 9.4
const ok = meetsAAA('#00f5d4', '#0a0f1a');          // → true
```

---

## Security

```tsx
import { Shield, sanitizeString, audit, getAuditLog } from '@tekivex/ui';

// Sanitize user input
const safe = sanitizeString(userInput); // strips XSS vectors

// Audit log with HMAC integrity
audit('user_action', { component: 'TkxButton', event: 'click' });
const log = getAuditLog(); // tamper-evident audit trail
```

---

## Running the Demo

```bash
git clone https://github.com/007krcs/tekivex-ui.git
cd tekivex-ui
npm install
cd demo && npx vite
```

Opens at `http://localhost:5174` — full interactive docs + templates.

---

## Development

```bash
# Build the library
npm run build

# Run tests
npm test

# Type check
npm run typecheck

# Lint
npm run lint

# Accessibility audit
npm run a11y:audit

# Security audit
npm run security:audit
```

---

## Templates

Four full-page templates are included in the demo:

- **Dashboard** — analytics cards, charts, data tables, KPIs
- **Portfolio** — project showcase, skills, contact form
- **E-commerce** — product grid, cart, checkout flow
- **Supply Chain** — shipment tracking, inventory, status badges

---

## License

[MIT](./LICENSE) © 2024 [007krcs](https://github.com/007krcs)
