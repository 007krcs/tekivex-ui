// tekivex-templates — re-exports the seven templates that previously
// lived inside tekivex-pdf, now in their own companion package per the
// audit's recommendation (cleaner package boundaries, independent
// versioning, smaller tekivex-pdf core).
//
// The actual implementations stay where they are. This package wraps
// them so consumers who only need templates don't pay the tekivex-pdf
// install cost separately — they install both as a pair.

export { BiodataTemplate } from 'tekivex-pdf';
export type { BiodataData, BiodataField, BiodataTemplateProps } from 'tekivex-pdf';

export { InvoiceTemplate } from 'tekivex-pdf';
export type {
  InvoiceData,
  InvoiceParty,
  InvoiceLineItem,
  InvoiceTemplateProps,
} from 'tekivex-pdf';

export { CertificateTemplate } from 'tekivex-pdf';
export type { CertificateData, CertificateTemplateProps } from 'tekivex-pdf';

export { ResumeTemplate } from 'tekivex-pdf';
export type {
  ResumeData,
  ResumeContact,
  ExperienceItem,
  EducationItem,
  ResumeTemplateProps,
} from 'tekivex-pdf';

export { TicketTemplate } from 'tekivex-pdf';
export type { TicketData, TicketTemplateProps } from 'tekivex-pdf';

export { BoardingPassTemplate } from 'tekivex-pdf';
export type { BoardingPassData, BoardingPassTemplateProps } from 'tekivex-pdf';

export { ReceiptTemplate } from 'tekivex-pdf';
export type {
  ReceiptData,
  ReceiptLineItem,
  ReceiptTemplateProps,
} from 'tekivex-pdf';
