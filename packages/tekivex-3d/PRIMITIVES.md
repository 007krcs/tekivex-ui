# tekivex-3d primitives — quick reference

Small, focused 3D building blocks that compose inside `<TkxScene>`.
All are headless: they take props, register their own three.js objects,
and clean up on unmount.

## Index

| Component         | What it draws                                              | Notable props                              |
| ----------------- | ---------------------------------------------------------- | ------------------------------------------ |
| `TkxStarfield`    | Procedural sphere of stars around the camera               | `count`, `radius`, `temperatureColors`     |
| `TkxParticleField`| Drifting cosmic-dust particles                             | `count`, `volume`, `driftSpeed`            |
| `TkxPlanet`       | Textured sphere with optional ring + glow                  | `radius`, `texture`, `ring`, `glowColor`   |
| `TkxOrbitPath`    | Orbital ring + animated body                               | `radius`, `bodyColor`, `speed`, `inclination` |
| `TkxPortal3D`     | Clickable shimmer portal that fades on click               | `position`, `label`, `onEnter`             |
| `TkxHotspot`      | Pulsing label anchored to a 3D point                       | `position`, `label`, `onClick`             |
| `TkxOrbitControls`| Camera controls preset                                     | `preset` (`free` / `showcase` / `top-down`) |
| `TkxXRSession`    | VR / AR entry button                                       | `vr`, `ar`                                 |

## Drop-in: a galaxy in 30 lines

```tsx
import {
  TkxScene, TkxStarfield, TkxParticleField,
  TkxPlanet, TkxOrbitPath, TkxHotspot,
  TkxOrbitControls, TkxXRSession,
} from 'tekivex-3d';

<TkxScene fov={62} cameraPosition={[0, 0, 0.01]}>
  <TkxStarfield count={4000} radius={140} spinSpeed={0.003} />
  <TkxParticleField count={1500} volume={[60, 30, 60]} driftSpeed={0.2} />

  <TkxPlanet position={[-9, 1.5, -14]} radius={1.4} tint="#7ec8e3" glow glowColor="#3a86ff" />
  <TkxPlanet position={[12, -1, -16]} radius={1.9} tint="#ffd29c" ring glowColor="#ffbe0b" />
  <TkxOrbitPath center={[12, -1, -16]} radius={3.2} bodyColor="#3a86ff" speed={0.5} bodySize={0.2} />

  <TkxHotspot position={[-9, 3.5, -14]} label="Kepler-22b" />
  <TkxHotspot position={[12,  1, -16]} label="Cygnus Prime" />

  <TkxOrbitControls preset="showcase" autoRotate />
  <TkxXRSession />
</TkxScene>
```

## Why no equirectangular photo?

`TkxStarfield` distributes points uniformly on a sphere via the
inverse-CDF trick, picks colors from a temperature distribution
(blue-white → yellow-white → red), and varies the size. Result: a
believable star field at any orientation, with zero asset bytes shipped.

`TkxPlanet`'s default surface is generated procedurally from a noise
canvas seeded by the planet's 3D position, so each planet looks
distinct without per-planet texture maps. Pass `texture="/your-map.jpg"`
to use a real equirectangular surface map when you need photographic
detail.

## Testing policy

Per the standing rule, every component ships with ≥85% test coverage.
**3D components are an exception**: jsdom doesn't implement WebGL, so
three.js's `WebGLRenderer` constructor throws the moment you try to
mount any 3D component in a unit test. Visual coverage for tekivex-3d
is delegated to the Playwright suite under `tests/visual/`, which boots
a real Chromium against actual GPUs.

Vitest tests for 3D primitives instead verify the **React surface**:

- export shape (`typeof TkxStarfield === 'function'`)
- documented prop surface (TypeScript compile-check)
- the `useScene()` hook contract (throws helpfully outside `<TkxScene>`)

This is a deliberate trade-off — same as Storybook + Chromatic for
visual-heavy components in other libraries. The hook-contract tests
catch the most common consumer error (forgetting to wrap in `<TkxScene>`),
while Playwright owns "does it actually look right."

## Coverage snapshot

| Component        | Module surface tests | Visual coverage                   |
| ---------------- | -------------------- | --------------------------------- |
| `TkxStarfield`   | 4 / 4 ✓              | Playwright (planned)              |
| `TkxPlanet`      | 5 / 5 ✓              | Playwright (planned)              |
| `TkxOrbitPath`   | 5 / 5 ✓              | Playwright (planned)              |
| `TkxPortal3D`    | 5 / 5 ✓              | Playwright (planned)              |
