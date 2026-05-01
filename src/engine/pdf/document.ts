/**
 * Tekivex UI — engine/pdf/document
 *
 * A minimal but spec-correct PDF 1.7 document model. Objects are added to an
 * indirect-reference table; pages each own a content stream; resources
 * (fonts, images) are de-duplicated and referenced by name. Serialization
 * builds the xref, trailer, and %%EOF marker.
 *
 * Coordinate convention exposed by this module: PDF native — origin at the
 * BOTTOM-LEFT of the page, Y increases upward. Higher layers (engine/pdf/scene)
 * convert from the top-left scene convention.
 */

import {
  bytes,
  concatBytes,
  fmtNum,
  pdfName,
  pdfString,
} from './encoding';
import {
  pickStandardFont,
  type StandardFontName,
} from './standard-fonts';
import { parseJpeg, type JpegInfo } from './jpeg';
import { PdfPage } from './page';

/* -------------------------------------------------------------------------- */
/* Indirect references                                                         */
/* -------------------------------------------------------------------------- */

export interface PdfRef {
  readonly id: number;
  readonly gen: 0;
}

export function refToken(r: PdfRef): string {
  return `${r.id} ${r.gen} R`;
}

/* -------------------------------------------------------------------------- */
/* Object table                                                                */
/* -------------------------------------------------------------------------- */

interface ObjectEntry {
  ref: PdfRef;
  serialize(): Uint8Array;
}

/* -------------------------------------------------------------------------- */
/* Resources: fonts, images                                                    */
/* -------------------------------------------------------------------------- */

export interface PdfFontResource {
  /** Resource name used in content streams, e.g., "F1". */
  resourceName: string;
  /** PDF base font name. */
  baseFont: StandardFontName;
  /** Indirect reference to the font dictionary object. */
  ref: PdfRef;
}

export interface PdfImageResource {
  /** Resource name used in content streams, e.g., "Im1". */
  resourceName: string;
  width: number;
  height: number;
  ref: PdfRef;
}

/* -------------------------------------------------------------------------- */
/* PdfDocument                                                                 */
/* -------------------------------------------------------------------------- */

export interface PdfDocumentInfo {
  title?: string;
  author?: string;
  subject?: string;
  keywords?: string;
  creator?: string;
  producer?: string;
}

export class PdfDocument {
  private nextId = 1;
  private objects: ObjectEntry[] = [];
  private pages: PdfPage[] = [];
  private fontByName = new Map<StandardFontName, PdfFontResource>();
  private fontCounter = 0;
  private imageCounter = 0;
  private imageByDigest = new Map<string, PdfImageResource>();
  private pendingResources: Array<{ pageRef: PdfRef; build: () => string }> = [];

  readonly info: PdfDocumentInfo;

  constructor(info: PdfDocumentInfo = {}) {
    this.info = {
      producer: 'Tekivex UI engine/pdf',
      creator: 'Tekivex UI',
      ...info,
    };
  }

  /* ----- Object allocation ------------------------------------------------ */

  allocateRef(): PdfRef {
    return { id: this.nextId++, gen: 0 };
  }

  addObject(ref: PdfRef, serialize: () => Uint8Array): void {
    this.objects.push({ ref, serialize });
  }

  /* ----- Fonts ------------------------------------------------------------ */

  ensureStandardFont(name: StandardFontName): PdfFontResource {
    const existing = this.fontByName.get(name);
    if (existing) return existing;
    const ref = this.allocateRef();
    const resourceName = `F${++this.fontCounter}`;
    const fontEntry: PdfFontResource = { resourceName, baseFont: name, ref };
    this.fontByName.set(name, fontEntry);
    this.addObject(ref, () =>
      bytes(
        `<< /Type /Font /Subtype /Type1 /BaseFont ${pdfName(
          name,
        )} /Encoding /WinAnsiEncoding >>`,
      ),
    );
    return fontEntry;
  }

  pickFont(family: string | undefined, bold: boolean, italic: boolean): PdfFontResource {
    const name = pickStandardFont({ family, bold, italic });
    return this.ensureStandardFont(name);
  }

  /* ----- Images (JPEG only for v1) --------------------------------------- */

  /**
   * Embed a JPEG image. The bytes are stored as a /DCTDecode stream — the
   * reader handles JPEG decompression. Identical bytes are de-duplicated.
   */
  addJpegImage(jpegBytes: Uint8Array): PdfImageResource {
    const digest = quickDigest(jpegBytes);
    const existing = this.imageByDigest.get(digest);
    if (existing) return existing;
    const info: JpegInfo = parseJpeg(jpegBytes);
    const ref = this.allocateRef();
    const resourceName = `Im${++this.imageCounter}`;
    const cs = info.components === 1 ? '/DeviceGray' : info.components === 4 ? '/DeviceCMYK' : '/DeviceRGB';
    const dict = `<< /Type /XObject /Subtype /Image /Width ${info.width} /Height ${info.height} /ColorSpace ${cs} /BitsPerComponent ${info.bitsPerComponent} /Filter /DCTDecode /Length ${jpegBytes.length} >>`;
    this.addObject(ref, () =>
      concatBytes([
        bytes(`${dict}\nstream\n`),
        jpegBytes,
        bytes('\nendstream'),
      ]),
    );
    const resource: PdfImageResource = {
      resourceName,
      ref,
      width: info.width,
      height: info.height,
    };
    this.imageByDigest.set(digest, resource);
    return resource;
  }

  /* ----- Pages ------------------------------------------------------------ */

  addPage(width: number, height: number): PdfPage {
    const page = new PdfPage(this, width, height);
    this.pages.push(page);
    return page;
  }

  /* ----- Serialization --------------------------------------------------- */

  /**
   * Serialize to a PDF byte sequence ready for download or persistence.
   *
   * Document layout:
   *   header                  %PDF-1.7 + binary marker comment
   *   indirect objects        catalog, info, pages, page-N, content-N, font-N, image-N
   *   xref                    cross-reference table (20 bytes per entry)
   *   trailer                 dictionary + startxref + %%EOF
   */
  serialize(): Uint8Array {
    // Reserve well-known refs first
    const catalogRef = this.allocateRef();
    const pagesRef = this.allocateRef();
    const infoRef = this.allocateRef();

    // Build pages: each page produces its content stream + page object.
    const pageRefs: PdfRef[] = [];
    for (const page of this.pages) {
      const contentRef = this.allocateRef();
      const pageRef = this.allocateRef();
      pageRefs.push(pageRef);

      const contentBytes = page.buildContentStream();
      const contentDict = `<< /Length ${contentBytes.length} >>`;
      this.addObject(contentRef, () =>
        concatBytes([
          bytes(`${contentDict}\nstream\n`),
          contentBytes,
          bytes('\nendstream'),
        ]),
      );

      this.addObject(pageRef, () => {
        const fonts = page.usedFonts;
        const images = page.usedImages;
        const fontEntries = fonts
          .map((f) => `${pdfName(f.resourceName)} ${refToken(f.ref)}`)
          .join(' ');
        const imageEntries = images
          .map((im) => `${pdfName(im.resourceName)} ${refToken(im.ref)}`)
          .join(' ');
        const fontDict = fonts.length > 0 ? `/Font << ${fontEntries} >>` : '';
        const xobjDict =
          images.length > 0 ? `/XObject << ${imageEntries} >>` : '';
        const resources = `<< ${fontDict} ${xobjDict} /ProcSet [/PDF /Text /ImageC /ImageB /ImageI] >>`;
        const mediaBox = `[0 0 ${fmtNum(page.width)} ${fmtNum(page.height)}]`;
        return bytes(
          `<< /Type /Page /Parent ${refToken(pagesRef)} /MediaBox ${mediaBox} /Resources ${resources} /Contents ${refToken(contentRef)} >>`,
        );
      });
    }

    // Pages tree
    this.addObject(pagesRef, () => {
      const kids = pageRefs.map((r) => refToken(r)).join(' ');
      return bytes(
        `<< /Type /Pages /Kids [${kids}] /Count ${pageRefs.length} >>`,
      );
    });

    // Catalog
    this.addObject(catalogRef, () =>
      bytes(`<< /Type /Catalog /Pages ${refToken(pagesRef)} >>`),
    );

    // Info
    this.addObject(infoRef, () => {
      const i = this.info;
      const parts: string[] = ['<<'];
      if (i.title) parts.push(`/Title ${pdfString(i.title)}`);
      if (i.author) parts.push(`/Author ${pdfString(i.author)}`);
      if (i.subject) parts.push(`/Subject ${pdfString(i.subject)}`);
      if (i.keywords) parts.push(`/Keywords ${pdfString(i.keywords)}`);
      if (i.creator) parts.push(`/Creator ${pdfString(i.creator)}`);
      if (i.producer) parts.push(`/Producer ${pdfString(i.producer)}`);
      parts.push('>>');
      return bytes(parts.join(' '));
    });

    // Header — %PDF-1.7 + a 4-byte "binary" comment so naive transports keep
    // bytes intact (recommended by the spec for any non-ASCII content).
    const header = concatBytes([
      bytes('%PDF-1.7\n%'),
      Uint8Array.from([0xe2, 0xe3, 0xcf, 0xd3]),
      bytes('\n'),
    ]);

    // Build object byte regions and record offsets in id order.
    // Sort objects by ref.id ascending so xref entries are contiguous.
    const sorted = [...this.objects].sort((a, b) => a.ref.id - b.ref.id);
    const offsets: number[] = new Array(sorted.length + 1);
    offsets[0] = 0; // entry 0 is the free-list head
    let position = header.length;
    const chunks: Uint8Array[] = [header];

    for (let i = 0; i < sorted.length; i++) {
      const entry = sorted[i];
      const prefix = bytes(`${entry.ref.id} ${entry.ref.gen} obj\n`);
      const body = entry.serialize();
      const suffix = bytes('\nendobj\n');
      offsets[entry.ref.id] = position;
      chunks.push(prefix, body, suffix);
      position += prefix.length + body.length + suffix.length;
    }

    // xref — entry 0 is the free-list head; entries 1..N point to objects
    const xrefOffset = position;
    const totalEntries = sorted.length + 1;
    let xref = `xref\n0 ${totalEntries}\n`;
    xref += '0000000000 65535 f \n';
    for (let i = 1; i <= sorted.length; i++) {
      const off = offsets[i];
      xref += `${off.toString().padStart(10, '0')} 00000 n \n`;
    }
    chunks.push(bytes(xref));

    // Trailer
    const trailer = `trailer\n<< /Size ${totalEntries} /Root ${refToken(catalogRef)} /Info ${refToken(infoRef)} >>\nstartxref\n${xrefOffset}\n%%EOF`;
    chunks.push(bytes(trailer));

    return concatBytes(chunks);
  }

  toBlob(): Blob {
    const buf = this.serialize();
    return new Blob([buf as unknown as ArrayBuffer], { type: 'application/pdf' });
  }
}

/* -------------------------------------------------------------------------- */
/* Internal: cheap content digest for image dedup (FNV-1a over first 1KB)      */
/* -------------------------------------------------------------------------- */

function quickDigest(bytesIn: Uint8Array): string {
  const FNV_OFFSET = 2166136261 >>> 0;
  const FNV_PRIME = 16777619;
  let hash = FNV_OFFSET;
  const len = Math.min(bytesIn.length, 1024);
  for (let i = 0; i < len; i++) {
    hash ^= bytesIn[i];
    hash = Math.imul(hash, FNV_PRIME) >>> 0;
  }
  return `${bytesIn.length}:${hash.toString(16)}`;
}
