import { useState } from 'react';
import { TkxButton } from 'tekivex-ui';
import { Preview } from '../Preview';

// ─────────────────────────────────────────────────────────────────────────────
// Live demos for /components/button. One default export bundles every
// example so the MDX page only needs a single client:load island.
// ─────────────────────────────────────────────────────────────────────────────

export function ButtonVariants() {
  return (
    <Preview label="Variants">
      <TkxButton variant="primary">Primary</TkxButton>
      <TkxButton variant="secondary">Secondary</TkxButton>
      <TkxButton variant="outline">Outline</TkxButton>
      <TkxButton variant="ghost">Ghost</TkxButton>
      <TkxButton variant="link">Link</TkxButton>
    </Preview>
  );
}

export function ButtonSizes() {
  return (
    <Preview label="Sizes">
      <TkxButton size="sm">Small</TkxButton>
      <TkxButton size="md">Medium</TkxButton>
      <TkxButton size="lg">Large</TkxButton>
    </Preview>
  );
}

export function ButtonLoading() {
  const [busy, setBusy] = useState(false);
  return (
    <Preview label="Loading state">
      <TkxButton
        loading={busy}
        onClick={() => {
          setBusy(true);
          setTimeout(() => setBusy(false), 1500);
        }}
      >
        {busy ? 'Saving…' : 'Click to save'}
      </TkxButton>
    </Preview>
  );
}

export function ButtonColorSchemes() {
  return (
    <Preview label="Color schemes">
      <TkxButton colorScheme="primary">Primary</TkxButton>
      <TkxButton colorScheme="success">Success</TkxButton>
      <TkxButton colorScheme="warning">Warning</TkxButton>
      <TkxButton colorScheme="danger">Danger</TkxButton>
      <TkxButton colorScheme="info">Info</TkxButton>
    </Preview>
  );
}
