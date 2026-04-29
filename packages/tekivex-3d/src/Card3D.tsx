// ─────────────────────────────────────────────────────────────────────────────
// TkxCard3D — real WebGL 3D card with PBR material + cursor-tracked rotation
//
// Difference from <TkxHolographicCard> in tekivex-ui:
//   - That one is CSS perspective + rotateX/rotateY (great default, zero deps)
//   - This one is real geometry with depth — can be lit, can cast shadows,
//     can be viewed from any angle, can have a back face, can be embedded
//     inside an XR scene
//
// Composes inside a <TkxScene> via context.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect } from 'react';
import * as THREE from 'three';
import { useScene } from './Scene';

export interface TkxCard3DProps {
  /** Card width × height in scene units. Default [3, 4]. */
  size?: [number, number];
  /** Depth (thickness) of the card. Default 0.05. */
  depth?: number;
  /** Position in scene [x, y, z]. Default [0, 0, 0]. */
  position?: [number, number, number];
  /** Front-face color (hex). Default theme primary teal. */
  color?: string;
  /** Front-face texture URL (replaces color if provided). */
  texture?: string;
  /** Back-face color. Default theme dark. */
  backColor?: string;
  /** Maximum tilt in radians on each axis. Default 0.35. */
  maxTilt?: number;
  /** Auto-rotate around Y axis in rad/s when no cursor. Default 0. */
  autoRotate?: number;
  /** PBR roughness. 0=mirror, 1=diffuse. Default 0.3. */
  roughness?: number;
  /** PBR metalness. 0=plastic, 1=metal. Default 0.7. */
  metalness?: number;
  /** Click handler — fires when the card mesh is raycast-clicked. */
  onClick?: () => void;
}

export function TkxCard3D({
  size = [3, 4],
  depth = 0.05,
  position = [0, 0, 0],
  color = '#00f5d4',
  texture,
  backColor = '#1a1a2e',
  maxTilt = 0.35,
  autoRotate = 0,
  roughness = 0.3,
  metalness = 0.7,
  onClick,
}: TkxCard3DProps) {
  const { scene, camera, renderer, onFrame } = useScene();

  useEffect(() => {
    const [w, h] = size;
    const geometry = new THREE.BoxGeometry(w, h, depth);

    let frontMap: THREE.Texture | null = null;
    if (texture) {
      const loader = new THREE.TextureLoader();
      frontMap = loader.load(texture);
      frontMap.colorSpace = THREE.SRGBColorSpace;
    }

    const frontMaterial = new THREE.MeshStandardMaterial({
      color: frontMap ? 0xffffff : color,
      map: frontMap,
      roughness,
      metalness,
    });
    const sideMaterial = new THREE.MeshStandardMaterial({
      color: backColor,
      roughness: 0.5,
      metalness,
    });
    const backMaterial = new THREE.MeshStandardMaterial({
      color: backColor,
      roughness,
      metalness,
    });

    // BoxGeometry face order: [+x, -x, +y, -y, +z (front), -z (back)]
    const materials = [
      sideMaterial,  // +x edge
      sideMaterial,  // -x edge
      sideMaterial,  // +y edge
      sideMaterial,  // -y edge
      frontMaterial, // +z front
      backMaterial,  // -z back
    ];
    const mesh = new THREE.Mesh(geometry, materials);
    mesh.position.set(...position);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);

    let targetRX = 0;
    let targetRY = 0;
    let isHovering = false;

    function onPointerMove(e: PointerEvent) {
      const canvas = renderer.domElement;
      const rect = canvas.getBoundingClientRect();
      const ndcX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ndcY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      // Raycast — only tilt while hovering the card
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), camera);
      const hits = raycaster.intersectObject(mesh);
      isHovering = hits.length > 0;
      // Map cursor offset to tilt
      targetRX = -ndcY * maxTilt;
      targetRY = ndcX * maxTilt;
    }

    function onPointerLeave() {
      isHovering = false;
      targetRX = 0;
      targetRY = 0;
    }

    function onPointerClick(e: MouseEvent) {
      if (!onClick) return;
      const canvas = renderer.domElement;
      const rect = canvas.getBoundingClientRect();
      const ndcX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ndcY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), camera);
      if (raycaster.intersectObject(mesh).length > 0) onClick();
    }

    renderer.domElement.addEventListener('pointermove', onPointerMove);
    renderer.domElement.addEventListener('pointerleave', onPointerLeave);
    renderer.domElement.addEventListener('click', onPointerClick);

    const unsub = onFrame((delta) => {
      // Lerp towards target rotation (smooth)
      mesh.rotation.x += (targetRX - mesh.rotation.x) * 0.1;
      mesh.rotation.y += (targetRY - mesh.rotation.y) * 0.1;
      // Auto-rotate when not hovering
      if (autoRotate && !isHovering) {
        mesh.rotation.y += autoRotate * delta;
      }
    });

    return () => {
      unsub();
      renderer.domElement.removeEventListener('pointermove', onPointerMove);
      renderer.domElement.removeEventListener('pointerleave', onPointerLeave);
      renderer.domElement.removeEventListener('click', onPointerClick);
      scene.remove(mesh);
      geometry.dispose();
      materials.forEach((m) => m.dispose());
      if (frontMap) frontMap.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
