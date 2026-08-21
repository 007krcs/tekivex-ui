'use client';

// ─────────────────────────────────────────────────────────────────────────────
// TkxPaymentButton — provider-agnostic payment trigger.
//
// Supported providers:
//   - "razorpay" — Razorpay (India)
//   - "stripe"   — Stripe Checkout / PaymentElement (global)
//   - "square"   — Square Web Payments SDK
//
// Responsibilities:
//   1. Lazy-inject the provider's JS once per page (idempotent)
//   2. Render the trigger button (with loading state during checkout)
//   3. Surface lifecycle events: onSuccess, onFailure, onDismiss
//   4. Sanitise all inputs (sanitizeString on display strings, regex check
//      on the public key)
//
// Security notes:
//   - Order creation MUST happen server-side. Pass `orderId` from your
//     backend; never compute it client-side.
//   - Public keys (Razorpay key_id, Stripe pk_, Square locationId) are
//     safe in client code by definition. Secret keys are not.
//   - The success callback receives a token / paymentId — verify it on
//     your server before granting access to the purchased resource.
// ─────────────────────────────────────────────────────────────────────────────

import {
  forwardRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type Ref,
} from 'react';
import { useTheme } from '../themes';
import { useLocale } from '../i18n';
import { sanitizeString } from '../engine/security';

export type PaymentProvider = 'razorpay' | 'stripe' | 'square';

export interface PaymentSuccessResult {
  /** Provider that fulfilled the payment. */
  provider: PaymentProvider;
  /** Provider's payment id / charge id / payment intent id. */
  paymentId: string;
  /** Provider's order id (matches what you passed in). */
  orderId?: string;
  /** Optional signature for server-side verification (Razorpay). */
  signature?: string;
  /** Raw provider response — keep for audit, do NOT trust client-side. */
  raw: unknown;
}

export interface PaymentFailureResult {
  provider: PaymentProvider;
  code: string;
  message: string;
  raw: unknown;
}

export interface RazorpayConfig {
  provider: 'razorpay';
  /** Public key id (rzp_live_… or rzp_test_…). */
  publicKey: string;
  /** Server-generated order id (order_…). Required. */
  orderId: string;
  /** Amount in the smallest currency unit (paise for INR). */
  amount: number;
  currency: string;
  /** Customer prefill — name / email / contact. */
  prefill?: { name?: string; email?: string; contact?: string };
  /** Optional notes for the merchant dashboard. */
  notes?: Record<string, string>;
  /** Branding shown in the modal. */
  brand?: { name?: string; description?: string; image?: string };
  /** Theme colour for the modal accents. Defaults to theme.css.primary. */
  themeColor?: string;
}

export interface StripeConfig {
  provider: 'stripe';
  /** Publishable key (pk_live_… / pk_test_…). */
  publicKey: string;
  /** Stripe Checkout session id (cs_live_… / cs_test_…) created server-side. */
  sessionId: string;
}

export interface SquareConfig {
  provider: 'square';
  /** Application id from Square Developer dashboard. */
  applicationId: string;
  /** Location id from Square. */
  locationId: string;
  /** Server-issued payment intent / order. */
  orderId: string;
  amount: number;
  currency: string;
}

export type PaymentConfig = RazorpayConfig | StripeConfig | SquareConfig;

export interface TkxPaymentButtonProps {
  config: PaymentConfig;
  onSuccess: (result: PaymentSuccessResult) => void;
  onFailure?: (result: PaymentFailureResult) => void;
  onDismiss?: () => void;
  /** Button label. Defaults to "Pay" (localised). */
  children?: ReactNode;
  /** Visual style. */
  variant?: 'primary' | 'outline';
  /** Size token. */
  size?: 'sm' | 'md' | 'lg';
  /** Disable the button. */
  disabled?: boolean;
  /** Optional className on the trigger. */
  className?: string;
  /** Optional inline style on the trigger. */
  style?: CSSProperties;
}

const SCRIPT_SRC: Record<PaymentProvider, string> = {
  razorpay: 'https://checkout.razorpay.com/v1/checkout.js',
  stripe: 'https://js.stripe.com/v3/',
  square: 'https://web.squarecdn.com/v1/square.js',
};

const GLOBAL_KEY: Record<PaymentProvider, string> = {
  razorpay: 'Razorpay',
  stripe: 'Stripe',
  square: 'Square',
};

// 20+ chars of [A-Za-z0-9_-] is the lowest common denominator for the
// public/publishable keys across all three providers. Tighter than
// nothing, looser than perfect; bad keys fail at the provider anyway.
const KEY_PATTERN = /^[A-Za-z0-9_-]{20,200}$/;

const scriptPromises: Partial<Record<PaymentProvider, Promise<void>>> = {};

function loadProviderScript(provider: PaymentProvider): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if ((window as any)[GLOBAL_KEY[provider]]) return Promise.resolve();
  if (scriptPromises[provider]) return scriptPromises[provider]!;

  const promise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[data-tkx-payment="${provider}"]`,
    );
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('script-load-failed')));
      return;
    }
    const s = document.createElement('script');
    s.src = SCRIPT_SRC[provider];
    s.async = true;
    s.dataset.tkxPayment = provider;
    s.addEventListener('load', () => resolve());
    s.addEventListener('error', () => reject(new Error('script-load-failed')));
    document.head.appendChild(s);
  });

  scriptPromises[provider] = promise;
  return promise;
}

export const TkxPaymentButton = forwardRef<HTMLButtonElement, TkxPaymentButtonProps>(
  function TkxPaymentButton(
    { config, onSuccess, onFailure, onDismiss, children, variant = 'primary', size = 'md', disabled, className, style },
    ref: Ref<HTMLButtonElement>,
  ) {
    const theme = useTheme();
    const t = useLocale();
    const [busy, setBusy] = useState(false);

    // Validate the public key early.
    const keyToValidate =
      config.provider === 'razorpay' ? config.publicKey :
      config.provider === 'stripe' ? config.publicKey :
      config.applicationId;
    if (!KEY_PATTERN.test(keyToValidate)) {
      // eslint-disable-next-line no-console
      console.warn(`[TkxPaymentButton] Public key for ${config.provider} looks malformed. Bad keys will fail at the provider.`);
    }

    const handleClick = async () => {
      if (busy || disabled) return;
      setBusy(true);
      try {
        await loadProviderScript(config.provider);

        if (config.provider === 'razorpay') {
          const Rzp = (window as any).Razorpay;
          if (!Rzp) throw new Error('Razorpay script loaded but global missing');
          const options = {
            key: config.publicKey,
            amount: config.amount,
            currency: config.currency,
            order_id: config.orderId,
            name: sanitizeString(config.brand?.name ?? 'Payment'),
            description: sanitizeString(config.brand?.description ?? ''),
            image: config.brand?.image,
            prefill: config.prefill,
            notes: config.notes,
            theme: { color: config.themeColor ?? theme.css.primary },
            handler: (res: any) => {
              onSuccess({
                provider: 'razorpay',
                paymentId: res.razorpay_payment_id,
                orderId: res.razorpay_order_id,
                signature: res.razorpay_signature,
                raw: res,
              });
            },
            modal: {
              ondismiss: () => {
                setBusy(false);
                onDismiss?.();
              },
            },
          };
          const instance = new Rzp(options);
          instance.on('payment.failed', (resp: any) => {
            setBusy(false);
            onFailure?.({
              provider: 'razorpay',
              code: resp?.error?.code ?? 'unknown',
              message: resp?.error?.description ?? 'Payment failed',
              raw: resp,
            });
          });
          instance.open();
          return;
        }

        if (config.provider === 'stripe') {
          const StripeFn = (window as any).Stripe;
          if (!StripeFn) throw new Error('Stripe script loaded but global missing');
          const stripe = StripeFn(config.publicKey);
          const result = await stripe.redirectToCheckout({ sessionId: config.sessionId });
          // redirectToCheckout only returns when the redirect fails.
          if (result?.error) {
            setBusy(false);
            onFailure?.({
              provider: 'stripe',
              code: result.error.code ?? 'unknown',
              message: result.error.message ?? 'Stripe checkout failed',
              raw: result,
            });
          }
          return;
        }

        if (config.provider === 'square') {
          const Sq = (window as any).Square;
          if (!Sq) throw new Error('Square script loaded but global missing');
          // Square's full Web Payments SDK is too large to inline here. We
          // expose a hook by emitting a custom event the consumer can pick up
          // and complete the flow with their own Card/GooglePay/ApplePay
          // tokenisation.
          const detail = {
            applicationId: config.applicationId,
            locationId: config.locationId,
            orderId: config.orderId,
            amount: config.amount,
            currency: config.currency,
            success: (paymentId: string, raw: unknown) =>
              onSuccess({ provider: 'square', paymentId, orderId: config.orderId, raw }),
            failure: (code: string, message: string, raw: unknown) =>
              onFailure?.({ provider: 'square', code, message, raw }),
          };
          window.dispatchEvent(new CustomEvent('tkx-payment-square-init', { detail }));
          // Consumer-side handler must call detail.success() / detail.failure().
          // We don't auto-reset busy here.
          return;
        }
      } catch (err) {
        setBusy(false);
        onFailure?.({
          provider: config.provider,
          code: 'sdk-load-failed',
          message: (err as Error)?.message ?? 'Unable to load payment SDK',
          raw: err,
        });
      }
    };

    const padX = size === 'sm' ? 12 : size === 'lg' ? 22 : 16;
    const padY = size === 'sm' ? 6 : size === 'lg' ? 12 : 9;
    const fontSize = size === 'sm' ? 13 : size === 'lg' ? 16 : 14;
    const minHeight = size === 'sm' ? 32 : size === 'lg' ? 48 : 40;

    const buttonStyle: CSSProperties = {
      padding: `${padY}px ${padX}px`,
      borderRadius: 8,
      border: variant === 'outline' ? `1.5px solid ${theme.css.primary}` : 'none',
      background: variant === 'outline' ? 'transparent' : theme.css.primary,
      color: variant === 'outline' ? theme.css.primary : theme.css.bg,
      fontSize,
      fontWeight: 600,
      cursor: disabled ? 'not-allowed' : busy ? 'progress' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      minHeight,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      transition: 'opacity 0.15s, transform 0.05s',
      ...style,
    };

    return (
      <button
        ref={ref}
        type="button"
        onClick={handleClick}
        disabled={disabled || busy}
        aria-busy={busy}
        className={className}
        style={buttonStyle}
        data-tkx-payment-provider={config.provider}
      >
        {busy ? (
          <span aria-hidden="true">{t.loading}</span>
        ) : (
          children ?? `Pay`
        )}
      </button>
    );
  },
);

TkxPaymentButton.displayName = 'TkxPaymentButton';
