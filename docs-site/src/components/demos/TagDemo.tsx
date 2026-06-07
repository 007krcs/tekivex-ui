import { useState } from 'react';
import { TkxTag } from 'tekivex-ui';
import { Preview } from '../Preview';

export function TagBasic() {
  return (
    <Preview label="Default tags">
      <TkxTag>react</TkxTag>
      <TkxTag>typescript</TkxTag>
      <TkxTag>wcag</TkxTag>
      <TkxTag>open-source</TkxTag>
    </Preview>
  );
}

export function TagVariants() {
  return (
    <Preview label="Variants">
      <TkxTag variant="default">default</TkxTag>
      <TkxTag variant="primary">primary</TkxTag>
      <TkxTag variant="success">success</TkxTag>
      <TkxTag variant="warning">warning</TkxTag>
      <TkxTag variant="danger">danger</TkxTag>
      <TkxTag variant="info">info</TkxTag>
    </Preview>
  );
}

export function TagSizes() {
  return (
    <Preview label="Sizes">
      <TkxTag size="sm" variant="primary">sm</TkxTag>
      <TkxTag size="md" variant="primary">md</TkxTag>
      <TkxTag size="lg" variant="primary">lg</TkxTag>
    </Preview>
  );
}

export function TagClosable() {
  const [tags, setTags] = useState(['react', 'typescript', 'tekivex-ui', 'wcag']);
  return (
    <Preview label="Closable — click × to remove" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {tags.length === 0 && <span style={{ fontSize: 12, color: '#475569' }}>All tags removed — refresh to reset.</span>}
        {tags.map((t) => (
          <TkxTag
            key={t}
            variant="primary"
            closable
            onClose={() => setTags(tags.filter((x) => x !== t))}
          >
            {t}
          </TkxTag>
        ))}
      </div>
    </Preview>
  );
}
