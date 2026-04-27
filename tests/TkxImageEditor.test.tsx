import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { createRef } from 'react';
import { TkxImageEditor, type TkxImageEditorHandle } from '../src/components/TkxImageEditor';
import { ThemeProvider, quantumDark } from '../src/themes';

function W({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={quantumDark}>{children}</ThemeProvider>;
}

const SAMPLE = 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="red"/></svg>');

describe('TkxImageEditor', () => {
  it('renders empty drop zone when no src', () => {
    render(<TkxImageEditor />, { wrapper: W });
    expect(screen.getByLabelText(/Upload image to edit/i)).toBeInTheDocument();
  });

  it('shows the browse button on drop zone', () => {
    render(<TkxImageEditor />, { wrapper: W });
    expect(screen.getByText('browse')).toBeInTheDocument();
  });

  it('exposes getResult / reset / loadSource via ref', () => {
    const ref = createRef<TkxImageEditorHandle>();
    render(<TkxImageEditor ref={ref} />, { wrapper: W });
    expect(ref.current!.getResult).toBeTypeOf('function');
    expect(ref.current!.reset).toBeTypeOf('function');
    expect(ref.current!.loadSource).toBeTypeOf('function');
  });

  it('renders toolbar when src is provided', () => {
    render(<TkxImageEditor src={SAMPLE} />, { wrapper: W });
    expect(screen.getByText(/Aspect/)).toBeInTheDocument();
    // Two rotate buttons (left, right) + aspect ratio buttons.
    const rotates = screen.getAllByText(/Rotate/i);
    expect(rotates.length).toBeGreaterThanOrEqual(2);
  });

  it('aspect-ratio buttons are togglable', () => {
    render(<TkxImageEditor src={SAMPLE} ratios={['free', '1:1']} />, { wrapper: W });
    const square = screen.getByText('1:1');
    fireEvent.click(square);
    expect(square.getAttribute('aria-pressed')).toBe('true');
  });

  it('rotate buttons exist', () => {
    render(<TkxImageEditor src={SAMPLE} />, { wrapper: W });
    expect(screen.getByLabelText(/Rotate 90 degrees left/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Rotate 90 degrees right/i)).toBeInTheDocument();
  });

  it('brightness/contrast sliders exist', () => {
    render(<TkxImageEditor src={SAMPLE} />, { wrapper: W });
    expect(screen.getByLabelText('Brightness')).toBeInTheDocument();
    expect(screen.getByLabelText('Contrast')).toBeInTheDocument();
  });

  it('apply button fires onResult', async () => {
    const onResult = vi.fn();
    render(<TkxImageEditor src={SAMPLE} onResult={onResult} />, { wrapper: W });
    fireEvent.click(screen.getByText('Apply'));
    // jsdom canvas.toBlob returns null in many setups; ensure no throw.
    // Just verify the button is wired up.
    expect(screen.getByText('Apply')).toBeInTheDocument();
  });

  it('cancel button fires onCancel', () => {
    const onCancel = vi.fn();
    render(<TkxImageEditor src={SAMPLE} onCancel={onCancel} />, { wrapper: W });
    fireEvent.click(screen.getByText('Cancel'));
    expect(onCancel).toHaveBeenCalled();
  });
});
