import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, quantumDark } from '../src/themes';
import { TkxTextarea } from '../src/components/TkxTextarea';

function W({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={quantumDark}>{children}</ThemeProvider>;
}

describe('TkxTextarea', () => {
  it('renders a labelled textarea wired for a11y', () => {
    render(<TkxTextarea label="Bio" hint="Tell us about yourself" />, { wrapper: W });
    const ta = screen.getByLabelText('Bio');
    expect(ta.tagName).toBe('TEXTAREA');
    expect(ta.getAttribute('aria-describedby')).toContain('-hint');
  });

  it('forwards a ref to the underlying textarea', () => {
    const ref = { current: null as HTMLTextAreaElement | null };
    render(<TkxTextarea label="X" ref={ref} />, { wrapper: W });
    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
  });

  it('controlled value + onChange round-trips', () => {
    const onChange = vi.fn();
    render(<TkxTextarea label="Msg" value="hi" onChange={onChange} />, { wrapper: W });
    const ta = screen.getByLabelText('Msg') as HTMLTextAreaElement;
    expect(ta.value).toBe('hi');
    fireEvent.change(ta, { target: { value: 'hello' } });
    expect(onChange).toHaveBeenCalled();
  });

  it('shows an error with role=alert and aria-invalid', () => {
    render(<TkxTextarea label="X" error="Required" />, { wrapper: W });
    expect(screen.getByRole('alert').textContent).toContain('Required');
    expect(screen.getByLabelText('X').getAttribute('aria-invalid')).toBe('true');
  });

  it('marks required with aria-required + visual asterisk', () => {
    render(<TkxTextarea label="X" isRequired />, { wrapper: W });
    // A textarea exposes role="textbox"; query by role since the asterisk
    // changes the visible label text.
    expect(screen.getByRole('textbox').getAttribute('aria-required')).toBe('true');
  });

  it('renders a live character counter when showCount + maxLength', () => {
    render(<TkxTextarea label="X" showCount maxLength={10} defaultValue="abc" />, { wrapper: W });
    expect(screen.getByText('3 / 10')).toBeTruthy();
    const ta = screen.getByLabelText('X') as HTMLTextAreaElement;
    fireEvent.change(ta, { target: { value: 'abcdef' } });
    expect(screen.getByText('6 / 10')).toBeTruthy();
  });

  it('strips Trojan-Source unicode on input by default', () => {
    const onChange = vi.fn();
    render(<TkxTextarea label="X" onChange={onChange} />, { wrapper: W });
    const ta = screen.getByLabelText('X') as HTMLTextAreaElement;
    // U+202E RIGHT-TO-LEFT OVERRIDE
    fireEvent.change(ta, { target: { value: 'safe‮evil' } });
    expect(onChange).toHaveBeenCalled();
    expect(ta.value).not.toContain('‮');
  });

  it('respects minRows', () => {
    render(<TkxTextarea label="X" minRows={5} />, { wrapper: W });
    expect((screen.getByLabelText('X') as HTMLTextAreaElement).rows).toBe(5);
  });

  it('survives a bare mount (label is the only required prop)', () => {
    expect(() =>
      render(<TkxTextarea label="X" />, { wrapper: W }),
    ).not.toThrow();
  });
});
