import { useState } from 'react';
import { TkxConfetti, TkxButton } from 'tekivex-ui';
import type { Story } from '../src/types';

function ConfettiStory(p: any) {
  const [trigger, setTrigger] = useState(0);
  return (
    <>
      <TkxButton onClick={() => setTrigger((t) => t + 1)}>
        🎉 Fire confetti
      </TkxButton>
      <TkxConfetti
        trigger={trigger}
        particleCount={p.particleCount}
        spread={p.spread}
      />
    </>
  );
}

export const confetti: Story = {
  name: 'TkxConfetti',
  description: 'Celebration burst — pure canvas, no deps.',
  controls: {
    particleCount: { type: 'number', default: 80, min: 10, max: 300, step: 10 },
    spread: { type: 'number', default: 60, min: 20, max: 180, step: 5 },
  },
  render: (p) => <ConfettiStory {...p} />,
};
