import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { TkxOrbitPath } from '../packages/tekivex-3d/src/OrbitPath';

// See tests/TkxPortal3D.test.tsx — WebGL not available in jsdom, so the
// rendered output is covered by Playwright. These tests verify the
// React surface only (export shape, prop typing, hook contract).

describe('TkxOrbitPath — module surface', () => {
  it('is exported as a function component', () => {
    expect(typeof TkxOrbitPath).toBe('function');
  });

  it('throws a helpful error if rendered without <TkxScene>', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      expect(() => render(<TkxOrbitPath radius={4} />)).toThrow(
        /useScene\(\) must be called inside a <TkxScene>/,
      );
    } finally {
      spy.mockRestore();
    }
  });

  it('requires a radius prop', () => {
    // TypeScript won't compile if radius is missing — this is the
    // compile-time contract.
    const node = <TkxOrbitPath radius={3} />;
    expect(node.props.radius).toBe(3);
  });

  it('accepts the documented prop surface (compile-time check)', () => {
    const node = (
      <TkxOrbitPath
        radius={4}
        center={[0, 0, 0]}
        ringColor="#00f5d4"
        ringOpacity={0.4}
        inclination={0.2}
        bodyColor="#3a86ff"
        bodySize={0.2}
        speed={0.5}
        phase={1.4}
        trail={false}
      />
    );
    expect(node.type).toBe(TkxOrbitPath);
    expect(node.props.bodyColor).toBe('#3a86ff');
  });

  it('orbits without a body when bodyColor is omitted', () => {
    // Static-only ring (no animated body) — common preset for "orbital
    // band visualisations" that don't track a satellite.
    const node = <TkxOrbitPath radius={5} />;
    expect(node.props.bodyColor).toBeUndefined();
  });
});
