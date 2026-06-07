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

        {/* Cross-link to the authoritative docs surfaces. The Astro
            /components/<slug>/ page has the full Props table + live demos;
            the playground SPA at /playground/components/<slug> renders an
            interactive sandbox. These exist for ALL components in
            DOCUMENTED_SLUGS — this landing /docs/ page is a lighter
            standalone view kept for the 10 components it predates. */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 12,
            padding: '12px 16px',
            margin: '8px 0 24px',
            borderRadius: 8,
            background: '#f8fafc',
            border: '1px solid #e5e7eb',
            fontSize: 13,
          }}
        >
          <strong style={{ color: '#1f2937' }}>Also at:</strong>
          <a href={`/components/${doc.slug}/`} style={{ color: '#0f766e', textDecoration: 'none', fontWeight: 600 }}>
            /components/{doc.slug}/ →
          </a>
          <span style={{ color: '#9ca3af' }}>(full Props + live demos)</span>
          <a href={`/playground/components/${doc.slug}`} style={{ color: '#0f766e', textDecoration: 'none', fontWeight: 600 }}>
            /playground →
          </a>
          <span style={{ color: '#9ca3af' }}>(interactive sandbox)</span>
        </div>

        <Body />
      </PageShell>
    </>
  );
}
