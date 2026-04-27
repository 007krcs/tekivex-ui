import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TkxCheckout } from '../src/components/TkxCheckout';
import { ThemeProvider, quantumDark } from '../src/themes';

function W({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={quantumDark}>{children}</ThemeProvider>;
}

const ITEMS = [
  { id: '1', label: 'T-shirt', quantity: 2, unitPrice: 25 },
  { id: '2', label: 'Mug', quantity: 1, unitPrice: 15 },
];

const VALID_KEY = 'rzp_test_1234567890ABCDEF';

const fakeConfig = () => ({
  provider: 'razorpay' as const,
  publicKey: VALID_KEY,
  orderId: 'order_test',
  amount: 6500,
  currency: 'INR',
});

describe('TkxCheckout', () => {
  it('starts on the address step', () => {
    render(
      <TkxCheckout
        items={ITEMS}
        currency="USD"
        paymentConfigFor={fakeConfig}
        onComplete={() => {}}
      />,
      { wrapper: W },
    );
    expect(screen.getByText(/Shipping address/i)).toBeInTheDocument();
  });

  it('renders order-summary line items', () => {
    render(
      <TkxCheckout
        items={ITEMS}
        currency="USD"
        paymentConfigFor={fakeConfig}
        onComplete={() => {}}
      />,
      { wrapper: W },
    );
    expect(screen.getByText(/T-shirt/)).toBeInTheDocument();
    expect(screen.getByText(/Mug/)).toBeInTheDocument();
  });

  it('shows step indicator', () => {
    render(
      <TkxCheckout items={ITEMS} currency="USD" paymentConfigFor={fakeConfig} onComplete={() => {}} />,
      { wrapper: W },
    );
    expect(screen.getByText(/Step 1 of 3/i)).toBeInTheDocument();
  });

  it('continue button is disabled until address is complete', () => {
    render(
      <TkxCheckout items={ITEMS} currency="USD" paymentConfigFor={fakeConfig} onComplete={() => {}} />,
      { wrapper: W },
    );
    const cta = screen.getByText(/Continue to payment/i);
    expect(cta.closest('button')).toBeDisabled();
  });

  it('shows total with currency formatting', () => {
    render(
      <TkxCheckout items={ITEMS} currency="USD" paymentConfigFor={fakeConfig} onComplete={() => {}} />,
      { wrapper: W },
    );
    // Subtotal = 2*25 + 1*15 = 65
    expect(screen.getByText(/\$65/)).toBeInTheDocument();
  });

  it('calls onCancel when cancel button is clicked', () => {
    const onCancel = vi.fn();
    render(
      <TkxCheckout
        items={ITEMS}
        currency="USD"
        paymentConfigFor={fakeConfig}
        onComplete={() => {}}
        onCancel={onCancel}
      />,
      { wrapper: W },
    );
    fireEvent.click(screen.getByText(/Cancel/));
    expect(onCancel).toHaveBeenCalled();
  });

  it('applies tax + shipping to total', () => {
    render(
      <TkxCheckout
        items={ITEMS}
        currency="USD"
        taxRate={0.1}
        shipping={5}
        paymentConfigFor={fakeConfig}
        onComplete={() => {}}
      />,
      { wrapper: W },
    );
    // 65 + 6.5 + 5 = 76.5
    expect(screen.getByText(/\$76\.5/)).toBeInTheDocument();
  });
});
