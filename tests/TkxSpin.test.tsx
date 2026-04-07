import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TkxSpin } from '../src/components/TkxSpin';
import { ThemeProvider } from '../src/themes';
import { quantumDark } from '../src/themes';

function Wrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={quantumDark}>{children}</ThemeProvider>;
}

describe('TkxSpin', () => {
  it('renders spinner when spinning is true', () => {
    render(<TkxSpin spinning />, { wrapper: Wrapper });
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('is hidden when spinning is false', () => {
    render(<TkxSpin spinning={false} />, { wrapper: Wrapper });
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('renders tip text when provided', () => {
    render(<TkxSpin spinning tip="Loading data..." />, { wrapper: Wrapper });
    expect(screen.getByText('Loading data...')).toBeInTheDocument();
  });

  it('wraps children and shows overlay when spinning', () => {
    render(
      <TkxSpin spinning>
        <p>Content underneath</p>
      </TkxSpin>,
      { wrapper: Wrapper },
    );
    expect(screen.getByText('Content underneath')).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders children without spinner when not spinning', () => {
    render(
      <TkxSpin spinning={false}>
        <p>Visible content</p>
      </TkxSpin>,
      { wrapper: Wrapper },
    );
    expect(screen.getByText('Visible content')).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});
