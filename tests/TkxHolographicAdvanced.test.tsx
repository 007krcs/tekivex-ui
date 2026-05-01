import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import {
  TkxHolographicPanel,
  TkxHolographicGauge,
  TkxHolographicProgress,
  TkxHolographicTerminal,
} from '../src/components/TkxHolographicAdvanced';

// ── TkxHolographicPanel ─────────────────────────────────────────────────────

describe('TkxHolographicPanel', () => {
  it('renders children inside a holographic root', () => {
    const { container } = render(
      <TkxHolographicPanel>
        <p>Body content</p>
      </TkxHolographicPanel>,
    );
    expect(container.querySelector('.tkx-holo-root')).toBeInTheDocument();
    expect(screen.getByText('Body content')).toBeInTheDocument();
  });

  it('renders a header slot when provided', () => {
    render(
      <TkxHolographicPanel header={<h3>Reactor core</h3>}>
        <p>Body</p>
      </TkxHolographicPanel>,
    );
    expect(screen.getByText('Reactor core')).toBeInTheDocument();
  });

  it('renders a footer slot when provided', () => {
    render(
      <TkxHolographicPanel footer={<button>SCRAM</button>}>
        <p>Body</p>
      </TkxHolographicPanel>,
    );
    expect(screen.getByRole('button', { name: 'SCRAM' })).toBeInTheDocument();
  });

  it('renders a tab strip + fires onTabChange', () => {
    const onTabChange = vi.fn();
    render(
      <TkxHolographicPanel
        tabs={[
          { id: 'a', label: 'Alpha' },
          { id: 'b', label: 'Beta' },
        ]}
        activeTabId="a"
        onTabChange={onTabChange}
      >
        <p>Body</p>
      </TkxHolographicPanel>,
    );
    expect(screen.getByRole('tab', { name: 'Alpha' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'Beta' })).toHaveAttribute('aria-selected', 'false');
    fireEvent.click(screen.getByRole('tab', { name: 'Beta' }));
    expect(onTabChange).toHaveBeenCalledWith('b');
  });

  it('does not render a tablist when tabs prop is empty', () => {
    render(
      <TkxHolographicPanel tabs={[]}>
        <p>Body</p>
      </TkxHolographicPanel>,
    );
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
  });

  it('forwards refs to the root element', () => {
    const ref = { current: null as HTMLDivElement | null };
    render(
      <TkxHolographicPanel ref={ref}>
        <p>Body</p>
      </TkxHolographicPanel>,
    );
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('honors the accent prop in the surrounding border', () => {
    // jsdom normalizes hex colours with alpha to rgba(); accept either form.
    const { container } = render(
      <TkxHolographicPanel accent="#ff006e">
        <p>Body</p>
      </TkxHolographicPanel>,
    );
    const root = container.querySelector('.tkx-holo-root') as HTMLElement;
    expect(root.style.border.toLowerCase()).toMatch(/#ff006e|255,\s*0,\s*110/);
  });
});

// ── TkxHolographicGauge ─────────────────────────────────────────────────────

describe('TkxHolographicGauge', () => {
  it('renders a meter with correct ARIA values', () => {
    render(<TkxHolographicGauge value={42} />);
    const meter = screen.getByRole('meter');
    expect(meter).toHaveAttribute('aria-valuenow', '42');
    expect(meter).toHaveAttribute('aria-valuemin', '0');
    expect(meter).toHaveAttribute('aria-valuemax', '100');
  });

  it('clamps values above 100', () => {
    render(<TkxHolographicGauge value={150} />);
    const meter = screen.getByRole('meter');
    expect(meter).toHaveAttribute('aria-valuenow', '100');
  });

  it('clamps values below 0', () => {
    render(<TkxHolographicGauge value={-10} />);
    const meter = screen.getByRole('meter');
    expect(meter).toHaveAttribute('aria-valuenow', '0');
  });

  it('shows the rounded percent label by default', () => {
    render(<TkxHolographicGauge value={87.4} />);
    expect(screen.getByText('87%')).toBeInTheDocument();
  });

  it('uses a custom label when provided', () => {
    render(<TkxHolographicGauge value={50} label="½" />);
    expect(screen.getByText('½')).toBeInTheDocument();
    expect(screen.queryByText('50%')).not.toBeInTheDocument();
  });

  it('renders the caption under the value', () => {
    render(<TkxHolographicGauge value={50} caption="fuel" />);
    expect(screen.getByText('fuel')).toBeInTheDocument();
  });

  it('uses ariaValueText override', () => {
    render(<TkxHolographicGauge value={50} ariaValueText="half full" />);
    expect(screen.getByRole('meter')).toHaveAttribute('aria-valuetext', 'half full');
  });

  it('falls back to default aria-valuetext when no override', () => {
    render(<TkxHolographicGauge value={75} />);
    expect(screen.getByRole('meter')).toHaveAttribute('aria-valuetext', '75 percent');
  });
});

// ── TkxHolographicProgress ──────────────────────────────────────────────────

describe('TkxHolographicProgress', () => {
  it('renders a progressbar with correct ARIA values', () => {
    render(<TkxHolographicProgress value={0.42} />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '42');
    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '100');
  });

  it('clamps fraction above 1', () => {
    render(<TkxHolographicProgress value={2.5} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
  });

  it('clamps fraction below 0', () => {
    render(<TkxHolographicProgress value={-0.3} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
  });

  it('renders the label + auto-formatted value text', () => {
    render(<TkxHolographicProgress value={0.65} label="Loading" />);
    expect(screen.getByText('Loading')).toBeInTheDocument();
    expect(screen.getByText('65%')).toBeInTheDocument();
  });

  it('uses a custom valueLabel when provided', () => {
    render(<TkxHolographicProgress value={0.5} label="Coolant" valueLabel="42 bar" />);
    expect(screen.getByText('42 bar')).toBeInTheDocument();
    expect(screen.queryByText('50%')).not.toBeInTheDocument();
  });

  it('does not render the label row when neither label nor valueLabel given', () => {
    render(<TkxHolographicProgress value={0.5} />);
    // The label row is the only place "%" appears; without a label, no "50%"
    expect(screen.queryByText('50%')).not.toBeInTheDocument();
  });
});

// ── TkxHolographicTerminal ──────────────────────────────────────────────────

describe('TkxHolographicTerminal', () => {
  it('renders all lines instantly when typeSpeed=0', () => {
    render(
      <TkxHolographicTerminal
        lines={['boot ok', 'loaded module', 'ready']}
        typeSpeed={0}
      />,
    );
    expect(screen.getByText('boot ok')).toBeInTheDocument();
    expect(screen.getByText('loaded module')).toBeInTheDocument();
    expect(screen.getByText('ready')).toBeInTheDocument();
  });

  it('uses role="log" and aria-live="polite"', () => {
    render(<TkxHolographicTerminal lines={['ok']} typeSpeed={0} />);
    const log = screen.getByRole('log');
    expect(log).toHaveAttribute('aria-live', 'polite');
  });

  it('honors custom prompt prefix', () => {
    render(<TkxHolographicTerminal lines={['cmd']} typeSpeed={0} prompt="> " />);
    // The prompt is in a span before the line — match via container
    const log = screen.getByRole('log');
    expect(log.textContent).toContain('> cmd');
  });

  it('limits visible lines to maxLines (older lines scroll out)', () => {
    render(
      <TkxHolographicTerminal
        lines={['L1', 'L2', 'L3', 'L4', 'L5']}
        typeSpeed={0}
        maxLines={3}
      />,
    );
    // Only the LAST 3 should be visible
    expect(screen.queryByText('L1')).not.toBeInTheDocument();
    expect(screen.queryByText('L2')).not.toBeInTheDocument();
    expect(screen.getByText('L3')).toBeInTheDocument();
    expect(screen.getByText('L4')).toBeInTheDocument();
    expect(screen.getByText('L5')).toBeInTheDocument();
  });

  it('handles an empty lines array without crashing', () => {
    render(<TkxHolographicTerminal lines={[]} typeSpeed={0} />);
    expect(screen.getByRole('log')).toBeInTheDocument();
  });

  it('animates type-on with default speed', () => {
    vi.useFakeTimers();
    try {
      render(<TkxHolographicTerminal lines={['hi']} typeSpeed={5} />);
      // Initially blank for the first line
      // After enough timers, "hi" should be fully typed
      act(() => {
        vi.advanceTimersByTime(100);
      });
      expect(screen.getByRole('log').textContent).toContain('hi');
    } finally {
      vi.useRealTimers();
    }
  });

  it('resyncs when lines are pruned externally', () => {
    const { rerender } = render(
      <TkxHolographicTerminal lines={['a', 'b', 'c']} typeSpeed={0} />,
    );
    expect(screen.getByText('c')).toBeInTheDocument();
    rerender(<TkxHolographicTerminal lines={['x']} typeSpeed={0} />);
    expect(screen.getByText('x')).toBeInTheDocument();
    expect(screen.queryByText('c')).not.toBeInTheDocument();
  });
});
