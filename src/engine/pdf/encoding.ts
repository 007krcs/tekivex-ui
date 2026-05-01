/**
 * Tekivex UI — engine/pdf/encoding
 *
 * PDF byte-level encoding helpers. PDF is an ASCII-shaped binary format; this
 * module concentrates the rules around it so the rest of engine/pdf can deal
 * in plain strings and Uint8Arrays.
 */

const ASCII = (s: string): Uint8Array => {
  const out = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i) & 0xff;
  return out;
};

export const bytes = ASCII;

/** Concatenate Uint8Arrays into one. */
export function concatBytes(parts: ReadonlyArray<Uint8Array>): Uint8Array {
  let total = 0;
  for (const p of parts) total += p.length;
  const out = new Uint8Array(total);
  let off = 0;
  for (const p of parts) {
    out.set(p, off);
    off += p.length;
  }
  return out;
}

/**
 * Format a number for a PDF stream. PDF disallows exponential notation; values
 * are written with up to 6 fractional digits and trailing zeros stripped.
 */
export function fmtNum(n: number): string {
  if (!Number.isFinite(n)) return '0';
  if (Number.isInteger(n)) return n.toString();
  const fixed = n.toFixed(6);
  return fixed.replace(/0+$/, '').replace(/\.$/, '');
}

/**
 * Escape a string for use as a PDF literal string `(...)`. Per PDF spec, the
 * special characters are `\`, `(`, `)`, `\n`, `\r`, `\t`, `\b`, `\f`. Other
 * bytes are passed through verbatim — the literal-string form is byte-safe.
 */
export function escapePdfLiteral(s: string): string {
  let out = '';
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    switch (c) {
      case 0x5c:
        out += '\\\\';
        break;
      case 0x28:
        out += '\\(';
        break;
      case 0x29:
        out += '\\)';
        break;
      case 0x0a:
        out += '\\n';
        break;
      case 0x0d:
        out += '\\r';
        break;
      case 0x09:
        out += '\\t';
        break;
      case 0x08:
        out += '\\b';
        break;
      case 0x0c:
        out += '\\f';
        break;
      default:
        out += s.charAt(i);
    }
  }
  return out;
}

/** Format a string as a PDF literal: `(escaped)`. */
export function pdfString(s: string): string {
  return `(${escapePdfLiteral(s)})`;
}

/**
 * Format bytes as a PDF hex string: `<48656C6C6F>`. Use for binary or for
 * strings whose encoding would conflict with parens.
 */
export function pdfHexString(bytesIn: Uint8Array): string {
  let out = '<';
  for (let i = 0; i < bytesIn.length; i++) {
    out += bytesIn[i].toString(16).padStart(2, '0').toUpperCase();
  }
  return out + '>';
}

/** PDF name encoding: `/Name`, with `#XX` escapes for non-portable bytes. */
export function pdfName(s: string): string {
  let out = '/';
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    const safe =
      (c >= 0x21 && c <= 0x7e) &&
      c !== 0x23 && // #
      c !== 0x25 && // %
      c !== 0x28 && // (
      c !== 0x29 && // )
      c !== 0x2f && // /
      c !== 0x3c && // <
      c !== 0x3e && // >
      c !== 0x5b && // [
      c !== 0x5d && // ]
      c !== 0x7b && // {
      c !== 0x7d; // }
    if (safe) out += s.charAt(i);
    else out += '#' + c.toString(16).padStart(2, '0').toUpperCase();
  }
  return out;
}

/* -------------------------------------------------------------------------- */
/* WinAnsi encoding (subset) — used by standard 14 fonts                       */
/* -------------------------------------------------------------------------- */

/**
 * Map a Unicode code point to its WinAnsi byte. Returns 0 (NUL) if unmapped;
 * caller should guard against unsupported characters when using standard
 * fonts. (For Indic / non-Latin text, embed a TrueType font instead.)
 */
export function unicodeToWinAnsi(cp: number): number {
  // ASCII range — identity
  if (cp >= 0x20 && cp <= 0x7e) return cp;
  // Latin-1 supplement maps directly to 0xA0-0xFF (with a few overrides)
  if (cp >= 0xa0 && cp <= 0xff) return cp;
  // CP1252-specific characters in the 0x80-0x9F window
  switch (cp) {
    case 0x20ac:
      return 0x80; // €
    case 0x201a:
      return 0x82; // ‚
    case 0x0192:
      return 0x83; // ƒ
    case 0x201e:
      return 0x84; // „
    case 0x2026:
      return 0x85; // …
    case 0x2020:
      return 0x86; // †
    case 0x2021:
      return 0x87; // ‡
    case 0x02c6:
      return 0x88; // ˆ
    case 0x2030:
      return 0x89; // ‰
    case 0x0160:
      return 0x8a; // Š
    case 0x2039:
      return 0x8b; // ‹
    case 0x0152:
      return 0x8c; // Œ
    case 0x017d:
      return 0x8e; // Ž
    case 0x2018:
      return 0x91; // '
    case 0x2019:
      return 0x92; // '
    case 0x201c:
      return 0x93; // "
    case 0x201d:
      return 0x94; // "
    case 0x2022:
      return 0x95; // •
    case 0x2013:
      return 0x96; // –
    case 0x2014:
      return 0x97; // —
    case 0x02dc:
      return 0x98; // ˜
    case 0x2122:
      return 0x99; // ™
    case 0x0161:
      return 0x9a; // š
    case 0x203a:
      return 0x9b; // ›
    case 0x0153:
      return 0x9c; // œ
    case 0x017e:
      return 0x9e; // ž
    case 0x0178:
      return 0x9f; // Ÿ
    default:
      return 0;
  }
}

/**
 * Encode a Unicode string to its WinAnsi byte sequence. Unmappable code points
 * are replaced with `?` (0x3F). Use for text drawn in standard 14 fonts only.
 */
export function encodeWinAnsi(s: string): Uint8Array {
  const out = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) {
    const cp = s.charCodeAt(i);
    const b = unicodeToWinAnsi(cp);
    out[i] = b === 0 ? 0x3f : b;
  }
  return out;
}
