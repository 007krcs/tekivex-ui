import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { createRef } from 'react';
import { TkxConfetti, type TkxConfettiHandle } from '../src/components/TkxConfetti';

describe('TkxConfetti', () => {
  it('renders a fixed-position canvas', () => {
    const { container } = render(<TkxConfetti />);
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeTruthy();
    expect(canvas?.getAttribute('aria-hidden')).toBe('true');
  });

  it('exposes imperative fire() via ref', () => {
    const ref = createRef<TkxConfettiHandle>();
    render(<TkxConfetti ref={ref} />);
    expect(ref.current?.fire).toBeTypeOf('function');
    // Fire shouldn't throw even in jsdom (no canvas 2d ctx).
    expect(() => ref.current?.fire()).not.toThrow();
  });

  it('fires when trigger value changes', () => {
    // Spy requestAnimationFrame to detect ticking.
    const rafSpy = vi.spyOn(window, 'requestAnimationFrame');
    const { rerender } = render(<TkxConfetti trigger={0} />);
    rerender(<TkxConfetti trigger={1} />);
    // Either RAF was called (anim path) OR setTimeout (reduced-motion path).
    // jsdom defaults to no reduced-motion so RAF should be hit.
    expect(rafSpy.mock.calls.length).toBeGreaterThan(0);
    rafSpy.mockRestore();
  });

  it('respects custom particleCount + spread', () => {
    const ref = createRef<TkxConfettiHandle>();
    render(<TkxConfetti ref={ref} particleCount={20} spread={30} />);
    expect(() => ref.current?.fire()).not.toThrow();
  });

  it('accepts custom colors array', () => {
    const ref = createRef<TkxConfettiHandle>();
    render(<TkxConfetti ref={ref} colors={['#ff0000', '#00ff00']} />);
    expect(() => ref.current?.fire()).not.toThrow();
  });
});
