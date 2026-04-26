import { TkxToastProvider, useToast, TkxButton } from 'tekivex-ui';
import { Preview } from '../Preview';

function Inner() {
  const toast = useToast();
  return (
    <>
      <TkxButton
        size="sm"
        onClick={() => toast({ title: 'Saved', description: 'Your changes are live.', variant: 'success' })}
      >
        Success
      </TkxButton>
      <TkxButton
        size="sm"
        onClick={() => toast({ title: 'Disk space low', description: 'Less than 5 GB remaining.', variant: 'warning' })}
      >
        Warning
      </TkxButton>
      <TkxButton
        size="sm"
        onClick={() => toast({ title: 'Connection lost', description: 'Retrying in 3s…', variant: 'danger' })}
      >
        Danger (assertive)
      </TkxButton>
      <TkxButton
        size="sm"
        onClick={() =>
          toast({
            title: 'Item deleted',
            variant: 'default',
            action: { label: 'Undo', onClick: () => toast({ title: 'Restored', variant: 'success' }) },
          })
        }
      >
        With action
      </TkxButton>
    </>
  );
}

export function ToastTrigger() {
  return (
    <Preview label="Click any button to fire a toast">
      <TkxToastProvider position="top-right">
        <Inner />
      </TkxToastProvider>
    </Preview>
  );
}
