import { TkxAccordion, TkxBadge } from 'tekivex-ui';
import { Preview } from '../Preview';

// v3 API: TkxAccordion takes an `items` prop (array of { id, title, content,
// disabled? }), not nested <TkxAccordionItem> JSX children. The legacy demo
// has been rewritten to match the published 3.0.x API.

export function AccordionBasic() {
  return (
    <Preview style={{ flexDirection: 'column', alignItems: 'stretch' }}>
      <div style={{ minWidth: 360 }}>
        <TkxAccordion
          items={[
            {
              id: 'profile',
              title: 'Profile settings',
              content: 'Edit your name, photo, and bio.',
            },
            {
              id: 'notifications',
              title: 'Notifications',
              content: 'Email and in-app notification preferences.',
            },
            {
              id: 'security',
              title: 'Security',
              content: 'Two-factor authentication, sessions, recovery codes.',
            },
          ]}
        />
      </div>
    </Preview>
  );
}

export function AccordionMultiple() {
  return (
    <Preview label='expandMode="multiple"' style={{ flexDirection: 'column', alignItems: 'stretch' }}>
      <div style={{ minWidth: 360 }}>
        <TkxAccordion
          expandMode="multiple"
          defaultOpen={['a', 'b']}
          items={[
            { id: 'a', title: 'First panel (open by default)', content: 'Multiple panels open at once.' },
            { id: 'b', title: 'Second panel (also open)', content: 'Useful for FAQ-style listings.' },
            { id: 'c', title: 'Third panel (closed)', content: 'Click to expand without closing the others.' },
          ]}
        />
      </div>
    </Preview>
  );
}

export function AccordionWithBadge() {
  return (
    <Preview label="Composed title" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
      <div style={{ minWidth: 360 }}>
        <TkxAccordion
          items={[
            {
              id: 'messages',
              title: (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  Messages
                  <TkxBadge variant="primary" size="sm">3</TkxBadge>
                </span>
              ),
              content: 'Three new messages waiting for review.',
            },
          ]}
        />
      </div>
    </Preview>
  );
}
