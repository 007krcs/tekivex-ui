'use client';

import { useRef, useEffect, useMemo } from 'react';
import { useTheme } from '../themes';
import { sanitizeString } from '../engine/security';
import { useReducedMotion } from '../hooks';
import { tkx } from '../engine/tkx';

// ── Types ────────────────────────────────────────────────────────────────────

export interface TkxQRCodeProps {
  value: string;
  size?: number;
  color?: string;
  bgColor?: string;
  errorLevel?: 'L' | 'M' | 'Q' | 'H';
  icon?: string;
  bordered?: boolean;
}

// ── Hash Utility ─────────────────────────────────────────────────────────────

function simpleHash(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

// Deterministic PRNG from seed
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) | 0;
    return ((s >>> 0) / 0xffffffff);
  };
}

// ── Grid Generator ───────────────────────────────────────────────────────────

const ERROR_DENSITY: Record<string, number> = { L: 0.38, M: 0.42, Q: 0.48, H: 0.55 };

function generateGrid(value: string, gridSize: number, errorLevel: string): boolean[][] {
  const hash = simpleHash(value);
  const rand = seededRandom(hash);
  const density = ERROR_DENSITY[errorLevel] ?? 0.42;
  const grid: boolean[][] = Array.from({ length: gridSize }, () =>
    Array.from({ length: gridSize }, () => false),
  );

  // Finder patterns (top-left, top-right, bottom-left)
  const drawFinder = (startR: number, startC: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const isEdge = r === 0 || r === 6 || c === 0 || c === 6;
        const isInner = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        grid[startR + r][startC + c] = isEdge || isInner;
      }
    }
  };

  drawFinder(0, 0);
  drawFinder(0, gridSize - 7);
  drawFinder(gridSize - 7, 0);

  // Timing patterns
  for (let i = 7; i < gridSize - 7; i++) {
    grid[6][i] = i % 2 === 0;
    grid[i][6] = i % 2 === 0;
  }

  // Data area: fill with deterministic pseudo-random pattern
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      const inFinder =
        (r < 8 && c < 8) ||
        (r < 8 && c >= gridSize - 8) ||
        (r >= gridSize - 8 && c < 8);
      const isTiming = r === 6 || c === 6;
      if (inFinder || isTiming) continue;
      grid[r][c] = rand() < density;
    }
  }

  return grid;
}

// ── Component ────────────────────────────────────────────────────────────────

export function TkxQRCode({
  value,
  size = 160,
  color,
  bgColor,
  errorLevel = 'M',
  icon,
  bordered = true,
}: TkxQRCodeProps) {
  const theme = useTheme();
  const reducedMotion = useReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const safeValue = sanitizeString(value);
  const fg = color ?? theme.text;
  const bg = bgColor ?? theme.surface;

  const gridSize = 25;
  const grid = useMemo(
    () => generateGrid(safeValue, gridSize, errorLevel),
    [safeValue, errorLevel],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const cellSize = size / gridSize;

    // Background
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, size, size);

    // Cells
    ctx.fillStyle = fg;
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        if (grid[r][c]) {
          ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize);
        }
      }
    }

    // Center icon area (clear a zone for icon)
    if (icon) {
      const iconSize = size * 0.22;
      const offset = (size - iconSize) / 2;
      ctx.fillStyle = bg;
      ctx.fillRect(offset - 2, offset - 2, iconSize + 4, iconSize + 4);

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        ctx.drawImage(img, offset, offset, iconSize, iconSize);
      };
      img.src = sanitizeString(icon);
    }
  }, [grid, size, fg, bg, icon]);

  return (
    <div
      role="img"
      aria-label={`QR code for: ${safeValue}`}
      className={tkx('inline-block rounded-lg')}
      style={{
        padding: bordered ? 12 : 0,
        backgroundColor: bordered ? bg : 'transparent',
        border: bordered ? `1px solid ${theme.border}` : 'none',
        lineHeight: 0,
        animation: reducedMotion ? 'none' : 'tkxFadeIn 0.2s ease',
      }}
    >
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{ width: size, height: size, display: 'block' }}
      />
    </div>
  );
}