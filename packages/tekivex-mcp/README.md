# tekivex-mcp

A Model Context Protocol server for `tekivex-ui`. It gives an AI assistant
**ground truth** about the component library instead of letting it guess.

## Why this exists

Assistants hallucinate props. In this repository's own history, fixtures shipped
using `label` where the prop was `title`, and `key` where it was `id` — the
components silently rendered nothing, and the tests passed for the wrong reason.
Documentation drifts; the compiler does not. Every answer here is extracted from
the TypeScript source at build time, or produced by the same validators that
gate the library's CI.

## Install

```jsonc
// claude_desktop_config.json
{
  "mcpServers": {
    "tekivex-ui": { "command": "npx", "args": ["-y", "tekivex-mcp"] }
  }
}
```

`jsdom` is an optional peer dependency; install it to enable
`ui_audit_accessibility`.

## Tools

| Tool | What it answers | Source of truth |
|---|---|---|
| `ui_list_components` | Which components exist, and which are RSC-safe | Extracted catalog |
| `ui_get_component_api` | Exact props, types, required flags, and the item shapes they reference | TypeScript compiler API |
| `ui_audit_accessibility` | WAI-ARIA 1.2 violations in an HTML fragment | The validator that gates the library build |
| `ui_verify_security` | XSS / CSP sinks, with the remedy for each | `docs/SECURITY-THREAT-MODEL.md` |
| `ui_scaffold_form` | An accessible form built from real components | Extracted catalog |

Tools fail loudly rather than inventing: an unknown component returns
`not_found` **with suggestions**, and an unsupported form field type returns
`unsupported_field_type` listing what is supported.

## Enterprise controls

Configured by environment variable; all optional.

| Variable | Default | Purpose |
|---|---|---|
| `TEKIVEX_MCP_TOKENS` | *(none)* | `name:token,name:token`. When set, every call must present a token in `params._meta.token`. |
| `TEKIVEX_MCP_RATE_LIMIT` | `240` | Calls per principal per window. |
| `TEKIVEX_MCP_RATE_WINDOW_MS` | `60000` | Window length. |
| `TEKIVEX_MCP_MAX_INPUT_BYTES` | `256000` | Cap on `html` / `code` input. |

Authentication is **off by default**, which is correct for stdio: the transport
is the trust boundary when the server is a child process of your editor. Set
tokens before exposing it over anything else. Every call is recorded in an
in-memory audit log (`server.auditLog()`) with principal, tool, and outcome —
`ok`, `denied`, or `error`.

Token comparison is length-checked and constant-time-ish to avoid leaking token
length by timing.

## Keeping the catalog honest

```bash
npm run catalog   # re-extract from src/components/*.tsx
```

Run it after changing any component API. `prepublishOnly` runs it automatically,
so a published build can never carry a stale catalog.

## Scope, stated plainly

- `ui_audit_accessibility` checks **structure**. Colour contrast, focus
  visibility and target size need a real browser and are not evaluated.
- `ui_verify_security` is pattern-based review of known sinks. It is not a
  substitute for a full SAST run.
- The catalog reflects the version of `tekivex-ui` it was generated against; the
  version is returned with every response so a caller can detect a mismatch.
