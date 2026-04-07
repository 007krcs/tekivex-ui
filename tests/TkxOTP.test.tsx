import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TkxOTP } from '../src/components/TkxOTP';
import { ThemeProvider, quantumDark } from '../src/themes';

function Wrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={quantumDark}>{children}</ThemeProvider>;
}

describe('TkxOTP', () => {
  it('renders 6 input boxes by default', () => {
    render(<TkxOTP />, { wrapper: Wrapper });
    const inputs = screen.getAllByRole('textbox');
    expect(inputs).toHaveLength(6);
  });

  it('renders custom number of boxes', () => {
    render(<TkxOTP length={4} />, { wrapper: Wrapper });
    expect(screen.getAllByRole('textbox')).toHaveLength(4);
  });

  it('renders group with aria-label', () => {
    render(<TkxOTP />, { wrapper: Wrapper });
    expect(screen.getByRole('group')).toHaveAttribute('aria-label', 'One-time password');
  });

  it('each input has aria-label with digit position', () => {
    render(<TkxOTP length={4} />, { wrapper: Wrapper });
    expect(screen.getByLabelText('Digit 1 of 4')).toBeInTheDocument();
    expect(screen.getByLabelText('Digit 4 of 4')).toBeInTheDocument();
  });

  it('calls onChange when a digit is entered', () => {
    const onChange = vi.fn();
    render(<TkxOTP onChange={onChange} />, { wrapper: Wrapper });
    const inputs = screen.getAllByRole('textbox');
    fireEvent.change(inputs[0], { target: { value: '5' } });
    expect(onChange).toHaveBeenCalled();
  });

  it('disables all inputs when isDisabled', () => {
    render(<TkxOTP isDisabled />, { wrapper: Wrapper });
    const inputs = screen.getAllByRole('textbox');
    inputs.forEach((input) => {
      expect(input).toBeDisabled();
    });
  });

  it('displays error message when isInvalid', () => {
    render(<TkxOTP isInvalid errorMessage="Invalid code" />, { wrapper: Wrapper });
    expect(screen.getByRole('alert')).toHaveTextContent('Invalid code');
  });

  it('renders hint text', () => {
    render(<TkxOTP hint="Enter the code sent to your email" />, { wrapper: Wrapper });
    expect(screen.getByText('Enter the code sent to your email')).toBeInTheDocument();
  });
});
