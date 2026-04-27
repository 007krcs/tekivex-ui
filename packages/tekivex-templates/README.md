# tekivex-templates

> Pre-built PDF templates for `tekivex-pdf`. Drop in, render, ship.

Seven structured-document templates, all built on the public PDF primitive API. Each is a single React component you compose with your data and render via `renderToPDF()`.

## Install

```bash
npm install tekivex-templates tekivex-pdf @react-pdf/renderer
```

`tekivex-pdf` is a peer dependency — install both as a pair.

## What's in the box

| Template | Use case | Page size |
|---|---|---|
| `BiodataTemplate` | South-Asian matrimonial profile | A4 portrait |
| `InvoiceTemplate` | Sales invoice with tax + totals | A4 portrait |
| `CertificateTemplate` | Recognition / completion certificate | A4 landscape |
| `ResumeTemplate` | ATS-friendly single-column CV | A4 portrait |
| `TicketTemplate` | Event admission with QR stub | Half-letter |
| `BoardingPassTemplate` | Airline boarding pass | Wide 612×252 |
| `ReceiptTemplate` | POS thermal-printer receipt | 80mm × auto |

## Quick example

```tsx
import { renderToPDF } from 'tekivex-pdf';
import { BiodataTemplate } from 'tekivex-templates';

const buffer = await renderToPDF(
  <BiodataTemplate
    data={{
      name: 'Priya Sharma',
      photoUrl: 'data:image/jpeg;base64,…',
      personal: [
        { label: 'Date of Birth', value: '14 Aug 1998' },
        { label: 'Height', value: "5'4\"" },
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

// In a Next.js / Express / Vercel handler:
return new Response(buffer, {
  headers: {
    'Content-Type': 'application/pdf',
    'Content-Disposition': 'inline; filename="biodata.pdf"',
  },
});
```

## Subpath imports for tree-shaking

Each template lives at its own subpath, so consumers using only one template don't pay for the others:

```tsx
import { BiodataTemplate } from 'tekivex-templates/biodata';
import { InvoiceTemplate } from 'tekivex-templates/invoice';
```

The root `tekivex-templates` re-exports all of them for convenience.

## Why a separate package vs everything in `tekivex-pdf`

The audit recommended this split for three reasons:

1. **Independent versioning** — template-data shape changes shouldn't force a `tekivex-pdf` major bump
2. **Smaller core** — `tekivex-pdf` stays a clean primitive layer; people using only PDF primitives don't pay for templates they're not using
3. **Forkability** — templates are *opinionated* (font choices, layouts, decorative elements). Splitting them out makes it cleaner to fork and customise without forking the core

## Customising a template

Every template accepts a `theme` prop (PDFThemeTokens) plus its data shape. For deeper customisation:

1. Copy the template's source from this package into your repo
2. Edit freely — it's all built on the public `tekivex-pdf` primitive API
3. Render with `renderToPDF(<YourCustomBiodata data={…} />)`

Or use `npx tekivex-add` (shadcn-style scaffolder) to copy a template's source into your project automatically.

## Status

Preview. Source-available; npm publish on demand.
