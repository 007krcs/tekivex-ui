// ─────────────────────────────────────────────────────────────────────────────
// TkxHotspot — clickable annotation in 3D space
//
// Used inside a <TkxPanorama360> or any <TkxScene> to mark a navigable
// point: "click here to jump to the next room", "hover here for product
// info", etc. Renders a billboarded sprite that always faces the camera.
//
// The label is HTML rendered via DOM overlay (positioned via projected
// world coords each frame) — so you get full styling, fonts, transitions
// without leaving CSS. The sprite itself is a clickable hit target.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import * as THREE from 'three';
import { useScene } from './Scene';

export interface TkxHotspotProps {
  /** Position in scene [x, y, z]. */
  position: [number, number, number];
  /** Click handler. */
  onClick?: () => void;
  /** Visible label (DOM-rendered). */
  label?: ReactNode;
  /** Sprite tint. Default theme primary teal. */
  color?: string;
  /** Sprite size in scene units. Default 0.3. */
  size?: number;
  /** Pulse animation speed. 0 = no pulse. Default 1. */
  pulseSpeed?: number;
  /** Label CSS. */
  labelStyle?: CSSProperties;
}

export function TkxHotspot({
  position,
  onClick,
  label,
  color = '#00f5d4',
  size = 0.3,
  pulseSpeed = 1,
  labelStyle,
}: TkxHotspotProps) {
  const { scene, camera, renderer, onFrame } = useScene();
  const labelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const colorObj = new THREE.Color(color);
    const ringMat = new THREE.SpriteMaterial({
      color: colorObj,
      transparent: true,
      opacity: 0.85,
      depthTest: false,
    });
    const ring = new THREE.Sprite(ringMat);
    ring.position.set(...position);
    ring.scale.set(size, size, size);
    scene.add(ring);

    function onClickEvt(e: MouseEvent) {
      if (!onClick) return;
      const canvas = renderer.domElement;
      const rect = canvas.getBoundingClientRect();
      const ndcX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ndcY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), camera);
      if (raycaster.intersectObject(ring).length > 0) {
        onClick();
      }
    }
    renderer.domElement.addEventListener('click', onClickEvt);

    const proj = new THREE.Vector3();
    const unsub = onFrame((_, time) => {
      // Pulse
      if (pulseSpeed) {
        const s = size * (1 + 0.15 * Math.sin(time * pulseSpeed * 4));
        ring.scale.set(s, s, s);
      }
      // Project label
      if (labelRef.current) {
        proj.set(...position).project(camera);
        const inFront = proj.z < 1;
        const canvas = renderer.domElement;
        const x = (proj.x * 0.5 + 0.5) * canvas.clientWidth;
        const y = (-proj.y * 0.5 + 0.5) * canvas.clientHeight;
        labelRef.current.style.transform = `translate(-50%, calc(-100% - 16px)) translate3d(${x}px, ${y}px, 0)`;
        labelRef.current.style.opacity = inFront ? '1' : '0';
        labelRef.current.style.pointerEvents = inFront ? 'auto' : 'none';
      }
    });

    return () => {
      unsub();
      renderer.domElement.removeEventListener('click', onClickEvt);
      scene.remove(ring);
      ringMat.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [color, pulseSpeed, size, position[0], position[1], position[2]]);

  if (!label) return null;

  return (
    <div
      ref={labelRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        background: 'rgba(10, 10, 15, 0.85)',
        backdropFilter: 'blur(8px)',
        color: '#e8e8f4',
        padding: '6px 12px',
        borderRadius: 8,
        border: `1px solid ${color}`,
        fontSize: 13,
        fontWeight: 600,
        whiteSpace: 'nowrap',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'opacity 200ms',
        zIndex: 1,
        ...labelStyle,
      }}
      onClick={onClick}
    >
      {label}
    </div>
  );
}
