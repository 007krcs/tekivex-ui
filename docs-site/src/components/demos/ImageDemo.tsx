import { TkxImage } from 'tekivex-ui';
import { Preview } from '../Preview';

// Inline SVG data-URIs so the demos don't depend on an external image host.
const PLACEHOLDER = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180" viewBox="0 0 320 180">
    <rect width="320" height="180" fill="#e0f2fe"/>
    <text x="160" y="90" font-family="ui-sans-serif" font-size="16" fill="#0369a1" text-anchor="middle" dy=".3em">320 × 180 placeholder</text>
  </svg>`
)}`;

const BROKEN_URL = 'https://this-domain-does-not-resolve.invalid/missing.png';

export function ImageBasic() {
  return (
    <Preview label="Basic — lazy-loaded with skeleton fallback">
      <TkxImage src={PLACEHOLDER} alt="A placeholder image" width={320} height={180} />
    </Preview>
  );
}

export function ImageWithFallback() {
  return (
    <Preview label="With fallback — load fails on purpose">
      <TkxImage
        src={BROKEN_URL}
        alt="Broken image"
        width={320}
        height={180}
        fallback={
          <div style={{
            width: 320, height: 180, background: '#f1f5f9', display: 'flex',
            alignItems: 'center', justifyContent: 'center', color: '#475569', fontSize: 13,
            border: '1px dashed #cbd5e1', borderRadius: 8,
          }}>
            Image unavailable — using fallback
          </div>
        }
      />
    </Preview>
  );
}
