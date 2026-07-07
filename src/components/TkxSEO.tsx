'use client';

// ─────────────────────────────────────────────────────────────────────────────
// TkxSEO — CLIENT-SIDE head injector for meta + Open Graph + JSON-LD schema.
//
// ⚠️ THIS RUNS CLIENT-SIDE ONLY. It writes to document.head from a useEffect,
// so the tags do NOT exist in the first-byte HTML. Crawlers that don't execute
// JavaScript (and some social-preview scrapers) will NOT see them. For an
// SSR/SSG app, put your canonical SEO in the framework's native head API
// (Next `export const metadata` / `generateMetadata`, Astro `<head>`, Remix
// `meta`) and treat TkxSEO as a *supplement* for surfaces the framework can't
// pre-render: SPA client-route changes, dashboards behind auth, embedded views.
//
// Where TkxSEO IS the right tool: a plain client-rendered React SPA (Vite/CRA)
// with no SSR — there is no server head to write to, so this is your best option.
//
// Behaviour:
//   - Writes directly to document.head; idempotent across renders. Each render
//     removes the tags it previously wrote (data-tkx-seo) before re-writing —
//     no stale accumulation. The effect keys on a stable serialization of its
//     props, so an unmemoized `schema={{...}}` object no longer rewrites the
//     head on every parent render.
//   - SSR: no-op (returns null).
//
// Supported schema factories (seoSchema.*): SoftwareApplication, Article,
// Product, FAQPage, BreadcrumbList. Pass any JSON-LD object(s) via `schema`.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useMemo } from 'react';

export interface TkxSEOProps {
  /** Page title — sets document.title and og:title. */
  title?: string;
  /** Meta description (used for description, og:description, twitter:description). */
  description?: string;
  /** Canonical URL. */
  canonical?: string;
  /** Comma-separated keyword list. */
  keywords?: string;
  /** Open Graph image URL (1200×630 recommended). */
  image?: string;
  /** Twitter handle (e.g. "@007krcs"). */
  twitterSite?: string;
  /** Twitter creator handle. */
  twitterCreator?: string;
  /** og:type — defaults to "website". */
  ogType?: 'website' | 'article' | 'product' | 'profile';
  /** Locale for og:locale (e.g. "en_US"). */
  locale?: string;
  /** Robots directive override. Defaults to index, follow. */
  robots?: string;
  /** Optional JSON-LD schema. Pass a single object or an array. */
  schema?: object | object[];

  // ── Article Open Graph (emitted only when ogType='article' or set) ──────────
  /** article:author — author name or profile URL. */
  articleAuthor?: string;
  /** article:published_time — ISO 8601 timestamp. */
  articlePublishedTime?: string;
  /** article:modified_time — ISO 8601 timestamp. */
  articleModifiedTime?: string;
  /** article:section — the high-level section (e.g. "Engineering"). */
  articleSection?: string;
  /** article:tag — one tag meta is emitted per entry. */
  articleTags?: string[];
}

const TAG_FLAG = 'data-tkx-seo';

/** Remove all SEO tags written by previous renders of any TkxSEO instance. */
function clearOwnedTags() {
  if (typeof document === 'undefined') return;
  document.querySelectorAll(`[${TAG_FLAG}]`).forEach((el) => el.remove());
}

function setMeta(name: string, value: string, attr: 'name' | 'property' = 'name') {
  if (typeof document === 'undefined' || !value) return;
  const m = document.createElement('meta');
  m.setAttribute(attr, name);
  m.content = value;
  m.setAttribute(TAG_FLAG, '1');
  document.head.appendChild(m);
}

function setLink(rel: string, href: string) {
  if (typeof document === 'undefined' || !href) return;
  const l = document.createElement('link');
  l.rel = rel;
  l.href = href;
  l.setAttribute(TAG_FLAG, '1');
  document.head.appendChild(l);
}

function setSchema(schema: object | object[]) {
  if (typeof document === 'undefined') return;
  const list = Array.isArray(schema) ? schema : [schema];
  for (const obj of list) {
    const s = document.createElement('script');
    s.type = 'application/ld+json';
    s.text = JSON.stringify(obj);
    s.setAttribute(TAG_FLAG, '1');
    document.head.appendChild(s);
  }
}

export function TkxSEO({
  title,
  description,
  canonical,
  keywords,
  image,
  twitterSite,
  twitterCreator,
  ogType = 'website',
  locale,
  robots = 'index, follow, max-snippet:-1, max-image-preview:large',
  schema,
  articleAuthor,
  articlePublishedTime,
  articleModifiedTime,
  articleSection,
  articleTags,
}: TkxSEOProps) {
  // Stable serialization so an unmemoized `schema`/`articleTags` object doesn't
  // retrigger the effect (and rewrite the whole head) on every parent render.
  const schemaKey = useMemo(() => (schema ? JSON.stringify(schema) : ''), [schema]);
  const tagsKey = useMemo(() => (articleTags ? articleTags.join('') : ''), [articleTags]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    clearOwnedTags();

    if (title) document.title = title;
    if (description) setMeta('description', description);
    if (keywords) setMeta('keywords', keywords);
    setMeta('robots', robots);

    // Open Graph
    if (title) setMeta('og:title', title, 'property');
    if (description) setMeta('og:description', description, 'property');
    setMeta('og:type', ogType, 'property');
    if (canonical) setMeta('og:url', canonical, 'property');
    if (image) {
      setMeta('og:image', image, 'property');
      setMeta('og:image:width', '1200', 'property');
      setMeta('og:image:height', '630', 'property');
    }
    if (locale) setMeta('og:locale', locale, 'property');

    // Article Open Graph — only meaningful for article pages.
    if (ogType === 'article' || articleAuthor || articlePublishedTime || articleModifiedTime || articleSection || (articleTags && articleTags.length)) {
      if (articleAuthor) setMeta('article:author', articleAuthor, 'property');
      if (articlePublishedTime) setMeta('article:published_time', articlePublishedTime, 'property');
      if (articleModifiedTime) setMeta('article:modified_time', articleModifiedTime, 'property');
      if (articleSection) setMeta('article:section', articleSection, 'property');
      (articleTags ?? []).forEach((tag) => setMeta('article:tag', tag, 'property'));
    }

    // Twitter
    setMeta('twitter:card', image ? 'summary_large_image' : 'summary');
    if (title) setMeta('twitter:title', title);
    if (description) setMeta('twitter:description', description);
    if (image) setMeta('twitter:image', image);
    if (twitterSite) setMeta('twitter:site', twitterSite);
    if (twitterCreator) setMeta('twitter:creator', twitterCreator);

    // Canonical link
    if (canonical) setLink('canonical', canonical);

    // JSON-LD
    if (schema) setSchema(schema);

    return () => clearOwnedTags();
    // schemaKey/tagsKey are stable serializations of schema/articleTags so
    // referentially-new-but-equal objects don't rewrite the head every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, description, canonical, keywords, image, twitterSite, twitterCreator, ogType, locale, robots, schemaKey, tagsKey, articleAuthor, articlePublishedTime, articleModifiedTime, articleSection]);

  return null;
}

// Pre-built schema factories for the most common page types.

export const seoSchema = {
  softwareApplication(data: {
    name: string;
    description: string;
    url: string;
    version?: string;
    license?: string;
    repository?: string;
    downloadUrl?: string;
    price?: string;
    currency?: string;
  }): object {
    return {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: data.name,
      description: data.description,
      url: data.url,
      applicationCategory: 'DeveloperApplication',
      operatingSystem: 'Web',
      ...(data.version && { softwareVersion: data.version, version: data.version }),
      ...(data.license && { license: data.license }),
      ...(data.repository && { codeRepository: data.repository }),
      ...(data.downloadUrl && { downloadUrl: data.downloadUrl }),
      ...(data.price !== undefined && {
        offers: {
          '@type': 'Offer',
          price: data.price,
          priceCurrency: data.currency ?? 'USD',
        },
      }),
    };
  },

  article(data: {
    headline: string;
    description: string;
    url: string;
    image?: string;
    author: string;
    datePublished: string;
    dateModified?: string;
  }): object {
    return {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: data.headline,
      description: data.description,
      mainEntityOfPage: data.url,
      ...(data.image && { image: data.image }),
      author: { '@type': 'Person', name: data.author },
      datePublished: data.datePublished,
      ...(data.dateModified && { dateModified: data.dateModified }),
    };
  },

  faqPage(items: Array<{ question: string; answer: string }>): object {
    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: items.map((it) => ({
        '@type': 'Question',
        name: it.question,
        acceptedAnswer: { '@type': 'Answer', text: it.answer },
      })),
    };
  },

  breadcrumbList(items: Array<{ name: string; url: string }>): object {
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items.map((it, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: it.name,
        item: it.url,
      })),
    };
  },

  product(data: {
    name: string;
    description: string;
    image: string;
    brand: string;
    sku?: string;
    price: string;
    currency: string;
    availability?: 'InStock' | 'OutOfStock' | 'PreOrder';
    rating?: { value: number; count: number };
  }): object {
    return {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: data.name,
      description: data.description,
      image: data.image,
      brand: { '@type': 'Brand', name: data.brand },
      ...(data.sku && { sku: data.sku }),
      offers: {
        '@type': 'Offer',
        price: data.price,
        priceCurrency: data.currency,
        availability: `https://schema.org/${data.availability ?? 'InStock'}`,
      },
      ...(data.rating && {
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: data.rating.value,
          reviewCount: data.rating.count,
        },
      }),
    };
  },
};
