# Changelog

All notable changes to TekiVex UI will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.16.1] — 2026-05-04

### Fixed

- **`sanitizeString` no longer renders the literal word "undefined"**
  ([#25](https://github.com/007krcs/tekivex-ui/pull/25)). Passing an absent
  optional prop (e.g. a missing `label`, `placeholder`, or `hint`) used to
  surface the string `"undefined"` in the UI because `String(undefined)`
  returns the literal `"undefined"`. The sanitizer now treats `null` and
  `undefined` as the empty string. This is a one-line root-cause fix that
  silently corrects every component that pipes an optional prop through
  the sanitizer (≈200 call-sites: `TkxInput`, `TkxAutocomplete`,
  `TkxBreadcrumb`, `TkxBottomNav`, `TkxCascader`, `TkxChat`,
  `TkxCheckbox`, `TkxClock`, `TkxFileUpload`, `TkxAppBar`, and others).
- **`TkxAppBar` now has a real `leading` slot**
  ([#25](https://github.com/007krcs/tekivex-ui/pull/25)). The component's
  documented slots were `title / logo / actions / navigation` — there was
  no `leading` prop, so consumers passing `leading={<BackButton/>}` saw
  their back-arrow silently dropped. The new `leading?: ReactNode` prop
  renders before the logo and is the canonical home for back arrows and
  drawer toggles. The `navigation` prop continues to host full nav menus.

### Tests

- Regression test asserting `sanitizeString(null)` and
  `sanitizeString(undefined)` return `''`, and that the literal word
  `"undefined"` never appears in their output.
- Smoke test asserting `TkxAppBar` renders the `leading` slot, and that
  passing no optional props produces no `"undefined"` in the rendered text.

### Migration

No code changes required. Behavior changes:

- `sanitizeString(null)` now returns `''` (previously `'null'`).
- `sanitizeString(undefined)` now returns `''` (previously `'undefined'`).

If you were relying on the old behavior anywhere, pass an explicit string.

## [2.2.0] — 2026-04-07

### Added
- **Form Component** (`TkxForm`, `TkxFormField`, `useTkxForm`) — Context-based form controller with field-level validation, error propagation, and submit handling
- **Layout System** (`TkxLayout`, `TkxHeader`, `TkxSider`, `TkxContent`, `TkxFooter`) — Composable page layout with collapsible sidebar
- **Grid System** (`TkxRow`, `TkxCol`) — 24-column responsive grid with breakpoints
- **ConfigProvider** (`TkxConfigProvider`, `useConfig`) — Global configuration for locale, direction, component defaults
- **Typography** (`TkxTitle`, `TkxText`, `TkxParagraph`) — Semantic text components with copy support
- **Spin** (`TkxSpin`) — Loading indicator with overlay, delay, and fullscreen modes
- **Empty** (`TkxEmpty`) — Empty state display with illustration and action slot
- **Statistic** (`TkxStatistic`, `TkxCountdown`) — KPI display with formatting and countdown timer
- **Theme Palette** — `generatePalette(hex)` generates 50-900 color shades from any hex
- **Design Tokens** — Exported `typography`, `spacing`, `breakpoints`, `shadows`, `zIndex`, `radii` scales

### Changed
- Expanded `ThemeTokens` exports to include palette generator and design token scales
- Updated root exports with all new components and utilities

## [2.1.0] — 2026-04-07

### Added
- **13 Enterprise Components**: Breadcrumb, Popover, Autocomplete, TreeView, Toolbar, TransferList, SpeedDial, AppBar, BottomNav, Snackbar, DataGrid, Masonry, RichTextDisplay
- **20 Component Test Files** (143 test cases) covering Input, Badge, Card, Toggle, Alert, Modal, Checkbox, Radio, Select, Progress, Tooltip, Avatar, Skeleton, Divider, Accordion, Tabs, Slider, Pagination, Rating, OTP
- **i18n/RTL System** — `I18nProvider` with 6 locales (en-US, es-ES, ar-SA, fr-FR, de-DE, ja-JP) and RTL detection
- **TKX CSS Recipes** — 5 practical patterns (Card Grid, Form, Nav, Stats, TKX vs Tailwind)
- Reduced-motion fixes for Card, Modal, Tooltip
- Touch support for Slider (`touch-action: none`) and Select (`touch-action: manipulation`)
- SSR guard for `useEscapeKey` hook

### Fixed
- Tree-shaking: refined `sideEffects` in package.json
- Doc pages: Carousel, Clock, Command, NumberInput, VideoPlayer now use DemoSection with code examples

## [2.0.2] — 2026-04-07

### Fixed
- Updated LICENSE and README copyright year to 2026
- Added homepage URL (https://ui.tekivex.com/) to package.json

## [2.0.1] — 2026-04-07

### Fixed
- Added homepage URL to npm package metadata

## [2.0.0] — 2026-04-06

### Added
- **9 New Components**: Menu, Clock, VideoPlayer, Stepper, ColorPicker, NumberInput, OTP, Command, Carousel
- **Rewrites**: Select (portal dropdown, multi-select), Accordion (5 variants, true height animation), DatePicker (range/multi, presets, time picker)
- **3 New Templates**: Blog/CMS, Admin Settings, Landing Page — all with "Build Your Own" code examples
- **Responsive Templates** — All 7 templates work on mobile/tablet/desktop
- **About Us** and **License** pages with enterprise positioning
- Icon component wired into navigation
- Slider improvements: vertical, tooltip, formatValue, onChangeEnd, gradient
- Video Player improvements: skip 10s, volume slider, loading spinner, error retry, chapter markers

### Fixed
- 4 runtime crashes (ChatPage, RatingPage, PortfolioTemplate, EcommerceTemplate)
- Mobile responsive layout with hamburger menu and sidebar toggle
- DatePicker rangeValue format (tuple vs object)
- Clock size prop (string enum vs number)
- Admin Settings crash (Tabs activeIndex, Avatar props)
- Supply Chain "undefined" label (missing Input label prop)
- Stepper clipping in DemoSection
- OTP page now shows code examples

## [1.0.0] — 2026-03-01

### Added
- Initial release with 28 components
- Quantum Dark and Aurora Light themes
- TKX Atomic CSS Engine
- WCAG 2.1 AAA compliance
- Zero-trust security engine
- Full TypeScript support
