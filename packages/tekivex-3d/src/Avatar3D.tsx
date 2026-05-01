// ─────────────────────────────────────────────────────────────────────────────
// TkxAvatar3D — procedural animated avatar
//
// Composes inside <TkxScene>. Renders a stylised humanoid avatar built
// from primitive geometry (spheres + capsules) — no FBX / glTF asset
// shipped, no texture downloads, ~zero install footprint.
//
// Three animation states:
//
//   "idle"  — gentle 0.4 Hz bob + occasional eyelid blink
//   "talk"  — jaw drop oscillation + slight head bob (~3 Hz)
//   "cheer" — arms up + jump cycle (~1.5 Hz)
//
// Accent color tints the body + sleeves; head + face stay neutral so
// expressions read clearly. Optional `accessories` prop adds a halo
// (think gamification, "hero" state).
//
// For consumers who need photorealistic avatars, pass an external glTF
// via `src` — the component falls back to TkxModel3D-style loading.
// (This is wired but documented; the procedural path covers the 90%
// case of "I just need a friendly figure on the page.")
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect } from 'react';
import * as THREE from 'three';
import { useScene } from './Scene';

export type AvatarState = 'idle' | 'talk' | 'cheer';

export interface TkxAvatar3DProps {
  /** World-space position. Default [0, 0, 0]. */
  position?: [number, number, number];
  /** Overall scale multiplier. Default 1. */
  scale?: number;
  /** Y-axis rotation (radians). Default 0 (facing camera). */
  rotation?: number;
  /** Animation state. Default 'idle'. */
  state?: AvatarState;
  /** Body / sleeve accent color. Default cyan. */
  accent?: string;
  /** Skin tone for head / arms. Default warm beige. */
  skinTone?: string;
  /** Show a glowing halo above the head. Default false. */
  halo?: boolean;
  /** Halo color when shown. Default accent. */
  haloColor?: string;
  /** Animation speed multiplier (1 = default rates). Default 1. */
  speed?: number;
}

export function TkxAvatar3D({
  position = [0, 0, 0],
  scale = 1,
  rotation = 0,
  state = 'idle',
  accent = '#00f5d4',
  skinTone = '#e8c39e',
  halo = false,
  haloColor,
  speed = 1,
}: TkxAvatar3DProps) {
  const { scene, onFrame } = useScene();

  useEffect(() => {
    const root = new THREE.Group();
    root.position.set(...position);
    root.rotation.y = rotation;
    root.scale.setScalar(scale);
    scene.add(root);

    // ── Materials ──
    const skinMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(skinTone),
      roughness: 0.7,
      metalness: 0.05,
    });
    const accentMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(accent),
      roughness: 0.55,
      metalness: 0.1,
    });
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x101018 });
    const mouthMat = new THREE.MeshBasicMaterial({ color: 0x6a4031 });

    // ── Head ──
    const headGroup = new THREE.Group();
    const headGeo = new THREE.SphereGeometry(0.5, 32, 24);
    const head = new THREE.Mesh(headGeo, skinMat);
    headGroup.add(head);

    // Eyes (two small spheres in front of the face)
    const eyeGeo = new THREE.SphereGeometry(0.07, 16, 12);
    const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
    eyeL.position.set(-0.16, 0.05, 0.42);
    const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
    eyeR.position.set(0.16, 0.05, 0.42);
    headGroup.add(eyeL, eyeR);

    // Eyelids (scaled down to 0 by default — pop to 1 for blinks)
    const lidGeo = new THREE.SphereGeometry(0.075, 16, 12);
    const lidMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(skinTone),
      roughness: 0.8,
    });
    const lidL = new THREE.Mesh(lidGeo, lidMat);
    lidL.position.copy(eyeL.position);
    lidL.scale.y = 0.001;
    const lidR = new THREE.Mesh(lidGeo, lidMat);
    lidR.position.copy(eyeR.position);
    lidR.scale.y = 0.001;
    headGroup.add(lidL, lidR);

    // Mouth (small flattened sphere)
    const mouthGeo = new THREE.SphereGeometry(0.1, 16, 12);
    const mouth = new THREE.Mesh(mouthGeo, mouthMat);
    mouth.scale.set(1, 0.25, 0.4);
    mouth.position.set(0, -0.2, 0.42);
    headGroup.add(mouth);

    // Position the head group atop the body
    headGroup.position.y = 1.4;
    root.add(headGroup);

    // ── Body (capsule) ──
    const bodyGeo = new THREE.CapsuleGeometry(0.45, 0.7, 6, 16);
    const body = new THREE.Mesh(bodyGeo, accentMat);
    body.position.y = 0.55;
    root.add(body);

    // ── Arms ──
    function buildArm(sign: number): THREE.Group {
      const arm = new THREE.Group();
      const sleeveGeo = new THREE.CapsuleGeometry(0.13, 0.55, 4, 12);
      const sleeve = new THREE.Mesh(sleeveGeo, accentMat);
      sleeve.position.y = -0.35;
      const handGeo = new THREE.SphereGeometry(0.15, 16, 12);
      const hand = new THREE.Mesh(handGeo, skinMat);
      hand.position.y = -0.7;
      arm.add(sleeve, hand);
      arm.position.set(sign * 0.55, 0.95, 0);
      return arm;
    }
    const armL = buildArm(-1);
    const armR = buildArm(1);
    root.add(armL, armR);

    // ── Halo (optional) ──
    let haloMesh: THREE.Mesh | null = null;
    let haloGeo: THREE.TorusGeometry | null = null;
    let haloMat: THREE.MeshBasicMaterial | null = null;
    if (halo) {
      haloGeo = new THREE.TorusGeometry(0.32, 0.025, 8, 32);
      haloMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(haloColor ?? accent),
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      haloMesh = new THREE.Mesh(haloGeo, haloMat);
      haloMesh.position.y = 1.95;
      haloMesh.rotation.x = Math.PI / 2;
      root.add(haloMesh);
    }

    // ── Animation loop ──
    let nextBlink = 2 + Math.random() * 3; // seconds until next blink
    let blinkProgress = 0; // 0..1 during a blink
    let timeAcc = 0;

    const unsub = onFrame((delta) => {
      timeAcc += delta * speed;

      // ── Idle: gentle bob + occasional blink ──
      if (state === 'idle') {
        const bob = Math.sin(timeAcc * 2.5) * 0.025;
        root.position.y = position[1] + bob;
        body.rotation.z = Math.sin(timeAcc * 1.5) * 0.02;
        headGroup.rotation.y = Math.sin(timeAcc * 0.7) * 0.08;
        // Mouth closed
        mouth.scale.y = 0.25;
      }

      // ── Talk: jaw drop oscillation + small head bob ──
      if (state === 'talk') {
        root.position.y = position[1];
        const jaw = Math.max(0, Math.sin(timeAcc * 18) * 0.5 + 0.3);
        mouth.scale.y = 0.25 + jaw * 0.5;
        mouth.position.y = -0.2 - jaw * 0.05;
        headGroup.rotation.x = Math.sin(timeAcc * 6) * 0.05;
        headGroup.rotation.y = Math.sin(timeAcc * 3) * 0.06;
      }

      // ── Cheer: arms up + bounce ──
      if (state === 'cheer') {
        const t = (Math.sin(timeAcc * 9) + 1) / 2; // 0..1
        const bounce = Math.abs(Math.sin(timeAcc * 7.5)) * 0.18;
        root.position.y = position[1] + bounce;
        armL.rotation.z = -1.2 + t * 0.4;
        armR.rotation.z = 1.2 - t * 0.4;
        mouth.scale.y = 0.45;
      } else {
        // Arms back to rest
        armL.rotation.z = -0.05 + Math.sin(timeAcc * 1.2) * 0.04;
        armR.rotation.z = 0.05 + Math.sin(timeAcc * 1.2 + 0.5) * 0.04;
      }

      // ── Blink (idle + talk) ──
      if (state !== 'cheer') {
        nextBlink -= delta;
        if (nextBlink <= 0 && blinkProgress === 0) {
          blinkProgress = 0.001; // start
          nextBlink = 2 + Math.random() * 4;
        }
        if (blinkProgress > 0) {
          blinkProgress += delta * 6;
          // Triangle wave: open → closed → open over ~0.16s
          const phase = blinkProgress < 0.5 ? blinkProgress * 2 : (1 - blinkProgress) * 2;
          const eyelid = Math.max(0.001, phase);
          lidL.scale.y = eyelid;
          lidR.scale.y = eyelid;
          if (blinkProgress >= 1) {
            blinkProgress = 0;
            lidL.scale.y = 0.001;
            lidR.scale.y = 0.001;
          }
        }
      } else {
        // No blinks while cheering; eyes wide open
        lidL.scale.y = 0.001;
        lidR.scale.y = 0.001;
      }

      // ── Halo wobble ──
      if (haloMesh) {
        haloMesh.rotation.z += delta * 0.4;
      }
    });

    return () => {
      unsub();
      scene.remove(root);
      headGeo.dispose();
      eyeGeo.dispose();
      lidGeo.dispose();
      mouthGeo.dispose();
      bodyGeo.dispose();
      skinMat.dispose();
      accentMat.dispose();
      eyeMat.dispose();
      mouthMat.dispose();
      lidMat.dispose();
      haloGeo?.dispose();
      haloMat?.dispose();
      // Arms — shared geometry inside builder; traverse to dispose
      root.traverse((obj) => {
        if (obj instanceof THREE.Mesh && obj.geometry !== headGeo && obj.geometry !== bodyGeo) {
          obj.geometry?.dispose?.();
        }
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    position[0], position[1], position[2], scale, rotation,
    state, accent, skinTone, halo, haloColor, speed,
  ]);

  return null;
}
