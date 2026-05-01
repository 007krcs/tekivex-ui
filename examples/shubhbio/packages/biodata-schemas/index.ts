/**
 * @shubhbio/schemas
 *
 * Zod schemas describing the biodata data shape per religion. Each religion
 * narrows the base schema with its own required fields (e.g. Hindu adds
 * gotra/rashi, Muslim adds madhab, Christian adds denomination).
 *
 * Phase 1 ships the type system + base schema + religion enum. Phase 3
 * fleshes out the per-step schemas the builder wizard validates against.
 */

import { z } from 'zod';

/* -------------------------------------------------------------------------- */
/* Enums                                                                      */
/* -------------------------------------------------------------------------- */

export const RELIGIONS = [
  'hindu',
  'muslim',
  'christian',
  'sikh',
  'jain',
  'buddhist',
  'parsi',
  'secular',
] as const;
export type Religion = (typeof RELIGIONS)[number];

export const GENDERS = ['male', 'female', 'other'] as const;
export type Gender = (typeof GENDERS)[number];

export const MARITAL_STATUSES = [
  'never-married',
  'divorced',
  'widowed',
  'separated',
] as const;
export type MaritalStatus = (typeof MARITAL_STATUSES)[number];

export const DIETS = ['veg', 'non-veg', 'eggetarian', 'vegan', 'jain'] as const;
export type Diet = (typeof DIETS)[number];

/* -------------------------------------------------------------------------- */
/* Re-usable atom schemas                                                     */
/* -------------------------------------------------------------------------- */

const safeText = (max: number) =>
  z
    .string()
    .trim()
    .min(1)
    .max(max)
    .refine(
      (s) => !/[‪-‮⁦-⁩​-‏]/.test(s),
      'contains hidden bidi or zero-width characters',
    );

export const PhoneSchema = z.string().regex(/^\+?[0-9 ]{8,16}$/);
export const EmailSchema = z.string().email().max(254);
export const DateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
export const HeightCmSchema = z.number().int().min(120).max(230);

/* -------------------------------------------------------------------------- */
/* Personal info — the base step every religion shares                        */
/* -------------------------------------------------------------------------- */

export const PersonalInfoSchema = z.object({
  fullName: safeText(80),
  gender: z.enum(GENDERS),
  dateOfBirth: DateSchema,
  timeOfBirth: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  placeOfBirth: safeText(120).optional(),
  heightCm: HeightCmSchema,
  weightKg: z.number().int().min(30).max(200).optional(),
  bloodGroup: z
    .enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'unknown'])
    .optional(),
  motherTongue: safeText(40),
  maritalStatus: z.enum(MARITAL_STATUSES),
  diet: z.enum(DIETS).optional(),
  smoking: z.enum(['no', 'occasional', 'yes']).optional(),
  drinking: z.enum(['no', 'occasional', 'yes']).optional(),
});
export type PersonalInfo = z.infer<typeof PersonalInfoSchema>;

/* -------------------------------------------------------------------------- */
/* Religion-specific extras                                                   */
/* -------------------------------------------------------------------------- */

export const HinduExtrasSchema = z.object({
  caste: safeText(60).optional(),
  subCaste: safeText(60).optional(),
  gotra: safeText(60).optional(),
  rashi: safeText(40).optional(),
  nakshatra: safeText(40).optional(),
  manglik: z.enum(['no', 'partial', 'yes', 'unknown']).optional(),
});
export type HinduExtras = z.infer<typeof HinduExtrasSchema>;

export const MuslimExtrasSchema = z.object({
  sect: safeText(40).optional(),
  madhab: z.enum(['hanafi', 'maliki', 'shafii', 'hanbali', 'jafari', 'other']).optional(),
  community: safeText(60).optional(),
});
export type MuslimExtras = z.infer<typeof MuslimExtrasSchema>;

export const ChristianExtrasSchema = z.object({
  denomination: safeText(60).optional(),
  parish: safeText(80).optional(),
  bornAgain: z.boolean().optional(),
});
export type ChristianExtras = z.infer<typeof ChristianExtrasSchema>;

export const SikhExtrasSchema = z.object({
  amritdhari: z.boolean().optional(),
  gurdwara: safeText(80).optional(),
  community: safeText(60).optional(),
});
export type SikhExtras = z.infer<typeof SikhExtrasSchema>;

export const JainExtrasSchema = z.object({
  subSect: z.enum(['shwetambar', 'digambar', 'sthanakwasi', 'terapanthi', 'other']).optional(),
  mool: safeText(60).optional(),
});
export type JainExtras = z.infer<typeof JainExtrasSchema>;

/* -------------------------------------------------------------------------- */
/* Education / Career / Family / Preferences                                  */
/* -------------------------------------------------------------------------- */

export const EducationItemSchema = z.object({
  qualification: safeText(120),
  institution: safeText(120).optional(),
  yearCompleted: z.number().int().min(1950).max(2100).optional(),
});

export const CareerSchema = z.object({
  occupation: safeText(80),
  employer: safeText(120).optional(),
  designation: safeText(80).optional(),
  annualIncomeInr: z.number().int().min(0).max(100_000_000).optional(),
  workCity: safeText(80).optional(),
});

export const SiblingSchema = z.object({
  relation: z.enum(['brother', 'sister']),
  name: safeText(80).optional(),
  married: z.boolean().optional(),
});

export const FamilySchema = z.object({
  fatherName: safeText(80).optional(),
  fatherOccupation: safeText(80).optional(),
  motherName: safeText(80).optional(),
  motherOccupation: safeText(80).optional(),
  siblings: z.array(SiblingSchema).max(15).default([]),
  familyType: z.enum(['nuclear', 'joint']).optional(),
  familyValues: z.enum(['traditional', 'moderate', 'liberal']).optional(),
  nativePlace: safeText(120).optional(),
  currentCity: safeText(120).optional(),
});

export const PreferencesSchema = z.object({
  ageMin: z.number().int().min(18).max(80).optional(),
  ageMax: z.number().int().min(18).max(80).optional(),
  heightMinCm: HeightCmSchema.optional(),
  heightMaxCm: HeightCmSchema.optional(),
  preferredCities: z.array(safeText(80)).max(10).optional(),
  notes: safeText(500).optional(),
});

export const ContactSchema = z.object({
  phone: PhoneSchema.optional(),
  altPhone: PhoneSchema.optional(),
  email: EmailSchema.optional(),
  whatsapp: PhoneSchema.optional(),
  address: safeText(280).optional(),
});

/* -------------------------------------------------------------------------- */
/* Discriminated-union biodata                                                */
/* -------------------------------------------------------------------------- */

export const BiodataBaseSchema = z.object({
  religion: z.enum(RELIGIONS),
  personal: PersonalInfoSchema,
  education: z.array(EducationItemSchema).max(8).default([]),
  career: CareerSchema.optional(),
  family: FamilySchema,
  preferences: PreferencesSchema.optional(),
  contact: ContactSchema.optional(),
  /** Server-side reference to the cropped photo blob — never the full URL on
   *  the client to avoid trivial enumeration. */
  photoId: z.string().optional(),
});

export const HinduBiodataSchema = BiodataBaseSchema.extend({
  religion: z.literal('hindu'),
  extras: HinduExtrasSchema.optional(),
});
export const MuslimBiodataSchema = BiodataBaseSchema.extend({
  religion: z.literal('muslim'),
  extras: MuslimExtrasSchema.optional(),
});
export const ChristianBiodataSchema = BiodataBaseSchema.extend({
  religion: z.literal('christian'),
  extras: ChristianExtrasSchema.optional(),
});
export const SikhBiodataSchema = BiodataBaseSchema.extend({
  religion: z.literal('sikh'),
  extras: SikhExtrasSchema.optional(),
});
export const JainBiodataSchema = BiodataBaseSchema.extend({
  religion: z.literal('jain'),
  extras: JainExtrasSchema.optional(),
});
export const NeutralBiodataSchema = BiodataBaseSchema.extend({
  religion: z.enum(['buddhist', 'parsi', 'secular']),
});

export const BiodataSchema = z.discriminatedUnion('religion', [
  HinduBiodataSchema,
  MuslimBiodataSchema,
  ChristianBiodataSchema,
  SikhBiodataSchema,
  JainBiodataSchema,
  NeutralBiodataSchema,
]);

export type Biodata = z.infer<typeof BiodataSchema>;
export type HinduBiodata = z.infer<typeof HinduBiodataSchema>;
export type MuslimBiodata = z.infer<typeof MuslimBiodataSchema>;
export type ChristianBiodata = z.infer<typeof ChristianBiodataSchema>;
export type SikhBiodata = z.infer<typeof SikhBiodataSchema>;
export type JainBiodata = z.infer<typeof JainBiodataSchema>;

/** Empty draft factory for the chosen religion. Used by the builder wizard
 *  on first load so every required nested object exists. */
export function makeDraft(religion: Religion): Partial<Biodata> {
  return {
    religion,
    personal: undefined,
    education: [],
    family: { siblings: [] } as never,
  } as Partial<Biodata>;
}
