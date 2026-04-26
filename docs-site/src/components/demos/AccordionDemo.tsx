import { TkxAccordion, TkxAccordionItem, TkxBadge } from 'tekivex-ui';
import { Preview } from '../Preview';

export function AccordionBasic() {
  return (
    <Preview style={{ flexDirection: 'column', alignItems: 'stretch' }}>
      <div style={{ minWidth: 360 }}>
        <TkxAccordion>
          <TkxAccordionItem id="profile" title="Profile settings">
            Edit your name, photo, and bio.
          </TkxAccordionItem>
          <TkxAccordionItem id="notifications" title="Notifications">
            Email and in-app notification preferences.
          </TkxAccordionItem>
          <TkxAccordionItem id="security" title="Security">
            Two-factor authentication, sessions, recovery codes.
          </TkxAccordionItem>
        </TkxAccordion>
      </div>
    </Preview>
  );
}

export function AccordionMultiple() {
  return (
    <Preview label='expandMode="multiple"' style={{ flexDirection: 'column', alignItems: 'stretch' }}>
      <div style={{ minWidth: 360 }}>
        <TkxAccordion expandMode="multiple" defaultOpen={['a', 'b']}>
          <TkxAccordionItem id="a" title="First panel (open by default)">
            Multiple panels open at once.
          </TkxAccordionItem>
          <TkxAccordionItem id="b" title="Second panel (also open)">
            Useful for FAQ-style listings.
          </TkxAccordionItem>
          <TkxAccordionItem id="c" title="Third panel (closed)">
            Click to expand without closing the others.
          </TkxAccordionItem>
        </TkxAccordion>
      </div>
    </Preview>
  );
}

export function AccordionWithBadge() {
  return (
    <Preview label="Composed title" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
      <div style={{ minWidth: 360 }}>
        <TkxAccordion>
          <TkxAccordionItem
            id="messages"
            title={
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                Messages
                <TkxBadge variant="primary" size="sm">3</TkxBadge>
              </span>
            }
          >
            Three new messages waiting for review.
          </TkxAccordionItem>
        </TkxAccordion>
      </div>
    </Preview>
  );
}
