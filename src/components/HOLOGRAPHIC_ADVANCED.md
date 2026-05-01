# TkxHolographicAdvanced — extended family reference

Builds on the base TkxHolographic primitives with four higher-level
patterns that come up in HUDs / mission-control / dashboard layouts.

| Component                | Best for                                                       |
| ------------------------ | -------------------------------------------------------------- |
| `TkxHolographicPanel`    | Multi-section card (header + body + footer + optional tabs)    |
| `TkxHolographicGauge`    | Circular 0–100 readout with iridescent fill                    |
| `TkxHolographicProgress` | Linear progress bar with shimmer fill                          |
| `TkxHolographicTerminal` | Scrolling monospaced log with type-on + blinking cursor        |

All four reuse the holographic CSS injected by `TkxHolographic`. Call
`injectHolographicStyles()` once on the page (the components do this for
you on first render) and the foil shader is live.

## Drop-in

```tsx
import {
  TkxHolographicPanel,
  TkxHolographicGauge,
  TkxHolographicProgress,
  TkxHolographicTerminal,
  TkxHolographicBadge,
  TkxHolographicButton,
} from 'tekivex-ui';

<TkxHolographicPanel
  accent="#00f5d4"
  header={<><h3>Reactor core</h3><TkxHolographicBadge tone="success">stable</TkxHolographicBadge></>}
  footer={<TkxHolographicButton>SCRAM</TkxHolographicButton>}
>
  <TkxHolographicGauge value={fuel}    caption="fuel" />
  <TkxHolographicGauge value={output}  caption="output"  accent="#3a86ff" />
  <TkxHolographicGauge value={thermal} caption="thermal" />

  <TkxHolographicProgress label="Coolant pressure" value={oxygen / 100} />
  <TkxHolographicProgress label="Shield integrity" value={shield} accent="#7b2ff7" />
</TkxHolographicPanel>

<TkxHolographicTerminal lines={log} typeSpeed={8} />
```

## Accessibility

- `TkxHolographicGauge` uses `role="meter"` with `aria-valuenow`,
  `aria-valuemin`, `aria-valuemax`, and an auto-formatted
  `aria-valuetext` you can override via the `ariaValueText` prop.
- `TkxHolographicProgress` uses `role="progressbar"` with the same
  three ARIA value attributes (mapped from the 0–1 fraction).
- `TkxHolographicTerminal` uses `role="log"` and `aria-live="polite"`
  so new lines are announced to screen readers without interrupting.
- `TkxHolographicPanel`'s tab strip uses the standard `role="tablist"
  / role="tab"` pattern with `aria-selected`.

## Test coverage

| Metric     | Target | Actual    |
| ---------- | ------ | --------- |
| Lines      | ≥ 85%  | **93.1%** |
| Functions  | ≥ 85%  | **94.11%**|
| Statements | ≥ 85%  | **90.62%**|
| Branches   | ≥ 85%  | **88.88%**|
| Tests      | —      | **28**    |

Coverage from `tests/TkxHolographicAdvanced.test.tsx` against the
v8 provider. All four components are pure DOM (no canvas), so they
unit-test cleanly in jsdom — including `TkxHolographicTerminal`'s
type-on animation via `vi.useFakeTimers()`.

## Worked example

`examples/holographic-universe/MissionControl.tsx` composes all four
into a complete sci-fi mission-control HUD with live telemetry, a
streaming event log, and command buttons. README walkthrough at
`examples/holographic-universe/README.md`.
