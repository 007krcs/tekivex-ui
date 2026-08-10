import { TkxPaymentButton } from 'tekivex-ui';
import { Preview } from '../Preview';

// ─────────────────────────────────────────────────────────────────────────────
// Live demo for /components/payment-button/.
//
// The configs below are fake placeholders and every button is rendered with
// `disabled` so the provider SDK is never fetched (TkxPaymentButton only
// loads the SDK on click) and no payment flow can start. This shows the
// visual variants + sizes only.
// ─────────────────────────────────────────────────────────────────────────────

const MOCK_RAZORPAY = {
  provider: 'razorpay' as const,
  publicKey: 'rzp_test_DEMO0000000000000000',
  orderId: 'order_DEMO000000000000',
  amount: 49900, // paise
  currency: 'INR',
  brand: { name: 'TekiVex Demo Store' },
};

const MOCK_STRIPE = {
  provider: 'stripe' as const,
  publicKey: 'pk_test_DEMO000000000000000000000000',
  sessionId: 'cs_test_DEMO000000000000000000000000',
};

export function PaymentButtonVariants() {
  return (
    <Preview label="Mock config, buttons disabled — no SDK loads, no real payment">
      <TkxPaymentButton config={MOCK_RAZORPAY} onSuccess={() => {}} disabled>
        Pay ₹499
      </TkxPaymentButton>
      <TkxPaymentButton config={MOCK_STRIPE} onSuccess={() => {}} variant="outline" disabled>
        Pay with Stripe
      </TkxPaymentButton>
    </Preview>
  );
}

export function PaymentButtonSizes() {
  return (
    <Preview label="size='sm' | 'md' | 'lg' (still mock + disabled)">
      <TkxPaymentButton config={MOCK_RAZORPAY} onSuccess={() => {}} size="sm" disabled>
        Pay ₹499
      </TkxPaymentButton>
      <TkxPaymentButton config={MOCK_RAZORPAY} onSuccess={() => {}} size="md" disabled>
        Pay ₹499
      </TkxPaymentButton>
      <TkxPaymentButton config={MOCK_RAZORPAY} onSuccess={() => {}} size="lg" disabled>
        Pay ₹499
      </TkxPaymentButton>
    </Preview>
  );
}
