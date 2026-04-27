import { useState } from 'react';
import {
  TkxPlanSelector,
  TkxBillingCycleToggle,
  TkxProrationPreview,
  type SubscriptionPlan,
  type BillingCycle,
} from 'tekivex-ui';
import type { Story } from '../src/types';

const PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free',
    tagline: 'For individuals',
    prices: { monthly: 0, annual: 0 },
    currency: 'USD',
    features: ['1 user', '100 MB', 'Community'],
  },
  {
    id: 'pro',
    name: 'Pro',
    tagline: 'For small teams',
    prices: { monthly: 29, annual: 290 },
    currency: 'USD',
    features: ['10 users', '10 GB', 'Priority support', 'API'],
    highlighted: true,
  },
  {
    id: 'biz',
    name: 'Business',
    prices: { monthly: 99, annual: 990 },
    currency: 'USD',
    features: ['Unlimited', '1 TB', 'SSO', 'SLA'],
  },
];

function SubscriptionStory(p: any) {
  const [cycle, setCycle] = useState<BillingCycle>(p.initialCycle);
  const [selectedId, setSelectedId] = useState<string>('pro');
  const selected = PLANS.find((x) => x.id === selectedId)!;
  const current = PLANS.find((x) => x.id === 'free')!;

  return (
    <div style={{ width: '100%', maxWidth: 920 }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16 }}>
        <strong style={{ fontSize: 16 }}>Choose a plan</strong>
        <TkxBillingCycleToggle
          value={cycle}
          onChange={setCycle}
          annualSavingsLabel={p.savingsLabel || 'Save 17%'}
        />
      </div>

      <TkxPlanSelector
        plans={PLANS}
        cycle={cycle}
        selectedId={selectedId}
        onSelect={(plan) => setSelectedId(plan.id)}
      />

      {p.showProration && selected.id !== current.id && (
        <div style={{ marginTop: 24 }}>
          <TkxProrationPreview
            currentPlan={current}
            newPlan={selected}
            cycle={cycle}
            daysRemaining={p.daysRemaining}
            cycleDays={p.cycleDays}
          />
        </div>
      )}
    </div>
  );
}

export const subscription: Story = {
  name: 'Subscription (PlanSelector + Toggle + Proration)',
  description: 'Composed pricing page with billing cycle + proration preview.',
  controls: {
    initialCycle: { type: 'select', options: ['monthly', 'annual'], default: 'annual' },
    savingsLabel: { type: 'text', default: 'Save 17%' },
    showProration: { type: 'boolean', default: true },
    daysRemaining: { type: 'number', default: 142, min: 0, max: 365 },
    cycleDays: { type: 'number', default: 365, min: 30, max: 365, step: 30 },
  },
  render: (p) => <SubscriptionStory {...p} />,
};
