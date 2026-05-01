// ─────────────────────────────────────────────────────────────────────────────
// Templates — shared types
//
// Two data shapes the templates fetch from:
//   - ResumeData   for professional resumes
//   - BiodataData  for matrimonial biodatas (religion-agnostic; astrology
//                  fields are optional and only render in templates that
//                  have a slot for them)
//
// Templates are pure components: they take one of these shapes and render.
// The TkxTemplateGenerator wraps the user-facing form + preview + paywall
// + download flow on top.
// ─────────────────────────────────────────────────────────────────────────────

// ── Resume ─────────────────────────────────────────────────────────────────

export interface ResumeLink {
  label: string;
  url: string;
}

export interface ResumeWorkExperience {
  role: string;
  company: string;
  location?: string;
  start: string;     // free-form ("Mar 2022", "2020")
  end?: string;      // omit / "" / "Present"
  summary?: string;
  bullets?: string[];
}

export interface ResumeEducation {
  degree: string;
  institution: string;
  start?: string;
  end?: string;
  details?: string;
  /** GPA / grade / honours. */
  grade?: string;
}

export interface ResumeProject {
  name: string;
  url?: string;
  summary: string;
  tech?: string[];
}

export interface ResumeCertification {
  name: string;
  issuer?: string;
  year?: string;
  url?: string;
}

export interface ResumeSkillGroup {
  category: string;
  items: string[];
}

export interface ResumeData {
  fullName: string;
  /** Job title / headline ("Senior Frontend Engineer") */
  title: string;
  email: string;
  phone: string;
  location: string;
  /** Photo URL or data: URI. Optional — many resumes omit photos. */
  photo?: string;
  links?: ResumeLink[];
  /** Short bio / summary paragraph. */
  summary?: string;
  experience: ResumeWorkExperience[];
  education: ResumeEducation[];
  /** Either a flat list ("React", "TypeScript") or grouped by category. */
  skills?: string[];
  skillGroups?: ResumeSkillGroup[];
  projects?: ResumeProject[];
  certifications?: ResumeCertification[];
  languages?: { name: string; level: string }[];
  awards?: { title: string; year?: string; issuer?: string }[];
}

// ── Biodata ────────────────────────────────────────────────────────────────

export interface BiodataSibling {
  /** "elder brother", "younger sister", etc. */
  relation: string;
  /** "married", "engineer", "student" — free-form short status */
  status: string;
}

export interface BiodataEducation {
  degree: string;
  institution: string;
  year?: string;
}

/**
 * Marriage biodata. Religion-agnostic at the type level — astrological
 * fields (rashi/nakshatra/gotra/manglik) and caste fields are all optional.
 * Templates that have slots for them render them only when present.
 */
export interface BiodataData {
  fullName: string;
  /** Photo URL or data: URI. */
  photo?: string;

  // ── Personal ──
  dateOfBirth: string;       // "YYYY-MM-DD" or display string
  timeOfBirth?: string;
  placeOfBirth?: string;
  height: string;            // "5'8\"" or "172 cm"
  weight?: string;
  complexion?: string;
  bloodGroup?: string;

  // ── Religious / cultural (all optional) ──
  religion?: string;
  /**
   * Override for the auto-derived religious symbol shown atop biodatas.
   * 'auto'  — derive from `religion` (default)
   * 'none'  — hide the symbol entirely
   * 'om' | 'cross' | 'crescent' | 'khanda' | 'dharma' | 'lotus' — explicit pick
   */
  religiousMark?: 'auto' | 'none' | 'om' | 'cross' | 'crescent' | 'khanda' | 'dharma' | 'lotus';
  /**
   * Optional URL / data-URI of a custom religious logo. Takes precedence
   * over the auto-derived glyph + the `religiousMark` override — useful
   * for sect-specific symbols, family monograms, or scanned blessings
   * that the built-in Unicode set doesn't capture.
   */
  customReligiousLogo?: string;
  /** Short blessing line shown below the symbol (e.g. "Shubh Vivah", "Bismillah"). */
  blessing?: string;
  caste?: string;
  subCaste?: string;
  /** Hindu / Jain matrimonial astrology fields. */
  manglik?: 'yes' | 'no' | 'partial';
  rashi?: string;            // moon sign
  nakshatra?: string;
  gotra?: string;
  motherTongue?: string;

  // ── Education + career ──
  education: BiodataEducation[];
  occupation: string;
  company?: string;
  income?: string;

  // ── Family ──
  fatherName: string;
  fatherOccupation?: string;
  motherName: string;
  motherOccupation?: string;
  siblings?: BiodataSibling[];

  // ── Contact ──
  contactPhone: string;
  contactEmail?: string;
  address: string;

  // ── Free-form ──
  hobbies?: string[];
  about?: string;
  expectations?: string;
}

// ── Template metadata ──────────────────────────────────────────────────────

export type TemplateKind = 'resume' | 'biodata';

export interface TemplateInfo {
  id: string;
  kind: TemplateKind;
  name: string;
  /** One-line vibe: "Modern minimalist", "Royal maroon" etc. */
  description: string;
  /** Optional preview thumbnail URL — usually omitted; we generate from the
   *  template itself with sample data. */
  thumbnail?: string;
  /** Cents (or paisa) the user must pay to download. 0 = free. */
  priceCents?: number;
  /** Currency symbol shown next to the price. Default "$". Use "₹" for INR. */
  priceCurrency?: string;
}

/**
 * The runtime entry every registered template provides — a function
 * component that takes typed data and renders the print-ready layout.
 */
export type ResumeTemplateComponent = (props: { data: ResumeData }) => import('react').ReactElement;
export type BiodataTemplateComponent = (props: { data: BiodataData }) => import('react').ReactElement;
