# Figma Kit Spec — tekivex-ui

**Status:** draft  
**Owner:** design lead (TBD)  
**Target:** Pro tier shipping artifact

## Goal

A Figma library that 1:1 mirrors tekivex-ui runtime output so designers hand off specs engineers can implement without translation loss.

## Deliverables

1. **Token library** — published as a Figma Variables collection
   - Colors (light / dark / high-contrast modes)
   - Spacing scale (4px base, 0/1/2/3/4/6/8/12/16/24)
   - Radius scale (sm/md/lg/xl/full)
   - Typography (font family, size, weight, line-height, letter-spacing)
   - Elevation (4 shadow levels)
   - Export: Figma Tokens JSON → drop into `packages/ui/src/tokens.ts`

2. **Component library** — one frame per component, variants for every prop combination that changes the visual
   - 80+ components; start with the 20 most-used (Button, Input, Select, Card, Modal, Table, Tabs, Badge, Avatar, Checkbox, Radio, Toggle, Slider, Menu, Toast, Tooltip, Drawer, Pagination, Breadcrumb, Alert)
   - Each variant annotated with the TypeScript prop that produces it
   - Auto-layout everywhere, constraints set so resize matches CSS behavior

3. **Pattern library** — assembled flows (login, settings panel, dashboard row, data table with filters)

4. **Changelog page** — in-Figma page that mirrors CHANGELOG.md entries

## Variant matrix (per component)

| Dimension | Values | Applies to |
|---|---|---|
| Size | sm, md, lg | Button, Input, Select, Avatar, Badge |
| Variant | primary, secondary, ghost, danger | Button |
| State | default, hover, focus, active, disabled, loading | all interactive |
| Theme | light, dark | all |
| Density | comfortable, compact | Table, Menu, List |

## Distribution

- Published as a Figma Community resource (free, discoverable)
- Pro customers get a private duplicate with edit rights + templates
- Version tied to npm version (Figma `v2.6.x` kit ↔ npm `tekivex-ui@2.6.x`)

## Success criteria

- Designer can build a screen in Figma, engineer reads the frame's component name + variant, writes matching JSX, and output matches within 2px
- Zero "how do I build this" questions on Slack for components covered by the kit
