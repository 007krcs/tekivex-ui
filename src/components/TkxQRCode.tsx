'use client';

import {
  useRef,
  useEffect,
  useMemo,
  forwardRef,
  type CSSProperties,
} from 'react';
import { useTheme } from '../themes';
import { sanitizeString } from '../engine/security';
import { useReducedMotion } from '../hooks';
import { tkx } from '../engine/tkx';

// ─────────────────────────────────────────────────────────────────────────────
// REAL, dependency-free QR Code encoder.
//
// Implements (per ISO/IEC 18004): byte (UTF-8) + alphanumeric encoding,
// automatic version selection (v1–10), Reed–Solomon error correction over
// GF(256) with primitive polynomial 0x11d, data/EC block interleaving,
// codeword placement, all 8 data masks with penalty-score selection,
// format-information and version-information bits, finder / alignment /
// timing patterns, and a quiet zone.
//
// Known-answer verified against the canonical spec example: encoding
// "HELLO WORLD" at version 1, level M (alphanumeric) yields the data
// codewords 0x20 0x5B 0x0B 0x78 0xD1 0x72 0xDC 0x4D 0x43 0x40 0xEC 0x11
// 0xEC 0x11 0xEC 0x11. See tests/TkxQRCode.test.tsx.
//
// The encoder is exported (`encodeQR`) purely so the test suite can assert
// the intermediate codewords + final module matrix. It carries no runtime
// dependencies.
// ─────────────────────────────────────────────────────────────────────────────

// ── Galois Field GF(256), primitive polynomial 0x11d ─────────────────────────

const GF_EXP = new Uint8Array(512);
const GF_LOG = new Uint8Array(256);
(() => {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    GF_EXP[i] = x;
    GF_LOG[x] = i;
    x <<= 1;
    if (x & 0x100) x ^= 0x11d;
  }
  for (let i = 255; i < 512; i++) GF_EXP[i] = GF_EXP[i - 255];
})();

function gfMul(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return GF_EXP[GF_LOG[a] + GF_LOG[b]];
}

/** Reed–Solomon generator polynomial of the given degree. */
function rsGeneratorPoly(degree: number): number[] {
  let poly = [1];
  for (let i = 0; i < degree; i++) {
    const next = new Array(poly.length + 1).fill(0);
    for (let j = 0; j < poly.length; j++) {
      next[j] ^= poly[j];
      next[j + 1] ^= gfMul(poly[j], GF_EXP[i]);
    }
    poly = next;
  }
  return poly;
}

/** Compute `ecLen` Reed–Solomon error-correction codewords for `data`. */
function rsEncode(data: number[], ecLen: number): number[] {
  const gen = rsGeneratorPoly(ecLen);
  const res = new Array(ecLen).fill(0);
  for (let i = 0; i < data.length; i++) {
    const factor = data[i] ^ res[0];
    res.shift();
    res.push(0);
    if (factor !== 0) {
      for (let j = 0; j < gen.length; j++) {
        res[j] ^= gfMul(gen[j], factor);
      }
    }
  }
  return res;
}

// ── Capacity / block tables (versions 1–10) ──────────────────────────────────
// Source: ISO/IEC 18004 Table 9 / standard QR EC-block tables.
// Each entry: [ecCodewordsPerBlock, numBlocksGroup1, dataCwGroup1,
//              numBlocksGroup2, dataCwGroup2]

type ECLevel = 'L' | 'M' | 'Q' | 'H';
type BlockSpec = [number, number, number, number, number];

// Indexed [version][level]
const EC_BLOCKS: Record<ECLevel, BlockSpec[]> = {
  // version 0 is a placeholder so version indexes line up (version - 1).
  L: [
    [7, 1, 19, 0, 0],
    [10, 1, 34, 0, 0],
    [15, 1, 55, 0, 0],
    [20, 1, 80, 0, 0],
    [26, 1, 108, 0, 0],
    [18, 2, 68, 0, 0],
    [20, 2, 78, 0, 0],
    [24, 2, 97, 0, 0],
    [30, 2, 116, 0, 0],
    [18, 2, 68, 2, 69],
  ],
  M: [
    [10, 1, 16, 0, 0],
    [16, 1, 28, 0, 0],
    [26, 1, 44, 0, 0],
    [18, 2, 32, 0, 0],
    [24, 2, 43, 0, 0],
    [16, 4, 27, 0, 0],
    [18, 4, 31, 0, 0],
    [22, 2, 38, 2, 39],
    [22, 3, 36, 2, 37],
    [26, 4, 43, 1, 44],
  ],
  Q: [
    [13, 1, 13, 0, 0],
    [22, 1, 22, 0, 0],
    [18, 2, 17, 0, 0],
    [26, 2, 24, 0, 0],
    [18, 2, 15, 2, 16],
    [24, 4, 19, 0, 0],
    [18, 2, 14, 4, 15],
    [22, 4, 18, 2, 19],
    [20, 4, 16, 4, 17],
    [24, 6, 19, 2, 20],
  ],
  H: [
    [17, 1, 9, 0, 0],
    [28, 1, 16, 0, 0],
    [22, 2, 13, 0, 0],
    [16, 4, 9, 0, 0],
    [22, 2, 11, 2, 12],
    [28, 4, 15, 0, 0],
    [26, 4, 13, 1, 14],
    [26, 4, 14, 2, 15],
    [24, 4, 12, 4, 13],
    [28, 6, 15, 2, 16],
  ],
};

/** Total data codeword capacity for a version + level. */
function dataCapacity(version: number, level: ECLevel): number {
  const [, g1, d1, g2, d2] = EC_BLOCKS[level][version - 1];
  return g1 * d1 + g2 * d2;
}

// Alignment-pattern centre coordinates per version (v1 has none).
const ALIGNMENT_POSITIONS: number[][] = [
  [],
  [],
  [6, 18],
  [6, 22],
  [6, 26],
  [6, 30],
  [6, 34],
  [6, 22, 38],
  [6, 24, 42],
  [6, 26, 46],
  [6, 28, 50],
];

// ── Character-count indicator bit lengths (byte / alphanumeric, v1–9 vs v10+) ─

function charCountBits(version: number, mode: 'byte' | 'alphanumeric'): number {
  if (mode === 'byte') return version <= 9 ? 8 : 16;
  // alphanumeric
  if (version <= 9) return 9;
  return 11; // 10–26
}

const ALNUM =
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:';

function isAlphanumeric(s: string): boolean {
  for (const ch of s) if (ALNUM.indexOf(ch) === -1) return false;
  return true;
}

// ── Bit buffer ───────────────────────────────────────────────────────────────

class BitBuffer {
  bits: number[] = [];
  put(value: number, length: number) {
    for (let i = length - 1; i >= 0; i--) {
      this.bits.push((value >>> i) & 1);
    }
  }
  get length() {
    return this.bits.length;
  }
}

function utf8Bytes(str: string): number[] {
  const out: number[] = [];
  for (const ch of str) {
    let code = ch.codePointAt(0)!;
    if (code < 0x80) out.push(code);
    else if (code < 0x800) {
      out.push(0xc0 | (code >> 6), 0x80 | (code & 0x3f));
    } else if (code < 0x10000) {
      out.push(0xe0 | (code >> 12), 0x80 | ((code >> 6) & 0x3f), 0x80 | (code & 0x3f));
    } else {
      out.push(
        0xf0 | (code >> 18),
        0x80 | ((code >> 12) & 0x3f),
        0x80 | ((code >> 6) & 0x3f),
        0x80 | (code & 0x3f),
      );
    }
  }
  return out;
}

// ── Data encoding → final (pre-EC) data codeword stream ──────────────────────

interface EncodeResult {
  version: number;
  level: ECLevel;
  size: number; // module count
  matrix: boolean[][];
  dataCodewords: number[]; // data codewords AFTER padding, BEFORE interleaving
  mask: number;
}

function chooseMode(value: string): 'byte' | 'alphanumeric' {
  return isAlphanumeric(value) ? 'alphanumeric' : 'byte';
}

/** Select the smallest version (1–10) that fits the payload at `level`. */
function selectVersion(value: string, mode: 'byte' | 'alphanumeric', level: ECLevel): number {
  const byteLen = mode === 'byte' ? utf8Bytes(value).length : 0;
  const charLen = value.length;
  for (let v = 1; v <= 10; v++) {
    const ccBits = charCountBits(v, mode);
    let dataBits: number;
    if (mode === 'byte') {
      dataBits = 4 + ccBits + byteLen * 8;
    } else {
      const pairs = Math.floor(charLen / 2);
      const rem = charLen % 2;
      dataBits = 4 + ccBits + pairs * 11 + (rem ? 6 : 0);
    }
    if (dataBits <= dataCapacity(v, level) * 8) return v;
  }
  throw new Error('TkxQRCode: value too large for supported versions (1–10).');
}

function buildDataCodewords(
  value: string,
  mode: 'byte' | 'alphanumeric',
  version: number,
  level: ECLevel,
): number[] {
  const bb = new BitBuffer();
  const ccBits = charCountBits(version, mode);

  if (mode === 'byte') {
    const bytes = utf8Bytes(value);
    bb.put(0b0100, 4); // byte mode indicator
    bb.put(bytes.length, ccBits);
    for (const b of bytes) bb.put(b, 8);
  } else {
    bb.put(0b0010, 4); // alphanumeric mode indicator
    bb.put(value.length, ccBits);
    for (let i = 0; i < value.length; i += 2) {
      if (i + 1 < value.length) {
        const v = ALNUM.indexOf(value[i]) * 45 + ALNUM.indexOf(value[i + 1]);
        bb.put(v, 11);
      } else {
        bb.put(ALNUM.indexOf(value[i]), 6);
      }
    }
  }

  const totalDataBits = dataCapacity(version, level) * 8;

  // Terminator (up to 4 bits)
  const remaining = totalDataBits - bb.length;
  bb.put(0, Math.min(4, Math.max(0, remaining)));

  // Pad to byte boundary
  while (bb.length % 8 !== 0) bb.bits.push(0);

  // Convert to codewords
  const codewords: number[] = [];
  for (let i = 0; i < bb.length; i += 8) {
    let byte = 0;
    for (let j = 0; j < 8; j++) byte = (byte << 1) | bb.bits[i + j];
    codewords.push(byte);
  }

  // Pad bytes 0xEC, 0x11 alternating
  const padBytes = [0xec, 0x11];
  let p = 0;
  while (codewords.length < dataCapacity(version, level)) {
    codewords.push(padBytes[p % 2]);
    p++;
  }
  return codewords;
}

/** Interleave data + EC codewords across blocks into the final byte stream. */
function buildFinalCodewords(dataCodewords: number[], version: number, level: ECLevel): number[] {
  const [ecLen, g1, d1, g2, d2] = EC_BLOCKS[level][version - 1];
  const blocks: { data: number[]; ec: number[] }[] = [];

  let offset = 0;
  for (let i = 0; i < g1; i++) {
    const data = dataCodewords.slice(offset, offset + d1);
    offset += d1;
    blocks.push({ data, ec: rsEncode(data, ecLen) });
  }
  for (let i = 0; i < g2; i++) {
    const data = dataCodewords.slice(offset, offset + d2);
    offset += d2;
    blocks.push({ data, ec: rsEncode(data, ecLen) });
  }

  const result: number[] = [];
  const maxData = Math.max(d1, d2);
  for (let i = 0; i < maxData; i++) {
    for (const b of blocks) if (i < b.data.length) result.push(b.data[i]);
  }
  for (let i = 0; i < ecLen; i++) {
    for (const b of blocks) result.push(b.ec[i]);
  }
  return result;
}

// ── Matrix construction ──────────────────────────────────────────────────────

type Cell = { dark: boolean; reserved: boolean };

function makeMatrix(size: number): Cell[][] {
  return Array.from({ length: size }, () =>
    Array.from({ length: size }, () => ({ dark: false, reserved: false })),
  );
}

function placeFinder(m: Cell[][], row: number, col: number) {
  for (let r = -1; r <= 7; r++) {
    for (let c = -1; c <= 7; c++) {
      const rr = row + r;
      const cc = col + c;
      if (rr < 0 || rr >= m.length || cc < 0 || cc >= m.length) continue;
      const inFinder =
        (r >= 0 && r <= 6 && (c === 0 || c === 6)) ||
        (c >= 0 && c <= 6 && (r === 0 || r === 6)) ||
        (r >= 2 && r <= 4 && c >= 2 && c <= 4);
      m[rr][cc] = { dark: inFinder, reserved: true };
    }
  }
}

function placeAlignment(m: Cell[][], version: number) {
  const positions = ALIGNMENT_POSITIONS[version];
  for (const r of positions) {
    for (const c of positions) {
      // Skip the three finder corners.
      if (
        (r === 6 && c === 6) ||
        (r === 6 && c === positions[positions.length - 1]) ||
        (r === positions[positions.length - 1] && c === 6)
      ) {
        // these overlap finder/timing — but standard skips only the finder
        // corners; the (6,6) etc. checks below handle reserved cells.
      }
      if (m[r][c].reserved) continue;
      for (let dr = -2; dr <= 2; dr++) {
        for (let dc = -2; dc <= 2; dc++) {
          const dark =
            Math.max(Math.abs(dr), Math.abs(dc)) !== 1; // ring + centre
          m[r + dr][c + dc] = { dark, reserved: true };
        }
      }
    }
  }
}

function placeTiming(m: Cell[][]) {
  const size = m.length;
  for (let i = 8; i < size - 8; i++) {
    if (!m[6][i].reserved) m[6][i] = { dark: i % 2 === 0, reserved: true };
    if (!m[i][6].reserved) m[i][6] = { dark: i % 2 === 0, reserved: true };
  }
}

function reserveFormatAreas(m: Cell[][], version: number) {
  const size = m.length;
  // Format info around finders (15 bits each, two copies).
  for (let i = 0; i <= 8; i++) {
    if (i !== 6) {
      if (!m[8][i].reserved) m[8][i] = { dark: false, reserved: true };
      if (!m[i][8].reserved) m[i][8] = { dark: false, reserved: true };
    }
  }
  for (let i = 0; i < 8; i++) {
    if (!m[8][size - 1 - i].reserved) m[8][size - 1 - i] = { dark: false, reserved: true };
    if (!m[size - 1 - i][8].reserved) m[size - 1 - i][8] = { dark: false, reserved: true };
  }
  // Dark module
  m[size - 8][8] = { dark: true, reserved: true };

  // Version info (v7+): two 3×6 blocks
  if (version >= 7) {
    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < 3; j++) {
        m[i][size - 11 + j] = { dark: false, reserved: true };
        m[size - 11 + j][i] = { dark: false, reserved: true };
      }
    }
  }
}

/** Zig-zag placement of the final codeword bit-stream into free modules. */
function placeData(m: Cell[][], codewords: number[]) {
  const size = m.length;
  const bits: number[] = [];
  for (const cw of codewords) for (let i = 7; i >= 0; i--) bits.push((cw >> i) & 1);

  let bitIdx = 0;
  let upward = true;
  for (let col = size - 1; col > 0; col -= 2) {
    if (col === 6) col--; // skip vertical timing column
    for (let i = 0; i < size; i++) {
      const row = upward ? size - 1 - i : i;
      for (let c = 0; c < 2; c++) {
        const cc = col - c;
        if (m[row][cc].reserved) continue;
        const bit = bitIdx < bits.length ? bits[bitIdx] : 0;
        m[row][cc].dark = bit === 1;
        bitIdx++;
      }
    }
    upward = !upward;
  }
}

function maskFn(mask: number, r: number, c: number): boolean {
  switch (mask) {
    case 0: return (r + c) % 2 === 0;
    case 1: return r % 2 === 0;
    case 2: return c % 3 === 0;
    case 3: return (r + c) % 3 === 0;
    case 4: return (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0;
    case 5: return ((r * c) % 2) + ((r * c) % 3) === 0;
    case 6: return (((r * c) % 2) + ((r * c) % 3)) % 2 === 0;
    case 7: return (((r + c) % 2) + ((r * c) % 3)) % 2 === 0;
    default: return false;
  }
}

function applyMask(m: Cell[][], mask: number): boolean[][] {
  const size = m.length;
  const out: boolean[][] = Array.from({ length: size }, () => new Array(size).fill(false));
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      let dark = m[r][c].dark;
      if (!m[r][c].reserved && maskFn(mask, r, c)) dark = !dark;
      out[r][c] = dark;
    }
  }
  return out;
}

// ── Format / version information ─────────────────────────────────────────────

const EC_FORMAT_BITS: Record<ECLevel, number> = { L: 0b01, M: 0b00, Q: 0b11, H: 0b10 };

function formatInfoBits(level: ECLevel, mask: number): number {
  const data = (EC_FORMAT_BITS[level] << 3) | mask; // 5 bits
  let rem = data << 10;
  const g = 0b10100110111;
  for (let i = 14; i >= 10; i--) {
    if ((rem >> i) & 1) rem ^= g << (i - 10);
  }
  return ((data << 10) | rem) ^ 0b101010000010010;
}

function placeFormatInfo(grid: boolean[][], level: ECLevel, mask: number) {
  const size = grid.length;
  const bits = formatInfoBits(level, mask);
  const get = (i: number) => ((bits >> i) & 1) === 1;

  // Copy 1: around top-left finder
  for (let i = 0; i <= 5; i++) grid[8][i] = get(i);
  grid[8][7] = get(6);
  grid[8][8] = get(7);
  grid[7][8] = get(8);
  for (let i = 9; i <= 14; i++) grid[14 - i][8] = get(i);

  // Copy 2: along right and bottom edges
  for (let i = 0; i <= 7; i++) grid[size - 1 - i][8] = get(i);
  for (let i = 8; i <= 14; i++) grid[8][size - 15 + i] = get(i);

  grid[size - 8][8] = true; // dark module
}

function versionInfoBits(version: number): number {
  let rem = version << 12;
  const g = 0b1111100100101;
  for (let i = 17; i >= 12; i--) {
    if ((rem >> i) & 1) rem ^= g << (i - 12);
  }
  return (version << 12) | rem;
}

function placeVersionInfo(grid: boolean[][], version: number) {
  if (version < 7) return;
  const size = grid.length;
  const bits = versionInfoBits(version);
  for (let i = 0; i < 18; i++) {
    const bit = ((bits >> i) & 1) === 1;
    const r = Math.floor(i / 3);
    const c = i % 3;
    grid[r][size - 11 + c] = bit;
    grid[size - 11 + c][r] = bit;
  }
}

// ── Penalty scoring ──────────────────────────────────────────────────────────

function penalty(grid: boolean[][]): number {
  const n = grid.length;
  let score = 0;

  // Rule 1: runs of ≥5 same-colour modules (rows and cols)
  const runScore = (line: boolean[]) => {
    let s = 0;
    let run = 1;
    for (let i = 1; i < n; i++) {
      if (line[i] === line[i - 1]) {
        run++;
        if (run === 5) s += 3;
        else if (run > 5) s += 1;
      } else run = 1;
    }
    return s;
  };
  for (let r = 0; r < n; r++) score += runScore(grid[r]);
  for (let c = 0; c < n; c++) score += runScore(grid.map((row) => row[c]));

  // Rule 2: 2×2 blocks
  for (let r = 0; r < n - 1; r++) {
    for (let c = 0; c < n - 1; c++) {
      const v = grid[r][c];
      if (v === grid[r][c + 1] && v === grid[r + 1][c] && v === grid[r + 1][c + 1]) {
        score += 3;
      }
    }
  }

  // Rule 3: finder-like 1011101 patterns (with 0000 padding) in rows/cols
  const pat1 = [true, false, true, true, true, false, true, false, false, false, false];
  const pat2 = [false, false, false, false, true, false, true, true, true, false, true];
  const matchAt = (line: boolean[], i: number, pat: boolean[]) => {
    for (let k = 0; k < pat.length; k++) if (line[i + k] !== pat[k]) return false;
    return true;
  };
  const lineScore3 = (line: boolean[]) => {
    let s = 0;
    for (let i = 0; i + 11 <= n; i++) {
      if (matchAt(line, i, pat1) || matchAt(line, i, pat2)) s += 40;
    }
    return s;
  };
  for (let r = 0; r < n; r++) score += lineScore3(grid[r]);
  for (let c = 0; c < n; c++) score += lineScore3(grid.map((row) => row[c]));

  // Rule 4: proportion of dark modules
  let dark = 0;
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (grid[r][c]) dark++;
  const percent = (dark * 100) / (n * n);
  const prev = Math.floor(percent / 5) * 5;
  const next = prev + 5;
  score += Math.min(Math.abs(prev - 50), Math.abs(next - 50)) / 5 * 10;

  return score;
}

// ── Public encoder ───────────────────────────────────────────────────────────

export interface EncodeOptions {
  level?: ECLevel;
  /** Force a specific version (1–10). Otherwise auto-selected. */
  version?: number;
  /** Force a specific mask (0–7). Otherwise penalty-selected. */
  forceMask?: number;
}

/**
 * Encode `value` into a fully-formed QR module matrix.
 * Returns the chosen version, level, module count, the boolean matrix
 * (true = dark), the padded pre-EC data codewords, and the selected mask.
 */
export function encodeQR(value: string, opts: EncodeOptions = {}): EncodeResult {
  const level: ECLevel = opts.level ?? 'M';
  const mode = chooseMode(value);
  const version = opts.version ?? selectVersion(value, mode, level);
  const size = version * 4 + 17;

  const dataCodewords = buildDataCodewords(value, mode, version, level);
  const finalCodewords = buildFinalCodewords(dataCodewords, version, level);

  // Build base matrix with function patterns.
  const base = makeMatrix(size);
  placeFinder(base, 0, 0);
  placeFinder(base, 0, size - 7);
  placeFinder(base, size - 7, 0);
  placeAlignment(base, version);
  placeTiming(base);
  reserveFormatAreas(base, version);
  placeData(base, finalCodewords);

  // Try all masks, pick the lowest penalty (unless forced).
  let bestMask = opts.forceMask ?? 0;
  let bestGrid: boolean[][] | null = null;
  if (opts.forceMask === undefined) {
    let bestScore = Infinity;
    for (let mask = 0; mask < 8; mask++) {
      const g = applyMask(base, mask);
      placeFormatInfo(g, level, mask);
      placeVersionInfo(g, version);
      const s = penalty(g);
      if (s < bestScore) {
        bestScore = s;
        bestMask = mask;
        bestGrid = g;
      }
    }
  } else {
    bestGrid = applyMask(base, bestMask);
    placeFormatInfo(bestGrid, level, bestMask);
    placeVersionInfo(bestGrid, version);
  }

  return {
    version,
    level,
    size,
    matrix: bestGrid!,
    dataCodewords,
    mask: bestMask,
  };
}

// ── Types ────────────────────────────────────────────────────────────────────

export interface TkxQRCodeProps {
  value: string;
  size?: number;
  color?: string;
  bgColor?: string;
  /** Error-correction level. Default 'M'. */
  errorLevel?: ECLevel;
  /** Alias for {@link errorLevel}, kept for ergonomic parity. */
  level?: ECLevel;
  icon?: string;
  bordered?: boolean;
  className?: string;
  style?: CSSProperties;
}

// Quiet-zone width in modules (spec minimum is 4).
const QUIET_ZONE = 4;

// ── Component ────────────────────────────────────────────────────────────────

export const TkxQRCode = forwardRef<HTMLDivElement, TkxQRCodeProps>(function TkxQRCode(
  {
    value,
    size = 160,
    color,
    bgColor,
    errorLevel,
    level,
    icon,
    bordered = true,
    className,
    style,
  },
  ref,
) {
  const theme = useTheme();
  const reducedMotion = useReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const safeValue = sanitizeString(value);
  const fg = color ?? theme.text;
  const bg = bgColor ?? theme.surface;
  const ecLevel: ECLevel = errorLevel ?? level ?? 'M';

  const encoded = useMemo(() => {
    try {
      return encodeQR(safeValue || ' ', { level: ecLevel });
    } catch {
      // Payload too large for v1–10: fall back to the largest supported.
      return encodeQR((safeValue || ' ').slice(0, 200), { level: ecLevel });
    }
  }, [safeValue, ecLevel]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = (typeof window !== 'undefined' && window.devicePixelRatio) || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const { matrix } = encoded;
    const modules = matrix.length;
    const total = modules + QUIET_ZONE * 2;
    const cell = size / total;

    // Background (includes quiet zone)
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, size, size);

    // Modules
    ctx.fillStyle = fg;
    for (let r = 0; r < modules; r++) {
      for (let c = 0; c < modules; c++) {
        if (matrix[r][c]) {
          ctx.fillRect(
            (c + QUIET_ZONE) * cell,
            (r + QUIET_ZONE) * cell,
            // +0.5 over-paint avoids hairline seams between cells.
            cell + 0.5,
            cell + 0.5,
          );
        }
      }
    }

    // Optional center icon (clears a quiet patch — safe at level Q/H).
    if (icon) {
      const iconSize = size * 0.2;
      const offset = (size - iconSize) / 2;
      ctx.fillStyle = bg;
      ctx.fillRect(offset - 3, offset - 3, iconSize + 6, iconSize + 6);
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        ctx.drawImage(img, offset, offset, iconSize, iconSize);
      };
      img.src = sanitizeString(icon);
    }
  }, [encoded, size, fg, bg, icon]);

  return (
    <div
      ref={ref}
      role="img"
      aria-label={`QR code for: ${safeValue}`}
      className={[tkx('inline-block rounded-lg'), className].filter(Boolean).join(' ')}
      style={{
        padding: bordered ? 12 : 0,
        backgroundColor: bordered ? bg : 'transparent',
        border: bordered ? `1px solid ${theme.border}` : 'none',
        lineHeight: 0,
        animation: reducedMotion ? 'none' : 'tkxFadeIn 0.2s ease',
        ...style,
      }}
    >
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{ width: size, height: size, display: 'block' }}
      />
    </div>
  );
});
