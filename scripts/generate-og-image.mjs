/**
 * Generates demo/public/og-image.png (1200 × 630)
 * Uses zero external dependencies — only Node.js built-ins (zlib, fs).
 *
 * Design: dark background (#0d0d1a) with a teal/purple gradient accent,
 * a grid dot-pattern, and text that most OG crawlers will render.
 * Because raw pixel PNG can't embed vector fonts, the "text" is encoded
 * as inline SVG data → which browsers/Slack/Discord render fine, and
 * for Twitter we write a real raster PNG whose background communicates
 * the brand even without crisp text.
 *
 * For full-text raster OG images you'd need `canvas` / puppeteer.
 * This script creates a beautiful branded background PNG that works
 * universally, plus an SVG version with text.
 */

import { deflateSync } from 'zlib';
import { writeFileSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, '..', 'demo', 'public');

// ── PNG encoder ───────────────────────────────────────────────────────────────

function crc32(buf) {
  const table = (() => {
    const t = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      t[n] = c;
    }
    return t;
  })();
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = table[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBytes = Buffer.from(type, 'ascii');
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length, 0);
  const payload = Buffer.concat([typeBytes, data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(payload), 0);
  return Buffer.concat([len, payload, crc]);
}

function buildPNG(width, height, getPixel) {
  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0); ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; ihdr[9] = 2; // 8-bit depth, RGB
  ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;

  // Raw image data: filter byte (0) + RGB per row
  const raw = Buffer.alloc(height * (1 + width * 3));
  let off = 0;
  for (let y = 0; y < height; y++) {
    raw[off++] = 0; // filter none
    for (let x = 0; x < width; x++) {
      const [r, g, b] = getPixel(x, y);
      raw[off++] = r; raw[off++] = g; raw[off++] = b;
    }
  }

  const idat = deflateSync(raw, { level: 6 });
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// ── Design ────────────────────────────────────────────────────────────────────

const W = 1200, H = 630;

// Parse hex color to [r, g, b]
function hex(h) {
  const v = parseInt(h.replace('#', ''), 16);
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
}

function lerp(a, b, t) { return a + (b - a) * t; }

function lerpColor(c1, c2, t) {
  return [
    Math.round(lerp(c1[0], c2[0], t)),
    Math.round(lerp(c1[1], c2[1], t)),
    Math.round(lerp(c1[2], c2[2], t)),
  ];
}

function clamp(v) { return Math.max(0, Math.min(255, Math.round(v))); }

const BG    = hex('#0a0a18');   // very dark navy
const TEAL  = hex('#00f5d4');   // brand primary
const PURP  = hex('#7c3aed');   // brand secondary
const BLUE  = hex('#06b6d4');   // accent

function getPixel(x, y) {
  // Base background
  let [r, g, b] = [...BG];

  // Radial gradient from bottom-left (teal accent)
  const dx1 = x / W, dy1 = 1 - y / H;
  const dist1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
  const glow1 = Math.max(0, 1 - dist1 / 0.8);
  r = lerp(r, TEAL[0], glow1 * 0.18);
  g = lerp(g, TEAL[1], glow1 * 0.18);
  b = lerp(b, TEAL[2], glow1 * 0.18);

  // Radial gradient from top-right (purple accent)
  const dx2 = 1 - x / W, dy2 = y / H;
  const dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
  const glow2 = Math.max(0, 1 - dist2 / 0.7);
  r = lerp(r, PURP[0], glow2 * 0.22);
  g = lerp(g, PURP[1], glow2 * 0.22);
  b = lerp(b, PURP[2], glow2 * 0.22);

  // Dot grid
  const gx = x % 40, gy = y % 40;
  const dot = (gx < 2 && gy < 2) ? 0.12 : 0;
  r = lerp(r, TEAL[0], dot);
  g = lerp(g, TEAL[1], dot);
  b = lerp(b, TEAL[2], dot);

  // Horizontal scan line shimmer (subtle)
  const scan = Math.abs(Math.sin((y - 180) * 0.012)) * 0.06;
  r = lerp(r, BLUE[0], scan);
  g = lerp(g, BLUE[1], scan);
  b = lerp(b, BLUE[2], scan);

  // Border glow (thin bright frame)
  const edgeX = Math.min(x, W - x) / W;
  const edgeY = Math.min(y, H - y) / H;
  const edge = Math.max(0, 0.008 - Math.min(edgeX, edgeY)) / 0.008;
  r = lerp(r, TEAL[0], edge * 0.5);
  g = lerp(g, TEAL[1], edge * 0.5);
  b = lerp(b, TEAL[2], edge * 0.5);

  return [clamp(r), clamp(g), clamp(b)];
}

// ── Generate PNG ──────────────────────────────────────────────────────────────

mkdirSync(OUT_DIR, { recursive: true });

console.log('⏳ Generating og-image.png…');
const png = buildPNG(W, H, getPixel);
writeFileSync(join(OUT_DIR, 'og-image.png'), png);
console.log(`✅ og-image.png written (${(png.length / 1024).toFixed(0)} kB)`);

// ── Generate SVG (with text — works in Slack, Discord, iMessage, Telegram) ───

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <radialGradient id="g1" cx="0%" cy="100%" r="80%">
      <stop offset="0%" stop-color="#00f5d4" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="#0a0a18" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="g2" cx="100%" cy="0%" r="70%">
      <stop offset="0%" stop-color="#7c3aed" stop-opacity="0.28"/>
      <stop offset="100%" stop-color="#0a0a18" stop-opacity="0"/>
    </radialGradient>
    <pattern id="dots" width="40" height="40" patternUnits="userSpaceOnUse">
      <rect width="2" height="2" fill="#00f5d4" fill-opacity="0.12"/>
    </pattern>
  </defs>

  <!-- Background -->
  <rect width="1200" height="630" fill="#0a0a18"/>
  <rect width="1200" height="630" fill="url(#g1)"/>
  <rect width="1200" height="630" fill="url(#g2)"/>
  <rect width="1200" height="630" fill="url(#dots)"/>

  <!-- Border glow -->
  <rect x="1" y="1" width="1198" height="628" rx="12" fill="none"
        stroke="#00f5d4" stroke-width="1.5" stroke-opacity="0.35"/>

  <!-- Left accent bar -->
  <rect x="80" y="180" width="4" height="260" rx="2"
        fill="url(#g1)" style="fill:#00f5d4;opacity:0.6"/>

  <!-- Logo mark (T shape) -->
  <g transform="translate(80, 100)">
    <rect width="52" height="52" rx="10" fill="#00f5d4" fill-opacity="0.15"/>
    <path d="M16 38 L26 16 L36 38" stroke="#00f5d4" stroke-width="3"
          stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <line x1="20" y1="31" x2="32" y2="31" stroke="#00f5d4" stroke-width="3"
          stroke-linecap="round"/>
  </g>

  <!-- Brand name -->
  <text x="152" y="140" font-family="-apple-system,BlinkMacSystemFont,Inter,sans-serif"
        font-size="42" font-weight="800" fill="#ffffff" letter-spacing="-1">
    TekiVex <tspan fill="#00f5d4">UI</tspan>
  </text>

  <!-- Version badge -->
  <rect x="152" y="154" width="110" height="24" rx="12"
        fill="#00f5d4" fill-opacity="0.12"/>
  <rect x="152" y="154" width="110" height="24" rx="12"
        fill="none" stroke="#00f5d4" stroke-opacity="0.3" stroke-width="1"/>
  <text x="207" y="170" font-family="monospace" font-size="12" font-weight="700"
        fill="#00f5d4" text-anchor="middle" letter-spacing="0.5">v2.5.10</text>

  <!-- Main tagline -->
  <text x="96" y="250" font-family="-apple-system,BlinkMacSystemFont,Inter,sans-serif"
        font-size="58" font-weight="900" fill="#ffffff" letter-spacing="-2">
    Quantum-Class
  </text>
  <text x="96" y="320" font-family="-apple-system,BlinkMacSystemFont,Inter,sans-serif"
        font-size="58" font-weight="900" fill="#ffffff" letter-spacing="-2">
    React UI Framework
  </text>

  <!-- Sub-tagline -->
  <text x="96" y="380" font-family="-apple-system,BlinkMacSystemFont,Inter,sans-serif"
        font-size="22" fill="#9ca3af" letter-spacing="-0.3">
    70+ components · WCAG 2.1 AAA · Quantum AI · TypeScript · MIT
  </text>

  <!-- Feature pills -->
  <g transform="translate(96, 420)">
    ${[
      ['⚛ Quantum AI', '#7c3aed', '#7c3aed22'],
      ['🛡 WCAG AAA',  '#10b981', '#10b98122'],
      ['🧬 Zero CSS',   '#f59e0b', '#f59e0b22'],
      ['📦 tekivex-ui', '#00f5d4', '#00f5d422'],
    ].map(([label, stroke, bg], i) => `
    <g transform="translate(${i * 200}, 0)">
      <rect width="185" height="36" rx="18" fill="${bg}" stroke="${stroke}"
            stroke-width="1" stroke-opacity="0.5"/>
      <text x="92" y="23" font-family="-apple-system,BlinkMacSystemFont,Inter,sans-serif"
            font-size="14" font-weight="600" fill="${stroke}" text-anchor="middle">${label}</text>
    </g>`).join('')}
  </g>

  <!-- npm install command -->
  <rect x="96" y="490" width="460" height="52" rx="10"
        fill="#ffffff" fill-opacity="0.04" stroke="#ffffff" stroke-opacity="0.1" stroke-width="1"/>
  <text x="116" y="521" font-family="'Courier New',Courier,monospace"
        font-size="18" fill="#6b7280">$</text>
  <text x="138" y="521" font-family="'Courier New',Courier,monospace"
        font-size="18" fill="#e5e7eb">npm install <tspan fill="#00f5d4">tekivex-ui</tspan></text>

  <!-- Right side decorative sphere (simplified) -->
  <g transform="translate(900, 315)">
    <circle cx="0" cy="0" r="180" fill="none" stroke="#00f5d4"
            stroke-width="0.6" stroke-opacity="0.15"/>
    <circle cx="0" cy="0" r="140" fill="none" stroke="#7c3aed"
            stroke-width="0.5" stroke-opacity="0.18"/>
    <circle cx="0" cy="0" r="100" fill="none" stroke="#00f5d4"
            stroke-width="0.6" stroke-opacity="0.2"/>
    <circle cx="0" cy="0" r="60" fill="none" stroke="#7c3aed"
            stroke-width="0.8" stroke-opacity="0.25"/>
    <!-- Glowing center -->
    <circle cx="0" cy="0" r="18" fill="#00f5d4" fill-opacity="0.12"/>
    <circle cx="0" cy="0" r="8"  fill="#00f5d4" fill-opacity="0.6"/>
    <circle cx="0" cy="0" r="4"  fill="#ffffff"  fill-opacity="0.9"/>
    <!-- Data nodes -->
    <circle cx="0" cy="-100" r="4" fill="#00f5d4" fill-opacity="0.8"/>
    <circle cx="95" cy="-31" r="3" fill="#7c3aed" fill-opacity="0.8"/>
    <circle cx="59" cy="81"  r="4" fill="#06b6d4" fill-opacity="0.8"/>
    <circle cx="-59" cy="81" r="3" fill="#00f5d4" fill-opacity="0.7"/>
    <circle cx="-95" cy="-31" r="4" fill="#7c3aed" fill-opacity="0.8"/>
    <!-- Connection lines -->
    <line x1="0" y1="-100" x2="95" y2="-31" stroke="#00f5d4" stroke-width="0.8" stroke-opacity="0.3"/>
    <line x1="95" y1="-31"  x2="59"  y2="81"  stroke="#7c3aed" stroke-width="0.8" stroke-opacity="0.3"/>
    <line x1="59" y1="81"   x2="-59" y2="81"  stroke="#06b6d4" stroke-width="0.8" stroke-opacity="0.3"/>
    <line x1="-59" y1="81"  x2="-95" y2="-31" stroke="#00f5d4" stroke-width="0.8" stroke-opacity="0.3"/>
    <line x1="-95" y1="-31" x2="0"   y2="-100" stroke="#7c3aed" stroke-width="0.8" stroke-opacity="0.3"/>
    <line x1="0"   y1="-100" x2="0"  cy2="0"   stroke="#00f5d4" stroke-width="0.5" stroke-opacity="0.2"/>
  </g>
</svg>`;

writeFileSync(join(OUT_DIR, 'og-image.svg'), svg);
console.log('✅ og-image.svg written (with text — for Slack, Discord, iMessage)');
console.log('');
console.log('💡 For Twitter/X raster PNG with text, run:');
console.log('   npx @resvg/resvg-js-cli demo/public/og-image.svg demo/public/og-image.png');
