# tekivex-3d

> True WebGL 3D + 360° + AR/VR components for tekivex-ui apps. Vanilla three.js peer dep, no React-Three-Fiber, no extra reconciler.

```bash
npm install tekivex-3d three
```

## What's in here (5 components, all production-ready)

| Component | What it does |
|---|---|
| `TkxScene` | Foundation — theme-aware WebGL canvas + camera + lights + animation loop. Optional WebXR mode. |
| `TkxCard3D` | Real geometry 3D card with PBR material, cursor-tracked rotation, click handler, optional auto-rotate. |
| `TkxPanorama360` | Equirectangular 360° photo / video viewer with drag-pan, scroll zoom, optional gyroscope. |
| `TkxHotspot` | Billboarded clickable annotation with HTML label that always projects to screen-space. |
| `TkxXRSession` | Auto-detects WebXR support and renders the appropriate Enter VR / Enter AR button. |

## 30-second quickstart

```tsx
import { TkxScene, TkxCard3D } from 'tekivex-3d';

export default function Hero() {
  return (
    <div style={{ width: '100%', height: 600 }}>
      <TkxScene>
        <TkxCard3D
          texture="/poster.jpg"
          autoRotate={0.4}
          maxTilt={0.4}
          onClick={() => console.log('clicked!')}
        />
      </TkxScene>
    </div>
  );
}
```

## 360° website (replaces Marzipano)

A multi-room 360° tour built with `<TkxPanorama360>` + `<TkxHotspot>`:

```tsx
import { useState } from 'react';
import { TkxScene, TkxPanorama360, TkxHotspot } from 'tekivex-3d';

const ROOMS = {
  lobby: { src: '/360/lobby.jpg', hotspots: [
    { label: 'Living room →',  pos: [10, 0, 0] as const,   to: 'living' },
    { label: 'Kitchen →',      pos: [0, 0, -10] as const,  to: 'kitchen' },
  ]},
  living: { src: '/360/living.jpg', hotspots: [
    { label: '← Back to lobby', pos: [-10, 0, 0] as const, to: 'lobby' },
  ]},
  kitchen: { src: '/360/kitchen.jpg', hotspots: [
    { label: '← Back to lobby', pos: [0, 0, 10] as const,  to: 'lobby' },
  ]},
};

export default function VirtualTour() {
  const [room, setRoom] = useState<keyof typeof ROOMS>('lobby');
  const r = ROOMS[room];
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <TkxScene fov={75}>
        <TkxPanorama360 src={r.src} gyro />
        {r.hotspots.map((h) => (
          <TkxHotspot
            key={h.to}
            position={h.pos}
            label={h.label}
            onClick={() => setRoom(h.to as keyof typeof ROOMS)}
          />
        ))}
      </TkxScene>
    </div>
  );
}
```

That's a complete immersive tour in ~30 lines. No Marzipano (~400 KB), no Pannellum, no krpano licence.

## AR + VR (WebXR)

```tsx
import { TkxScene, TkxCard3D, TkxXRSession } from 'tekivex-3d';

export default function VRGallery() {
  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <TkxScene xr>
        <TkxCard3D position={[-2, 0, -3]} texture="/painting1.jpg" />
        <TkxCard3D position={[ 0, 0, -3]} texture="/painting2.jpg" />
        <TkxCard3D position={[ 2, 0, -3]} texture="/painting3.jpg" />
        <TkxXRSession
          vr ar
          onSessionStart={(mode) => console.log(`entered ${mode}`)}
        />
      </TkxScene>
    </div>
  );
}
```

The XR button auto-detects support:

| Device | Buttons shown |
|---|---|
| Meta Quest 3 / Vision Pro | **Enter VR** + **Enter AR** (passthrough) |
| Pixel / Galaxy with ARCore | **Enter AR** only |
| iPhone | (neither — Safari has no WebXR yet, falls back to drag/zoom) |
| Desktop Chrome | (hidden) |

## Why not React-Three-Fiber?

R3F is a great library. We chose vanilla three.js + an imperative `useScene()` context for three reasons:

1. **Smaller install.** R3F adds ~50 KB minified plus a parallel reconciler. tekivex-3d adds ~6 KB on top of three.js itself.
2. **WebXR is easier.** R3F's XR addon requires `@react-three/xr` (another ~80 KB). We use `renderer.xr.enabled` directly.
3. **Composability with other three.js code.** If you already use raw three.js for shaders / GPGPU / postprocessing, our context exposes the same `scene`, `camera`, `renderer` refs you'd reach for anyway.

## Component reference

### `<TkxScene>`

| Prop | Type | Default | Notes |
|---|---|---|---|
| `background` | `string \| 'transparent'` | `'#0a0a0f'` | Hex or `'transparent'` for overlay-on-page |
| `fov` | `number` | `50` | Camera field of view in degrees |
| `cameraPosition` | `[x, y, z]` | `[0, 0, 5]` | Initial camera position |
| `shadows` | `boolean` | `true` | Enable PCF soft shadows |
| `antialias` | `boolean` | `true` | MSAA |
| `xr` | `boolean` | `false` | Enable WebXR animation loop |

### `<TkxCard3D>`

| Prop | Type | Default |
|---|---|---|
| `size` | `[w, h]` | `[3, 4]` |
| `depth` | `number` | `0.05` |
| `position` | `[x, y, z]` | `[0, 0, 0]` |
| `color` | hex string | `'#00f5d4'` |
| `texture` | URL | (none) |
| `backColor` | hex string | `'#1a1a2e'` |
| `maxTilt` | radians | `0.35` |
| `autoRotate` | rad/sec | `0` |
| `roughness` | `0..1` | `0.3` |
| `metalness` | `0..1` | `0.7` |
| `onClick` | `() => void` | — |

### `<TkxPanorama360>`

| Prop | Type | Default |
|---|---|---|
| `src` | image URL (2:1 equirect) | required |
| `initialYaw` | radians | `0` |
| `dragSensitivity` | `number` | `0.005` |
| `fovRange` | `[min, max]` deg | `[30, 90]` |
| `zoom` | `boolean` | `true` |
| `gyro` | `boolean` | `false` |
| `fadeMs` | `number` | `600` |

### `<TkxHotspot>`

| Prop | Type | Default |
|---|---|---|
| `position` | `[x, y, z]` | required |
| `onClick` | `() => void` | — |
| `label` | `ReactNode` | — |
| `color` | hex | `'#00f5d4'` |
| `size` | scene units | `0.3` |
| `pulseSpeed` | rad/sec, `0` to disable | `1` |

### `<TkxXRSession>`

| Prop | Type | Default |
|---|---|---|
| `vr` | `boolean` | `true` |
| `ar` | `boolean` | `true` |
| `arFeatures` | `string[]` | `['hit-test']` |
| `vrFeatures` | `string[]` | `[]` |
| `onSessionStart` | `(mode) => void` | — |
| `onSessionEnd` | `() => void` | — |

## Accessibility

- `<TkxXRSession>` buttons are real `<button>` elements with `aria-label` and 44 px min touch target.
- `<TkxHotspot>` labels are DOM-rendered (not canvas text) so screen readers can read them.
- The WebGL canvas itself is **not** accessible by definition — provide a meaningful `aria-label` on the wrapper `<div>` and a fallback content layer for users who can't see the 3D.
- `prefers-reduced-motion` is honored by `TkxCard3D` (auto-rotate skipped) and `TkxHotspot` (pulse skipped).

## Browser support

| Feature | Chrome | Firefox | Safari | Quest browser |
|---|:---:|:---:|:---:|:---:|
| WebGL 1+2 | ✅ | ✅ | ✅ | ✅ |
| WebXR (VR) | ✅ | ✅ | ❌ (Vision Pro: ✅) | ✅ |
| WebXR (AR) | ✅ Android | ❌ | ❌ (Vision Pro: ✅) | ✅ |
| DeviceOrientation gyro | ✅ | ✅ | ✅ (after permission) | ✅ |

## License

MIT
