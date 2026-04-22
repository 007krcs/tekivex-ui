# @tekivex/figma-kit

Machine-readable design-system exports for the tekivex-ui Figma library. Generated from the real source — `src/themes/index.ts` and `src/components/`. No hand-maintained duplication.

```bash
npm run build        # regenerates both dist/ outputs
```

## Outputs

### `dist/tokens.figma.json`
W3C Design Tokens Community Group draft format — import via the [Figma Tokens / Tokens Studio](https://tokens.studio) plugin.

- `color.quantumDark` / `color.auroraLight` — 12 semantic roles per theme (bg, surface, border, text, primary, danger, …)
- `spacing.*` — 10-step scale (4px base)
- `radius.*` — sm / md / lg / xl / full
- `fontSize.*` — xs → 4xl
- `fontWeight.*` — regular → black
- `shadow.*` — sm / md / lg / xl

### `dist/variants.json`
Per-component prop catalog. Every `export interface TkxFooProps` is parsed; union-literal props and booleans become variant axes. Feed this into the Figma plugin that stamps one frame per combination.

```json
{
  "components": {
    "TkxButton": {
      "props": [
        { "name": "variant", "values": ["primary", "secondary", "ghost", "danger"] },
        { "name": "size", "values": ["sm", "md", "lg"] },
        { "name": "disabled", "values": [true, false] }
      ],
      "variantCount": 24
    }
  }
}
```

## Why this is safer than a hand-built kit

Every designer-facing token collapses to one file in this repo. When `src/themes/index.ts` changes, regenerate; Figma never drifts from runtime.

## License

MIT
