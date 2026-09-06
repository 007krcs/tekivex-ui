// ─────────────────────────────────────────────────────────────────────────────
// /examples/property-tour — real-estate listing with embedded 360° walkthrough.
//
// Demonstrates the 360° toolkit in a commercial context: a live property
// listing where the immersive tour replaces the photo gallery as the
// primary discovery surface. Visitors drag through rooms, click hotspots
// to teleport between them, and a sticky right rail handles agent
// contact + viewing requests + a mortgage calculator.
//
// Why this composition matters: real estate, hotels, and venues all want
// the same shape — a property card + a tour + a contact CTA — and this
// route is the copy-paste starting point.
// ─────────────────────────────────────────────────────────────────────────────
import { useMemo, useState } from 'react';
import { TkxScene, TkxPanorama360, TkxHotspot, TkxParticleField } from 'tekivex-3d';
import { ExampleShell } from './ExampleShell';
import { OpenSourceFooter } from './OpenSourceFooter';
import { usePageMeta } from '../../use-page-meta';
import { withBase } from '../../base';

interface RoomPalette {
  ceiling: string;
  ceilingDark: string;
  wall: string;
  wallStripe: string;
  floor: string;
  floorDark: string;
  furniture: string;
  accent: string;
}

interface Room {
  id: string;
  label: string;
  emoji: string;
  palette: RoomPalette;
  hotspots: { to: string; label: string; pos: [number, number, number]; color: string }[];
}

// Procedural panorama generator — guarantees the canvas always shows a
// recognizable room with floor/ceiling/walls/furniture/label. No external
// image dependencies, no 404s, works offline.
//
// Each panorama is a 4096×2048 SVG (the standard 2:1 equirectangular
// aspect ratio) wrapped on a sphere by TkxPanorama360.
function panoramaSvg(roomName: string, p: RoomPalette): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 4096 2048" preserveAspectRatio="none">
  <defs>
    <linearGradient id="ceiling" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${p.ceilingDark}"/>
      <stop offset="100%" stop-color="${p.ceiling}"/>
    </linearGradient>
    <linearGradient id="floor" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${p.floor}"/>
      <stop offset="100%" stop-color="${p.floorDark}"/>
    </linearGradient>
  </defs>
  <rect width="4096" height="700" fill="url(#ceiling)"/>
  <rect y="700" width="4096" height="700" fill="${p.wall}"/>
  <rect y="1400" width="4096" height="648" fill="url(#floor)"/>
  ${[700, 1400].map(y => `<line x1="0" y1="${y}" x2="4096" y2="${y}" stroke="${p.accent}" stroke-width="3" opacity="0.18"/>`).join('')}
  ${[1024, 2048, 3072].map(x => `<line x1="${x}" y1="700" x2="${x}" y2="1400" stroke="${p.accent}" stroke-width="2" opacity="0.12"/>`).join('')}
  ${[
    { x: 240,  type: 'window', wide: 600 },
    { x: 1280, type: 'art' },
    { x: 1696, type: 'door' },
    { x: 2304, type: 'art' },
    { x: 2848, type: 'window', wide: 600 },
    { x: 3584, type: 'plant' },
  ].map(f => {
    if (f.type === 'window') {
      return `<rect x="${f.x}" y="800" width="${f.wide}" height="380" fill="${p.ceilingDark}" opacity="0.55" rx="6"/>
              <rect x="${f.x}" y="800" width="${f.wide}" height="380" fill="none" stroke="${p.accent}" stroke-width="2" opacity="0.3" rx="6"/>
              <line x1="${(f.x ?? 0) + (f.wide ?? 0) / 2}" y1="800" x2="${(f.x ?? 0) + (f.wide ?? 0) / 2}" y2="1180" stroke="${p.accent}" stroke-width="1" opacity="0.25"/>`;
    }
    if (f.type === 'art') {
      return `<rect x="${f.x}" y="900" width="200" height="240" fill="${p.furniture}" rx="4"/>
              <rect x="${f.x}" y="900" width="200" height="240" fill="none" stroke="${p.accent}" stroke-width="3" opacity="0.4" rx="4"/>`;
    }
    if (f.type === 'door') {
      return `<rect x="${f.x}" y="780" width="240" height="500" fill="${p.furniture}" opacity="0.6" rx="4"/>
              <circle cx="${f.x + 220}" cy="1030" r="6" fill="${p.accent}"/>`;
    }
    if (f.type === 'plant') {
      return `<rect x="${f.x}" y="1220" width="80" height="200" fill="${p.furniture}" rx="6"/>
              <ellipse cx="${f.x + 40}" cy="1190" rx="100" ry="80" fill="${p.accent}" opacity="0.45"/>`;
    }
    return '';
  }).join('')}
  ${[600, 1648, 2696, 3744].map(x => `<rect x="${x - 180}" y="1430" width="360" height="180" fill="${p.furniture}" opacity="0.7" rx="14"/>`).join('')}
  <text x="2048" y="1100" font-size="220" fill="${p.accent}" text-anchor="middle" font-family="system-ui, sans-serif" font-weight="800" opacity="0.32">${roomName}</text>
  <text x="2048" y="1200" font-size="48" fill="${p.accent}" text-anchor="middle" font-family="system-ui, sans-serif" font-weight="600" opacity="0.4" letter-spacing="6">DRAG TO LOOK</text>
</svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

const PALETTES: Record<string, RoomPalette> = {
  living: {
    ceiling: '#fef9f0', ceilingDark: '#f8eedc',
    wall: '#f5e6cf', wallStripe: '#e8d4b3',
    floor: '#a87b5a', floorDark: '#7a553a',
    furniture: '#5a4530', accent: '#06b6d4',
  },
  kitchen: {
    ceiling: '#ffffff', ceilingDark: '#f0f4f8',
    wall: '#e7eef5', wallStripe: '#d0dae6',
    floor: '#7d92ab', floorDark: '#56697f',
    furniture: '#1e293b', accent: '#3a86ff',
  },
  bedroom: {
    ceiling: '#fdf4f4', ceilingDark: '#f5e3e7',
    wall: '#ead4d8', wallStripe: '#d9b8be',
    floor: '#9b6d6e', floorDark: '#704c4d',
    furniture: '#3f2330', accent: '#7c3aed',
  },
  balcony: {
    ceiling: '#bfe1f3', ceilingDark: '#7bb8da',
    wall: '#a9cee0', wallStripe: '#86b8cf',
    floor: '#8a8a8a', floorDark: '#5a5a5a',
    furniture: '#2c4759', accent: '#f59e0b',
  },
};

const ROOMS: Room[] = [
  {
    id: 'living', label: 'Living room', emoji: '🛋️', palette: PALETTES.living,
    hotspots: [
      { to: 'kitchen',  label: '🍳 Kitchen',  pos: [-22, 2, -10], color: '#3a86ff' },
      { to: 'bedroom',  label: '🛏️ Bedroom',  pos: [22, 2, -10],  color: '#7c3aed' },
      { to: 'balcony',  label: '🌅 Balcony',  pos: [0, 4, 22],    color: '#f59e0b' },
    ],
  },
  {
    id: 'kitchen', label: 'Kitchen', emoji: '🍳', palette: PALETTES.kitchen,
    hotspots: [
      { to: 'living',   label: '↩ Living room', pos: [0, 2, -22], color: '#06b6d4' },
      { to: 'bedroom',  label: '🛏️ Bedroom',    pos: [22, 2, -10], color: '#7c3aed' },
    ],
  },
  {
    id: 'bedroom', label: 'Bedroom', emoji: '🛏️', palette: PALETTES.bedroom,
    hotspots: [
      { to: 'living',   label: '↩ Living room', pos: [0, 2, -22], color: '#06b6d4' },
      { to: 'balcony',  label: '🌅 Balcony',    pos: [22, 4, 18], color: '#f59e0b' },
    ],
  },
  {
    id: 'balcony', label: 'Balcony', emoji: '🌅', palette: PALETTES.balcony,
    hotspots: [
      { to: 'living',  label: '↩ Living room', pos: [0, 2, -22],  color: '#06b6d4' },
      { to: 'bedroom', label: '🛏️ Bedroom',    pos: [-22, 2, -10], color: '#7c3aed' },
    ],
  },
];

const PROPERTY = {
  title: '2-Bedroom Garden Apartment',
  address: '14 Aurora Court · Bandra West, Mumbai 400050',
  priceMonthly: 185000,
  priceTotal: 28500000,
  beds: 2,
  baths: 2,
  area: 1280,
  parking: 1,
  available: '15 May 2026',
  features: [
    'Floor-to-ceiling windows with city views',
    'Italian marble kitchen counters',
    'Smart-home wiring (HomeKit + Alexa ready)',
    'Building gym, pool, and rooftop terrace',
    'Two dedicated covered parking spots',
    '24/7 concierge + gated security',
    'Pet-friendly with a private grass run',
    'Walking distance to schools and metro',
  ],
  agent: {
    name: 'Aanya Mehta',
    title: 'Senior listing partner',
    initials: 'AM',
    phone: '+91 98 1234 5678',
    email: 'aanya@lumenrealty.example',
    rating: 4.9,
    deals: 142,
  },
};

export function PropertyTour() {
  usePageMeta(
    'Property tour example — TekiVex UI',
    'A real-estate listing page with an embedded 360° walkthrough — built with tekivex-3d. Drag to look around, click hotspots to teleport between rooms, and request a viewing without leaving the page.',
    { keywords: 'tekivex 360 example, real estate 360, virtual property tour, react webgl, panorama, immersive listing' },
  );

  const [activeRoomId, setActiveRoomId] = useState<string>('living');
  const active = ROOMS.find((r) => r.id === activeRoomId)!;
  const activeSrc = useMemo(
    () => panoramaSvg(active.label, active.palette),
    [active.id, active.label, active.palette],
  );
  const [downPaymentPct, setDownPaymentPct] = useState(20);
  const [years, setYears] = useState(20);
  const [rate, setRate] = useState(8.5);

  const monthly = useMemo(() => {
    const principal = PROPERTY.priceTotal * (1 - downPaymentPct / 100);
    const r = rate / 100 / 12;
    const n = years * 12;
    if (r === 0) return Math.round(principal / n);
    const m = (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    return Math.round(m);
  }, [downPaymentPct, years, rate]);

  return (
    <ExampleShell
      title="Garden apartment in Bandra"
      eyebrow="Use case · Real estate"
      description="A complete property listing with an embedded 360° walkthrough — the same shape every real-estate, hotel, or venue site needs. Drag to look around, click a glowing hotspot to teleport between rooms, request a viewing without leaving the page."
      sourceUrl="https://github.com/007krcs/tekivex-ui/blob/master/landing/src/pages/examples/PropertyTour.tsx"
      surface="light"
    >
      <PropertyStyles />

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '24px 24px 64px' }}>
        {/* Top row: title + price + stats */}
        <header style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', gap: 18, alignItems: 'flex-end', flexWrap: 'wrap', marginBottom: 18 }} className="prop-header">
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#06b6d4', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
              For sale · Available {PROPERTY.available}
            </div>
            <h2 style={{ margin: '0 0 4px', fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
              {PROPERTY.title}
            </h2>
            <div style={{ color: '#475569', fontSize: 15 }}>{PROPERTY.address}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
              ₹{PROPERTY.priceTotal.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: 13, color: '#64748b' }}>
              or ₹{PROPERTY.priceMonthly.toLocaleString('en-IN')}/mo rent
            </div>
          </div>
        </header>

        {/* Stats strip */}
        <div className="prop-stats">
          <Stat icon="🛏️" label="Bedrooms" value={String(PROPERTY.beds)} />
          <Stat icon="🛁" label="Bathrooms" value={String(PROPERTY.baths)} />
          <Stat icon="📐" label="Carpet area" value={`${PROPERTY.area} sq ft`} />
          <Stat icon="🚗" label="Parking" value={`${PROPERTY.parking} spot`} />
          <Stat icon="🏛️" label="Year built" value="2024" />
        </div>

        <div className="prop-layout">
          {/* Left column: 360° tour */}
          <div>
            <div className="prop-tour-shell">
              <TkxScene fov={75} cameraPosition={[0, 0, 0.01]} background="transparent">
                <TkxPanorama360 src={activeSrc} fadeMs={500} gyro />
                <TkxParticleField count={400} volume={[40, 20, 40]} driftSpeed={0.1} size={0.02} />
                {active.hotspots.map((h) => (
                  <TkxHotspot
                    key={`${active.id}-${h.to}`}
                    position={h.pos}
                    label={h.label}
                    color={h.color}
                    size={1.4}
                    pulseSpeed={2}
                    onClick={() => setActiveRoomId(h.to)}
                  />
                ))}
              </TkxScene>
              <div className="prop-tour-hud">
                <div className="prop-tour-hud-card">
                  <span className="prop-eyebrow">Now viewing</span>
                  <span className="prop-tour-room">{active.emoji} {active.label}</span>
                </div>
                <button
                  type="button"
                  className="prop-fullscreen-btn"
                  onClick={() => {
                    const el = document.querySelector('.prop-tour-shell');
                    if (document.fullscreenElement) document.exitFullscreen();
                    else (el as HTMLElement | null)?.requestFullscreen?.();
                  }}
                >
                  ⛶ Fullscreen
                </button>
              </div>
              <div className="prop-tour-hint" aria-hidden="true">
                🖱️ drag to look · 🎯 click a glowing dot to enter that room · 📱 tilt your phone
              </div>
            </div>

            {/* Room thumbnails */}
            <div className="prop-rooms">
              {ROOMS.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setActiveRoomId(r.id)}
                  aria-pressed={r.id === activeRoomId}
                  className={`prop-room-btn ${r.id === activeRoomId ? 'is-active' : ''}`}
                  style={{
                    background: `linear-gradient(180deg, ${r.palette.ceiling} 0%, ${r.palette.ceilingDark} 30%, ${r.palette.wall} 30%, ${r.palette.wall} 70%, ${r.palette.floor} 70%, ${r.palette.floorDark} 100%)`,
                  }}
                >
                  <span className="prop-room-emoji" style={{ color: r.palette.accent }}>{r.emoji}</span>
                  <span>{r.label}</span>
                </button>
              ))}
            </div>

            {/* Description + features */}
            <section style={{ marginTop: 36 }}>
              <h3 style={{ margin: '0 0 10px', fontSize: 22, color: '#0f172a', fontWeight: 800, letterSpacing: '-0.01em' }}>
                About this home
              </h3>
              <p style={{ margin: '0 0 16px', color: '#475569', fontSize: 15.5, lineHeight: 1.7 }}>
                A bright, garden-facing apartment on the second floor of Aurora Court, with two bedrooms,
                two full bathrooms, an open kitchen-living plan, and a 90 sq ft balcony that opens onto
                the garden. The unit was completely renovated in 2024 — Italian marble counters, oak
                flooring, smart-home wiring throughout — and is offered furnished or unfurnished.
              </p>
              <div className="prop-features">
                {PROPERTY.features.map((f) => (
                  <div key={f} className="prop-feature">
                    <span style={{ color: '#06b6d4' }}>✓</span>
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Mortgage calculator */}
            <section className="prop-card" style={{ marginTop: 28 }}>
              <h3 style={{ margin: '0 0 10px', fontSize: 18, color: '#0f172a', fontWeight: 800 }}>
                Estimate your monthly payment
              </h3>
              <div className="prop-calc-grid">
                <Slider
                  label="Down payment"
                  value={downPaymentPct}
                  min={0}
                  max={50}
                  step={1}
                  unit="%"
                  onChange={setDownPaymentPct}
                />
                <Slider
                  label="Loan term"
                  value={years}
                  min={5}
                  max={30}
                  step={1}
                  unit=" yr"
                  onChange={setYears}
                />
                <Slider
                  label="Interest rate"
                  value={rate}
                  min={5}
                  max={14}
                  step={0.1}
                  unit="%"
                  onChange={setRate}
                  decimals={1}
                />
              </div>
              <div className="prop-calc-result">
                <div>
                  <span className="prop-eyebrow">Estimated monthly</span>
                  <div style={{ fontSize: 28, fontWeight: 800, color: '#4f46e5', letterSpacing: '-0.02em' }}>
                    ₹{monthly.toLocaleString('en-IN')}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className="prop-eyebrow">Down payment</span>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>
                    ₹{Math.round(PROPERTY.priceTotal * downPaymentPct / 100).toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
              <p style={{ margin: '12px 0 0', fontSize: 12, color: '#94a3b8' }}>
                Estimate only. Doesn't include taxes, insurance, or maintenance fees.
              </p>
            </section>
          </div>

          {/* Right column: agent + visit form */}
          <aside className="prop-aside">
            <div className="prop-card">
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 14 }}>
                <div className="prop-avatar">{PROPERTY.agent.initials}</div>
                <div>
                  <div style={{ fontWeight: 800, color: '#0f172a' }}>{PROPERTY.agent.name}</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>{PROPERTY.agent.title}</div>
                  <div style={{ fontSize: 12, color: '#f59e0b', marginTop: 2 }}>
                    ★ {PROPERTY.agent.rating} · {PROPERTY.agent.deals} deals closed
                  </div>
                </div>
              </div>
              <a href={`tel:${PROPERTY.agent.phone}`} className="prop-btn-secondary">
                📞 {PROPERTY.agent.phone}
              </a>
              <a href={`mailto:${PROPERTY.agent.email}`} className="prop-btn-secondary" style={{ marginTop: 8 }}>
                ✉ {PROPERTY.agent.email}
              </a>
            </div>

            <VisitForm propertyTitle={PROPERTY.title} />

            <div className="prop-card" style={{ background: '#eff6ff', borderColor: '#bfdbfe' }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 22 }}>💡</span>
                <div>
                  <div style={{ fontWeight: 800, color: '#0f172a', fontSize: 14, marginBottom: 4 }}>
                    Why this listing has a tour
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: '#1e40af', lineHeight: 1.55 }}>
                    Listings with a 360° walkthrough convert <strong>3.4× higher</strong> than photo-only
                    listings (NAR, 2024). The tour above is built with{' '}
                    <code style={{ background: 'rgba(79, 70, 229, 0.08)', padding: '0 4px', borderRadius: 3 }}>
                      tekivex-3d
                    </code>{' '}
                    in ~80 lines of React.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>

        <OpenSourceFooter />

        {/* Code reveal */}
        <details className="prop-code-reveal">
          <summary>Show the source for the tour</summary>
          <pre>{`import { TkxScene, TkxPanorama360, TkxHotspot } from 'tekivex-3d';

const ROOMS = [
  { id: 'living',  src: withBase('/living.jpg'),  hotspots: [{ to: 'kitchen', pos: [-22, 2, -10], color: '#06b6d4', label: '🍳 Kitchen' }] },
  { id: 'kitchen', src: withBase('/kitchen.jpg'), hotspots: [{ to: 'living',  pos: [0, 2, -22], color: '#4f46e5', label: '↩ Living room' }] },
];

function Tour() {
  const [activeId, setActiveId] = useState('living');
  const active = ROOMS.find((r) => r.id === activeId);
  return (
    <TkxScene fov={75} cameraPosition={[0, 0, 0.01]}>
      <TkxPanorama360 src={active.src} gyro />
      {active.hotspots.map((h) => (
        <TkxHotspot
          key={h.to}
          position={h.pos}
          label={h.label}
          color={h.color}
          onClick={() => setActiveId(h.to)}
        />
      ))}
    </TkxScene>
  );
}`}</pre>
        </details>
      </div>
    </ExampleShell>
  );
}

// ─── pieces ──────────────────────────────────────────────────────────────

function Stat({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="prop-stat">
      <div style={{ fontSize: 22 }}>{icon}</div>
      <div style={{ fontWeight: 800, color: '#0f172a' }}>{value}</div>
      <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
    </div>
  );
}

function Slider({
  label, value, min, max, step, unit, onChange, decimals = 0,
}: { label: string; value: number; min: number; max: number; step: number; unit: string; onChange: (v: number) => void; decimals?: number }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#475569', fontWeight: 700 }}>
        <span>{label}</span>
        <span style={{ color: '#0f172a' }}>{value.toFixed(decimals)}{unit}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ accentColor: '#4f46e5' }}
      />
    </label>
  );
}

function VisitForm({ propertyTitle }: { propertyTitle: string }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState('');
  const [submitted, setSubmitted] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !date) return;
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="prop-card" style={{ background: '#ecfdf5', borderColor: '#bbf7d0' }}>
        <div style={{ fontSize: 28, marginBottom: 6 }}>✅</div>
        <div style={{ fontWeight: 800, color: '#065f46', marginBottom: 4 }}>Visit request sent</div>
        <p style={{ margin: 0, fontSize: 13, color: '#047857', lineHeight: 1.55 }}>
          We'll text {phone} within 30 minutes to confirm your viewing for {propertyTitle} on {date}.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="prop-card" aria-label="Schedule a viewing">
      <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: 10, fontSize: 15 }}>
        Schedule a viewing
      </div>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Your full name"
        required
        className="prop-input"
      />
      <input
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="+91 phone number"
        required
        className="prop-input"
        style={{ marginTop: 8 }}
      />
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        required
        className="prop-input"
        style={{ marginTop: 8 }}
      />
      <button type="submit" className="prop-btn-primary" style={{ marginTop: 10 }}>
        Request a visit
      </button>
      <p style={{ margin: '8px 0 0', fontSize: 11, color: '#94a3b8', lineHeight: 1.5 }}>
        Mock form — submission stored locally only. Wire to your CRM in production.
      </p>
    </form>
  );
}

function PropertyStyles() {
  return (
    <style>{`
      .prop-stats {
        display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: 10px; margin-bottom: 24px;
      }
      .prop-stat {
        background: #f8fafc; border: 1px solid #e6e8ef; border-radius: 10px;
        padding: 12px; display: flex; flex-direction: column; align-items: center; gap: 4px;
      }
      .prop-layout {
        display: grid; grid-template-columns: minmax(0, 1fr) 320px; gap: 24px;
      }
      .prop-aside { display: flex; flex-direction: column; gap: 16px; }
      .prop-card {
        background: #ffffff; border: 1px solid #e6e8ef; border-radius: 14px;
        padding: 18px; box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
      }
      .prop-tour-shell {
        position: relative; aspect-ratio: 16 / 10; border-radius: 14px; overflow: hidden;
        border: 1px solid #e6e8ef; background: #0a0b15; box-shadow: 0 4px 20px rgba(15, 23, 42, 0.08);
      }
      .prop-tour-hud {
        position: absolute; top: 14px; left: 14px; right: 14px;
        display: flex; justify-content: space-between; align-items: flex-start; gap: 10px;
        pointer-events: none;
      }
      .prop-tour-hud > * { pointer-events: auto; }
      .prop-tour-hud-card {
        background: rgba(10, 11, 21, 0.78); backdrop-filter: blur(8px);
        padding: 8px 14px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1);
        display: flex; flex-direction: column; gap: 2px;
      }
      .prop-eyebrow {
        font-size: 10.5px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 700;
      }
      .prop-tour-room { color: #fff; font-weight: 800; font-size: 14px; }
      .prop-fullscreen-btn {
        padding: 8px 14px; border-radius: 999px; font-size: 12px; font-weight: 700; cursor: pointer;
        background: rgba(10, 11, 21, 0.78); color: #06b6d4; border: 1px solid rgba(6, 182, 212, 0.4);
        font-family: inherit;
      }
      .prop-tour-hint {
        position: absolute; bottom: 16px; left: 50%; transform: translateX(-50%);
        background: rgba(10, 11, 21, 0.7); color: #cbd5e1; padding: 6px 14px;
        border-radius: 999px; font-size: 11.5px; border: 1px solid rgba(255,255,255,0.1);
        white-space: nowrap; max-width: calc(100% - 24px);
        overflow: hidden; text-overflow: ellipsis;
      }
      .prop-rooms {
        display: grid; grid-template-columns: repeat(${ROOMS.length}, 1fr); gap: 10px;
        margin-top: 14px;
      }
      .prop-room-btn {
        position: relative; padding: 0; border-radius: 10px; overflow: hidden;
        cursor: pointer; background: #f8fafc; aspect-ratio: 16 / 10;
        border: 2px solid #e6e8ef; transition: border-color 0.15s, transform 0.15s;
        font-family: inherit;
      }
      .prop-room-btn {
        display: flex; flex-direction: column; align-items: flex-start;
        justify-content: flex-end; padding: 14px;
        color: #1e293b; gap: 4px;
      }
      .prop-room-btn > span:last-child {
        font-size: 13px; font-weight: 800;
        text-shadow: 0 1px 2px rgba(255,255,255,0.5);
      }
      .prop-room-emoji {
        font-size: 26px; line-height: 1;
        text-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
      }
      .prop-room-btn.is-active {
        border-color: #06b6d4; transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(6, 182, 212, 0.18);
      }
      .prop-features {
        display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 8px 16px;
        margin-top: 12px;
      }
      .prop-feature {
        display: flex; gap: 8px; align-items: flex-start;
        font-size: 14px; color: #1e293b;
      }
      .prop-calc-grid {
        display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 14px;
        margin-bottom: 14px;
      }
      .prop-calc-result {
        display: flex; justify-content: space-between; align-items: flex-end;
        padding: 12px 14px; border-radius: 10px;
        background: linear-gradient(135deg, #eef2ff, #ecfeff);
        border: 1px solid #c7d2fe;
      }
      .prop-avatar {
        width: 52px; height: 52px; border-radius: 50%;
        background: linear-gradient(135deg, #4f46e5, #06b6d4); color: #fff;
        display: grid; place-items: center; font-weight: 800; font-size: 18px;
      }
      .prop-input {
        width: 100%; padding: 10px 12px; border-radius: 8px;
        border: 1px solid #e6e8ef; font-size: 14px; font-family: inherit;
        color: #0f172a; background: #fff;
      }
      .prop-btn-primary {
        display: block; width: 100%; padding: 10px 14px; border-radius: 8px;
        background: linear-gradient(135deg, #4f46e5, #06b6d4); color: #fff;
        border: none; font-size: 14px; font-weight: 700; cursor: pointer;
        font-family: inherit; text-align: center; text-decoration: none;
      }
      .prop-btn-secondary {
        display: block; width: 100%; padding: 9px 14px; border-radius: 8px;
        background: #f8fafc; color: #1e293b; border: 1px solid #e6e8ef;
        font-size: 13px; font-weight: 600; cursor: pointer;
        font-family: inherit; text-align: center; text-decoration: none;
      }
      .prop-code-reveal {
        margin-top: 32px; background: #f8fafc; border: 1px solid #e6e8ef;
        border-radius: 12px; padding: 12px 16px;
      }
      .prop-code-reveal summary { cursor: pointer; font-weight: 700; font-size: 14px; color: #0f172a; }
      .prop-code-reveal pre {
        margin: 12px 0 0; padding: 16px; background: #0f172a; color: #e2e8f0;
        border-radius: 8px; font-size: 12.5px; line-height: 1.6; overflow-x: auto;
        font-family: ui-monospace, monospace;
      }
      @media (max-width: 920px) {
        .prop-layout { grid-template-columns: 1fr; }
        .prop-rooms { grid-template-columns: repeat(2, 1fr) !important; }
        .prop-header { grid-template-columns: 1fr !important; }
      }
    `}</style>
  );
}
