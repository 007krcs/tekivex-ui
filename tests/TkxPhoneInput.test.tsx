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
