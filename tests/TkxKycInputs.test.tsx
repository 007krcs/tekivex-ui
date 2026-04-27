import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  TkxPanInput,
  TkxVoterIdInput,
  TkxDrivingLicenceInput,
  isValidPan,
  isValidVoterId,
  isValidDrivingLicence,
} from '../src/components/TkxKycInputs';
import { ThemeProvider, quantumDark } from '../src/themes';

function W({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={quantumDark}>{children}</ThemeProvider>;
}

// ── isValidPan ─────────────────────────────────────────────────────────
describe('isValidPan', () => {
  it('accepts valid PAN with each entity-type char', () => {
    // 4th char codes: P=Individual, F=Firm, C=Company, H=HUF, A=AOP,
    // T=Trust, B=BOI, L=Local, J=Juridical, G=Government
    expect(isValidPan('ABCPK1234F')).toBe(true);  // P
    expect(isValidPan('ABCFK1234F')).toBe(true);  // F
    expect(isValidPan('ABCCK1234F')).toBe(true);  // C
    expect(isValidPan('ABCHK1234F')).toBe(true);  // H
    expect(isValidPan('ABCAK1234F')).toBe(true);  // A
    expect(isValidPan('ABCTK1234F')).toBe(true);  // T
  });
  it('rejects invalid 4th-char code', () => {
    expect(isValidPan('ABCXK1234F')).toBe(false); // X not a valid entity
    expect(isValidPan('ABCZK1234F')).toBe(false);
  });
  it('rejects wrong length', () => {
    expect(isValidPan('ABCPK1234')).toBe(false);
    expect(isValidPan('ABCPK1234FG')).toBe(false);
  });
  it('rejects wrong format', () => {
    expect(isValidPan('1ABCK1234F')).toBe(false); // starts with digit
    expect(isValidPan('ABCPK12345')).toBe(false); // ends with digit
  });
  it('auto-uppercases', () => {
    expect(isValidPan('abcpk1234f')).toBe(true);
  });
  it('rejects empty', () => {
    expect(isValidPan('')).toBe(false);
  });
});

// ── isValidVoterId ─────────────────────────────────────────────────────
describe('isValidVoterId', () => {
  it('accepts valid format', () => {
    expect(isValidVoterId('ABC1234567')).toBe(true);
    expect(isValidVoterId('xyz9876543')).toBe(true);
  });
  it('rejects wrong format', () => {
    expect(isValidVoterId('AB1234567')).toBe(false);     // 2 letters
    expect(isValidVoterId('ABCD1234567')).toBe(false);   // 4 letters
    expect(isValidVoterId('ABC123456')).toBe(false);     // 6 digits
    expect(isValidVoterId('ABC12345678')).toBe(false);   // 8 digits
  });
  it('rejects empty', () => {
    expect(isValidVoterId('')).toBe(false);
  });
});

// ── isValidDrivingLicence ─────────────────────────────────────────────
describe('isValidDrivingLicence', () => {
  it('accepts canonical format', () => {
    expect(isValidDrivingLicence('MH1220100012345')).toBe(true);
  });
  it('accepts hyphenated', () => {
    expect(isValidDrivingLicence('MH-12-2010-0012345')).toBe(true);
  });
  it('accepts spaced', () => {
    expect(isValidDrivingLicence('MH 12 2010 0012345')).toBe(true);
  });
  it('rejects wrong length', () => {
    expect(isValidDrivingLicence('MH122010001234')).toBe(false);
    expect(isValidDrivingLicence('MH12201000123456')).toBe(false);
  });
  it('rejects digits in state code', () => {
    expect(isValidDrivingLicence('M11220100012345')).toBe(false);
  });
});

// ── TkxPanInput ────────────────────────────────────────────────────────
describe('TkxPanInput', () => {
  it('renders with label', () => {
    render(<TkxPanInput label="PAN" />, { wrapper: W });
    expect(screen.getByText('PAN')).toBeInTheDocument();
  });
  it('uppercases as user types', () => {
    const onChange = vi.fn();
    render(<TkxPanInput label="PAN" onChange={onChange} />, { wrapper: W });
    const input = screen.getByLabelText('PAN') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'abcpk1234f' } });
    expect(input.value).toBe('ABCPK1234F');
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ normalised: 'ABCPK1234F', valid: true }),
    );
  });
  it('strips non-alphanumeric', () => {
    const onChange = vi.fn();
    render(<TkxPanInput label="PAN" onChange={onChange} />, { wrapper: W });
    fireEvent.change(screen.getByLabelText('PAN'), {
      target: { value: 'ABC PK1234F!' },
    });
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ normalised: 'ABCPK1234F' }),
    );
  });
  it('caps at 10 chars', () => {
    const onChange = vi.fn();
    render(<TkxPanInput label="PAN" onChange={onChange} />, { wrapper: W });
    fireEvent.change(screen.getByLabelText('PAN'), {
      target: { value: 'ABCPK1234FXY' },
    });
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ normalised: 'ABCPK1234F' }),
    );
  });
  it('shows error after 10 chars when invalid', () => {
    render(<TkxPanInput label="PAN" defaultValue="ABCXK1234F" />, { wrapper: W });
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
});

// ── TkxVoterIdInput ────────────────────────────────────────────────────
describe('TkxVoterIdInput', () => {
  it('renders with label', () => {
    render(<TkxVoterIdInput label="Voter ID" />, { wrapper: W });
    expect(screen.getByText('Voter ID')).toBeInTheDocument();
  });
  it('uppercases + validates', () => {
    const onChange = vi.fn();
    render(<TkxVoterIdInput label="Voter ID" onChange={onChange} />, { wrapper: W });
    fireEvent.change(screen.getByLabelText('Voter ID'), {
      target: { value: 'abc1234567' },
    });
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ normalised: 'ABC1234567', valid: true }),
    );
  });
});

// ── TkxDrivingLicenceInput ────────────────────────────────────────────
describe('TkxDrivingLicenceInput', () => {
  it('renders with label', () => {
    render(<TkxDrivingLicenceInput label="DL" />, { wrapper: W });
    expect(screen.getByText('DL')).toBeInTheDocument();
  });
  it('produces both normalised and pretty forms', () => {
    const onChange = vi.fn();
    render(<TkxDrivingLicenceInput label="DL" onChange={onChange} />, { wrapper: W });
    fireEvent.change(screen.getByLabelText('DL'), {
      target: { value: 'MH 12 2010 0012345' },
    });
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        normalised: 'MH1220100012345',
        pretty: 'MH-12-2010-0012345',
        valid: true,
      }),
    );
  });
});
