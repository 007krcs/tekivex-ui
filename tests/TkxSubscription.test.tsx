import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  TkxPlanSelector,
  TkxBillingCycleToggle,
  TkxProrationPreview,
  type SubscriptionPlan,
} from '../src/components/TkxSubscription';
import { ThemeProvider, quantumDark } from '../src/themes';

function W({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={quantumDark}>{children}</ThemeProvider>;
}

const PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free',
    prices: { monthly: 0, annual: 0 },
    currency: 'USD',
    features: ['1 user'],
  },
  {
    id: 'pro',
    name: 'Pro',
    prices: { monthly: 29, annual: 290 },
    currency: 'USD',
    features: ['10 users'],
    highlighted: true,
  },
];

describe('TkxPlanSelector', () => {
  it('renders all plans', () => {
    render(<TkxPlanSelector plans={PLANS} cycle="monthly" />, { wrapper: W });
    expect(screen.getByText('Free')).toBeInTheDocument();
    expect(screen.getByText('Pro')).toBeInTheDocument();
  });

  it('shows "Most popular" on highlighted plan', () => {
    render(<TkxPlanSelector plans={PLANS} cycle="monthly" />, { wrapper: W });
    expect(screen.getByText(/Most popular/i)).toBeInTheDocument();
  });

  it('emits onSelect with the clicked plan', () => {
    const onSelect = vi.fn();
    render(<TkxPlanSelector plans={PLANS} cycle="monthly" onSelect={onSelect} />, { wrapper: W });
    fireEvent.click(screen.getByText('Pro'));
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 'pro' }));
  });

  it('marks selected plan with aria-checked', () => {
    render(<TkxPlanSelector plans={PLANS} cycle="monthly" selectedId="pro" />, { wrapper: W });
    const radios = screen.getAllByRole('radio');
    const proRadio = radios.find((r) => r.textContent?.includes('Pro'));
    expect(proRadio).toHaveAttribute('aria-checked', 'true');
  });

  it('does not fire onSelect when disabled', () => {
    const onSelect = vi.fn();
    const plansDisabled = [PLANS[0], { ...PLANS[1], disabled: true }];
    render(<TkxPlanSelector plans={plansDisabled} cycle="monthly" onSelect={onSelect} />, { wrapper: W });
    const proButton = screen.getAllByRole('radio')[1];
    fireEvent.click(proButton);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('switches between monthly and annual prices', () => {
    const { rerender } = render(<TkxPlanSelector plans={PLANS} cycle="monthly" />, { wrapper: W });
    expect(screen.getByText(/\$29/)).toBeInTheDocument();
    rerender(
      <ThemeProvider theme={quantumDark}>
        <TkxPlanSelector plans={PLANS} cycle="annual" />
      </ThemeProvider>,
    );
    expect(screen.getByText(/\$290/)).toBeInTheDocument();
  });
});

describe('TkxBillingCycleToggle', () => {
  it('renders monthly + annual', () => {
    render(<TkxBillingCycleToggle value="monthly" onChange={() => {}} />, { wrapper: W });
    expect(screen.getByText('Monthly')).toBeInTheDocument();
    expect(screen.getByText('Annual')).toBeInTheDocument();
  });

  it('shows savings label on annual', () => {
    render(
      <TkxBillingCycleToggle
        value="monthly"
        onChange={() => {}}
        annualSavingsLabel="Save 17%"
      />,
      { wrapper: W },
    );
    expect(screen.getByText('Save 17%')).toBeInTheDocument();
  });

  it('emits onChange when clicked', () => {
    const onChange = vi.fn();
    render(<TkxBillingCycleToggle value="monthly" onChange={onChange} />, { wrapper: W });
    fireEvent.click(screen.getByText('Annual'));
    expect(onChange).toHaveBeenCalledWith('annual');
  });

  it('marks active option with aria-checked', () => {
    render(<TkxBillingCycleToggle value="annual" onChange={() => {}} />, { wrapper: W });
    const annual = screen.getByText('Annual').closest('button');
    expect(annual).toHaveAttribute('aria-checked', 'true');
  });
});

describe('TkxProrationPreview', () => {
  it('shows credit + charge + due-today line', () => {
    render(
      <TkxProrationPreview
        currentPlan={PLANS[0]}
        newPlan={PLANS[1]}
        cycle="annual"
        daysRemaining={365}
        cycleDays={365}
      />,
      { wrapper: W },
    );
    expect(screen.getByText(/Plan change/i)).toBeInTheDocument();
    expect(screen.getByText(/Due today/i)).toBeInTheDocument();
  });

  it('zero daysRemaining → zero due', () => {
    render(
      <TkxProrationPreview
        currentPlan={PLANS[0]}
        newPlan={PLANS[1]}
        cycle="annual"
        daysRemaining={0}
        cycleDays={365}
      />,
      { wrapper: W },
    );
    // No charge because nothing is being prorated for the remaining 0 days.
    expect(screen.getByText(/Credit applied/i)).toBeInTheDocument();
  });

  it('downgrade path shows credit applied at next billing', () => {
    // Current = Pro ($290/yr), New = Free ($0/yr) — credit > charge.
    render(
      <TkxProrationPreview
        currentPlan={PLANS[1]}
        newPlan={PLANS[0]}
        cycle="annual"
        daysRemaining={180}
        cycleDays={365}
      />,
      { wrapper: W },
    );
    expect(screen.getByText(/Credit applied at next billing/i)).toBeInTheDocument();
  });

  it('upgrade path shows due today', () => {
    render(
      <TkxProrationPreview
        currentPlan={PLANS[0]}
        newPlan={PLANS[1]}
        cycle="annual"
        daysRemaining={180}
        cycleDays={365}
      />,
      { wrapper: W },
    );
    expect(screen.getByText(/Due today/i)).toBeInTheDocument();
  });
});
