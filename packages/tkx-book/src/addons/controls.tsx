// Refactor of the original Controls panel into an Addon. Same UX as before;
// just lives behind the addon API now so the bottom panel can host
// multiple tabs.

import { Controls } from '../Controls';
import type { Addon, AddonContext } from './registry';

function ControlsTab({ story, props }: AddonContext) {
  // Controls reaches up via a ref-callback pattern handled in Book.tsx —
  // the addon receives current props and writes back through the same
  // dispatcher. We expose a CustomEvent channel for that.
  const onChange = (next: Record<string, any>) => {
    window.dispatchEvent(new CustomEvent('tkx-book-props-change', { detail: next }));
  };

  return (
    <div style={{ height: '100%', overflow: 'auto' }}>
      <Controls controls={story.controls} values={props} onChange={onChange} />
    </div>
  );
}

export const ControlsAddon: Addon = {
  id: 'controls',
  title: 'Controls',
  render: (ctx) => <ControlsTab {...ctx} />,
};
