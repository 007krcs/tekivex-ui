import { useState } from 'react';
import {
  TkxPlanSelector,
  TkxBillingCycleToggle,
  TkxProrationPreview,
  type SubscriptionPlan,
  type BillingCycle,
} from 'tekivex-ui';
import { Preview } from '../Preview';

// ─────────────────────────────────────────────────────────────────────────────
// Live demos for /components/subscription/.
//
// All three components are pure UI — they never call a payment provider —
// and the plans below are fake pricing data, so everything here is safely
// interactive with no real billing.
// ─────────────────────────────────────────────────────────────────────────────

const PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free',
    tagline: 'For individuals',
    prices: { monthly: 0, annual: 0 },
    currency: 'USD',
    features: ['1 user', '100 MB storage', 'Community support'],
  },
  {
    id: 'pro',
    name: 'Pro',
    tagline: 'For small teams',
    prices: { monthly: 29, annual: 290 },
    currency: 'USD',
    features: ['10 users', '10 GB storage', 'Priority support', 'API access'],
    highlighted: true,
  },
  {
    id: 'biz',
    name: 'Business',
    tagline: 'For growing orgs',
    prices: { monthly: 99, annual: 990 },
    currency: 'USD',
    features: ['Unlimited users', '1 TB storage', 'SAML SSO', 'Audit log'],
  },
];

export function SubscriptionPricingPage() {
  const [cycle, setCycle] = useState<BillingCycle>('annual');
  const [selected, setSelected] = useState<string>('pro');
  return (
    <Preview
      label="Mock pricing — nothing is charged. Toggle the cycle, click a plan."
      style={{ flexDirection: 'column', alignItems: 'stretch' }}
    >
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <TkxBillingCycleToggle
            value={cycle}
            onChange={setCycle}
            annualSavingsLabel="Save 17%"
          />
        </div>
        <TkxPlanSelector
          plans={PLANS}
          cycle={cycle}
          selectedId={selected}
          onSelect={(plan) => setSelected(plan.id)}
        />
      </div>
    </Preview>
  );
}

export function SubscriptionProration() {
  return (
    <Preview
      label="TkxProrationPreview — mock mid-cycle upgrade, Free → Pro"
      style={{ flexDirection: 'column', alignItems: 'stretch' }}
    >
      <div style={{ width: '100%', maxWidth: 420 }}>
        <TkxProrationPreview
          currentPlan={PLANS[0]}
          newPlan={PLANS[1]}
          cycle="annual"
          daysRemaining={142}
          cycleDays={365}
        />
      </div>
    </Preview>
  );
}
