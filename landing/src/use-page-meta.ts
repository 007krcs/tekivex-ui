// ─────────────────────────────────────────────────────────────────────────────
// usePageMeta — sets document.title + meta description + canonical URL +
// Open Graph + Twitter Card for the current route. AdSense and search
// crawlers read these on every page; without per-route updates, every URL
// would inherit index.html's defaults and Google would treat them as
// near-duplicates.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect } from 'react';

const SITE_ORIGIN = 'https://ui.tekivex.com';

export function usePageMeta(title: string, description?: string, opts?: { keywords?: string; image?: string }) {
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

    // Canonical URL — always set to the current path on the public origin.
    // This kills "duplicate content" penalties when Google sees the page via
    // utm-tagged or trailing-slash variants.
    const canonicalHref = `${SITE_ORIGIN}${window.location.pathname}`;
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    let prevCanonical: string | null = null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    prevCanonical = canonical.href;
    canonical.href = canonicalHref;

    if (opts?.keywords) setMeta('keywords', opts.keywords);

    // Open Graph + Twitter Card so social shares pick up the right title
    setMeta('og:title', title);
    setMeta('og:url', canonicalHref);
    if (description) setMeta('og:description', description);
    setMeta('og:type', 'website');
    if (opts?.image) setMeta('og:image', opts.image);
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', title);
    if (description) setMeta('twitter:description', description);
    if (opts?.image) setMeta('twitter:image', opts.image);

    return () => {
      document.title = previous;
      if (descTag && prevDesc !== null) descTag.content = prevDesc;
      if (canonical && prevCanonical) canonical.href = prevCanonical;
    };
  }, [title, description, opts?.keywords, opts?.image]);
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
