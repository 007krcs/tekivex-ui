import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TkxStepper, type Step } from '../src/components/TkxStepper';
import { ThemeProvider, quantumDark } from '../src/themes';

function Wrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={quantumDark}>{children}</ThemeProvider>;
}

const steps: Step[] = [
  { id: '1', title: 'One' },
  { id: '2', title: 'Two' },
  { id: '3', title: 'Three' },
];

describe('TkxStepper', () => {
  it('renders without emitting React conflicting-style warnings (solid connector)', () => {
    const warnSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { rerender } = render(
      <TkxStepper steps={steps} activeStep={0} connector="solid" />,
      { wrapper: Wrapper },
    );
    // Trigger a re-render so any inline-style update path runs.
    rerender(
      <ThemeProvider theme={quantumDark}>
        <TkxStepper steps={steps} activeStep={1} connector="solid" />
      </ThemeProvider>,
    );
    const messages = warnSpy.mock.calls.flat().join(' ');
    expect(messages).not.toMatch(/conflicting property/i);
    expect(messages).not.toMatch(/Updating a style property during rerender/i);
    warnSpy.mockRestore();
  });

  it('renders without emitting React conflicting-style warnings (dashed/dotted connectors)', () => {
    const warnSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { rerender } = render(
      <TkxStepper steps={steps} activeStep={0} connector="dashed" />,
      { wrapper: Wrapper },
    );
    rerender(
      <ThemeProvider theme={quantumDark}>
        <TkxStepper steps={steps} activeStep={2} connector="dotted" orientation="vertical" />
      </ThemeProvider>,
    );
    const messages = warnSpy.mock.calls.flat().join(' ');
    expect(messages).not.toMatch(/conflicting property/i);
    expect(messages).not.toMatch(/Updating a style property during rerender/i);
    warnSpy.mockRestore();
  });

  it('does not set both background and backgroundImage on connector elements', () => {
    const { container } = render(
      <TkxStepper steps={steps} activeStep={1} connector="dashed" />,
      { wrapper: Wrapper },
    );
    // Connectors are the only aria-hidden divs between step circles.
    const connectors = container.querySelectorAll('div[aria-hidden="true"]');
    expect(connectors.length).toBeGreaterThan(0);
    connectors.forEach((el) => {
      const inline = (el as HTMLElement).style;
      // Inline `background` shorthand must not be set when backgroundImage is also set
      // (this is the React "conflicting property" trigger).
      const hasShorthand = Boolean(inline.background && inline.background !== '');
      const hasImage = Boolean(inline.backgroundImage && inline.backgroundImage !== '');
      expect(hasShorthand && hasImage).toBe(false);
    });
  });

  // ── MEDIUM a11y regression: clickable steps are keyboard-operable ──────────

  it('exposes clickable steps as focusable buttons and activates on Enter/Space', () => {
    const onStepClick = vi.fn();
    render(
      <TkxStepper steps={steps} activeStep={0} clickable onStepClick={onStepClick} />,
      { wrapper: Wrapper },
    );
    const stepButtons = screen.getAllByRole('button');
    expect(stepButtons).toHaveLength(steps.length);
    stepButtons.forEach((b) => expect(b.getAttribute('tabindex')).toBe('0'));

    const second = screen.getByRole('button', { name: 'Two' });
    second.focus();
    expect(document.activeElement).toBe(second);
    fireEvent.keyDown(second, { key: 'Enter' });
    expect(onStepClick).toHaveBeenCalledWith(1);

    fireEvent.keyDown(screen.getByRole('button', { name: 'Three' }), { key: ' ' });
    expect(onStepClick).toHaveBeenCalledWith(2);
  });

  it('does not expose button semantics when not clickable', () => {
    render(<TkxStepper steps={steps} activeStep={0} />, { wrapper: Wrapper });
    expect(screen.queryByRole('button')).toBeNull();
  });
});
