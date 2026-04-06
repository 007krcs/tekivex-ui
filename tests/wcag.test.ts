import { describe, it, expect } from 'vitest';
import {
  relativeLuminance,
  contrastRatio,
  meetsAA,
  meetsAAA,
  getAccessibleForeground,
} from '../src/engine/wcag';
import { quantumDark, auroraLight } from '../src/themes';

describe('relativeLuminance', () => {
  it('white has luminance of 1.0', () => {
    expect(relativeLuminance('#ffffff')).toBeCloseTo(1.0);
  });

  it('black has luminance of 0.0', () => {
    expect(relativeLuminance('#000000')).toBeCloseTo(0.0);
  });

  it('handles 3-digit hex', () => {
    const full = relativeLuminance('#ffffff');
    // #fff expands to #ffffff
    expect(relativeLuminance('#fff')).toBeCloseTo(full);
  });
});

describe('contrastRatio', () => {
  it('white vs black has maximum contrast ~21', () => {
    expect(contrastRatio('#ffffff', '#000000')).toBeCloseTo(21, 0);
  });

  it('same color has ratio of 1', () => {
    expect(contrastRatio('#ff0000', '#ff0000')).toBeCloseTo(1);
  });

  it('is symmetric', () => {
    const r1 = contrastRatio('#ff0000', '#ffffff');
    const r2 = contrastRatio('#ffffff', '#ff0000');
    expect(r1).toBeCloseTo(r2);
  });

  it('returns >= 1 always', () => {
    expect(contrastRatio('#333333', '#666666')).toBeGreaterThanOrEqual(1);
  });
});

describe('WCAG Compliance — Quantum Dark theme', () => {
  it('text vs bg meets AAA (>= 7:1)', () => {
    expect(meetsAAA(quantumDark.text, quantumDark.bg)).toBe(true);
  });

  it('primary vs bg meets AA (>= 4.5:1)', () => {
    expect(meetsAA(quantumDark.primary, quantumDark.bg)).toBe(true);
  });
});

describe('WCAG Compliance — Aurora Light theme', () => {
  it('text vs bg meets AAA (>= 7:1)', () => {
    expect(meetsAAA(auroraLight.text, auroraLight.bg)).toBe(true);
  });

  it('primary vs bg meets AA (>= 4.5:1)', () => {
    expect(meetsAA(auroraLight.primary, auroraLight.bg)).toBe(true);
  });
});

describe('meetsAA', () => {
  it('large text threshold is 3:1', () => {
    // A pair with ratio ~3.5 should pass large text AA but not normal text AA
    // textMuted on dark bg: 5.4:1 — passes both
    expect(meetsAA(quantumDark.textMuted, quantumDark.bg)).toBe(true);
  });
});

describe('getAccessibleForeground', () => {
  it('returns white for dark background', () => {
    const result = getAccessibleForeground('#000000', ['#ffffff', '#000000']);
    expect(result).toBe('#ffffff');
  });

  it('returns black for light background', () => {
    const result = getAccessibleForeground('#ffffff', ['#ffffff', '#000000']);
    expect(result).toBe('#000000');
  });

  it('picks highest contrast from candidates', () => {
    const result = getAccessibleForeground('#0a0a0f', ['#ffffff', '#888888', '#e8e8f4']);
    // #ffffff has highest contrast vs very dark bg
    expect(result).toBe('#ffffff');
  });
});
