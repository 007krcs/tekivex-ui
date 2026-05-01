// ─────────────────────────────────────────────────────────────────────────────
// TkxLogo3D — extruded text logo
//
// Uses three.js TextGeometry + a typeface JSON font (loaded async). Renders
// a 3D-extruded version of any string with theme-aware gradient material.
//
// Default font: Inter (loaded from typeface.js public CDN). Override with
// fontUrl prop to ship your own Helvetiker/Inter/Manrope/etc. JSON.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect } from 'react';
import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { useScene } from './Scene';

// Public-domain Helvetiker JSON typeface that ships with three/examples.
// Loaded from jsDelivr by default — override with fontUrl to self-host.
const DEFAULT_FONT_URL =
  'https://cdn.jsdelivr.net/npm/three@0.169.0/examples/fonts/helvetiker_regular.typeface.json';

export interface TkxLogo3DProps {
  /** Text to extrude. */
  text: string;
  /** URL of a typeface JSON file. */
  fontUrl?: string;
  /** Position in scene [x, y, z]. Default [0, 0, 0]. */
  position?: [number, number, number];
  /** Font size in scene units. Default 1. */
  size?: number;
  /** Extrusion depth. Default 0.2. */
  depth?: number;
  /** Bevel size. Default 0.02. */
  bevelSize?: number;
  /** Bevel thickness. Default 0.02. */
  bevelThickness?: number;
  /** Auto-rotate around Y in rad/sec. Default 0. */
  autoRotate?: number;
  /** Material color (hex). Default theme primary teal. */
  color?: string;
  /** Apply iridescent gradient material. Default true. */
  iridescent?: boolean;
  /** Center the text horizontally on its origin. Default true. */
  centered?: boolean;
  /** Cast shadows. Default true. */
  castShadow?: boolean;
  /** Fired when the geometry is ready. */
  onReady?: () => void;
}

export function TkxLogo3D({
  text,
  fontUrl = DEFAULT_FONT_URL,
  position = [0, 0, 0],
  size = 1,
  depth = 0.2,
  bevelSize = 0.02,
  bevelThickness = 0.02,
  autoRotate = 0,
  color = '#00f5d4',
  iridescent = true,
  centered = true,
  castShadow = true,
  onReady,
}: TkxLogo3DProps) {
  const { scene, onFrame } = useScene();

  useEffect(() => {
    let disposed = false;
    const group = new THREE.Group();
    group.position.set(...position);
    scene.add(group);

    const loader = new FontLoader();
    loader.load(
      fontUrl,
      (font) => {
        if (disposed) return;

        const geometry = new TextGeometry(text, {
          font,
          size,
          depth,
          curveSegments: 12,
          bevelEnabled: bevelSize > 0,
          bevelSize,
          bevelThickness,
          bevelOffset: 0,
          bevelSegments: 5,
        });
        geometry.computeBoundingBox();

        if (centered && geometry.boundingBox) {
          const offset = -0.5 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x);
          geometry.translate(offset, 0, 0);
        }

        const material = iridescent
          ? new THREE.MeshPhysicalMaterial({
              color,
              metalness: 0.95,
              roughness: 0.15,
              iridescence: 1.0,
              iridescenceIOR: 1.5,
              iridescenceThicknessRange: [100, 800],
              clearcoat: 1.0,
              clearcoatRoughness: 0.1,
            })
          : new THREE.MeshStandardMaterial({
              color,
              metalness: 0.7,
              roughness: 0.3,
            });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = castShadow;
        mesh.receiveShadow = castShadow;
        group.add(mesh);

        onReady?.();
      },
      undefined,
      (err) => {
        // Don't crash the whole scene — just log
        console.warn('TkxLogo3D: failed to load font from', fontUrl, err);
      },
    );

    const unsub = onFrame((delta) => {
      if (autoRotate) group.rotation.y += autoRotate * delta;
    });

    return () => {
      disposed = true;
      unsub();
      scene.remove(group);
      group.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry?.dispose();
          const mat = obj.material;
          if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
          else mat?.dispose();
        }
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, fontUrl]);

  return null;
}
