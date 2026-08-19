<div align="center">

# ⚡ TekiVex UI

**The React component library that ships with a threat model.**

WCAG 2.1 AAA target (third-party audit on roadmap, not yet completed) · WAI-ARIA 1.2 · **SecurityCore** (XSS · clickjacking · Trojan Source · CSP · PII · magic-byte MIME · Trusted Types) · **116 production components** (+ 4 experimental, opt-in) · Zero runtime dependencies in core

📄 **[Security Threat Model](./docs/SECURITY-THREAT-MODEL.md)** — the only mainstream React UI library that publishes one. 15 STRIDE-mapped threats with CWE references.

[![npm version](https://img.shields.io/npm/v/tekivex-ui?color=00f5d4&label=tekivex-ui&logo=npm)](https://www.npmjs.com/package/tekivex-ui)
[![npm downloads](https://img.shields.io/npm/dw/tekivex-ui?color=00f5d4)](https://www.npmjs.com/package/tekivex-ui)
[![License: MIT](https://img.shields.io/badge/License-MIT-00f5d4.svg)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178c6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18+-61dafb.svg?logo=react&logoColor=white)](https://react.dev/)
[![WCAG 2.1 AA + APG](https://img.shields.io/badge/WCAG-2.1%20AA%20%2B%20APG-00c853.svg)](https://www.w3.org/TR/WCAG21/)
[![Tests](https://img.shields.io/badge/Tests-1798%20passing-00c853.svg)](#testing)
[![SecurityCore](https://img.shields.io/badge/SecurityCore-v3.0-f72585.svg)](./docs/SECURITY-THREAT-MODEL.md)
[![Socket.dev](https://socket.dev/api/badge/npm/package/tekivex-ui)](https://socket.dev/npm/package/tekivex-ui)
[![SBOM](https://img.shields.io/badge/SBOM-CycloneDX%201.5-7c5cff.svg)](https://ui.tekivex.com/security/sbom.json)

<br/>

```bash
npm install tekivex-ui
```

[📖 Docs](https://ui.tekivex.com) · [🚀 Demo](https://ui.tekivex.com) · [📦 npm](https://www.npmjs.com/package/tekivex-ui) · [🐛 Report Issue](https://github.com/007krcs/tekivex-ui/issues) · [⭐ Star](https://github.com/007krcs/tekivex-ui/stargazers)

</div>

---

## The 14-package ecosystem at a glance

`tekivex-ui` is the main library, but the ecosystem ships 14 npm
packages total. **You typically need 1–3 of them, not 14.** Map below
groups by *the question that makes you install each one*. Full
reference: [ui.tekivex.com/ecosystem](https://ui.tekivex.com/ecosystem/).

| If you're building… | `npm install` |
|---|---|
| A React UI (most people start here) | `tekivex-ui` |
| A new React app from scratch | `npm create tekivex-app@latest my-app` |
| A node / edge service that needs the security primitives | `tekivex-security-core` |
| CI a11y + security audit step | `npx tekivex-audit .` |
| An Indian KYC form (Aadhaar / PAN / Voter ID / DL / INR / Tithi) | `tekivex-ui tekivex-india` |
| An address form with Country → State → District dropdowns | `tekivex-ui tekivex-india-admin` |
| A fintech / banking product | `tekivex-ui tekivex-finance` |
| A CMS / blog editor / document tool | `tekivex-ui tekivex-content` |
| In-browser PDF generation (no Puppeteer) | `tekivex-pdf` |
| Ready-made PDF templates (Invoice / Resume / Certificate / Biodata) | `tekivex-pdf tekivex-templates` |
| 3D / 360° / VR / AR in React | `tekivex-ui tekivex-3d` (peer dep: `three`) |
| Figma token + variant catalog for design handoff | `tekivex-figma-kit` |
| Copy ONE component's source into your existing app (shadcn-style) | `npx tekivex-add <component>` |
| Form primitives only (without the rest of `tekivex-ui`) | `tekivex-form` (already in `tekivex-ui`; install only if you're NOT using `tekivex-ui`) |

Why so many packages? **Independent versioning, smaller bundles,
opt-in peer deps.** A consumer wanting `tekivex-pdf` shouldn't have to
pull `three.js`. A consumer wanting `tekivex-india-admin` shouldn't
wait for a `tekivex-ui` release when LGD data refreshes. Each package
versions and ships on its own clock; this README always reflects the
current install matrix.

---

## Project status — read before adopting

TekiVex UI is **pre-1.0** and currently maintained by a single developer
([007krcs](https://github.com/007krcs)) on `novaai0401@gmail.com`. We
ship a public [CycloneDX SBOM](https://ui.tekivex.com/security/sbom.json),
a [security threat model](./docs/SECURITY-THREAT-MODEL.md) (15 STRIDE
threats with CWE refs), and 1,798 tests at the published version — but
none of that substitutes for the human-scale risk of any pre-1.0,
single-maintainer library.

When published from CI, releases carry npm
[provenance attestations](https://docs.npmjs.com/generating-provenance-statements).
Local releases (currently the norm during pre-1.0) do not — verify
provenance status with `npm view tekivex-ui --json | jq '.dist.attestations'`
if it matters to your supply-chain policy.

**Honest guidance:**

- **Pin your version** (`"tekivex-ui": "3.18.0"`, not `"^3.18.0"`) until v4.0
- **Read [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** before integrating — covers known Next.js / RSC / SSR / hydration issues
- **Audit the SBOM** at [`ui.tekivex.com/security/sbom.json`](https://ui.tekivex.com/security/sbom.json) — verifies zero runtime deps
- **Verify the package** with `npm view tekivex-ui` before installing if you're concerned about typosquats (the legitimate name is exactly `tekivex-ui`)
- **Check Socket.dev** [![Socket.dev](https://socket.dev/api/badge/npm/package/tekivex-ui)](https://socket.dev/npm/package/tekivex-ui) for supply-chain risk score
- **For regulated-industry teams**: we're open to design-partner collaborations with regulated-industry teams — see [`docs/design-partners/README.md`](./docs/design-partners/README.md) for the playbook. No reserved slots, no formal program in place yet; reach out if it fits your situation.

**Expect breaking changes at v4.0** — see [docs/ROADMAP.md](./docs/ROADMAP.md).
Until then, the API surface marked stable will not break in minor or
patch releases.

**Recent compatibility fixes** (v3.18, published 2026-05-28):

- Build no longer emits Vite's chunk runtime format — **works in Next.js / RSC** (was broken pre-v3.18)
- ThemeProvider `mode="auto"` is now SSR-safe + `themeInitScript()` helper for FOUC-free initialisation
- `'use client'` directives on every hook-using component
- `isDisabled` absorbed as a deprecated alias (no longer pollutes DOM)
- `background` / `backgroundImage` shorthand conflict removed

---

## Standalone template repos

The resume + biodata templates have moved into their own repos so apps that only need the templates don't have to pull the entire `tekivex-ui` install:

| Use case                 | Install                                                                                                |
| ------------------------ | ------------------------------------------------------------------------------------------------------ |
| Resume builder           | [`tekivex-resume-templates`](https://github.com/007krcs/tekivex-resume-templates) — 12 templates + smart generator + paywall + browser-only PDF |
| Marriage biodata builder | [`tekivex-biodata-templates`](https://github.com/007krcs/tekivex-biodata-templates) — 12 templates with auto religious symbols + custom logo upload + 11 vendored biodata-app helpers |

Both repos ship the same generator pattern (form → A4 preview → 1-page print), the same locked-by-default policy, and the same image-upload UX as the original `TkxTemplateGenerator` in this repo (which is staying for backward compatibility).

---

## What's new in v3.6 → v3.15

| Component                | Lands in | Tests | Coverage              |
| ------------------------ | -------- | ----- | --------------------- |
| `TkxFormBuilder`         | v3.6     | 17    | (full unit)           |
| `TkxMindMap`             | v3.7     | 12    | (full unit)           |
| `TkxGantt`               | v3.8     | 14    | (full unit)           |
| `TkxSpreadsheet`         | v3.9     | 29    | (full unit)           |
| `TkxPivotTable`          | v3.10    | 12    | (full unit)           |
| `TkxDataExplorer`        | v3.11    | 21    | (full unit)           |
| `TkxHolographicAdvanced` | v3.12    | 28    | 93 / 94 / 91 / 89     |
| `TkxCommandPalette`      | v3.13    | 16    | (full unit)           |
| `TkxFormulaBar`          | v3.14    | 18    | **100 / 100 / 100 / 90** |
| `TkxFlowChart`           | v3.15    | 40    | **97 / 96 / 95 / 86** |

Coverage notation: lines / statements / functions / branches.

Pair `tekivex-ui` with [`tekivex-3d`](./packages/tekivex-3d/) for the
spatial UI toolkit (Scene, Panorama360, Hotspot, XRSession, Model3D,
Logo3D, ParticleField, OrbitControls, Starfield, Planet, OrbitPath,
Portal3D, Avatar3D — 14 primitives at source v0.7).

---

## Why TekiVex UI?

| Feature | TekiVex UI | MUI | Ant Design | Mantine | shadcn/ui |
|---|:---:|:---:|:---:|:---:|:---:|
| WCAG **AAA** target (third-party audit on roadmap, not yet completed) | ✅ | ❌ | ❌ | ❌ | ❌ |
| **XSS** — string props sanitised by default across all text components | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Clickjacking** — `isFramed()` detection + `frame-ancestors` CSP | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Trojan Source** — bidi/zero-width stripped from text inputs | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Prototype pollution** — `sanitizeJSON()` safe parser | ✅ | ❌ | ❌ | ❌ | ❌ |
| **File upload** — magic-byte MIME verification (real signatures) | ✅ | ❌ | ❌ | ❌ | ❌ |
| **CSP builder** — one-line strict policy | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Trusted Types** — one-call policy install | ✅ | ❌ | ❌ | ❌ | ❌ |
| **PII redaction** — regex + Luhn-validated CC, pre-LLM/pre-analytics | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Rate limiter** — client-side token-bucket DoS guard | ✅ | ❌ | ❌ | ❌ | ❌ |
| Tamper-evident SHA-256 hash-chained audit trail | ✅ | ❌ | ❌ | ❌ | ❌ |
| Published threat model | ✅ | ❌ | ❌ | ❌ | ❌ |
| Full-featured DataGrid — **free** | ✅ | 💰 Pro | Partial | Partial | ❌ |
| 116 production components — **free** | ✅ | ✅ | ✅ | ✅ | 30 |
| Hooks layer (a11y, theme, i18n) | ✅ | ❌ | ❌ | ✅ | ✅ |
| i18n — 44 locales incl. RTL | ✅ | ✅ | ✅ | Partial | ❌ |
| Plugin-extensible CSS engine | ✅ | ❌ | ❌ | ❌ | ❌ |
| Zero runtime deps in core (recharts optional) | ✅ | ❌ | ❌ | ❌ | ✅ |

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

TekiVex UI ships **tree-shakeable entry points** — import only what you need:

```ts
// Core components + theme + engine  (~120 kB gzip)
import { TkxButton, ThemeProvider, useTheme } from 'tekivex-ui';

// 7 chart types built on Recharts  (~3 kB gzip on top of recharts)
import { TkxAreaChart, TkxBarChart, TkxLineChart, TkxPieChart } from 'tekivex-ui/charts';

// 10 headless hooks — zero styles, your UI  (~2.6 kB gzip)
import { useDisclosure, useFormState, useListSelection } from 'tekivex-ui/headless';

// Agent runtime — Anthropic/OpenAI/Gemini/Ollama, RAG, MCP, A2A, tools (~16 kB gzip)
import { createAgent, AnthropicProvider, useAgent } from 'tekivex-ui/agent';
```

📘 **[Full agent runtime reference → docs/AGENT.md](./docs/AGENT.md)**

---

## Components (115)

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

<details>
<summary><strong>Experimental (opt-in, API not stable)</strong></summary>

These components live in-tree but are excluded from the public barrel — the
API surface, prop names, and runtime behaviour MAY change in any minor
release. They are not counted in the 115-component headline number.

Import path: `import { TkxQuantumForm } from 'tekivex-ui/experimental';`

| Component | Notes |
|---|---|
| `TkxQuantumForm` | "Quantum-AI" form inference — research-grade, unverified accuracy claims |
| `TkxAIConfidenceBar` | Display widget for model-confidence values |
| `TkxAIThinking` | Animated "thinking" dots for chat surfaces |
| `TkxAIChatBubble` | Single chat-message bubble — overlaps `TkxChat`; prefer `TkxChat` for new code |

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

## Internationalisation (44 locales)

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
import { sanitizeString, escapeHTML, sanitizeProps, contrastRatio, meetsAA, meetsAAA } from 'tekivex-ui/headless';

// Text sanitisation (called automatically inside every component).
// Control characters are stripped; visible text is preserved verbatim,
// because React escapes text children and attributes when it renders.
sanitizeString('Review & ATS');            // → 'Review & ATS'
sanitizeString('<script>alert(1)</script>'); // → unchanged, rendered as inert text

// Escaping for a real HTML sink (innerHTML, template strings, non-React
// renderers) is a separate, explicit call — never apply it to React text.
escapeHTML('<script>alert(1)</script>');
// → '&lt;script&gt;alert(1)&lt;/script&gt;'

// WCAG contrast checking
const ratio = contrastRatio('#00f5d4', '#0a0a1a'); // → 8.21
const aa    = meetsAA('#00f5d4', '#0a0a1a');        // → true  (≥ 4.5:1)
const aaa   = meetsAAA('#00f5d4', '#0a0a1a');       // → true  (≥ 7:1)
```

**What's unique:**
- 🛡️ **String-prop sanitisation by default** — `sanitizeString` runs on string props across components without opt-in (control-character stripping; React handles text escaping, and `escapeHTML` covers HTML sinks)
- 📋 **Tamper-evident audit trail** — SHA-256 hash-chained append-only log for compliance / SIEM
- 🎨 **Built-in WCAG checker** — `contrastRatio()`, `meetsAA()`, `meetsAAA()` available anywhere

---

## Accessibility

We ship **WCAG 2.1 AA with WAI-ARIA APG patterns throughout**, and work toward AAA as a tracked aspiration. **A third-party audit is on the roadmap and has not been completed** — treat this section as our internal compliance target, not a certification.

In July 2026 we ran an adversarially-verified internal audit of every interactive component against its APG pattern. It confirmed **35 violations** (4 high, 26 medium, 5 low) — published in full in [`docs/A11Y-AUDIT.md`](docs/A11Y-AUDIT.md) — and **all 35 were fixed across v3.29.0–v3.32.0** with regression tests (suite: 2,058 → 2,168 tests). Highlights: focus traps + focus restore in every dialog surface, full keyboard models for DataGrid (roving tabindex, virtualization-aware navigation) and DatePicker (roving calendar grid), real ARIA sliders in ColorPicker, correct menu semantics in Dropdown, and `inert` off-screen carousel slides. Details on the [Accessibility docs page](https://ui.tekivex.com/docs/accessibility/).

- ✅ Contrast ratio ≥ **7:1** for all text (AAA, not just AA's 4.5:1) — verified via internal `meetsAAA()` helper
- ✅ Full **keyboard navigation** — Tab, Enter, Space, Arrow keys, Escape (APG-audited)
- ✅ Correct **ARIA roles, states & properties** (WAI-ARIA 1.2, APG-audited)
- ✅ **Focus management** — focus trap + focus restore in modals, drawers, palettes, pickers; visible focus rings
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
| Column pinning (left/right) | ✅ | 💰 Pro | ✅ |
| Row grouping + aggregations | ✅ | 💰 Pro | 💰 Enterprise |
| Tree data / hierarchical rows | ✅ | 💰 Pro | 💰 Enterprise |
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
git clone https://ui.tekivex.com
cd tekivex-ui
npm install

# Build the library
npm run build

# Run all 1798 tests
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
90 dedicated component test files · 1798 tests · 0 failures · 1 todo
Coverage: 64.84% lines · 51.10% functions · 56.77% branches · 61.41% statements (ratchet enforced in CI)
```

Coverage includes dedicated unit tests for 88 of 116 production components plus smoke coverage for the rest, 7 chart types, headless hooks (incl. useWebSocket / useSSE / useMediaQuery), the TKX CSS engine, the WCAG engine, the security (Shield) engine, the i18n provider, and Indian KYC validators (Aadhaar Verhoeff, PAN, Voter ID, DL).

Coverage thresholds are enforced as a CI ratchet in `vitest.config.ts` — the floor never drops between releases. Path to 90/90/85 is documented in [`docs/test-coverage-roadmap.md`](./docs/test-coverage-roadmap.md).

---

## Roadmap

Full roadmap with version targets, owners, and definition-of-done at
**[`docs/ROADMAP.md`](./docs/ROADMAP.md)**.

**Nearest milestones:**

- **v3.18** (target 2026-07-15) — *"Land the audit + first partner."* Sign
  a third-party WCAG audit SOW (Deque / TPGi / WebAIM), land 1 design-partner
  logo, lift `TkxDataGrid` to 50+ tests. No new components.
- **v3.19** (target 2026-09-01) — *"Coverage + DataGrid completeness."*
  Ratchet coverage 64.84% → 75% lines, ship DataGrid column-pinning and
  row-grouping, deep-test `TkxSelect`, `TkxDatePicker`, `TkxMenu`,
  `TkxOrgChart`, `TkxTreeView`.
- **v3.20** (target 2026-10-15) — *"Forms + i18n depth."* Zod + Valibot
  resolvers for `TkxForm`, RHF adapter, drop hardcoded-string count below
  100, ship 9 new locales (35 → 44).
- **v3.21** (target 2026-12-01) — *"Charts + visualizations."* New
  `TkxHeatmap`, `TkxFunnelChart`, `TkxTreemap`, `TkxGauge`, `TkxSparkline`.
- **v4.0** (target 2026-12 to 2027-Q1) — *"Stable."* Third-party AAA VPAT
  published, 90/90/85 coverage, 70+ locales, 5 published case studies,
  React 19 required, codemod for the v3 → v4 migration.

[Read the full plan, what we WILL NOT do, and how to propose changes →
`docs/ROADMAP.md`](./docs/ROADMAP.md)

---

## Bug Reports & Issues

Found a bug or have a feature request? Please open an issue on our dedicated issue tracker:

**👉 [github.com/007krcs/tekivex-ui/issues](https://github.com/007krcs/tekivex-ui/issues)**

When reporting, please include:
- tekivex-ui version (`npm list tekivex-ui`)
- React version
- Browser / Node version
- A minimal reproduction (CodeSandbox or code snippet)

---

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) before submitting a PR.

**Maintainers:** [007krcs](https://ui.tekivex.com) · [seemaalmas](https://ui.tekivex.com) · [novaai0401-ui](https://ui.tekivex.com)

---

## License

[MIT](./LICENSE) © 2026 [007krcs](https://ui.tekivex.com)

---

<div align="center">

Made with ⚡ by the TekiVex team

**[npm](https://www.npmjs.com/package/tekivex-ui) · [GitHub](https://ui.tekivex.com) · [Docs](https://ui.tekivex.com)**

</div>
