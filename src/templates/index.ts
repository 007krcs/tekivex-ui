// ─────────────────────────────────────────────────────────────────────────────
// tekivex-ui/templates — public surface
// ─────────────────────────────────────────────────────────────────────────────

export { TkxTemplateGenerator } from './TkxTemplateGenerator';
export type { TkxTemplateGeneratorProps } from './TkxTemplateGenerator';

export {
  RESUME_TEMPLATES,
  BIODATA_TEMPLATES,
  ALL_TEMPLATES,
  findTemplate,
} from './registry';

export { SAMPLE_RESUME, SAMPLE_BIODATA } from './dummy-data';

export type {
  // data shapes
  ResumeData,
  ResumeWorkExperience,
  ResumeEducation,
  ResumeProject,
  ResumeCertification,
  ResumeSkillGroup,
  ResumeLink,
  BiodataData,
  BiodataEducation,
  BiodataSibling,
  // metadata
  TemplateInfo,
  TemplateKind,
  ResumeTemplateComponent,
  BiodataTemplateComponent,
} from './types';

// Direct exports of every template — for consumers who want to render a
// specific layout outside the generator (e.g. server-side PDF rendering).
export {
  ResumeModernMinimalist,
  ResumeExecutiveClassic,
  ResumeTechStack,
  ResumeCreativeBold,
  ResumeCompactATS,
  ResumePhotoPortfolio,
  ResumeSideRule,
  ResumeEditorial,
  ResumeMonoCode,
  ResumeBanner,
  ResumeTwoTone,
  ResumeEngineerBrief,
} from './resume/templates';

export {
  BiodataTraditionalRoyal,
  BiodataModernUniversal,
  BiodataSapphire,
  BiodataFloralPastel,
  BiodataCharcoal,
  BiodataCompact,
  BiodataBorderedFrame,
  BiodataMinimalist,
  BiodataDualPane,
  BiodataSaffron,
  BiodataEmeraldCards,
  BiodataGeometric,
} from './biodata/templates';
