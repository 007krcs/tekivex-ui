import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import {
  TkxPaymentProvider,
  useTkxPayment,
  TkxRazorpayCheckout,
  TkxCaptcha,
  TkxSecureDownload,
  TkxHoneypot,
} from '../index';
import { issueMath, issueSlider, issueImageGrid } from '../src/engine/captcha';
import { createRazorpayProvider } from '../src/engine/payment';

/* -------------------------------------------------------------------------- */
/* TkxPaymentProvider + useTkxPayment                                          */
/* -------------------------------------------------------------------------- */

describe('TkxPaymentProvider', () => {
  beforeEach(() => {
    document.head.innerHTML = '';
    delete (window as unknown as { Razorpay?: unknown }).Razorpay;
  });

  it('throws when useTkxPayment is called outside the provider', () => {
    function Probe(): null {
      useTkxPayment();
      return null;
    }
    // Suppress console error from React for this expected throw
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Probe />)).toThrow(/TkxPaymentProvider/);
    spy.mockRestore();
  });

  it('exposes a checkout function that dispatches to the right provider', async () => {
    const provider = createRazorpayProvider({ keyId: 'k', name: 'n' });
    const ensureSpy = vi
      .spyOn(provider, 'ensureLoaded')
      .mockImplementation(async () => {});
    const checkoutSpy = vi.spyOn(provider, 'checkout').mockResolvedValue({
      status: 'success',
      orderId: 'o1',
      paymentId: 'p1',
      signature: 'sig',
      raw: {},
    });

    let result: unknown;
    function Probe(): null {
      const { checkout } = useTkxPayment();
      // run on first render
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      checkout('razorpay', {
        orderId: 'o1',
        amount: { minor: 2000, currency: 'INR' },
      }).then((r) => {
        result = r;
      });
      return null;
    }
    render(
      <TkxPaymentProvider providers={[provider]}>
        <Probe />
      </TkxPaymentProvider>,
    );
    await new Promise((r) => setTimeout(r, 0));
    expect(checkoutSpy).toHaveBeenCalled();
    expect((result as { status: string }).status).toBe('success');
    ensureSpy.mockRestore();
    checkoutSpy.mockRestore();
  });
});

/* -------------------------------------------------------------------------- */
/* TkxRazorpayCheckout                                                          */
/* -------------------------------------------------------------------------- */

describe('TkxRazorpayCheckout', () => {
  beforeEach(() => {
    document.head.innerHTML = '';
    delete (window as unknown as { Razorpay?: unknown }).Razorpay;
  });

  it('runs checkout and forwards the result to onResult', async () => {
    const provider = createRazorpayProvider({ keyId: 'k', name: 'n' });
    vi.spyOn(provider, 'ensureLoaded').mockImplementation(async () => {});
    vi.spyOn(provider, 'checkout').mockResolvedValue({
      status: 'success',
      orderId: 'o1',
      paymentId: 'p1',
      signature: 'sig',
      raw: {},
    });
    const onResult = vi.fn();
    render(
      <TkxPaymentProvider providers={[provider]}>
        <TkxRazorpayCheckout
          request={{ orderId: 'o1', amount: { minor: 2000, currency: 'INR' } }}
          onResult={onResult}
        >
          Pay ₹20
        </TkxRazorpayCheckout>
      </TkxPaymentProvider>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Pay ₹20' }));
    await new Promise((r) => setTimeout(r, 0));
    expect(onResult).toHaveBeenCalled();
    expect(onResult.mock.calls[0][0].status).toBe('success');
  });
});

/* -------------------------------------------------------------------------- */
/* TkxCaptcha                                                                  */
/* -------------------------------------------------------------------------- */

describe('TkxCaptcha', () => {
  it('renders the math question and submits the typed number', () => {
    const { challenge } = issueMath();
    const onSubmit = vi.fn();
    render(<TkxCaptcha challenge={challenge} onSubmit={onSubmit} />);
    expect(screen.getByText(`${challenge.question} =`)).toBeTruthy();
    const input = screen.getByLabelText(/Answer/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: '7' } });
    fireEvent.click(screen.getByRole('button', { name: /Verify/i }));
    expect(onSubmit).toHaveBeenCalledWith(7);
  });

  it('renders a slider and submits the dropped position', () => {
    const challenge = issueSlider({ trackWidth: 200, edgeMargin: 20 });
    const onSubmit = vi.fn();
    const { container } = render(
      <TkxCaptcha challenge={challenge} onSubmit={onSubmit} />,
    );
    const slider = container.querySelector('[role="slider"]') as HTMLElement;
    expect(slider).toBeTruthy();
    const rect = { left: 0, top: 0, width: 200, height: 32 };
    slider.getBoundingClientRect = () => rect as DOMRect;
    act(() => {
      slider.dispatchEvent(
        new PointerEvent('pointerdown', {
          pointerId: 1,
          clientX: 50,
          clientY: 16,
          bubbles: true,
        } as PointerEventInit),
      );
      slider.dispatchEvent(
        new PointerEvent('pointermove', {
          pointerId: 1,
          clientX: challenge.target,
          clientY: 16,
          bubbles: true,
        } as PointerEventInit),
      );
      slider.dispatchEvent(
        new PointerEvent('pointerup', {
          pointerId: 1,
          clientX: challenge.target,
          clientY: 16,
          bubbles: true,
        } as PointerEventInit),
      );
    });
    expect(onSubmit).toHaveBeenCalled();
  });

  it('renders an image grid and submits the picked ids', () => {
    const { challenge } = issueImageGrid({
      prompt: 'Pick cats',
      pool: [
        { id: '1', label: 'cat', correct: true },
        { id: '2', label: 'cat', correct: true },
        { id: '3', label: 'cat', correct: true },
        { id: '4', label: 'dog', correct: false },
        { id: '5', label: 'dog', correct: false },
        { id: '6', label: 'dog', correct: false },
        { id: '7', label: 'dog', correct: false },
        { id: '8', label: 'dog', correct: false },
        { id: '9', label: 'dog', correct: false },
      ],
    });
    const onSubmit = vi.fn();
    render(<TkxCaptcha challenge={challenge} onSubmit={onSubmit} />);
    // Click the first three tiles
    const tiles = screen.getAllByRole('button', { pressed: false });
    fireEvent.click(tiles[0]);
    fireEvent.click(tiles[1]);
    fireEvent.click(tiles[2]);
    fireEvent.click(screen.getByRole('button', { name: /Verify/i }));
    expect(onSubmit).toHaveBeenCalled();
    const submitted = onSubmit.mock.calls[0][0] as string[];
    expect(submitted.length).toBe(3);
  });
});

/* -------------------------------------------------------------------------- */
/* TkxSecureDownload                                                            */
/* -------------------------------------------------------------------------- */

describe('TkxSecureDownload', () => {
  let originalFetch: typeof fetch;
  beforeEach(() => {
    originalFetch = globalThis.fetch;
  });
  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('fetches the URL, hands the blob to onBlob, and triggers a download', async () => {
    const blob = new Blob(['fake-pdf'], { type: 'application/pdf' });
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      blob: () => Promise.resolve(blob),
    } as unknown as Response);
    const onBlob = vi.fn();
    const onStart = vi.fn();
    render(
      <TkxSecureDownload
        url="/dl/token-1"
        filename="biodata.pdf"
        onBlob={onBlob}
        onDownloadStart={onStart}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /Download/i }));
    await new Promise((r) => setTimeout(r, 0));
    await new Promise((r) => setTimeout(r, 0));
    expect(onBlob).toHaveBeenCalled();
    expect(onStart).toHaveBeenCalled();
  });

  it('forwards an error on non-2xx response', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 410,
      statusText: 'Gone',
    } as unknown as Response);
    const onError = vi.fn();
    render(<TkxSecureDownload url="/dl/expired" filename="x.pdf" onError={onError} />);
    fireEvent.click(screen.getByRole('button'));
    await new Promise((r) => setTimeout(r, 0));
    expect(onError).toHaveBeenCalled();
    expect(onError.mock.calls[0][0]).toBeInstanceOf(Error);
  });
});

/* -------------------------------------------------------------------------- */
/* TkxHoneypot                                                                  */
/* -------------------------------------------------------------------------- */

describe('TkxHoneypot', () => {
  it('renders the field aria-hidden and far off-screen', () => {
    const { container } = render(<TkxHoneypot />);
    const wrap = container.querySelector('[data-tkx-honeypot]') as HTMLElement;
    expect(wrap).toBeTruthy();
    expect(wrap.getAttribute('aria-hidden')).toBe('true');
    expect(wrap.style.left).toBe('-9999px');
  });

  it('forwards changes via onChange', () => {
    const onChange = vi.fn();
    const { container } = render(<TkxHoneypot onChange={onChange} />);
    const input = container.querySelector('input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'spam' } });
    expect(onChange).toHaveBeenCalledWith('spam');
  });
});
