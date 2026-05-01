# 3D Portal

`TkxPortal3D` is a clickable luminous portal that fades to a different
scene. Pairs with the Galaxy Map example to navigate between worlds.

## Drop-in

```tsx
import { TkxScene, TkxPlanet, TkxPortal3D } from 'tekivex-3d';

<TkxScene>
  <TkxPlanet position={[0, 0, 0]} radius={1.5} />

  <TkxPortal3D
    position={[3, 0, -4]}
    label="Cygnus Prime"
    accent="#ffbe0b"
    onEnter={() => router.push('/cygnus')}
  />
</TkxScene>
```

## Visual

- Outer luminous oval **ring** (color = `accent`)
- Inner **shimmer disc** with animated swirl bands (radial gradient)
- Outer **glow halo** (additive blending, soft falloff)
- Optional **billboarded HTML label** below the portal — projects from
  graph-space to screen-space each frame so the label stays anchored

## Behavior

- **Hover / click** → starts the fade-out animation (default 1200 ms total)
- At the apex of the fade (50% through), `onEnter()` fires once — this is
  where the consumer typically navigates to a new route or swaps the
  scene's content.
- The portal fades back in over the second half so revisits feel smooth.

## Props

| Prop            | Type                       | Default       | Notes                                              |
| --------------- | -------------------------- | ------------- | -------------------------------------------------- |
| `position`      | `[number, number, number]` | required      | World-space position                               |
| `radius`        | `number`                   | `1`           | Outer ring radius                                  |
| `aspect`        | `number`                   | `1.4`         | height / width — taller than wide                  |
| `accent`        | `string`                   | `'#00f5d4'`   | Ring + label color                                 |
| `innerColor`    | `string`                   | `'#0c0d20'`   | Shimmer disc base                                  |
| `label`         | `string`                   | —             | HTML label below the portal                        |
| `faceCamera`    | `boolean`                  | `true`        | Auto-rotate to face the camera                     |
| `onEnter`       | `() => void`               | —             | Fired at the fade apex                             |
| `transitionMs`  | `number`                   | `1200`        | Total fade-out + fade-in duration                  |

## Test coverage

5 tests cover the React surface (component is exported, prop shape,
hook contract). Per the package's standing policy, **tekivex-3d
components defer their visual coverage to Playwright** because jsdom
cannot create a WebGL context — three.js's `WebGLRenderer` constructor
throws inside vitest. See `tests/visual/` for the Chromium-driven
visual regression suite that covers the rendered output.

## Pairs naturally with

- `TkxStarfield` + `TkxParticleField` for the cosmic backdrop
- `TkxPlanet` + `TkxOrbitPath` for orbiting destinations
- `TkxHolographicPanel` for an info card that opens after `onEnter()` fires
