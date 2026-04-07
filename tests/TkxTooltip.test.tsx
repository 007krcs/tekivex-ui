import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { TkxTooltip } from '../src/components/TkxTooltip';
import { ThemeProvider, quantumDark } from '../src/themes';

function Wrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={quantumDark}>{children}</ThemeProvider>;
}

describe('TkxTooltip', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the trigger element', () => {
    render(
      <TkxTooltip content="Help text">
        <button>Hover me</button>
      </TkxTooltip>,
      { wrapper: Wrapper },
    );
    expect(screen.getByText('Hover me')).toBeInTheDocument();
  });

  it('does not show tooltip by default', () => {
    render(
      <TkxTooltip content="Hidden tip">
        <button>Trigger</button>
      </TkxTooltip>,
      { wrapper: Wrapper },
    );
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('shows tooltip on mouse enter after delay', () => {
    render(
      <TkxTooltip content="Visible tip" delay={0}>
        <button>Trigger</button>
      </TkxTooltip>,
      { wrapper: Wrapper },
    );
    fireEvent.mouseEnter(screen.getByText('Trigger'));
    act(() => { vi.advanceTimersByTime(0); });
    expect(screen.getByRole('tooltip')).toHaveTextContent('Visible tip');
  });

  it('hides tooltip on mouse leave', () => {
    render(
      <TkxTooltip content="Tip" delay={0}>
        <button>Trigger</button>
      </TkxTooltip>,
      { wrapper: Wrapper },
    );
    fireEvent.mouseEnter(screen.getByText('Trigger'));
    act(() => { vi.advanceTimersByTime(0); });
    expect(screen.getByRole('tooltip')).toBeInTheDocument();

    fireEvent.mouseLeave(screen.getByText('Trigger'));
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('shows tooltip on focus', () => {
    render(
      <TkxTooltip content="Focus tip" delay={0}>
        <button>Trigger</button>
      </TkxTooltip>,
      { wrapper: Wrapper },
    );
    fireEvent.focus(screen.getByText('Trigger'));
    act(() => { vi.advanceTimersByTime(0); });
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
  });

  it('sets aria-describedby on trigger when visible', () => {
    render(
      <TkxTooltip content="Described" delay={0}>
        <button>Trigger</button>
      </TkxTooltip>,
      { wrapper: Wrapper },
    );
    fireEvent.mouseEnter(screen.getByText('Trigger'));
    act(() => { vi.advanceTimersByTime(0); });
    const trigger = screen.getByText('Trigger');
    expect(trigger).toHaveAttribute('aria-describedby');
  });
});
