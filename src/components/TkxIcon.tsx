'use client';

import { forwardRef, type ReactNode, type SVGAttributes } from 'react';
import { useTheme } from '../themes';
import { tkx, cx } from '../engine/tkx';

// ── Icon Name Type ─────────────────────────────────────────────────────────────

export type IconName =
  // Navigation
  | 'home' | 'menu' | 'x' | 'chevron-up' | 'chevron-down' | 'chevron-left' | 'chevron-right'
  | 'arrow-up' | 'arrow-down' | 'arrow-left' | 'arrow-right' | 'arrow-up-right'
  | 'external-link' | 'link' | 'anchor'
  // Actions
  | 'search' | 'filter' | 'sort' | 'refresh' | 'download' | 'upload' | 'share'
  | 'copy' | 'edit' | 'trash' | 'plus' | 'minus' | 'check' | 'x-circle'
  | 'check-circle' | 'info-circle' | 'alert-triangle' | 'alert-circle'
  // UI
  | 'eye' | 'eye-off' | 'settings' | 'sliders' | 'grid' | 'list' | 'columns'
  | 'layout' | 'sidebar' | 'maximize' | 'minimize' | 'moon' | 'sun' | 'bell' | 'bell-off'
  // Media
  | 'play' | 'pause' | 'stop' | 'skip-back' | 'skip-forward' | 'volume' | 'volume-off'
  | 'image' | 'video' | 'mic' | 'mic-off' | 'camera'
  // Data
  | 'chart-bar' | 'chart-line' | 'chart-pie' | 'trending-up' | 'trending-down'
  | 'activity' | 'database' | 'server' | 'cpu' | 'memory'
  // Commerce
  | 'shopping-cart' | 'package' | 'tag' | 'credit-card' | 'dollar' | 'percent'
  | 'gift' | 'truck' | 'warehouse' | 'box'
  // Communication
  | 'mail' | 'message' | 'phone' | 'user' | 'users' | 'team' | 'star' | 'heart'
  | 'bookmark' | 'flag' | 'globe'
  // Files
  | 'file' | 'file-text' | 'folder' | 'folder-open' | 'code' | 'terminal'
  | 'lock' | 'unlock' | 'key' | 'shield';

// ── Props ──────────────────────────────────────────────────────────────────────

export interface TkxIconProps extends Omit<SVGAttributes<SVGSVGElement>, 'children'> {
  name?: IconName;
  size?: number | string;
  color?: string;
  strokeWidth?: number;
  filled?: boolean;
  label?: string;
  className?: string;
  style?: React.CSSProperties;
  children?: ReactNode;
}

// ── Icon Path Definitions ──────────────────────────────────────────────────────
// Each entry is an array of path/shape descriptors rendered inside a 24×24 viewBox.

type PathDescriptor =
  | { type: 'path'; d: string }
  | { type: 'circle'; cx: number; cy: number; r: number }
  | { type: 'rect'; x: number; y: number; width: number; height: number; rx?: number }
  | { type: 'line'; x1: number; y1: number; x2: number; y2: number }
  | { type: 'polyline'; points: string }
  | { type: 'polygon'; points: string };

const ICONS: Record<IconName, PathDescriptor[]> = {
  // ── Navigation ───────────────────────────────────────────────────────────────
  home: [
    { type: 'path', d: 'M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9.5z' },
    { type: 'path', d: 'M9 21V12h6v9' },
  ],
  menu: [
    { type: 'line', x1: 3, y1: 6, x2: 21, y2: 6 },
    { type: 'line', x1: 3, y1: 12, x2: 21, y2: 12 },
    { type: 'line', x1: 3, y1: 18, x2: 21, y2: 18 },
  ],
  x: [
    { type: 'line', x1: 18, y1: 6, x2: 6, y2: 18 },
    { type: 'line', x1: 6, y1: 6, x2: 18, y2: 18 },
  ],
  'chevron-up': [
    { type: 'polyline', points: '18 15 12 9 6 15' },
  ],
  'chevron-down': [
    { type: 'polyline', points: '6 9 12 15 18 9' },
  ],
  'chevron-left': [
    { type: 'polyline', points: '15 18 9 12 15 6' },
  ],
  'chevron-right': [
    { type: 'polyline', points: '9 18 15 12 9 6' },
  ],
  'arrow-up': [
    { type: 'line', x1: 12, y1: 19, x2: 12, y2: 5 },
    { type: 'polyline', points: '5 12 12 5 19 12' },
  ],
  'arrow-down': [
    { type: 'line', x1: 12, y1: 5, x2: 12, y2: 19 },
    { type: 'polyline', points: '19 12 12 19 5 12' },
  ],
  'arrow-left': [
    { type: 'line', x1: 19, y1: 12, x2: 5, y2: 12 },
    { type: 'polyline', points: '12 19 5 12 12 5' },
  ],
  'arrow-right': [
    { type: 'line', x1: 5, y1: 12, x2: 19, y2: 12 },
    { type: 'polyline', points: '12 5 19 12 12 19' },
  ],
  'arrow-up-right': [
    { type: 'line', x1: 7, y1: 17, x2: 17, y2: 7 },
    { type: 'polyline', points: '7 7 17 7 17 17' },
  ],
  'external-link': [
    { type: 'path', d: 'M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6' },
    { type: 'polyline', points: '15 3 21 3 21 9' },
    { type: 'line', x1: 10, y1: 14, x2: 21, y2: 3 },
  ],
  link: [
    { type: 'path', d: 'M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71' },
    { type: 'path', d: 'M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71' },
  ],
  anchor: [
    { type: 'circle', cx: 12, cy: 5, r: 3 },
    { type: 'line', x1: 12, y1: 8, x2: 12, y2: 21 },
    { type: 'path', d: 'M5 12H2a10 10 0 0 0 20 0h-3' },
  ],

  // ── Actions ──────────────────────────────────────────────────────────────────
  search: [
    { type: 'circle', cx: 11, cy: 11, r: 8 },
    { type: 'line', x1: 21, y1: 21, x2: 16.65, y2: 16.65 },
  ],
  filter: [
    { type: 'polygon', points: '22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3' },
  ],
  sort: [
    { type: 'line', x1: 3, y1: 6, x2: 21, y2: 6 },
    { type: 'line', x1: 6, y1: 12, x2: 18, y2: 12 },
    { type: 'line', x1: 9, y1: 18, x2: 15, y2: 18 },
  ],
  refresh: [
    { type: 'polyline', points: '23 4 23 10 17 10' },
    { type: 'polyline', points: '1 20 1 14 7 14' },
    { type: 'path', d: 'M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15' },
  ],
  download: [
    { type: 'path', d: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' },
    { type: 'polyline', points: '7 10 12 15 17 10' },
    { type: 'line', x1: 12, y1: 15, x2: 12, y2: 3 },
  ],
  upload: [
    { type: 'path', d: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' },
    { type: 'polyline', points: '17 8 12 3 7 8' },
    { type: 'line', x1: 12, y1: 3, x2: 12, y2: 15 },
  ],
  share: [
    { type: 'circle', cx: 18, cy: 5, r: 3 },
    { type: 'circle', cx: 6, cy: 12, r: 3 },
    { type: 'circle', cx: 18, cy: 19, r: 3 },
    { type: 'line', x1: 8.59, y1: 13.51, x2: 15.42, y2: 17.49 },
    { type: 'line', x1: 15.41, y1: 6.51, x2: 8.59, y2: 10.49 },
  ],
  copy: [
    { type: 'rect', x: 9, y: 9, width: 13, height: 13, rx: 2 },
    { type: 'path', d: 'M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1' },
  ],
  edit: [
    { type: 'path', d: 'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7' },
    { type: 'path', d: 'M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z' },
  ],
  trash: [
    { type: 'polyline', points: '3 6 5 6 21 6' },
    { type: 'path', d: 'M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6' },
    { type: 'path', d: 'M10 11v6M14 11v6' },
    { type: 'path', d: 'M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2' },
  ],
  plus: [
    { type: 'line', x1: 12, y1: 5, x2: 12, y2: 19 },
    { type: 'line', x1: 5, y1: 12, x2: 19, y2: 12 },
  ],
  minus: [
    { type: 'line', x1: 5, y1: 12, x2: 19, y2: 12 },
  ],
  check: [
    { type: 'polyline', points: '20 6 9 17 4 12' },
  ],
  'x-circle': [
    { type: 'circle', cx: 12, cy: 12, r: 10 },
    { type: 'line', x1: 15, y1: 9, x2: 9, y2: 15 },
    { type: 'line', x1: 9, y1: 9, x2: 15, y2: 15 },
  ],
  'check-circle': [
    { type: 'path', d: 'M22 11.08V12a10 10 0 1 1-5.93-9.14' },
    { type: 'polyline', points: '22 4 12 14.01 9 11.01' },
  ],
  'info-circle': [
    { type: 'circle', cx: 12, cy: 12, r: 10 },
    { type: 'line', x1: 12, y1: 8, x2: 12, y2: 12 },
    { type: 'line', x1: 12, y1: 16, x2: 12.01, y2: 16 },
  ],
  'alert-triangle': [
    { type: 'path', d: 'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z' },
    { type: 'line', x1: 12, y1: 9, x2: 12, y2: 13 },
    { type: 'line', x1: 12, y1: 17, x2: 12.01, y2: 17 },
  ],
  'alert-circle': [
    { type: 'circle', cx: 12, cy: 12, r: 10 },
    { type: 'line', x1: 12, y1: 8, x2: 12, y2: 12 },
    { type: 'line', x1: 12, y1: 16, x2: 12.01, y2: 16 },
  ],

  // ── UI ────────────────────────────────────────────────────────────────────────
  eye: [
    { type: 'path', d: 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z' },
    { type: 'circle', cx: 12, cy: 12, r: 3 },
  ],
  'eye-off': [
    { type: 'path', d: 'M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94' },
    { type: 'path', d: 'M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19' },
    { type: 'line', x1: 1, y1: 1, x2: 23, y2: 23 },
    { type: 'path', d: 'M10.73 10.73a3 3 0 0 0 4.24 4.24' },
  ],
  settings: [
    { type: 'circle', cx: 12, cy: 12, r: 3 },
    { type: 'path', d: 'M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z' },
  ],
  sliders: [
    { type: 'line', x1: 4, y1: 21, x2: 4, y2: 14 },
    { type: 'line', x1: 4, y1: 10, x2: 4, y2: 3 },
    { type: 'line', x1: 12, y1: 21, x2: 12, y2: 12 },
    { type: 'line', x1: 12, y1: 8, x2: 12, y2: 3 },
    { type: 'line', x1: 20, y1: 21, x2: 20, y2: 16 },
    { type: 'line', x1: 20, y1: 12, x2: 20, y2: 3 },
    { type: 'line', x1: 1, y1: 14, x2: 7, y2: 14 },
    { type: 'line', x1: 9, y1: 8, x2: 15, y2: 8 },
    { type: 'line', x1: 17, y1: 16, x2: 23, y2: 16 },
  ],
  grid: [
    { type: 'rect', x: 3, y: 3, width: 7, height: 7 },
    { type: 'rect', x: 14, y: 3, width: 7, height: 7 },
    { type: 'rect', x: 14, y: 14, width: 7, height: 7 },
    { type: 'rect', x: 3, y: 14, width: 7, height: 7 },
  ],
  list: [
    { type: 'line', x1: 8, y1: 6, x2: 21, y2: 6 },
    { type: 'line', x1: 8, y1: 12, x2: 21, y2: 12 },
    { type: 'line', x1: 8, y1: 18, x2: 21, y2: 18 },
    { type: 'line', x1: 3, y1: 6, x2: 3.01, y2: 6 },
    { type: 'line', x1: 3, y1: 12, x2: 3.01, y2: 12 },
    { type: 'line', x1: 3, y1: 18, x2: 3.01, y2: 18 },
  ],
  columns: [
    { type: 'path', d: 'M12 3h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7m0-18H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h7m0-18v18' },
  ],
  layout: [
    { type: 'rect', x: 3, y: 3, width: 18, height: 18, rx: 2 },
    { type: 'line', x1: 3, y1: 9, x2: 21, y2: 9 },
    { type: 'line', x1: 9, y1: 21, x2: 9, y2: 9 },
  ],
  sidebar: [
    { type: 'rect', x: 3, y: 3, width: 18, height: 18, rx: 2 },
    { type: 'line', x1: 9, y1: 3, x2: 9, y2: 21 },
  ],
  maximize: [
    { type: 'path', d: 'M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3' },
  ],
  minimize: [
    { type: 'path', d: 'M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3' },
  ],
  moon: [
    { type: 'path', d: 'M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z' },
  ],
  sun: [
    { type: 'circle', cx: 12, cy: 12, r: 5 },
    { type: 'line', x1: 12, y1: 1, x2: 12, y2: 3 },
    { type: 'line', x1: 12, y1: 21, x2: 12, y2: 23 },
    { type: 'line', x1: 4.22, y1: 4.22, x2: 5.64, y2: 5.64 },
    { type: 'line', x1: 18.36, y1: 18.36, x2: 19.78, y2: 19.78 },
    { type: 'line', x1: 1, y1: 12, x2: 3, y2: 12 },
    { type: 'line', x1: 21, y1: 12, x2: 23, y2: 12 },
    { type: 'line', x1: 4.22, y1: 19.78, x2: 5.64, y2: 18.36 },
    { type: 'line', x1: 18.36, y1: 5.64, x2: 19.78, y2: 4.22 },
  ],
  bell: [
    { type: 'path', d: 'M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9' },
    { type: 'path', d: 'M13.73 21a2 2 0 0 1-3.46 0' },
  ],
  'bell-off': [
    { type: 'path', d: 'M13.73 21a2 2 0 0 1-3.46 0' },
    { type: 'path', d: 'M18.63 13A17.89 17.89 0 0 1 18 8' },
    { type: 'path', d: 'M6.26 6.26A5.86 5.86 0 0 0 6 8c0 7-3 9-3 9h14' },
    { type: 'path', d: 'M18 8a6 6 0 0 0-9.33-5' },
    { type: 'line', x1: 1, y1: 1, x2: 23, y2: 23 },
  ],

  // ── Media ─────────────────────────────────────────────────────────────────────
  play: [
    { type: 'polygon', points: '5 3 19 12 5 21 5 3' },
  ],
  pause: [
    { type: 'rect', x: 6, y: 4, width: 4, height: 16 },
    { type: 'rect', x: 14, y: 4, width: 4, height: 16 },
  ],
  stop: [
    { type: 'rect', x: 4, y: 4, width: 16, height: 16 },
  ],
  'skip-back': [
    { type: 'polygon', points: '19 20 9 12 19 4 19 20' },
    { type: 'line', x1: 5, y1: 19, x2: 5, y2: 5 },
  ],
  'skip-forward': [
    { type: 'polygon', points: '5 4 15 12 5 20 5 4' },
    { type: 'line', x1: 19, y1: 5, x2: 19, y2: 19 },
  ],
  volume: [
    { type: 'polygon', points: '11 5 6 9 2 9 2 15 6 15 11 19 11 5' },
    { type: 'path', d: 'M15.54 8.46a5 5 0 0 1 0 7.07' },
    { type: 'path', d: 'M19.07 4.93a10 10 0 0 1 0 14.14' },
  ],
  'volume-off': [
    { type: 'polygon', points: '11 5 6 9 2 9 2 15 6 15 11 19 11 5' },
    { type: 'line', x1: 23, y1: 9, x2: 17, y2: 15 },
    { type: 'line', x1: 17, y1: 9, x2: 23, y2: 15 },
  ],
  image: [
    { type: 'rect', x: 3, y: 3, width: 18, height: 18, rx: 2 },
    { type: 'circle', cx: 8.5, cy: 8.5, r: 1.5 },
    { type: 'polyline', points: '21 15 16 10 5 21' },
  ],
  video: [
    { type: 'polygon', points: '23 7 16 12 23 17 23 7' },
    { type: 'rect', x: 1, y: 5, width: 15, height: 14, rx: 2 },
  ],
  mic: [
    { type: 'path', d: 'M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z' },
    { type: 'path', d: 'M19 10v2a7 7 0 0 1-14 0v-2' },
    { type: 'line', x1: 12, y1: 19, x2: 12, y2: 23 },
    { type: 'line', x1: 8, y1: 23, x2: 16, y2: 23 },
  ],
  'mic-off': [
    { type: 'line', x1: 1, y1: 1, x2: 23, y2: 23 },
    { type: 'path', d: 'M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6' },
    { type: 'path', d: 'M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23' },
    { type: 'line', x1: 12, y1: 19, x2: 12, y2: 23 },
    { type: 'line', x1: 8, y1: 23, x2: 16, y2: 23 },
  ],
  camera: [
    { type: 'path', d: 'M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z' },
    { type: 'circle', cx: 12, cy: 13, r: 4 },
  ],

  // ── Data ──────────────────────────────────────────────────────────────────────
  'chart-bar': [
    { type: 'line', x1: 18, y1: 20, x2: 18, y2: 10 },
    { type: 'line', x1: 12, y1: 20, x2: 12, y2: 4 },
    { type: 'line', x1: 6, y1: 20, x2: 6, y2: 14 },
    { type: 'line', x1: 2, y1: 20, x2: 22, y2: 20 },
  ],
  'chart-line': [
    { type: 'polyline', points: '22 12 18 12 15 21 9 3 6 12 2 12' },
  ],
  'chart-pie': [
    { type: 'path', d: 'M21.21 15.89A10 10 0 1 1 8 2.83' },
    { type: 'path', d: 'M22 12A10 10 0 0 0 12 2v10z' },
  ],
  'trending-up': [
    { type: 'polyline', points: '23 6 13.5 15.5 8.5 10.5 1 18' },
    { type: 'polyline', points: '17 6 23 6 23 12' },
  ],
  'trending-down': [
    { type: 'polyline', points: '23 18 13.5 8.5 8.5 13.5 1 6' },
    { type: 'polyline', points: '17 18 23 18 23 12' },
  ],
  activity: [
    { type: 'polyline', points: '22 12 18 12 15 21 9 3 6 12 2 12' },
  ],
  database: [
    { type: 'ellipse', cx: 12, cy: 5, rx: 9, ry: 3 } as unknown as PathDescriptor,
    { type: 'path', d: 'M21 12c0 1.66-4 3-9 3s-9-1.34-9-3' },
    { type: 'path', d: 'M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5' },
  ],
  server: [
    { type: 'rect', x: 2, y: 2, width: 20, height: 8, rx: 2 },
    { type: 'rect', x: 2, y: 14, width: 20, height: 8, rx: 2 },
    { type: 'line', x1: 6, y1: 6, x2: 6.01, y2: 6 },
    { type: 'line', x1: 6, y1: 18, x2: 6.01, y2: 18 },
  ],
  cpu: [
    { type: 'rect', x: 4, y: 4, width: 16, height: 16, rx: 2 },
    { type: 'rect', x: 9, y: 9, width: 6, height: 6 },
    { type: 'line', x1: 9, y1: 1, x2: 9, y2: 4 },
    { type: 'line', x1: 15, y1: 1, x2: 15, y2: 4 },
    { type: 'line', x1: 9, y1: 20, x2: 9, y2: 23 },
    { type: 'line', x1: 15, y1: 20, x2: 15, y2: 23 },
    { type: 'line', x1: 20, y1: 9, x2: 23, y2: 9 },
    { type: 'line', x1: 20, y1: 14, x2: 23, y2: 14 },
    { type: 'line', x1: 1, y1: 9, x2: 4, y2: 9 },
    { type: 'line', x1: 1, y1: 14, x2: 4, y2: 14 },
  ],
  memory: [
    { type: 'path', d: 'M6 19v-3M10 19v-3M14 19v-3M18 19v-3' },
    { type: 'rect', x: 2, y: 6, width: 20, height: 10, rx: 2 },
    { type: 'path', d: 'M6 10h.01M10 10h.01M14 10h.01M18 10h.01' },
  ],

  // ── Commerce ──────────────────────────────────────────────────────────────────
  'shopping-cart': [
    { type: 'circle', cx: 9, cy: 21, r: 1 },
    { type: 'circle', cx: 20, cy: 21, r: 1 },
    { type: 'path', d: 'M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6' },
  ],
  package: [
    { type: 'line', x1: 16.5, y1: 9.4, x2: 7.55, y2: 4.24 },
    { type: 'path', d: 'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z' },
    { type: 'polyline', points: '3.27 6.96 12 12.01 20.73 6.96' },
    { type: 'line', x1: 12, y1: 22.08, x2: 12, y2: 12 },
  ],
  tag: [
    { type: 'path', d: 'M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z' },
    { type: 'line', x1: 7, y1: 7, x2: 7.01, y2: 7 },
  ],
  'credit-card': [
    { type: 'rect', x: 1, y: 4, width: 22, height: 16, rx: 2 },
    { type: 'line', x1: 1, y1: 10, x2: 23, y2: 10 },
  ],
  dollar: [
    { type: 'line', x1: 12, y1: 1, x2: 12, y2: 23 },
    { type: 'path', d: 'M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6' },
  ],
  percent: [
    { type: 'line', x1: 19, y1: 5, x2: 5, y2: 19 },
    { type: 'circle', cx: 6.5, cy: 6.5, r: 2.5 },
    { type: 'circle', cx: 17.5, cy: 17.5, r: 2.5 },
  ],
  gift: [
    { type: 'polyline', points: '20 12 20 22 4 22 4 12' },
    { type: 'rect', x: 2, y: 7, width: 20, height: 5 },
    { type: 'line', x1: 12, y1: 22, x2: 12, y2: 7 },
    { type: 'path', d: 'M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z' },
    { type: 'path', d: 'M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z' },
  ],
  truck: [
    { type: 'rect', x: 1, y: 3, width: 15, height: 13 },
    { type: 'polygon', points: '16 8 20 8 23 11 23 16 16 16 16 8' },
    { type: 'circle', cx: 5.5, cy: 18.5, r: 2.5 },
    { type: 'circle', cx: 18.5, cy: 18.5, r: 2.5 },
  ],
  warehouse: [
    { type: 'path', d: 'M22 20v-9H2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2z' },
    { type: 'path', d: 'M2 11L12 2l10 9' },
    { type: 'path', d: 'M9 20v-5h6v5' },
  ],
  box: [
    { type: 'path', d: 'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z' },
    { type: 'polyline', points: '3.27 6.96 12 12.01 20.73 6.96' },
    { type: 'line', x1: 12, y1: 22.08, x2: 12, y2: 12 },
  ],

  // ── Communication ─────────────────────────────────────────────────────────────
  mail: [
    { type: 'path', d: 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z' },
    { type: 'polyline', points: '22 6 12 13 2 6' },
  ],
  message: [
    { type: 'path', d: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' },
  ],
  phone: [
    { type: 'path', d: 'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z' },
  ],
  user: [
    { type: 'path', d: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2' },
    { type: 'circle', cx: 12, cy: 7, r: 4 },
  ],
  users: [
    { type: 'path', d: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2' },
    { type: 'circle', cx: 9, cy: 7, r: 4 },
    { type: 'path', d: 'M23 21v-2a4 4 0 0 0-3-3.87' },
    { type: 'path', d: 'M16 3.13a4 4 0 0 1 0 7.75' },
  ],
  team: [
    { type: 'path', d: 'M12 20v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2' },
    { type: 'circle', cx: 9, cy: 10, r: 3 },
    { type: 'path', d: 'M22 20v-2a4 4 0 0 0-3-3.87' },
    { type: 'path', d: 'M15 6.13a4 4 0 0 1 0 7.75' },
    { type: 'circle', cx: 17, cy: 10, r: 3 },
  ],
  star: [
    { type: 'polygon', points: '12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2' },
  ],
  heart: [
    { type: 'path', d: 'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z' },
  ],
  bookmark: [
    { type: 'path', d: 'M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z' },
  ],
  flag: [
    { type: 'path', d: 'M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z' },
    { type: 'line', x1: 4, y1: 22, x2: 4, y2: 15 },
  ],
  globe: [
    { type: 'circle', cx: 12, cy: 12, r: 10 },
    { type: 'line', x1: 2, y1: 12, x2: 22, y2: 12 },
    { type: 'path', d: 'M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z' },
  ],

  // ── Files ─────────────────────────────────────────────────────────────────────
  file: [
    { type: 'path', d: 'M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z' },
    { type: 'polyline', points: '13 2 13 9 20 9' },
  ],
  'file-text': [
    { type: 'path', d: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' },
    { type: 'polyline', points: '14 2 14 8 20 8' },
    { type: 'line', x1: 16, y1: 13, x2: 8, y2: 13 },
    { type: 'line', x1: 16, y1: 17, x2: 8, y2: 17 },
    { type: 'polyline', points: '10 9 9 9 8 9' },
  ],
  folder: [
    { type: 'path', d: 'M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z' },
  ],
  'folder-open': [
    { type: 'path', d: 'M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z' },
    { type: 'line', x1: 2, y1: 10, x2: 22, y2: 10 },
  ],
  code: [
    { type: 'polyline', points: '16 18 22 12 16 6' },
    { type: 'polyline', points: '8 6 2 12 8 18' },
  ],
  terminal: [
    { type: 'polyline', points: '4 17 10 11 4 5' },
    { type: 'line', x1: 12, y1: 19, x2: 20, y2: 19 },
  ],
  lock: [
    { type: 'rect', x: 3, y: 11, width: 18, height: 11, rx: 2 },
    { type: 'path', d: 'M7 11V7a5 5 0 0 1 10 0v4' },
  ],
  unlock: [
    { type: 'rect', x: 3, y: 11, width: 18, height: 11, rx: 2 },
    { type: 'path', d: 'M7 11V7a5 5 0 0 1 9.9-1' },
  ],
  key: [
    { type: 'path', d: 'M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4' },
  ],
  shield: [
    { type: 'path', d: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' },
  ],
};

// ── Renderer ───────────────────────────────────────────────────────────────────

function renderDescriptor(
  desc: PathDescriptor,
  index: number,
  strokeProps: React.SVGProps<SVGElement>,
): ReactNode {
  const key = index;
  switch (desc.type) {
    case 'path':
      return <path key={key} d={desc.d} {...(strokeProps as React.SVGProps<SVGPathElement>)} />;
    case 'circle':
      return <circle key={key} cx={desc.cx} cy={desc.cy} r={desc.r} {...(strokeProps as React.SVGProps<SVGCircleElement>)} />;
    case 'rect':
      return <rect key={key} x={desc.x} y={desc.y} width={desc.width} height={desc.height} rx={desc.rx} {...(strokeProps as React.SVGProps<SVGRectElement>)} />;
    case 'line':
      return <line key={key} x1={desc.x1} y1={desc.y1} x2={desc.x2} y2={desc.y2} {...(strokeProps as React.SVGProps<SVGLineElement>)} />;
    case 'polyline':
      return <polyline key={key} points={desc.points} {...(strokeProps as React.SVGProps<SVGPolylineElement>)} />;
    case 'polygon':
      return <polygon key={key} points={desc.points} {...(strokeProps as React.SVGProps<SVGPolygonElement>)} />;
    default:
      return null;
  }
}

// ── Token resolver ─────────────────────────────────────────────────────────────

const THEME_TOKEN_KEYS = new Set([
  'bg', 'surface', 'surfaceAlt', 'border', 'text', 'textMuted',
  'primary', 'secondary', 'danger', 'warning', 'success', 'info',
]);

function resolveColor(color: string, theme: Record<string, string>): string {
  if (THEME_TOKEN_KEYS.has(color)) {
    return theme[color] ?? color;
  }
  return color;
}

// ── TkxIcon Component ──────────────────────────────────────────────────────────

export const TkxIcon = forwardRef<SVGSVGElement, TkxIconProps>(
  (
    {
      name,
      size = 24,
      color = 'currentColor',
      strokeWidth = 2,
      filled = false,
      label,
      className,
      style,
      children,
      ...rest
    },
    ref,
  ) => {
    const theme = useTheme();
    const resolvedColor = resolveColor(color, theme as unknown as Record<string, string>);

    const descriptors = name ? ICONS[name] : null;

    const strokeProps: React.SVGProps<SVGElement> = filled
      ? { fill: resolvedColor, stroke: 'none' }
      : {
          fill: 'none',
          stroke: resolvedColor,
          strokeWidth,
          strokeLinecap: 'round' as const,
          strokeLinejoin: 'round' as const,
        };

    const isDecorative = !label;

    const svgClass = tkx('inline-block shrink-0', className ?? '');

    return (
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width={size}
        height={size}
        className={cx(svgClass, className)}
        style={style}
        aria-hidden={isDecorative ? 'true' : undefined}
        role={!isDecorative ? 'img' : undefined}
        aria-label={!isDecorative ? label : undefined}
        focusable="false"
        {...rest}
      >
        {!isDecorative && <title>{label}</title>}
        {children ?? (descriptors
          ? descriptors.map((desc, i) => renderDescriptor(desc, i, strokeProps))
          : null)}
      </svg>
    );
  },
);

TkxIcon.displayName = 'TkxIcon';

// ── Category Map (exported for documentation use) ──────────────────────────────

export const ICON_CATEGORIES: Record<string, IconName[]> = {
  Navigation: [
    'home', 'menu', 'x', 'chevron-up', 'chevron-down', 'chevron-left', 'chevron-right',
    'arrow-up', 'arrow-down', 'arrow-left', 'arrow-right', 'arrow-up-right',
    'external-link', 'link', 'anchor',
  ],
  Actions: [
    'search', 'filter', 'sort', 'refresh', 'download', 'upload', 'share',
    'copy', 'edit', 'trash', 'plus', 'minus', 'check', 'x-circle',
    'check-circle', 'info-circle', 'alert-triangle', 'alert-circle',
  ],
  UI: [
    'eye', 'eye-off', 'settings', 'sliders', 'grid', 'list', 'columns',
    'layout', 'sidebar', 'maximize', 'minimize', 'moon', 'sun', 'bell', 'bell-off',
  ],
  Media: [
    'play', 'pause', 'stop', 'skip-back', 'skip-forward', 'volume', 'volume-off',
    'image', 'video', 'mic', 'mic-off', 'camera',
  ],
  Data: [
    'chart-bar', 'chart-line', 'chart-pie', 'trending-up', 'trending-down',
    'activity', 'database', 'server', 'cpu', 'memory',
  ],
  Commerce: [
    'shopping-cart', 'package', 'tag', 'credit-card', 'dollar', 'percent',
    'gift', 'truck', 'warehouse', 'box',
  ],
  Communication: [
    'mail', 'message', 'phone', 'user', 'users', 'team', 'star', 'heart',
    'bookmark', 'flag', 'globe',
  ],
  Files: [
    'file', 'file-text', 'folder', 'folder-open', 'code', 'terminal',
    'lock', 'unlock', 'key', 'shield',
  ],
};