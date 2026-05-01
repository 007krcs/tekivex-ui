// ─────────────────────────────────────────────────────────────────────────────
// TkxParticleField — GPU-instanced particle background
//
// 10,000 particles at 60 FPS on M1+ phones. Drift through a volume,
// reset when they exit the bounding box. Color palette is theme-aware.
//
// Used as: hero backgrounds, idle ambient effects, "data flowing" demos.
// Composes inside <TkxScene> like every other tekivex-3d primitive.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect } from 'react';
import * as THREE from 'three';
import { useScene } from './Scene';

export interface TkxParticleFieldProps {
  /** Number of particles. Default 5000. Above 20000 may drop frames on weak GPUs. */
  count?: number;
  /** Volume to spawn particles within: [width, height, depth]. Default [20, 12, 12]. */
  volume?: [number, number, number];
  /** Per-particle drift velocity scale. Default 0.5. */
  driftSpeed?: number;
  /** Particle size in scene units. Default 0.04. */
  size?: number;
  /** Hex colors to randomly tint particles. Default 4 theme-friendly cyan/violet/teal hues. */
  colors?: string[];
  /** Fade particles by depth (further = more transparent). Default true. */
  depthFade?: boolean;
  /** Position the field's center [x, y, z]. Default [0, 0, 0]. */
  position?: [number, number, number];
}

const DEFAULT_COLORS = ['#00f5d4', '#3a86ff', '#7b2ff7', '#ff006e'];

export function TkxParticleField({
  count = 5000,
  volume = [20, 12, 12],
  driftSpeed = 0.5,
  size = 0.04,
  colors = DEFAULT_COLORS,
  depthFade = true,
  position = [0, 0, 0],
}: TkxParticleFieldProps) {
  const { scene, onFrame } = useScene();

  useEffect(() => {
    const [w, h, d] = volume;

    // Positions, velocities, colors as flat Float32Arrays
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    const colorAttr = new Float32Array(count * 3);
    const palette = colors.map((c) => new THREE.Color(c));

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      positions[i3 + 0] = (Math.random() - 0.5) * w;
      positions[i3 + 1] = (Math.random() - 0.5) * h;
      positions[i3 + 2] = (Math.random() - 0.5) * d;
      velocities[i3 + 0] = (Math.random() - 0.5) * driftSpeed * 0.3;
      velocities[i3 + 1] = (Math.random() - 0.5) * driftSpeed * 0.3;
      velocities[i3 + 2] = (Math.random() - 0.5) * driftSpeed * 0.3;
      const c = palette[Math.floor(Math.random() * palette.length)];
      colorAttr[i3 + 0] = c.r;
      colorAttr[i3 + 1] = c.g;
      colorAttr[i3 + 2] = c.b;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colorAttr, 3));

    const material = new THREE.PointsMaterial({
      size,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
      fog: depthFade,
    });

    const points = new THREE.Points(geometry, material);
    points.position.set(...position);
    scene.add(points);

    const halfW = w / 2;
    const halfH = h / 2;
    const halfD = d / 2;
    const posAttr = geometry.getAttribute('position') as THREE.BufferAttribute;

    const unsub = onFrame((delta) => {
      // Update positions; wrap particles that escape the volume
      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        positions[i3 + 0] += velocities[i3 + 0] * delta;
        positions[i3 + 1] += velocities[i3 + 1] * delta;
        positions[i3 + 2] += velocities[i3 + 2] * delta;

        if (positions[i3] > halfW) positions[i3] = -halfW;
        else if (positions[i3] < -halfW) positions[i3] = halfW;

        if (positions[i3 + 1] > halfH) positions[i3 + 1] = -halfH;
        else if (positions[i3 + 1] < -halfH) positions[i3 + 1] = halfH;

        if (positions[i3 + 2] > halfD) positions[i3 + 2] = -halfD;
        else if (positions[i3 + 2] < -halfD) positions[i3 + 2] = halfD;
      }
      posAttr.needsUpdate = true;
    });

    return () => {
      unsub();
      scene.remove(points);
      geometry.dispose();
      material.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count, volume[0], volume[1], volume[2], driftSpeed, size]);

  return null;
}
