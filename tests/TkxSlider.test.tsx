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

  // ── aria-valuetext (A11Y-AUDIT MEDIUM #21) ─────────────────────────────────

  it('sets aria-valuetext from formatValue when provided', () => {
    render(<TkxSlider value={50} formatValue={(v) => `$${v}`} />, { wrapper: Wrapper });
    const slider = screen.getByRole('slider');
    expect(slider).toHaveAttribute('aria-valuetext', '$50');
    expect(slider).toHaveAttribute('aria-valuenow', '50');
  });

  it('omits aria-valuetext when no formatValue is supplied', () => {
    render(<TkxSlider value={50} />, { wrapper: Wrapper });
    expect(screen.getByRole('slider')).not.toHaveAttribute('aria-valuetext');
  });

  it('range slider thumbs each expose their formatted aria-valuetext', () => {
    render(
      <TkxSlider isRange rangeValue={[10, 80]} formatValue={(v) => `${v}%`} />,
      { wrapper: Wrapper },
    );
    const sliders = screen.getAllByRole('slider');
    expect(sliders).toHaveLength(2);
    expect(sliders[0]).toHaveAttribute('aria-valuetext', '10%');
    expect(sliders[1]).toHaveAttribute('aria-valuetext', '80%');
  });
});
