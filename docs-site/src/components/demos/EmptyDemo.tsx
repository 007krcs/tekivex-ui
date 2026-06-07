import { TkxEmpty, TkxButton } from 'tekivex-ui';
import { Preview } from '../Preview';

export function EmptyBasic() {
  return (
    <Preview label="Default — no description">
      <TkxEmpty />
    </Preview>
  );
}

export function EmptyWithDescription() {
  return (
    <Preview label="With description">
      <TkxEmpty description="No invoices yet. Create your first one to get started." />
    </Preview>
  );
}

export function EmptyWithCTA() {
  return (
    <Preview label="With call-to-action button">
      <TkxEmpty description="Your inbox is clean.">
        <TkxButton variant="primary">Compose new message</TkxButton>
      </TkxEmpty>
    </Preview>
  );
}

export function EmptySimple() {
  return (
    <Preview label="Simpler image variant">
      <TkxEmpty image="simple" description="No search results — try a different keyword." />
    </Preview>
  );
}
