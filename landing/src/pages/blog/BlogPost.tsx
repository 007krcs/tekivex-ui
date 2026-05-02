import { useParams, Navigate } from 'react-router-dom';
import { PageShell } from '../PageShell';
import { findPost } from './posts';
import { usePageMeta } from '../../use-page-meta';
import { JsonLd, articleSchema } from '../../JsonLd';

export function BlogPost() {
  const { slug = '' } = useParams<{ slug: string }>();
  const post = findPost(slug);
  usePageMeta(
    post ? `${post.title} — TekiVex UI engineering blog` : 'Blog — TekiVex UI',
    post?.summary,
    post ? { keywords: `tekivex, tekivex ui, ${post.tags.join(', ')}` } : undefined,
  );
  if (!post) return <Navigate to="/blog" replace />;
  const Body = post.render;
  const url = `https://ui.tekivex.com/blog/${post.slug}`;
  return (
    <>
      <JsonLd
        data={articleSchema({
          headline: post.title,
          description: post.summary,
          url,
          datePublished: post.publishedAt,
        })}
      />
      <PageShell
        title={post.title}
        eyebrow={`Blog · ${post.readingMinutes} min read`}
        subtitle={post.summary}
        breadcrumbs={[{ label: 'Blog', href: '/blog' }, { label: post.title }]}
        updated={post.publishedAt}
      >
        <Body />
      </PageShell>
    </>
  );
}
