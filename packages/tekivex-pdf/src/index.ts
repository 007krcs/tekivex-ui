// ─────────────────────────────────────────────────────────────────────────────
// @tekivex/pdf — public surface.
// ─────────────────────────────────────────────────────────────────────────────

// Theme
export type { PDFThemeTokens } from './theme';
export { printLight, printDark, createPDFTheme } from './theme';

// Provider + theme hook
export { TkxPDFThemeProvider, usePDFTheme } from './primitives';
export type { TkxPDFThemeProviderProps } from './primitives';

// Primitives
export {
  TkxPDFDocument,
  TkxPDFPage,
  TkxPDFView,
  TkxPDFRow,
  TkxPDFColumn,
  TkxPDFText,
  TkxPDFImage,
} from './primitives';
export type {
  TkxPDFDocumentProps,
  TkxPDFPageProps,
  TkxPDFViewProps,
  TkxPDFRowProps,
  TkxPDFColumnProps,
  TkxPDFTextProps,
  TkxPDFImageProps,
} from './primitives';

// Watermark
export { TkxPDFWatermark } from './watermark';
export type { TkxPDFWatermarkProps } from './watermark';

// Renderers
export { renderToPDF, renderToPDFStream, renderToPNG, pdfToBlob } from './render';
export type { RenderToPDFOptions } from './render';

// Templates
export { BiodataTemplate } from './templates/biodata';
export type { BiodataData, BiodataField, BiodataTemplateProps } from './templates/biodata';

export { InvoiceTemplate } from './templates/invoice';
export type {
  InvoiceData,
  InvoiceParty,
  InvoiceLineItem,
  InvoiceTemplateProps,
} from './templates/invoice';

export { CertificateTemplate } from './templates/certificate';
export type { CertificateData, CertificateTemplateProps } from './templates/certificate';

export { ResumeTemplate } from './templates/resume';
export type {
  ResumeData,
  ResumeContact,
  ExperienceItem,
  EducationItem,
  ResumeTemplateProps,
} from './templates/resume';

export { TicketTemplate } from './templates/ticket';
export type { TicketData, TicketTemplateProps } from './templates/ticket';

export { BoardingPassTemplate } from './templates/boardingPass';
export type { BoardingPassData, BoardingPassTemplateProps } from './templates/boardingPass';

export { ReceiptTemplate } from './templates/receipt';
export type {
  ReceiptData,
  ReceiptLineItem,
  ReceiptTemplateProps,
} from './templates/receipt';
