'use client';

// ─────────────────────────────────────────────────────────────────────────────
// TkxConfetti — celebration burst.
//
// Pure canvas, no deps. Particles fall under gravity with random hue,
// rotation, and slight horizontal drift. Respects prefers-reduced-motion
// (renders a single static burst frame instead of animating).
//
// Usage patterns:
//   1. Component: <TkxConfetti trigger={success} />
//      Re-fires whenever `trigger` flips truthy.
//   2. Imperative: const ref = useRef<TkxConfettiHandle>(null);
//      ref.current?.fire();
// ─────────────────────────────────────────────────────────────────────────────

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  type CSSProperties,
  type Ref,
} from 'react';
import { useReducedMotion } from '../hooks';

export interface TkxConfettiProps {
  /** When this becomes truthy (changes), fire a burst. */
  trigger?: unknown;
  /** Number of particles per burst. Defaults to 80. */
  particleCount?: number;
  /** Initial spread cone in degrees. Defaults to 60. */
  spread?: number;
  /** Origin point in client coordinates {x, y}. Defaults to center. */
  origin?: { x: number; y: number };
  /** Colors to randomly pick from. Defaults to brand palette. */
  colors?: string[];
  /** zIndex for the canvas. Defaults to 9999. */
  zIndex?: number;
  /** Optional className. */
  className?: string;
  /** Optional inline style overrides on the canvas. */
  style?: CSSProperties;
}

export interface TkxConfettiHandle {
  /** Fire a confetti burst at the given origin (or default center). */
  fire: (origin?: { x: number; y: number }) => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vRot: number;
  size: number;
  color: string;
  alpha: number;
  ttl: number; // remaining frames
}

const DEFAULT_COLORS = [
  '#00f5d4', '#7b2ff7', '#f72585',
  '#ffbe0b', '#06d6a0', '#3a86ff',
];

export const TkxConfetti = forwardRef<TkxConfettiHandle, TkxConfettiProps>(
  function TkxConfetti(
    {
      trigger,
      particleCount = 80,
      spread = 60,
      origin,
      colors = DEFAULT_COLORS,
      zIndex = 9999,
      className,
      style,
    },
    ref: Ref<TkxConfettiHandle>,
  ) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const particlesRef = useRef<Particle[]>([]);
    const rafRef = useRef<number | null>(null);
    const reduced = useReducedMotion();

    const sizeCanvas = useCallback(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = '100vw';
      canvas.style.height = '100vh';
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.scale(dpr, dpr);
    }, []);

    useEffect(() => {
      sizeCanvas();
      window.addEventListener('resize', sizeCanvas);
      return () => window.removeEventListener('resize', sizeCanvas);
    }, [sizeCanvas]);

    const draw = useCallback(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const dpr = window.devicePixelRatio || 1;
      ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);

      const particles = particlesRef.current;
      for (const p of particles) {
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rot * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        ctx.restore();
      }
    }, []);

    const tick = useCallback(() => {
      const particles = particlesRef.current;
      let alive = false;
      for (const p of particles) {
        if (p.ttl <= 0) continue;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.18; // gravity
        p.vx *= 0.99; // slight horizontal damping
        p.rot += p.vRot;
        p.ttl -= 1;
        if (p.ttl < 30) p.alpha = p.ttl / 30; // fade out
        alive = true;
      }
      // Compact the array occasionally to avoid unbounded growth.
      if (particles.length > 1000) {
        particlesRef.current = particles.filter((p) => p.ttl > 0);
      }
      draw();
      if (alive) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        rafRef.current = null;
      }
    }, [draw]);

    const fire = useCallback(
      (at?: { x: number; y: number }) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ox = at?.x ?? origin?.x ?? window.innerWidth / 2;
        const oy = at?.y ?? origin?.y ?? window.innerHeight / 3;
        const fresh: Particle[] = [];
        for (let i = 0; i < particleCount; i++) {
          const angle = ((Math.random() - 0.5) * spread - 90) * (Math.PI / 180);
          const speed = 6 + Math.random() * 6;
          fresh.push({
            x: ox,
            y: oy,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            rot: Math.random() * 360,
            vRot: (Math.random() - 0.5) * 14,
            size: 6 + Math.random() * 6,
            color: colors[Math.floor(Math.random() * colors.length)],
            alpha: 1,
            ttl: 90 + Math.floor(Math.random() * 30),
          });
        }
        particlesRef.current.push(...fresh);
        if (reduced) {
          // Single static frame, no animation.
          draw();
          window.setTimeout(() => {
            particlesRef.current = [];
            draw();
          }, 1500);
          return;
        }
        if (rafRef.current === null) {
          rafRef.current = requestAnimationFrame(tick);
        }
      },
      [particleCount, spread, origin, colors, reduced, tick, draw],
    );

    useImperativeHandle(ref, () => ({ fire }), [fire]);

    // Re-fire whenever `trigger` changes (only if it's truthy).
    useEffect(() => {
      if (trigger) fire();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [trigger]);

    useEffect(() => {
      return () => {
        if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      };
    }, []);

    return (
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className={className}
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex,
          ...style,
        }}
      />
    );
  },
);

TkxConfetti.displayName = 'TkxConfetti';
