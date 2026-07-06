import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TkxAadhaarInput, isValidAadhaar } from '../src/components/TkxAadhaarInput';
import { ThemeProvider, quantumDark } from '../src/themes';

function W({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={quantumDark}>{children}</ThemeProvider>;
}

// Helper: compute the Verhoeff check digit for an 11-digit prefix so we
// can generate guaranteed-valid samples without checking real numbers in.
const D = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
  [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
  [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
  [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
  [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
  [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
  [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
  [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
  [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
];
const P = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
  [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
  [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
  [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
  [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
  [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
  [7, 0, 4, 6, 9, 1, 3, 2, 5, 8],
];
const INV = [0, 4, 3, 2, 1, 5, 6, 7, 8, 9];
function makeValidAadhaar(prefix11: string): string {
  // The check digit d is chosen so that the running c, after processing
  // d at position 0 (P[0]=identity), returns to 0.
  let c = 0;
  const reversed = prefix11.split('').reverse();
  // Position the 11 prefix digits at indices 1..11 of the reverse.
  for (let i = 0; i < reversed.length; i++) {
    c = D[c][P[(i + 1) % 8][parseInt(reversed[i], 10)]];
  }
  return prefix11 + String(INV[c]);
}

const VALID_VERHOEFF = [
  makeValidAadhaar('23412341234'),
  makeValidAadhaar('99994105705'),
  makeValidAadhaar('83541122000'),
];
const INVALID_LENGTH = ['12345', '12345678901234'];
// Take valid numbers and flip the last digit — guaranteed Verhoeff-invalid.
const INVALID_CHECKSUM = VALID_VERHOEFF.map((v) => v.slice(0, 11) + ((parseInt(v[11], 10) + 1) % 10));

describe('isValidAadhaar', () => {
  it('returns true for valid Verhoeff', () => {
    for (const n of VALID_VERHOEFF) expect(isValidAadhaar(n)).toBe(true);
  });
  it('returns false for wrong length', () => {
    for (const n of INVALID_LENGTH) expect(isValidAadhaar(n)).toBe(false);
  });
  it('returns false for failed checksum', () => {
    for (const n of INVALID_CHECKSUM) expect(isValidAadhaar(n)).toBe(false);
  });
  it('strips non-digits', () => {
    const v = VALID_VERHOEFF[0];
    const spaced = `${v.slice(0, 4)} ${v.slice(4, 8)} ${v.slice(8)}`;
    const dashed = `${v.slice(0, 4)}-${v.slice(4, 8)}-${v.slice(8)}`;
    expect(isValidAadhaar(spaced)).toBe(true);
    expect(isValidAadhaar(dashed)).toBe(true);
  });
  it('rejects empty', () => {
    expect(isValidAadhaar('')).toBe(false);
  });
});

describe('TkxAadhaarInput', () => {
  it('renders with label', () => {
    render(<TkxAadhaarInput label="Aadhaar" />, { wrapper: W });
    expect(screen.getByText('Aadhaar')).toBeInTheDocument();
  });

  it('formats input as XXXX XXXX XXXX', () => {
    const onChange = vi.fn();
    render(<TkxAadhaarInput label="Aadhaar" mask={false} onChange={onChange} />, { wrapper: W });
    const input = screen.getByLabelText('Aadhaar') as HTMLInputElement;
    const v = VALID_VERHOEFF[0];
    fireEvent.change(input, { target: { value: v } });
    expect(input.value).toBe(`${v.slice(0, 4)} ${v.slice(4, 8)} ${v.slice(8)}`);
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ digits: v, valid: true }),
    );
  });

  it('masks first 8 digits by default', () => {
    const v = VALID_VERHOEFF[0];
    render(<TkxAadhaarInput label="Aadhaar" defaultValue={v} />, { wrapper: W });
    const input = screen.getByLabelText('Aadhaar') as HTMLInputElement;
    expect(input.value).toBe(`XXXX XXXX ${v.slice(8)}`);
  });

  it('strips non-digits', () => {
    const onChange = vi.fn();
    const v = VALID_VERHOEFF[0];
    render(<TkxAadhaarInput label="Aadhaar" onChange={onChange} />, { wrapper: W });
    fireEvent.change(screen.getByLabelText('Aadhaar'), { target: { value: `abc${v}xyz` } });
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ digits: v, valid: true }),
    );
  });

  it('caps at 12 digits', () => {
    const onChange = vi.fn();
    const v = VALID_VERHOEFF[0];
    render(<TkxAadhaarInput label="Aadhaar" onChange={onChange} />, { wrapper: W });
    fireEvent.change(screen.getByLabelText('Aadhaar'), {
      target: { value: `${v}99999` },
    });
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ digits: v }),
    );
  });

  it('shows error after 12 digits with bad checksum', () => {
    render(<TkxAadhaarInput label="Aadhaar" defaultValue={INVALID_CHECKSUM[0]} />, { wrapper: W });
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('shows "X digits remaining" while incomplete', () => {
    render(<TkxAadhaarInput label="Aadhaar" defaultValue="1234" />, { wrapper: W });
    expect(screen.getByText(/8 digits remaining/i)).toBeInTheDocument();
  });

  it('respects controlled value', () => {
    const v = VALID_VERHOEFF[0];
    const { rerender } = render(<TkxAadhaarInput label="Aadhaar" value="2341" mask={false} />, { wrapper: W });
    expect((screen.getByLabelText('Aadhaar') as HTMLInputElement).value).toBe('2341');
    rerender(
      <ThemeProvider theme={quantumDark}>
        <TkxAadhaarInput label="Aadhaar" value={v} mask={false} />
      </ThemeProvider>,
    );
    expect((screen.getByLabelText('Aadhaar') as HTMLInputElement).value).toBe(
      `${v.slice(0, 4)} ${v.slice(4, 8)} ${v.slice(8)}`,
    );
  });

  // ── Mask-at-rest regression (the old always-masked value destroyed typed
  //    digits: each keystroke's X's were stripped as non-digits) ─────────────
  it('is editable while focused in masked mode — sequential typing accumulates all 12 digits', () => {
    const v = VALID_VERHOEFF[0];
    const payloads: string[] = [];
    render(
      <TkxAadhaarInput label="Aadhaar" onChange={(p) => payloads.push(p.digits)} />,
      { wrapper: W },
    );
    const input = screen.getByLabelText('Aadhaar') as HTMLInputElement;
    fireEvent.focus(input);
    // Simulate real typing: each keystroke's event value is the CURRENT
    // visible value plus the next digit appended.
    for (const ch of v) {
      fireEvent.change(input, { target: { value: input.value + ch } });
    }
    expect(payloads[payloads.length - 1]).toBe(v); // all 12 digits survived
    // While focused, the real digits are visible (editable).
    expect(input.value).toBe(`${v.slice(0, 4)} ${v.slice(4, 8)} ${v.slice(8)}`);
  });

  it('re-masks on blur and unmasks on focus', () => {
    const v = VALID_VERHOEFF[0];
    render(<TkxAadhaarInput label="Aadhaar" defaultValue={v} />, { wrapper: W });
    const input = screen.getByLabelText('Aadhaar') as HTMLInputElement;
    // At rest: masked.
    expect(input.value).toBe(`XXXX XXXX ${v.slice(8)}`);
    fireEvent.focus(input);
    expect(input.value).toBe(`${v.slice(0, 4)} ${v.slice(4, 8)} ${v.slice(8)}`);
    fireEvent.blur(input);
    expect(input.value).toBe(`XXXX XXXX ${v.slice(8)}`);
  });
});
