import { useParams, Navigate } from 'react-router-dom';
import { PageShell } from '../PageShell';
import { findPost } from './posts';
import { usePageMeta } from '../../use-page-meta';

export function BlogPost() {
  const { slug = '' } = useParams<{ slug: string }>();
  const post = findPost(slug);
  usePageMeta(
    post ? `${post.title} — TekiVex UI blog` : 'Blog — TekiVex UI',
    post?.summary,
  );
  if (!post) return <Navigate to="/blog" replace />;
  const Body = post.render;
  return (
    <PageShell
      title={post.title}
      eyebrow={`Blog · ${post.readingMinutes} min read`}
      subtitle={post.summary}
      breadcrumbs={[{ label: 'Blog', href: '/blog' }, { label: post.title }]}
      updated={post.publishedAt}
    >
      <Body />
    </PageShell>
  );
}
