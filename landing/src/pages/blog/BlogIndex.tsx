import { Link } from 'react-router-dom';
import { PageShell } from '../PageShell';
import { blogIndex } from './posts';
import { usePageMeta } from '../../use-page-meta';

export const meta = {
  title: 'Engineering blog — TekiVex UI',
  description:
    'Deep dives, postmortems, and pattern writeups from building the TekiVex UI library and 3D toolkit.',
};

export function BlogIndex() {
  usePageMeta(meta.title, meta.description);
  const posts = blogIndex();
  return (
    <PageShell
      title="Engineering blog"
      eyebrow="Blog"
      subtitle="Deep dives, postmortems, and pattern writeups from building the TekiVex UI library and 3D toolkit."
      breadcrumbs={[{ label: 'Blog' }]}
    >
      <p>
        These are the engineering decisions behind the components — why we picked certain
        architectures, what bugs forced rewrites, what we'd do differently next time. Long
        enough to be useful, short enough to read on a coffee break. New posts every couple
        of weeks.
      </p>

      <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 24 }}>
        {posts.map((p) => (
          <article
            key={p.slug}
            style={{
              padding: 20,
              borderRadius: 12,
              background: 'rgba(18, 20, 38, 0.55)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <div style={{ fontSize: 12, color: '#888', display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 8 }}>
              <time dateTime={p.publishedAt}>
                {new Date(p.publishedAt).toLocaleDateString('en', { year: 'numeric', month: 'long', day: 'numeric' })}
              </time>
              <span>·</span>
              <span>{p.readingMinutes} min read</span>
              <span>·</span>
              <span>{p.tags.join(' · ')}</span>
            </div>
            <h2 style={{ margin: '0 0 8px', fontSize: '1.4rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
              <Link to={`/blog/${p.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                {p.title}
              </Link>
            </h2>
            <p style={{ margin: '0 0 12px', color: '#b8b8d4', fontSize: 14, lineHeight: 1.6 }}>
              {p.summary}
            </p>
            <Link
              to={`/blog/${p.slug}`}
              style={{ color: '#00f5d4', fontWeight: 600, fontSize: 13, textDecoration: 'none' }}
            >
              Read the post →
            </Link>
          </article>
        ))}
      </div>
    </PageShell>
  );
}
