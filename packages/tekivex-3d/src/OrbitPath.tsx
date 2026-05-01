// ─────────────────────────────────────────────────────────────────────────────
// TkxOrbitPath — orbital ring + travelling body
//
// Renders a circular orbit line in the XZ plane with an optional small
// body that traces the path at a configurable speed. Useful for
// solar-system style overviews, satellite views, or any "this thing
// orbits that thing" visual.
//
//   <TkxScene>
//     <TkxPlanet radius={1.6} position={[0, 0, 0]} />
//     <TkxOrbitPath radius={4} bodyColor="#3a86ff" speed={0.5} bodySize={0.3} />
//     <TkxOrbitPath radius={6} bodyColor="#ff006e" speed={0.3} bodySize={0.2} />
//   </TkxScene>
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect } from 'react';
import * as THREE from 'three';
import { useScene } from './Scene';

export interface TkxOrbitPathProps {
  /** Orbital radius (in scene units). Required. */
  radius: number;
  /** Center of the orbit. Default [0, 0, 0]. */
  center?: [number, number, number];
  /** Orbit ring color. Default cyan with alpha. */
  ringColor?: string;
  /** Ring opacity (0..1). Default 0.4. */
  ringOpacity?: number;
  /** Inclination — tilt of the orbital plane in radians. Default 0. */
  inclination?: number;
  /** If set, places a small sphere on the orbit and animates it. */
  bodyColor?: string;
  /** Body radius. Default 0.15. */
  bodySize?: number;
  /** Angular velocity in radians/sec. Default 0.5. */
  speed?: number;
  /** Initial phase of the body, in radians. Default 0. */
  phase?: number;
  /** Show a glow trail behind the body. Default true. */
  trail?: boolean;
}

export function TkxOrbitPath({
  radius,
  center = [0, 0, 0],
  ringColor = '#00f5d4',
  ringOpacity = 0.4,
  inclination = 0,
  bodyColor,
  bodySize = 0.15,
  speed = 0.5,
  phase = 0,
  trail = true,
}: TkxOrbitPathProps) {
  const { scene, onFrame } = useScene();

  useEffect(() => {
    const group = new THREE.Group();
    group.position.set(...center);
    group.rotation.x = inclination;
    scene.add(group);

    // Orbit ring
    const segments = 128;
    const ringPoints: THREE.Vector3[] = [];
    for (let i = 0; i <= segments; i++) {
      const a = (i / segments) * Math.PI * 2;
      ringPoints.push(new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius));
    }
    const ringGeo = new THREE.BufferGeometry().setFromPoints(ringPoints);
    const ringMat = new THREE.LineBasicMaterial({
      color: new THREE.Color(ringColor),
      transparent: true,
      opacity: ringOpacity,
    });
    const ring = new THREE.Line(ringGeo, ringMat);
    group.add(ring);

    // Body
    let body: THREE.Mesh | null = null;
    let bodyGeo: THREE.SphereGeometry | null = null;
    let bodyMat: THREE.MeshBasicMaterial | null = null;
    let trailMesh: THREE.Mesh | null = null;
    let trailGeo: THREE.SphereGeometry | null = null;
    let trailMat: THREE.MeshBasicMaterial | null = null;
    if (bodyColor) {
      bodyGeo = new THREE.SphereGeometry(bodySize, 24, 16);
      bodyMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(bodyColor) });
      body = new THREE.Mesh(bodyGeo, bodyMat);
      group.add(body);
      if (trail) {
        trailGeo = new THREE.SphereGeometry(bodySize * 1.6, 24, 16);
        trailMat = new THREE.MeshBasicMaterial({
          color: new THREE.Color(bodyColor),
          transparent: true,
          opacity: 0.25,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        });
        trailMesh = new THREE.Mesh(trailGeo, trailMat);
        group.add(trailMesh);
      }
    }

    let theta = phase;
    const unsub = onFrame((delta) => {
      if (!body) return;
      theta += speed * delta;
      const x = Math.cos(theta) * radius;
      const z = Math.sin(theta) * radius;
      body.position.set(x, 0, z);
      if (trailMesh) trailMesh.position.set(x, 0, z);
    });

    return () => {
      unsub();
      scene.remove(group);
      ringGeo.dispose();
      ringMat.dispose();
      bodyGeo?.dispose();
      bodyMat?.dispose();
      trailGeo?.dispose();
      trailMat?.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    radius, center[0], center[1], center[2], ringColor, ringOpacity,
    inclination, bodyColor, bodySize, speed, phase, trail,
  ]);

  return null;
}
