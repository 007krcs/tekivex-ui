# @tekivex/finance

> Financial-services vertical pack for `tekivex-ui`. KYC inputs, currency formatting, OTP, captcha, payments, subscription billing — everything a fintech or banking-adjacent app needs from a UI library.

## Install

```bash
npm install @tekivex/finance tekivex-ui
```

## Why a separate package

Same reason as `@tekivex/india`: this is a curated namespace over the financial-services subset of `tekivex-ui`. Components live in the main library and tree-shake the same way; this package gives finance-vertical apps a focused TypeScript surface.

## What's in it

### KYC + identity
- `TkxAadhaarInput` — UIDAI Verhoeff checksum
- `TkxPanInput` — Income Tax PAN format + entity check
- `TkxVoterIdInput` — Election Commission EPIC format
- `TkxDrivingLicenceInput` — Multi-state DL format with normalisation
- Standalone validators: `isValidAadhaar`, `isValidPan`, `isValidVoterId`, `isValidDrivingLicence`

### Currency + display
- `TkxCurrencyInput` — Locale-aware (lakh/crore on en-IN)
- `TkxStatistic` — Animated KPI card

### Verification flows
- `TkxPhoneInput` — E.164 with 50+ countries
- `TkxOTP` — WebOTP API auto-fill on Android Chrome
- `TkxCaptcha` — Cloudflare Turnstile / hCaptcha / reCAPTCHA wrapper

### Payments + billing
- `TkxPaymentButton` — Razorpay / Stripe / Square
- `TkxCheckout` — Composable 3-step flow (address → payment → confirm)
- `TkxPlanSelector` — Pricing-card grid with "Most popular" highlight
- `TkxBillingCycleToggle` — Monthly ↔ Annual with savings indicator
- `TkxProrationPreview` — Mid-cycle plan-change calculator

## Quick example — full subscription page

```tsx
import {
  TkxPlanSelector,
  TkxBillingCycleToggle,
  TkxPaymentButton,
} from '@tekivex/finance';

const PLANS = [
  { id: 'free',   name: 'Free',   prices: { monthly: 0,   annual: 0 },    currency: 'USD', features: ['1 user', '100 MB'] },
  { id: 'pro',    name: 'Pro',    prices: { monthly: 29,  annual: 290 },  currency: 'USD', features: ['10 users', '10 GB'], highlighted: true },
  { id: 'biz',    name: 'Business', prices: { monthly: 99, annual: 990 }, currency: 'USD', features: ['Unlimited', '1 TB'] },
];

function PricingPage() {
  const [cycle, setCycle] = useState<BillingCycle>('annual');
  const [selected, setSelected] = useState<string | null>(null);
  const plan = PLANS.find(p => p.id === selected);

  return (
    <>
      <TkxBillingCycleToggle
        value={cycle}
        onChange={setCycle}
        annualSavingsLabel="Save 17%"
      />
      <TkxPlanSelector
        plans={PLANS}
        cycle={cycle}
        selectedId={selected ?? undefined}
        onSelect={(p) => setSelected(p.id)}
      />
      {plan && (
        <TkxPaymentButton
          config={{
            provider: 'stripe',
            publicKey: env.STRIPE_PK,
            sessionId: '/* server-issued */',
          }}
          onSuccess={(r) => router.push(`/welcome?id=${r.paymentId}`)}
        />
      )}
    </>
  );
}
```

## Status

Preview. Source-available; npm publish on demand.
