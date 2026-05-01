import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { TkxStarfield } from '../packages/tekivex-3d/src/Starfield';

// jsdom can't create a WebGL context (no HTMLCanvasElement.getContext),
// so three.js's WebGLRenderer constructor throws inside <TkxScene>. We
// can still verify the React surface: the export shape, prop typing,
// and the useScene() hook contract. Visual coverage lives in
// tests/visual/ under Playwright.

describe('TkxStarfield — module surface', () => {
  it('is exported as a function component', () => {
    expect(typeof TkxStarfield).toBe('function');
  });

  it('throws a helpful error if rendered without <TkxScene>', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      expect(() => render(<TkxStarfield />)).toThrow(
        /useScene\(\) must be called inside a <TkxScene>/,
      );
    } finally {
      spy.mockRestore();
    }
  });

  it('accepts the documented prop surface (compile-time check)', () => {
    const node = (
      <TkxStarfield
        count={5000}
        radius={120}
        size={0.3}
        sizeVariance={0.4}
        spinSpeed={0.005}
        temperatureColors={false}
      />
    );
    expect(node.type).toBe(TkxStarfield);
    expect(node.props.count).toBe(5000);
  });

  it('falls through with no props (all are optional)', () => {
    const node = <TkxStarfield />;
    expect(node.type).toBe(TkxStarfield);
  });
});
