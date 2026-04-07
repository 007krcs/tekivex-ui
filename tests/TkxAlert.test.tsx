import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TkxAlert } from '../src/components/TkxAlert';
import { ThemeProvider, quantumDark } from '../src/themes';

function Wrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={quantumDark}>{children}</ThemeProvider>;
}

describe('TkxAlert', () => {
  it('renders children content', () => {
    render(<TkxAlert variant="info">Alert message</TkxAlert>, { wrapper: Wrapper });
    expect(screen.getByText('Alert message')).toBeInTheDocument();
  });

  it('renders with role="alert" for danger variant', () => {
    render(<TkxAlert variant="danger">Error occurred</TkxAlert>, { wrapper: Wrapper });
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('renders with role="status" for info variant', () => {
    render(<TkxAlert variant="info">Info message</TkxAlert>, { wrapper: Wrapper });
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders title when provided', () => {
    render(<TkxAlert variant="success" title="Success!">Operation completed</TkxAlert>, { wrapper: Wrapper });
    expect(screen.getByText('Success!')).toBeInTheDocument();
  });

  it('renders dismiss button when dismissible', () => {
    const onDismiss = vi.fn();
    render(
      <TkxAlert variant="info" dismissible onDismiss={onDismiss}>Dismissible</TkxAlert>,
      { wrapper: Wrapper },
    );
    expect(screen.getByLabelText('Dismiss alert')).toBeInTheDocument();
  });

  it('calls onDismiss when dismiss button is clicked', () => {
    const onDismiss = vi.fn();
    render(
      <TkxAlert variant="info" dismissible onDismiss={onDismiss}>Dismissible</TkxAlert>,
      { wrapper: Wrapper },
    );
    fireEvent.click(screen.getByLabelText('Dismiss alert'));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('renders with warning variant', () => {
    render(<TkxAlert variant="warning">Warning message</TkxAlert>, { wrapper: Wrapper });
    expect(screen.getByRole('alert')).toHaveTextContent('Warning message');
  });
});
