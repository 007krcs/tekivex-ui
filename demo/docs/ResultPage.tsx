import type { ThemeTokens } from '@tekivex/ui';
import { TkxResult, TkxButton } from '@tekivex/ui';
import { DemoSection } from '../layout/DemoSection';
import { PropTable } from '../layout/PropTable';

const RESULT_PROPS = [
  { name: 'status', type: "'success' | 'error' | 'warning' | 'info' | '404' | '403' | '500'", default: '—', description: 'Determines the icon, color, and semantic meaning of the result state.', required: true },
  { name: 'title', type: 'string', default: '—', description: 'Primary heading text shown below the icon.', required: true },
  { name: 'subTitle', type: 'string', default: 'undefined', description: 'Secondary descriptive text shown below the title.' },
  { name: 'icon', type: 'ReactNode', default: 'undefined', description: 'Override the default status icon with a custom node.' },
  { name: 'extra', type: 'ReactNode', default: 'undefined', description: 'Action area rendered below the subtitle — typically buttons.' },
];

export function ResultPage({ theme }: { theme: ThemeTokens }) {
  const divider = { height: '1px', backgroundColor: theme.border, margin: '48px 0', border: 'none' };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 32px 80px' }}>

      {/* ── Success ────────────────────────────────────────────────────── */}
      <DemoSection
        title="Success"
        description="Use after a user completes a task — payment, form submission, account activation, etc."
        theme={theme}
        code={`<TkxResult
  status="success"
  title="Payment Successful"
  subTitle="Order #2024-00987 has been confirmed. You'll receive a confirmation email shortly."
  extra={
    <>
      <TkxButton>View Order</TkxButton>
      <TkxButton variant="outline">Continue Shopping</TkxButton>
    </>
  }
/>`}
      >
        <TkxResult
          status="success"
          title="Payment Successful"
          subTitle="Order #2024-00987 has been confirmed. You'll receive a confirmation email shortly."
          extra={
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <TkxButton>View Order</TkxButton>
              <TkxButton variant="outline">Continue Shopping</TkxButton>
            </div>
          }
        />
      </DemoSection>

      <hr style={divider} />

      {/* ── Error ──────────────────────────────────────────────────────── */}
      <DemoSection
        title="Error"
        description="Shown when an operation fails. Always offer a clear recovery action."
        theme={theme}
        code={`<TkxResult
  status="error"
  title="Upload Failed"
  subTitle="Your file could not be uploaded. Check your connection and try again."
  extra={<TkxButton variant="danger">Try Again</TkxButton>}
/>`}
      >
        <TkxResult
          status="error"
          title="Upload Failed"
          subTitle="Your file could not be uploaded. Check your connection and try again."
          extra={
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <TkxButton variant="danger">Try Again</TkxButton>
              <TkxButton variant="outline">Get Help</TkxButton>
            </div>
          }
        />
      </DemoSection>

      <hr style={divider} />

      {/* ── Warning ────────────────────────────────────────────────────── */}
      <DemoSection
        title="Warning"
        description="Alerts the user to a non-blocking issue that needs their attention."
        theme={theme}
        code={`<TkxResult
  status="warning"
  title="Storage Almost Full"
  subTitle="You've used 92% of your 5 GB storage quota. Upgrade your plan to avoid interruptions."
  extra={<TkxButton>Upgrade Plan</TkxButton>}
/>`}
      >
        <TkxResult
          status="warning"
          title="Storage Almost Full"
          subTitle="You've used 92% of your 5 GB storage quota. Upgrade your plan to avoid interruptions."
          extra={
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <TkxButton>Upgrade Plan</TkxButton>
              <TkxButton variant="ghost">Manage Files</TkxButton>
            </div>
          }
        />
      </DemoSection>

      <hr style={divider} />

      {/* ── HTTP Status Pages ───────────────────────────────────────────── */}
      <DemoSection
        title="HTTP Status Pages"
        description="Built-in status codes for common HTTP error pages: 403 Forbidden, 404 Not Found, 500 Server Error."
        theme={theme}
        code={`<TkxResult status="404" title="Page Not Found"
  subTitle="The URL you requested doesn't exist."
  extra={<TkxButton>Go Home</TkxButton>}
/>

<TkxResult status="403" title="Access Denied"
  subTitle="You don't have permission to view this page."
  extra={<TkxButton>Request Access</TkxButton>}
/>

<TkxResult status="500" title="Server Error"
  subTitle="Something went wrong on our end. We're working on it."
  extra={<TkxButton>Refresh</TkxButton>}
/>`}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
          {(['404', '403', '500'] as const).map((status) => (
            <div key={status} style={{ border: `1px solid ${theme.border}`, borderRadius: 12, padding: 24 }}>
              <TkxResult
                status={status}
                title={status === '404' ? 'Not Found' : status === '403' ? 'Forbidden' : 'Server Error'}
                subTitle={status === '404' ? 'Page does not exist.' : status === '403' ? 'No permission.' : 'Something broke.'}
                extra={<div style={{ display: 'flex', justifyContent: 'center' }}><TkxButton size="sm">Go Home</TkxButton></div>}
              />
            </div>
          ))}
        </div>
      </DemoSection>

      <hr style={divider} />

      {/* ── Info ───────────────────────────────────────────────────────── */}
      <DemoSection
        title="Info"
        description="Neutral informational state — useful for empty states, feature announcements, or help prompts."
        theme={theme}
        code={`<TkxResult
  status="info"
  title="Connect Your Account"
  subTitle="Link your GitHub account to unlock CI/CD features and deploy automatically."
  extra={<TkxButton>Connect GitHub</TkxButton>}
/>`}
      >
        <TkxResult
          status="info"
          title="Connect Your Account"
          subTitle="Link your GitHub account to unlock CI/CD features and deploy automatically."
          extra={
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <TkxButton>Connect GitHub</TkxButton>
              <TkxButton variant="ghost">Learn More</TkxButton>
            </div>
          }
        />
      </DemoSection>

      <hr style={divider} />

      {/* ── Props ──────────────────────────────────────────────────────── */}
      <div style={{ marginTop: 48 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: theme.text, marginBottom: 16 }}>TkxResult Props</h3>
        <PropTable props={RESULT_PROPS} />
      </div>
    </div>
  );
}
