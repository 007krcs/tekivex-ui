# 360° Universe — Galaxy Map

Six destinations, full WebGL, no equirectangular photos required —
everything is procedural.

## What's in the scene

| Component             | What it does                                                        |
| --------------------- | ------------------------------------------------------------------- |
| `TkxScene`            | Root WebGL canvas; sets up renderer + camera                        |
| `TkxStarfield`        | A 4000-star sphere around the camera (no panorama photo needed)     |
| `TkxParticleField`    | 1500 drifting cosmic-dust particles                                 |
| `TkxPlanet`           | Six destinations, each with procedural surface + atmospheric glow   |
| `TkxOrbitPath`        | Moons orbiting two of the planets (animated body + ring)            |
| `TkxHotspot`          | Clickable label per planet                                          |
| `TkxOrbitControls`    | "showcase" preset — slow auto-orbit + drag to look                  |
| `TkxXRSession`        | VR / AR entry button                                                |
| `TkxHolographicPanel` | Info overlay opens on the right when a hotspot is clicked           |

## Walkthrough

1. **No texture assets.** Every planet uses `TkxPlanet`'s built-in
   procedural texture generator. The seed is derived from the planet's
   3D position so each one looks distinct but renders deterministically.

2. **Camera at the origin.** `cameraPosition={[0, 0, 0.01]}` plus
   `TkxOrbitControls preset="showcase"` puts the user inside the scene
   and slowly rotates the view. Drag overrides the auto-rotate; let go
   and it resumes.

3. **Hotspots float above the sphere.** Each `TkxHotspot` sits at
   `position[1] + radius + 0.6` so the label hovers a bit above the body
   regardless of size.

4. **Holographic info panel.** Click a planet → a `TkxHolographicPanel`
   slides in from the right with description, habitability gauge, three
   progress-bar metrics, and tag pills. ESC closes it.

5. **AR / VR works.** `TkxXRSession` auto-detects WebXR availability and
   renders an entry button — Quest, Vision Pro, ARCore phone all work.

## Drop-in

```tsx
import { GalaxyMap } from './GalaxyMap';

export default function App() {
  return <GalaxyMap />;
}
```
