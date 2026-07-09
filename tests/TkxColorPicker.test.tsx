import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TkxColorPicker } from '../src/components/TkxColorPicker';
import { ThemeProvider, quantumDark } from '../src/themes';

function Wrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={quantumDark}>{children}</ThemeProvider>;
}

function openPicker() {
  const trigger = screen.getByRole('button', { name: /color picker/i });
  trigger.focus();
  fireEvent.click(trigger);
  return trigger;
}

describe('TkxColorPicker', () => {
  it('renders the trigger and no dialog when closed', () => {
    render(<TkxColorPicker />, { wrapper: Wrapper });
    expect(screen.getByRole('button', { name: /color picker/i })).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('opens the dialog on trigger click', () => {
    render(<TkxColorPicker />, { wrapper: Wrapper });
    openPicker();
    expect(screen.getByRole('dialog', { name: 'Color picker' })).toBeInTheDocument();
  });

  it('fires onChange when a preset is selected', () => {
    const onChange = vi.fn();
    render(<TkxColorPicker onChange={onChange} />, { wrapper: Wrapper });
    openPicker();
    fireEvent.click(screen.getByRole('button', { name: 'Select color #ef4444' }));
    expect(onChange).toHaveBeenCalledWith('#ef4444', 'hex');
  });

  // ── A11y: dialog focus management (a11y-audit MEDIUM #17) ─────────────────

  /** Focusable descendants as the focus trap computes them (jsdom returns
   *  grouped-selector matches per selector, so don't assume document order). */
  function trapFocusables(dialog: HTMLElement): HTMLElement[] {
    const sel =
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), ' +
      'textarea:not([disabled]), [tabindex]:not([tabindex="-1"]), details > summary';
    return Array.from(dialog.querySelectorAll<HTMLElement>(sel));
  }

  it('moves focus into the dialog on open', () => {
    render(<TkxColorPicker />, { wrapper: Wrapper });
    openPicker();
    const dialog = screen.getByRole('dialog');
    expect(dialog.contains(document.activeElement)).toBe(true);
  });

  it('traps Tab within the dialog (wraps from last to first)', () => {
    render(<TkxColorPicker />, { wrapper: Wrapper });
    openPicker();
    const dialog = screen.getByRole('dialog');
    const focusables = trapFocusables(dialog);
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    last.focus();
    fireEvent.keyDown(last, { key: 'Tab' });
    expect(dialog.contains(document.activeElement)).toBe(true);
    expect(document.activeElement).toBe(first);
  });

  it('traps Shift+Tab within the dialog (wraps from first to last)', () => {
    render(<TkxColorPicker />, { wrapper: Wrapper });
    openPicker();
    const dialog = screen.getByRole('dialog');
    const focusables = trapFocusables(dialog);
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    first.focus();
    fireEvent.keyDown(first, { key: 'Tab', shiftKey: true });
    expect(dialog.contains(document.activeElement)).toBe(true);
    expect(document.activeElement).toBe(last);
  });

  it('closes on Escape and restores focus to the trigger', () => {
    render(<TkxColorPicker />, { wrapper: Wrapper });
    const trigger = openPicker();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(document.activeElement).toBe(trigger);
  });

  // ── A11y: keyboard-operable slider tracks (a11y-audit MEDIUM #18) ──────────

  it('exposes sat/bright, hue, and alpha tracks as focusable ARIA sliders', () => {
    render(<TkxColorPicker showAlpha />, { wrapper: Wrapper });
    openPicker();
    const sb = screen.getByRole('slider', { name: 'Saturation and brightness' });
    const hue = screen.getByRole('slider', { name: 'Hue' });
    const alpha = screen.getByRole('slider', { name: 'Alpha' });
    for (const track of [sb, hue, alpha]) {
      expect(track.getAttribute('tabindex')).toBe('0');
      expect(track).toHaveAttribute('aria-valuemin');
      expect(track).toHaveAttribute('aria-valuemax');
      expect(track).toHaveAttribute('aria-valuenow');
      expect(track).toHaveAttribute('aria-valuetext');
    }
    expect(hue).toHaveAttribute('aria-valuemax', '360');
  });

  it('adjusts hue with arrow keys (1 step, 10 with Shift)', () => {
    const onChange = vi.fn();
    render(<TkxColorPicker defaultValue="#ff0000" onChange={onChange} />, { wrapper: Wrapper });
    openPicker();
    const hue = screen.getByRole('slider', { name: 'Hue' });
    expect(hue).toHaveAttribute('aria-valuenow', '0');
    fireEvent.keyDown(hue, { key: 'ArrowRight' });
    expect(onChange).toHaveBeenCalled();
    expect(Number(hue.getAttribute('aria-valuenow'))).toBeGreaterThan(0);
    const after1 = Number(hue.getAttribute('aria-valuenow'));
    fireEvent.keyDown(hue, { key: 'ArrowRight', shiftKey: true });
    expect(Number(hue.getAttribute('aria-valuenow'))).toBeGreaterThan(after1);
  });

  it('adjusts saturation/brightness with arrow keys on the 2D area', () => {
    const onChange = vi.fn();
    render(<TkxColorPicker defaultValue="#ff0000" onChange={onChange} />, { wrapper: Wrapper });
    openPicker();
    const sb = screen.getByRole('slider', { name: 'Saturation and brightness' });
    expect(sb).toHaveAttribute('aria-valuenow', '100');
    fireEvent.keyDown(sb, { key: 'ArrowLeft' });
    expect(onChange).toHaveBeenCalled();
    expect(Number(sb.getAttribute('aria-valuenow'))).toBeLessThan(100);
  });

  it('adjusts alpha with arrows and Home/End', () => {
    const onChange = vi.fn();
    render(<TkxColorPicker showAlpha onChange={onChange} />, { wrapper: Wrapper });
    openPicker();
    const alpha = screen.getByRole('slider', { name: 'Alpha' });
    expect(alpha).toHaveAttribute('aria-valuenow', '100');
    fireEvent.keyDown(alpha, { key: 'ArrowLeft' });
    expect(alpha).toHaveAttribute('aria-valuenow', '99');
    fireEvent.keyDown(alpha, { key: 'ArrowLeft', shiftKey: true });
    expect(alpha).toHaveAttribute('aria-valuenow', '89');
    fireEvent.keyDown(alpha, { key: 'Home' });
    expect(alpha).toHaveAttribute('aria-valuenow', '0');
    fireEvent.keyDown(alpha, { key: 'End' });
    expect(alpha).toHaveAttribute('aria-valuenow', '100');
    expect(onChange).toHaveBeenCalled();
  });

  it('restores focus to the trigger on outside click close', () => {
    render(
      <>
        <button data-testid="outside">outside</button>
        <TkxColorPicker />
      </>,
      { wrapper: Wrapper },
    );
    const trigger = openPicker();
    fireEvent.mouseDown(screen.getByTestId('outside'));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(document.activeElement).toBe(trigger);
  });
});
