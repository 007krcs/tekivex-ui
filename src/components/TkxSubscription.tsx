'use client';

// ─────────────────────────────────────────────────────────────────────────────
// Subscription / recurring billing helpers.
//
// Three composable components:
//
//   TkxPlanSelector       — Pricing-card grid with "Most popular" badge,
//                           feature comparison, click-to-select.
//   TkxBillingCycleToggle — Monthly ↔ Annual switch with savings indicator.
//   TkxProrationPreview   — Shows the prorated bill when changing plans
//                           mid-cycle (charge today + new recurring).
//
// All three are pure UI — they don't call any payment provider. Pair with
// TkxPaymentButton + TkxCheckout for the full flow.
// ─────────────────────────────────────────────────────────────────────────────

import {
  forwardRef,
  type CSSProperties,
  type ReactNode,
  type Ref,
} from 'react';
import { useTheme } from '../themes';

// ── Plan data shape ─────────────────────────────────────────────────────────

export type BillingCycle = 'monthly' | 'annual';

export interface SubscriptionPlan {
  id: string;
  name: string;
  /** Short tagline (e.g. "Best for individuals"). */
  tagline?: string;
  /** Per-billing-cycle prices — both required for cycle toggle. */
  prices: Record<BillingCycle, number>;
  currency: string;
  /** Locale for currency formatting. */
  locale?: string;
  features: string[];
  /** Render this plan with a "Most popular" highlight. */
  highlighted?: boolean;
  /** Disable selection (e.g. plan not available in user's region). */
  disabled?: boolean;
  /** Optional CTA label override. Defaults to "Choose <name>". */
  ctaLabel?: string;
}

function fmt(amount: number, currency: string, locale?: string) {
  try {
    return new Intl.NumberFormat(locale ?? 'en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

// ── TkxPlanSelector ─────────────────────────────────────────────────────────

export interface TkxPlanSelectorProps {
  plans: SubscriptionPlan[];
  cycle: BillingCycle;
  /** Currently selected plan id (controlled). */
  selectedId?: string;
  onSelect?: (plan: SubscriptionPlan) => void;
  /** Optional className on the grid container. */
  className?: string;
  /** Optional inline style on the grid container. */
  style?: CSSProperties;
}

export const TkxPlanSelector = forwardRef<HTMLDivElement, TkxPlanSelectorProps>(
  function TkxPlanSelector(
    { plans, cycle, selectedId, onSelect, className, style },
    ref: Ref<HTMLDivElement>,
  ) {
    const theme = useTheme();
    const gridStyle: CSSProperties = {
      display: 'grid',
      gridTemplateColumns: `repeat(auto-fit, minmax(240px, 1fr))`,
      gap: 16,
      ...style,
    };

    return (
      <div ref={ref} className={className} style={gridStyle} role="radiogroup" aria-label="Plans">
        {plans.map((plan) => {
          const selected = plan.id === selectedId;
          return (
            <button
              key={plan.id}
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={plan.disabled}
              onClick={() => !plan.disabled && onSelect?.(plan)}
              style={{
                position: 'relative',
                padding: 20,
                borderRadius: 12,
                border: `${plan.highlighted ? 2 : 1}px solid ${
                  selected ? theme.css.primary : plan.highlighted ? theme.css.primary : theme.css.border
                }`,
                background: theme.css.surface,
                color: theme.css.text,
                textAlign: 'left',
                cursor: plan.disabled ? 'not-allowed' : 'pointer',
                opacity: plan.disabled ? 0.5 : 1,
                transition: 'border-color 0.15s, transform 0.05s',
                fontFamily: 'inherit',
                fontSize: 'inherit',
                width: '100%',
              }}
            >
              {plan.highlighted && (
                <span
                  style={{
                    position: 'absolute',
                    top: -10,
                    right: 16,
                    background: theme.css.primary,
                    color: theme.css.bg,
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 4,
                    letterSpacing: 0.4,
                    textTransform: 'uppercase',
                  }}
                  aria-hidden="true"
                >
                  Most popular
                </span>
              )}
              <div style={{ fontSize: 12, fontWeight: 700, color: theme.css.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                {plan.name}
              </div>
              {plan.tagline && (
                <div style={{ fontSize: 12, color: theme.css.textMuted, marginTop: 2 }}>
                  {plan.tagline}
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 12 }}>
                <span style={{ fontSize: 32, fontWeight: 800, color: theme.css.text }}>
                  {fmt(plan.prices[cycle], plan.currency, plan.locale)}
                </span>
                <span style={{ fontSize: 12, color: theme.css.textMuted }}>
                  / {cycle === 'monthly' ? 'mo' : 'yr'}
                </span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '16px 0 0', fontSize: 13, lineHeight: 1.7 }}>
                {plan.features.map((f) => (
                  <li key={f} style={{ display: 'flex', gap: 6, alignItems: 'flex-start', color: theme.css.text }}>
                    <span aria-hidden="true" style={{ color: theme.css.success }}>✓</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <div
                style={{
                  marginTop: 16,
                  padding: '8px 12px',
                  borderRadius: 6,
                  background: selected ? theme.css.primary : 'transparent',
                  color: selected ? theme.css.bg : theme.css.primary,
                  border: `1px solid ${theme.css.primary}`,
                  textAlign: 'center',
                  fontWeight: 600,
                  fontSize: 13,
                }}
              >
                {plan.ctaLabel ?? (selected ? 'Selected' : `Choose ${plan.name}`)}
              </div>
            </button>
          );
        })}
      </div>
    );
  },
);

// ── TkxBillingCycleToggle ───────────────────────────────────────────────────

export interface TkxBillingCycleToggleProps {
  value: BillingCycle;
  onChange: (next: BillingCycle) => void;
  /** Show a savings badge on annual (e.g. "Save 20%"). */
  annualSavingsLabel?: string;
  className?: string;
  style?: CSSProperties;
}

export function TkxBillingCycleToggle({
  value,
  onChange,
  annualSavingsLabel,
  className,
  style,
}: TkxBillingCycleToggleProps) {
  const theme = useTheme();
  const wrap: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: 4,
    border: `1px solid ${theme.css.border}`,
    borderRadius: 999,
    background: theme.css.surface,
    ...style,
  };
  const segment = (active: boolean): CSSProperties => ({
    padding: '6px 16px',
    borderRadius: 999,
    fontSize: 13,
    fontWeight: 600,
    background: active ? theme.css.primary : 'transparent',
    color: active ? theme.css.bg : theme.css.text,
    border: 'none',
    cursor: 'pointer',
    transition: 'background 0.15s, color 0.15s',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
  });

  return (
    <div role="radiogroup" aria-label="Billing cycle" className={className} style={wrap}>
      <button
        type="button"
        role="radio"
        aria-checked={value === 'monthly'}
        onClick={() => onChange('monthly')}
        style={segment(value === 'monthly')}
      >
        Monthly
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={value === 'annual'}
        onClick={() => onChange('annual')}
        style={segment(value === 'annual')}
      >
        Annual
        {annualSavingsLabel && (
          <span
            style={{
              fontSize: 10,
              padding: '2px 6px',
              borderRadius: 4,
              background: value === 'annual' ? theme.css.bg : theme.css.success,
              color: value === 'annual' ? theme.css.success : theme.css.bg,
              fontWeight: 700,
            }}
          >
            {annualSavingsLabel}
          </span>
        )}
      </button>
    </div>
  );
}

// ── TkxProrationPreview ─────────────────────────────────────────────────────

export interface TkxProrationPreviewProps {
  /** Plan the customer is moving to. */
  newPlan: SubscriptionPlan;
  /** Plan they're on now. */
  currentPlan: SubscriptionPlan;
  cycle: BillingCycle;
  /** Days remaining in the current billing period. */
  daysRemaining: number;
  /** Days in the full billing cycle (typically 30 or 365). */
  cycleDays: number;
  /** Optional className. */
  className?: string;
  /** Optional inline style. */
  style?: CSSProperties;
  /** Slot under the breakdown — e.g. CTA buttons. */
  children?: ReactNode;
}

export function TkxProrationPreview({
  newPlan,
  currentPlan,
  cycle,
  daysRemaining,
  cycleDays,
  className,
  style,
  children,
}: TkxProrationPreviewProps) {
  const theme = useTheme();

  // Empty state — both plans are required to compute a proration.
  if (!newPlan?.prices || !currentPlan?.prices) {
    return (
      <div
        className={className}
        style={{
          border: `1px solid ${theme.css.border}`,
          borderRadius: 12,
          padding: 20,
          background: theme.css.surface,
          ...style,
        }}
      />
    );
  }

  const remainingFraction = cycleDays > 0 ? daysRemaining / cycleDays : 0;
  const credit = currentPlan.prices[cycle] * remainingFraction;
  const charge = newPlan.prices[cycle] * remainingFraction;
  const dueToday = Math.max(0, charge - credit);
  const refund = Math.max(0, credit - charge);

  const wrap: CSSProperties = {
    border: `1px solid ${theme.css.border}`,
    borderRadius: 12,
    padding: 20,
    background: theme.css.surface,
    ...style,
  };
  const row: CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 13,
    padding: '6px 0',
  };

  const f = (n: number) => fmt(n, newPlan.currency, newPlan.locale);

  return (
    <div className={className} style={wrap}>
      <div style={{ fontSize: 12, fontWeight: 700, color: theme.css.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>
        Plan change
      </div>

      <div style={{ ...row, color: theme.css.textMuted }}>
        <span>From <strong style={{ color: theme.css.text }}>{currentPlan.name}</strong></span>
        <span>→</span>
        <span>To <strong style={{ color: theme.css.primary }}>{newPlan.name}</strong></span>
      </div>

      <hr style={{ border: 0, borderTop: `1px solid ${theme.css.border}`, margin: '8px 0' }} />

      <div style={{ ...row, color: theme.css.textMuted }}>
        <span>Days remaining in cycle</span>
        <span>{daysRemaining} / {cycleDays}</span>
      </div>
      <div style={{ ...row, color: theme.css.textMuted }}>
        <span>Credit from {currentPlan.name}</span>
        <span>−{f(credit)}</span>
      </div>
      <div style={{ ...row, color: theme.css.textMuted }}>
        <span>Charge for {newPlan.name} (prorated)</span>
        <span>{f(charge)}</span>
      </div>

      <hr style={{ border: 0, borderTop: `1px solid ${theme.css.border}`, margin: '8px 0' }} />

      {dueToday > 0 ? (
        <div style={{ ...row, fontSize: 16, fontWeight: 700 }}>
          <span style={{ color: theme.css.text }}>Due today</span>
          <span style={{ color: theme.css.primary }}>{f(dueToday)}</span>
        </div>
      ) : (
        <div style={{ ...row, fontSize: 14, color: theme.css.success }}>
          <span>Credit applied at next billing</span>
          <span>{f(refund)}</span>
        </div>
      )}

      <div style={{ ...row, color: theme.css.textMuted, fontSize: 12, marginTop: 6 }}>
        <span>Then {f(newPlan.prices[cycle])} / {cycle === 'monthly' ? 'month' : 'year'}</span>
      </div>

      {children && <div style={{ marginTop: 16 }}>{children}</div>}
    </div>
  );
}
