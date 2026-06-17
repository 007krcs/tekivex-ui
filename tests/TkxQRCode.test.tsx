import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { TkxQRCode, encodeQR } from '../src/components/TkxQRCode';
import { ThemeProvider, quantumDark } from '../src/themes';

function Wrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={quantumDark}>{children}</ThemeProvider>;
}

// ── Known-answer vectors ─────────────────────────────────────────────────────

describe('encodeQR — spec known-answer vectors', () => {
  it('produces the canonical "HELLO WORLD" v1-M data codewords', () => {
    // ISO/IEC 18004 worked example: alphanumeric, version 1, level M.
    const expected = [
      0x20, 0x5b, 0x0b, 0x78, 0xd1, 0x72, 0xdc, 0x4d, 0x43, 0x40, 0xec, 0x11,
      0xec, 0x11, 0xec, 0x11,
    ];
    const res = encodeQR('HELLO WORLD', { level: 'M' });
    expect(res.version).toBe(1);
    expect(res.level).toBe('M');
    expect(res.dataCodewords).toEqual(expected);
  });

  it('selects alphanumeric mode + version 1 for "HELLO WORLD"', () => {
    const res = encodeQR('HELLO WORLD', { level: 'M' });
    // 16 data codewords is the full v1-M data capacity.
    expect(res.dataCodewords.length).toBe(16);
  });
});

// ── Structural invariants ────────────────────────────────────────────────────

describe('encodeQR — module matrix structure', () => {
  it('output module count equals 4*version + 17', () => {
    for (let v = 1; v <= 10; v++) {
      // Build a payload guaranteed to land on (at least) this version.
      const res = encodeQR('A'.repeat(v * 6), { level: 'M' });
      expect(res.size).toBe(4 * res.version + 17);
      expect(res.matrix.length).toBe(res.size);
      expect(res.matrix[0].length).toBe(res.size);
    }
  });

  it('places finder patterns at all three corners', () => {
    const res = encodeQR('https://example.com', { level: 'M' });
    const m = res.matrix;
    const n = m.length;

    // A finder pattern is a 7×7 block: dark ring + dark 3×3 centre.
    const isFinder = (r0: number, c0: number) => {
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 7; c++) {
          const edge = r === 0 || r === 6 || c === 0 || c === 6;
          const inner = r >= 2 && r <= 4 && c >= 2 && c <= 4;
          const expectDark = edge || inner;
          if (m[r0 + r][c0 + c] !== expectDark) return false;
        }
      }
      return true;
    };

    expect(isFinder(0, 0)).toBe(true); // top-left
    expect(isFinder(0, n - 7)).toBe(true); // top-right
    expect(isFinder(n - 7, 0)).toBe(true); // bottom-left
  });

  it('has a correct vertical + horizontal timing pattern (alternating)', () => {
    const res = encodeQR('TIMING', { level: 'M' });
    const m = res.matrix;
    const n = m.length;
    for (let i = 8; i < n - 8; i++) {
      const expected = i % 2 === 0;
      expect(m[6][i]).toBe(expected); // horizontal timing row
      expect(m[i][6]).toBe(expected); // vertical timing column
    }
  });

  it('sets the mandatory dark module', () => {
    const res = encodeQR('DARKMODULE', { level: 'M' });
    const n = res.matrix.length;
    expect(res.matrix[n - 8][8]).toBe(true);
  });

  it('selects a mask in the valid range 0–7', () => {
    const res = encodeQR('MASKTEST', { level: 'M' });
    expect(res.mask).toBeGreaterThanOrEqual(0);
    expect(res.mask).toBeLessThanOrEqual(7);
  });
});

// ── Determinism ──────────────────────────────────────────────────────────────

describe('encodeQR — determinism', () => {
  it('produces identical matrices for identical inputs', () => {
    const a = encodeQR('deterministic-payload-123', { level: 'Q' });
    const b = encodeQR('deterministic-payload-123', { level: 'Q' });
    expect(a.mask).toBe(b.mask);
    expect(a.version).toBe(b.version);
    expect(a.matrix).toEqual(b.matrix);
  });

  it('different EC levels can change the encoding', () => {
    const l = encodeQR('CHANGE', { level: 'L' });
    const h = encodeQR('CHANGE', { level: 'H' });
    expect(l.level).toBe('L');
    expect(h.level).toBe('H');
    // H needs more EC codewords → larger or equal version.
    expect(h.version).toBeGreaterThanOrEqual(l.version);
  });
});

// ── Round-trip: decode format-information bits ────────────────────────────────

describe('encodeQR — format-info round trip', () => {
  // Decode the 15-bit format info from the matrix and confirm it carries the
  // EC level + mask we encoded. This exercises the BCH(15,5) format string.
  const EC_BITS: Record<string, number> = { L: 0b01, M: 0b00, Q: 0b11, H: 0b10 };

  function readFormatCopy1(m: boolean[][]): number {
    // Mirror of the encoder's placement (copy around the top-left finder).
    const bit = (b: boolean) => (b ? 1 : 0);
    let bits = 0;
    const seq: boolean[] = [];
    for (let i = 0; i <= 5; i++) seq[i] = m[8][i];
    seq[6] = m[8][7];
    seq[7] = m[8][8];
    seq[8] = m[7][8];
    for (let i = 9; i <= 14; i++) seq[i] = m[14 - i][8];
    for (let i = 14; i >= 0; i--) bits = (bits << 1) | bit(seq[i]);
    return bits;
  }

  function decodeFormat(raw: number): { level: number; mask: number } {
    const unmasked = raw ^ 0b101010000010010;
    const data = (unmasked >> 10) & 0b11111;
    return { level: (data >> 3) & 0b11, mask: data & 0b111 };
  }

  it('round-trips EC level + mask through the BCH format string', () => {
    for (const level of ['L', 'M', 'Q', 'H'] as const) {
      const res = encodeQR('FORMAT-RT', { level });
      const decoded = decodeFormat(readFormatCopy1(res.matrix));
      expect(decoded.level).toBe(EC_BITS[level]);
      expect(decoded.mask).toBe(res.mask);
    }
  });
});

// ── Byte (UTF-8) mode ────────────────────────────────────────────────────────

describe('encodeQR — byte mode', () => {
  it('encodes non-alphanumeric input as byte mode (mode indicator 0100)', () => {
    // The first data codeword's top nibble must be the byte-mode indicator.
    const res = encodeQR('https://tekivex.dev', { level: 'M' });
    expect(res.dataCodewords[0] >> 4).toBe(0b0100);
  });

  it('handles UTF-8 multibyte input without throwing', () => {
    expect(() => encodeQR('héllo • wörld ✓', { level: 'M' })).not.toThrow();
  });
});

// ── Component rendering ──────────────────────────────────────────────────────

describe('TkxQRCode component', () => {
  it('renders a canvas with an accessible label', () => {
    const { container, getByRole } = render(<TkxQRCode value="hello" />, {
      wrapper: Wrapper,
    });
    expect(getByRole('img')).toHaveAttribute('aria-label', 'QR code for: hello');
    expect(container.querySelector('canvas')).toBeInTheDocument();
  });

  it('forwards a ref to the root element', () => {
    let node: HTMLDivElement | null = null;
    render(<TkxQRCode value="ref" ref={(n) => (node = n)} />, { wrapper: Wrapper });
    expect(node).toBeInstanceOf(HTMLDivElement);
  });

  it('passes through className and style', () => {
    const { getByRole } = render(
      <TkxQRCode value="styled" className="my-qr" style={{ opacity: 0.5 }} />,
      { wrapper: Wrapper },
    );
    const root = getByRole('img');
    expect(root.className).toContain('my-qr');
    expect(root.style.opacity).toBe('0.5');
  });

  it('honours the level prop alias', () => {
    // Should not throw and should drive the encoder via `level`.
    expect(() =>
      render(<TkxQRCode value="leveltest" level="H" />, { wrapper: Wrapper }),
    ).not.toThrow();
  });
});
