import { TkxTitle } from 'tekivex-ui';
import { Preview } from '../Preview';

export function TitleAllLevels() {
  return (
    <Preview label="All 5 title levels" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
      <TkxTitle level={1}>H1 — Page title</TkxTitle>
      <TkxTitle level={2}>H2 — Section</TkxTitle>
      <TkxTitle level={3}>H3 — Sub-section</TkxTitle>
      <TkxTitle level={4}>H4 — Group</TkxTitle>
      <TkxTitle level={5}>H5 — Subgroup</TkxTitle>
    </Preview>
  );
}

export function TitleColored() {
  return (
    <Preview label="Type variants" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
      <TkxTitle level={3} type="default">Default</TkxTitle>
      <TkxTitle level={3} type="secondary">Secondary</TkxTitle>
      <TkxTitle level={3} type="success">Success</TkxTitle>
      <TkxTitle level={3} type="warning">Warning</TkxTitle>
      <TkxTitle level={3} type="danger">Danger</TkxTitle>
    </Preview>
  );
}
