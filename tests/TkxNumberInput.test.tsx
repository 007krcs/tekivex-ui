import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { useState } from 'react';
import { TkxNumberInput } from '../src/components/TkxNumberInput';
import { TkxButton } from '../src/components/TkxButton';
import { ThemeProvider, quantumDark } from '../src/themes';

function Wrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={quantumDark}>{children}</ThemeProvider>;
}

describe('TkxNumberInput — onChange while typing', () => {
  it('fires onChange on each keystroke that parses to a number, not only on blur', () => {
    const onChange = vi.fn();
    render(<TkxNumberInput label="Price" defaultValue={0} onChange={onChange} />, { wrapper: Wrapper });
    const input = screen.getByRole('spinbutton');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: '1' } });
    fireEvent.change(input, { target: { value: '10' } });
    fireEvent.change(input, { target: { value: '100' } });
    expect(onChange).toHaveBeenCalledTimes(3);
    expect(onChange).toHaveBeenLastCalledWith(100);
  });

  it('leaves partial entries alone until they parse', () => {
    const onChange = vi.fn();
    render(<TkxNumberInput label="Amount" defaultValue={0} onChange={onChange} />, { wrapper: Wrapper });
    const input = screen.getByRole('spinbutton');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: '-' } });
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.change(input, { target: { value: '1.' } });
    expect(onChange).toHaveBeenLastCalledWith(1);
    // The typed text is preserved while focused so the user can keep typing.
    expect((input as HTMLInputElement).value).toBe('1.');
    fireEvent.change(input, { target: { value: '1.5' } });
    expect(onChange).toHaveBeenLastCalledWith(1.5);
    fireEvent.change(input, { target: { value: '1.5abc' } });
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it('still clamps and formats on blur', () => {
    const onChange = vi.fn();
    render(<TkxNumberInput label="Qty" defaultValue={0} max={50} onChange={onChange} />, { wrapper: Wrapper });
    const input = screen.getByRole('spinbutton');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: '120' } });
    expect(onChange).toHaveBeenLastCalledWith(120);
    fireEvent.blur(input);
    expect(onChange).toHaveBeenLastCalledWith(50);
  });

  it('a controlled parent sees the value before the field loses focus', () => {
    function Form() {
      const [v, setV] = useState<number | null>(null);
      return (
        <>
          <TkxNumberInput label="Budget" value={v ?? 0} onChange={setV} />
          <TkxButton isDisabled={!v}>Submit</TkxButton>
        </>
      );
    }
    render(<Form />, { wrapper: Wrapper });
    const input = screen.getByRole('spinbutton');
    const button = screen.getByRole('button', { name: 'Submit' });
    expect(button).toBeDisabled();
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: '100' } });
    expect(button).not.toBeDisabled();
  });
});
