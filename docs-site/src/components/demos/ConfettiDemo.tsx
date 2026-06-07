import { useState } from 'react';
import { TkxConfetti, TkxButton } from 'tekivex-ui';
import { Preview } from '../Preview';

export function ConfettiBasic() {
  const [burst, setBurst] = useState(0);
  return (
    <Preview label="Click to fire a confetti burst" style={{ minHeight: 160 }}>
      <TkxButton variant="primary" onClick={() => setBurst((n) => n + 1)}>
        🎉 Fire confetti ({burst})
      </TkxButton>
      <TkxConfetti trigger={burst} particleCount={120} />
    </Preview>
  );
}
