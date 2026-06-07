import { TkxTitle, TkxText } from 'tekivex-ui';
import { Preview } from '../Preview';

export function TypographyTitles() {
  return (
    <Preview label="Title levels — h1 through h5" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
      <TkxTitle level={1}>Heading 1</TkxTitle>
      <TkxTitle level={2}>Heading 2</TkxTitle>
      <TkxTitle level={3}>Heading 3</TkxTitle>
      <TkxTitle level={4}>Heading 4</TkxTitle>
      <TkxTitle level={5}>Heading 5</TkxTitle>
    </Preview>
  );
}

export function TypographyTextStyles() {
  return (
    <Preview label="Text — strong / italic / type variants" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
      <TkxText>Default body text</TkxText>
      <TkxText strong>Strong (bold) text</TkxText>
      <TkxText italic>Italic text</TkxText>
      <TkxText type="secondary">Secondary text — for hints and helpers</TkxText>
      <TkxText type="success">Success text</TkxText>
      <TkxText type="warning">Warning text</TkxText>
      <TkxText type="danger">Danger text</TkxText>
    </Preview>
  );
}
