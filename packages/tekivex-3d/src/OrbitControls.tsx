// ─────────────────────────────────────────────────────────────────────────────
// TkxOrbitControls — preset camera controls (orbit / dolly / pan)
//
// Wraps three.js OrbitControls from `three/examples/jsm/controls/OrbitControls`
// and tracks dampening via the scene's per-frame loop, so you don't have to
// remember to call controls.update() manually.
//
// Composes inside <TkxScene>. Mount with no props for sensible defaults:
//
//   <TkxScene>
//     <TkxModel3D src="/hero.glb" />
//     <TkxOrbitControls />
//   </TkxScene>
//
// Three modes via presets:
//   - "free"   (default) — orbit + dolly + pan, full freedom
//   - "showcase"          — auto-rotate, no pan, locked polar angle
//   - "top-down"          — fixed polar angle, pan only (map-style)
//
// All preset values can be overridden via individual props.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect } from 'react';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { useScene } from './Scene';

export type OrbitControlsPreset = 'free' | 'showcase' | 'top-down';

export interface TkxOrbitControlsProps {
  /** Convenience preset that pre-fills the other props. Default 'free'. */
  preset?: OrbitControlsPreset;
  /** Enable smooth inertia. Default true. */
  enableDamping?: boolean;
  /** Damping factor when enabled. Default 0.08. */
  dampingFactor?: number;
  /** Allow panning. Default true (false in 'showcase'). */
  enablePan?: boolean;
  /** Allow zooming. Default true. */
  enableZoom?: boolean;
  /** Allow rotation. Default true. */
  enableRotate?: boolean;
  /** Auto-rotate the camera around the target. Default false (true in 'showcase'). */
  autoRotate?: boolean;
  /** Auto-rotate speed (multiplier). Default 2.0. */
  autoRotateSpeed?: number;
  /** Minimum dolly distance. Default 0.1. */
  minDistance?: number;
  /** Maximum dolly distance. Default Infinity. */
  maxDistance?: number;
  /** Minimum polar angle in radians (0 = straight down). Default 0. */
  minPolarAngle?: number;
  /** Maximum polar angle in radians (Math.PI = straight up). Default Math.PI. */
  maxPolarAngle?: number;
  /** Camera target [x, y, z]. Default [0, 0, 0]. */
  target?: [number, number, number];
  /** Fired once on mount with the underlying OrbitControls instance. */
  onReady?: (controls: OrbitControls) => void;
}

const PRESETS: Record<OrbitControlsPreset, Partial<TkxOrbitControlsProps>> = {
  free: {
    enableDamping: true,
    dampingFactor: 0.08,
    enablePan: true,
    enableZoom: true,
    enableRotate: true,
    autoRotate: false,
  },
  showcase: {
    enableDamping: true,
    dampingFactor: 0.12,
    enablePan: false,
    enableZoom: true,
    enableRotate: true,
    autoRotate: true,
    autoRotateSpeed: 1.2,
    minPolarAngle: Math.PI * 0.25,
    maxPolarAngle: Math.PI * 0.75,
  },
  'top-down': {
    enableDamping: true,
    dampingFactor: 0.08,
    enablePan: true,
    enableZoom: true,
    enableRotate: false,
    minPolarAngle: 0,
    maxPolarAngle: 0.001, // pinned straight down
  },
};

export function TkxOrbitControls(props: TkxOrbitControlsProps) {
  const { camera, renderer, onFrame } = useScene();

  useEffect(() => {
    const merged = { ...PRESETS[props.preset ?? 'free'], ...props };

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = merged.enableDamping ?? true;
    controls.dampingFactor = merged.dampingFactor ?? 0.08;
    controls.enablePan = merged.enablePan ?? true;
    controls.enableZoom = merged.enableZoom ?? true;
    controls.enableRotate = merged.enableRotate ?? true;
    controls.autoRotate = merged.autoRotate ?? false;
    controls.autoRotateSpeed = merged.autoRotateSpeed ?? 2.0;
    controls.minDistance = merged.minDistance ?? 0.1;
    controls.maxDistance = merged.maxDistance ?? Infinity;
    controls.minPolarAngle = merged.minPolarAngle ?? 0;
    controls.maxPolarAngle = merged.maxPolarAngle ?? Math.PI;

    if (merged.target) {
      controls.target.set(...merged.target);
    }

    controls.update();
    props.onReady?.(controls);

    // Drive update() through the scene's frame loop so damping + autoRotate
    // animate even when the user isn't dragging.
    const unsub = onFrame(() => {
      controls.update();
    });

    return () => {
      unsub();
      controls.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    props.preset,
    props.enableDamping,
    props.dampingFactor,
    props.enablePan,
    props.enableZoom,
    props.enableRotate,
    props.autoRotate,
    props.autoRotateSpeed,
    props.minDistance,
    props.maxDistance,
    props.minPolarAngle,
    props.maxPolarAngle,
    props.target?.[0],
    props.target?.[1],
    props.target?.[2],
  ]);

  return null;
}
