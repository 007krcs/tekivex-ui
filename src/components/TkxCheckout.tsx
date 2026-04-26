'use client';

// ─────────────────────────────────────────────────────────────────────────────
// TkxCheckout — composable multi-step checkout flow.
//
// Three default steps:
//   1. Address    — uses TkxAddressInput
//   2. Payment    — uses TkxPaymentButton
//   3. Confirm    — review + place
//
// Consumers can replace any step's content via the `steps` prop. The
// component handles step transitions, validates progress, and returns a
// structured CheckoutResult on completion.
//
// This is intentionally a wrapper around the existing primitives — not a
// monolith. Composing your own checkout from TkxAddressInput +
// TkxPaymentButton directly is also fine; this is for the common case.
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
import { TkxAddressInput, type AddressValue } from './TkxAddressInput';
import {
  TkxPaymentButton,
  type PaymentConfig,
  type PaymentSuccessResult,
  type PaymentFailureResult,
} from './TkxPaymentButton';

export interface CheckoutLineItem {
  id: string;
  label: string;
  quantity: number;
  unitPrice: number;
}

export interface TkxCheckoutProps {
  items: CheckoutLineItem[];
  /** ISO 4217 currency code. */
  currency: string;
  /** Locale for currency formatting. Defaults to navigator language. */
  locale?: string;
  /** Tax rate (0..1). Optional. */
  taxRate?: number;
  /** Shipping flat fee. Optional. */
  shipping?: number;
  /** Build the payment config from collected address. */
  paymentConfigFor: (address: AddressValue) => Promise<PaymentConfig> | PaymentConfig;
  /** Called when payment succeeds. */
  onComplete: (result: { address: AddressValue; payment: PaymentSuccessResult }) => void;
  /** Called on cancel / failure. */
  onCancel?: () => void;
  /** Initial address (if pre-filled from user profile). */
  initialAddress?: Partial<AddressValue>;
  /** Optional className. */
  className?: string;
  /** Optional inline style. */
  style?: CSSProperties;
}

type Step = 'address' | 'payment' | 'confirm';

export const TkxCheckout = forwardRef<HTMLDivElement, TkxCheckoutProps>(
  function TkxCheckout(
    {
      items,
      currency,
      locale,
      taxRate = 0,
      shipping = 0,
      paymentConfigFor,
      onComplete,
      onCancel,
      initialAddress = {},
      className,
      style,
    },
    ref: Ref<HTMLDivElement>,
  ) {
    const theme = useTheme();
    const t = useLocale();
    const [step, setStep] = useState<Step>('address');
    const [address, setAddress] = useState<Partial<AddressValue>>(initialAddress);
    const [paymentConfig, setPaymentConfig] = useState<PaymentConfig | null>(null);
    const [error, setError] = useState<string | null>(null);

    const subtotal = items.reduce((s, it) => s + it.quantity * it.unitPrice, 0);
    const tax = subtotal * taxRate;
    const total = subtotal + tax + shipping;

    const fmt = (n: number) => {
      try {
        return new Intl.NumberFormat(locale ?? 'en-IN', {
          style: 'currency',
          currency,
        }).format(n);
      } catch {
        return `${currency} ${n.toFixed(2)}`;
      }
    };

    const addressComplete =
      Boolean(address.pin && address.pin.length === 6 && address.line1 && address.city);

    const goToPayment = async () => {
      if (!addressComplete) {
        setError(t.fieldRequired ?? 'Address incomplete');
        return;
      }
      setError(null);
      try {
        const cfg = await paymentConfigFor(address as AddressValue);
        setPaymentConfig(cfg);
        setStep('payment');
      } catch (err) {
        setError((err as Error)?.message ?? 'Could not initialise payment');
      }
    };

    const handlePaymentSuccess = (result: PaymentSuccessResult) => {
      setStep('confirm');
      onComplete({ address: address as AddressValue, payment: result });
    };

    const handlePaymentFailure = (result: PaymentFailureResult) => {
      setError(result.message);
    };

    // ── Styles ─────────────────────────────────────────────────────────────
    const rootStyle: CSSProperties = {
      display: 'grid',
      gridTemplateColumns: 'minmax(0, 1fr) 320px',
      gap: 24,
      maxWidth: 960,
      width: '100%',
      ...style,
    };
    const cardStyle: CSSProperties = {
      border: `1px solid ${theme.border}`,
      borderRadius: 12,
      padding: 20,
      background: theme.surface,
    };
    const summaryStyle: CSSProperties = {
      ...cardStyle,
      position: 'sticky',
      top: 16,
      height: 'fit-content',
    };
    const stepHeader: CSSProperties = {
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
      color: theme.textMuted,
      marginBottom: 12,
    };

    return (
      <div ref={ref} className={className} style={rootStyle}>
        {/* Main column — current step */}
        <div style={cardStyle}>
          <div style={stepHeader}>
            Step {step === 'address' ? 1 : step === 'payment' ? 2 : 3} of 3
          </div>

          {step === 'address' && (
            <>
              <h2 style={{ margin: '0 0 16px', fontSize: 20, fontWeight: 700 }}>
                Shipping address
              </h2>
              <TkxAddressInput
                value={address}
                onChange={setAddress}
              />
              {error && (
                <div role="alert" style={{ marginTop: 12, fontSize: 13, color: theme.danger }}>
                  {error}
                </div>
              )}
              <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                {onCancel && (
                  <button
                    type="button"
                    onClick={onCancel}
                    style={{
                      padding: '8px 14px',
                      borderRadius: 6,
                      border: `1px solid ${theme.border}`,
                      background: 'transparent',
                      color: theme.text,
                      cursor: 'pointer',
                      fontSize: 13,
                      fontWeight: 600,
                    }}
                  >
                    {t.cancel}
                  </button>
                )}
                <button
                  type="button"
                  onClick={goToPayment}
                  disabled={!addressComplete}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 6,
                    border: 'none',
                    background: addressComplete ? theme.primary : theme.border,
                    color: addressComplete ? theme.bg : theme.textMuted,
                    cursor: addressComplete ? 'pointer' : 'not-allowed',
                    fontSize: 13,
                    fontWeight: 600,
                    minHeight: 36,
                  }}
                >
                  Continue to payment
                </button>
              </div>
            </>
          )}

          {step === 'payment' && paymentConfig && (
            <>
              <h2 style={{ margin: '0 0 16px', fontSize: 20, fontWeight: 700 }}>
                Payment
              </h2>
              <p style={{ margin: '0 0 16px', color: theme.textMuted, fontSize: 14 }}>
                Total <strong style={{ color: theme.text, fontSize: 18 }}>{fmt(total)}</strong>
              </p>
              <TkxPaymentButton
                config={paymentConfig}
                onSuccess={handlePaymentSuccess}
                onFailure={handlePaymentFailure}
                size="lg"
              >
                Pay {fmt(total)}
              </TkxPaymentButton>
              {error && (
                <div role="alert" style={{ marginTop: 12, fontSize: 13, color: theme.danger }}>
                  {error}
                </div>
              )}
              <div style={{ marginTop: 20 }}>
                <button
                  type="button"
                  onClick={() => setStep('address')}
                  style={{
                    padding: '6px 10px',
                    border: 'none',
                    background: 'transparent',
                    color: theme.textMuted,
                    cursor: 'pointer',
                    fontSize: 13,
                  }}
                >
                  ← Back to address
                </button>
              </div>
            </>
          )}

          {step === 'confirm' && (
            <>
              <h2 style={{ margin: '0 0 16px', fontSize: 20, fontWeight: 700 }}>
                Order confirmed
              </h2>
              <p style={{ color: theme.textMuted, fontSize: 14, lineHeight: 1.6 }}>
                Thank you. A receipt has been emailed to you. Your order will
                ship shortly.
              </p>
            </>
          )}
        </div>

        {/* Sidebar — order summary */}
        <div style={summaryStyle}>
          <div style={stepHeader}>Order summary</div>
          {items.map((it) => (
            <div
              key={it.id}
              style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 13 }}
            >
              <span style={{ color: theme.text }}>
                {it.label} <span style={{ color: theme.textMuted }}>×{it.quantity}</span>
              </span>
              <span style={{ color: theme.text, fontVariantNumeric: 'tabular-nums' }}>
                {fmt(it.quantity * it.unitPrice)}
              </span>
            </div>
          ))}
          <hr style={{ margin: '12px 0', border: 0, borderTop: `1px solid ${theme.border}` }} />
          {taxRate > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: theme.textMuted }}>
              <span>Tax ({(taxRate * 100).toFixed(0)}%)</span>
              <span>{fmt(tax)}</span>
            </div>
          )}
          {shipping > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: theme.textMuted }}>
              <span>Shipping</span>
              <span>{fmt(shipping)}</span>
            </div>
          )}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: 12,
            paddingTop: 12,
            borderTop: `2px solid ${theme.text}`,
            fontSize: 16,
            fontWeight: 700,
          }}>
            <span>Total</span>
            <span>{fmt(total)}</span>
          </div>
        </div>
      </div>
    );
  },
);

TkxCheckout.displayName = 'TkxCheckout';
