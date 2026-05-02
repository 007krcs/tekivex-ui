import { useParams, Navigate } from 'react-router-dom';
import { PageShell } from '../PageShell';
import { findDoc } from './docs-registry';
import { usePageMeta } from '../../use-page-meta';

export function DocsPage() {
  const { slug = '' } = useParams<{ slug: string }>();
  const doc = findDoc(slug);
  usePageMeta(
    doc ? `${doc.name} — TekiVex UI docs` : 'Docs — TekiVex UI',
    doc?.summary,
  );
  if (!doc) return <Navigate to="/docs" replace />;
  const Body = doc.render;
  return (
    <PageShell
      title={doc.name}
      eyebrow={`Docs · ${doc.category}`}
      subtitle={doc.summary}
      breadcrumbs={[{ label: 'Docs', href: '/docs' }, { label: doc.name }]}
    >
      <p style={{ color: '#888', fontSize: 13, fontFamily: 'ui-monospace, monospace' }}>
        Ships in <code>{doc.pkg}</code>
      </p>
      <Body />
    </PageShell>
  );
}
