import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { TkxPlanet } from '../packages/tekivex-3d/src/Planet';

// See tests/TkxPortal3D.test.tsx for the full rationale: jsdom doesn't
// support WebGL, so the visual layer is delegated to Playwright. These
// tests cover the React surface only.

describe('TkxPlanet — module surface', () => {
  it('is exported as a function component', () => {
    expect(typeof TkxPlanet).toBe('function');
  });

  it('throws a helpful error if rendered without <TkxScene>', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      expect(() => render(<TkxPlanet />)).toThrow(
        /useScene\(\) must be called inside a <TkxScene>/,
      );
    } finally {
      spy.mockRestore();
    }
  });

  it('accepts the documented prop surface (compile-time check)', () => {
    const node = (
      <TkxPlanet
        radius={1.6}
        position={[0, 0, -8]}
        texture="/mars.jpg"
        tint="#ffd29c"
        spinSpeed={0.05}
        ring
        ringInner={1.4}
        ringOuter={2.2}
        ringTilt={0.4}
        glow
        glowColor="#ffbe0b"
      />
    );
    expect(node.type).toBe(TkxPlanet);
    expect(node.props.ring).toBe(true);
    expect(node.props.tint).toBe('#ffd29c');
  });

  it('falls through with no props (all are optional)', () => {
    expect((<TkxPlanet />).type).toBe(TkxPlanet);
  });

  it('honors a position-only invocation', () => {
    const node = <TkxPlanet position={[3, 0, -5]} />;
    expect(node.props.position).toEqual([3, 0, -5]);
  });
});
