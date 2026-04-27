# tekivex-content

> Content + document-creation pack — Markdown rendering, schema-typed Rich Text, Signature capture, Image Editor, anti-leak Watermark, Carousel.

## Install

```bash
npm install tekivex-content tekivex-ui
```

## What's in it

| Component | Purpose |
|---|---|
| `TkxMarkdown` | CommonMark + GFM renderer, sanitised by SecurityCore |
| `TkxRichTextDisplay` | Schema-typed block renderer (paragraph/heading/list/quote/code/image/embed) |
| `TkxImageEditor` | Crop / rotate / brightness / contrast — outputs Blob/File |
| `TkxSignaturePad` | Pointer-events canvas with smoothing, undo/clear, Blob output |
| `TkxWatermark` | v2 with `pattern="tiled" \| "single" \| "fingerprint"`, dynamic mode, intensifyOnDevtools |
| `TkxCarousel` | Autoplay, indicators, swipe, keyboard, `prefers-reduced-motion` |
| `TkxFileUpload` | Drag-drop, validation, previews |
| `TkxFontProvider` | Lazy Indic + RTL + CJK Google Fonts — 24 scripts |
| `useDevtoolsOpen` | Hook for content-protection UI |

## Quick example — paid-content protection

```tsx
import { TkxWatermark, useDevtoolsOpen } from 'tekivex-content';

function PaidPreview({ user, content }) {
  return (
    <TkxWatermark
      text={[`PREVIEW · ${user.email.split('@')[0]} · ${user.id.slice(-6)}`]}
      pattern="fingerprint"
      dynamic
      refreshMs={30000}
      intensifyOnDevtools
    >
      <article>{content}</article>
    </TkxWatermark>
  );
}
```

## Status

Preview. Source-available; npm publish on demand.
