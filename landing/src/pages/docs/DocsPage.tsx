import { useParams, Navigate } from 'react-router-dom';
import { PageShell } from '../PageShell';
import { findDoc } from './docs-registry';
import { usePageMeta } from '../../use-page-meta';
import { JsonLd, techArticleSchema } from '../../JsonLd';

export function DocsPage() {
  const { slug = '' } = useParams<{ slug: string }>();
  const doc = findDoc(slug);
  usePageMeta(
    doc ? `${doc.name} — TekiVex UI documentation` : 'Docs — TekiVex UI',
    doc?.summary,
    doc ? { keywords: `tekivex, tekivex ui, ${doc.name}, ${doc.category}, ${doc.pkg}, react component` } : undefined,
  );
  if (!doc) return <Navigate to="/docs" replace />;
  const Body = doc.render;
  const url = `https://ui.tekivex.com/docs/${doc.slug}`;
  return (
    <>
      <JsonLd
        data={techArticleSchema({
          headline: `${doc.name} — TekiVex UI`,
          description: doc.summary,
          url,
        })}
      />
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
    </>
  );
}
