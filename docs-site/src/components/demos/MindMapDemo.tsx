import { TkxMindMap, type MindMapNode } from 'tekivex-ui';
import { Preview } from '../Preview';

const ROOT: MindMapNode = {
  id: 'root',
  label: 'Product',
  children: [
    {
      id: 'frontend',
      label: 'Frontend',
      children: [
        { id: 'components', label: 'Components' },
        { id: 'theming', label: 'Theming' },
        { id: 'a11y', label: 'Accessibility' },
      ],
    },
    {
      id: 'backend',
      label: 'Backend',
      children: [
        { id: 'api', label: 'REST API' },
        { id: 'db', label: 'Database' },
      ],
    },
    {
      id: 'ops',
      label: 'Ops',
      children: [{ id: 'ci', label: 'CI/CD' }],
    },
  ],
};

export function MindMapBasic() {
  return (
    <Preview
      label="Click a node to select — Enter expands/collapses, arrow keys navigate"
      style={{ flexDirection: 'column', alignItems: 'stretch' }}
    >
      <div style={{ minWidth: 320, width: '100%', overflowX: 'auto' }}>
        <TkxMindMap root={ROOT} />
      </div>
    </Preview>
  );
}
