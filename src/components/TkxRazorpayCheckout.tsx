'use client';

import {
  forwardRef,
  useCallback,
  useState,
  type ReactNode,
} from 'react';
import { TkxButton, type TkxButtonProps } from './TkxButton';
import { useTkxPayment } from './TkxPaymentProvider';
import type { CheckoutRequest, CheckoutResult } from '../engine/payment';

export interface TkxRazorpayCheckoutProps
  extends Omit<TkxButtonProps, 'onClick' | 'children'> {
  request: CheckoutRequest;
  /** Always called when the checkout flow resolves — success, cancel, or fail. */
  onResult: (result: CheckoutResult) => void;
  /** Override the provider id if the host registered Razorpay under a custom key. */
  providerId?: string;
  children?: ReactNode;
}

/**
 * Convenience button that runs a Razorpay checkout via the active
 * TkxPaymentProvider. The host page is still responsible for:
 *  1. Issuing the order id from its backend before passing it in `request`.
 *  2. Re-verifying the success result server-side via verifyRazorpaySignature
 *     before unlocking any paid resource (e.g., issuing a download token).
 */
export const TkxRazorpayCheckout = forwardRef<HTMLButtonElement, TkxRazorpayCheckoutProps>(
  function TkxRazorpayCheckout(
    { request, onResult, providerId = 'razorpay', children, ...buttonProps },
    ref,
  ) {
    const { checkout } = useTkxPayment();
    const [busy, setBusy] = useState(false);

    const handleClick = useCallback(async () => {
      setBusy(true);
      try {
        const result = await checkout(providerId, request);
        onResult(result);
      } finally {
        setBusy(false);
      }
    }, [checkout, providerId, request, onResult]);

    return (
      <TkxButton
        ref={ref}
        {...buttonProps}
        onClick={handleClick}
        isLoading={busy || buttonProps.isLoading}
      >
        {children ?? 'Pay'}
      </TkxButton>
    );
  },
);

TkxRazorpayCheckout.displayName = 'TkxRazorpayCheckout';
