import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TkxPhoneInput, COUNTRIES } from '../src/components/TkxPhoneInput';
import { ThemeProvider, quantumDark } from '../src/themes';

function Wrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={quantumDark}>{children}</ThemeProvider>;
}

describe('TkxPhoneInput', () => {
  it('renders with default country (India)', () => {
    render(<TkxPhoneInput label="Mobile" />, { wrapper: Wrapper });
    expect(screen.getByLabelText(/Mobile/)).toBeInTheDocument();
    // Picker shows +91
    expect(screen.getByRole('button', { name: /India/i })).toBeInTheDocument();
  });

  it('formats Indian numbers as 5-5 grouping', () => {
    const onChange = vi.fn();
    render(<TkxPhoneInput label="Mobile" onChange={onChange} />, { wrapper: Wrapper });
    const input = screen.getByLabelText(/Mobile/) as HTMLInputElement;
    fireEvent.change(input, { target: { value: '9876543210' } });
    expect(input.value).toBe('98765 43210');
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ digits: '9876543210', e164: '+919876543210', valid: true }),
    );
  });

  it('marks short Indian numbers as invalid', () => {
    const onChange = vi.fn();
    render(<TkxPhoneInput label="Mobile" onChange={onChange} />, { wrapper: Wrapper });
    fireEvent.change(screen.getByLabelText(/Mobile/), { target: { value: '12345' } });
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ valid: false }));
  });

  it('strips non-digits as user types', () => {
    render(<TkxPhoneInput label="Mobile" />, { wrapper: Wrapper });
    const input = screen.getByLabelText(/Mobile/) as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'abc987def6543210' } });
    expect(input.value).toBe('98765 43210');
  });

  it('caps input at 15 digits (E.164 max)', () => {
    render(<TkxPhoneInput label="Mobile" />, { wrapper: Wrapper });
    const input = screen.getByLabelText(/Mobile/) as HTMLInputElement;
    fireEvent.change(input, { target: { value: '1234567890123456789' } });
    // Stored value is digits-only, 15 chars max → formatted output starts with "12345 67890" then trailing
    const digits = input.value.replace(/\D/g, '');
    expect(digits.length).toBeLessThanOrEqual(15);
  });

  it('parses controlled E.164 value into a +1 country (US/Canada share dial)', () => {
    render(<TkxPhoneInput label="Mobile" value="+14155551234" />, { wrapper: Wrapper });
    // Dial code 1 is shared by US + Canada; either is acceptable.
    expect(screen.getByRole('button', { name: /dial code \+1\b/i })).toBeInTheDocument();
  });

  it('exports COUNTRIES list with at least 50 entries', () => {
    expect(COUNTRIES.length).toBeGreaterThanOrEqual(50);
    expect(COUNTRIES.every((c) => c.iso2.length === 2)).toBe(true);
    expect(COUNTRIES.every((c) => /^\d+$/.test(c.dial))).toBe(true);
  });
});

// ── Regression: WAI-ARIA 1.2 idref integrity (dangling-idref) ──────────────
// The country-picker button set aria-controls unconditionally, but the
// listbox only mounts while the picker is open — so the reference dangled
// on every closed render.
describe('TkxPhoneInput — aria-controls idref integrity', () => {
  function expectAllIdrefsResolve() {
    for (const el of Array.from(document.querySelectorAll('[aria-controls]'))) {
      for (const id of el.getAttribute('aria-controls')!.trim().split(/\s+/)) {
        expect(document.getElementById(id), `aria-controls="${id}" does not resolve`).not.toBeNull();
      }
    }
  }

  const picker = () => screen.getByRole('button', { name: /Country:/i });

  it('closed picker advertises no aria-controls', () => {
    render(<TkxPhoneInput label="Mobile" />, { wrapper: Wrapper });
    expect(picker()).not.toHaveAttribute('aria-controls');
    expect(picker()).toHaveAttribute('aria-expanded', 'false');
    expectAllIdrefsResolve();
  });

  it('open picker points aria-controls at the rendered listbox', () => {
    render(<TkxPhoneInput label="Mobile" />, { wrapper: Wrapper });
    fireEvent.click(picker());
    const listbox = screen.getByRole('listbox');
    expect(picker()).toHaveAttribute('aria-controls', listbox.id);
    expect(document.getElementById(listbox.id)).toBe(listbox);
    expectAllIdrefsResolve();
  });

  it('closing the picker withdraws the idref again', () => {
    render(<TkxPhoneInput label="Mobile" />, { wrapper: Wrapper });
    fireEvent.click(picker());
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    fireEvent.click(picker());
    expect(screen.queryByRole('listbox')).toBeNull();
    expect(picker()).not.toHaveAttribute('aria-controls');
    expectAllIdrefsResolve();
  });

  it('a disabled picker never advertises aria-controls', () => {
    render(<TkxPhoneInput label="Mobile" disabled />, { wrapper: Wrapper });
    expect(picker()).not.toHaveAttribute('aria-controls');
    expectAllIdrefsResolve();
  });
});
