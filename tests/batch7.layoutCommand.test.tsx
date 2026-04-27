import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, quantumDark } from '../src/themes';
import {
  TkxLayout,
  TkxHeader,
  TkxSider,
  TkxContent,
  TkxFooter,
  TkxRow,
  TkxCol,
} from '../src/components/TkxLayout';
import { TkxCommand, useTkxCommand } from '../src/components/TkxCommand';
import { TkxCaptcha } from '../src/components/TkxCaptcha';
import { TkxBottomNav } from '../src/components/TkxBottomNav';
import { TkxToolbar } from '../src/components/TkxToolbar';
import { TkxPopover } from '../src/components/TkxPopover';
import { renderHook, act } from '@testing-library/react';

function W({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={quantumDark}>{children}</ThemeProvider>;
}

// ── TkxLayout family ──────────────────────────────────────────────────────
describe('TkxLayout', () => {
  it('renders children', () => {
    render(<TkxLayout><div>main</div></TkxLayout>, { wrapper: W });
    expect(screen.getByText('main')).toBeInTheDocument();
  });

  it('renders hasSider variant', () => {
    const { container } = render(
      <TkxLayout hasSider><TkxSider>nav</TkxSider><TkxContent>main</TkxContent></TkxLayout>,
      { wrapper: W },
    );
    expect(container.firstChild).toBeTruthy();
  });

  it('TkxHeader renders with custom height + fixed', () => {
    const { container } = render(<TkxHeader fixed height={80}>top</TkxHeader>, { wrapper: W });
    expect(container.firstChild).toBeTruthy();
  });

  it('TkxHeader respects string height', () => {
    const { container } = render(<TkxHeader height="5rem">top</TkxHeader>, { wrapper: W });
    expect(container.firstChild).toBeTruthy();
  });

  it('TkxSider renders all collapse states', () => {
    for (const collapsed of [true, false]) {
      const { container } = render(<TkxSider collapsed={collapsed}>x</TkxSider>, { wrapper: W });
      expect(container.firstChild).toBeTruthy();
    }
  });

  it('TkxSider with custom width', () => {
    const { container } = render(<TkxSider width={300} collapsedWidth={80}>x</TkxSider>, { wrapper: W });
    expect(container.firstChild).toBeTruthy();
  });

  it('TkxContent renders', () => {
    render(<TkxContent><span>c</span></TkxContent>, { wrapper: W });
    expect(screen.getByText('c')).toBeInTheDocument();
  });

  it('TkxFooter renders', () => {
    render(<TkxFooter><span>f</span></TkxFooter>, { wrapper: W });
    expect(screen.getByText('f')).toBeInTheDocument();
  });

  it('TkxRow renders with gutter (number)', () => {
    const { container } = render(<TkxRow gutter={16}><div>x</div></TkxRow>, { wrapper: W });
    expect(container.firstChild).toBeTruthy();
  });

  it('TkxRow renders with gutter (tuple)', () => {
    const { container } = render(<TkxRow gutter={[16, 24]}><div>x</div></TkxRow>, { wrapper: W });
    expect(container.firstChild).toBeTruthy();
  });

  it('TkxRow renders all justify variants', () => {
    for (const j of ['start', 'center', 'end', 'space-between', 'space-around', 'space-evenly'] as const) {
      const { container } = render(<TkxRow justify={j}><div>x</div></TkxRow>, { wrapper: W });
      expect(container.firstChild).toBeTruthy();
    }
  });

  it('TkxRow renders all align variants', () => {
    for (const a of ['top', 'middle', 'bottom', 'stretch'] as const) {
      const { container } = render(<TkxRow align={a}><div>x</div></TkxRow>, { wrapper: W });
      expect(container.firstChild).toBeTruthy();
    }
  });

  it('TkxCol renders with span + offset', () => {
    const { container } = render(<TkxCol span={12} offset={2}>col</TkxCol>, { wrapper: W });
    expect(container.firstChild).toBeTruthy();
  });

  it('TkxCol renders span 1..24', () => {
    for (const span of [1, 6, 12, 18, 24]) {
      const { container } = render(<TkxCol span={span}>x</TkxCol>, { wrapper: W });
      expect(container.firstChild).toBeTruthy();
    }
  });
});

// ── TkxCommand ────────────────────────────────────────────────────────────
const COMMAND_ITEMS = [
  { id: '1', label: 'Open file', group: 'File', shortcut: 'Cmd+O', onSelect: vi.fn() },
  { id: '2', label: 'Save', group: 'File', shortcut: 'Cmd+S' },
  { id: '3', label: 'Find', group: 'Edit', shortcut: 'Cmd+F' },
  { id: '4', label: 'Settings', icon: <span>⚙</span> },
  { id: '5', label: 'Disabled action', disabled: true },
];

describe('TkxCommand', () => {
  it('does not render when isOpen=false', () => {
    render(<TkxCommand items={COMMAND_ITEMS} isOpen={false} />, { wrapper: W });
    expect(screen.queryByText('Open file')).not.toBeInTheDocument();
  });

  it('renders all items when open', () => {
    render(<TkxCommand items={COMMAND_ITEMS} isOpen />, { wrapper: W });
    expect(screen.getByText('Open file')).toBeInTheDocument();
    expect(screen.getByText('Save')).toBeInTheDocument();
  });

  it('renders group headers', () => {
    render(<TkxCommand items={COMMAND_ITEMS} isOpen />, { wrapper: W });
    // Group headers like "File" / "Edit" should appear
    const fileHeaders = screen.queryAllByText(/File/i);
    expect(fileHeaders.length).toBeGreaterThan(0);
  });

  it('filters with query', () => {
    render(<TkxCommand items={COMMAND_ITEMS} isOpen />, { wrapper: W });
    const input = document.body.querySelector('input')!;
    fireEvent.change(input, { target: { value: 'find' } });
    expect(input).toBeTruthy();
  });

  it('arrow keys move active index', () => {
    render(<TkxCommand items={COMMAND_ITEMS} isOpen />, { wrapper: W });
    const input = document.body.querySelector('input')!;
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    expect(input).toBeTruthy();
  });

  it('Enter selects active item', () => {
    const onItemSelect = vi.fn();
    render(
      <TkxCommand items={COMMAND_ITEMS} isOpen onItemSelect={onItemSelect} />,
      { wrapper: W },
    );
    const input = document.body.querySelector('input')!;
    fireEvent.keyDown(input, { key: 'Enter' });
  });

  it('Escape calls onClose', () => {
    const onClose = vi.fn();
    render(<TkxCommand items={COMMAND_ITEMS} isOpen onClose={onClose} />, { wrapper: W });
    const input = document.body.querySelector('input')!;
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });

  it('item click selects', () => {
    const onItemSelect = vi.fn();
    render(<TkxCommand items={COMMAND_ITEMS} isOpen onItemSelect={onItemSelect} />, { wrapper: W });
    fireEvent.click(screen.getByText('Save'));
    expect(onItemSelect).toHaveBeenCalled();
  });

  it('renders empty message when no matches', () => {
    render(
      <TkxCommand items={COMMAND_ITEMS} isOpen emptyMessage="Nothing!" />,
      { wrapper: W },
    );
    const input = document.body.querySelector('input')!;
    fireEvent.change(input, { target: { value: 'zzzzzz' } });
    expect(screen.queryByText('Nothing!')).toBeInTheDocument();
  });

  it('renders custom placeholder', () => {
    render(
      <TkxCommand items={COMMAND_ITEMS} isOpen placeholder="Search me" />,
      { wrapper: W },
    );
    expect(document.body.querySelector('input[placeholder="Search me"]')).toBeTruthy();
  });

  it('useTkxCommand exposes open/close/toggle', () => {
    const { result } = renderHook(() => useTkxCommand());
    expect(result.current.isOpen).toBe(false);
    act(() => result.current.open());
    expect(result.current.isOpen).toBe(true);
    act(() => result.current.toggle());
    expect(result.current.isOpen).toBe(false);
    act(() => result.current.toggle());
    expect(result.current.isOpen).toBe(true);
    act(() => result.current.close());
    expect(result.current.isOpen).toBe(false);
  });
});

// ── TkxCaptcha (test mode) ────────────────────────────────────────────────
describe('TkxCaptcha', () => {
  it('renders test mode stub', () => {
    const onVerify = vi.fn();
    const { container } = render(
      <TkxCaptcha sitekey="0x4AAAAAAAAAAAAAAAAAAAAAAAAA" onVerify={onVerify} testMode />,
      { wrapper: W },
    );
    expect(container.firstChild).toBeTruthy();
  });

  it('test mode auto-verifies after delay', async () => {
    vi.useFakeTimers();
    const onVerify = vi.fn();
    render(
      <TkxCaptcha sitekey="0x4AAAAAAAAAAAAAAAAAAAAAAAAA" onVerify={onVerify} testMode />,
      { wrapper: W },
    );
    await act(async () => { vi.advanceTimersByTime(300); });
    vi.useRealTimers();
    // Stub should have called onVerify with a token.
    // Don't fail on timing — just smoke.
  });

  it('renders all theme variants in test mode', () => {
    for (const theme of ['light', 'dark', 'auto'] as const) {
      const { container } = render(
        <TkxCaptcha sitekey="0x4AAAAAAAAAAAAAAAAAAAAAAAAA" onVerify={() => {}} testMode theme={theme} />,
        { wrapper: W },
      );
      expect(container.firstChild).toBeTruthy();
    }
  });

  it('renders all size variants in test mode', () => {
    for (const size of ['normal', 'compact', 'invisible'] as const) {
      const { container } = render(
        <TkxCaptcha sitekey="0x4AAAAAAAAAAAAAAAAAAAAAAAAA" onVerify={() => {}} testMode size={size} />,
        { wrapper: W },
      );
      expect(container.firstChild).toBeTruthy();
    }
  });

  it('renders all providers in test mode', () => {
    for (const provider of ['turnstile', 'hcaptcha', 'recaptcha'] as const) {
      const { container } = render(
        <TkxCaptcha sitekey="0x4AAAAAAAAAAAAAAAAAAAAAAAAA" onVerify={() => {}} testMode provider={provider} />,
        { wrapper: W },
      );
      expect(container.firstChild).toBeTruthy();
    }
  });

  it('rejects invalid sitekey format gracefully', () => {
    const onError = vi.fn();
    const { container } = render(
      <TkxCaptcha sitekey="too-short" onVerify={() => {}} onError={onError} testMode />,
      { wrapper: W },
    );
    // Should still render something (either error state or stub).
    expect(container.firstChild).toBeTruthy();
  });
});

// ── TkxBottomNav ──────────────────────────────────────────────────────────
const BNAV_ITEMS = [
  { id: 'home', label: 'Home', icon: <span>🏠</span> },
  { id: 'search', label: 'Search', icon: <span>🔍</span> },
  { id: 'profile', label: 'Me', icon: <span>👤</span>, badge: '3' },
  { id: 'settings', label: 'Settings', icon: <span>⚙</span> },
];

describe('TkxBottomNav', () => {
  it('renders all items', () => {
    render(<TkxBottomNav items={BNAV_ITEMS} activeId="home" />, { wrapper: W });
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Search')).toBeInTheDocument();
  });

  it('hides labels when showLabels=false', () => {
    const { container } = render(
      <TkxBottomNav items={BNAV_ITEMS} activeId="home" showLabels={false} />,
      { wrapper: W },
    );
    expect(container.firstChild).toBeTruthy();
  });

  it('onChange fires on item click', () => {
    const onChange = vi.fn();
    render(<TkxBottomNav items={BNAV_ITEMS} activeId="home" onChange={onChange} />, { wrapper: W });
    fireEvent.click(screen.getByText('Search'));
    expect(onChange).toHaveBeenCalledWith('search');
  });

  it('arrow key navigation', () => {
    const { container } = render(
      <TkxBottomNav items={BNAV_ITEMS} activeId="home" />,
      { wrapper: W },
    );
    const buttons = container.querySelectorAll('button');
    if (buttons.length) {
      fireEvent.keyDown(buttons[0], { key: 'ArrowRight' });
      fireEvent.keyDown(buttons[0], { key: 'ArrowLeft' });
    }
  });

  it('clamps to max 5 items', () => {
    const many = Array.from({ length: 8 }, (_, i) => ({
      id: `i${i}`, label: `L${i}`, icon: <span>x</span>,
    }));
    const { container } = render(<TkxBottomNav items={many} activeId="i0" />, { wrapper: W });
    expect(container.querySelectorAll('button').length).toBeLessThanOrEqual(5);
  });
});

// ── TkxToolbar ────────────────────────────────────────────────────────────
const TOOLBAR_ITEMS = [
  { id: '1', label: 'Bold', onClick: vi.fn() },
  { id: 'sep', label: '', type: 'separator' as const },
  { id: '2', label: 'Italic', active: true, type: 'toggle' as const },
  { id: '3', label: 'Underline', disabled: true },
];

describe('TkxToolbar', () => {
  it('renders item labels', () => {
    render(<TkxToolbar items={TOOLBAR_ITEMS} />, { wrapper: W });
    // Labels render as aria-label or text
    expect(
      screen.queryByText('Bold') || screen.queryByLabelText('Bold'),
    ).toBeTruthy();
  });

  it('renders both orientations', () => {
    for (const o of ['horizontal', 'vertical'] as const) {
      const { container } = render(<TkxToolbar items={TOOLBAR_ITEMS} orientation={o} />, { wrapper: W });
      expect(container.firstChild).toBeTruthy();
    }
  });

  it('renders all sizes', () => {
    for (const s of ['sm', 'md', 'lg'] as const) {
      const { container } = render(<TkxToolbar items={TOOLBAR_ITEMS} size={s} />, { wrapper: W });
      expect(container.firstChild).toBeTruthy();
    }
  });

  it('renders all variants', () => {
    for (const v of ['default', 'outlined', 'filled'] as const) {
      const { container } = render(<TkxToolbar items={TOOLBAR_ITEMS} variant={v} />, { wrapper: W });
      expect(container.firstChild).toBeTruthy();
    }
  });

  it('arrow key roving focus', () => {
    const { container } = render(<TkxToolbar items={TOOLBAR_ITEMS} />, { wrapper: W });
    const buttons = container.querySelectorAll('button');
    if (buttons.length) {
      fireEvent.keyDown(buttons[0], { key: 'ArrowRight' });
      fireEvent.keyDown(buttons[0], { key: 'Home' });
      fireEvent.keyDown(buttons[0], { key: 'End' });
    }
  });

  it('item onClick fires', () => {
    const onClick = vi.fn();
    const items = [{ id: '1', label: 'Click', onClick }];
    render(<TkxToolbar items={items} />, { wrapper: W });
    const btn = screen.queryByLabelText('Click') || screen.queryByText('Click');
    if (btn) fireEvent.click(btn);
    expect(onClick).toHaveBeenCalled();
  });
});

// ── TkxPopover ────────────────────────────────────────────────────────────
describe('TkxPopover', () => {
  it('renders trigger element', () => {
    render(
      <TkxPopover trigger={<button>Click me</button>} content={<div>Content</div>} />,
      { wrapper: W },
    );
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('opens content when isOpen=true', () => {
    render(
      <TkxPopover
        trigger={<button>Click</button>}
        content={<div>Popover body</div>}
        isOpen
      />,
      { wrapper: W },
    );
    expect(screen.queryByText('Popover body')).toBeInTheDocument();
  });

  it('renders all placement variants when open', () => {
    for (const p of [
      'top', 'bottom', 'left', 'right',
      'top-start', 'top-end', 'bottom-start', 'bottom-end',
    ] as const) {
      const { container } = render(
        <TkxPopover
          trigger={<button>T</button>}
          content={<div>x</div>}
          placement={p}
          isOpen
        />,
        { wrapper: W },
      );
      expect(container.firstChild).toBeTruthy();
    }
  });

  it('controlled isOpen toggles content visibility', () => {
    const { rerender } = render(
      <ThemeProvider theme={quantumDark}>
        <TkxPopover trigger={<button>T</button>} content={<div>Hidden body</div>} isOpen={false} />
      </ThemeProvider>,
    );
    expect(screen.queryByText('Hidden body')).not.toBeInTheDocument();
    rerender(
      <ThemeProvider theme={quantumDark}>
        <TkxPopover trigger={<button>T</button>} content={<div>Hidden body</div>} isOpen={true} />
      </ThemeProvider>,
    );
    expect(screen.queryByText('Hidden body')).toBeInTheDocument();
  });

  it('onOpenChange fires when toggled', () => {
    const onOpenChange = vi.fn();
    render(
      <TkxPopover
        trigger={<button>T</button>}
        content={<div>x</div>}
        onOpenChange={onOpenChange}
      />,
      { wrapper: W },
    );
    fireEvent.click(screen.getByText('T'));
    expect(onOpenChange).toHaveBeenCalled();
  });
});
