import { useParams, Navigate } from 'react-router-dom';
import { PageShell } from '../PageShell';
import { findDoc } from './docs-registry';
import { usePageMeta } from '../../use-page-meta';
import { JsonLd, techArticleSchema } from '../../JsonLd';

// Slugs that have a real Astro /components/<slug>/ page in docs-site.
// Source of truth: `ls docs-site/src/content/docs/components/*.mdx`.
// Kept in sync manually with AllComponents.tsx's DOCUMENTED_SLUGS set.
// Of the 10 /docs/<slug> entries in docs-registry.ts:
//   ✓ button, card, badge, input, avatar, alert       — have docs-site pages
//   ✗ form-builder, flow-chart, spreadsheet, data-explorer — no docs-site page yet
const ASTRO_HAS_PAGE = new Set([
  'button', 'card', 'badge', 'input', 'avatar', 'alert',
]);

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
  const url = `https://www.tekivex.com/ui/docs/${doc.slug}`;
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

        {/* Cross-link to the deeper docs surfaces — ONLY when the targets
            really exist:
              - /components/<slug>/ (Astro Starlight) — emit only if the
                slug is in ASTRO_HAS_PAGE. Audit caught 4 dead links here
                (form-builder, flow-chart, spreadsheet, data-explorer have
                no .mdx yet); we skip the chip rather than ship a 404.
              - /playground/#/components/<slug> — the demo SPA at
                /playground/ is HASH-ROUTED, not path-routed. Linking to
                /playground/components/<slug> loads the SPA but the SPA's
                hash router sees an empty hash and renders HomePage instead.
                Hash-route form is what actually works. */}
        {(ASTRO_HAS_PAGE.has(doc.slug)) && (
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
            <a href={`/components/${doc.slug}/`} style={{ color: 'var(--tk-prose-link)', textDecoration: 'none', fontWeight: 600 }}>
              /components/{doc.slug}/ →
            </a>
            <span style={{ color: '#475569' }}>(full Props + live demos)</span>
            <a href={`/playground/#/components/${doc.slug}`} style={{ color: 'var(--tk-prose-link)', textDecoration: 'none', fontWeight: 600 }}>
              /playground →
            </a>
            <span style={{ color: '#475569' }}>(interactive sandbox)</span>
          </div>
        )}

        <Body />
      </PageShell>
    </>
  );
}
