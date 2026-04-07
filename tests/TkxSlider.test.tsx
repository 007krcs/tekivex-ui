import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TkxSlider } from '../src/components/TkxSlider';
import { ThemeProvider, quantumDark } from '../src/themes';

function Wrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={quantumDark}>{children}</ThemeProvider>;
}

describe('TkxSlider', () => {
  it('renders a slider', () => {
    render(<TkxSlider value={50} />, { wrapper: Wrapper });
    expect(screen.getByRole('slider')).toBeInTheDocument();
  });

  it('sets aria-valuenow to the value', () => {
    render(<TkxSlider value={30} />, { wrapper: Wrapper });
    expect(screen.getByRole('slider')).toHaveAttribute('aria-valuenow', '30');
  });

  it('sets aria-valuemin and aria-valuemax', () => {
    render(<TkxSlider value={50} min={10} max={90} />, { wrapper: Wrapper });
    const slider = screen.getByRole('slider');
    expect(slider).toHaveAttribute('aria-valuemin', '10');
    expect(slider).toHaveAttribute('aria-valuemax', '90');
  });

  it('renders label text', () => {
    render(<TkxSlider value={50} label="Volume" />, { wrapper: Wrapper });
    expect(screen.getByText('Volume')).toBeInTheDocument();
  });

  it('shows aria-disabled when isDisabled', () => {
    render(<TkxSlider value={50} isDisabled />, { wrapper: Wrapper });
    expect(screen.getByRole('slider')).toHaveAttribute('aria-disabled', 'true');
  });

  it('uses default value when uncontrolled', () => {
    render(<TkxSlider defaultValue={25} />, { wrapper: Wrapper });
    expect(screen.getByRole('slider')).toHaveAttribute('aria-valuenow', '25');
  });

  it('renders with custom label via aria-label', () => {
    render(<TkxSlider value={50} label="Brightness" />, { wrapper: Wrapper });
    expect(screen.getByRole('slider')).toHaveAttribute('aria-label', 'Brightness');
  });
});
