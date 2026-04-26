# @tekivex/pdf

> **Preview release.** Source-available; published to npm on demand.

Render React components to pixel-stable PDFs and PNGs **without a headless
browser**. Wraps `@react-pdf/renderer` with the `tekivex-ui` design system —
same naming convention, themed defaults, runs on Vercel/Cloudflare
Workers/Lambda.

```
~1 MB pure-JS dep   vs   ~200 MB Chromium binary (Puppeteer)
~50 ms cold start   vs   2–4 s cold start
```

## Why not Puppeteer

Puppeteer launches a full Chromium and screenshots HTML. It's the most
accurate HTML→PDF tool, but:

- Doesn't fit on Vercel/Cloudflare Workers' default size limits
- 100–200 MB RAM per render
- Breaks on Chromium updates and security patches
- Slow cold-start

For **structured documents** (biodata, invoice, certificate, resume,
ticket, ID card) you don't need a browser. You need a layout engine that
handles flexbox, fonts, images, multi-page, and watermarks. That's
`@react-pdf/renderer`. We add the themed component layer on top.

## Install

```bash
npm install @tekivex/pdf @react-pdf/renderer
```

> `@react-pdf/renderer` is a peer dep — install it explicitly so version
> bumps stay under your control.

## Quick start — invoice

```tsx
import {
  TkxPDFDocument,
  TkxPDFPage,
  TkxPDFText,
  TkxPDFRow,
  TkxPDFColumn,
  renderToPDF,
} from '@tekivex/pdf';

const buffer = await renderToPDF(
  <TkxPDFDocument>
    <TkxPDFPage size="A4" margin={36}>
      <TkxPDFText size={24} weight="bold">Invoice #1234</TkxPDFText>
      <TkxPDFRow gap={16}>
        <TkxPDFColumn flex={1}>
          <TkxPDFText size={10}>From</TkxPDFText>
          <TkxPDFText size={12} weight="bold">Acme Inc.</TkxPDFText>
        </TkxPDFColumn>
        <TkxPDFColumn flex={1}>
          <TkxPDFText size={10}>To</TkxPDFText>
          <TkxPDFText size={12} weight="bold">Globex Corp.</TkxPDFText>
        </TkxPDFColumn>
      </TkxPDFRow>
    </TkxPDFPage>
  </TkxPDFDocument>
);

// Node:
await fs.writeFile('invoice.pdf', buffer);

// Browser:
const blob = await pdfToBlob(<MyDoc />);
const url = URL.createObjectURL(blob);
```

## Built-in templates

```tsx
import { BiodataTemplate, InvoiceTemplate } from '@tekivex/pdf';

const buffer = await renderToPDF(
  <BiodataTemplate
    data={{
      name: 'Priya Sharma',
      photoUrl: 'data:image/jpeg;base64,…',
      personal: [
        { label: 'Date of Birth', value: '14 Aug 1998' },
        { label: 'Height', value: '5\'4"' },
      ],
      education: [
        { label: 'Degree', value: 'B.Tech (Computer Science)' },
      ],
      family: [
        { label: 'Father', value: 'Rajesh Sharma' },
      ],
    }}
    watermark="PREVIEW · session-abc123"
  />
);
```

## Watermarks

`TkxPDFWatermark` adds tiled or single diagonal stamps. Pair with the
in-browser `TkxWatermark v2` from `tekivex-ui` so the leak-tracking
fingerprint is identical between live preview and downloaded PDF.

```tsx
<TkxPDFPage>
  <TkxPDFWatermark
    text={['CONFIDENTIAL', `session ${sessionId}`]}
    pattern="tiled"
    opacity={0.07}
  />
  {/* …content… */}
</TkxPDFPage>
```

## Server-side rendering

`renderToPDF()` returns a `Buffer` — pipe it to any HTTP response:

```ts
// Express / Vercel / Cloudflare
import { renderToPDF, BiodataTemplate } from '@tekivex/pdf';

export default async function handler(req, res) {
  const buffer = await renderToPDF(<BiodataTemplate data={…} />);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="biodata.pdf"');
  res.send(buffer);
}
```

For streaming large documents:

```ts
import { renderToPDFStream } from '@tekivex/pdf';
renderToPDFStream(<MyDoc />).pipe(res);
```

## Caveats

- `@react-pdf/renderer` supports a subset of CSS (flexbox layout, no
  `position: absolute` in flow, limited transforms). For structured
  documents this is fine.
- Custom fonts require explicit `Font.register()`. We'll bundle Noto
  pre-registrations in a follow-up release.
- Complex SVGs render fine when authored as React components; raw SVG
  files need to be inlined.
- For pixel-perfect web-page screenshots (e.g. capturing a live dashboard),
  Puppeteer is still the right tool. `@tekivex/pdf` targets generated
  documents, not screenshots.

## Status

This package is **preview**. The API surface is stable enough to use; we
publish to npm on demand once a real consumer hits a workflow that needs
it. The source is production-ready in this repo today.

[Open an issue](https://github.com/007krcs/tekivex-ui/issues/new) and we'll
tag a release within 48 hours.
