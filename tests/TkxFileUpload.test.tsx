import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TkxFileUpload } from '../src/components/TkxFileUpload';
import { ThemeProvider } from '../src/themes';
import { quantumDark } from '../src/themes';

function Wrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={quantumDark}>{children}</ThemeProvider>;
}

describe('TkxFileUpload', () => {
  it('renders upload area', () => {
    render(<TkxFileUpload />, { wrapper: Wrapper });
    const input = document.querySelector('input[type="file"]');
    expect(input).toBeInTheDocument();
  });

  it('applies accept prop to file input', () => {
    render(<TkxFileUpload accept=".png,.jpg" />, { wrapper: Wrapper });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input).toHaveAttribute('accept', '.png,.jpg');
  });

  it('supports multiple file selection', () => {
    render(<TkxFileUpload multiple />, { wrapper: Wrapper });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input).toHaveAttribute('multiple');
  });

  it('renders custom label', () => {
    render(<TkxFileUpload label="Upload Documents" />, { wrapper: Wrapper });
    expect(screen.getByText('Upload Documents')).toBeInTheDocument();
  });

  it('renders as disabled when isDisabled is true', () => {
    render(<TkxFileUpload isDisabled />, { wrapper: Wrapper });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input).toBeDisabled();
  });
});
