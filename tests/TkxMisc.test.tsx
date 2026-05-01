import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import {
  TkxShareSheet,
  TkxFontPicker,
  TkxInstallPrompt,
  TkxBiodataPreview,
} from '../index';

/* -------------------------------------------------------------------------- */
/* TkxShareSheet                                                              */
/* -------------------------------------------------------------------------- */

describe('TkxShareSheet', () => {
  let originalShare: unknown;
  let originalOpen: typeof window.open;

  beforeEach(() => {
    originalShare = (navigator as unknown as { share?: unknown }).share;
    originalOpen = window.open;
    Object.defineProperty(navigator, 'share', { value: undefined, configurable: true });
    window.open = vi.fn() as unknown as typeof window.open;
  });

  afterEach(() => {
    Object.defineProperty(navigator, 'share', {
      value: originalShare,
      configurable: true,
    });
    window.open = originalOpen;
  });

  it('renders fallback targets when navigator.share is unavailable', () => {
    render(<TkxShareSheet text="Check my biodata" url="https://shubhbio.com/x" />);
    // native button is hidden when navigator.share is undefined
    expect(screen.queryByText(/^Share$/)).toBeNull();
    expect(screen.getByText('WhatsApp')).toBeTruthy();
    expect(screen.getByText('Telegram')).toBeTruthy();
  });

  it('opens a new window with a wa.me URL when WhatsApp is clicked', () => {
    render(<TkxShareSheet text="hi" url="https://shubhbio.com/x" />);
    fireEvent.click(screen.getByText('WhatsApp'));
    expect(window.open).toHaveBeenCalled();
    const args = (window.open as unknown as { mock: { calls: unknown[][] } }).mock.calls[0];
    expect(String(args[0])).toContain('wa.me');
  });

  it('shows native button when navigator.share is available and emits onShared', async () => {
    const shareSpy = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'share', { value: shareSpy, configurable: true });
    const onShared = vi.fn();
    render(<TkxShareSheet text="hi" url="u" onShared={onShared} />);
    fireEvent.click(screen.getByText('Share'));
    await new Promise((r) => setTimeout(r, 0));
    expect(shareSpy).toHaveBeenCalled();
    expect(onShared).toHaveBeenCalledWith('native');
  });

  it('targets prop limits the visible buttons', () => {
    render(<TkxShareSheet text="x" targets={['copy']} />);
    expect(screen.getByText('Copy link')).toBeTruthy();
    expect(screen.queryByText('WhatsApp')).toBeNull();
  });
});

/* -------------------------------------------------------------------------- */
/* TkxFontPicker                                                              */
/* -------------------------------------------------------------------------- */

describe('TkxFontPicker', () => {
  const options = [
    { id: 'noto', label: 'Noto Sans Devanagari', fontFamily: '"Noto Sans Devanagari"' },
    { id: 'mukta', label: 'Mukta', fontFamily: '"Mukta"' },
  ];

  it('renders one radio per option with a sample preview', () => {
    render(<TkxFontPicker script="Devanagari" options={options} defaultValue="noto" />);
    const radios = screen.getAllByRole('radio');
    expect(radios.length).toBe(2);
    expect(radios[0]).toHaveProperty('checked', true);
  });

  it('emits onChange when a different option is picked', () => {
    const onChange = vi.fn();
    render(
      <TkxFontPicker
        script="Devanagari"
        options={options}
        defaultValue="noto"
        onChange={onChange}
      />,
    );
    fireEvent.click(screen.getAllByRole('radio')[1]);
    expect(onChange).toHaveBeenCalled();
    expect(onChange.mock.calls[0][0]).toBe('mukta');
  });

  it('uses script-specific sample text when option.sample is not set', () => {
    const { container } = render(
      <TkxFontPicker script="Tamil" options={options} defaultValue="noto" />,
    );
    expect(container.textContent).toContain('கிருஷ்ணா');
  });
});

/* -------------------------------------------------------------------------- */
/* TkxInstallPrompt                                                           */
/* -------------------------------------------------------------------------- */

describe('TkxInstallPrompt', () => {
  function fakeBeforeInstall(): Event {
    const e = new Event('beforeinstallprompt') as Event & {
      prompt: () => Promise<void>;
      userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
    };
    e.prompt = vi.fn().mockResolvedValue(undefined);
    e.userChoice = Promise.resolve({ outcome: 'accepted', platform: 'web' });
    return e;
  }

  it('renders nothing until beforeinstallprompt fires', () => {
    const { container } = render(<TkxInstallPrompt />);
    expect(container.querySelector('[data-tkx-install-prompt]')).toBeNull();
  });

  it('shows the banner once beforeinstallprompt arrives', () => {
    render(<TkxInstallPrompt />);
    act(() => {
      window.dispatchEvent(fakeBeforeInstall());
    });
    expect(document.querySelector('[data-tkx-install-prompt="visible"]')).toBeTruthy();
  });

  it('hides itself when the user dismisses', () => {
    render(<TkxInstallPrompt />);
    act(() => {
      window.dispatchEvent(fakeBeforeInstall());
    });
    fireEvent.click(screen.getByText(/Not now/));
    expect(document.querySelector('[data-tkx-install-prompt="visible"]')).toBeNull();
  });

  it('children render-prop receives the install/dismiss helpers', () => {
    render(
      <TkxInstallPrompt>
        {({ available }) => (
          <span data-testid="state">{available ? 'yes' : 'no'}</span>
        )}
      </TkxInstallPrompt>,
    );
    expect(screen.getByTestId('state').textContent).toBe('no');
    act(() => {
      window.dispatchEvent(fakeBeforeInstall());
    });
    expect(screen.getByTestId('state').textContent).toBe('yes');
  });
});

/* -------------------------------------------------------------------------- */
/* TkxBiodataPreview composite                                                  */
/* -------------------------------------------------------------------------- */

describe('TkxBiodataPreview', () => {
  it('mounts every guard with armed data attributes by default', () => {
    const { container } = render(
      <TkxBiodataPreview sessionId="draft_abcdef" watermarkLabel="ShubhBio">
        <p>biodata</p>
      </TkxBiodataPreview>,
    );
    expect(container.querySelector('[data-tkx-screenshot-guard="armed"]')).toBeTruthy();
    expect(container.querySelector('[data-tkx-print-guard="armed"]')).toBeTruthy();
    expect(container.querySelector('[data-tkx-clipboard-guard="armed"]')).toBeTruthy();
    expect(container.querySelector('[data-tkx-devtools-guard="armed"]')).toBeTruthy();
    expect(container.querySelector('[data-tkx-biodata-preview]')).toBeTruthy();
  });

  it('respects per-guard disable flags', () => {
    const { container } = render(
      <TkxBiodataPreview sessionId="x" disableClipboard disableDevTools>
        <p>biodata</p>
      </TkxBiodataPreview>,
    );
    expect(container.querySelector('[data-tkx-clipboard-guard="off"]')).toBeTruthy();
    expect(container.querySelector('[data-tkx-devtools-guard="off"]')).toBeTruthy();
    expect(container.querySelector('[data-tkx-screenshot-guard="armed"]')).toBeTruthy();
  });

  it('forwards screenshot attempt events through onAttempt', () => {
    const onAttempt = vi.fn();
    render(
      <TkxBiodataPreview sessionId="x" onAttempt={onAttempt}>
        <p>biodata</p>
      </TkxBiodataPreview>,
    );
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'PrintScreen' }));
    });
    expect(onAttempt).toHaveBeenCalled();
  });
});
