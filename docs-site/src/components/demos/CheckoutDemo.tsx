import { TkxCheckout } from 'tekivex-ui';
import { Preview } from '../Preview';

// ─────────────────────────────────────────────────────────────────────────────
// Live demo for /components/checkout/.
//
// Everything is mocked: the line items are fake, and `paymentConfigFor`
// intentionally throws instead of building a provider config, so the flow
// stops at "Continue to payment" with a clear demo message. No payment SDK
// is ever loaded and no transaction can occur.
// ─────────────────────────────────────────────────────────────────────────────

const MOCK_ITEMS = [
  { id: 'sku-tee', label: 'TekiVex T-shirt', quantity: 2, unitPrice: 499 },
  { id: 'sku-mug', label: 'Quantum mug', quantity: 1, unitPrice: 349 },
  { id: 'sku-stickers', label: 'Sticker pack', quantity: 3, unitPrice: 99 },
];

export function CheckoutMock() {
  return (
    <Preview
      label="Mock data — no real transaction. The payment step is disabled in this demo."
      style={{ flexDirection: 'column', alignItems: 'stretch' }}
    >
      <div style={{ width: '100%' }}>
        <TkxCheckout
          items={MOCK_ITEMS}
          currency="INR"
          taxRate={0.18}
          shipping={49}
          paymentConfigFor={() => {
            // In a real app this returns a PaymentConfig built from a
            // server-created order. The docs demo deliberately refuses.
            throw new Error(
              'Demo checkout — payments are disabled here. In your app, return a PaymentConfig from your server.',
            );
          }}
          onComplete={() => {
            /* unreachable in the demo — payment step never initialises */
          }}
          style={{ gridTemplateColumns: 'minmax(0, 1fr) 260px' }}
        />
      </div>
    </Preview>
  );
}
