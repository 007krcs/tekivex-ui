import { TkxCode } from 'tekivex-ui';
import { Preview } from '../Preview';

const SNIPPET = `interface Greeting {
  name: string;
  excited?: boolean;
}

// Build the greeting line
export function greet({ name, excited }: Greeting): string {
  const punctuation = excited ? '!' : '.';
  return \`Hello, \${name}\${punctuation}\`;
}`;

export function CodeBasic() {
  return (
    <Preview style={{ flexDirection: 'column', alignItems: 'stretch' }}>
      <div style={{ minWidth: 320, width: '100%' }}>
        <TkxCode language="ts" filename="greet.ts" code={SNIPPET} />
      </div>
    </Preview>
  );
}

export function CodeLineNumbers() {
  return (
    <Preview
      label="showLineNumbers + highlightLines"
      style={{ flexDirection: 'column', alignItems: 'stretch' }}
    >
      <div style={{ minWidth: 320, width: '100%' }}>
        <TkxCode
          language="ts"
          showLineNumbers
          highlightLines={[8, 9]}
          code={SNIPPET}
        />
      </div>
    </Preview>
  );
}
