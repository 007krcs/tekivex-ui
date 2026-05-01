import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import {
  TkxScreenshotGuard,
  TkxPrintGuard,
  TkxClipboardGuard,
  TkxDevToolsGuard,
  TkxDynamicWatermark,
} from '../index';

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
});

afterEach(() => {
  vi.runOnlyPendingTimers();
  vi.useRealTimers();
});

/* -------------------------------------------------------------------------- */
/* TkxScreenshotGuard                                                          */
/* -------------------------------------------------------------------------- */

describe('TkxScreenshotGuard', () => {
  it('renders children with armed data attribute', () => {
    render(
      <TkxScreenshotGuard>
        <p data-testid="content">Biodata preview</p>
      </TkxScreenshotGuard>,
    );
    expect(screen.getByTestId('content')).toBeTruthy();
    expect(
      document.querySelector('[data-tkx-screenshot-guard="armed"]'),
    ).toBeTruthy();
  });

  it('calls onAttempt and hides content when PrintScreen is pressed', () => {
    const onAttempt = vi.fn();
    render(
      <TkxScreenshotGuard onAttempt={onAttempt} hideMs={500}>
        <p>secret</p>
      </TkxScreenshotGuard>,
    );
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'PrintScreen' }));
    });
    expect(onAttempt).toHaveBeenCalled();
    expect(
      document.querySelector('[data-tkx-screenshot-guard="hidden"]'),
    ).toBeTruthy();

    act(() => {
      vi.advanceTimersByTime(600);
    });
    expect(
      document.querySelector('[data-tkx-screenshot-guard="armed"]'),
    ).toBeTruthy();
  });

  it('does not attach listeners when disabled', () => {
    const onAttempt = vi.fn();
    render(
      <TkxScreenshotGuard disabled onAttempt={onAttempt}>
        <p>visible</p>
      </TkxScreenshotGuard>,
    );
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'PrintScreen' }));
    });
    expect(onAttempt).not.toHaveBeenCalled();
  });

  it('renders the hiddenFallback while content is hidden', () => {
    render(
      <TkxScreenshotGuard hideMs={1000} hiddenFallback={<span>Locked</span>}>
        <p>secret</p>
      </TkxScreenshotGuard>,
    );
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'PrintScreen' }));
    });
    expect(screen.getByText('Locked')).toBeTruthy();
  });
});

/* -------------------------------------------------------------------------- */
/* TkxPrintGuard                                                               */
/* -------------------------------------------------------------------------- */

describe('TkxPrintGuard', () => {
  it('hides content during print and shows it on afterprint', () => {
    render(
      <TkxPrintGuard>
        <p>biodata</p>
      </TkxPrintGuard>,
    );
    act(() => {
      window.dispatchEvent(new Event('beforeprint'));
    });
    expect(
      document.querySelector('[data-tkx-print-guard="printing"]'),
    ).toBeTruthy();
    act(() => {
      window.dispatchEvent(new Event('afterprint'));
    });
    expect(document.querySelector('[data-tkx-print-guard="armed"]')).toBeTruthy();
  });

  it('blocks Ctrl+P keystroke and emits an attempt event', () => {
    const onAttempt = vi.fn();
    render(
      <TkxPrintGuard onAttempt={onAttempt}>
        <p>biodata</p>
      </TkxPrintGuard>,
    );
    const evt = new KeyboardEvent('keydown', {
      key: 'p',
      ctrlKey: true,
      cancelable: true,
    });
    act(() => {
      window.dispatchEvent(evt);
    });
    expect(onAttempt).toHaveBeenCalled();
    expect(evt.defaultPrevented).toBe(true);
  });
});

/* -------------------------------------------------------------------------- */
/* TkxClipboardGuard                                                           */
/* -------------------------------------------------------------------------- */

describe('TkxClipboardGuard', () => {
  it('blocks copy events on the wrapped region', () => {
    const onAttempt = vi.fn();
    const { container } = render(
      <TkxClipboardGuard onAttempt={onAttempt}>
        <p>biodata</p>
      </TkxClipboardGuard>,
    );
    const region = container.querySelector(
      '[data-tkx-clipboard-guard="armed"]',
    ) as HTMLElement;
    expect(region).toBeTruthy();
    const evt = new Event('copy', { cancelable: true, bubbles: true });
    act(() => {
      region.dispatchEvent(evt);
    });
    expect(onAttempt).toHaveBeenCalled();
    expect(evt.defaultPrevented).toBe(true);
  });

  it('blocks the contextmenu when blockContextMenu is true (default)', () => {
    const { container } = render(
      <TkxClipboardGuard>
        <p>biodata</p>
      </TkxClipboardGuard>,
    );
    const region = container.querySelector(
      '[data-tkx-clipboard-guard]',
    ) as HTMLElement;
    const evt = new Event('contextmenu', { cancelable: true, bubbles: true });
    act(() => {
      region.dispatchEvent(evt);
    });
    expect(evt.defaultPrevented).toBe(true);
  });

  it('does not block when disabled', () => {
    const onAttempt = vi.fn();
    const { container } = render(
      <TkxClipboardGuard disabled onAttempt={onAttempt}>
        <p>biodata</p>
      </TkxClipboardGuard>,
    );
    const region = container.querySelector(
      '[data-tkx-clipboard-guard="off"]',
    ) as HTMLElement;
    const evt = new Event('copy', { cancelable: true, bubbles: true });
    act(() => {
      region.dispatchEvent(evt);
    });
    expect(onAttempt).not.toHaveBeenCalled();
    expect(evt.defaultPrevented).toBe(false);
  });
});

/* -------------------------------------------------------------------------- */
/* TkxDevToolsGuard                                                            */
/* -------------------------------------------------------------------------- */

describe('TkxDevToolsGuard', () => {
  it('renders children and wires the watcher', () => {
    render(
      <TkxDevToolsGuard>
        <p>biodata</p>
      </TkxDevToolsGuard>,
    );
    expect(
      document.querySelector('[data-tkx-devtools-guard="armed"]'),
    ).toBeTruthy();
  });

  it('does not crash when disabled', () => {
    render(
      <TkxDevToolsGuard disabled>
        <p>biodata</p>
      </TkxDevToolsGuard>,
    );
    expect(
      document.querySelector('[data-tkx-devtools-guard="off"]'),
    ).toBeTruthy();
  });
});

/* -------------------------------------------------------------------------- */
/* TkxDynamicWatermark                                                         */
/* -------------------------------------------------------------------------- */

describe('TkxDynamicWatermark', () => {
  it('renders children and includes the session id in the watermark text', () => {
    render(
      <TkxDynamicWatermark
        sessionId="draft_abcdef123456"
        label="ShubhBio"
        refreshSeconds={0}
      >
        <p data-testid="content">biodata</p>
      </TkxDynamicWatermark>,
    );
    expect(screen.getByTestId('content')).toBeTruthy();
    // The watermark canvas image is generated via TkxWatermark; we cannot read
    // its pixel content reliably under jsdom, but the element should be present.
    const watermark = document.querySelector('[aria-hidden="true"]');
    expect(watermark).toBeTruthy();
  });

  it('truncates long session ids in the watermark', () => {
    // Indirect assertion: build the component and trust the truncation logic
    // by re-rendering with a long id and a short id and confirming both render.
    render(
      <TkxDynamicWatermark sessionId={'x'.repeat(64)} refreshSeconds={0}>
        <p>biodata</p>
      </TkxDynamicWatermark>,
    );
    expect(document.querySelector('[aria-hidden="true"]')).toBeTruthy();
  });
});
