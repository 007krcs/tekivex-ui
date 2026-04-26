// ─────────────────────────────────────────────────────────────────────────────
// PDF theme tokens — mirrors tekivex-ui's ThemeTokens but with print-safe
// defaults. Light theme is the canonical PDF starting point because most
// document outputs (biodata, invoice, certificate, resume) print on paper.
// ─────────────────────────────────────────────────────────────────────────────

export interface PDFThemeTokens {
  bg: string;
  surface: string;
  border: string;
  text: string;
  textMuted: string;
  primary: string;
  secondary: string;
  danger: string;
  warning: string;
  success: string;
  info: string;

  /** Base font size in points (1pt = 1/72 inch). */
  fontSize: number;
  /** Line height multiplier (e.g. 1.45 means 1.45 × fontSize). */
  lineHeight: number;
  /** Default font family. Must be registered via @react-pdf/renderer Font.register(). */
  fontFamily: string;
}

export const printLight: PDFThemeTokens = {
  bg: '#ffffff',
  surface: '#fafafa',
  border: '#dddddd',
  text: '#1a1a1a',
  textMuted: '#666666',
  primary: '#0d7c5f',
  secondary: '#6930c3',
  danger: '#c1121f',
  warning: '#b45309',
  success: '#0d7c5f',
  info: '#1d4ed8',
  fontSize: 10,
  lineHeight: 1.45,
  fontFamily: 'Helvetica',
};

export const printDark: PDFThemeTokens = {
  bg: '#0a0a0f',
  surface: '#12121a',
  border: '#2a2a3e',
  text: '#e8e8f4',
  textMuted: '#8888aa',
  primary: '#00f5d4',
  secondary: '#7b2ff7',
  danger: '#f72585',
  warning: '#ffbe0b',
  success: '#06d6a0',
  info: '#3a86ff',
  fontSize: 10,
  lineHeight: 1.45,
  fontFamily: 'Helvetica',
};

export function createPDFTheme(
  base: PDFThemeTokens = printLight,
  overrides: Partial<PDFThemeTokens> = {},
): PDFThemeTokens {
  return { ...base, ...overrides };
}
