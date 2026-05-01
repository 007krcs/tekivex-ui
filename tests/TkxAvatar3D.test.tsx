import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { TkxAvatar3D } from '../packages/tekivex-3d/src/Avatar3D';

// jsdom can't create a WebGL context, so the visual layer is delegated
// to Playwright (see tests/visual/). These tests verify the React
// surface only — export shape, prop typing, useScene() contract.
// Same policy as the other tekivex-3d primitives (Starfield, Planet,
// OrbitPath, Portal3D).

describe('TkxAvatar3D — module surface', () => {
  it('is exported as a function component', () => {
    expect(typeof TkxAvatar3D).toBe('function');
  });

  it('throws a helpful error if rendered without <TkxScene>', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      expect(() => render(<TkxAvatar3D />)).toThrow(
        /useScene\(\) must be called inside a <TkxScene>/,
      );
    } finally {
      spy.mockRestore();
    }
  });

  it('accepts the documented prop surface (compile-time check)', () => {
    const node = (
      <TkxAvatar3D
        position={[0, 0, 0]}
        scale={1.2}
        rotation={Math.PI / 4}
        state="cheer"
        accent="#ff006e"
        skinTone="#e8c39e"
        halo
        haloColor="#ffbe0b"
        speed={1.5}
      />
    );
    expect(node.type).toBe(TkxAvatar3D);
    expect(node.props.state).toBe('cheer');
    expect(node.props.halo).toBe(true);
  });

  it('falls through with no props (all are optional)', () => {
    const node = <TkxAvatar3D />;
    expect(node.type).toBe(TkxAvatar3D);
  });

  it('honors each documented animation state literal', () => {
    // TypeScript would reject any other literal — this is the
    // compile-time enforcement.
    const idle  = <TkxAvatar3D state="idle"  />;
    const talk  = <TkxAvatar3D state="talk"  />;
    const cheer = <TkxAvatar3D state="cheer" />;
    expect(idle.props.state).toBe('idle');
    expect(talk.props.state).toBe('talk');
    expect(cheer.props.state).toBe('cheer');
  });

  it('accepts halo without a custom color', () => {
    const node = <TkxAvatar3D halo />;
    expect(node.props.halo).toBe(true);
    expect(node.props.haloColor).toBeUndefined();
  });
});
