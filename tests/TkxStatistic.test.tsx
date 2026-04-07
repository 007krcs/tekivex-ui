import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TkxStatistic } from '../src/components/TkxStatistic';
import { ThemeProvider } from '../src/themes';
import { quantumDark } from '../src/themes';

function Wrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={quantumDark}>{children}</ThemeProvider>;
}

describe('TkxStatistic', () => {
  it('renders title', () => {
    render(<TkxStatistic title="Total Users" value={1234} />, { wrapper: Wrapper });
    expect(screen.getByText('Total Users')).toBeInTheDocument();
  });

  it('renders formatted numeric value', () => {
    render(<TkxStatistic title="Revenue" value={1234567} />, { wrapper: Wrapper });
    expect(screen.getByText('1,234,567')).toBeInTheDocument();
  });

  it('renders string value', () => {
    render(<TkxStatistic title="Status" value="Active" />, { wrapper: Wrapper });
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('renders prefix', () => {
    render(<TkxStatistic title="Price" value={99} prefix={<span data-testid="prefix">$</span>} />, { wrapper: Wrapper });
    expect(screen.getByTestId('prefix')).toBeInTheDocument();
  });

  it('renders suffix', () => {
    render(<TkxStatistic title="Growth" value={25} suffix={<span data-testid="suffix">%</span>} />, { wrapper: Wrapper });
    expect(screen.getByTestId('suffix')).toBeInTheDocument();
  });

  it('renders with precision', () => {
    render(<TkxStatistic title="Rate" value={3.14159} precision={2} />, { wrapper: Wrapper });
    expect(screen.getByText('3.14')).toBeInTheDocument();
  });
});
