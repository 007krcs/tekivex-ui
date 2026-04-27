import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TkxCurrencyInput } from '../src/components/TkxCurrencyInput';
import { ThemeProvider, quantumDark } from '../src/themes';

function W({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={quantumDark}>{children}</ThemeProvider>;
}

describe('TkxCurrencyInput', () => {
  it('renders with label', () => {
    render(<TkxCurrencyInput label="Income" value={null} onChange={() => {}} />, { wrapper: W });
    expect(screen.getByText('Income')).toBeInTheDocument();
  });

  it('formats INR with lakh/crore grouping (1,23,456)', () => {
    render(
      <TkxCurrencyInput
        label="Income"
        value={123456}
        onChange={() => {}}
        currency="INR"
      />,
      { wrapper: W },
    );
    const input = screen.getByLabelText('Income') as HTMLInputElement;
    // en-IN format: 1,23,456 — not 123,456
    expect(input.value).toMatch(/1,23,456/);
  });

  it('formats USD with thousand grouping (123,456)', () => {
    render(
      <TkxCurrencyInput
        label="Income"
        value={123456}
        onChange={() => {}}
        currency="USD"
      />,
      { wrapper: W },
    );
    const input = screen.getByLabelText('Income') as HTMLInputElement;
    expect(input.value).toMatch(/123,456/);
  });

  it('shows the currency symbol prefix by default', () => {
    render(
      <TkxCurrencyInput
        label="Amount"
        value={100}
        onChange={() => {}}
        currency="USD"
      />,
      { wrapper: W },
    );
    expect(screen.getByText('$')).toBeInTheDocument();
  });

  it('hides symbol when showSymbol={false}', () => {
    render(
      <TkxCurrencyInput
        label="Amount"
        value={100}
        onChange={() => {}}
        currency="USD"
        showSymbol={false}
      />,
      { wrapper: W },
    );
    expect(screen.queryByText('$')).not.toBeInTheDocument();
  });

  it('parses user input back to number', () => {
    const onChange = vi.fn();
    render(
      <TkxCurrencyInput label="A" value={null} onChange={onChange} currency="USD" />,
      { wrapper: W },
    );
    fireEvent.change(screen.getByLabelText('A'), { target: { value: '1234' } });
    expect(onChange).toHaveBeenCalledWith(1234);
  });

  it('clamps to min/max bounds', () => {
    const onChange = vi.fn();
    render(
      <TkxCurrencyInput label="A" value={null} onChange={onChange} min={10} max={100} currency="USD" />,
      { wrapper: W },
    );
    fireEvent.change(screen.getByLabelText('A'), { target: { value: '5' } });
    expect(onChange).toHaveBeenCalledWith(10);
    fireEvent.change(screen.getByLabelText('A'), { target: { value: '500' } });
    expect(onChange).toHaveBeenCalledWith(100);
  });

  it('emits null on empty input', () => {
    const onChange = vi.fn();
    render(<TkxCurrencyInput label="A" value={42} onChange={onChange} currency="USD" />, {
      wrapper: W,
    });
    fireEvent.change(screen.getByLabelText('A'), { target: { value: '' } });
    expect(onChange).toHaveBeenLastCalledWith(null);
  });

  it('uses precision=0 for JPY/KRW', () => {
    render(<TkxCurrencyInput label="Yen" value={1234.56} onChange={() => {}} currency="JPY" />, {
      wrapper: W,
    });
    const input = screen.getByLabelText('Yen') as HTMLInputElement;
    // JPY has no minor unit — should not show decimal places.
    expect(input.value).not.toMatch(/\./);
  });
});
