import { Link } from 'react-router-dom';
import { PageShell } from '../PageShell';
import { docsByCategory } from './docs-registry';
import { usePageMeta } from '../../use-page-meta';

export const meta = {
  title: 'Component documentation — TekiVex UI',
  description:
    'API reference, examples, accessibility notes, and common pitfalls for every component in the TekiVex UI library.',
};

export function DocsIndex() {
  usePageMeta(meta.title, meta.description);
  const categories = docsByCategory();
  return (
    <PageShell
      title="Component documentation"
      eyebrow="Docs"
      subtitle="API reference, examples, accessibility notes, and common pitfalls for every component shipped in the library."
      breadcrumbs={[{ label: 'Docs' }]}
    >
      <p>
        These pages cover the components individually. Each one has prop signatures, a few
        usage examples, the accessibility model, and a "common pitfalls" section drawn from
        the GitHub issue tracker. If you spot something missing or wrong, file an issue on
        the public repo and we'll fix it inside a day.
      </p>

      <p>
        For a higher-level walkthrough of what's in the library and why we built it the way
        we did, the <Link to="/blog">engineering blog</Link> is a good complement. For the
        live interactive previews of every component, the directory on the home page lets
        you click any chip to open a working demo.
      </p>

      {categories.map(([category, pages]) => (
        <section key={category} style={{ marginTop: 32 }}>
          <h2>{category}</h2>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {pages.map((p) => (
              <li
                key={p.slug}
                style={{
                  padding: '12px 0',
                  // light-mode page — was rgba(255,255,255,0.06) which is invisible on white
                  borderBottom: '1px solid var(--tk-border)',
                }}
              >
                <Link
                  to={`/docs/${p.slug}`}
                  style={{
                    display: 'block',
                    textDecoration: 'none',
                    color: 'inherit',
                  }}
                >
                  {/* Was color:#fff (invisible on white) — slate-900 is ~19:1 on white */}
                  <span style={{ fontWeight: 700, color: 'var(--tk-fg)', fontSize: 15 }}>{p.name}</span>
                  {/* Was color:#666 (~5.7:1, AA but not AAA) — slate-700 is ~10:1 */}
                  <span style={{ color: 'var(--tk-fg-muted)', fontSize: 12, marginLeft: 8, fontFamily: 'ui-monospace, monospace' }}>
                    {p.pkg}
                  </span>
                  {/* Was color:#b8b8d4 light lavender — invisible on white */}
                  <p style={{ margin: '4px 0 0', color: 'var(--tk-fg-faint)', fontSize: 13 }}>
                    {p.summary}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </PageShell>
  );
}
