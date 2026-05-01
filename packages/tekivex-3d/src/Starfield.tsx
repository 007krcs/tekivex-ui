// ─────────────────────────────────────────────────────────────────────────────
// TkxStarfield — procedural 3D starfield
//
// A spherical shell of points around the camera that gives "I'm in space"
// without needing an equirectangular photo. Stars vary in size + brightness
// + colour temperature. Optional very-slow rotation gives a parallax feel.
//
// Composes inside <TkxScene>:
//
//   <TkxScene background="#000">
//     <TkxStarfield count={4000} radius={120} />
//   </TkxScene>
//
// Cheaper than TkxParticleField for "background" use because every star
// stays put — no per-frame position updates, just an optional slow rotate.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect } from 'react';
import * as THREE from 'three';
import { useScene } from './Scene';

export interface TkxStarfieldProps {
  /** Number of stars. Default 3000. */
  count?: number;
  /** Sphere radius — should be > camera far/2 to avoid culling. Default 100. */
  radius?: number;
  /** Base point size in scene units. Default 0.5. */
  size?: number;
  /** Random size variance (0..1). Default 0.6. */
  sizeVariance?: number;
  /** Slow Y-rotation, radians/sec. Default 0.005 (~one revolution per 20 minutes). */
  spinSpeed?: number;
  /** Stars span this temperature range — bluish-white to amber. Default true. */
  temperatureColors?: boolean;
}

export function TkxStarfield({
  count = 3000,
  radius = 100,
  size = 0.5,
  sizeVariance = 0.6,
  spinSpeed = 0.005,
  temperatureColors = true,
}: TkxStarfieldProps) {
  const { scene, onFrame } = useScene();

  useEffect(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    // Distribute uniformly on a sphere via the inverse-CDF trick.
    for (let i = 0; i < count; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = 2 * Math.PI * u;
      const phi = Math.acos(2 * v - 1);
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);
      positions[i * 3 + 0] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      // Colour: most stars near-white with a slight blue/red bias.
      let r = 1, g = 1, b = 1;
      if (temperatureColors) {
        const t = Math.random();
        if (t < 0.6) {
          // Mostly white-blue
          const k = 0.85 + Math.random() * 0.15;
          r = k; g = k * 0.95 + 0.05; b = k * 0.85 + 0.15;
        } else if (t < 0.9) {
          // Yellow-white
          r = 1; g = 0.95; b = 0.8;
        } else {
          // Red giant
          r = 1; g = 0.7; b = 0.55;
        }
      }
      // Random brightness
      const brightness = 0.5 + Math.random() * 0.5;
      colors[i * 3 + 0] = r * brightness;
      colors[i * 3 + 1] = g * brightness;
      colors[i * 3 + 2] = b * brightness;

      sizes[i] = size * (1 - sizeVariance + Math.random() * sizeVariance * 2);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size,
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: false,
    });

    const points = new THREE.Points(geometry, material);
    // Render behind everything else.
    points.renderOrder = -1;
    scene.add(points);

    const unsub = onFrame((delta) => {
      if (spinSpeed) points.rotation.y += spinSpeed * delta;
    });

    return () => {
      unsub();
      scene.remove(points);
      geometry.dispose();
      material.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count, radius, size, sizeVariance, spinSpeed, temperatureColors]);

  return null;
}
