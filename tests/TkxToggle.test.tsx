import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TkxToggle } from '../src/components/TkxToggle';
import { ThemeProvider, quantumDark } from '../src/themes';

function Wrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={quantumDark}>{children}</ThemeProvider>;
}

describe('TkxToggle', () => {
  it('renders with label', () => {
    render(<TkxToggle label="Dark mode" checked={false} onChange={() => {}} />, { wrapper: Wrapper });
    expect(screen.getByText('Dark mode')).toBeInTheDocument();
  });

  it('renders with role="switch"', () => {
    render(<TkxToggle label="Toggle" checked={false} onChange={() => {}} />, { wrapper: Wrapper });
    expect(screen.getByRole('switch')).toBeInTheDocument();
  });

  it('calls onChange when clicked', () => {
    const onChange = vi.fn();
    render(<TkxToggle label="Toggle" checked={false} onChange={onChange} />, { wrapper: Wrapper });
    fireEvent.click(screen.getByRole('switch'));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('reflects checked state via aria-checked', () => {
    render(<TkxToggle label="On" checked={true} onChange={() => {}} />, { wrapper: Wrapper });
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
  });

  it('reflects unchecked state via aria-checked', () => {
    render(<TkxToggle label="Off" checked={false} onChange={() => {}} />, { wrapper: Wrapper });
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false');
  });

  it('does not call onChange when disabled', () => {
    const onChange = vi.fn();
    render(<TkxToggle label="Disabled" checked={false} onChange={onChange} disabled />, { wrapper: Wrapper });
    fireEvent.click(screen.getByRole('switch'));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('is disabled when disabled prop is set', () => {
    render(<TkxToggle label="Disabled" checked={false} onChange={() => {}} disabled />, { wrapper: Wrapper });
    expect(screen.getByRole('switch')).toBeDisabled();
  });
});
