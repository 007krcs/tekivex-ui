// ─────────────────────────────────────────────────────────────────────────────
// Resume / CV template — single-column ATS-friendly layout.
// Sections: header, summary, experience, education, skills, projects.
// ─────────────────────────────────────────────────────────────────────────────

import {
  TkxPDFDocument,
  TkxPDFPage,
  TkxPDFView,
  TkxPDFText,
  TkxPDFRow,
  TkxPDFColumn,
} from '../primitives';
import type { PDFThemeTokens } from '../theme';
import { printLight } from '../theme';

export interface ResumeContact {
  email?: string;
  phone?: string;
  location?: string;
  website?: string;
  linkedin?: string;
  github?: string;
}

export interface ExperienceItem {
  role: string;
  company: string;
  start: string;
  end?: string;       // omit for current role
  location?: string;
  bullets: string[];
}

export interface EducationItem {
  degree: string;
  school: string;
  start: string;
  end?: string;
  notes?: string;
}

export interface ResumeData {
  name: string;
  headline?: string;
  contact: ResumeContact;
  summary?: string;
  experience: ExperienceItem[];
  education: EducationItem[];
  skills?: string[];
  projects?: { name: string; description: string; url?: string }[];
}

export interface ResumeTemplateProps {
  data: ResumeData;
  theme?: PDFThemeTokens;
}

function SectionTitle({ children, theme }: { children: string; theme: PDFThemeTokens }) {
  return (
    <TkxPDFView
      style={{
        marginTop: 14,
        marginBottom: 8,
        paddingBottom: 4,
        borderBottomWidth: 1.5,
        borderBottomColor: theme.text,
      }}
    >
      <TkxPDFText size={11} weight="bold" color={theme.text} style={{ textTransform: 'uppercase', letterSpacing: 1 }}>
        {children}
      </TkxPDFText>
    </TkxPDFView>
  );
}

export function ResumeTemplate({ data, theme = printLight }: ResumeTemplateProps) {
  const contactBits = [
    data.contact.email,
    data.contact.phone,
    data.contact.location,
    data.contact.website,
    data.contact.linkedin,
    data.contact.github,
  ].filter(Boolean) as string[];

  return (
    <TkxPDFDocument theme={theme} title={`${data.name} — Resume`}>
      <TkxPDFPage size="A4" margin={36}>
        {/* Header */}
        <TkxPDFText size={28} weight="bold" color={theme.text}>
          {data.name}
        </TkxPDFText>
        {data.headline && (
          <TkxPDFText size={13} color={theme.primary} style={{ marginTop: 2 }}>
            {data.headline}
          </TkxPDFText>
        )}
        <TkxPDFText size={9} color={theme.textMuted} style={{ marginTop: 6 }}>
          {contactBits.join('  ·  ')}
        </TkxPDFText>

        {/* Summary */}
        {data.summary && (
          <>
            <SectionTitle theme={theme}>Summary</SectionTitle>
            <TkxPDFText size={10} color={theme.text} style={{ lineHeight: 1.5 }}>
              {data.summary}
            </TkxPDFText>
          </>
        )}

        {/* Experience */}
        <SectionTitle theme={theme}>Experience</SectionTitle>
        {data.experience.map((exp, i) => (
          <TkxPDFView key={i} style={{ marginBottom: 12 }}>
            <TkxPDFRow justify="space-between" align="flex-start">
              <TkxPDFColumn flex={1}>
                <TkxPDFText size={11} weight="bold" color={theme.text}>
                  {exp.role}
                </TkxPDFText>
                <TkxPDFText size={10} color={theme.textMuted}>
                  {exp.company}{exp.location ? ` · ${exp.location}` : ''}
                </TkxPDFText>
              </TkxPDFColumn>
              <TkxPDFText size={9} color={theme.textMuted}>
                {exp.start} – {exp.end ?? 'Present'}
              </TkxPDFText>
            </TkxPDFRow>
            <TkxPDFView style={{ marginTop: 4 }}>
              {exp.bullets.map((b, j) => (
                <TkxPDFRow key={j} style={{ marginBottom: 2 }}>
                  <TkxPDFText size={10} color={theme.text} style={{ width: 12 }}>•</TkxPDFText>
                  <TkxPDFText size={10} color={theme.text} style={{ flex: 1, lineHeight: 1.4 }}>
                    {b}
                  </TkxPDFText>
                </TkxPDFRow>
              ))}
            </TkxPDFView>
          </TkxPDFView>
        ))}

        {/* Education */}
        <SectionTitle theme={theme}>Education</SectionTitle>
        {data.education.map((ed, i) => (
          <TkxPDFRow key={i} justify="space-between" align="flex-start" style={{ marginBottom: 8 }}>
            <TkxPDFColumn flex={1}>
              <TkxPDFText size={11} weight="bold" color={theme.text}>
                {ed.degree}
              </TkxPDFText>
              <TkxPDFText size={10} color={theme.textMuted}>{ed.school}</TkxPDFText>
              {ed.notes && (
                <TkxPDFText size={9} color={theme.textMuted}>{ed.notes}</TkxPDFText>
              )}
            </TkxPDFColumn>
            <TkxPDFText size={9} color={theme.textMuted}>
              {ed.start} – {ed.end ?? 'Present'}
            </TkxPDFText>
          </TkxPDFRow>
        ))}

        {/* Skills */}
        {data.skills && data.skills.length > 0 && (
          <>
            <SectionTitle theme={theme}>Skills</SectionTitle>
            <TkxPDFText size={10} color={theme.text} style={{ lineHeight: 1.6 }}>
              {data.skills.join('  ·  ')}
            </TkxPDFText>
          </>
        )}

        {/* Projects */}
        {data.projects && data.projects.length > 0 && (
          <>
            <SectionTitle theme={theme}>Projects</SectionTitle>
            {data.projects.map((p, i) => (
              <TkxPDFView key={i} style={{ marginBottom: 8 }}>
                <TkxPDFText size={11} weight="bold" color={theme.text}>
                  {p.name}{p.url ? ` — ${p.url}` : ''}
                </TkxPDFText>
                <TkxPDFText size={10} color={theme.text} style={{ lineHeight: 1.4 }}>
                  {p.description}
                </TkxPDFText>
              </TkxPDFView>
            ))}
          </>
        )}
      </TkxPDFPage>
    </TkxPDFDocument>
  );
}
