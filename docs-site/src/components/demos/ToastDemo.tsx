import { TkxToastProvider, useToast, TkxButton } from 'tekivex-ui';
import { Preview } from '../Preview';

// useToast() returns { toast, dismiss, dismissAll }. Each demo wraps
// its content in TkxToastProvider so toast state is scoped to that
// section of the page.

function ToastTriggers() {
  const { toast } = useToast();
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <TkxButton size="sm" variant="primary" onClick={() =>
        toast({ title: 'Saved', description: 'Your changes are live.', variant: 'success' })
      }>
        Success
      </TkxButton>
      <TkxButton size="sm" onClick={() =>
        toast({ title: 'Heads-up', description: 'Two new replies on your PR.', variant: 'info' })
      }>
        Info
      </TkxButton>
      <TkxButton size="sm" onClick={() =>
        toast({ title: 'Almost out of credits', variant: 'warning' })
      }>
        Warning
      </TkxButton>
      <TkxButton size="sm" onClick={() =>
        toast({ title: 'Upload failed', description: 'Network error — retry?', variant: 'danger' })
      }>
        Danger
      </TkxButton>
    </div>
  );
}

export function ToastBasic() {
  return (
    <Preview label="Click a button to fire a toast (top-right by default)">
      <TkxToastProvider position="top-right">
        <ToastTriggers />
      </TkxToastProvider>
    </Preview>
  );
}

// Backwards-compat alias so any existing reference to ToastTrigger
// (old export name) still resolves.
export const ToastTrigger = ToastBasic;
