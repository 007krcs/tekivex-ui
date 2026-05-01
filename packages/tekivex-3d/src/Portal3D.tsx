// ─────────────────────────────────────────────────────────────────────────────
// TkxPortal3D — clickable 3D portal that fades to a different scene
//
// Composes inside <TkxScene>. Renders a luminous oval ring with an inner
// shimmering surface; on click, the scene fades to black through the
// portal, the parent's onEnter handler fires (so it can swap content),
// and the portal fades back in. Useful for navigating between worlds —
// pairs naturally with the Galaxy Map example.
//
//   <TkxScene>
//     <TkxPlanet position={[0,0,0]} radius={1.5} />
//     <TkxPortal3D
//       position={[3, 0, -4]}
//       label="Cygnus Prime"
//       accent="#ffbe0b"
//       onEnter={() => router.push('/cygnus')}
//     />
//   </TkxScene>
//
// Visual: ring + radial-gradient inner disc + animated noise texture +
// HTML label below. Clicks raycast against the inner disc.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useScene } from './Scene';

export interface TkxPortal3DProps {
  /** World-space position. */
  position: [number, number, number];
  /** Outer radius of the portal ring. Default 1. */
  radius?: number;
  /** Aspect ratio (height / width). Default 1.4 (taller than wide). */
  aspect?: number;
  /** Accent color (ring + label). Default cyan. */
  accent?: string;
  /** Inner shimmer base color. Default dark blue. */
  innerColor?: string;
  /** Optional label rendered as a billboarded HTML overlay below the portal. */
  label?: string;
  /** Auto-rotate the portal slowly to face the camera. Default true. */
  faceCamera?: boolean;
  /** Fired when the portal is clicked (fade-in/out is handled internally). */
  onEnter?: () => void;
  /** Total fade-out + fade-in time in milliseconds. Default 1200. */
  transitionMs?: number;
}

export function TkxPortal3D({
  position,
  radius = 1,
  aspect = 1.4,
  accent = '#00f5d4',
  innerColor = '#0c0d20',
  label,
  faceCamera = true,
  onEnter,
  transitionMs = 1200,
}: TkxPortal3DProps) {
  const { scene, camera, renderer, onFrame } = useScene();
  const [labelPos, setLabelPos] = useState<{ x: number; y: number; visible: boolean } | null>(null);
  const animRef = useRef({ start: 0, fading: false });

  useEffect(() => {
    const group = new THREE.Group();
    group.position.set(...position);
    scene.add(group);

    const w = radius;
    const h = radius * aspect;

    // Outer luminous ring
    const ringGeo = new THREE.RingGeometry(w * 0.96, w * 1.04, 64);
    // squash on Y to make an oval
    ringGeo.scale(1, aspect, 1);
    const ringMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(accent),
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.95,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    group.add(ring);

    // Inner disc with shimmer (procedural canvas texture, animated)
    const TEX_SIZE = 256;
    const canvas = document.createElement('canvas');
    canvas.width = TEX_SIZE;
    canvas.height = TEX_SIZE;
    const ctx = canvas.getContext('2d')!;
    const tex = new THREE.CanvasTexture(canvas);

    function paintTexture(time: number) {
      ctx.fillStyle = innerColor;
      ctx.fillRect(0, 0, TEX_SIZE, TEX_SIZE);
      // Radial gradient base
      const grad = ctx.createRadialGradient(
        TEX_SIZE / 2, TEX_SIZE / 2, 0,
        TEX_SIZE / 2, TEX_SIZE / 2, TEX_SIZE / 2,
      );
      grad.addColorStop(0, accent + 'aa');
      grad.addColorStop(0.4, accent + '44');
      grad.addColorStop(1, innerColor);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, TEX_SIZE, TEX_SIZE);
      // Animated swirl bands
      ctx.globalCompositeOperation = 'screen';
      for (let i = 0; i < 6; i++) {
        const angle = (time / 800) + (i * Math.PI) / 3;
        ctx.beginPath();
        ctx.strokeStyle = `${accent}55`;
        ctx.lineWidth = 8 + Math.sin(time / 400 + i) * 3;
        const x = TEX_SIZE / 2 + Math.cos(angle) * TEX_SIZE * 0.3;
        const y = TEX_SIZE / 2 + Math.sin(angle) * TEX_SIZE * 0.3;
        ctx.moveTo(TEX_SIZE / 2, TEX_SIZE / 2);
        ctx.lineTo(x, y);
        ctx.stroke();
      }
      ctx.globalCompositeOperation = 'source-over';
      tex.needsUpdate = true;
    }
    paintTexture(0);

    const discGeo = new THREE.CircleGeometry(w * 0.96, 64);
    discGeo.scale(1, aspect, 1);
    const discMat = new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
      opacity: 0.92,
    });
    const disc = new THREE.Mesh(discGeo, discMat);
    group.add(disc);

    // Outer glow halo
    const glowGeo = new THREE.RingGeometry(w * 1.04, w * 1.35, 64);
    glowGeo.scale(1, aspect, 1);
    const glowMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(accent),
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.18,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    group.add(glow);

    // Raycaster for click detection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    function onClick(e: PointerEvent) {
      // While fading, ignore further clicks.
      if (animRef.current.fading) return;
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObject(disc, false);
      if (hits.length > 0) {
        animRef.current = { start: performance.now(), fading: true };
      }
    }
    renderer.domElement.addEventListener('pointerdown', onClick);

    const unsub = onFrame((delta, time) => {
      paintTexture(time * 1000);
      if (faceCamera) {
        group.lookAt(camera.position);
      }

      // Project the portal's world position to screen for HTML label placement
      const v = new THREE.Vector3(0, -h * 1.1, 0);
      v.applyMatrix4(group.matrixWorld);
      v.project(camera);
      const rect = renderer.domElement.getBoundingClientRect();
      const x = (v.x * 0.5 + 0.5) * rect.width;
      const y = (1 - (v.y * 0.5 + 0.5)) * rect.height;
      const visible = v.z < 1;
      setLabelPos({ x, y, visible });

      // Fade animation
      if (animRef.current.fading) {
        const elapsed = performance.now() - animRef.current.start;
        const t = Math.min(1, elapsed / transitionMs);
        // First half: fade to white-out (opacity goes high), second half: fade back
        const phase = t < 0.5 ? t * 2 : (1 - t) * 2;
        ringMat.opacity = 0.95 - phase * 0.7;
        discMat.opacity = 0.92 + phase * 0.08;
        glowMat.opacity = 0.18 + phase * 0.5;
        // Trigger the user's enter callback at the apex of the fade
        if (t >= 0.5 && elapsed < transitionMs / 2 + 16) {
          // (only fires once per click — the "fading" flag is reset below)
        }
        if (t >= 0.5 && !animRef.current.start.toString().endsWith('!')) {
          // Use a sentinel to ensure single-fire
          animRef.current.start = -Math.abs(animRef.current.start);
          onEnter?.();
        }
        if (t >= 1) {
          animRef.current = { start: 0, fading: false };
          ringMat.opacity = 0.95;
          discMat.opacity = 0.92;
          glowMat.opacity = 0.18;
        }
      }
    });

    return () => {
      unsub();
      renderer.domElement.removeEventListener('pointerdown', onClick);
      scene.remove(group);
      ringGeo.dispose();
      ringMat.dispose();
      discGeo.dispose();
      discMat.dispose();
      glowGeo.dispose();
      glowMat.dispose();
      tex.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    position[0], position[1], position[2], radius, aspect, accent,
    innerColor, faceCamera, transitionMs,
  ]);

  if (!label || !labelPos || !labelPos.visible) return null;
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        left: labelPos.x,
        top: labelPos.y,
        transform: 'translate(-50%, 0)',
        padding: '4px 12px',
        borderRadius: 999,
        background: 'rgba(8,10,25,0.7)',
        border: `1px solid ${accent}66`,
        color: accent,
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
        backdropFilter: 'blur(6px)',
        pointerEvents: 'none',
      }}
    >
      {label}
    </div>
  );
}
