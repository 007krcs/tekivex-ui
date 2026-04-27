import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { TkxSignaturePad, type TkxSignaturePadHandle } from '../src/components/TkxSignaturePad';
import { ThemeProvider, quantumDark } from '../src/themes';

function W({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={quantumDark}>{children}</ThemeProvider>;
}

describe('TkxSignaturePad', () => {
  it('renders canvas with role="img"', () => {
    render(<TkxSignaturePad label="Sign" />, { wrapper: W });
    const canvas = screen.getByRole('img');
    expect(canvas.tagName).toBe('CANVAS');
  });

  it('uses label as aria-label', () => {
    render(<TkxSignaturePad label="Your signature" />, { wrapper: W });
    expect(screen.getByLabelText('Your signature')).toBeInTheDocument();
  });

  it('exposes clear/undo/isEmpty/toDataURL/toBlob via ref', () => {
    const ref = createRef<TkxSignaturePadHandle>();
    render(<TkxSignaturePad ref={ref} label="S" />, { wrapper: W });
    expect(ref.current).toBeTruthy();
    expect(ref.current!.clear).toBeTypeOf('function');
    expect(ref.current!.undo).toBeTypeOf('function');
    expect(ref.current!.isEmpty).toBeTypeOf('function');
    expect(ref.current!.toDataURL).toBeTypeOf('function');
    expect(ref.current!.toBlob).toBeTypeOf('function');
  });

  it('starts empty', () => {
    const ref = createRef<TkxSignaturePadHandle>();
    render(<TkxSignaturePad ref={ref} label="S" />, { wrapper: W });
    expect(ref.current!.isEmpty()).toBe(true);
  });

  it('clear() emits onChange', () => {
    const onChange = vi.fn();
    const ref = createRef<TkxSignaturePadHandle>();
    render(<TkxSignaturePad ref={ref} label="S" onChange={onChange} />, { wrapper: W });
    ref.current!.clear();
    expect(onChange).toHaveBeenCalled();
  });

  it('respects custom dimensions', () => {
    render(<TkxSignaturePad label="S" width={400} height={300} />, { wrapper: W });
    const canvas = screen.getByRole('img') as HTMLCanvasElement;
    // jsdom doesn't lay out, but the style attribute should be set.
    expect(canvas.style.height).toBe('300px');
  });

  it('respects disabled prop on the canvas cursor', () => {
    render(<TkxSignaturePad label="S" disabled />, { wrapper: W });
    const canvas = screen.getByRole('img') as HTMLCanvasElement;
    expect(canvas.style.cursor).toBe('not-allowed');
  });
});
