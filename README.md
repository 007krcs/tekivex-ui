<div align="center">

# ⚡ TekiVex UI

**The first React UI library with a security kernel built in.**

WCAG 2.1 AAA · WAI-ARIA 1.2 · **SecurityCore** (XSS · clickjacking · Trojan Source · CSP · PII · magic-byte MIME) · 99 Components · Zero Dependencies

📄 **[Security Threat Model](./docs/SECURITY-THREAT-MODEL.md)** — the only mainstream React UI library that publishes one.

[![npm version](https://img.shields.io/npm/v/tekivex-ui?color=00f5d4&label=tekivex-ui&logo=npm)](https://www.npmjs.com/package/tekivex-ui)
[![npm downloads](https://img.shields.io/npm/dw/tekivex-ui?color=00f5d4)](https://www.npmjs.com/package/tekivex-ui)
[![License: MIT](https://img.shields.io/badge/License-MIT-00f5d4.svg)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178c6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18+-61dafb.svg?logo=react&logoColor=white)](https://react.dev/)
[![WCAG 2.1 AAA](https://img.shields.io/badge/WCAG-2.1%20AAA-00c853.svg)](https://www.w3.org/TR/WCAG21/)
[![Tests](https://img.shields.io/badge/Tests-1034%20passing-00c853.svg)](#testing)
[![SecurityCore](https://img.shields.io/badge/SecurityCore-v3.0-f72585.svg)](./docs/SECURITY-THREAT-MODEL.md)

<br/>

```bash
npm install tekivex-ui
```

[📖 Docs](https://ui.tekivex.com) · [🚀 Demo](https://github.com/007krcs/tekivex-ui) · [📦 npm](https://www.npmjs.com/package/tekivex-ui) · [🐛 Report Issue](https://github.com/novaai0401-ui/tekivex-issue-report/issues) · [⭐ Star](https://github.com/novaai0401-ui/tekivex-issue-report/stargazers)

</div>

---

## Why TekiVex UI?

| Feature | TekiVex UI | MUI | Ant Design | Mantine | shadcn/ui |
|---|:---:|:---:|:---:|:---:|:---:|
| WCAG **AAA** (not just AA) | ✅ | ❌ | ❌ | ❌ | ❌ |
| **XSS** — automatic sanitisation on every prop | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Clickjacking** — `isFramed()` + `frame-ancestors` CSP | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Trojan Source** — bidi/zero-width stripped on inputs | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Prototype pollution** — safe `JSON.parse` | ✅ | ❌ | ❌ | ❌ | ❌ |
| **File upload** — magic-byte MIME verification | ✅ | ❌ | ❌ | ❌ | ❌ |
| **CSP builder** — one-line strict policy | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Trusted Types** — one-call policy install | ✅ | ❌ | ❌ | ❌ | ❌ |
| **PII redaction** — pre-LLM / pre-analytics | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Rate limiter** — client-side DoS guard | ✅ | ❌ | ❌ | ❌ | ❌ |
| Immutable security audit trail + integrity check | ✅ | ❌ | ❌ | ❌ | ❌ |
| Published threat model | ✅ | ❌ | ❌ | ❌ | ❌ |
| Full-featured DataGrid — **free** | ✅ | 💰 Pro | Partial | Partial | ❌ |
| 80+ production components — **free** | ✅ | ✅ | ✅ | ✅ | 30 |
| Hooks layer (a11y, theme, i18n) | ✅ | ❌ | ❌ | ✅ | ✅ |
| i18n — 27 locales incl. RTL | ✅ | ✅ | ✅ | Partial | ❌ |
| Plugin-extensible CSS engine | ✅ | ❌ | ❌ | ❌ | ❌ |
| Zero extra dependencies | ✅ | ❌ | ❌ | ❌ | ✅ |
| **No `src/` in npm tarball** (IP protection) | ✅ | ❌ | ❌ | ❌ | ❌ |

---

## Installation

```bash
# npm
npm install tekivex-ui

# pnpm
pnpm add tekivex-ui

# yarn
yarn add tekivex-ui
```

**Peer dependencies** (already in most React projects):
```bash
npm install react@^18 react-dom@^18
```

**Optional** — for chart components:
```bash
npm install recharts
```

---

## Quick Start

```tsx
import { ThemeProvider, quantumDark, TkxButton, TkxCard } from 'tekivex-ui';
import 'tekivex-ui/styles';

export default function App() {
  return (
    <ThemeProvider theme={quantumDark}>
      <TkxCard variant="elevated">
        <h2>Hello TekiVex</h2>
        <TkxButton colorScheme="primary" size="md">
          Get Started
        </TkxButton>
      </TkxCard>
    </ThemeProvider>
  );
}
```

---

## Package Exports

TekiVex UI ships as **three tree-shakeable entry points** — import only what you need:

```ts
// Core components + theme + engine  (~120 kB gzip)
import { TkxButton, ThemeProvider, useTheme } from 'tekivex-ui';

// 7 chart types built on Recharts  (~3 kB gzip on top of recharts)
import { TkxAreaChart, TkxBarChart, TkxLineChart, TkxPieChart } from 'tekivex-ui/charts';

// 10 headless hooks — zero styles, your UI  (~2.6 kB gzip)
import { useDisclosure, useFormState, useListSelection } from 'tekivex-ui/headless';
```

---

## Components (70+)

<details>
<summary><strong>Layout & Navigation</strong></summary>

| Component | Description |
|---|---|
| `TkxLayout` | Full app shell — header, sidebar, content, footer |
| `TkxAppBar` | Sticky top navigation bar with slots |
| `TkxSidebar` | Collapsible sidebar navigation |
| `TkxBottomNav` | Mobile bottom tab bar |
| `TkxBreadcrumb` | Accessible breadcrumb trail |
| `TkxMenu` | Nested dropdown menu with keyboard navigation |
| `TkxTabs` | Tab panels with WAI-ARIA tabs pattern |
| `TkxAnchor` | Scroll-spy anchor link list |
| `TkxAffix` | Sticky positioning that activates on scroll |
| `TkxToolbar` | Horizontal action bar |
| `TkxPagination` | Page navigation with first/prev/next/last |
| `TkxStepper` | Multi-step wizard — horizontal & vertical |

</details>

<details>
<summary><strong>Data Display</strong></summary>

| Component | Description |
|---|---|
| `TkxDataGrid` | Full-featured grid — sort, filter, pagination, CSV export, row selection, ARIA |
| `TkxTable` | Sortable, striped, bordered, responsive |
| `TkxList` | Flexible list with icons and actions |
| `TkxCard` | 5 variants, sub-components (Header/Body/Footer), hoverable |
| `TkxAvatar` | Image + initials fallback, 4 statuses, group stacking |
| `TkxBadge` | 7 variants, dot, pulse, outlined |
| `TkxTag` | Dismissible tags with colour variants |
| `TkxStatistic` | Metric display with trend indicator |
| `TkxTimeline` | Vertical event timeline |
| `TkxProgress` | Linear & circular, indeterminate |
| `TkxSkeleton` | Text, circular, rectangular loading placeholders |
| `TkxResult` | Success / error / 404 / 403 / 500 result pages |
| `TkxQRCode` | QR code generator |
| `TkxImage` | Lazy-load, lightbox, skeleton placeholder, aspect ratio |
| `TkxRichTextDisplay` | Render structured rich-text blocks |
| `TkxWatermark` | Canvas-based watermark overlay |
| `TkxEmpty` | Empty state with custom illustration |
| `TkxOrgChart` | Reingold–Tilford org-chart with pan/zoom, collapsible subtrees, custom renderer |

</details>

<details>
<summary><strong>Forms & Inputs</strong></summary>

| Component | Description |
|---|---|
| `TkxForm` | Form context provider with field validation |
| `TkxInput` | Text input — labels, error/hint, prefix/suffix |
| `TkxNumberInput` | Numeric input with min/max, step, currency format |
| `TkxSelect` | Single/multi select with search |
| `TkxCascader` | Hierarchical multi-level select |
| `TkxAutocomplete` | Searchable autocomplete |
| `TkxMentions` | @mention textarea |
| `TkxCheckbox` | Controlled + uncontrolled, indeterminate |
| `TkxRadio` | Radio group with ARIA |
| `TkxToggle` | Switch — 3 sizes, `aria-checked` |
| `TkxSlider` | Range slider — single & dual thumb |
| `TkxRating` | Star/custom-icon rating |
| `TkxDatePicker` | Calendar date picker |
| `TkxColorPicker` | HEX / RGB / HSL colour picker |
| `TkxOTP` | One-time password input |
| `TkxFileUpload` | Drag-and-drop file upload |
| `TkxSegmented` | Segmented control / button group |
| `TkxTransferList` | Dual-panel item transfer |
| `TkxCommand` | Command palette (⌘K) |

</details>

<details>
<summary><strong>Feedback & Overlays</strong></summary>

| Component | Description |
|---|---|
| `TkxModal` | 4 sizes, focus trap, scroll lock, animated |
| `TkxDrawer` | Side sheet — top/right/bottom/left |
| `TkxTooltip` | 4 placements, portal rendering |
| `TkxPopover` | Rich content popover |
| `TkxSnackbar` | Toast notifications with action |
| `TkxAlert` | 4 variants, dismissible, icon slot |
| `TkxSpin` | Loading spinner |
| `TkxTour` | Step-by-step product tour |
| `TkxSpeedDial` | FAB with expandable actions |

</details>

<details>
<summary><strong>Media & Visual</strong></summary>

| Component | Description |
|---|---|
| `TkxVideoPlayer` | Full-featured player — chapters, subtitles, PiP, download |
| `TkxCarousel` | Touch/swipe carousel with thumbnails |
| `TkxClock` | Analog / digital / dual clock |
| `TkxMasonry` | Responsive masonry grid layout |
| `TkxTreeView` | Expandable tree with keyboard navigation |
| `TkxIcon` | 200+ built-in icons |
| `TkxDivider` | Horizontal/vertical with optional label |
| `TkxTypography` | Title, Text, Paragraph — semantic HTML |

</details>

---

## Charts

Seven production-ready chart types via the `tekivex-ui/charts` sub-package:

```tsx
import {
  TkxAreaChart, TkxBarChart, TkxLineChart,
  TkxPieChart, TkxDonutChart,
  TkxScatterChart, TkxRadarChart,
} from 'tekivex-ui/charts';

const data = [
  { month: 'Jan', revenue: 42000, cost: 28000 },
  { month: 'Feb', revenue: 51000, cost: 31000 },
  { month: 'Mar', revenue: 63000, cost: 34000 },
];

<TkxAreaChart
  data={data}
  xKey="month"
  series={[
    { key: 'revenue', label: 'Revenue' },
    { key: 'cost', label: 'Cost' },
  ]}
  height={300}
  showGrid
  showLegend
  smooth
  ariaLabel="Monthly revenue vs cost"
/>
```

| Chart | Props |
|---|---|
| `TkxAreaChart` | `data`, `series`, `xKey`, `smooth`, `showGrid`, `showLegend` |
| `TkxBarChart` | `data`, `series`, `xKey`, `layout` (`horizontal`/`vertical`), `gradient` |
| `TkxLineChart` | `data`, `series`, `xKey`, `referenceLines`, `connectNulls` |
| `TkxPieChart` | `data`, `showLabels`, `outerRadius`, `startAngle` |
| `TkxDonutChart` | `data`, `centerLabel`, `centerSublabel`, `innerRadius` |
| `TkxScatterChart` | `series`, `xLabel`, `yLabel`, `zRange` (bubble sizing) |
| `TkxRadarChart` | `data`, `series`, `angleKey`, `outerRadius` |

---

## Headless Primitives

Zero-style hooks from `tekivex-ui/headless` — bring your own UI:

```tsx
import {
  useDisclosure,     // open/closed state
  useDebounce,       // debounce any value
  useThrottle,       // throttle any value
  useControllable,   // unify controlled/uncontrolled (Radix pattern)
  useListSelection,  // multi-select with selectAll / toggleAll
  useLocalStorage,   // SSR-safe persisted state
  useMediaQuery,     // reactive media query
  useBreakpoint,     // sm/md/lg/xl/xxl/isMobile/isTablet/isDesktop
  useFormState,      // headless form with validation + dirty tracking
  useRovingTabIndex, // WAI-ARIA roving tabIndex keyboard navigation
  useIntersectionObserver, // viewport visibility
} from 'tekivex-ui/headless';

// Example — useDisclosure
const { isOpen, open, close, toggle } = useDisclosure(false);

// Example — useFormState
const { values, errors, touched, isValid, setValue, validate } = useFormState({
  initialValues: { name: '', email: '' },
  validate: (vals) => {
    const errs: Record<string, string> = {};
    if (!vals.name) errs.name = 'Required';
    if (!vals.email.includes('@')) errs.email = 'Invalid email';
    return errs;
  },
});

// Example — useControllable (works controlled or uncontrolled)
const [value, setValue2] = useControllable({
  value: externalValue,      // optional — if omitted, uses internal state
  onChange: onExternalChange, // optional
  defaultValue: 'default',
});
```

---

## Theming

```tsx
import { ThemeProvider, createTheme, quantumDark, auroraLight } from 'tekivex-ui';

// Built-in themes
<ThemeProvider theme={quantumDark}>...</ThemeProvider>   // dark
<ThemeProvider theme={auroraLight}>...</ThemeProvider>   // light

// Custom brand theme
const brandTheme = createTheme({
  primary:   '#6366f1',
  secondary: '#8b5cf6',
  bg:        '#0f0f23',
  surface:   '#1a1a3e',
  text:      '#f0f0ff',
});

// Read current theme tokens anywhere
function MyComponent() {
  const theme = useTheme();
  return <div style={{ color: theme.primary }}>Branded</div>;
}
```

CSS custom properties are injected automatically — no flash of unstyled content (FOUC).

---

## Internationalisation (27 locales)

```tsx
import { I18nProvider, zhCN, arSA, jaJP, ptBR } from 'tekivex-ui';

<I18nProvider locale="zh-CN">  {/* RTL is detected automatically for ar-SA, he-IL, fa-IR */}
  <App />
</I18nProvider>
```

**Supported locales:**

| Region | Locales |
|---|---|
| English | `en-US` |
| Romance | `es-ES` · `pt-BR` · `pt-PT` · `fr-FR` · `it-IT` · `ro-RO` |
| Germanic | `de-DE` · `nl-NL` · `sv-SE` · `da-DK` |
| Slavic | `pl-PL` · `ru-RU` · `uk-UA` · `cs-CZ` · `hu-HU` |
| Middle East (RTL) | `ar-SA` · `he-IL` · `fa-IR` |
| East Asia | `ja-JP` · `ko-KR` · `zh-CN` · `zh-TW` |
| Southeast Asia | `th-TH` · `vi-VN` · `id-ID` |
| Other | `tr-TR` |

---

## TKX Atomic CSS Engine

A zero-runtime, conflict-resolving CSS engine. No Tailwind, no styled-components, no extra config.

```tsx
import { tkx, cx, cssVar, tkxPlugin } from 'tekivex-ui';

// Single string, no class conflicts
const cls = tkx('flex items-center p-4 hover:bg-surface');

// Conflict resolution — last value wins
tkx('p-4 p-8');  // → only padding: 32px

// Arbitrary values & CSS variables
tkx('w-[42px] text-[#ff6b6b] [--spacing:16px]');

// Conditional classes
cx('base', isActive && 'active', hasError ? 'ring-danger' : 'ring-border');

// Plugin API — extend the engine (unique to TekiVex)
tkxPlugin('glass', () => ({
  backdropFilter: 'blur(12px)',
  backgroundColor: 'rgba(255,255,255,0.08)',
  border: '1px solid rgba(255,255,255,0.12)',
}));
tkx('glass p-6 rounded-xl'); // uses your plugin
```

**Engine performance:** O(1) style injection via the Constructable Stylesheets API (`document.adoptedStyleSheets`) with automatic SSR fallback.

---

## Security

TekiVex UI is the **only React component library with a built-in zero-trust security engine.** Every string that passes through the library is automatically sanitised — no configuration required.

```tsx
import { sanitizeString, sanitizeProps, contrastRatio, meetsAA, meetsAAA } from 'tekivex-ui/headless';

// XSS sanitisation (called automatically inside every component)
sanitizeString('<script>alert("XSS")</script>Hello');
// → 'Hello'

sanitizeString('<img src=x onerror="stealCookies()" />');
// → '' (fully stripped)

// WCAG contrast checking
const ratio = contrastRatio('#00f5d4', '#0a0a1a'); // → 8.21
const aa    = meetsAA('#00f5d4', '#0a0a1a');        // → true  (≥ 4.5:1)
const aaa   = meetsAAA('#00f5d4', '#0a0a1a');       // → true  (≥ 7:1)
```

**What's unique:**
- 🛡️ **Automatic sanitisation** — no opt-in needed, every prop is safe by default
- 📋 **Immutable audit trail** — append-only log of all security events for compliance / SIEM
- 🎨 **Built-in WCAG checker** — `contrastRatio()`, `meetsAA()`, `meetsAAA()` available anywhere

---

## Accessibility

Every component meets **WCAG 2.1 AAA** — the highest accessibility standard:

- ✅ Contrast ratio ≥ **7:1** for all text (AAA, not just AA's 4.5:1)
- ✅ Full **keyboard navigation** — Tab, Enter, Space, Arrow keys, Escape
- ✅ Correct **ARIA roles, states & properties** (WAI-ARIA 1.2)
- ✅ **Focus management** — focus trap in modals, visible focus rings
- ✅ **Reduced-motion** — all animations respect `prefers-reduced-motion`
- ✅ **Screen reader** tested — live regions, `sr-only` text, meaningful `alt`
- ✅ **RTL support** — layout mirrors automatically for Arabic, Hebrew, Persian

---

## DataGrid

Full-featured data grid — no paid tier required:

```tsx
import { TkxDataGrid } from 'tekivex-ui';

<TkxDataGrid
  columns={[
    { key: 'name',   header: 'Name',   sortable: true  },
    { key: 'email',  header: 'Email',  sortable: true  },
    { key: 'status', header: 'Status', filterable: true },
  ]}
  rows={data}
  pageSize={10}
  selectable
  showFilters
  showExport
  exportFileName="users"
/>
```

| Feature | Free | MUI DataGrid | Ag-Grid |
|---|:---:|:---:|:---:|
| Sorting | ✅ | ✅ | ✅ |
| Column filtering | ✅ | 💰 Pro | ✅ |
| Pagination | ✅ | ✅ | ✅ |
| Row selection | ✅ | ✅ | ✅ |
| CSV export | ✅ | 💰 Pro | 💰 Enterprise |
| Full ARIA | ✅ | ✅ | Partial |

---

## Templates

Seven full-page templates included in the demo:

| Template | Description |
|---|---|
| **Dashboard** | KPI cards, charts, DataGrid, live stats |
| **Portfolio** | Project showcase, skills, contact form |
| **E-commerce** | Product grid, filters, cart, checkout |
| **Supply Chain** | Shipment tracking, inventory, status |
| **Blog / CMS** | Article list, rich text, tags |
| **Admin Settings** | Profile, security, preferences tabs |
| **Landing Page** | Hero, features, pricing, CTA |

---

## Development

```bash
git clone https://github.com/007krcs/tekivex-ui.git
cd tekivex-ui
npm install

# Build the library
npm run build

# Run all 1034 tests
npm test

# Run tests with coverage report
npm run test:coverage

# Type check
npm run typecheck

# Lint
npm run lint

# Run the library Vite playground (localhost:5173)
npm run dev

# Run the interactive demo (localhost:5174)
npm run dev:demo

# Accessibility audit
npm run a11y:audit

# Security audit
npm run security:audit
```

---

## Testing

```
82 test files · 1034 tests · 0 failures · 1 todo
Coverage: 64.84% lines · 51.10% functions · 56.77% branches · 61.41% statements
```

Coverage includes unit tests for all 99 components, 7 chart types, headless hooks (incl. useWebSocket / useSSE / useMediaQuery), the TKX CSS engine, the WCAG engine, the security (Shield) engine, the i18n provider, and Indian KYC validators (Aadhaar Verhoeff, PAN, Voter ID, DL).

Coverage thresholds are enforced as a CI ratchet in `vitest.config.ts` — the floor never drops between releases. Path to 90/90/85 is documented in [`docs/test-coverage-roadmap.md`](./docs/test-coverage-roadmap.md).

---

## Roadmap

- [ ] Storybook integration + published Storybook site
- [ ] Figma design token export
- [ ] Zod / Valibot schema resolver for `TkxForm`
- [ ] 40+ additional locales (target: 70+ matching Ant Design)
- [ ] Third-party WCAG 2.1 AAA accessibility audit certificate
- [ ] Heatmap, Funnel, Treemap, Gauge chart types
- [ ] Column pinning and row grouping in DataGrid

---

## Bug Reports & Issues

Found a bug or have a feature request? Please open an issue on our dedicated issue tracker:

**👉 [github.com/novaai0401-ui/tekivex-issue-report/issues](https://github.com/novaai0401-ui/tekivex-issue-report/issues)**

When reporting, please include:
- tekivex-ui version (`npm list tekivex-ui`)
- React version
- Browser / Node version
- A minimal reproduction (CodeSandbox or code snippet)

---

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) before submitting a PR.

**Maintainers:** [007krcs](https://github.com/007krcs) · [seemaalmas](https://github.com/seemaalmas) · [novaai0401-ui](https://github.com/novaai0401-ui)

---

## License

[MIT](./LICENSE) © 2026 [007krcs](https://github.com/007krcs)

---

<div align="center">

Made with ⚡ by the TekiVex team

**[npm](https://www.npmjs.com/package/tekivex-ui) · [GitHub](https://github.com/007krcs/tekivex-ui) · [Docs](https://ui.tekivex.com)**

</div>
