// ─────────────────────────────────────────────────────────────────────────────
// TkxPlanet — textured sphere with optional rings + atmosphere glow
//
// Composes inside <TkxScene>. The default look is a procedural noise-style
// surface generated from a noise canvas, which is good enough for "any
// planet" without needing to ship texture assets. Pass `texture` to supply
// your own equirectangular surface map.
//
//   <TkxScene>
//     <TkxPlanet position={[0, 0, -8]} radius={1.6} texture="/mars.jpg" />
//     <TkxPlanet position={[6, 0, -8]} radius={2.0} ring />
//   </TkxScene>
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect } from 'react';
import * as THREE from 'three';
import { useScene } from './Scene';

export interface TkxPlanetProps {
  /** Sphere radius in scene units. Default 1. */
  radius?: number;
  /** World-space position. Default [0, 0, 0]. */
  position?: [number, number, number];
  /** Texture URL (equirectangular). If omitted, a procedural surface is generated. */
  texture?: string;
  /** Tint applied on top of the texture. Default white (no tint). */
  tint?: string;
  /** Auto-rotate on the Y axis, radians/sec. Default 0.1. */
  spinSpeed?: number;
  /** Show a Saturn-style ring. Default false. */
  ring?: boolean;
  /** Ring inner radius factor (× sphere radius). Default 1.4. */
  ringInner?: number;
  /** Ring outer radius factor (× sphere radius). Default 2.2. */
  ringOuter?: number;
  /** Ring tilt (radians). Default 0.4 (~23°). */
  ringTilt?: number;
  /** Atmospheric glow halo. Default true. */
  glow?: boolean;
  /** Glow color. Default cyan. */
  glowColor?: string;
}

function makeProceduralTexture(seed: number): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size / 2;
  const ctx = canvas.getContext('2d')!;
  // Pick a hue family from the seed for variety
  const hueBase = (seed * 137) % 360;
  // Dark base
  ctx.fillStyle = `hsl(${hueBase}, 40%, 18%)`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  // Random "continent" splotches
  for (let i = 0; i < 40; i++) {
    const cx = Math.random() * canvas.width;
    const cy = Math.random() * canvas.height;
    const r = 12 + Math.random() * 60;
    const lightness = 30 + Math.random() * 40;
    const hueShift = -25 + Math.random() * 50;
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    grad.addColorStop(0, `hsla(${hueBase + hueShift}, 55%, ${lightness}%, 0.85)`);
    grad.addColorStop(1, `hsla(${hueBase + hueShift}, 55%, ${lightness}%, 0)`);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
  }
  return new THREE.CanvasTexture(canvas);
}

export function TkxPlanet({
  radius = 1,
  position = [0, 0, 0],
  texture,
  tint = '#ffffff',
  spinSpeed = 0.1,
  ring = false,
  ringInner = 1.4,
  ringOuter = 2.2,
  ringTilt = 0.4,
  glow = true,
  glowColor = '#00f5d4',
}: TkxPlanetProps) {
  const { scene, onFrame } = useScene();

  useEffect(() => {
    const group = new THREE.Group();
    group.position.set(...position);
    scene.add(group);

    // Surface
    let map: THREE.Texture;
    if (texture) {
      map = new THREE.TextureLoader().load(texture);
    } else {
      map = makeProceduralTexture(position[0] + position[1] * 13 + position[2] * 31);
    }

    const sphereGeo = new THREE.SphereGeometry(radius, 48, 32);
    const sphereMat = new THREE.MeshStandardMaterial({
      map,
      color: new THREE.Color(tint),
      roughness: 0.85,
      metalness: 0.05,
    });
    const sphere = new THREE.Mesh(sphereGeo, sphereMat);
    group.add(sphere);

    // Ring
    let ringMesh: THREE.Mesh | null = null;
    let ringGeo: THREE.RingGeometry | null = null;
    let ringMat: THREE.MeshBasicMaterial | null = null;
    if (ring) {
      ringGeo = new THREE.RingGeometry(radius * ringInner, radius * ringOuter, 64);
      ringMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(tint),
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.55,
      });
      ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = Math.PI / 2 + ringTilt;
      group.add(ringMesh);
    }

    // Atmosphere glow — a slightly larger back-faced shader-less sphere
    let glowMesh: THREE.Mesh | null = null;
    let glowGeo: THREE.SphereGeometry | null = null;
    let glowMat: THREE.MeshBasicMaterial | null = null;
    if (glow) {
      glowGeo = new THREE.SphereGeometry(radius * 1.06, 48, 32);
      glowMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(glowColor),
        side: THREE.BackSide,
        transparent: true,
        opacity: 0.18,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      glowMesh = new THREE.Mesh(glowGeo, glowMat);
      group.add(glowMesh);
    }

    const unsub = onFrame((delta) => {
      if (spinSpeed) sphere.rotation.y += spinSpeed * delta;
    });

    return () => {
      unsub();
      scene.remove(group);
      sphereGeo.dispose();
      sphereMat.dispose();
      map.dispose();
      ringGeo?.dispose();
      ringMat?.dispose();
      glowGeo?.dispose();
      glowMat?.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    radius, position[0], position[1], position[2], texture, tint,
    spinSpeed, ring, ringInner, ringOuter, ringTilt, glow, glowColor,
  ]);

  return null;
}
