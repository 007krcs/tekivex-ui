import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, quantumDark } from '../src/themes';
import { TkxButton } from '../src/components/TkxButton';
import { TkxBadge } from '../src/components/TkxBadge';
import { TkxAlert } from '../src/components/TkxAlert';
import { TkxTag } from '../src/components/TkxTag';

function W({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={quantumDark}>{children}</ThemeProvider>;
}

// Reproduction for the downstream report: a literal "&amp;" rendering on a
// button label ("Review & ATS"), and the earlier "&quot;" sighting.
describe('ampersand / quote double-escape repro', () => {
  it('TkxButton renders a literal ampersand, not &amp;', () => {
    render(<TkxButton>Review &amp; ATS</TkxButton>, { wrapper: W });
    const btn = screen.getByRole('button');
    expect(btn.textContent).toBe('Review & ATS');
  });

  it('TkxBadge renders a literal ampersand', () => {
    render(<TkxBadge>Terms &amp; Conditions</TkxBadge>, { wrapper: W });
    expect(screen.getByText('Terms & Conditions')).toBeInTheDocument();
  });

  it('TkxAlert title renders quotes literally', () => {
    render(
      <TkxAlert variant="info" title={'He said "hi"'}>
        {"O'Brien & Sons"}
      </TkxAlert>,
      { wrapper: W },
    );
    expect(screen.getByText('He said "hi"')).toBeInTheDocument();
    expect(screen.getByText("O'Brien & Sons")).toBeInTheDocument();
  });

  it('TkxTag renders a literal ampersand', () => {
    render(<TkxTag>R&amp;D</TkxTag>, { wrapper: W });
    expect(screen.getByText('R&D')).toBeInTheDocument();
  });
});
