import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TkxAddressInput } from '../src/components/TkxAddressInput';
import { ThemeProvider, quantumDark } from '../src/themes';

function W({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={quantumDark}>{children}</ThemeProvider>;
}

describe('TkxAddressInput', () => {
  beforeEach(() => {
    // Default: no real network — every test injects its own lookup mock.
  });

  it('renders all three field labels', () => {
    render(<TkxAddressInput value={{}} onChange={() => {}} lookup={async () => []} />, { wrapper: W });
    expect(screen.getByPlaceholderText('000000')).toBeInTheDocument();
    expect(screen.getByText('PIN code')).toBeInTheDocument();
    expect(screen.getByText('City')).toBeInTheDocument();
    expect(screen.getByText('State')).toBeInTheDocument();
  });

  it('caps PIN at 6 digits and strips non-digits', () => {
    const onChange = vi.fn();
    render(<TkxAddressInput value={{}} onChange={onChange} lookup={async () => []} />, { wrapper: W });
    const pin = screen.getByPlaceholderText('000000') as HTMLInputElement;
    fireEvent.change(pin, { target: { value: 'abc1234567def' } });
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ pin: '123456' }));
  });

  it('does not trigger lookup until 6 digits', async () => {
    const lookup = vi.fn(async () => []);
    const Wrapper = () => {
      const [v, setV] = (require('react') as typeof import('react')).useState({});
      return <TkxAddressInput value={v} onChange={setV} lookup={lookup} />;
    };
    render(<Wrapper />, { wrapper: W });
    fireEvent.change(screen.getByPlaceholderText('000000'), { target: { value: '12345' } });
    // Brief delay; ensure no lookup occurred for incomplete PIN.
    await new Promise((r) => setTimeout(r, 50));
    expect(lookup).not.toHaveBeenCalled();
  });

  it('triggers lookup when PIN reaches 6 digits and renders matches', async () => {
    const lookup = vi.fn(async () => [
      { Name: 'Bandra', District: 'Mumbai', State: 'Maharashtra', Country: 'India', Pincode: '400050' },
      { Name: 'Khar', District: 'Mumbai', State: 'Maharashtra', Country: 'India', Pincode: '400050' },
    ]);
    const Wrapper = () => {
      const [v, setV] = (require('react') as typeof import('react')).useState<any>({});
      return <TkxAddressInput value={v} onChange={setV} lookup={lookup} />;
    };
    render(<Wrapper />, { wrapper: W });
    fireEvent.change(screen.getByPlaceholderText('000000'), { target: { value: '400050' } });
    await waitFor(() => expect(lookup).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(screen.getByText('Bandra')).toBeInTheDocument());
    expect(screen.getByText('Khar')).toBeInTheDocument();
  });

  it('shows error when lookup returns empty', async () => {
    const lookup = vi.fn(async () => []);
    const Wrapper = () => {
      const [v, setV] = (require('react') as typeof import('react')).useState<any>({});
      return <TkxAddressInput value={v} onChange={setV} lookup={lookup} />;
    };
    render(<Wrapper />, { wrapper: W });
    fireEvent.change(screen.getByPlaceholderText('000000'), { target: { value: '999999' } });
    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
  });

  it('hides address-line inputs when showAddressLines={false}', () => {
    render(
      <TkxAddressInput value={{}} onChange={() => {}} lookup={async () => []} showAddressLines={false} />,
      { wrapper: W },
    );
    expect(screen.queryByPlaceholderText(/Address line 1/)).not.toBeInTheDocument();
  });

  // ── Divisions-driven cascade (v3.20) ─────────────────────────────────────

  // Minimal in-memory loader for cascade tests. Mirrors the DivisionsLoader
  // contract exactly so the component sees nothing test-specific.
  function makeLoader() {
    return {
      countries: vi.fn(async () => [{ code: 'IN', name: 'India' }]),
      states: vi.fn(async (countryCode: string) => {
        if (countryCode !== 'IN') return [];
        return [
          { code: 'IN-MH', name: 'Maharashtra' },
          { code: 'IN-AP', name: 'Andhra Pradesh' },
        ];
      }),
      districts: vi.fn(async (_c: string, stateCode: string) => {
        if (stateCode === 'IN-MH') return [{ code: 'MH-PUN', name: 'Pune' }];
        if (stateCode === 'IN-AP') return [{ code: 'AP-GNT', name: 'Guntur' }];
        return [];
      }),
      subDistricts: vi.fn(async (_c: string, _s: string, districtCode: string) => {
        if (districtCode === 'MH-PUN') return [{ code: 'PUN-HAV', name: 'Haveli' }];
        if (districtCode === 'AP-GNT') return [{ code: 'GNT-TAD', name: 'Tadepalli' }];
        return [];
      }),
      subDistrictLabel: vi.fn((_c: string, stateCode: string) => {
        if (stateCode === 'IN-MH') return 'Taluka';
        if (stateCode === 'IN-AP') return 'Mandal';
        return 'Sub-district';
      }),
    };
  }

  it('renders no division dropdowns when divisionsSource is omitted', () => {
    render(<TkxAddressInput value={{}} onChange={() => {}} lookup={async () => []} />, { wrapper: W });
    // The four cascade selects only exist when divisionsSource is passed.
    expect(screen.queryByLabelText('Country')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('State / UT')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('District')).not.toBeInTheDocument();
  });

  it('renders all four division dropdowns when divisionsSource is supplied', async () => {
    const loader = makeLoader();
    render(
      <TkxAddressInput value={{}} onChange={() => {}} lookup={async () => []} divisionsSource={loader} />,
      { wrapper: W },
    );
    expect(screen.getByLabelText('Country')).toBeInTheDocument();
    expect(screen.getByLabelText('State / UT')).toBeInTheDocument();
    expect(screen.getByLabelText('District')).toBeInTheDocument();
    expect(screen.getByLabelText('Sub-district')).toBeInTheDocument();
    await waitFor(() => expect(loader.countries).toHaveBeenCalledTimes(1));
  });

  it('cascades: picking a state calls states() with the country code', async () => {
    const loader = makeLoader();
    const Wrapper = () => {
      const [v, setV] = (require('react') as typeof import('react')).useState<any>({});
      return <TkxAddressInput value={v} onChange={setV} lookup={async () => []} divisionsSource={loader} />;
    };
    render(<Wrapper />, { wrapper: W });
    await waitFor(() => expect(screen.getByRole('option', { name: 'India' })).toBeInTheDocument());
    fireEvent.change(screen.getByLabelText('Country'), { target: { value: 'IN' } });
    await waitFor(() => expect(loader.states).toHaveBeenCalledWith('IN', expect.anything()));
    await waitFor(() => expect(screen.getByRole('option', { name: 'Maharashtra' })).toBeInTheDocument());
  });

  it('cascades: picking a district then sub-district populates all codes + display names', async () => {
    const loader = makeLoader();
    const onChange = vi.fn();
    const Wrapper = () => {
      const React = require('react') as typeof import('react');
      const [v, setV] = React.useState<any>({});
      const handle = (next: any) => { setV(next); onChange(next); };
      return <TkxAddressInput value={v} onChange={handle} lookup={async () => []} divisionsSource={loader} />;
    };
    render(<Wrapper />, { wrapper: W });
    await waitFor(() => expect(screen.getByRole('option', { name: 'India' })).toBeInTheDocument());
    fireEvent.change(screen.getByLabelText('Country'), { target: { value: 'IN' } });
    await waitFor(() => expect(screen.getByRole('option', { name: 'Maharashtra' })).toBeInTheDocument());
    fireEvent.change(screen.getByLabelText('State / UT'), { target: { value: 'IN-MH' } });
    await waitFor(() => expect(screen.getByRole('option', { name: 'Pune' })).toBeInTheDocument());
    fireEvent.change(screen.getByLabelText('District'), { target: { value: 'MH-PUN' } });
    await waitFor(() => expect(screen.getByRole('option', { name: 'Haveli' })).toBeInTheDocument());
    fireEvent.change(screen.getByLabelText('Taluka'), { target: { value: 'PUN-HAV' } });

    // Final emitted value should carry every code + every display name.
    const last = onChange.mock.calls[onChange.mock.calls.length - 1][0];
    expect(last).toMatchObject({
      countryCode: 'IN', country: 'India',
      stateCode: 'IN-MH', state: 'Maharashtra',
      districtCode: 'MH-PUN', city: 'Pune',
      subDistrictCode: 'PUN-HAV', subDistrict: 'Haveli',
    });
  });

  it('regional sub-district label updates per state ("Taluka" for MH, "Mandal" for AP)', async () => {
    const loader = makeLoader();
    const Wrapper = () => {
      const [v, setV] = (require('react') as typeof import('react')).useState<any>({});
      return <TkxAddressInput value={v} onChange={setV} lookup={async () => []} divisionsSource={loader} />;
    };
    render(<Wrapper />, { wrapper: W });
    await waitFor(() => expect(screen.getByRole('option', { name: 'India' })).toBeInTheDocument());
    fireEvent.change(screen.getByLabelText('Country'), { target: { value: 'IN' } });
    await waitFor(() => expect(screen.getByRole('option', { name: 'Maharashtra' })).toBeInTheDocument());
    fireEvent.change(screen.getByLabelText('State / UT'), { target: { value: 'IN-MH' } });
    await waitFor(() => expect(screen.getByLabelText('Taluka')).toBeInTheDocument());
    fireEvent.change(screen.getByLabelText('State / UT'), { target: { value: 'IN-AP' } });
    await waitFor(() => expect(screen.getByLabelText('Mandal')).toBeInTheDocument());
  });

  it('picking a higher level clears downstream codes/names', async () => {
    const loader = makeLoader();
    const onChange = vi.fn();
    const Wrapper = () => {
      const React = require('react') as typeof import('react');
      const [v, setV] = React.useState<any>({});
      const handle = (next: any) => { setV(next); onChange(next); };
      return <TkxAddressInput value={v} onChange={handle} lookup={async () => []} divisionsSource={loader} />;
    };
    render(<Wrapper />, { wrapper: W });
    await waitFor(() => expect(screen.getByRole('option', { name: 'India' })).toBeInTheDocument());
    fireEvent.change(screen.getByLabelText('Country'), { target: { value: 'IN' } });
    await waitFor(() => expect(screen.getByRole('option', { name: 'Maharashtra' })).toBeInTheDocument());
    fireEvent.change(screen.getByLabelText('State / UT'), { target: { value: 'IN-MH' } });
    await waitFor(() => expect(screen.getByRole('option', { name: 'Pune' })).toBeInTheDocument());
    fireEvent.change(screen.getByLabelText('District'), { target: { value: 'MH-PUN' } });
    onChange.mockClear();

    // Re-pick state — district + sub-district must clear.
    fireEvent.change(screen.getByLabelText('State / UT'), { target: { value: 'IN-AP' } });
    const last = onChange.mock.calls[onChange.mock.calls.length - 1][0];
    expect(last.stateCode).toBe('IN-AP');
    expect(last.districtCode).toBeUndefined();
    expect(last.city).toBeUndefined();
    expect(last.subDistrictCode).toBeUndefined();
    expect(last.subDistrict).toBeUndefined();
  });

  it('PIN lookup still works (and does not require divisionsSource)', async () => {
    const lookup = vi.fn(async () => [
      { Name: 'Bandra', District: 'Mumbai', State: 'Maharashtra', Country: 'India', Pincode: '400050' },
    ]);
    const Wrapper = () => {
      const [v, setV] = (require('react') as typeof import('react')).useState<any>({});
      return <TkxAddressInput value={v} onChange={setV} lookup={lookup} />;
    };
    render(<Wrapper />, { wrapper: W });
    fireEvent.change(screen.getByPlaceholderText('000000'), { target: { value: '400050' } });
    await waitFor(() => expect(lookup).toHaveBeenCalledTimes(1));
  });
});

// ── ARIA regression: every text field needs a programmatic label ────────────
describe('TkxAddressInput — accessible names', () => {
  it('associates the PIN / City / State labels with their inputs', () => {
    render(<TkxAddressInput value={{}} onChange={() => {}} lookup={async () => []} />, {
      wrapper: W,
    });
    expect(screen.getByLabelText(/PIN code/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^City$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^State$/i)).toBeInTheDocument();
  });

  it('leaves no unnamed input in the tree', () => {
    const { container } = render(
      <TkxAddressInput value={{}} onChange={() => {}} lookup={async () => []} />,
      { wrapper: W },
    );
    const doc = container.ownerDocument;
    container.querySelectorAll('input, select').forEach((el) => {
      const named =
        el.getAttribute('aria-label') ||
        el.getAttribute('aria-labelledby') ||
        (el.id && doc.querySelector(`label[for="${el.id}"]`)) ||
        el.closest('label');
      expect(named).toBeTruthy();
    });
  });

  it('gives the address lines a name beyond the placeholder', () => {
    render(<TkxAddressInput value={{}} onChange={() => {}} lookup={async () => []} />, {
      wrapper: W,
    });
    expect(screen.getByLabelText('Address line 1')).toBeInTheDocument();
    expect(screen.getByLabelText('Address line 2 (optional)')).toBeInTheDocument();
  });

  it('does not reuse one id for the division select and the free-text state field', () => {
    const { container } = render(
      <TkxAddressInput
        value={{}}
        onChange={() => {}}
        lookup={async () => []}
        divisionsSource={{
          countries: async () => [{ code: 'IN', name: 'India' }],
          states: async () => [],
          districts: async () => [],
          subDistricts: async () => [],
        }}
      />,
      { wrapper: W },
    );
    const ids = Array.from(container.querySelectorAll('[id]')).map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
