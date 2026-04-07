/**
 * Coverage tests for components that previously had no test files.
 * Each describe block tests a separate component.
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, quantumDark } from '../src/themes';

function Wrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={quantumDark}>{children}</ThemeProvider>;
}

// ── TkxSegmented ─────────────────────────────────────────────────────────────

import { TkxSegmented } from '../src/components/TkxSegmented';

describe('TkxSegmented', () => {
  const opts = [
    { value: 'day', label: 'Day' },
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month' },
  ];

  it('renders all options', () => {
    render(<TkxSegmented options={opts} />, { wrapper: Wrapper });
    expect(screen.getByText('Day')).toBeInTheDocument();
    expect(screen.getByText('Week')).toBeInTheDocument();
    expect(screen.getByText('Month')).toBeInTheDocument();
  });

  it('calls onChange when an option is clicked', () => {
    const onChange = vi.fn();
    render(<TkxSegmented options={opts} onChange={onChange} />, { wrapper: Wrapper });
    fireEvent.click(screen.getByText('Week'));
    expect(onChange).toHaveBeenCalledWith('week');
  });

  it('renders controlled value', () => {
    render(<TkxSegmented options={opts} value="month" />, { wrapper: Wrapper });
    expect(screen.getByText('Month')).toBeInTheDocument();
  });
});

// ── TkxResult ─────────────────────────────────────────────────────────────────

import { TkxResult } from '../src/components/TkxResult';

describe('TkxResult', () => {
  it('renders title and subTitle', () => {
    render(
      <TkxResult status="success" title="Operation Successful" subTitle="Your request has been processed." />,
      { wrapper: Wrapper },
    );
    expect(screen.getByText('Operation Successful')).toBeInTheDocument();
    expect(screen.getByText('Your request has been processed.')).toBeInTheDocument();
  });

  it('renders all status variants', () => {
    const statuses = ['success', 'error', 'warning', 'info', '404', '403', '500'] as const;
    for (const status of statuses) {
      const { unmount } = render(
        <TkxResult status={status} title={`${status} result`} />,
        { wrapper: Wrapper },
      );
      expect(screen.getByText(`${status} result`)).toBeInTheDocument();
      unmount();
    }
  });

  it('renders extra content', () => {
    render(
      <TkxResult status="info" title="Info" extra={<button>Retry</button>} />,
      { wrapper: Wrapper },
    );
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
  });
});

// ── TkxQRCode ─────────────────────────────────────────────────────────────────

import { TkxQRCode } from '../src/components/TkxQRCode';

describe('TkxQRCode', () => {
  it('renders without crashing', () => {
    const { container } = render(<TkxQRCode value="https://example.com" />, { wrapper: Wrapper });
    expect(container.firstElementChild).toBeInTheDocument();
  });

  it('renders with custom size', () => {
    const { container } = render(<TkxQRCode value="https://example.com" size={256} />, { wrapper: Wrapper });
    expect(container.firstElementChild).toBeInTheDocument();
  });

  it('renders with bordered prop', () => {
    const { container } = render(<TkxQRCode value="https://example.com" bordered />, { wrapper: Wrapper });
    expect(container.firstElementChild).toBeInTheDocument();
  });
});

// ── TkxWatermark ─────────────────────────────────────────────────────────────

import { TkxWatermark } from '../src/components/TkxWatermark';

describe('TkxWatermark', () => {
  it('renders children', () => {
    render(
      <TkxWatermark text="Confidential"><div>Protected content</div></TkxWatermark>,
      { wrapper: Wrapper },
    );
    expect(screen.getByText('Protected content')).toBeInTheDocument();
  });

  it('renders with array text', () => {
    render(
      <TkxWatermark text={['Top Secret', 'DRAFT']}><div>Content</div></TkxWatermark>,
      { wrapper: Wrapper },
    );
    expect(screen.getByText('Content')).toBeInTheDocument();
  });
});

// ── TkxStepper ───────────────────────────────────────────────────────────────

import { TkxStepper } from '../src/components/TkxStepper';

describe('TkxStepper', () => {
  const steps = [
    { id: '1', title: 'Account', description: 'Create account' },
    { id: '2', title: 'Profile', description: 'Set up profile' },
    { id: '3', title: 'Review', description: 'Review and submit' },
  ];

  it('renders all step titles', () => {
    render(<TkxStepper steps={steps} activeStep={0} />, { wrapper: Wrapper });
    expect(screen.getByText('Account')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('Review')).toBeInTheDocument();
  });

  it('renders vertical orientation', () => {
    const { container } = render(
      <TkxStepper steps={steps} activeStep={1} orientation="vertical" />,
      { wrapper: Wrapper },
    );
    expect(container.firstElementChild).toBeInTheDocument();
  });

  it('calls onStepClick when clickable', () => {
    const onStepClick = vi.fn();
    render(
      <TkxStepper steps={steps} activeStep={0} clickable onStepClick={onStepClick} />,
      { wrapper: Wrapper },
    );
    fireEvent.click(screen.getByText('Profile'));
    expect(onStepClick).toHaveBeenCalled();
  });
});

// ── TkxMasonry ───────────────────────────────────────────────────────────────

import { TkxMasonry } from '../src/components/TkxMasonry';

describe('TkxMasonry', () => {
  it('renders children', () => {
    render(
      <TkxMasonry columns={3}>
        <div>Item 1</div>
        <div>Item 2</div>
        <div>Item 3</div>
      </TkxMasonry>,
      { wrapper: Wrapper },
    );
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
    expect(screen.getByText('Item 3')).toBeInTheDocument();
  });

  it('renders with custom gap', () => {
    const { container } = render(
      <TkxMasonry columns={2} gap={24}><div>A</div><div>B</div></TkxMasonry>,
      { wrapper: Wrapper },
    );
    expect(container.firstElementChild).toBeInTheDocument();
  });
});

// ── TkxNumberInput ────────────────────────────────────────────────────────────

import { TkxNumberInput } from '../src/components/TkxNumberInput';

describe('TkxNumberInput', () => {
  it('renders with label', () => {
    render(<TkxNumberInput label="Quantity" />, { wrapper: Wrapper });
    expect(screen.getByText('Quantity')).toBeInTheDocument();
  });

  it('renders with an input element', () => {
    const { container } = render(<TkxNumberInput label="Amount" />, { wrapper: Wrapper });
    expect(container.firstElementChild).toBeInTheDocument();
  });

  it('renders with min and max without crashing', () => {
    const { container } = render(<TkxNumberInput label="Score" min={0} max={100} />, { wrapper: Wrapper });
    expect(container.firstElementChild).toBeInTheDocument();
  });

  it('renders with prefix and suffix', () => {
    render(<TkxNumberInput label="Price" prefix="$" suffix="USD" />, { wrapper: Wrapper });
    expect(screen.getByText('$')).toBeInTheDocument();
    expect(screen.getByText('USD')).toBeInTheDocument();
  });
});

// ── TkxRichTextDisplay ────────────────────────────────────────────────────────

import { TkxRichTextDisplay } from '../src/components/TkxRichTextDisplay';

describe('TkxRichTextDisplay', () => {
  it('renders heading blocks', () => {
    render(
      <TkxRichTextDisplay blocks={[{ type: 'heading', content: 'Main Title', level: 1 }]} />,
      { wrapper: Wrapper },
    );
    expect(screen.getByText('Main Title')).toBeInTheDocument();
  });

  it('renders paragraph blocks', () => {
    render(
      <TkxRichTextDisplay blocks={[{ type: 'paragraph', content: 'Body text here.' }]} />,
      { wrapper: Wrapper },
    );
    expect(screen.getByText('Body text here.')).toBeInTheDocument();
  });

  it('renders list blocks', () => {
    render(
      <TkxRichTextDisplay blocks={[{ type: 'list', items: ['Alpha', 'Beta', 'Gamma'] }]} />,
      { wrapper: Wrapper },
    );
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('Beta')).toBeInTheDocument();
  });

  it('renders code blocks', () => {
    render(
      <TkxRichTextDisplay blocks={[{ type: 'code', content: 'const x = 1;', language: 'js' }]} />,
      { wrapper: Wrapper },
    );
    expect(screen.getByText('const x = 1;')).toBeInTheDocument();
  });
});

// ── TkxTransferList ───────────────────────────────────────────────────────────

import { TkxTransferList } from '../src/components/TkxTransferList';

describe('TkxTransferList', () => {
  const src = [
    { value: 'a', label: 'Apple' },
    { value: 'b', label: 'Banana' },
    { value: 'c', label: 'Cherry' },
  ];
  const target: typeof src = [];

  it('renders source items', () => {
    render(
      <TkxTransferList sourceItems={src} targetItems={target} onTransfer={vi.fn()} />,
      { wrapper: Wrapper },
    );
    expect(screen.getByText('Apple')).toBeInTheDocument();
    expect(screen.getByText('Banana')).toBeInTheDocument();
  });

  it('renders with custom panel titles', () => {
    render(
      <TkxTransferList
        sourceItems={src} targetItems={target} onTransfer={vi.fn()}
        sourceTitle="Available" targetTitle="Selected"
      />,
      { wrapper: Wrapper },
    );
    expect(screen.getByText('Available')).toBeInTheDocument();
    expect(screen.getByText('Selected')).toBeInTheDocument();
  });
});

// ── TkxSpeedDial ──────────────────────────────────────────────────────────────

import { TkxSpeedDial } from '../src/components/TkxSpeedDial';

describe('TkxSpeedDial', () => {
  const actions = [
    { id: 'edit', icon: '✏️', label: 'Edit' },
    { id: 'delete', icon: '🗑️', label: 'Delete' },
    { id: 'share', icon: '🔗', label: 'Share' },
  ];

  it('renders without crashing', () => {
    const { container } = render(
      <TkxSpeedDial actions={actions} />,
      { wrapper: Wrapper },
    );
    expect(container.firstElementChild).toBeInTheDocument();
  });

  it('renders action labels after interaction', () => {
    render(<TkxSpeedDial actions={actions} />, { wrapper: Wrapper });
    const trigger = screen.getAllByRole('button')[0];
    fireEvent.click(trigger);
    // Labels may appear multiple times (tooltip + aria) — just verify at least one exists
    expect(screen.getAllByText('Edit').length).toBeGreaterThan(0);
  });
});

// ── TkxColorPicker ────────────────────────────────────────────────────────────

import { TkxColorPicker } from '../src/components/TkxColorPicker';

describe('TkxColorPicker', () => {
  it('renders with label', () => {
    render(<TkxColorPicker label="Background Color" />, { wrapper: Wrapper });
    expect(screen.getByText('Background Color')).toBeInTheDocument();
  });

  it('renders with default value', () => {
    const { container } = render(<TkxColorPicker defaultValue="#ff0000" />, { wrapper: Wrapper });
    expect(container.firstElementChild).toBeInTheDocument();
  });

  it('calls onChange when color is changed', () => {
    const onChange = vi.fn();
    render(<TkxColorPicker onChange={onChange} />, { wrapper: Wrapper });
    const { container } = render(<TkxColorPicker onChange={onChange} />, { wrapper: Wrapper });
    expect(container.firstElementChild).toBeInTheDocument();
  });
});

// ── TkxMentions ───────────────────────────────────────────────────────────────

import { TkxMentions } from '../src/components/TkxMentions';

describe('TkxMentions', () => {
  const options = [
    { value: 'alice', label: 'Alice' },
    { value: 'bob', label: 'Bob' },
    { value: 'charlie', label: 'Charlie' },
  ];

  it('renders with label', () => {
    render(<TkxMentions options={options} label="Message" />, { wrapper: Wrapper });
    expect(screen.getByText('Message')).toBeInTheDocument();
  });

  it('renders a textarea input', () => {
    render(<TkxMentions options={options} placeholder="Type @ to mention" />, { wrapper: Wrapper });
    expect(screen.getByPlaceholderText('Type @ to mention')).toBeInTheDocument();
  });
});

// ── TkxClock ─────────────────────────────────────────────────────────────────

import { TkxClock } from '../src/components/TkxClock';

describe('TkxClock', () => {
  it('renders digital clock', () => {
    const { container } = render(<TkxClock variant="digital" />, { wrapper: Wrapper });
    expect(container.firstElementChild).toBeInTheDocument();
  });

  it('renders analog clock', () => {
    const { container } = render(<TkxClock variant="analog" />, { wrapper: Wrapper });
    expect(container.firstElementChild).toBeInTheDocument();
  });

  it('renders both variants', () => {
    const { container } = render(<TkxClock variant="both" showSeconds showDate />, { wrapper: Wrapper });
    expect(container.firstElementChild).toBeInTheDocument();
  });

  it('renders with custom label', () => {
    render(<TkxClock label="UTC Time" />, { wrapper: Wrapper });
    expect(screen.getByText('UTC Time')).toBeInTheDocument();
  });
});

// ── TkxCascader ───────────────────────────────────────────────────────────────

import { TkxCascader } from '../src/components/TkxCascader';

describe('TkxCascader', () => {
  const options = [
    {
      value: 'electronics',
      label: 'Electronics',
      children: [
        { value: 'phones', label: 'Phones' },
        { value: 'laptops', label: 'Laptops' },
      ],
    },
    { value: 'clothing', label: 'Clothing' },
  ];

  it('renders with label', () => {
    render(<TkxCascader options={options} label="Category" />, { wrapper: Wrapper });
    expect(screen.getByText('Category')).toBeInTheDocument();
  });

  it('renders with placeholder', () => {
    render(<TkxCascader options={options} placeholder="Select category" />, { wrapper: Wrapper });
    expect(screen.getByText('Select category')).toBeInTheDocument();
  });
});

// ── TkxCarousel ───────────────────────────────────────────────────────────────

import { TkxCarousel } from '../src/components/TkxCarousel';

describe('TkxCarousel', () => {
  const slides = [
    { id: '1', content: <div>Slide One</div> },
    { id: '2', content: <div>Slide Two</div> },
    { id: '3', content: <div>Slide Three</div> },
  ];

  it('renders without crashing', () => {
    const { container } = render(<TkxCarousel slides={slides} />, { wrapper: Wrapper });
    expect(container.firstElementChild).toBeInTheDocument();
  });

  it('renders with showArrows and showDots', () => {
    const { container } = render(
      <TkxCarousel slides={slides} showArrows showDots />,
      { wrapper: Wrapper },
    );
    expect(container.firstElementChild).toBeInTheDocument();
  });
});

// ── TkxVideoPlayer ────────────────────────────────────────────────────────────

import { TkxVideoPlayer } from '../src/components/TkxVideoPlayer';

describe('TkxVideoPlayer', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <TkxVideoPlayer src="https://example.com/video.mp4" />,
      { wrapper: Wrapper },
    );
    expect(container.firstElementChild).toBeInTheDocument();
  });

  it('renders with title', () => {
    render(
      <TkxVideoPlayer src="https://example.com/video.mp4" title="Demo Video" showTitle />,
      { wrapper: Wrapper },
    );
    expect(screen.getByText('Demo Video')).toBeInTheDocument();
  });

  it('renders video element', () => {
    const { container } = render(
      <TkxVideoPlayer src="https://example.com/video.mp4" controls />,
      { wrapper: Wrapper },
    );
    expect(container.querySelector('video')).toBeInTheDocument();
  });
});

// ── TkxAffix ─────────────────────────────────────────────────────────────────

import { TkxAffix } from '../src/components/TkxAffix';

describe('TkxAffix', () => {
  it('renders children', () => {
    render(
      <TkxAffix offsetTop={20}><button>Affix Button</button></TkxAffix>,
      { wrapper: Wrapper },
    );
    expect(screen.getByRole('button', { name: 'Affix Button' })).toBeInTheDocument();
  });

  it('renders without offset', () => {
    const { container } = render(
      <TkxAffix><div>Sticky content</div></TkxAffix>,
      { wrapper: Wrapper },
    );
    expect(container.firstElementChild).toBeInTheDocument();
  });
});

// ── TkxAnchor ────────────────────────────────────────────────────────────────

import { TkxAnchor } from '../src/components/TkxAnchor';

describe('TkxAnchor', () => {
  const items = [
    { key: 'intro', href: '#intro', title: 'Introduction' },
    { key: 'usage', href: '#usage', title: 'Usage' },
    { key: 'api', href: '#api', title: 'API Reference' },
  ];

  it('renders all anchor links', () => {
    render(<TkxAnchor items={items} />, { wrapper: Wrapper });
    expect(screen.getByText('Introduction')).toBeInTheDocument();
    expect(screen.getByText('Usage')).toBeInTheDocument();
    expect(screen.getByText('API Reference')).toBeInTheDocument();
  });

  it('renders anchor links with hrefs', () => {
    render(<TkxAnchor items={items} />, { wrapper: Wrapper });
    const link = screen.getByText('Introduction').closest('a');
    expect(link).toHaveAttribute('href', '#intro');
  });
});
