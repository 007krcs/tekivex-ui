# 3D Avatar

`TkxAvatar3D` is a stylised humanoid avatar built from primitive
geometry — head, eyes, jaw, body, arms — animated through three
discrete states. **No FBX / glTF asset shipped**, **no texture
downloads**, ~zero install footprint.

## Drop-in

```tsx
import { TkxScene, TkxAvatar3D } from 'tekivex-3d';

<TkxScene cameraPosition={[0, 1.4, 3.5]}>
  <TkxAvatar3D state="talk" accent="#7b8eff" />
</TkxScene>
```

## States

| State    | What animates                                                |
| -------- | ------------------------------------------------------------ |
| `idle`   | Gentle 0.4 Hz body bob, periodic 0.16-second eyelid blinks   |
| `talk`   | Jaw drops at ~3 Hz, slight head bob — looks like a speaker   |
| `cheer`  | Arms go up, ~1.5 Hz vertical bounce — celebrate / win state  |

Toggle the `state` prop to switch animations live; the component
re-attaches its frame loop on prop change without flickering.

## Visual composition

- **Head** — sphere, skin-toned material (default warm beige `#e8c39e`)
- **Eyes** — two dark spheres, sit in front of the face
- **Eyelids** — Y-scale animated to 0 most of the time, pop to 1 for a blink
- **Mouth** — flattened sphere; Y-scale animates with jaw open / close
- **Body** — capsule, accent-colored
- **Arms** — capsule sleeves + sphere hands; rotate around the shoulder
- **Halo** (optional, `halo` prop) — additive-blended torus above the head

## Props

| Prop         | Type                       | Default       | Notes                                           |
| ------------ | -------------------------- | ------------- | ----------------------------------------------- |
| `position`   | `[number, number, number]` | `[0,0,0]`     | World-space position                            |
| `scale`      | `number`                   | `1`           | Overall multiplier                              |
| `rotation`   | `number`                   | `0`           | Y-axis rotation in radians (0 = facing camera) |
| `state`      | `'idle'\|'talk'\|'cheer'` | `'idle'`      | Animation state                                 |
| `accent`     | `string`                   | `'#00f5d4'`   | Body / sleeve color                             |
| `skinTone`   | `string`                   | `'#e8c39e'`   | Head + arms                                     |
| `halo`       | `boolean`                  | `false`       | Show a glowing halo                             |
| `haloColor`  | `string`                   | `accent`      | Halo color when shown                           |
| `speed`      | `number`                   | `1`           | Animation speed multiplier                      |

## Why procedural?

Most React UI apps don't want to ship 80 KB of FBX, set up DRACO
compression, fetch textures from a CDN, and worry about license
attribution — they want a friendly figure on the page. `TkxAvatar3D`
covers that 90% case with primitives that ship inside the bundle as
~3 KB of TypeScript.

Apps that need photorealistic avatars should compose `TkxModel3D` with
their own glTF — the loading + auto-fit pipeline is already there.

## Test coverage

6 module-surface tests covering export shape, prop typing, and the
`useScene()` hook contract. Per the package policy, **the rendered
output is covered by Playwright** (`tests/visual/`) because jsdom
cannot create a WebGL context. See `packages/tekivex-3d/PRIMITIVES.md`
for the full rationale.

## Pairs naturally with

- `TkxStarfield` for a "spaceship pilot" backdrop
- `TkxHolographicPanel` next to the avatar for "AI assistant" UIs
- `TkxXRSession` so the avatar appears in front of the user in VR
