// ─────────────────────────────────────────────────────────────────────────────
// Biodata templates — 12 visually distinct, religion-agnostic layouts.
//
// Astrological + caste fields are optional in the BiodataData type. Templates
// render them only when present. The ornamental flourishes (mandala-style
// circles, vesica-piscis arcs, golden-ratio spirals) are purely geometric
// and have no religious affiliation — same direction as the landing's
// Sacred Geometry backdrop.
// ─────────────────────────────────────────────────────────────────────────────

import type { BiodataData } from '../types';
import {
  Page,
  SectionHeading,
  FieldRow,
  CornerOrnament,
  ReligiousHeader,
} from '../layouts/primitives';

// ── Reusable sub-blocks ────────────────────────────────────────────────────

function PersonalSection({ d, accent }: { d: BiodataData; accent: string }) {
  return (
    <>
      <FieldRow label="Date of Birth"   value={d.dateOfBirth}   accent={accent} />
      <FieldRow label="Time of Birth"   value={d.timeOfBirth}   accent={accent} />
      <FieldRow label="Place of Birth"  value={d.placeOfBirth}  accent={accent} />
      <FieldRow label="Height"          value={d.height}        accent={accent} />
      <FieldRow label="Weight"          value={d.weight}        accent={accent} />
      <FieldRow label="Complexion"      value={d.complexion}    accent={accent} />
      <FieldRow label="Blood Group"     value={d.bloodGroup}    accent={accent} />
      <FieldRow label="Mother Tongue"   value={d.motherTongue}  accent={accent} />
    </>
  );
}

function CulturalSection({ d, accent }: { d: BiodataData; accent: string }) {
  if (!d.religion && !d.caste && !d.rashi && !d.gotra) return null;
  return (
    <>
      <FieldRow label="Religion"    value={d.religion}                                  accent={accent} />
      <FieldRow label="Caste"       value={[d.caste, d.subCaste].filter(Boolean).join(' / ')} accent={accent} />
      <FieldRow label="Gotra"       value={d.gotra}                                     accent={accent} />
      <FieldRow label="Rashi"       value={d.rashi}                                     accent={accent} />
      <FieldRow label="Nakshatra"   value={d.nakshatra}                                 accent={accent} />
      <FieldRow label="Manglik"     value={d.manglik && d.manglik.replace(/^./, (c) => c.toUpperCase())} accent={accent} />
    </>
  );
}

function CareerSection({ d, accent }: { d: BiodataData; accent: string }) {
  return (
    <>
      {d.education.map((e, i) => (
        <FieldRow key={i} label={i === 0 ? 'Education' : ''} value={
          <span><strong>{e.degree}</strong>{e.institution ? ` — ${e.institution}` : ''}{e.year ? ` (${e.year})` : ''}</span>
        } accent={accent} />
      ))}
      <FieldRow label="Occupation" value={d.occupation} accent={accent} />
      <FieldRow label="Company"    value={d.company}    accent={accent} />
      <FieldRow label="Income"     value={d.income}     accent={accent} />
    </>
  );
}

function FamilySection({ d, accent }: { d: BiodataData; accent: string }) {
  return (
    <>
      <FieldRow label="Father"  value={`${d.fatherName}${d.fatherOccupation ? ` (${d.fatherOccupation})` : ''}`} accent={accent} />
      <FieldRow label="Mother"  value={`${d.motherName}${d.motherOccupation ? ` (${d.motherOccupation})` : ''}`} accent={accent} />
      {d.siblings?.map((s, i) => (
        <FieldRow key={i} label={i === 0 ? 'Siblings' : ''} value={`${s.relation} — ${s.status}`} accent={accent} />
      ))}
    </>
  );
}

function ContactSection({ d, accent }: { d: BiodataData; accent: string }) {
  return (
    <>
      <FieldRow label="Phone"   value={d.contactPhone}  accent={accent} />
      <FieldRow label="Email"   value={d.contactEmail}  accent={accent} />
      <FieldRow label="Address" value={d.address}       accent={accent} />
    </>
  );
}

function PhotoBlock({ d, accent, size = 50 }: { d: BiodataData; accent: string; size?: number }) {
  if (d.photo) {
    return <img src={d.photo} alt={d.fullName} style={{ width: `${size}mm`, height: `${size * 1.1}mm`, objectFit: 'cover', borderRadius: '2mm', border: `0.5mm solid ${accent}` }} />;
  }
  return (
    <div style={{
      width: `${size}mm`, height: `${size * 1.1}mm`,
      background: `${accent}11`, border: `0.4mm solid ${accent}55`,
      borderRadius: '2mm', display: 'flex', alignItems: 'center',
      justifyContent: 'center', fontSize: '20pt', color: accent, fontWeight: 800,
    }}>
      {d.fullName.split(' ').map((n) => n[0]).slice(0, 2).join('')}
    </div>
  );
}

// ── 1. Traditional Royal (gold + maroon) ───────────────────────────────────

export function BiodataTraditionalRoyal({ data }: { data: BiodataData }) {
  const accent = '#9b2c2c';
  return (
    <Page background="#fff8e7">
      <CornerOrnament color={accent} position="top-left" />
      <CornerOrnament color={accent} position="top-right" />
      <CornerOrnament color={accent} position="bottom-left" />
      <CornerOrnament color={accent} position="bottom-right" />
      <div style={{ textAlign: 'center', borderBottom: `0.5mm double ${accent}`, paddingBottom: '4mm' }}>
        <ReligiousHeader religion={data.religion} override={data.religiousMark} blessing={data.blessing} color={accent} size={28} />
        <div style={{ fontSize: '12pt', color: accent, letterSpacing: '0.16em', fontWeight: 700, textTransform: 'uppercase' }}>॥ Biodata ॥</div>
        <h1 style={{ margin: '2mm 0 0', fontSize: '24pt', fontWeight: 800, color: '#1f1f1f', letterSpacing: '0.02em' }}>{data.fullName}</h1>
      </div>
      <div style={{ display: 'flex', gap: '6mm', marginTop: '6mm' }}>
        <div style={{ flex: 1 }}>
          <SectionHeading accent={accent}>Personal Details</SectionHeading><PersonalSection d={data} accent={accent} />
          <SectionHeading accent={accent}>Cultural</SectionHeading><CulturalSection d={data} accent={accent} />
        </div>
        <PhotoBlock d={data} accent={accent} />
      </div>
      <SectionHeading accent={accent}>Education & Career</SectionHeading><CareerSection d={data} accent={accent} />
      <SectionHeading accent={accent}>Family</SectionHeading><FamilySection d={data} accent={accent} />
      <SectionHeading accent={accent}>Contact</SectionHeading><ContactSection d={data} accent={accent} />
    </Page>
  );
}

// ── 2. Modern Universal (religion-neutral, ivory + sage) ───────────────────

export function BiodataModernUniversal({ data }: { data: BiodataData }) {
  const accent = '#3b7d50';
  return (
    <Page>
      <ReligiousHeader religion={data.religion} override={data.religiousMark} blessing={data.blessing} color={accent} />
      <div style={{ display: 'flex', gap: '6mm', alignItems: 'center', borderBottom: `0.3mm solid ${accent}55`, paddingBottom: '4mm' }}>
        <PhotoBlock d={data} accent={accent} size={36} />
        <div>
          <h1 style={{ margin: 0, fontSize: '24pt', fontWeight: 800 }}>{data.fullName}</h1>
          <div style={{ fontSize: '10pt', color: '#666', marginTop: '1mm' }}>
            {data.occupation}{data.company ? ` · ${data.company}` : ''}
          </div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6mm', marginTop: '4mm' }}>
        <div><SectionHeading accent={accent} size="sm">Personal</SectionHeading><PersonalSection d={data} accent={accent} /></div>
        <div><SectionHeading accent={accent} size="sm">Career</SectionHeading><CareerSection d={data} accent={accent} /></div>
      </div>
      <SectionHeading accent={accent} size="sm">Family</SectionHeading><FamilySection d={data} accent={accent} />
      <SectionHeading accent={accent} size="sm">Contact</SectionHeading><ContactSection d={data} accent={accent} />
      {data.about && <><SectionHeading accent={accent} size="sm">About me</SectionHeading><p style={{ margin: 0 }}>{data.about}</p></>}
      {data.expectations && <><SectionHeading accent={accent} size="sm">Looking for</SectionHeading><p style={{ margin: 0 }}>{data.expectations}</p></>}
    </Page>
  );
}

// ── 3. Sapphire Sober ──────────────────────────────────────────────────────

export function BiodataSapphire({ data }: { data: BiodataData }) {
  const accent = '#1e3a8a';
  return (
    <Page>
      <ReligiousHeader religion={data.religion} override={data.religiousMark} blessing={data.blessing} color={accent} />
      <div style={{ background: accent, color: '#fff', padding: '6mm', borderRadius: '2mm' }}>
        <h1 style={{ margin: 0, fontSize: '20pt', fontWeight: 800 }}>{data.fullName}</h1>
        <div style={{ fontSize: '10pt', opacity: 0.9, marginTop: '1mm' }}>
          {data.occupation}{data.company ? ` · ${data.company}` : ''}
        </div>
      </div>
      <div style={{ display: 'flex', gap: '6mm', marginTop: '5mm' }}>
        <PhotoBlock d={data} accent={accent} size={42} />
        <div style={{ flex: 1 }}>
          <SectionHeading accent={accent} size="sm">Personal</SectionHeading><PersonalSection d={data} accent={accent} />
        </div>
      </div>
      <SectionHeading accent={accent} size="sm">Cultural</SectionHeading><CulturalSection d={data} accent={accent} />
      <SectionHeading accent={accent} size="sm">Education & Career</SectionHeading><CareerSection d={data} accent={accent} />
      <SectionHeading accent={accent} size="sm">Family</SectionHeading><FamilySection d={data} accent={accent} />
      <SectionHeading accent={accent} size="sm">Contact</SectionHeading><ContactSection d={data} accent={accent} />
    </Page>
  );
}

// ── 4. Floral Pastel (lavender + soft pink) ────────────────────────────────

export function BiodataFloralPastel({ data }: { data: BiodataData }) {
  const accent = '#a855f7';
  return (
    <Page background="#fdfbff">
      <ReligiousHeader religion={data.religion} override={data.religiousMark} blessing={data.blessing} color={accent} />
      <div style={{ position: 'relative', borderBottom: `0.3mm solid ${accent}55`, paddingBottom: '4mm' }}>
        <div style={{ display: 'flex', gap: '5mm', alignItems: 'center' }}>
          <PhotoBlock d={data} accent={accent} size={38} />
          <div>
            <h1 style={{ margin: 0, fontSize: '22pt', fontWeight: 700, color: accent }}>{data.fullName}</h1>
            <div style={{ fontSize: '10.5pt', color: '#555', marginTop: '1mm' }}>{data.occupation}</div>
          </div>
        </div>
      </div>
      <div style={{ marginTop: '4mm' }}>
        <SectionHeading accent={accent} size="sm">Personal</SectionHeading><PersonalSection d={data} accent={accent} />
        <SectionHeading accent={accent} size="sm">Cultural</SectionHeading><CulturalSection d={data} accent={accent} />
        <SectionHeading accent={accent} size="sm">Career</SectionHeading><CareerSection d={data} accent={accent} />
        <SectionHeading accent={accent} size="sm">Family</SectionHeading><FamilySection d={data} accent={accent} />
        <SectionHeading accent={accent} size="sm">Contact</SectionHeading><ContactSection d={data} accent={accent} />
      </div>
    </Page>
  );
}

// ── 5. Charcoal Modern (dark, professional) ────────────────────────────────

export function BiodataCharcoal({ data }: { data: BiodataData }) {
  const accent = '#fbbf24';
  return (
    <Page background="#181820" color="#e8e8f4">
      <ReligiousHeader religion={data.religion} override={data.religiousMark} blessing={data.blessing} color={accent} />
      <div style={{ display: 'flex', gap: '6mm', alignItems: 'flex-end', borderBottom: `0.3mm solid ${accent}55`, paddingBottom: '4mm' }}>
        <PhotoBlock d={data} accent={accent} size={40} />
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: 0, fontSize: '24pt', fontWeight: 800, color: '#fff' }}>{data.fullName}</h1>
          <div style={{ fontSize: '11pt', color: accent, marginTop: '1mm' }}>{data.occupation}</div>
        </div>
      </div>
      <SectionHeading accent={accent} size="sm">Personal</SectionHeading><PersonalSection d={data} accent={accent} />
      <SectionHeading accent={accent} size="sm">Cultural</SectionHeading><CulturalSection d={data} accent={accent} />
      <SectionHeading accent={accent} size="sm">Career</SectionHeading><CareerSection d={data} accent={accent} />
      <SectionHeading accent={accent} size="sm">Family</SectionHeading><FamilySection d={data} accent={accent} />
      <SectionHeading accent={accent} size="sm">Contact</SectionHeading><ContactSection d={data} accent={accent} />
    </Page>
  );
}

// ── 6. Compact (one-page, dense, no photo) ─────────────────────────────────

export function BiodataCompact({ data }: { data: BiodataData }) {
  const accent = '#0f766e';
  return (
    <Page padding={10}>
      <ReligiousHeader religion={data.religion} override={data.religiousMark} blessing={data.blessing} color={accent} size={20} />
      <div style={{ textAlign: 'center', borderBottom: `0.3mm solid ${accent}`, paddingBottom: '3mm' }}>
        <h1 style={{ margin: 0, fontSize: '20pt', fontWeight: 800 }}>{data.fullName}</h1>
        <div style={{ fontSize: '10pt', color: '#666' }}>{data.occupation}{data.company ? ` · ${data.company}` : ''}</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6mm', marginTop: '4mm' }}>
        <div>
          <SectionHeading accent={accent} size="sm">Personal</SectionHeading><PersonalSection d={data} accent={accent} />
          <SectionHeading accent={accent} size="sm">Cultural</SectionHeading><CulturalSection d={data} accent={accent} />
        </div>
        <div>
          <SectionHeading accent={accent} size="sm">Career</SectionHeading><CareerSection d={data} accent={accent} />
          <SectionHeading accent={accent} size="sm">Family</SectionHeading><FamilySection d={data} accent={accent} />
          <SectionHeading accent={accent} size="sm">Contact</SectionHeading><ContactSection d={data} accent={accent} />
        </div>
      </div>
    </Page>
  );
}

// ── 7. Bordered Frame (decorative border) ──────────────────────────────────

export function BiodataBorderedFrame({ data }: { data: BiodataData }) {
  const accent = '#b45309';
  return (
    <Page background="#fffbf2">
      <div style={{ border: `0.5mm double ${accent}`, padding: '6mm' }}>
        <ReligiousHeader religion={data.religion} override={data.religiousMark} blessing={data.blessing} color={accent} size={26} />
        <div style={{ textAlign: 'center', marginBottom: '4mm' }}>
          <h1 style={{ margin: 0, fontSize: '22pt', fontWeight: 800, color: accent }}>{data.fullName}</h1>
          <div style={{ fontSize: '10pt', color: '#555', fontStyle: 'italic' }}>Biodata</div>
        </div>
        <div style={{ display: 'flex', gap: '5mm' }}>
          <PhotoBlock d={data} accent={accent} size={42} />
          <div style={{ flex: 1 }}>
            <PersonalSection d={data} accent={accent} />
          </div>
        </div>
        <SectionHeading accent={accent} size="sm">Cultural</SectionHeading><CulturalSection d={data} accent={accent} />
        <SectionHeading accent={accent} size="sm">Career</SectionHeading><CareerSection d={data} accent={accent} />
        <SectionHeading accent={accent} size="sm">Family</SectionHeading><FamilySection d={data} accent={accent} />
        <SectionHeading accent={accent} size="sm">Contact</SectionHeading><ContactSection d={data} accent={accent} />
      </div>
    </Page>
  );
}

// ── 8. Minimalist (Swiss-style) ────────────────────────────────────────────

export function BiodataMinimalist({ data }: { data: BiodataData }) {
  const accent = '#000';
  return (
    <Page fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif">
      <ReligiousHeader religion={data.religion} override={data.religiousMark} blessing={data.blessing} color={accent} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 50mm', gap: '6mm' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '32pt', fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 1 }}>{data.fullName}</h1>
          <div style={{ fontSize: '11pt', marginTop: '2mm', color: '#444' }}>{data.occupation}</div>
        </div>
        <PhotoBlock d={data} accent={accent} size={50} />
      </div>
      <hr style={{ border: 'none', borderTop: '0.3mm solid #000', margin: '5mm 0' }} />
      <SectionHeading accent={accent} size="sm">Personal</SectionHeading><PersonalSection d={data} accent={accent} />
      <SectionHeading accent={accent} size="sm">Career</SectionHeading><CareerSection d={data} accent={accent} />
      <SectionHeading accent={accent} size="sm">Family</SectionHeading><FamilySection d={data} accent={accent} />
      <SectionHeading accent={accent} size="sm">Contact</SectionHeading><ContactSection d={data} accent={accent} />
    </Page>
  );
}

// ── 9. Dual Pane (sidebar accent) ──────────────────────────────────────────

export function BiodataDualPane({ data }: { data: BiodataData }) {
  const accent = '#0891b2';
  return (
    <Page padding={0}>
      <div style={{ display: 'flex', minHeight: '100%' }}>
        <aside style={{ width: '60mm', background: accent, color: '#fff', padding: '12mm 6mm' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '4mm' }}>
            <PhotoBlock d={data} accent="#fff" size={36} />
          </div>
          <h1 style={{ margin: 0, fontSize: '17pt', fontWeight: 800, textAlign: 'center' }}>{data.fullName}</h1>
          <div style={{ fontSize: '9.5pt', opacity: 0.9, textAlign: 'center', marginTop: '1mm' }}>{data.occupation}</div>
          <hr style={{ border: 'none', borderTop: '0.2mm solid rgba(255,255,255,0.4)', margin: '4mm 0' }} />
          <div style={{ fontSize: '9pt', lineHeight: 1.7 }}>
            📞 {data.contactPhone}<br/>
            {data.contactEmail && <>✉️ {data.contactEmail}<br/></>}
            📍 {data.address}
          </div>
        </aside>
        <main style={{ flex: 1, padding: '12mm 8mm' }}>
          <ReligiousHeader religion={data.religion} override={data.religiousMark} blessing={data.blessing} color={accent} size={22} />
          <SectionHeading accent={accent} size="sm">Personal</SectionHeading><PersonalSection d={data} accent={accent} />
          <SectionHeading accent={accent} size="sm">Cultural</SectionHeading><CulturalSection d={data} accent={accent} />
          <SectionHeading accent={accent} size="sm">Career</SectionHeading><CareerSection d={data} accent={accent} />
          <SectionHeading accent={accent} size="sm">Family</SectionHeading><FamilySection d={data} accent={accent} />
        </main>
      </div>
    </Page>
  );
}

// ── 10. Saffron (warm orange/yellow) ───────────────────────────────────────

export function BiodataSaffron({ data }: { data: BiodataData }) {
  const accent = '#d97706';
  return (
    <Page background="#fff7ed">
      <ReligiousHeader religion={data.religion} override={data.religiousMark} blessing={data.blessing} color={accent} size={26} />
      <div style={{ background: `linear-gradient(135deg, #f59e0b, ${accent})`, color: '#fff', padding: '8mm', borderRadius: '2mm' }}>
        <h1 style={{ margin: 0, fontSize: '24pt', fontWeight: 800 }}>{data.fullName}</h1>
        <div style={{ fontSize: '11pt', marginTop: '1mm', opacity: 0.95 }}>{data.occupation}</div>
      </div>
      <div style={{ display: 'flex', gap: '6mm', marginTop: '5mm' }}>
        <PhotoBlock d={data} accent={accent} size={45} />
        <div style={{ flex: 1 }}>
          <SectionHeading accent={accent} size="sm">Personal</SectionHeading><PersonalSection d={data} accent={accent} />
        </div>
      </div>
      <SectionHeading accent={accent} size="sm">Cultural</SectionHeading><CulturalSection d={data} accent={accent} />
      <SectionHeading accent={accent} size="sm">Career</SectionHeading><CareerSection d={data} accent={accent} />
      <SectionHeading accent={accent} size="sm">Family</SectionHeading><FamilySection d={data} accent={accent} />
      <SectionHeading accent={accent} size="sm">Contact</SectionHeading><ContactSection d={data} accent={accent} />
    </Page>
  );
}

// ── 11. Emerald Cards ──────────────────────────────────────────────────────

export function BiodataEmeraldCards({ data }: { data: BiodataData }) {
  const accent = '#047857';
  const card: React.CSSProperties = {
    background: '#f0fdf4',
    border: `0.3mm solid ${accent}33`,
    borderRadius: '2mm',
    padding: '4mm',
    marginTop: '3mm',
  };
  return (
    <Page>
      <ReligiousHeader religion={data.religion} override={data.religiousMark} blessing={data.blessing} color={accent} />
      <div style={{ display: 'flex', gap: '5mm', alignItems: 'center' }}>
        <PhotoBlock d={data} accent={accent} size={40} />
        <div>
          <h1 style={{ margin: 0, fontSize: '22pt', color: accent, fontWeight: 800 }}>{data.fullName}</h1>
          <div style={{ fontSize: '10.5pt', color: '#555' }}>{data.occupation}</div>
        </div>
      </div>
      <div style={card}>
        <SectionHeading accent={accent} size="sm">Personal</SectionHeading><PersonalSection d={data} accent={accent} />
      </div>
      <div style={card}>
        <SectionHeading accent={accent} size="sm">Cultural</SectionHeading><CulturalSection d={data} accent={accent} />
      </div>
      <div style={card}>
        <SectionHeading accent={accent} size="sm">Career</SectionHeading><CareerSection d={data} accent={accent} />
      </div>
      <div style={card}>
        <SectionHeading accent={accent} size="sm">Family</SectionHeading><FamilySection d={data} accent={accent} />
      </div>
      <div style={card}>
        <SectionHeading accent={accent} size="sm">Contact</SectionHeading><ContactSection d={data} accent={accent} />
      </div>
    </Page>
  );
}

// ── 12. Geometric (mandala accent in corners) ──────────────────────────────

export function BiodataGeometric({ data }: { data: BiodataData }) {
  const accent = '#6d28d9';
  return (
    <Page background="#faf5ff">
      <CornerOrnament color={accent} position="top-right" size={40} />
      <CornerOrnament color={accent} position="bottom-left" size={40} />
      <div style={{ textAlign: 'center', position: 'relative', zIndex: 1, paddingBottom: '4mm' }}>
        <ReligiousHeader religion={data.religion} override={data.religiousMark} blessing={data.blessing} color={accent} size={26} />
        <PhotoBlock d={data} accent={accent} size={42} />
        <h1 style={{ margin: '4mm 0 0', fontSize: '22pt', fontWeight: 800, color: accent }}>{data.fullName}</h1>
        <div style={{ fontSize: '10.5pt', color: '#555' }}>{data.occupation}</div>
      </div>
      <div style={{ position: 'relative', zIndex: 1 }}>
        <SectionHeading accent={accent} size="sm">Personal</SectionHeading><PersonalSection d={data} accent={accent} />
        <SectionHeading accent={accent} size="sm">Cultural</SectionHeading><CulturalSection d={data} accent={accent} />
        <SectionHeading accent={accent} size="sm">Career</SectionHeading><CareerSection d={data} accent={accent} />
        <SectionHeading accent={accent} size="sm">Family</SectionHeading><FamilySection d={data} accent={accent} />
        <SectionHeading accent={accent} size="sm">Contact</SectionHeading><ContactSection d={data} accent={accent} />
      </div>
    </Page>
  );
}
