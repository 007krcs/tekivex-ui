// ─────────────────────────────────────────────────────────────────────────────
// tekivex-3d — true WebGL 3D + 360° + AR/VR for tekivex-ui
//
// Public surface — every component composes inside <TkxScene>:
//
//   <TkxScene xr>
//     <TkxCard3D position={[0, 0, 0]} texture="/cover.jpg" autoRotate={0.5} />
//     <TkxPanorama360 src="/360.jpg" gyro />
//     <TkxHotspot position={[2, 0, -3]} label="Living room" onClick={...} />
//     <TkxXRSession ar vr onSessionStart={(m) => console.log('entered', m)} />
//   </TkxScene>
//
// Peer dependencies (you install these):
//   npm install three react react-dom tekivex-ui
//
// No React-Three-Fiber — vanilla three.js, smaller install, direct WebXR
// access. Components register imperatively via useScene() context.
// ─────────────────────────────────────────────────────────────────────────────

export { TkxScene, useScene } from './Scene';
export type { TkxSceneProps, SceneContextValue } from './Scene';

export { TkxCard3D } from './Card3D';
export type { TkxCard3DProps } from './Card3D';

export { TkxPanorama360 } from './Panorama360';
export type { TkxPanorama360Props } from './Panorama360';

export { TkxHotspot } from './Hotspot';
export type { TkxHotspotProps } from './Hotspot';

export { TkxXRSession } from './XRSession';
export type { TkxXRSessionProps } from './XRSession';

export { TkxModel3D } from './Model3D';
export type { TkxModel3DProps } from './Model3D';
