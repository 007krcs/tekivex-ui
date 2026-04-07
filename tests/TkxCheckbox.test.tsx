import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TkxCheckbox } from '../src/components/TkxCheckbox';
import { ThemeProvider, quantumDark } from '../src/themes';

function Wrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={quantumDark}>{children}</ThemeProvider>;
}

describe('TkxCheckbox', () => {
  it('renders with a label', () => {
    render(<TkxCheckbox label="Accept terms" />, { wrapper: Wrapper });
    expect(screen.getByText('Accept terms')).toBeInTheDocument();
  });

  it('renders a checkbox input', () => {
    render(<TkxCheckbox label="Check me" />, { wrapper: Wrapper });
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });

  it('calls onChange when clicked', () => {
    const onChange = vi.fn();
    render(<TkxCheckbox label="Toggle" onChange={onChange} />, { wrapper: Wrapper });
    fireEvent.click(screen.getByRole('checkbox'));
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('reflects checked state', () => {
    render(<TkxCheckbox label="Checked" checked onChange={() => {}} />, { wrapper: Wrapper });
    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  it('is disabled when disabled prop is set', () => {
    render(<TkxCheckbox label="Disabled" disabled />, { wrapper: Wrapper });
    expect(screen.getByRole('checkbox')).toBeDisabled();
  });

  it('sets aria-invalid when isInvalid is true', () => {
    render(<TkxCheckbox label="Invalid" isInvalid />, { wrapper: Wrapper });
    expect(screen.getByRole('checkbox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('displays error message', () => {
    render(<TkxCheckbox label="Terms" isInvalid errorMessage="Required" />, { wrapper: Wrapper });
    expect(screen.getByRole('alert')).toHaveTextContent('Required');
  });
});
