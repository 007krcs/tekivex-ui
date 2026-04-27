import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TkxPaymentButton } from '../src/components/TkxPaymentButton';
import { ThemeProvider, quantumDark } from '../src/themes';

function W({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={quantumDark}>{children}</ThemeProvider>;
}

const VALID_KEY = 'rzp_test_1234567890ABCDEF';

describe('TkxPaymentButton', () => {
  beforeEach(() => {
    // Reset any provider script + global state.
    document.querySelectorAll('script[data-tkx-payment]').forEach((el) => el.remove());
    delete (window as any).Razorpay;
    delete (window as any).Stripe;
    delete (window as any).Square;
  });

  it('renders with default "Pay" label', () => {
    render(
      <TkxPaymentButton
        config={{
          provider: 'razorpay',
          publicKey: VALID_KEY,
          orderId: 'order_test',
          amount: 1000,
          currency: 'INR',
        }}
        onSuccess={() => {}}
      />,
      { wrapper: W },
    );
    expect(screen.getByRole('button')).toHaveTextContent(/Pay/);
  });

  it('renders custom children', () => {
    render(
      <TkxPaymentButton
        config={{
          provider: 'razorpay',
          publicKey: VALID_KEY,
          orderId: 'order_test',
          amount: 1000,
          currency: 'INR',
        }}
        onSuccess={() => {}}
      >
        Custom label
      </TkxPaymentButton>,
      { wrapper: W },
    );
    expect(screen.getByRole('button')).toHaveTextContent('Custom label');
  });

  it('respects disabled prop', () => {
    render(
      <TkxPaymentButton
        config={{
          provider: 'razorpay',
          publicKey: VALID_KEY,
          orderId: 'order_test',
          amount: 1000,
          currency: 'INR',
        }}
        onSuccess={() => {}}
        disabled
      />,
      { wrapper: W },
    );
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('emits failure when SDK fails to load', async () => {
    // Block script tag insertion so loadProviderScript rejects.
    const originalAppendChild = document.head.appendChild.bind(document.head);
    vi.spyOn(document.head, 'appendChild').mockImplementation((node: any) => {
      if (node.tagName === 'SCRIPT' && node.dataset?.tkxPayment) {
        // Simulate immediate error.
        setTimeout(() => node.dispatchEvent(new Event('error')), 0);
      }
      return originalAppendChild(node);
    });

    const onFailure = vi.fn();
    render(
      <TkxPaymentButton
        config={{
          provider: 'razorpay',
          publicKey: VALID_KEY,
          orderId: 'order_test',
          amount: 1000,
          currency: 'INR',
        }}
        onSuccess={() => {}}
        onFailure={onFailure}
      />,
      { wrapper: W },
    );
    fireEvent.click(screen.getByRole('button'));
    await waitFor(() => expect(onFailure).toHaveBeenCalled(), { timeout: 2000 });
    expect(onFailure.mock.calls[0][0]).toMatchObject({
      provider: 'razorpay',
      code: 'sdk-load-failed',
    });
  });

  it('warns on malformed public key', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(
      <TkxPaymentButton
        config={{
          provider: 'razorpay',
          publicKey: 'too-short',
          orderId: 'order_test',
          amount: 1000,
          currency: 'INR',
        }}
        onSuccess={() => {}}
      />,
      { wrapper: W },
    );
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it('exposes provider in data attribute for testing', () => {
    render(
      <TkxPaymentButton
        config={{ provider: 'stripe', publicKey: VALID_KEY, sessionId: 'cs_' + 'a'.repeat(20) }}
        onSuccess={() => {}}
      />,
      { wrapper: W },
    );
    expect(screen.getByRole('button')).toHaveAttribute('data-tkx-payment-provider', 'stripe');
  });
});
