import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TkxTag } from '../src/components/TkxTag';
import { ThemeProvider } from '../src/themes';
import { quantumDark } from '../src/themes';

function Wrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={quantumDark}>{children}</ThemeProvider>;
}

describe('TkxTag', () => {
  it('renders children text', () => {
    render(<TkxTag>Status</TkxTag>, { wrapper: Wrapper });
    expect(screen.getByText('Status')).toBeInTheDocument();
  });

  it('renders with different variants', () => {
    const { rerender } = render(<TkxTag variant="solid">Solid</TkxTag>, { wrapper: Wrapper });
    expect(screen.getByText('Solid')).toBeInTheDocument();

    rerender(<ThemeProvider theme={quantumDark}><TkxTag variant="outline">Outline</TkxTag></ThemeProvider>);
    expect(screen.getByText('Outline')).toBeInTheDocument();
  });

  it('renders a remove button when onRemove is provided', () => {
    const onRemove = vi.fn();
    render(<TkxTag onRemove={onRemove}>Closeable</TkxTag>, { wrapper: Wrapper });
    const removeBtn = screen.getByRole('button');
    expect(removeBtn).toBeInTheDocument();
  });

  it('calls onRemove when remove button is clicked', () => {
    const onRemove = vi.fn();
    render(<TkxTag onRemove={onRemove}>Removable</TkxTag>, { wrapper: Wrapper });
    fireEvent.click(screen.getByRole('button'));
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it('renders left icon when provided', () => {
    render(<TkxTag leftIcon={<span data-testid="tag-icon">*</span>}>With Icon</TkxTag>, { wrapper: Wrapper });
    expect(screen.getByTestId('tag-icon')).toBeInTheDocument();
  });
});
