import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TkxInput } from '../src/components/TkxInput';
import { ThemeProvider, quantumDark } from '../src/themes';

function Wrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={quantumDark}>{children}</ThemeProvider>;
}

describe('TkxInput', () => {
  it('renders with a label', () => {
    render(<TkxInput label="Email" />, { wrapper: Wrapper });
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('renders placeholder text', () => {
    render(<TkxInput label="Name" placeholder="Enter your name" />, { wrapper: Wrapper });
    expect(screen.getByPlaceholderText('Enter your name')).toBeInTheDocument();
  });

  it('calls onChange when typing', () => {
    const onChange = vi.fn();
    render(<TkxInput label="Search" onChange={onChange} />, { wrapper: Wrapper });
    fireEvent.change(screen.getByLabelText('Search'), { target: { value: 'hello' } });
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is set', () => {
    render(<TkxInput label="Disabled" disabled />, { wrapper: Wrapper });
    expect(screen.getByLabelText('Disabled')).toBeDisabled();
  });

  it('displays error message', () => {
    render(<TkxInput label="Email" error="Invalid email" />, { wrapper: Wrapper });
    expect(screen.getByRole('alert')).toHaveTextContent('Invalid email');
  });

  it('sets aria-invalid when isInvalid is true', () => {
    render(<TkxInput label="Email" isInvalid />, { wrapper: Wrapper });
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true');
  });

  it('sets aria-required when isRequired is true', () => {
    render(<TkxInput label="Required Field" isRequired />, { wrapper: Wrapper });
    expect(screen.getByLabelText(/Required Field/)).toHaveAttribute('aria-required', 'true');
  });

  it('renders hint text when no error', () => {
    render(<TkxInput label="Name" hint="Your full name" />, { wrapper: Wrapper });
    expect(screen.getByText('Your full name')).toBeInTheDocument();
  });
});
