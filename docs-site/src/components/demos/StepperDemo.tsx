import { useState } from 'react';
import { TkxStepper, TkxButton } from 'tekivex-ui';
import { Preview } from '../Preview';

const steps = [
  { id: 'profile', label: 'Profile', description: 'Tell us about yourself' },
  { id: 'plan',    label: 'Plan',    description: 'Pick your subscription' },
  { id: 'payment', label: 'Payment', description: 'Card or bank' },
  { id: 'review',  label: 'Review',  description: 'Confirm and submit' },
];

export function StepperHorizontal() {
  const [active, setActive] = useState(0);
  return (
    <Preview label="Horizontal" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
      <TkxStepper steps={steps} active={active} onChange={setActive} />
      <div style={{ marginTop: 16, display: 'flex', gap: 8, justifyContent: 'space-between' }}>
        <TkxButton
          size="sm"
          variant="ghost"
          disabled={active === 0}
          onClick={() => setActive((a) => Math.max(0, a - 1))}
        >
          ← Back
        </TkxButton>
        <TkxButton
          size="sm"
          disabled={active === steps.length - 1}
          onClick={() => setActive((a) => Math.min(steps.length - 1, a + 1))}
        >
          Next →
        </TkxButton>
      </div>
    </Preview>
  );
}

export function StepperVertical() {
  return (
    <Preview label="Vertical with state mix" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
      <TkxStepper
        orientation="vertical"
        steps={[
          { id: '1', label: 'Profile', state: 'completed' },
          { id: '2', label: 'Plan',    state: 'completed' },
          { id: '3', label: 'Payment', state: 'error', description: 'Card declined' },
          { id: '4', label: 'Review',  state: 'pending' },
        ]}
        active={2}
      />
    </Preview>
  );
}
