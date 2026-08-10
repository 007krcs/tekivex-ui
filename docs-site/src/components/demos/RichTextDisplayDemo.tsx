import { TkxRichTextDisplay, type RichTextBlock } from 'tekivex-ui';
import { Preview } from '../Preview';

const BLOCKS: RichTextBlock[] = [
  { type: 'heading', level: 2, content: 'Release notes' },
  {
    type: 'paragraph',
    content:
      'Every block is sanitised before render — even this <script>alert(1)</script> tag comes out as inert text.',
  },
  {
    type: 'list',
    ordered: false,
    items: ['Faster cold start', 'New pivot table component', 'Dark-mode contrast fixes'],
  },
  { type: 'blockquote', content: 'Ship small, ship often.' },
  { type: 'code', language: 'ts', content: "const version = '3.29.0';" },
  { type: 'divider' },
  { type: 'callout', variant: 'info', content: 'Upgrade with npm install tekivex-ui@latest.' },
];

export function RichTextDisplayBasic() {
  return (
    <Preview style={{ flexDirection: 'column', alignItems: 'stretch' }}>
      <div style={{ minWidth: 320, width: '100%' }}>
        <TkxRichTextDisplay blocks={BLOCKS} />
      </div>
    </Preview>
  );
}
