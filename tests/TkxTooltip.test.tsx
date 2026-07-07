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

  it('renders the tooltip into document.body via a portal', () => {
    const { container } = render(
      <TkxTooltip content="Portal tip" delay={0}>
        <button>Trigger</button>
      </TkxTooltip>,
      { wrapper: Wrapper },
    );
    fireEvent.mouseEnter(screen.getByText('Trigger'));
    act(() => { vi.advanceTimersByTime(0); });
    const tooltip = screen.getByRole('tooltip');
    // Portaled: not inside the render container, but a descendant of body.
    expect(container.contains(tooltip)).toBe(false);
    expect(document.body.contains(tooltip)).toBe(true);
    // aria-describedby still wires trigger to the portaled tooltip.
    expect(screen.getByText('Trigger')).toHaveAttribute('aria-describedby', tooltip.id);
  });

  it('renders ReactNode content as-is', () => {
    render(
      <TkxTooltip content={<b data-testid="bold-tip">hi</b>} delay={0}>
        <button>Trigger</button>
      </TkxTooltip>,
      { wrapper: Wrapper },
    );
    fireEvent.mouseEnter(screen.getByText('Trigger'));
    act(() => { vi.advanceTimersByTime(0); });
    const bold = screen.getByTestId('bold-tip');
    expect(bold.tagName).toBe('B');
    expect(bold).toHaveTextContent('hi');
    expect(screen.getByRole('tooltip')).toContainElement(bold);
  });

  it('controlled open renders without hover', () => {
    render(
      <TkxTooltip content="Controlled tip" open>
        <button>Trigger</button>
      </TkxTooltip>,
      { wrapper: Wrapper },
    );
    expect(screen.getByRole('tooltip')).toHaveTextContent('Controlled tip');
  });

  it('controlled mode fires onOpenChange(false) on mouse leave without closing itself', () => {
    const onOpenChange = vi.fn();
    render(
      <TkxTooltip content="Controlled tip" open onOpenChange={onOpenChange}>
        <button>Trigger</button>
      </TkxTooltip>,
      { wrapper: Wrapper },
    );
    fireEvent.mouseLeave(screen.getByText('Trigger'));
    expect(onOpenChange).toHaveBeenCalledWith(false);
    // Parent owns the state: still open until the prop changes.
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
  });

  it('controlled mode fires onOpenChange(false) on Escape', () => {
    const onOpenChange = vi.fn();
    render(
      <TkxTooltip content="Controlled tip" open onOpenChange={onOpenChange}>
        <button>Trigger</button>
      </TkxTooltip>,
      { wrapper: Wrapper },
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('onOpenChange fires in uncontrolled mode too', () => {
    const onOpenChange = vi.fn();
    render(
      <TkxTooltip content="Tip" delay={0} onOpenChange={onOpenChange}>
        <button>Trigger</button>
      </TkxTooltip>,
      { wrapper: Wrapper },
    );
    fireEvent.mouseEnter(screen.getByText('Trigger'));
    act(() => { vi.advanceTimersByTime(0); });
    expect(onOpenChange).toHaveBeenCalledWith(true);
    fireEvent.mouseLeave(screen.getByText('Trigger'));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('disabled never opens on hover or focus', () => {
    render(
      <TkxTooltip content="Never" delay={0} disabled>
        <button>Trigger</button>
      </TkxTooltip>,
      { wrapper: Wrapper },
    );
    fireEvent.mouseEnter(screen.getByText('Trigger'));
    fireEvent.focus(screen.getByText('Trigger'));
    act(() => { vi.advanceTimersByTime(50); });
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('disabled never opens even when controlled open is true', () => {
    render(
      <TkxTooltip content="Never" open disabled>
        <button>Trigger</button>
      </TkxTooltip>,
      { wrapper: Wrapper },
    );
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('Escape closes the tooltip and removes aria-describedby', () => {
    render(
      <TkxTooltip content="Esc tip" delay={0}>
        <button>Trigger</button>
      </TkxTooltip>,
      { wrapper: Wrapper },
    );
    fireEvent.mouseEnter(screen.getByText('Trigger'));
    act(() => { vi.advanceTimersByTime(0); });
    expect(screen.getByRole('tooltip')).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    expect(screen.getByText('Trigger')).not.toHaveAttribute('aria-describedby');
  });

  it('renders string content through sanitization (no raw markup injection)', () => {
    render(
      <TkxTooltip content={'<img src=x onerror=alert(1)>'} delay={0}>
        <button>Trigger</button>
      </TkxTooltip>,
      { wrapper: Wrapper },
    );
    fireEvent.mouseEnter(screen.getByText('Trigger'));
    act(() => { vi.advanceTimersByTime(0); });
    const tooltip = screen.getByRole('tooltip');
    expect(tooltip.querySelector('img')).toBeNull();
  });

  it('does not crash when children is not a valid element', () => {
    render(
      // @ts-expect-error - intentionally passing a non-element child
      <TkxTooltip content="Tip">{'plain text'}</TkxTooltip>,
      { wrapper: Wrapper },
    );
    expect(screen.getByText('plain text')).toBeInTheDocument();
  });
});
