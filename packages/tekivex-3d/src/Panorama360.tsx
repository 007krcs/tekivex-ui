// ─────────────────────────────────────────────────────────────────────────────
// TkxPanorama360 — equirectangular 360° photo / video viewer
//
// Renders a textured sphere with inverted normals so the camera sits inside
// it and looks at the inner surface. Supports drag/touch rotation, mouse
// wheel zoom (FOV), and an optional gyroscope mode for mobile.
//
// Use case: "create a 360° website" — drop several <TkxPanorama360 /> in a
// router (or a single one with stateful `src`) and you have a Marzipano-
// style immersive site.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect } from 'react';
import * as THREE from 'three';
import { useScene } from './Scene';

export interface TkxPanorama360Props {
  /** Equirectangular image URL (2:1 aspect ratio, e.g. 4096×2048). */
  src: string;
  /** Initial camera yaw in radians. Default 0. */
  initialYaw?: number;
  /** Drag rotation speed multiplier. Default 0.005. */
  dragSensitivity?: number;
  /** Min/max FOV degrees during zoom. Default [30, 90]. */
  fovRange?: [number, number];
  /** Enable mouse-wheel zoom. Default true. */
  zoom?: boolean;
  /** Enable device gyroscope on mobile. Default false. */
  gyro?: boolean;
  /** Crossfade between src changes in ms. Default 600. */
  fadeMs?: number;
}

export function TkxPanorama360({
  src,
  initialYaw = 0,
  dragSensitivity = 0.005,
  fovRange = [30, 90],
  zoom = true,
  gyro = false,
  fadeMs = 600,
}: TkxPanorama360Props) {
  const { scene, camera, renderer, onFrame } = useScene();

  useEffect(() => {
    // Sphere geometry inverted so we render the inside
    const geometry = new THREE.SphereGeometry(500, 64, 32);
    geometry.scale(-1, 1, 1); // flip normals

    const loader = new THREE.TextureLoader();
    const tex = loader.load(src);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.mapping = THREE.EquirectangularReflectionMapping;

    const material = new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
      opacity: 0,
    });
    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);

    // Position camera at center, look in initialYaw direction
    camera.position.set(0, 0, 0.01);
    let lon = (initialYaw * 180) / Math.PI;
    let lat = 0;
    updateCameraLookAt();

    function updateCameraLookAt() {
      const phi = THREE.MathUtils.degToRad(90 - lat);
      const theta = THREE.MathUtils.degToRad(lon);
      const target = new THREE.Vector3(
        500 * Math.sin(phi) * Math.cos(theta),
        500 * Math.cos(phi),
        500 * Math.sin(phi) * Math.sin(theta),
      );
      camera.lookAt(target);
    }

    // Drag-to-pan
    let isDragging = false;
    let dragStart = { x: 0, y: 0 };
    let lonStart = 0;
    let latStart = 0;

    function onDown(e: PointerEvent) {
      isDragging = true;
      dragStart = { x: e.clientX, y: e.clientY };
      lonStart = lon;
      latStart = lat;
      renderer.domElement.setPointerCapture(e.pointerId);
    }
    function onMove(e: PointerEvent) {
      if (!isDragging) return;
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      lon = lonStart - dx * dragSensitivity * 90;
      lat = Math.max(-85, Math.min(85, latStart + dy * dragSensitivity * 90));
      updateCameraLookAt();
    }
    function onUp(e: PointerEvent) {
      isDragging = false;
      try {
        renderer.domElement.releasePointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
    }

    function onWheel(e: WheelEvent) {
      if (!zoom) return;
      e.preventDefault();
      const newFov = THREE.MathUtils.clamp(
        camera.fov + e.deltaY * 0.05,
        fovRange[0],
        fovRange[1],
      );
      camera.fov = newFov;
      camera.updateProjectionMatrix();
    }

    renderer.domElement.addEventListener('pointerdown', onDown);
    renderer.domElement.addEventListener('pointermove', onMove);
    renderer.domElement.addEventListener('pointerup', onUp);
    renderer.domElement.addEventListener('wheel', onWheel, { passive: false });

    // Gyroscope (optional, mobile)
    let onOrient: ((e: DeviceOrientationEvent) => void) | null = null;
    if (gyro && typeof window !== 'undefined' && 'DeviceOrientationEvent' in window) {
      onOrient = (e: DeviceOrientationEvent) => {
        if (isDragging) return;
        if (e.alpha != null) lon = -e.alpha;
        if (e.beta != null) lat = THREE.MathUtils.clamp(e.beta - 90, -85, 85);
        updateCameraLookAt();
      };
      window.addEventListener('deviceorientation', onOrient);
    }

    // Fade-in animation
    const fadeStart = performance.now();
    const unsub = onFrame(() => {
      const elapsed = performance.now() - fadeStart;
      material.opacity = Math.min(1, elapsed / fadeMs);
    });

    return () => {
      unsub();
      renderer.domElement.removeEventListener('pointerdown', onDown);
      renderer.domElement.removeEventListener('pointermove', onMove);
      renderer.domElement.removeEventListener('pointerup', onUp);
      renderer.domElement.removeEventListener('wheel', onWheel);
      if (onOrient) window.removeEventListener('deviceorientation', onOrient);
      scene.remove(sphere);
      geometry.dispose();
      material.dispose();
      tex.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  return null;
}
