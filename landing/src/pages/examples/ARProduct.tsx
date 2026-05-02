// ─────────────────────────────────────────────────────────────────────────────
// /examples/ar-product — e-commerce product page with WebXR AR preview.
//
// Demonstrates the AR/VR toolkit in a commercial context: a furniture
// listing where shoppers can place the chair in their own room before
// buying. Falls back to a draggable 3D viewer on devices without WebXR.
//
// Why this composition matters: every furniture, fashion, jewellery,
// eyewear, watch, or car-configurator brand wants the same shape — a
// product hero + variants + a 3D preview + buy CTA — and this is the
// copy-paste starting point.
// ─────────────────────────────────────────────────────────────────────────────
import { useEffect, useState } from 'react';
import {
  TkxScene,
  TkxCard3D,
  TkxParticleField,
  TkxOrbitControls,
  TkxXRSession,
} from 'tekivex-3d';
import { ExampleShell } from './ExampleShell';
import { BusinessCTA } from './BusinessCTA';
import { usePageMeta } from '../../use-page-meta';

interface Variant {
  id: string;
  label: string;
  swatch: string;
  cardColor: string;
}
const VARIANTS: Variant[] = [
  { id: 'oak',     label: 'Natural oak',  swatch: '#c69c6d', cardColor: '#c69c6d' },
  { id: 'walnut',  label: 'Smoked walnut', swatch: '#5b3a29', cardColor: '#5b3a29' },
  { id: 'sage',    label: 'Sage upholstery', swatch: '#8a9b6e', cardColor: '#8a9b6e' },
  { id: 'navy',    label: 'Deep navy',    swatch: '#1e293b', cardColor: '#1e293b' },
];

// Procedural product photo — guaranteed to load, recolours per variant.
// Renders a stylized chair illustration as an SVG so the gallery has
// real, recognizable product imagery without depending on external CDNs.
function chairPhoto(opts: {
  variant: Variant;
  angle: 'front' | 'side' | 'detail' | 'lifestyle';
}): string {
  const { variant, angle } = opts;
  const c = variant.cardColor;
  const dark = shade(c, -0.25);
  const light = shade(c, 0.18);
  const shadow = 'rgba(15, 23, 42, 0.18)';
  const bg = angle === 'lifestyle'
    ? 'linear-gradient(180deg, #f8eedc 0%, #ead4b3 50%, #b88f5e 100%)'
    : '#f4f0ea';

  const chair =
    angle === 'side' ? (
      // Side view — show the recline curve
      `<g transform="translate(120 70)">
        <path d="M 60 280 Q 60 100 200 80 L 380 80 Q 460 80 470 110 L 470 260 Q 470 290 440 290 L 90 290 Q 60 290 60 280 Z"
              fill="${c}" stroke="${dark}" stroke-width="3"/>
        <ellipse cx="265" cy="295" rx="200" ry="14" fill="${shadow}"/>
        <path d="M 100 290 L 95 380 L 130 380 L 135 290 Z" fill="${dark}"/>
        <path d="M 425 290 L 420 380 L 455 380 L 460 290 Z" fill="${dark}"/>
        <line x1="200" y1="100" x2="380" y2="100" stroke="${light}" stroke-width="2" opacity="0.6"/>
      </g>`
    ) : angle === 'detail' ? (
      // Detail — show stitching on the leather sling
      `<g transform="translate(60 60)">
        <rect x="40" y="40" width="500" height="320" rx="40" fill="${c}" stroke="${dark}" stroke-width="3"/>
        ${Array.from({ length: 26 }, (_, i) =>
          `<line x1="${70 + i * 18}" y1="80" x2="${70 + i * 18}" y2="92" stroke="${dark}" stroke-width="1.5"/>`
        ).join('')}
        ${Array.from({ length: 26 }, (_, i) =>
          `<line x1="${70 + i * 18}" y1="308" x2="${70 + i * 18}" y2="320" stroke="${dark}" stroke-width="1.5"/>`
        ).join('')}
        <path d="M 60 200 L 540 200" stroke="${light}" stroke-width="2" opacity="0.4"/>
      </g>`
    ) : angle === 'lifestyle' ? (
      // Lifestyle — chair in a room
      `<g>
        <rect y="280" width="600" height="120" fill="rgba(255,255,255,0.4)"/>
        <rect x="40" y="120" width="160" height="220" fill="rgba(255,255,255,0.6)" stroke="rgba(15,23,42,0.1)" stroke-width="2"/>
        <line x1="120" y1="120" x2="120" y2="340" stroke="rgba(15,23,42,0.1)" stroke-width="1"/>
        <line x1="40" y1="230" x2="200" y2="230" stroke="rgba(15,23,42,0.1)" stroke-width="1"/>
        <g transform="translate(280 100)">
          <ellipse cx="100" cy="245" rx="100" ry="10" fill="${shadow}"/>
          <rect x="20" y="140" width="160" height="80" rx="20" fill="${c}" stroke="${dark}" stroke-width="2"/>
          <rect x="30" y="60" width="140" height="100" rx="16" fill="${c}" stroke="${dark}" stroke-width="2"/>
          <rect x="35" y="220" width="14" height="40" fill="${dark}"/>
          <rect x="151" y="220" width="14" height="40" fill="${dark}"/>
        </g>
        <rect x="450" y="200" width="100" height="140" fill="rgba(122, 85, 58, 0.25)" rx="3"/>
      </g>`
    ) : (
      // Front view (default)
      `<g transform="translate(80 60)">
        <ellipse cx="220" cy="345" rx="200" ry="12" fill="${shadow}"/>
        <rect x="40" y="40" width="360" height="160" rx="22" fill="${c}" stroke="${dark}" stroke-width="3"/>
        <rect x="20" y="200" width="400" height="100" rx="18" fill="${light}" stroke="${dark}" stroke-width="3"/>
        <rect x="30" y="296" width="20" height="58" fill="${dark}" rx="2"/>
        <rect x="390" y="296" width="20" height="58" fill="${dark}" rx="2"/>
        <rect x="50" y="296" width="20" height="58" fill="${dark}" rx="2" opacity="0.55"/>
        <rect x="370" y="296" width="20" height="58" fill="${dark}" rx="2" opacity="0.55"/>
        <line x1="60" y1="80" x2="380" y2="80" stroke="${light}" stroke-width="2" opacity="0.55"/>
        <line x1="60" y1="160" x2="380" y2="160" stroke="${light}" stroke-width="2" opacity="0.55"/>
      </g>`
    );

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 460">` +
    (bg.startsWith('linear')
      ? `<defs><linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#f8eedc"/><stop offset="50%" stop-color="#ead4b3"/><stop offset="100%" stop-color="#b88f5e"/></linearGradient></defs><rect width="600" height="460" fill="url(#bg)"/>`
      : `<rect width="600" height="460" fill="${bg}"/>`) +
    chair +
    `</svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

// Simple HSL-aware color shading helper.
function shade(hex: string, amt: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const adj = (n: number) => Math.max(0, Math.min(255, Math.round(n + 255 * amt)));
  return `#${[adj(r), adj(g), adj(b)].map((n) => n.toString(16).padStart(2, '0')).join('')}`;
}

const PRODUCT = {
  brand: 'Lumen Studio',
  name: 'Aurora Lounge Chair',
  rating: 4.8,
  reviews: 312,
  price: 38900,
  oldPrice: 45000,
  inStock: true,
  shipsIn: '3–5 business days',
  dims: { w: 78, d: 82, h: 95, weight: 14 }, // cm / kg
  description:
    'Steam-bent solid wood frame, hand-stitched leather sling, and a counter-balanced backrest that recliines without a mechanism. Designed by Mira Joshi in our Bangalore studio.',
  bullets: [
    'FSC-certified European oak (or walnut)',
    'Full-grain leather sling, hand-stitched',
    'Assembles in under 10 minutes — three bolts',
    '10-year structural warranty',
    'Ships in eco-foam, no plastic',
  ],
};

interface XRSupport { ar: boolean; vr: boolean; checking: boolean; }
function useXRSupport(): XRSupport {
  const [s, setS] = useState<XRSupport>({ ar: false, vr: false, checking: true });
  useEffect(() => {
    const xr = (navigator as Navigator & { xr?: { isSessionSupported(m: string): Promise<boolean> } }).xr;
    if (!xr || typeof xr.isSessionSupported !== 'function') {
      setS({ ar: false, vr: false, checking: false });
      return;
    }
    Promise.all([
      xr.isSessionSupported('immersive-ar').catch(() => false),
      xr.isSessionSupported('immersive-vr').catch(() => false),
    ]).then(([ar, vr]) => setS({ ar, vr, checking: false }));
  }, []);
  return s;
}

export function ARProduct() {
  usePageMeta(
    'AR product preview example — TekiVex UI',
    'An e-commerce product page where shoppers can place the chair in their own room with WebXR AR. Built with tekivex-3d. Falls back to a draggable 3D viewer on devices without AR.',
    { keywords: 'tekivex ar example, webxr, ar furniture, virtual try on, 3d product viewer, react ecommerce ar' },
  );

  const [variantId, setVariantId] = useState<string>('oak');
  const variant = VARIANTS.find((v) => v.id === variantId)!;
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [view, setView] = useState<'photos' | '3d'>('photos');
  const [activePhoto, setActivePhoto] = useState(0);
  const xr = useXRSupport();
  const [sessionMode, setSessionMode] = useState<'ar' | 'vr' | null>(null);

  const photos = [
    { angle: 'front'     as const, label: 'Front'     },
    { angle: 'side'      as const, label: 'Side'      },
    { angle: 'detail'    as const, label: 'Stitching' },
    { angle: 'lifestyle' as const, label: 'In a room' },
  ];

  function addToCart() {
    setAdded(true);
    setTimeout(() => setAdded(false), 2200);
  }

  return (
    <ExampleShell
      title="Aurora Lounge Chair"
      eyebrow="Use case · E-commerce + AR"
      description="A real product page where shoppers can place the chair in their actual room before buying — built with tekivex-3d. Falls back gracefully to a draggable 3D viewer when WebXR isn't available."
      sourceUrl="https://github.com/007krcs/tekivex-ui/blob/master/landing/src/pages/examples/ARProduct.tsx"
      surface="light"
    >
      <ARStyles />

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '24px 24px 64px' }}>
        <div className="ar-grid">
          {/* Left: photo gallery / 3D viewer / AR preview */}
          <div>
            {/* View tabs */}
            <div className="ar-view-tabs" role="tablist" aria-label="Product views">
              <button type="button" role="tab" aria-selected={view === 'photos'}
                className={`ar-view-tab ${view === 'photos' ? 'is-active' : ''}`}
                onClick={() => setView('photos')}>📸 Photos</button>
              <button type="button" role="tab" aria-selected={view === '3d'}
                className={`ar-view-tab ${view === '3d' ? 'is-active' : ''}`}
                onClick={() => setView('3d')}>🔄 3D view</button>
              <span className="ar-eyebrow" style={{ marginLeft: 'auto', alignSelf: 'center' }}>
                {view === 'photos' ? `${activePhoto + 1} / ${photos.length}` : '360° rotation'}
              </span>
            </div>

            {view === 'photos' ? (
              <>
                <div className="ar-photo-main">
                  <img
                    src={chairPhoto({ variant, angle: photos[activePhoto].angle })}
                    alt={`${PRODUCT.name} — ${photos[activePhoto].label} view (${variant.label})`}
                  />
                  <div className="ar-photo-pill">
                    <span className="ar-eyebrow">Finish</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span className="ar-swatch" style={{ background: variant.swatch }} aria-hidden="true" />
                      {variant.label}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setView('3d')}
                    className="ar-photo-cta"
                    data-tkx-xr-button="ar"
                  >
                    👓 View in your room
                  </button>
                </div>
                <div className="ar-photo-thumbs">
                  {photos.map((p, i) => (
                    <button
                      key={p.angle}
                      type="button"
                      onClick={() => setActivePhoto(i)}
                      aria-pressed={i === activePhoto}
                      className={`ar-photo-thumb ${i === activePhoto ? 'is-active' : ''}`}
                    >
                      <img src={chairPhoto({ variant, angle: p.angle })} alt="" loading="lazy" />
                      <span>{p.label}</span>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="ar-viewer">
                <TkxScene fov={45} cameraPosition={[2.4, 1.6, 3.6]} background="transparent">
                  <TkxParticleField count={300} volume={[8, 6, 8]} driftSpeed={0.1} size={0.02} />
                  {/* Chair built from primitives — seat, back, 4 legs */}
                  <TkxCard3D position={[0, 0.95, 0]}     size={[1.3, 0.18]} color={variant.cardColor} />
                  <TkxCard3D position={[0, 1.55, -0.55]} size={[1.3, 1.0]}  color={variant.cardColor} />
                  <TkxCard3D position={[-0.55, 0.45, -0.45]} size={[0.12, 0.85]} color={shade(variant.cardColor, -0.25)} />
                  <TkxCard3D position={[ 0.55, 0.45, -0.45]} size={[0.12, 0.85]} color={shade(variant.cardColor, -0.25)} />
                  <TkxCard3D position={[-0.55, 0.45,  0.45]} size={[0.12, 0.85]} color={shade(variant.cardColor, -0.25)} />
                  <TkxCard3D position={[ 0.55, 0.45,  0.45]} size={[0.12, 0.85]} color={shade(variant.cardColor, -0.25)} />
                  <TkxOrbitControls preset="orbit" autoRotate />
                  <TkxXRSession
                    ar vr
                    onSessionStart={(m) => setSessionMode(m as 'ar' | 'vr')}
                    onSessionEnd={() => setSessionMode(null)}
                  />
                </TkxScene>

                <div className="ar-viewer-hud">
                  <div className="ar-viewer-pill">
                    <span className="ar-eyebrow">Variant</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span className="ar-swatch" style={{ background: variant.swatch }} aria-hidden="true" />
                      {variant.label}
                    </span>
                  </div>
                  <div className="ar-actions">
                    <ActionButton mode="ar" available={xr.ar} active={sessionMode === 'ar'} checking={xr.checking} />
                    <ActionButton mode="vr" available={xr.vr} active={sessionMode === 'vr'} checking={xr.checking} />
                  </div>
                </div>
                <div className="ar-viewer-hint" aria-hidden="true">
                  🖱 drag to orbit · 🔍 scroll to zoom · 🥽 tap "View in your room" on a Quest 3 / Vision Pro / ARCore phone
                </div>
              </div>
            )}

            {/* Capability + AR explainer cards */}
            <div className="ar-cap-row">
              <CapCard
                icon="📱"
                title="Modern Android"
                body="Tap 'View in your room'. Chrome lifts a WebXR session and the chair anchors to a real surface."
                ok={xr.ar}
              />
              <CapCard
                icon="🥽"
                title="Quest 3 / Vision Pro"
                body="Enter immersive AR pass-through. The chair places at floor height; walk around it like the real thing."
                ok={xr.ar}
              />
              <CapCard
                icon="🖥"
                title="iPhone / Desktop"
                body="WebXR isn't here yet, but the 3D viewer above stays interactive — drag to orbit, click to inspect."
                ok={true}
              />
            </div>
          </div>

          {/* Right: product details */}
          <aside className="ar-aside">
            <div className="ar-brand">{PRODUCT.brand}</div>
            <h2 className="ar-name">{PRODUCT.name}</h2>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 14, flexWrap: 'wrap' }}>
              <span style={{ color: '#f59e0b', fontWeight: 700, fontSize: 14 }}>
                ★ {PRODUCT.rating}
              </span>
              <span style={{ color: '#64748b', fontSize: 13 }}>
                ({PRODUCT.reviews.toLocaleString()} reviews)
              </span>
              <span style={{ color: PRODUCT.inStock ? '#16a34a' : '#dc2626', fontSize: 12, fontWeight: 700 }}>
                {PRODUCT.inStock ? '● In stock' : '● Sold out'}
              </span>
            </div>

            <div className="ar-price-row">
              <div className="ar-price">₹{PRODUCT.price.toLocaleString('en-IN')}</div>
              {PRODUCT.oldPrice && (
                <div className="ar-old-price">₹{PRODUCT.oldPrice.toLocaleString('en-IN')}</div>
              )}
              <span className="ar-discount">
                Save ₹{(PRODUCT.oldPrice - PRODUCT.price).toLocaleString('en-IN')}
              </span>
            </div>
            <div style={{ color: '#64748b', fontSize: 13, marginBottom: 18 }}>
              Ships in {PRODUCT.shipsIn} · Free delivery on orders over ₹25,000
            </div>

            {/* Variant swatches */}
            <div style={{ marginBottom: 16 }}>
              <div className="ar-eyebrow" style={{ marginBottom: 8 }}>Finish · {variant.label}</div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {VARIANTS.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    aria-label={v.label}
                    aria-pressed={v.id === variantId}
                    onClick={() => setVariantId(v.id)}
                    className={`ar-swatch-btn ${v.id === variantId ? 'is-active' : ''}`}
                    style={{ background: v.swatch }}
                    title={v.label}
                  />
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div className="ar-eyebrow">Qty</div>
              <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} className="ar-qty-btn">−</button>
              <span style={{ minWidth: 24, textAlign: 'center', fontWeight: 800 }}>{qty}</span>
              <button type="button" onClick={() => setQty((q) => Math.min(9, q + 1))} className="ar-qty-btn">+</button>
            </div>

            {/* CTAs */}
            <button type="button" onClick={addToCart} className="ar-btn-primary" disabled={added}>
              {added ? '✓ Added to cart' : `Add to cart · ₹${(PRODUCT.price * qty).toLocaleString('en-IN')}`}
            </button>
            <button type="button" className="ar-btn-secondary" data-tkx-xr-button="ar">
              👓 View in your room (AR)
            </button>

            {/* Description */}
            <p className="ar-desc">{PRODUCT.description}</p>
            <ul className="ar-bullets">
              {PRODUCT.bullets.map((b) => <li key={b}>{b}</li>)}
            </ul>

            {/* Dimensions */}
            <details className="ar-spec">
              <summary>Dimensions & specs</summary>
              <div className="ar-spec-grid">
                <Spec label="Width"  value={`${PRODUCT.dims.w} cm`} />
                <Spec label="Depth"  value={`${PRODUCT.dims.d} cm`} />
                <Spec label="Height" value={`${PRODUCT.dims.h} cm`} />
                <Spec label="Weight" value={`${PRODUCT.dims.weight} kg`} />
              </div>
            </details>

            {/* Why this matters */}
            <div className="ar-tip">
              <span style={{ fontSize: 22 }}>🎯</span>
              <div>
                <div style={{ fontWeight: 800, color: '#0f172a', fontSize: 14, marginBottom: 4 }}>
                  Why AR previews convert
                </div>
                <p style={{ margin: 0, fontSize: 13, color: '#1e40af', lineHeight: 1.55 }}>
                  Returns drop <strong>30–40%</strong> when shoppers can preview furniture
                  in their room before buying (Shopify, 2023). The AR preview above is built
                  with <code>tekivex-3d</code> in roughly 60 lines of React.
                </p>
              </div>
            </div>
          </aside>
        </div>

        <ReviewsSection />

        <BusinessCTA
          vertical="AR product preview"
          pitch="Furniture, fashion, jewellery, eyewear, watches, and car configurators all win from a 'see it in your room' button. Returns drop 30–40% when shoppers can preview the item at scale before buying (Shopify, 2023)."
          hue={['#7c3aed', '#4f46e5']}
        />

        <details className="ar-code-reveal">
          <summary>Show the source for the AR preview</summary>
          <pre>{`import { TkxScene, TkxXRSession, TkxCard3D, TkxOrbitControls } from 'tekivex-3d';

<TkxScene fov={50} cameraPosition={[2.5, 1.6, 3.4]}>
  <TkxCard3D
    position={[0, 1.0, 0]}
    size={[1.4, 1.6]}
    color="#c69c6d"
    title="Aurora Lounge Chair"
    subtitle="Natural oak"
  />
  <TkxOrbitControls preset="orbit" autoRotate />
  <TkxXRSession
    ar vr
    onSessionStart={(mode) => console.log('entered', mode)}
  />
</TkxScene>`}</pre>
        </details>
      </div>
    </ExampleShell>
  );
}

// ─── pieces ──────────────────────────────────────────────────────────────

function ActionButton({ mode, available, active, checking }: {
  mode: 'ar' | 'vr'; available: boolean; active: boolean; checking: boolean;
}) {
  const label = mode === 'ar' ? '👓 View in room' : '🥽 Enter VR';
  const tip = checking ? 'checking…' : available ? 'ready' : 'not on this device';
  return (
    <div
      data-tkx-xr-button={mode}
      aria-disabled={!available}
      title={tip}
      className={`ar-action ${active ? 'is-active' : ''} ${available ? '' : 'is-disabled'}`}
    >
      {label}
    </div>
  );
}

function CapCard({ icon, title, body, ok }: { icon: string; title: string; body: string; ok: boolean }) {
  return (
    <div className="ar-cap">
      <div style={{ fontSize: 22, marginBottom: 4 }}>{icon}</div>
      <div style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', marginBottom: 2 }}>{title}</div>
      <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.5, marginBottom: 6 }}>{body}</div>
      <div style={{ fontSize: 11, fontWeight: 700, color: ok ? '#16a34a' : '#94a3b8' }}>
        {ok ? '● supported' : '● not detected'}
      </div>
    </div>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="ar-eyebrow">{label}</div>
      <div style={{ fontWeight: 700, color: '#0f172a' }}>{value}</div>
    </div>
  );
}

function ReviewsSection() {
  const reviews = [
    { name: 'Priya R.',   rating: 5, body: '90 minutes from box to assembled. The leather sling softens beautifully after a week.' },
    { name: 'Marcus T.',  rating: 5, body: 'Reclines without any mechanism — design is honest. Sage finish looks nicer in person.' },
    { name: 'Hana K.',    rating: 4, body: 'Comfortable, but I\'d prefer the seat 2 cm deeper. Colour matched the AR preview exactly.' },
  ];
  return (
    <section style={{ marginTop: 36 }}>
      <h3 style={{ margin: '0 0 14px', fontSize: 22, color: '#0f172a', fontWeight: 800, letterSpacing: '-0.01em' }}>
        Recent reviews
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
        {reviews.map((r) => (
          <article key={r.name} className="ar-review">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <strong style={{ fontSize: 14, color: '#0f172a' }}>{r.name}</strong>
              <span style={{ color: '#f59e0b', fontSize: 13 }}>{'★'.repeat(r.rating)}</span>
            </div>
            <p style={{ margin: 0, fontSize: 13.5, color: '#475569', lineHeight: 1.55 }}>{r.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function ARStyles() {
  return (
    <style>{`
      .ar-grid {
        display: grid; grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr); gap: 32px;
      }

      /* View tabs */
      .ar-view-tabs {
        display: flex; gap: 6px; align-items: center;
        background: #f1f5f9; border: 1px solid #e6e8ef;
        border-radius: 999px; padding: 4px;
        margin-bottom: 14px; max-width: fit-content;
        padding-right: 16px;
      }
      .ar-view-tab {
        padding: 7px 16px; border-radius: 999px;
        background: transparent; border: none; cursor: pointer;
        font-size: 13px; font-weight: 700; color: #64748b;
        font-family: inherit; transition: background 0.15s, color 0.15s;
      }
      .ar-view-tab:hover { color: #0f172a; }
      .ar-view-tab.is-active { background: #ffffff; color: #4f46e5; box-shadow: 0 1px 3px rgba(15, 23, 42, 0.08); }

      /* Photo gallery */
      .ar-photo-main {
        position: relative; aspect-ratio: 4 / 3; border-radius: 18px; overflow: hidden;
        background: #f4f0ea; border: 1px solid #e6e8ef;
        box-shadow: 0 12px 40px rgba(15, 23, 42, 0.08);
      }
      .ar-photo-main img {
        width: 100%; height: 100%; object-fit: cover; display: block;
      }
      .ar-photo-pill {
        position: absolute; top: 14px; left: 14px;
        background: rgba(255, 255, 255, 0.92); backdrop-filter: blur(8px);
        padding: 8px 14px; border-radius: 999px;
        border: 1px solid rgba(15, 23, 42, 0.08);
        color: #0f172a; font-size: 13px; font-weight: 700;
        display: flex; gap: 10px; align-items: center;
      }
      .ar-photo-pill .ar-eyebrow { color: #64748b; }
      .ar-photo-cta {
        position: absolute; right: 14px; bottom: 14px;
        padding: 11px 18px; border-radius: 999px;
        background: linear-gradient(135deg, #4f46e5, #7c3aed);
        color: #fff; border: none; font-weight: 800; font-size: 14px;
        cursor: pointer; font-family: inherit;
        box-shadow: 0 8px 22px rgba(79, 70, 229, 0.35);
        transition: transform 0.15s;
      }
      .ar-photo-cta:hover { transform: translateY(-1px); }
      .ar-photo-thumbs {
        display: grid; grid-template-columns: repeat(4, 1fr);
        gap: 10px; margin-top: 14px;
      }
      .ar-photo-thumb {
        position: relative; padding: 0; cursor: pointer;
        border: 2px solid #e6e8ef; border-radius: 12px; overflow: hidden;
        background: #f4f0ea; aspect-ratio: 4 / 3;
        transition: border-color 0.15s, transform 0.15s;
      }
      .ar-photo-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
      .ar-photo-thumb span {
        position: absolute; left: 8px; bottom: 6px;
        font-size: 11px; font-weight: 700; color: #0f172a;
        background: rgba(255, 255, 255, 0.85); padding: 2px 8px; border-radius: 4px;
      }
      .ar-photo-thumb.is-active { border-color: #4f46e5; transform: translateY(-2px); }

      .ar-aside { display: flex; flex-direction: column; }
      .ar-viewer {
        position: relative; aspect-ratio: 4 / 3; border-radius: 18px; overflow: hidden;
        background: radial-gradient(ellipse at 30% 30%, #1a1633 0%, #0a0b15 70%);
        border: 1px solid #e6e8ef; box-shadow: 0 12px 40px rgba(15, 23, 42, 0.12);
      }
      .ar-viewer-hud {
        position: absolute; top: 14px; left: 14px; right: 14px;
        display: flex; justify-content: space-between; gap: 12px; flex-wrap: wrap;
      }
      .ar-viewer-pill {
        background: rgba(10, 11, 21, 0.78); backdrop-filter: blur(8px);
        padding: 10px 14px; border-radius: 999px; border: 1px solid rgba(255,255,255,0.1);
        color: #fff; font-size: 13px; font-weight: 700;
        display: flex; gap: 10px; align-items: center;
      }
      .ar-actions { display: flex; gap: 8px; }
      .ar-action {
        padding: 9px 14px; border-radius: 999px;
        background: linear-gradient(135deg, rgba(0,245,212,0.18), rgba(58,134,255,0.18));
        border: 1px solid rgba(0, 245, 212, 0.4); color: #00f5d4;
        font-weight: 700; font-size: 13px; cursor: pointer; user-select: none;
        backdrop-filter: blur(8px);
      }
      .ar-action.is-active { background: linear-gradient(135deg, #00f5d4, #3a86ff); color: #0a0b15; }
      .ar-action.is-disabled { opacity: 0.4; cursor: not-allowed; }
      .ar-viewer-hint {
        position: absolute; bottom: 16px; left: 50%; transform: translateX(-50%);
        background: rgba(10, 11, 21, 0.7); color: #cbd5e1; padding: 6px 14px;
        border-radius: 999px; font-size: 11.5px; border: 1px solid rgba(255,255,255,0.1);
        max-width: calc(100% - 24px); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
      }
      .ar-swatch {
        width: 16px; height: 16px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.4);
      }
      .ar-eyebrow {
        font-size: 10.5px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 700;
      }
      .ar-cap-row {
        display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px;
        margin-top: 16px;
      }
      .ar-cap {
        background: #f8fafc; border: 1px solid #e6e8ef; border-radius: 12px;
        padding: 14px;
      }

      .ar-brand {
        font-size: 11px; font-weight: 800; color: #4f46e5;
        text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 6px;
      }
      .ar-name {
        margin: 0 0 10px; font-size: 30px; font-weight: 800;
        letter-spacing: -0.02em; color: #0f172a; line-height: 1.15;
      }
      .ar-price-row {
        display: flex; gap: 10px; align-items: baseline; flex-wrap: wrap; margin-bottom: 6px;
      }
      .ar-price { font-size: 30px; font-weight: 800; color: #0f172a; letter-spacing: -0.02em; }
      .ar-old-price { font-size: 16px; color: #94a3b8; text-decoration: line-through; }
      .ar-discount {
        background: #ecfccb; color: #4d7c0f;
        padding: 2px 10px; border-radius: 999px; font-size: 12px; font-weight: 700;
      }

      .ar-swatch-btn {
        width: 36px; height: 36px; border-radius: 50%;
        border: 3px solid transparent; cursor: pointer; padding: 0;
        outline-offset: 3px; transition: transform 0.15s, border-color 0.15s;
      }
      .ar-swatch-btn:hover { transform: scale(1.08); }
      .ar-swatch-btn.is-active { border-color: #4f46e5; }

      .ar-qty-btn {
        width: 32px; height: 32px; border-radius: 8px;
        background: #f1f5f9; border: 1px solid #e6e8ef;
        font-size: 16px; font-weight: 800; cursor: pointer; font-family: inherit;
        color: #0f172a;
      }

      .ar-btn-primary {
        width: 100%; padding: 14px; border-radius: 10px;
        background: linear-gradient(135deg, #4f46e5, #7c3aed);
        color: #fff; border: none; font-size: 15px; font-weight: 800; cursor: pointer;
        font-family: inherit; transition: transform 0.15s, opacity 0.15s;
      }
      .ar-btn-primary:hover { transform: translateY(-1px); }
      .ar-btn-primary:disabled { background: #16a34a; cursor: default; transform: none; }
      .ar-btn-secondary {
        width: 100%; padding: 12px; border-radius: 10px; margin-top: 10px;
        background: #ffffff; color: #4f46e5; border: 1.5px solid #c7d2fe;
        font-size: 14px; font-weight: 700; cursor: pointer; font-family: inherit;
      }
      .ar-btn-secondary:hover { background: #eef2ff; }

      .ar-desc { color: #475569; font-size: 14.5px; line-height: 1.65; margin: 18px 0 12px; }
      .ar-bullets { margin: 0 0 18px; padding-left: 20px; color: #475569; font-size: 14px; line-height: 1.7; }

      .ar-spec {
        background: #f8fafc; border: 1px solid #e6e8ef; border-radius: 10px;
        padding: 10px 14px; margin-bottom: 16px;
      }
      .ar-spec summary { cursor: pointer; font-weight: 700; font-size: 13.5px; color: #0f172a; }
      .ar-spec-grid {
        display: grid; grid-template-columns: repeat(auto-fit, minmax(110px, 1fr)); gap: 12px; margin-top: 10px;
      }

      .ar-tip {
        background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 10px;
        padding: 12px 14px; display: flex; gap: 10px; align-items: flex-start;
      }

      .ar-review {
        background: #ffffff; border: 1px solid #e6e8ef; border-radius: 12px; padding: 14px;
      }

      .ar-code-reveal {
        margin-top: 32px; background: #f8fafc; border: 1px solid #e6e8ef;
        border-radius: 12px; padding: 12px 16px;
      }
      .ar-code-reveal summary { cursor: pointer; font-weight: 700; font-size: 14px; color: #0f172a; }
      .ar-code-reveal pre {
        margin: 12px 0 0; padding: 16px; background: #0f172a; color: #e2e8f0;
        border-radius: 8px; font-size: 12.5px; line-height: 1.6; overflow-x: auto;
        font-family: ui-monospace, monospace;
      }

      @media (max-width: 920px) {
        .ar-grid { grid-template-columns: 1fr; }
      }
    `}</style>
  );
}
