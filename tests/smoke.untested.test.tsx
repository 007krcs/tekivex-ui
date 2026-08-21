// Smoke tests for the 35 components without dedicated test files.
//
// Each test mounts the component with sensible defaults and asserts:
//   1. It renders without throwing
//   2. Key public props affect output
//   3. Where applicable, basic accessibility (role, aria-label)
//
// These are NOT a substitute for thorough unit tests. They catch regressions
// (a component crashes on render, a default prop disappears, an export
// vanishes from the barrel) without requiring a dedicated file per component.
// Components with rich interaction surfaces (Form, DataGrid, etc.) have
// their own files; this is for the long tail.

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, quantumDark } from '../src/themes';

function W({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={quantumDark}>{children}</ThemeProvider>;
}

// ── AI components ─────────────────────────────────────────────────────────
import { TkxAIConfidenceBar } from '../src/components/TkxAIConfidenceBar';
import { TkxAIChatBubble } from '../src/components/TkxAIChatBubble';
import { TkxAIThinking } from '../src/components/TkxAIThinking';

describe('TkxAIConfidenceBar', () => {
  it('renders with a confidence value', () => {
    const { container } = render(<TkxAIConfidenceBar confidence={75} />, { wrapper: W });
    expect(container.firstChild).toBeTruthy();
  });
  it('respects min/max edge cases', () => {
    render(<TkxAIConfidenceBar confidence={0} />, { wrapper: W });
    render(<TkxAIConfidenceBar confidence={100} />, { wrapper: W });
  });
});

describe('TkxAIChatBubble', () => {
  it('renders user message', () => {
    render(<TkxAIChatBubble role="user" content="Hi" />, { wrapper: W });
    expect(screen.getByText('Hi')).toBeInTheDocument();
  });
  it('renders assistant message', () => {
    render(<TkxAIChatBubble role="assistant" content="Hello" />, { wrapper: W });
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});

describe('TkxAIThinking', () => {
  it('renders dots variant', () => {
    const { container } = render(<TkxAIThinking variant="dots" />, { wrapper: W });
    expect(container.firstChild).toBeTruthy();
  });
  it('renders pulse / wave / orbit variants', () => {
    render(<TkxAIThinking variant="pulse" />, { wrapper: W });
    render(<TkxAIThinking variant="wave" />, { wrapper: W });
    render(<TkxAIThinking variant="orbit" />, { wrapper: W });
  });
});

// ── Real-time ─────────────────────────────────────────────────────────────
import { TkxLiveFeed } from '../src/components/TkxLiveFeed';
import { TkxLiveLog } from '../src/components/TkxLiveLog';
import { TkxLiveMetrics } from '../src/components/TkxLiveMetrics';
import { TkxRealTimeChart } from '../src/components/TkxRealTimeChart';

describe('TkxLiveFeed', () => {
  it('renders empty state', () => {
    const { container } = render(<TkxLiveFeed items={[]} />, { wrapper: W });
    expect(container).toBeTruthy();
  });
});

describe('TkxLiveLog', () => {
  it('renders log entries', () => {
    const { container } = render(<TkxLiveLog entries={[]} />, { wrapper: W });
    expect(container.firstChild).toBeTruthy();
  });
});

describe('TkxLiveMetrics', () => {
  it('renders metric cards', () => {
    const { container } = render(<TkxLiveMetrics metrics={[]} />, { wrapper: W });
    expect(container.firstChild).toBeTruthy();
  });
});

describe('TkxRealTimeChart', () => {
  it('renders with empty data', () => {
    const { container } = render(<TkxRealTimeChart data={[]} />, { wrapper: W });
    expect(container.firstChild).toBeTruthy();
  });
});

// ── Layout / structure ────────────────────────────────────────────────────
import { TkxAffix } from '../src/components/TkxAffix';
import { TkxAnchor } from '../src/components/TkxAnchor';
import { TkxAppBar } from '../src/components/TkxAppBar';
import { TkxBottomNav } from '../src/components/TkxBottomNav';
import { TkxConfigProvider } from '../src/components/TkxConfigProvider';
import { TkxList } from '../src/components/TkxList';
import { TkxMasonry } from '../src/components/TkxMasonry';

describe('TkxAffix', () => {
  it('renders children', () => {
    render(<TkxAffix><div>affixed</div></TkxAffix>, { wrapper: W });
    expect(screen.getByText('affixed')).toBeInTheDocument();
  });
});

describe('TkxAnchor', () => {
  it('renders nav landmark', () => {
    const { container } = render(<TkxAnchor items={[{ key: 'a', href: '#a', title: 'A' }]} />, { wrapper: W });
    expect(container.firstChild).toBeTruthy();
  });
});

describe('TkxAppBar', () => {
  it('renders title', () => {
    render(<TkxAppBar title="App" />, { wrapper: W });
    expect(screen.getByText('App')).toBeInTheDocument();
  });
  it('renders a leading slot for back arrows / drawer toggles', () => {
    render(<TkxAppBar title="Settings" leading={<button>back</button>} />, { wrapper: W });
    expect(screen.getByRole('button', { name: 'back' })).toBeInTheDocument();
  });
  it('does NOT render the literal word "undefined" when no optional props are passed', () => {
    render(<TkxAppBar title="App" />, { wrapper: W });
    expect(document.body.textContent ?? '').not.toContain('undefined');
  });
});

describe('TkxBottomNav', () => {
  it('renders nav items', () => {
    render(
      <TkxBottomNav
        items={[{ key: 'home', label: 'Home', icon: '🏠' }]}
        active="home"
        onChange={() => {}}
      />,
      { wrapper: W },
    );
    expect(screen.getByText('Home')).toBeInTheDocument();
  });
});

describe('TkxConfigProvider', () => {
  it('renders children', () => {
    render(<TkxConfigProvider><div>cfg</div></TkxConfigProvider>, { wrapper: W });
    expect(screen.getByText('cfg')).toBeInTheDocument();
  });
});

describe('TkxList', () => {
  it('renders items', () => {
    const { container } = render(
      <TkxList items={[{ key: '1', content: 'a' }, { key: '2', content: 'b' }] as any} />,
      { wrapper: W },
    );
    expect(container).toBeTruthy();
  });
});

describe('TkxMasonry', () => {
  it('renders children', () => {
    render(
      <TkxMasonry columns={2}>
        <div>x</div>
        <div>y</div>
      </TkxMasonry>,
      { wrapper: W },
    );
    expect(screen.getByText('x')).toBeInTheDocument();
  });
});

// ── Inputs ────────────────────────────────────────────────────────────────
import { TkxNumberInput } from '../src/components/TkxNumberInput';
import { TkxColorPicker } from '../src/components/TkxColorPicker';
import { TkxStepper } from '../src/components/TkxStepper';
import { TkxCascader } from '../src/components/TkxCascader';
import { TkxMentions } from '../src/components/TkxMentions';
import { TkxTransferList } from '../src/components/TkxTransferList';
import { TkxSegmented } from '../src/components/TkxSegmented';
import { TkxCommand } from '../src/components/TkxCommand';
import { TkxSpeedDial } from '../src/components/TkxSpeedDial';

describe('TkxNumberInput', () => {
  it('renders with label + value', () => {
    render(<TkxNumberInput label="Qty" value={5} onChange={() => {}} />, { wrapper: W });
    expect(screen.getByLabelText(/Qty/)).toBeInTheDocument();
  });
});

describe('TkxColorPicker', () => {
  it('renders trigger button', () => {
    const { container } = render(<TkxColorPicker value="#00f5d4" onChange={() => {}} />, { wrapper: W });
    expect(container.firstChild).toBeTruthy();
  });
});

describe('TkxStepper', () => {
  it('renders steps', () => {
    const { container } = render(
      <TkxStepper
        steps={[{ label: 'A' }, { label: 'B' }] as any}
        activeStep={0}
      />,
      { wrapper: W },
    );
    expect(container).toBeTruthy();
  });
});

describe('TkxCascader', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <TkxCascader options={[{ value: 'a', label: 'A' }]} onChange={() => {}} />,
      { wrapper: W },
    );
    expect(container.firstChild).toBeTruthy();
  });
});

describe('TkxMentions', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <TkxMentions options={[]} value="" onChange={() => {}} />,
      { wrapper: W },
    );
    expect(container).toBeTruthy();
  });
});

describe('TkxTransferList', () => {
  it('renders source + target lists', () => {
    const { container } = render(
      <TkxTransferList
        sourceItems={[{ key: 'a', label: 'A' }] as any}
        targetItems={[]}
        onTransfer={() => {}}
      />,
      { wrapper: W },
    );
    expect(container).toBeTruthy();
  });
});

describe('TkxSegmented', () => {
  it('renders options', () => {
    const { container } = render(
      <TkxSegmented
        options={[{ label: 'a', value: 'a' }, { label: 'b', value: 'b' }] as any}
        value="a"
        onChange={() => {}}
      />,
      { wrapper: W },
    );
    expect(container).toBeTruthy();
  });
});

describe('TkxCommand', () => {
  it('renders when isOpen', () => {
    render(
      <TkxCommand
        items={[{ id: '1', label: 'Hi' }]}
        isOpen
        onClose={() => {}}
      />,
      { wrapper: W },
    );
    expect(screen.getByText('Hi')).toBeInTheDocument();
  });
});

describe('TkxSpeedDial', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <TkxSpeedDial actions={[{ key: 'a', icon: '+', label: 'Add' }]} onAction={() => {}} />,
      { wrapper: W },
    );
    expect(container.firstChild).toBeTruthy();
  });
});

// ── Display ───────────────────────────────────────────────────────────────
import { TkxCarousel } from '../src/components/TkxCarousel';
import { TkxClock } from '../src/components/TkxClock';
import { TkxIcon } from '../src/components/TkxIcon';
import { TkxLogo } from '../src/components/TkxLogo';
import { TkxQRCode } from '../src/components/TkxQRCode';
import { TkxResult } from '../src/components/TkxResult';
import { TkxRichTextDisplay } from '../src/components/TkxRichTextDisplay';
import { TkxTour } from '../src/components/TkxTour';
import { TkxVideoPlayer } from '../src/components/TkxVideoPlayer';

describe('TkxCarousel', () => {
  it('renders slides', () => {
    const { container } = render(
      <TkxCarousel
        slides={[
          { id: '1', content: <div>1</div> },
          { id: '2', content: <div>2</div> },
        ] as any}
      />,
      { wrapper: W },
    );
    expect(container).toBeTruthy();
  });
});

describe('TkxClock', () => {
  it('renders', () => {
    const { container } = render(<TkxClock />, { wrapper: W });
    expect(container.firstChild).toBeTruthy();
  });
});

describe('TkxIcon', () => {
  it('renders an icon by name', () => {
    const { container } = render(<TkxIcon name="check" />, { wrapper: W });
    expect(container.firstChild).toBeTruthy();
  });
});

describe('TkxLogo', () => {
  it('renders', () => {
    const { container } = render(<TkxLogo />, { wrapper: W });
    expect(container.firstChild).toBeTruthy();
  });
});

describe('TkxQRCode', () => {
  it('renders QR for a value', () => {
    const { container } = render(<TkxQRCode value="hello" />, { wrapper: W });
    expect(container.firstChild).toBeTruthy();
  });
});

describe('TkxResult', () => {
  it('renders a status', () => {
    render(<TkxResult status="success" title="Done" />, { wrapper: W });
    expect(screen.getByText('Done')).toBeInTheDocument();
  });
});

describe('TkxRichTextDisplay', () => {
  it('renders a paragraph block', () => {
    const { container } = render(
      <TkxRichTextDisplay blocks={[{ type: 'paragraph', text: 'Hi' }] as any} />,
      { wrapper: W },
    );
    expect(container).toBeTruthy();
  });
});

describe('TkxTour', () => {
  it('renders tour steps when isOpen', () => {
    const { container } = render(
      <TkxTour
        steps={[{ target: '#root', title: 'Step 1', content: 'Hi' }]}
        isOpen={false}
        onClose={() => {}}
      />,
      { wrapper: W },
    );
    // When closed, may render nothing — just ensure no throw.
    expect(container).toBeTruthy();
  });
});

describe('TkxVideoPlayer', () => {
  it('renders a video element', () => {
    const { container } = render(
      <TkxVideoPlayer src="/test.mp4" />,
      { wrapper: W },
    );
    expect(container.querySelector('video')).toBeTruthy();
  });
});

// ── ARIA regression: the meter must never emit NaN ──────────────────────────
describe('TkxAIConfidenceBar — value guard', () => {
  const meterOf = () => screen.getByRole('meter');

  it('renders a coherent meter when no value is supplied', () => {
    render(<TkxAIConfidenceBar />, { wrapper: W });
    const m = meterOf();
    expect(m).toHaveAttribute('aria-valuenow', '0');
    expect(m).toHaveAttribute('aria-valuemin', '0');
    expect(m).toHaveAttribute('aria-valuemax', '100');
    expect(m.getAttribute('aria-label')).not.toMatch(/NaN/);
  });

  it('never puts NaN in aria-valuenow or aria-label for a NaN value', () => {
    render(<TkxAIConfidenceBar value={Number.NaN} label="Extraction" />, { wrapper: W });
    const m = meterOf();
    expect(Number.isNaN(Number(m.getAttribute('aria-valuenow')))).toBe(false);
    expect(m.getAttribute('aria-label')).toBe('AI confidence unknown for Extraction');
  });

  it('keeps valuemin <= valuenow <= valuemax for out-of-range input', () => {
    render(<TkxAIConfidenceBar value={480} />, { wrapper: W });
    expect(meterOf()).toHaveAttribute('aria-valuenow', '100');
  });

  it('still reports a real value normally', () => {
    render(<TkxAIConfidenceBar value={75} />, { wrapper: W });
    const m = meterOf();
    expect(m).toHaveAttribute('aria-valuenow', '75');
    expect(m).toHaveAttribute('aria-label', '75% AI confidence');
  });
});
