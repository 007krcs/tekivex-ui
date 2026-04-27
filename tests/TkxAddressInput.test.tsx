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
});
