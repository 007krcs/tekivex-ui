# create-tekivex-app

Scaffold a secure React + Vite app with [tekivex-ui](https://www.tekivex.com/ui) pre-wired.

```bash
npx create-tekivex-app my-app
# or
npx create-tekivex-app my-app --template secure
```

## Templates

| Name | What you get |
|---|---|
| `basic` (default) | React 19 + Vite + tekivex-ui + ThemeProvider |
| `secure` | `basic` + SecurityCore + CSP meta tag + Trusted Types + frame-buster + live demos |

## Flags

```
--template, -t   basic | secure           default: basic
--no-install                              skip `npm install`
--no-git                                  skip `git init` + initial commit
--help, -h                                show help
```

## Why?

Shadcn won developer mindshare because one command scaffolds a working app. This is the same idea, but every template ships with:

- **WCAG 2.1 AAA** — components pass level AAA out of the box
- **SecurityCore** — XSS, Trojan Source, PII, clickjacking, CSP covered on day one
- **Zero-runtime CSS** — no Tailwind config, no PostCSS
- **TypeScript-first** — strict mode, declaration maps, typed themes

## Troubleshooting

- Node 18+ required
- Windows: run from a fresh shell (PowerShell / cmd). Git Bash also works.
- If `npm install` fails, retry manually: `cd <app-name> && npm install`

## License

MIT
