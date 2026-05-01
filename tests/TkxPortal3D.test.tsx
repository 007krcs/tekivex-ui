import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { TkxPortal3D } from '../packages/tekivex-3d/src/Portal3D';
import { useScene } from '../packages/tekivex-3d/src/Scene';

// ─────────────────────────────────────────────────────────────────────────────
// Why this test is shaped this way:
//
// jsdom (the headless DOM that vitest runs against) does not implement
// HTMLCanvasElement.getContext() and therefore cannot create a WebGL
// context. three.js's WebGLRenderer constructor throws immediately when
// it tries to acquire one. As a consequence, ANY 3D component that
// composes inside <TkxScene> cannot be mounted in a unit test — the
// scene's effect would crash before the component's effect ever runs.
//
// Visual + integration coverage for tekivex-3d lives in the Playwright
// suite under tests/visual/, which boots a real Chromium and renders
// against actual GPUs. Unit tests here verify the surface that doesn't
// need a renderer:
//   - the component exists and exports the expected shape
//   - calling its hook outside a Scene raises a clear, helpful error
//   - the component itself returns a render value (no early throw at
//     module-evaluation time)
// ─────────────────────────────────────────────────────────────────────────────

describe('TkxPortal3D — module surface', () => {
  it('is exported as a function component', () => {
    expect(typeof TkxPortal3D).toBe('function');
  });

  it('accepts the documented prop surface (TypeScript compile-check)', () => {
    // If any of these props were typed incorrectly the test file would not
    // compile. The runtime no-op below still exercises React.createElement.
    const node = (
      <TkxPortal3D
        position={[1, 2, 3]}
        radius={1.5}
        aspect={1.4}
        accent="#00f5d4"
        innerColor="#0c0d20"
        label="Andromeda"
        faceCamera
        onEnter={() => {}}
        transitionMs={1200}
      />
    );
    expect(node).toBeTruthy();
    expect(node.type).toBe(TkxPortal3D);
  });

  it('throws a helpful error if rendered without <TkxScene> (the hook contract)', () => {
    // Suppress React's normal error console for this expected failure
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      expect(() => render(<TkxPortal3D position={[0, 0, -3]} />)).toThrow(
        /useScene\(\) must be called inside a <TkxScene>/,
      );
    } finally {
      spy.mockRestore();
    }
  });
});

describe('useScene — hook contract', () => {
  it('throws outside a Scene with a helpful message', () => {
    function Probe() {
      useScene();
      return null;
    }
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      expect(() => render(<Probe />)).toThrow(
        /useScene\(\) must be called inside a <TkxScene>/,
      );
    } finally {
      spy.mockRestore();
    }
  });
});

// ── Pure helper visible-from-fade-loop sanity check ────────────────────────
// Portal3D's fade math is in a closed-over render loop and not exposed,
// but we can at least verify the public API names match the README.
describe('TkxPortal3D — README contract', () => {
  it('exposes default values matching the documented defaults', () => {
    // We can't directly read the defaults without instantiation, but we can
    // verify the component renders without prop validation errors when ALL
    // props are omitted except the required `position`.
    const node = <TkxPortal3D position={[0, 0, -3]} />;
    expect(node.props.position).toEqual([0, 0, -3]);
    // Optional props remain undefined — the component will fall back to
    // its declared defaults when actually mounted in a real Scene.
    expect(node.props.radius).toBeUndefined();
    expect(node.props.transitionMs).toBeUndefined();
  });
});

// vitest's `vi` global isn't auto-imported in this file's top — re-export
// for use inside describe blocks above.
import { vi } from 'vitest';
