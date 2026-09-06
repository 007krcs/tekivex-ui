// ─────────────────────────────────────────────────────────────────────────────
// usePageMeta — sets document.title + meta description + canonical URL +
// Open Graph + Twitter Card for the current route. AdSense and search
// crawlers read these on every page; without per-route updates, every URL
// would inherit index.html's defaults and Google would treat them as
// near-duplicates.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect } from 'react';

// This site's permanent public home is https://www.tekivex.com/ui (the
// www.tekivex.com/ui subdomain is retired). Canonicals always point there,
// whatever Vite base the bundle happened to be built with.
const SITE_ORIGIN = 'https://www.tekivex.com';
const CANONICAL_BASE = '/ui';
// Vite build base: '/' when built standalone, '/ui/' when vendored under
// www.tekivex.com. Stripped from the pathname so the route is base-agnostic.
const BUILD_BASE_RAW: string = import.meta.env.BASE_URL || '/';
const BUILD_BASE = BUILD_BASE_RAW.endsWith('/') ? BUILD_BASE_RAW.slice(0, -1) : BUILD_BASE_RAW;
// Default social-share card. Every route falls back to this unless it passes
// its own opts.image, so a shared link ALWAYS renders a preview image on
// WhatsApp / Slack / iMessage / Twitter / LinkedIn / Facebook.
const DEFAULT_OG_IMAGE = `${SITE_ORIGIN}${CANONICAL_BASE}/og-image.png`;

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
    const pathname = window.location.pathname;
    const route = BUILD_BASE && pathname.startsWith(BUILD_BASE) ? (pathname.slice(BUILD_BASE.length) || '/') : pathname;
    const canonicalHref = `${SITE_ORIGIN}${CANONICAL_BASE}${route}`;
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
    const ogImage = opts?.image ?? DEFAULT_OG_IMAGE;
    setMeta('og:title', title);
    setMeta('og:url', canonicalHref);
    if (description) setMeta('og:description', description);
    setMeta('og:type', 'website');
    setMeta('og:site_name', 'TekiVex UI');
    // og:image always set (default fallback) so every route has a preview card.
    setMeta('og:image', ogImage);
    setMeta('og:image:width', '1200');
    setMeta('og:image:height', '630');
    setMeta('og:image:alt', 'TekiVex UI — production-grade React component library');
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', title);
    if (description) setMeta('twitter:description', description);
    setMeta('twitter:image', ogImage);
    setMeta('twitter:site', '@007krcs');
    setMeta('twitter:creator', '@007krcs');

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
