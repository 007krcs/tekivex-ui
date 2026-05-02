// ─────────────────────────────────────────────────────────────────────────────
// JsonLd — render arbitrary JSON-LD structured data into a <script
// type="application/ld+json"> tag inside the <head>. Google reads these for
// rich results: breadcrumbs, article snippets, FAQ accordions, etc.
//
// We mount via createPortal-equivalent pattern (direct DOM append) so React
// 19's concurrent renderer doesn't fight us, and clean up on unmount so
// route changes swap the structured data correctly.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect } from 'react';

let counter = 0;

export function JsonLd({ data }: { data: object | object[] }) {
  useEffect(() => {
    const id = `tk-jsonld-${++counter}`;
    const tag = document.createElement('script');
    tag.type = 'application/ld+json';
    tag.id = id;
    tag.textContent = JSON.stringify(data);
    document.head.appendChild(tag);
    return () => {
      const existing = document.getElementById(id);
      if (existing) existing.remove();
    };
    // Intentionally serialize the data so deep-equal updates are detected.
  }, [JSON.stringify(data)]);
  return null;
}

const ORIGIN = 'https://ui.tekivex.com';

export function breadcrumbList(items: { label: string; href?: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.label,
      ...(it.href ? { item: it.href.startsWith('http') ? it.href : `${ORIGIN}${it.href}` } : {}),
    })),
  };
}

export function articleSchema(args: {
  headline: string;
  description: string;
  url: string;
  datePublished: string;
  dateModified?: string;
  authorName?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: args.headline,
    description: args.description,
    mainEntityOfPage: { '@type': 'WebPage', '@id': args.url },
    url: args.url,
    datePublished: args.datePublished,
    dateModified: args.dateModified ?? args.datePublished,
    author: { '@type': 'Person', name: args.authorName ?? 'TekiVex UI maintainers' },
    publisher: {
      '@type': 'Organization',
      name: 'TekiVex UI',
      url: ORIGIN,
      logo: { '@type': 'ImageObject', url: `${ORIGIN}/favicon.svg` },
    },
  };
}

export function techArticleSchema(args: {
  headline: string;
  description: string;
  url: string;
  proficiencyLevel?: 'Beginner' | 'Expert';
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: args.headline,
    description: args.description,
    url: args.url,
    proficiencyLevel: args.proficiencyLevel ?? 'Beginner',
    author: { '@type': 'Organization', name: 'TekiVex UI' },
    publisher: {
      '@type': 'Organization',
      name: 'TekiVex UI',
      url: ORIGIN,
      logo: { '@type': 'ImageObject', url: `${ORIGIN}/favicon.svg` },
    },
  };
}

export function faqSchema(items: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((q) => ({
      '@type': 'Question',
      name: q.question,
      acceptedAnswer: { '@type': 'Answer', text: q.answer },
    })),
  };
}
