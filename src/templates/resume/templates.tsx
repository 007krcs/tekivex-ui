// ─────────────────────────────────────────────────────────────────────────────
// Resume templates — 12 visually distinct layouts.
//
// Every template takes the same `ResumeData` shape and renders an A4 page.
// They share layout primitives from ../layouts/primitives so each template
// stays under ~80 lines of structural code; the difference between them is
// almost entirely visual (color, font, alignment).
// ─────────────────────────────────────────────────────────────────────────────

import type { ResumeData } from '../types';
import {
  Page,
  SectionHeading,
  TwoColumn,
  HeaderBanner,
  SkillTags,
  dateRange,
} from '../layouts/primitives';

// ── Reusable sub-renderers ─────────────────────────────────────────────────

function ContactList({ data, accent, light = false }: { data: ResumeData; accent: string; light?: boolean }) {
  const c = light ? '#dcdce8' : '#444';
  return (
    <div style={{ fontSize: '9.5pt', color: c, lineHeight: 1.7 }}>
      <div>📧 {data.email}</div>
      <div>📞 {data.phone}</div>
      <div>📍 {data.location}</div>
      {data.links?.map((l, i) => (
        <div key={i}>🔗 <a href={l.url} style={{ color: light ? '#fff' : accent, textDecoration: 'none' }}>{l.label}</a></div>
      ))}
    </div>
  );
}

function ExperienceBlock({ data, accent }: { data: ResumeData; accent: string }) {
  return (
    <>
      {data.experience.map((e, i) => (
        <div key={i} style={{ marginBottom: '4mm' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '2mm' }}>
            <div style={{ fontWeight: 700, fontSize: '11pt', color: '#1a1a1f' }}>{e.role}</div>
            <div style={{ fontSize: '9.5pt', color: '#666' }}>{dateRange(e.start, e.end)}</div>
          </div>
          <div style={{ fontSize: '10pt', color: accent, fontWeight: 600 }}>
            {e.company}{e.location ? ` · ${e.location}` : ''}
          </div>
          {e.summary && <p style={{ margin: '1mm 0', fontSize: '9.5pt' }}>{e.summary}</p>}
          {e.bullets && (
            <ul style={{ margin: '1mm 0 0 5mm', paddingLeft: 0, fontSize: '9.5pt' }}>
              {e.bullets.map((b, j) => (<li key={j} style={{ marginBottom: '0.5mm' }}>{b}</li>))}
            </ul>
          )}
        </div>
      ))}
    </>
  );
}

function EducationBlock({ data, accent }: { data: ResumeData; accent: string }) {
  return (
    <>
      {data.education.map((e, i) => (
        <div key={i} style={{ marginBottom: '3mm' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '2mm' }}>
            <div style={{ fontWeight: 700, fontSize: '10.5pt' }}>{e.degree}</div>
            <div style={{ fontSize: '9.5pt', color: '#666' }}>{dateRange(e.start, e.end)}</div>
          </div>
          <div style={{ fontSize: '10pt', color: accent, fontWeight: 600 }}>{e.institution}</div>
          {(e.grade || e.details) && (
            <div style={{ fontSize: '9pt', color: '#555', marginTop: '0.5mm' }}>
              {e.grade}{e.grade && e.details ? ' · ' : ''}{e.details}
            </div>
          )}
        </div>
      ))}
    </>
  );
}

function ProjectsBlock({ data, accent }: { data: ResumeData; accent: string }) {
  if (!data.projects?.length) return null;
  return (
    <>
      {data.projects.map((p, i) => (
        <div key={i} style={{ marginBottom: '3mm' }}>
          <div style={{ fontWeight: 700, fontSize: '10pt' }}>{p.name}{p.url && <span style={{ color: accent, marginLeft: '2mm', fontSize: '9pt' }}>· {p.url}</span>}</div>
          <p style={{ margin: '0.5mm 0', fontSize: '9.5pt' }}>{p.summary}</p>
          {p.tech && <div style={{ fontSize: '9pt', color: '#666' }}>Tech: {p.tech.join(' · ')}</div>}
        </div>
      ))}
    </>
  );
}

// ── 1. Modern Minimalist ───────────────────────────────────────────────────

export function ResumeModernMinimalist({ data }: { data: ResumeData }) {
  const accent = '#0a6efd';
  return (
    <Page>
      <div style={{ borderBottom: `0.5mm solid ${accent}`, paddingBottom: '4mm' }}>
        <h1 style={{ margin: 0, fontSize: '26pt', fontWeight: 800, letterSpacing: '-0.02em' }}>{data.fullName}</h1>
        <div style={{ fontSize: '12pt', color: accent, fontWeight: 600, marginTop: '1mm' }}>{data.title}</div>
        <div style={{ marginTop: '3mm' }}><ContactList data={data} accent={accent} /></div>
      </div>
      {data.summary && <p style={{ marginTop: '4mm', fontSize: '10pt' }}>{data.summary}</p>}
      <SectionHeading accent={accent}>Experience</SectionHeading><ExperienceBlock data={data} accent={accent} />
      <SectionHeading accent={accent}>Education</SectionHeading><EducationBlock data={data} accent={accent} />
      {data.skills && (<><SectionHeading accent={accent}>Skills</SectionHeading><SkillTags items={data.skills} accent={accent} /></>)}
    </Page>
  );
}

// ── 2. Executive Classic (serif) ───────────────────────────────────────────

export function ResumeExecutiveClassic({ data }: { data: ResumeData }) {
  const accent = '#5a2a82';
  return (
    <Page fontFamily="'EB Garamond', 'Times New Roman', serif">
      <div style={{ textAlign: 'center', borderBottom: `0.3mm solid ${accent}`, paddingBottom: '4mm' }}>
        <h1 style={{ margin: 0, fontSize: '24pt', letterSpacing: '0.04em', fontWeight: 700 }}>{data.fullName}</h1>
        <div style={{ fontSize: '12pt', fontStyle: 'italic', color: accent, marginTop: '1mm' }}>{data.title}</div>
        <div style={{ marginTop: '2mm', fontSize: '9.5pt', color: '#444' }}>
          {data.email} · {data.phone} · {data.location}
        </div>
      </div>
      {data.summary && <p style={{ marginTop: '4mm', fontSize: '11pt', textAlign: 'justify' }}>{data.summary}</p>}
      <SectionHeading accent={accent}>Professional Experience</SectionHeading><ExperienceBlock data={data} accent={accent} />
      <SectionHeading accent={accent}>Education</SectionHeading><EducationBlock data={data} accent={accent} />
      {data.awards && data.awards.length > 0 && (
        <><SectionHeading accent={accent}>Awards</SectionHeading>
          <ul style={{ margin: 0, paddingLeft: '5mm' }}>{data.awards.map((a, i) => (
            <li key={i}><strong>{a.title}</strong>{a.issuer ? `, ${a.issuer}` : ''}{a.year ? ` (${a.year})` : ''}</li>
          ))}</ul></>
      )}
    </Page>
  );
}

// ── 3. Tech Stack (left sidebar with skill bars) ───────────────────────────

export function ResumeTechStack({ data }: { data: ResumeData }) {
  const accent = '#00aa88';
  return (
    <Page padding={0}>
      <TwoColumn
        sidebarWidth={62}
        sidebarBackground="#0d1f1c"
        sidebarColor="#dcdce8"
        gap={0}
        sidebar={
          <div style={{ padding: '12mm 6mm', fontSize: '9.5pt' }}>
            <h1 style={{ margin: 0, fontSize: '18pt', color: '#fff', fontWeight: 800 }}>{data.fullName}</h1>
            <div style={{ color: accent, fontSize: '10pt', fontWeight: 600, marginTop: '1mm' }}>{data.title}</div>
            <hr style={{ border: 'none', borderTop: `0.3mm solid ${accent}`, margin: '4mm 0' }} />
            <ContactList data={data} accent={accent} light />
            {data.skillGroups?.map((g, i) => (
              <div key={i} style={{ marginTop: '4mm' }}>
                <div style={{ color: accent, fontWeight: 700, fontSize: '9.5pt', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1.5mm' }}>{g.category}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1mm' }}>
                  {g.items.map((s, j) => (
                    <span key={j} style={{ padding: '0.6mm 1.6mm', background: `${accent}33`, borderRadius: '0.6mm', fontSize: '8.5pt' }}>{s}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        }
        main={
          <div style={{ padding: '12mm 8mm 12mm 4mm' }}>
            {data.summary && <p style={{ marginTop: 0, fontSize: '10pt' }}>{data.summary}</p>}
            <SectionHeading accent={accent}>Experience</SectionHeading><ExperienceBlock data={data} accent={accent} />
            <SectionHeading accent={accent}>Education</SectionHeading><EducationBlock data={data} accent={accent} />
            {data.projects && (<><SectionHeading accent={accent}>Projects</SectionHeading><ProjectsBlock data={data} accent={accent} /></>)}
          </div>
        }
      />
    </Page>
  );
}

// ── 4. Creative Bold (gradient banner) ─────────────────────────────────────

export function ResumeCreativeBold({ data }: { data: ResumeData }) {
  const accent = '#ff006e';
  return (
    <Page>
      <div style={{
        background: 'linear-gradient(135deg, #ff006e, #7b2ff7, #3a86ff)',
        padding: '10mm 8mm', borderRadius: '2mm', color: '#fff',
      }}>
        <h1 style={{ margin: 0, fontSize: '28pt', fontWeight: 900, letterSpacing: '-0.03em' }}>{data.fullName}</h1>
        <div style={{ fontSize: '13pt', marginTop: '1mm', opacity: 0.95 }}>{data.title}</div>
        <div style={{ marginTop: '3mm', fontSize: '9.5pt', opacity: 0.92 }}>
          {data.email} · {data.phone} · {data.location}
        </div>
      </div>
      {data.summary && <p style={{ marginTop: '4mm', fontSize: '10pt' }}>{data.summary}</p>}
      <SectionHeading accent={accent}>Experience</SectionHeading><ExperienceBlock data={data} accent={accent} />
      <SectionHeading accent={accent}>Education</SectionHeading><EducationBlock data={data} accent={accent} />
      {data.skills && (<><SectionHeading accent={accent}>Skills</SectionHeading><SkillTags items={data.skills} accent={accent} /></>)}
    </Page>
  );
}

// ── 5. Compact ATS (single column, no graphics, ATS-friendly) ──────────────

export function ResumeCompactATS({ data }: { data: ResumeData }) {
  return (
    <Page fontFamily="'Helvetica', 'Arial', sans-serif">
      <h1 style={{ margin: 0, fontSize: '20pt', fontWeight: 700 }}>{data.fullName}</h1>
      <div style={{ fontSize: '11pt', marginTop: '1mm' }}>{data.title}</div>
      <div style={{ fontSize: '9.5pt', marginTop: '2mm' }}>
        {data.email} | {data.phone} | {data.location}
        {data.links && data.links.length > 0 && ` | ${data.links.map((l) => l.label).join(' | ')}`}
      </div>
      {data.summary && <><h2 style={atsH2}>SUMMARY</h2><p style={{ margin: 0, fontSize: '10pt' }}>{data.summary}</p></>}
      <h2 style={atsH2}>EXPERIENCE</h2><ExperienceBlock data={data} accent="#000" />
      <h2 style={atsH2}>EDUCATION</h2><EducationBlock data={data} accent="#000" />
      {data.skills && (<><h2 style={atsH2}>SKILLS</h2><div style={{ fontSize: '10pt' }}>{data.skills.join(', ')}</div></>)}
    </Page>
  );
}
const atsH2 = { fontSize: '11pt', fontWeight: 700, margin: '4mm 0 1mm', textTransform: 'uppercase' as const, letterSpacing: '0.08em' };

// ── 6. Photo Portfolio (large photo header) ────────────────────────────────

export function ResumePhotoPortfolio({ data }: { data: ResumeData }) {
  const accent = '#ffbe0b';
  return (
    <Page>
      <div style={{ display: 'flex', gap: '6mm', alignItems: 'center', borderBottom: `0.3mm solid ${accent}`, paddingBottom: '4mm' }}>
        {data.photo ? (
          <img src={data.photo} alt={data.fullName} style={{ width: '28mm', height: '28mm', borderRadius: '50%', objectFit: 'cover', border: `0.5mm solid ${accent}` }} />
        ) : (
          <div style={{ width: '28mm', height: '28mm', borderRadius: '50%', background: `${accent}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14pt', fontWeight: 800, color: accent }}>{data.fullName.split(' ').map((n) => n[0]).slice(0, 2).join('')}</div>
        )}
        <div>
          <h1 style={{ margin: 0, fontSize: '22pt', fontWeight: 800 }}>{data.fullName}</h1>
          <div style={{ fontSize: '12pt', color: accent, fontWeight: 600, marginTop: '1mm' }}>{data.title}</div>
          <ContactList data={data} accent={accent} />
        </div>
      </div>
      {data.summary && <p style={{ marginTop: '4mm', fontSize: '10pt' }}>{data.summary}</p>}
      <SectionHeading accent={accent}>Experience</SectionHeading><ExperienceBlock data={data} accent={accent} />
      <SectionHeading accent={accent}>Education</SectionHeading><EducationBlock data={data} accent={accent} />
      {data.skills && (<><SectionHeading accent={accent}>Skills</SectionHeading><SkillTags items={data.skills} accent={accent} /></>)}
    </Page>
  );
}

// ── 7. Two-column with side rule ───────────────────────────────────────────

export function ResumeSideRule({ data }: { data: ResumeData }) {
  const accent = '#7b2ff7';
  return (
    <Page>
      <h1 style={{ margin: 0, fontSize: '24pt', fontWeight: 800 }}>{data.fullName}</h1>
      <div style={{ fontSize: '11pt', color: accent, fontWeight: 600 }}>{data.title}</div>
      <div style={{ marginTop: '2mm', fontSize: '9.5pt', color: '#666' }}>
        {data.email} · {data.phone} · {data.location}
      </div>
      <TwoColumn
        sidebarWidth={56}
        gap={6}
        sidebar={
          <div style={{ borderRight: `0.3mm solid ${accent}66`, paddingRight: '4mm' }}>
            {data.summary && (<><SectionHeading accent={accent} size="sm">About</SectionHeading><p style={{ margin: 0, fontSize: '9.5pt' }}>{data.summary}</p></>)}
            {data.skills && (<><SectionHeading accent={accent} size="sm">Skills</SectionHeading><SkillTags items={data.skills} accent={accent} /></>)}
            {data.languages && (<><SectionHeading accent={accent} size="sm">Languages</SectionHeading>
              <ul style={{ margin: 0, paddingLeft: '4mm', fontSize: '9.5pt' }}>
                {data.languages.map((l, i) => (<li key={i}>{l.name} <span style={{ color: '#888' }}>· {l.level}</span></li>))}
              </ul></>)}
          </div>
        }
        main={
          <>
            <SectionHeading accent={accent} size="sm">Experience</SectionHeading><ExperienceBlock data={data} accent={accent} />
            <SectionHeading accent={accent} size="sm">Education</SectionHeading><EducationBlock data={data} accent={accent} />
          </>
        }
      />
    </Page>
  );
}

// ── 8. Editorial (magazine-style) ──────────────────────────────────────────

export function ResumeEditorial({ data }: { data: ResumeData }) {
  const accent = '#1f1f1f';
  return (
    <Page fontFamily="'Playfair Display', 'Georgia', serif">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: '0.5mm solid #000', paddingBottom: '3mm' }}>
        <h1 style={{ margin: 0, fontSize: '28pt', fontWeight: 900, letterSpacing: '-0.04em' }}>{data.fullName}</h1>
        <div style={{ fontSize: '10pt', color: '#666', fontStyle: 'italic' }}>{data.location}</div>
      </div>
      <div style={{ fontSize: '13pt', fontStyle: 'italic', marginTop: '2mm' }}>{data.title}</div>
      {data.summary && <p style={{ marginTop: '4mm', fontSize: '11pt', columnCount: 2, columnGap: '6mm', textAlign: 'justify' }}>{data.summary}</p>}
      <SectionHeading accent={accent}>Experience</SectionHeading><ExperienceBlock data={data} accent={accent} />
      <SectionHeading accent={accent}>Education</SectionHeading><EducationBlock data={data} accent={accent} />
      {data.skills && (<><SectionHeading accent={accent}>Skills</SectionHeading><div style={{ fontSize: '10pt', fontStyle: 'italic' }}>{data.skills.join(' · ')}</div></>)}
    </Page>
  );
}

// ── 9. Mono Code (dev-style monospace) ─────────────────────────────────────

export function ResumeMonoCode({ data }: { data: ResumeData }) {
  const accent = '#22c55e';
  return (
    <Page background="#0a0a0f" color="#dcdce8" fontFamily="'JetBrains Mono', 'Menlo', monospace">
      <div style={{ borderBottom: `0.3mm solid ${accent}`, paddingBottom: '3mm' }}>
        <div style={{ color: accent, fontSize: '9pt' }}>// {data.title}</div>
        <h1 style={{ margin: '1mm 0 0', fontSize: '22pt', color: '#fff', fontWeight: 700 }}>{data.fullName}</h1>
        <div style={{ fontSize: '9pt', color: '#aaa', marginTop: '1.5mm' }}>
          $ contact --email {data.email} --phone {data.phone} --location "{data.location}"
        </div>
      </div>
      {data.summary && <p style={{ marginTop: '3mm', fontSize: '9.5pt' }}>{data.summary}</p>}
      <h2 style={{ color: accent, fontSize: '10pt', marginTop: '6mm', marginBottom: '2mm' }}># experience</h2><ExperienceBlock data={data} accent={accent} />
      <h2 style={{ color: accent, fontSize: '10pt', marginTop: '6mm', marginBottom: '2mm' }}># education</h2><EducationBlock data={data} accent={accent} />
      {data.skills && (
        <><h2 style={{ color: accent, fontSize: '10pt', marginTop: '6mm', marginBottom: '2mm' }}># stack</h2>
          <div style={{ fontSize: '9.5pt', color: '#dcdce8' }}>[{data.skills.map((s) => `"${s}"`).join(', ')}]</div></>
      )}
    </Page>
  );
}

// ── 10. Banner (top color block) ───────────────────────────────────────────

export function ResumeBanner({ data }: { data: ResumeData }) {
  const accent = '#1e88e5';
  return (
    <Page padding={0}>
      <div style={{ padding: '0 14mm' }}>
        <HeaderBanner name={data.fullName} subtitle={data.title} accent={accent} align="left" thin />
        <div style={{ marginTop: '4mm', fontSize: '9.5pt', color: '#555' }}>
          {data.email} · {data.phone} · {data.location}
        </div>
        {data.summary && <p style={{ marginTop: '3mm', fontSize: '10pt' }}>{data.summary}</p>}
        <SectionHeading accent={accent}>Experience</SectionHeading><ExperienceBlock data={data} accent={accent} />
        <SectionHeading accent={accent}>Education</SectionHeading><EducationBlock data={data} accent={accent} />
        {data.skills && (<><SectionHeading accent={accent}>Skills</SectionHeading><SkillTags items={data.skills} accent={accent} /></>)}
      </div>
    </Page>
  );
}

// ── 11. Two-tone (ivory + accent) ──────────────────────────────────────────

export function ResumeTwoTone({ data }: { data: ResumeData }) {
  const accent = '#0d3b66';
  return (
    <Page background="#faf8f3">
      <div style={{ background: '#fff', padding: '8mm', borderLeft: `2mm solid ${accent}` }}>
        <h1 style={{ margin: 0, fontSize: '24pt', fontWeight: 800, color: accent }}>{data.fullName}</h1>
        <div style={{ fontSize: '11pt', marginTop: '1mm', color: '#444' }}>{data.title}</div>
        <div style={{ fontSize: '9.5pt', color: '#666', marginTop: '2mm' }}>
          {data.email} · {data.phone} · {data.location}
        </div>
      </div>
      {data.summary && <p style={{ marginTop: '4mm', fontSize: '10pt' }}>{data.summary}</p>}
      <SectionHeading accent={accent}>Experience</SectionHeading><ExperienceBlock data={data} accent={accent} />
      <SectionHeading accent={accent}>Education</SectionHeading><EducationBlock data={data} accent={accent} />
      {data.projects && (<><SectionHeading accent={accent}>Projects</SectionHeading><ProjectsBlock data={data} accent={accent} /></>)}
    </Page>
  );
}

// ── 12. Engineer Brief (info-dense) ────────────────────────────────────────

export function ResumeEngineerBrief({ data }: { data: ResumeData }) {
  const accent = '#0f766e';
  return (
    <Page padding={12}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'baseline', gap: '4mm' }}>
        <h1 style={{ margin: 0, fontSize: '22pt', fontWeight: 800 }}>{data.fullName}</h1>
        <div style={{ textAlign: 'right', fontSize: '9.5pt' }}>{data.email}<br />{data.phone}<br />{data.location}</div>
      </div>
      <div style={{ fontSize: '11pt', color: accent, fontWeight: 600 }}>{data.title}</div>
      {data.summary && <p style={{ marginTop: '2mm', fontSize: '9.5pt' }}>{data.summary}</p>}
      <SectionHeading accent={accent} size="sm">Experience</SectionHeading><ExperienceBlock data={data} accent={accent} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6mm' }}>
        <div><SectionHeading accent={accent} size="sm">Education</SectionHeading><EducationBlock data={data} accent={accent} /></div>
        <div>
          {data.skillGroups && (<><SectionHeading accent={accent} size="sm">Skills</SectionHeading>
            {data.skillGroups.map((g, i) => (
              <div key={i} style={{ fontSize: '9pt', marginBottom: '1.5mm' }}>
                <strong style={{ color: '#333' }}>{g.category}:</strong> {g.items.join(', ')}
              </div>
            ))}</>)}
        </div>
      </div>
    </Page>
  );
}
