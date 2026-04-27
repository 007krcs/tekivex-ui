# tekivex-add

> shadcn-style component scaffolder for `tekivex-ui`. Copies the source of any component into your project so you own and edit it freely.

## Why

`tekivex-ui` is a normal npm package — install it, import components, get tree-shaking. That's the right answer for most teams.

But some teams want to **own the source**. shadcn/ui popularised that pattern: components are *code you can read and edit*, not deps you import. `tekivex-add` brings that pattern to `tekivex-ui`.

The two modes coexist:

| Mode | Tool | Use when |
|---|---|---|
| Library | `npm install tekivex-ui` | You want updates, tree-shaking, and zero source-management overhead |
| Copy-source | `npx tekivex-add button` | You want to fork a component, change its behaviour, or vendor the source |

## Usage

```bash
# Add a single component
npx tekivex-add button

# Add several at once (deps auto-resolved)
npx tekivex-add button card modal form

# List everything available
npx tekivex-add --list

# Custom output directory
npx tekivex-add --dir src/ui button
```

By default, files land in `src/components/ui/Tkx<Name>.tsx`. Pass `--force` to overwrite an existing file.

## What gets copied

For each component:
- The `Tkx<Name>.tsx` source file from the latest `master` branch
- Any peer components it imports (e.g. `tekivex-add card` also pulls `TkxCardHeader`, `TkxCardBody`, `TkxCardFooter` if they live in the same file — and any sibling `Tkx*` import is auto-detected)

The source uses standard React + TypeScript with no special build step. You'll need:

- `react` and `react-dom` (peer)
- A `ThemeProvider` from `tekivex-ui` (or your own theme tokens)
- Optionally, the `@tekivex/security-core` primitives if the component imports them — install that package separately

## Workflow

```bash
# 1. Add the component you want to fork
npx tekivex-add button

# 2. Edit it freely — it's now yours
$EDITOR src/components/ui/TkxButton.tsx

# 3. (Optional) Re-add later to see what changed upstream
npx tekivex-add button --force
git diff
```

## Versioning

The registry tracks `master`. To pin to a release, edit `registry.json` (or fork this package) and change `REPO_RAW_BASE` to point at a tag like `v2.8.0`.

## Status

Preview. Source-available; npm publish on demand. The registry currently lists **94 components**.
