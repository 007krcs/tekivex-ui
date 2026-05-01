import { useNavigate, useParams } from 'react-router-dom';
import {
  TkxLayout,
  TkxCard,
  TkxRazorpayCheckout,
  TkxCaptcha,
  TkxHoneypot,
  useTheme,
  useToast,
} from 'tekivex-ui';
import { issueMath } from 'tekivex-ui/biodata';
import { useMemo, useState } from 'react';
import { useBuilderStore } from '../stores/builderStore';
import { ENV } from '../lib/env';
import { api } from '../lib/api';

/**
 * Payment + bot-gating step. Phase 6 wires up the real backend flow:
 *   1. Solve native captcha → server issues an order id
 *   2. Razorpay checkout
 *   3. Server verifies the signature
 *   4. Server returns a one-time signed download URL
 *   5. Redirect to /success/:draftId with the URL in store
 */
export function PayPage() {
  const { draftId = '' } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const toast = useToast();
  const { markPaid } = useBuilderStore();
  const [captchaCleared, setCaptchaCleared] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [honeypot, setHoneypot] = useState('');

  const captcha = useMemo(() => issueMath(), []);

  const startCheckout = async () => {
    if (honeypot) {
      // Bot detected — silently noop.
      return;
    }
    try {
      const order = await api.createOrder(draftId);
      setOrderId(order.orderId);
    } catch {
      toast.show({ message: 'Could not create order. Please try again.', variant: 'error' });
    }
  };

  return (
    <TkxLayout>
      <main style={{ maxWidth: 480, margin: '0 auto', padding: '16px' }}>
        <h1 style={{ color: theme.text, fontSize: '1.5rem', marginBottom: 4 }}>
          Pay ₹{(ENV.pricePaise / 100).toFixed(0)}
        </h1>
        <p style={{ color: theme.textMuted, fontSize: '0.875rem', marginBottom: 16 }}>
          One-time download. Re-download stays available for 24 hours via this
          browser.
        </p>

        <TkxHoneypot value={honeypot} onChange={setHoneypot} />

        {!captchaCleared && (
          <TkxCard style={{ padding: 16, marginBottom: 16 }}>
            <TkxCaptcha
              challenge={captcha.challenge}
              onSubmit={(answer) => {
                if (answer === captcha.answer) {
                  setCaptchaCleared(true);
                  void startCheckout();
                } else {
                  toast.show({ message: 'Captcha incorrect.', variant: 'warning' });
                }
              }}
            />
          </TkxCard>
        )}

        {captchaCleared && orderId && (
          <TkxRazorpayCheckout
            request={{
              orderId,
              amount: { minor: ENV.pricePaise, currency: 'INR' },
              description: `${ENV.brand} biodata download`,
            }}
            onResult={async (r) => {
              if (r.status !== 'success') {
                toast.show({ message: `Payment ${r.status}.`, variant: 'warning' });
                return;
              }
              try {
                await api.verifyPayment({
                  draftId,
                  orderId: r.orderId,
                  paymentId: r.paymentId,
                  signature: r.signature,
                });
                markPaid();
                navigate(`/success/${draftId}`);
              } catch {
                toast.show({
                  message: 'Verification failed. Please contact support.',
                  variant: 'error',
                });
              }
            }}
          >
            Pay ₹{(ENV.pricePaise / 100).toFixed(0)} via Razorpay
          </TkxRazorpayCheckout>
        )}
      </main>
    </TkxLayout>
  );
}
