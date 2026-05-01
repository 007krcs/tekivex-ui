# Holographic Universe — Mission Control

A complete worked example showing every component in the holographic family
composed into a sci-fi mission-control HUD.

## What's in the deck

| Component                  | Used for                                         |
| -------------------------- | ------------------------------------------------ |
| `TkxHolographicSurface`    | The mission-clock pill at the top                |
| `TkxHolographicCard`       | Telemetry cards, crew bios, command bar          |
| `TkxHolographicAvatar`     | Crew portraits                                   |
| `TkxHolographicBadge`      | Tonal status pills (success / info / warning)    |
| `TkxHolographicButton`     | Command actions ("arm burn", "boost comms", …)   |
| `TkxHolographicPanel`      | Reactor core panel + System log panel            |
| `TkxHolographicGauge`      | Three circular reactor metrics                   |
| `TkxHolographicProgress`   | Coolant pressure + Shield integrity bars         |
| `TkxHolographicTerminal`   | The streaming event log                          |

## Walkthrough

1. **One interval drives everything.** `useTelemetry()` runs a single
   `setInterval` that updates oxygen, fuel, signal, hull-temp, and elapsed
   time. Every panel reads from the same state, so metrics never drift
   relative to each other.

2. **Tabular numerals matter.** All numeric readouts use
   `fontVariantNumeric: 'tabular-nums'` plus a monospaced font so the
   digits never jiggle in width as the values tick.

3. **Threshold colors via a small helper.** `levelColor(value, warn, alert, kind)`
   picks cyan / amber / pink based on whether high or low is "good" for
   that metric. Drives both the gauge accent and the telemetry-card
   number color.

4. **Event log is reverse-chronological.** Each command-button click
   prepends an entry, slices to the last five so the log stays readable.

## Drop-in

```tsx
import { MissionControl } from './MissionControl';

export default function App() {
  return <MissionControl />;
}
```

No global state, no theme provider required. Just renders.
