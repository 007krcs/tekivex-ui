import { TkxCard, TkxCardHeader, TkxCardBody, TkxCardFooter, TkxButton, TkxBadge } from 'tekivex-ui';
import { Preview } from '../Preview';

export function CardVariants() {
  return (
    <Preview style={{ flexDirection: 'column' }}>
      <TkxCard>
        <TkxCardBody>Default surface — clean and minimal.</TkxCardBody>
      </TkxCard>
      <TkxCard variant="outlined">
        <TkxCardBody>Outlined — border-only.</TkxCardBody>
      </TkxCard>
      <TkxCard variant="elevated">
        <TkxCardBody>Elevated — drop-shadow lift.</TkxCardBody>
      </TkxCard>
    </Preview>
  );
}

export function CardWithHeaderFooter() {
  return (
    <Preview label="Header + body + footer">
      <div style={{ minWidth: 360 }}>
        <TkxCard>
          <TkxCardHeader
            title="Account settings"
            subtitle="Update your profile details"
          />
          <TkxCardBody>
            Name, email, password, two-factor authentication, and connected
            services. Changes save automatically.
          </TkxCardBody>
          <TkxCardFooter>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <TkxButton variant="ghost">Cancel</TkxButton>
              <TkxButton variant="primary">Save changes</TkxButton>
            </div>
          </TkxCardFooter>
        </TkxCard>
      </div>
    </Preview>
  );
}

export function CardWithBadge() {
  return (
    <Preview label="Composed with other components">
      <div style={{ minWidth: 320 }}>
        <TkxCard variant="outlined">
          <TkxCardHeader
            title="API key"
            subtitle="rotates every 90 days"
            action={<TkxBadge variant="success">active</TkxBadge>}
          />
          <TkxCardBody>
            <code style={{ fontFamily: 'ui-monospace, monospace', fontSize: 12 }}>
              tkx_•••••••••••••••••8a3f
            </code>
          </TkxCardBody>
        </TkxCard>
      </div>
    </Preview>
  );
}
