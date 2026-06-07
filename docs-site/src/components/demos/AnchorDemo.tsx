import { TkxAnchor } from 'tekivex-ui';
import { Preview } from '../Preview';

export function AnchorBasic() {
  return (
    <Preview label="Scroll-spy anchor list">
      <TkxAnchor
        items={[
          { key: '1', href: '#intro',       title: 'Introduction' },
          { key: '2', href: '#install',     title: 'Installation' },
          { key: '3', href: '#usage',       title: 'Usage', children: [
            { key: '3a', href: '#props',  title: 'Props' },
            { key: '3b', href: '#events', title: 'Events' },
          ] },
          { key: '4', href: '#a11y',        title: 'Accessibility' },
        ]}
      />
    </Preview>
  );
}
