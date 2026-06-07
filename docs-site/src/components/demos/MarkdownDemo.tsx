import { TkxMarkdown } from 'tekivex-ui';
import { Preview } from '../Preview';

const SAMPLE_MD = `# Hello, **Markdown**

A small sample to show the renderer in action.

- Lists work
- _Italic_ and **bold**
- \`inline code\`

> Blockquotes are styled to match the design system.

\`\`\`tsx
import { TkxMarkdown } from 'tekivex-ui';

<TkxMarkdown source={mdString} />
\`\`\`

| Feature   | Supported |
|-----------|:---------:|
| Headings  | ✓         |
| Tables    | ✓         |
| Code      | ✓         |
| Sanitised | ✓         |
`;

export function MarkdownBasic() {
  return (
    <Preview label="Rendering a markdown string">
      <div style={{ width: '100%', maxWidth: 560 }}>
        <TkxMarkdown source={SAMPLE_MD} />
      </div>
    </Preview>
  );
}
