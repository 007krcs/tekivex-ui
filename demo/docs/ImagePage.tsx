import { useState } from 'react';
import type { ThemeTokens } from '@tekivex/ui';
import {
  TkxImage,
} from '@tekivex/ui';
import { DemoSection } from '../layout/DemoSection';
import { PropTable } from '../layout/PropTable';
import { WCAGBadge, WCAGBadgeGroup } from '../layout/WCAGBadge';

// ── Prop definitions ──────────────────────────────────────────────────────────

const IMAGE_PROPS = [
  { name: 'src', type: 'string', required: true, description: 'Image source URL.' },
  { name: 'alt', type: 'string', required: true, description: 'Alternative text describing the image for screen readers (WCAG 1.1.1). Use an empty string for decorative images.' },
  { name: 'aspectRatio', type: "'1/1' | '4/3' | '16/9' | '3/2' | '2/3' | string", default: 'undefined', description: 'CSS aspect-ratio applied to the wrapper. Forces a fixed-ratio container before the image loads.' },
  { name: 'objectFit', type: "'cover' | 'contain' | 'fill' | 'none' | 'scale-down'", default: "'cover'", description: 'CSS object-fit applied to the img element.' },
  { name: 'objectPosition', type: 'string', default: "'center'", description: 'CSS object-position for controlling the focal point within the container.' },
  { name: 'rounded', type: "'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full'", default: "'none'", description: 'Border radius applied to the image container.' },
  { name: 'caption', type: 'string | ReactNode', default: 'undefined', description: 'Caption rendered below the image in a <figcaption> element.' },
  { name: 'fallback', type: 'ReactNode', default: 'undefined', description: 'Content shown when the image fails to load (replaces the broken-image icon).' },
  { name: 'fallbackSrc', type: 'string', default: 'undefined', description: 'Fallback image URL shown when the primary src fails to load.' },
  { name: 'showSkeleton', type: 'boolean', default: 'true', description: 'Shows an animated skeleton placeholder while the image is loading.' },
  { name: 'preview', type: 'boolean', default: 'false', description: 'Enables a click-to-fullscreen lightbox overlay for the image.' },
  { name: 'width', type: 'number | string', default: 'undefined', description: 'Width applied to the container element.' },
  { name: 'height', type: 'number | string', default: 'undefined', description: 'Height applied to the container element.' },
  { name: 'className', type: 'string', default: 'undefined', description: 'Extra class names on the root figure/div wrapper.' },
];

// ── Page ─────────────────────────────────────────────────────────────────────

export function ImagePage({ theme }: { theme: ThemeTokens }) {
  const [previewCount, setPreviewCount] = useState(0);

  const dividerStyle = { height: '1px', backgroundColor: theme.border, margin: '48px 0', border: 'none' };

  const noteBoxStyle = {
    borderRadius: '10px',
    border: `1px solid ${theme.border}`,
    backgroundColor: theme.surfaceAlt,
    padding: '20px 24px',
    marginBottom: '24px',
  };

  const noteHeadStyle = {
    fontSize: '13px',
    fontWeight: 700 as const,
    color: theme.text,
    margin: '0 0 12px',
  };

  const noteItemStyle = {
    fontSize: '13.5px',
    color: theme.textMuted,
    lineHeight: '1.7',
    margin: '0 0 6px',
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 32px 80px' }}>

      {/* WCAG badge row */}
      <div style={{ marginBottom: '24px' }}>
        <WCAGBadgeGroup
          label="WCAG 2.1 Compliance"
          badges={[
            { criterion: '1.1.1 Non-text Content', level: 'AA', status: 'PASS' },
            { criterion: '1.4.3 Contrast', level: 'AAA', status: 'PASS' },
            { criterion: '2.1.1 Keyboard', level: 'AA', status: 'PASS' },
          ]}
        />
      </div>

      {/* Hero */}
      <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: theme.text, margin: '0 0 12px', letterSpacing: '-0.03em', lineHeight: 1.15 }}>
        TkxImage
      </h1>
      <p style={{ fontSize: '15px', color: theme.textMuted, lineHeight: '1.75', maxWidth: '640px', margin: '0 0 8px' }}>
        A smart image component that handles loading skeletons, error fallbacks, aspect ratios, rounded corners,
        captions, and click-to-preview lightbox. All with proper alt text enforcement and WCAG 1.1.1 compliance.
      </p>
      <p style={{ fontSize: '13px', color: theme.textMuted, lineHeight: '1.6', maxWidth: '640px', margin: '0 0 48px' }}>
        <strong style={{ color: theme.text }}>WCAG 1.1.1:</strong> The{' '}
        <code style={{ fontSize: '12px', backgroundColor: `${theme.primary}14`, color: theme.primary, padding: '1px 5px', borderRadius: '4px' }}>alt</code>{' '}
        prop is required. Pass an empty string for decorative images (background textures, separators) —
        screen readers will skip them. Never omit or use placeholder text like "image" as alt text.
      </p>

      {/* ── 1. Aspect Ratio ── */}
      <DemoSection
        title="Aspect Ratios"
        description="Use aspectRatio to maintain consistent proportions before and after image load. The skeleton placeholder fills the same ratio, preventing layout shift (Core Web Vitals CLS)."
        theme={theme}
        code={`<TkxImage src="https://picsum.photos/seed/tkx1/400/400" alt="Square photo" aspectRatio="1/1" width={200} />
<TkxImage src="https://picsum.photos/seed/tkx2/400/300" alt="Landscape photo" aspectRatio="4/3" width={200} />
<TkxImage src="https://picsum.photos/seed/tkx3/640/360" alt="Wide photo" aspectRatio="16/9" width={320} />`}
      >
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <div>
            <p style={{ fontSize: '11px', color: theme.textMuted, margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>1:1</p>
            <TkxImage src="https://picsum.photos/seed/tkx1/400/400" alt="Square architecture photo" aspectRatio="1/1" width={160} />
          </div>
          <div>
            <p style={{ fontSize: '11px', color: theme.textMuted, margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>4:3</p>
            <TkxImage src="https://picsum.photos/seed/tkx2/400/300" alt="Landscape nature photo" aspectRatio="4/3" width={200} />
          </div>
          <div>
            <p style={{ fontSize: '11px', color: theme.textMuted, margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>16:9</p>
            <TkxImage src="https://picsum.photos/seed/tkx3/640/360" alt="Wide panoramic photo" aspectRatio="16/9" width={280} />
          </div>
        </div>
      </DemoSection>

      {/* ── 2. Object Fit ── */}
      <DemoSection
        title="Object Fit Variants"
        description="objectFit controls how the image fills its container. 'cover' crops to fill (default). 'contain' letterboxes. 'fill' stretches. Use 'contain' for logos and icons."
        theme={theme}
        code={`<TkxImage src="…" alt="Cover"   objectFit="cover"   width={160} height={120} />
<TkxImage src="…" alt="Contain" objectFit="contain" width={160} height={120} />
<TkxImage src="…" alt="Fill"    objectFit="fill"    width={160} height={120} />`}
      >
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          {(['cover', 'contain', 'fill'] as const).map((fit) => (
            <div key={fit}>
              <p style={{ fontSize: '11px', color: theme.textMuted, margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{fit}</p>
              <TkxImage
                src="https://picsum.photos/seed/tekivex/300/200"
                alt={`${fit} object-fit example`}
                objectFit={fit}
                width={160}
                height={120}
                style={{ border: `1px solid ${theme.border}` }}
              />
            </div>
          ))}
        </div>
      </DemoSection>

      {/* ── 3. Rounded ── */}
      <DemoSection
        title="Rounded Variants"
        description="Six rounding levels from none to full (circle). 'full' is commonly used for avatars and profile pictures."
        theme={theme}
        code={`<TkxImage src="…" alt="No rounding"     rounded="none" width={100} aspectRatio="1/1" />
<TkxImage src="…" alt="Small rounding"  rounded="sm"   width={100} aspectRatio="1/1" />
<TkxImage src="…" alt="Large rounding"  rounded="lg"   width={100} aspectRatio="1/1" />
<TkxImage src="…" alt="Circle"          rounded="full" width={100} aspectRatio="1/1" />`}
      >
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          {(['none', 'sm', 'md', 'lg', 'xl', 'full'] as const).map((r) => (
            <div key={r} style={{ textAlign: 'center' as const }}>
              <TkxImage
                src={`https://picsum.photos/seed/round${r}/200/200`}
                alt={`rounded-${r} example`}
                rounded={r}
                width={80}
                aspectRatio="1/1"
              />
              <p style={{ fontSize: '11px', color: theme.textMuted, margin: '6px 0 0' }}>{r}</p>
            </div>
          ))}
        </div>
      </DemoSection>

      {/* ── 4. With Caption ── */}
      <DemoSection
        title="With Caption"
        description="The caption prop renders a <figcaption> element below the image inside a <figure> wrapper. This is the semantically correct HTML structure for captioned images."
        theme={theme}
        code={`<TkxImage
  src="https://picsum.photos/seed/nature/400/250"
  alt="A scenic mountain landscape at golden hour"
  aspectRatio="16/9"
  width={400}
  caption="Figure 1: Mountain landscape photographed at sunset, demonstrating TkxImage caption support."
/>`}
      >
        <TkxImage
          src="https://picsum.photos/seed/tekivex/600/375"
          alt="A scenic landscape demonstration photo"
          aspectRatio="16/9"
          width={480}
          rounded="md"
          caption="Figure 1: Demonstration of TkxImage with a figcaption element. This is announced by screen readers as supplementary image context."
        />
      </DemoSection>

      {/* ── 5. Skeleton Placeholder ── */}
      <DemoSection
        title="Skeleton Placeholder"
        description="While the image loads, TkxImage shows an animated skeleton that matches the configured dimensions. showSkeleton is true by default. Set it to false to use the browser's native behavior."
        theme={theme}
        code={`// Skeleton is shown by default while loading
<TkxImage
  src="https://picsum.photos/seed/slow/400/300"
  alt="Image loading with skeleton"
  aspectRatio="4/3"
  width={300}
  showSkeleton  // true by default
/>`}
      >
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <TkxImage
            src="https://picsum.photos/seed/skeleton1/400/300"
            alt="Photo with skeleton loading state"
            aspectRatio="4/3"
            width={220}
            rounded="md"
          />
          <TkxImage
            src="https://picsum.photos/seed/skeleton2/400/300"
            alt="Another photo with skeleton loading state"
            aspectRatio="4/3"
            width={220}
            rounded="md"
          />
        </div>
      </DemoSection>

      {/* ── 6. Error Fallback ── */}
      <DemoSection
        title="Error Fallback"
        description="When the image URL fails, TkxImage renders the fallback node or fallbackSrc. A default broken-image placeholder is shown if neither is provided."
        theme={theme}
        code={`// Custom fallback node
<TkxImage
  src="https://invalid-url.example/broken.jpg"
  alt="Image that fails to load"
  aspectRatio="4/3"
  width={200}
  fallback={<div>Image unavailable</div>}
/>

// Fallback URL
<TkxImage
  src="https://invalid-url.example/broken.jpg"
  alt="Product thumbnail"
  fallbackSrc="https://picsum.photos/seed/fallback/200/200"
  width={200}
  aspectRatio="1/1"
/>`}
      >
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <div>
            <p style={{ fontSize: '11px', color: theme.textMuted, margin: '0 0 6px' }}>Custom fallback node</p>
            <TkxImage
              src="https://invalid-url.example/notfound.jpg"
              alt="Image that fails to load"
              aspectRatio="4/3"
              width={200}
              rounded="md"
              fallback={
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: theme.textMuted, fontSize: '13px', gap: '8px' }}>
                  <span style={{ fontSize: '24px' }}>🖼</span>
                  Image unavailable
                </div>
              }
            />
          </div>
          <div>
            <p style={{ fontSize: '11px', color: theme.textMuted, margin: '0 0 6px' }}>Fallback src URL</p>
            <TkxImage
              src="https://invalid-url.example/notfound.jpg"
              alt="Product with fallback image"
              aspectRatio="4/3"
              width={200}
              rounded="md"
              fallbackSrc="https://picsum.photos/seed/fallback/400/300"
            />
          </div>
        </div>
      </DemoSection>

      {/* ── 7. Preview (Click to fullscreen) ── */}
      <DemoSection
        title="Preview (Click to Fullscreen)"
        description="Set preview to enable a click-to-expand lightbox overlay. A camera icon appears on hover. Clicking opens the image in a fullscreen modal with Escape to close."
        theme={theme}
        code={`<TkxImage
  src="https://picsum.photos/seed/tekivex/400/300"
  alt="Preview-enabled image"
  aspectRatio="4/3"
  width={280}
  rounded="md"
  preview
  onPreviewOpen={() => console.log('Preview opened')}
/>`}
      >
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <TkxImage
            src="https://picsum.photos/seed/preview1/400/300"
            alt="City skyline at dusk — click to view fullscreen"
            aspectRatio="4/3"
            width={260}
            rounded="md"
            preview
            onPreviewOpen={() => setPreviewCount((n) => n + 1)}
          />
          <TkxImage
            src="https://picsum.photos/seed/preview2/400/300"
            alt="Mountain landscape — click to view fullscreen"
            aspectRatio="4/3"
            width={260}
            rounded="md"
            preview
            onPreviewOpen={() => setPreviewCount((n) => n + 1)}
          />
        </div>
        {previewCount > 0 && (
          <p style={{ marginTop: '12px', fontSize: '12px', color: theme.textMuted }}>
            Preview opened <strong style={{ color: theme.text }}>{previewCount}</strong> time(s)
          </p>
        )}
      </DemoSection>

      <hr style={dividerStyle} />

      {/* Props Table */}
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: theme.text, margin: '0 0 20px', letterSpacing: '-0.02em' }}>
        Props Reference
      </h2>
      <div style={{ marginBottom: '48px' }}>
        <PropTable props={IMAGE_PROPS} />
      </div>

      <hr style={dividerStyle} />

      {/* Accessibility Notes */}
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: theme.text, margin: '0 0 20px', letterSpacing: '-0.02em' }}>
        Accessibility Notes
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
        <WCAGBadge criterion="1.1.1 Non-text Content" level="AA" status="PASS" />
        <WCAGBadge criterion="1.4.3 Contrast (Minimum)" level="AA" status="PASS" />
        <WCAGBadge criterion="2.1.1 Keyboard Accessible" level="AA" status="PASS" />
      </div>
      <div style={noteBoxStyle}>
        <p style={noteHeadStyle}>Writing Good Alt Text</p>
        <p style={noteItemStyle}>For informative images, describe the content and purpose: <em>"Bar chart showing revenue growth from $2M to $8M between 2021 and 2024"</em> is better than <em>"chart"</em>.</p>
        <p style={noteItemStyle}>For decorative images (backgrounds, spacers), pass <code>alt=""</code>. Screen readers skip elements with empty alt text entirely.</p>
        <p style={noteItemStyle}>For images of text, include the text in the alt: <em>"TekiVex logo with the tagline 'Build without limits'"</em>.</p>
      </div>
      <div style={noteBoxStyle}>
        <p style={noteHeadStyle}>Preview Lightbox</p>
        <p style={noteItemStyle}>The preview button receives <code>aria-label="View full size: [alt text]"</code>. The lightbox overlay uses <code>role="dialog"</code>, traps focus, and can be closed with Escape or the close button.</p>
      </div>
    </div>
  );
}
