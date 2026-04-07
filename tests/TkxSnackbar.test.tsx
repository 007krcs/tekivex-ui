import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TkxSnackbar } from '../src/components/TkxSnackbar';
import { ThemeProvider } from '../src/themes';
import { quantumDark } from '../src/themes';

function Wrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={quantumDark}>{children}</ThemeProvider>;
}

describe('TkxSnackbar', () => {
  it('renders message when open', () => {
    render(<TkxSnackbar isOpen message="File saved" />, { wrapper: Wrapper });
    expect(screen.getByText('File saved')).toBeInTheDocument();
  });

  it('is not visible when closed', () => {
    render(<TkxSnackbar isOpen={false} message="Hidden message" />, { wrapper: Wrapper });
    expect(screen.queryByText('Hidden message')).not.toBeInTheDocument();
  });

  it('renders action button when action prop is provided', () => {
    const onClick = vi.fn();
    render(
      <TkxSnackbar isOpen message="Deleted" action={{ label: 'Undo', onClick }} />,
      { wrapper: Wrapper },
    );
    expect(screen.getByText('Undo')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Undo'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('renders with success variant', () => {
    const { container } = render(
      <TkxSnackbar isOpen message="Success!" variant="success" />,
      { wrapper: Wrapper },
    );
    expect(screen.getByText('Success!')).toBeInTheDocument();
  });

  it('renders with error variant', () => {
    render(
      <TkxSnackbar isOpen message="Something went wrong" variant="error" />,
      { wrapper: Wrapper },
    );
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });
});
