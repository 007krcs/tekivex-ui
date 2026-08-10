import { seoSchema, type TkxSEOProps } from 'tekivex-ui';
import { Preview } from '../Preview';

// ─────────────────────────────────────────────────────────────────────────────
// Demo for /components/seo/.
//
// TkxSEO renders nothing visible — it writes tags into document.head. Actually
// mounting it here would overwrite THIS docs page's real meta tags, so this
// demo is a static illustration instead: the props on the left, and the exact
// tags TkxSEO would write (same mapping as the component) rendered as text.
// The JSON-LD block is computed with the library's real `seoSchema` helper.
// ─────────────────────────────────────────────────────────────────────────────

const DEMO_PROPS: TkxSEOProps = {
  title: 'Acme Dashboard — Reports',
  description: 'Monthly usage reports for your Acme workspace.',
  canonical: 'https://app.example.com/reports',
  image: 'https://app.example.com/og/reports.png',
  twitterSite: '@acme',
  ogType: 'website',
  locale: 'en_US',
};

const DEMO_SCHEMA = seoSchema.softwareApplication({
  name: 'Acme Dashboard',
  description: 'Usage analytics for Acme workspaces.',
  url: 'https://app.example.com',
  version: '2.1.0',
});

// Mirrors TkxSEO's own head-writing order: title/description/robots, then
// Open Graph, then Twitter, then canonical, then JSON-LD.
const RESULTING_TAGS = `document.title = ${JSON.stringify(DEMO_PROPS.title)}

<meta name="description" content="${DEMO_PROPS.description}">
<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large">

<meta property="og:title" content="${DEMO_PROPS.title}">
<meta property="og:description" content="${DEMO_PROPS.description}">
<meta property="og:type" content="${DEMO_PROPS.ogType}">
<meta property="og:url" content="${DEMO_PROPS.canonical}">
<meta property="og:image" content="${DEMO_PROPS.image}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:locale" content="${DEMO_PROPS.locale}">

<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${DEMO_PROPS.title}">
<meta name="twitter:description" content="${DEMO_PROPS.description}">
<meta name="twitter:image" content="${DEMO_PROPS.image}">
<meta name="twitter:site" content="${DEMO_PROPS.twitterSite}">

<link rel="canonical" href="${DEMO_PROPS.canonical}">

<script type="application/ld+json">
${JSON.stringify(DEMO_SCHEMA, null, 2)}
</script>`;

const paneStyle = {
  fontSize: 12,
  color: 'var(--sl-color-gray-2, #4b5563)',
  background: 'var(--sl-color-gray-6, rgba(127,127,127,0.08))',
  padding: 12,
  borderRadius: 6,
  overflow: 'auto' as const,
  lineHeight: 1.6,
  margin: 0,
};

export function SeoTagPreview() {
  return (
    <Preview
      label="Static illustration — this panel does NOT modify this page's head"
      style={{ flexDirection: 'column', alignItems: 'stretch' }}
    >
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Props passed to &lt;TkxSEO /&gt;</div>
          <pre style={paneStyle}>{JSON.stringify(DEMO_PROPS, null, 2)}</pre>
        </div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
            Tags TkxSEO writes into document.head (data-tkx-seo flagged; JSON-LD via the real seoSchema helper)
          </div>
          <pre style={paneStyle}>{RESULTING_TAGS}</pre>
        </div>
      </div>
    </Preview>
  );
}
