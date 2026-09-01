# MCP server

`tekivex-ui` ships a Model Context Protocol server. It gives an AI assistant
**ground truth** about this library instead of letting it guess.

It is part of the main package — not a separate install — so the catalog can
never drift from the components it describes.

## Why it exists

Assistants hallucinate props. This repository has itself shipped fixtures using
`label` where the prop was `title`, and `key` where it was `id`. The components
rendered nothing and the tests passed for the wrong reason. Documentation
drifts; a catalog extracted by the TypeScript compiler cannot.

## Configuration

### Claude Desktop

`claude_desktop_config.json` — macOS:
`~/Library/Application Support/Claude/claude_desktop_config.json`,
Windows: `%APPDATA%\Claude\claude_desktop_config.json`.

```json
{
  "mcpServers": {
    "tekivex-ui": {
      "command": "npx",
      "args": ["-y", "--package=tekivex-ui", "tekivex-mcp"]
    }
  }
}
```

`--package` is required because `tekivex-mcp` is a bin **inside** the
`tekivex-ui` package; without it npx would look for a package of that name.

If the library is already a dependency of your project, point at the local
binary instead — faster, and pinned to the version you actually build against:

```json
{
  "mcpServers": {
    "tekivex-ui": {
      "command": "node",
      "args": ["./node_modules/tekivex-ui/bin/tekivex-mcp.mjs"]
    }
  }
}
```

### Claude Code

```bash
claude mcp add tekivex-ui -- npx -y --package=tekivex-ui tekivex-mcp
```

### Cursor

`.cursor/mcp.json` in the project root (or `~/.cursor/mcp.json` globally) —
same shape:

```json
{
  "mcpServers": {
    "tekivex-ui": {
      "command": "npx",
      "args": ["-y", "--package=tekivex-ui", "tekivex-mcp"]
    }
  }
}
```

### With authentication

```json
{
  "mcpServers": {
    "tekivex-ui": {
      "command": "npx",
      "args": ["-y", "--package=tekivex-ui", "tekivex-mcp"],
      "env": {
        "TEKIVEX_MCP_TOKENS": "design-team:REPLACE_ME",
        "TEKIVEX_MCP_RATE_LIMIT": "240"
      }
    }
  }
}
```

Verify it loaded by asking the assistant to call `ui_list_components`; it should
answer with the component count and the library version.

## Tools

| Tool | What it answers | Source of truth |
|---|---|---|
| `ui_list_components` | Which components exist — name, category, one-line summary, RSC status | Extracted catalog |
| `ui_get_component_api` | Exact props, types, required flags, referenced item shapes, RSC directive guidance | TypeScript compiler API |
| `ui_audit_accessibility` | WAI-ARIA 1.2 violations in an HTML fragment | The validator that gates this build |
| `ui_verify_security` | XSS / CSP sinks, with a remedy for each | `docs/SECURITY-THREAT-MODEL.md` |
| `ui_scaffold_form` | An accessible form built from real components | Extracted catalog |

Tools fail loudly rather than inventing: an unknown component returns
`not_found` **with ranked suggestions**, and an unsupported field type returns
`unsupported_field_type` listing what is supported.

### Context budgeting

`ui_list_components` is deliberately compact — four fields per component, and a
`summary` capped at one sentence. Full prop tables and type definitions live
**only** in `ui_get_component_api`, so listing the catalog costs a small
fraction of the context that inlining every prop would. Narrow first with
`category` or `filter`, then fetch detail for the one component you chose.

Categories: `input`, `data`, `chart`, `overlay`, `layout`, `display`, `ai`,
`commerce`, `other`.

### RSC metadata

`ui_get_component_api` states server-component status in both directions, so an
agent scaffolding a Next.js or Remix file never has to infer it:

```jsonc
{
  "rscSafe": false,
  "isClientComponent": true,
  "requiresUseClientDirective": true,
  "directiveToPrepend": "'use client';",
  "rscNote": "Reads React context or uses state/handlers. The file that imports it must start with 'use client';"
}
```

Five components are server-safe today (`TkxBadge`, `TkxDivider`, `TkxEmpty`,
`TkxIcon`, `TkxSparkline`); everything else reads the theme through React
context. See [React Server Components](https://ui.tekivex.com/docs/rsc/).

## Enterprise controls

All optional, configured by environment variable.

| Variable | Default | Purpose |
|---|---|---|
| `TEKIVEX_MCP_TOKENS` | *(none)* | `name:token,name:token`. When set, every call must present a token in `params._meta.token`. |
| `TEKIVEX_MCP_RATE_LIMIT` | `240` | Calls per principal per window. |
| `TEKIVEX_MCP_RATE_WINDOW_MS` | `60000` | Window length. |
| `TEKIVEX_MCP_MAX_INPUT_BYTES` | `256000` | Cap on `html` / `code` input. |

Authentication is **off by default**, which is correct for stdio: the transport
is the trust boundary when the server is a child process of your editor. Set
tokens before exposing it over anything else. Token comparison is length-checked
and constant-time-ish so it cannot leak length by timing.

Every call is recorded in an in-memory audit log with principal, tool and
outcome (`ok`, `denied`, `error`), readable via `server.auditLog()` when
embedding the server programmatically:

```ts
import { TekivexMcpServer, createAriaValidator } from 'tekivex-ui/mcp';
```

## Keeping the catalog honest

```bash
npm run mcp:catalog   # re-extract from src/components/*.tsx
```

Run it after changing any component API; `prepublishOnly` runs it automatically,
so a published build cannot carry a stale catalog. Every response includes the
library version so a caller can detect a mismatch.

## Scope, stated plainly

- `ui_audit_accessibility` checks **structure**. Colour contrast, focus
  visibility and target size need a real browser and are not evaluated. It
  needs a DOM: install `jsdom` (an optional peer dependency) or the tool
  returns a clear error rather than a false pass.
- `ui_verify_security` is pattern-based review of known sinks, not a
  substitute for a full SAST run.
