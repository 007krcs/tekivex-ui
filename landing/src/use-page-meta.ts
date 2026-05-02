// ─────────────────────────────────────────────────────────────────────────────
// usePageMeta — sets document.title + the meta description for the current
// route. Crucial for AdSense (and SEO in general): the crawler reads the
// <title> + <meta name="description"> on each page to decide what the page
// is about. Without this, every route would inherit index.html's defaults.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect } from 'react';

export function usePageMeta(title: string, description?: string) {
  useEffect(() => {
    const previous = document.title;
    document.title = title;

    let descTag = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    let prevDesc: string | null = null;
    if (description) {
      if (!descTag) {
        descTag = document.createElement('meta');
        descTag.name = 'description';
        document.head.appendChild(descTag);
      }
      prevDesc = descTag.content;
      descTag.content = description;
    }

    // Open Graph + Twitter Card so social shares pick up the right title
    setMeta('og:title', title);
    if (description) setMeta('og:description', description);
    setMeta('og:type', 'website');
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', title);
    if (description) setMeta('twitter:description', description);

    return () => {
      document.title = previous;
      if (descTag && prevDesc !== null) descTag.content = prevDesc;
    };
  }, [title, description]);
}

function setMeta(property: string, content: string) {
  const isOG = property.startsWith('og:');
  const selector = isOG
    ? `meta[property="${property}"]`
    : `meta[name="${property}"]`;
  let tag = document.querySelector(selector) as HTMLMetaElement | null;
  if (!tag) {
    tag = document.createElement('meta');
    if (isOG) tag.setAttribute('property', property);
    else tag.name = property;
    document.head.appendChild(tag);
  }
  tag.content = content;
}
