// ─────────────────────────────────────────────────────────────────────────────
// TkxModel3D — glTF / GLB model loader
//
// Composes inside <TkxScene>. Loads a model from a URL, auto-frames it to
// fit the camera, and optionally plays its embedded animations.
//
// What it handles:
//   - .gltf and .glb (standard three.js GLTFLoader)
//   - Embedded animations (autoplays first by default)
//   - Auto-fit: computes bounding sphere, repositions + scales so the
//     model fits comfortably within the camera frustum
//   - Cursor-tracked rotation (optional)
//   - Auto-rotate around Y (optional)
//   - Loading + error callbacks
//
// What it does NOT do (yet):
//   - Draco compression — needs a separate DRACOLoader setup; planned for v0.3
//   - Animation mixing / blending — only single-clip playback for now
//   - Click handlers on individual meshes — use raycaster manually
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { useScene } from './Scene';

export interface TkxModel3DProps {
  /** URL of the .glb or .gltf file. */
  src: string;
  /** Position in scene [x, y, z]. Default [0, 0, 0]. */
  position?: [number, number, number];
  /** Scale multiplier applied AFTER auto-fit. Default 1. */
  scale?: number;
  /** Auto-fit the model to fill the camera frustum. Default true. */
  autoFit?: boolean;
  /** Auto-rotate around the Y axis in rad/sec. Default 0. */
  autoRotate?: number;
  /** Cursor-tracked tilt (radians on each axis). Default 0 (off). */
  maxTilt?: number;
  /** Play the first embedded animation clip. Default true if any exist. */
  playAnimation?: boolean;
  /** Animation clip name (overrides default). */
  animationName?: string;
  /** Cast shadows. Default true. */
  castShadow?: boolean;
  /** Receive shadows. Default true. */
  receiveShadow?: boolean;
  /** Fired once the model finishes loading. */
  onLoad?: (gltf: GLTF) => void;
  /** Fired if the load fails (CORS, 404, malformed file, etc.). */
  onError?: (err: ErrorEvent | Error) => void;
  /** Fired during loading with progress 0..1. */
  onProgress?: (progress: number) => void;
}

export function TkxModel3D({
  src,
  position = [0, 0, 0],
  scale = 1,
  autoFit = true,
  autoRotate = 0,
  maxTilt = 0,
  playAnimation,
  animationName,
  castShadow = true,
  receiveShadow = true,
  onLoad,
  onError,
  onProgress,
}: TkxModel3DProps) {
  const { scene, camera, renderer, onFrame } = useScene();
  const [, setLoaded] = useState(false);

  useEffect(() => {
    let disposed = false;
    const group = new THREE.Group();
    group.position.set(...position);
    scene.add(group);

    const loader = new GLTFLoader();
    let mixer: THREE.AnimationMixer | null = null;

    loader.load(
      src,
      (gltf) => {
        if (disposed) return;
        const model = gltf.scene;

        // Compute bounding sphere for auto-fit
        if (autoFit) {
          const box = new THREE.Box3().setFromObject(model);
          const sphere = new THREE.Sphere();
          box.getBoundingSphere(sphere);

          // Center the model at origin
          model.position.sub(sphere.center);

          // Scale so the bounding sphere fits within ~1.5 units (leaves
          // some breathing room from the camera's frustum)
          if (sphere.radius > 0) {
            const targetRadius = 1.5;
            const fitScale = targetRadius / sphere.radius;
            model.scale.setScalar(fitScale * scale);
          } else {
            model.scale.setScalar(scale);
          }
        } else {
          model.scale.setScalar(scale);
        }

        // Cast/receive shadows on every mesh in the model
        model.traverse((obj) => {
          if (obj instanceof THREE.Mesh) {
            obj.castShadow = castShadow;
            obj.receiveShadow = receiveShadow;
          }
        });

        group.add(model);

        // Animations
        const shouldPlay = playAnimation ?? gltf.animations.length > 0;
        if (shouldPlay && gltf.animations.length > 0) {
          mixer = new THREE.AnimationMixer(model);
          const clip = animationName
            ? gltf.animations.find((c) => c.name === animationName) || gltf.animations[0]
            : gltf.animations[0];
          mixer.clipAction(clip).play();
        }

        setLoaded(true);
        onLoad?.(gltf);
      },
      (event) => {
        if (event.lengthComputable && onProgress) {
          onProgress(event.loaded / event.total);
        }
      },
      (err) => {
        if (disposed) return;
        console.error('TkxModel3D: failed to load', src, err);
        onError?.(err as ErrorEvent);
      },
    );

    // Pointer tilt
    let targetRX = 0;
    let targetRY = 0;
    function onPointerMove(e: PointerEvent) {
      if (!maxTilt) return;
      const rect = renderer.domElement.getBoundingClientRect();
      const ndcX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ndcY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      targetRX = -ndcY * maxTilt;
      targetRY = ndcX * maxTilt;
    }
    function onPointerLeave() {
      targetRX = 0;
      targetRY = 0;
    }
    if (maxTilt) {
      renderer.domElement.addEventListener('pointermove', onPointerMove);
      renderer.domElement.addEventListener('pointerleave', onPointerLeave);
    }

    const unsub = onFrame((delta) => {
      if (mixer) mixer.update(delta);
      if (autoRotate) group.rotation.y += autoRotate * delta;
      if (maxTilt) {
        group.rotation.x += (targetRX - group.rotation.x) * 0.1;
        group.rotation.y += (targetRY - group.rotation.y) * 0.1;
      }
    });

    return () => {
      disposed = true;
      unsub();
      if (maxTilt) {
        renderer.domElement.removeEventListener('pointermove', onPointerMove);
        renderer.domElement.removeEventListener('pointerleave', onPointerLeave);
      }
      scene.remove(group);
      group.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry?.dispose();
          const mat = obj.material;
          if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
          else mat?.dispose();
        }
      });
      mixer?.stopAllAction();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  return null;
}
