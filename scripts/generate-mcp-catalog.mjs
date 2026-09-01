#!/usr/bin/env node
/**
 * Extract the component catalog from the TypeScript source, using the compiler
 * API rather than regex, so the result is ground truth rather than a guess.
 *
 * This is the whole point of the MCP server: an assistant that asks
 * `ui_get_component_api` gets the props that actually exist. Hand-maintained
 * docs drift — this repo has shipped fixtures using `label` where the prop was
 * `title`, and `key` where it was `id`, precisely because nothing checked them
 * against the source.
 *
 *   node scripts/generate-catalog.mjs [--out catalog.json]
 */
import ts from 'typescript';
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, '..');
const COMPONENT_DIR = join(REPO, 'src/components');

const outFlagIndex = process.argv.indexOf('--out');
const OUT =
  outFlagIndex !== -1 ? process.argv[outFlagIndex + 1] : join(REPO, 'src/mcp/catalog.json');

/** Files that export components. */
const files = readdirSync(COMPONENT_DIR)
  .filter((f) => f.startsWith('Tkx') && f.endsWith('.tsx'))
  .map((f) => join(COMPONENT_DIR, f));

const program = ts.createProgram(files, {
  target: ts.ScriptTarget.ES2020,
  jsx: ts.JsxEmit.ReactJSX,
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  skipLibCheck: true,
  strict: true,
});
const checker = program.getTypeChecker();

/** Render a type as source-like text, trimmed for prompt economy. */
function typeText(type, node) {
  const text = checker.typeToString(
    type,
    node,
    ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.UseSingleQuotesForStringLiteralType,
  );
  return text.length > 220 ? text.slice(0, 217) + '…' : text;
}

/** First line of the JSDoc attached to a symbol, if any. */
function docOf(symbol) {
  const parts = symbol.getDocumentationComment(checker);
  if (!parts.length) return undefined;
  const text = ts.displayPartsToString(parts).trim();
  return text ? text.split('\n')[0] : undefined;
}

function isDeprecated(symbol) {
  return symbol.getJsDocTags().some((t) => t.name === 'deprecated');
}

const components = [];
const types = {};

for (const sourceFile of program.getSourceFiles()) {
  if (!files.includes(sourceFile.fileName.split('/').join('\\')) && !files.includes(sourceFile.fileName)) {
    continue;
  }
  const fileName = sourceFile.fileName.split(/[\\/]/).pop();
  const componentFile = fileName.replace('.tsx', '');
  const isClientComponent = sourceFile.text.includes("'use client'");

  ts.forEachChild(sourceFile, (node) => {
    // Every exported interface — not just `*Props`. The item shapes
    // (SelectOption, MenuItem, CommandPaletteCommand…) are exactly the ones
    // callers get wrong, so they must be in the catalog too.
    if (
      ts.isInterfaceDeclaration(node) &&
      node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)
    ) {
      const symbol = checker.getSymbolAtLocation(node.name);
      if (!symbol) return;
      const type = checker.getDeclaredTypeOfSymbol(symbol);

      const props = checker
        .getPropertiesOfType(type)
        .map((prop) => {
          const decl = prop.valueDeclaration ?? prop.declarations?.[0];
          if (!decl) return null;
          const propType = checker.getTypeOfSymbolAtLocation(prop, decl);
          return {
            name: prop.getName(),
            type: typeText(propType, decl),
            required: !(prop.flags & ts.SymbolFlags.Optional),
            description: docOf(prop),
            deprecated: isDeprecated(prop) || undefined,
          };
        })
        .filter(Boolean)
        // Drop the vast inherited DOM surface; keep what the component defines
        // plus common React props an author actually sets.
        .filter(
          (p) =>
            !/^(aria-|on[A-Z]|data-)/.test(p.name) ||
            p.description !== undefined,
        )
        .sort((a, b) => Number(b.required) - Number(a.required) || a.name.localeCompare(b.name));

      types[node.name.text] = {
        component: componentFile,
        props,
      };
    }

    // Exported type aliases (unions like `type ButtonVariant = 'solid' | …`).
    if (
      ts.isTypeAliasDeclaration(node) &&
      node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)
    ) {
      const symbol = checker.getSymbolAtLocation(node.name);
      if (!symbol) return;
      const aliased = checker.getDeclaredTypeOfSymbol(symbol);
      types[node.name.text] = {
        component: componentFile,
        alias: typeText(aliased, node),
      };
    }
  });

  // Exported component functions in this file.
  const moduleSymbol = checker.getSymbolAtLocation(sourceFile);
  const exports = moduleSymbol ? checker.getExportsOfModule(moduleSymbol) : [];
  for (const exp of exports) {
    const name = exp.getName();
    if (!name.startsWith('Tkx')) continue;
    const decl = exp.valueDeclaration ?? exp.declarations?.[0];
    if (!decl) continue;
    const isValue =
      ts.isFunctionDeclaration(decl) ||
      ts.isVariableDeclaration(decl) ||
      ts.isClassDeclaration(decl);
    if (!isValue) continue;

    components.push({
      name,
      file: componentFile,
      propsType: types[`${name}Props`] ? `${name}Props` : undefined,
      description: docOf(exp),
      rscSafe: !isClientComponent,
      importPath: 'tekivex-ui',
    });
  }
}

components.sort((a, b) => a.name.localeCompare(b.name));

const catalog = {
  generatedFrom: 'src/components/*.tsx via the TypeScript compiler API',
  libraryVersion: JSON.parse(readFileSync(join(REPO, 'package.json'), 'utf8')).version,
  componentCount: components.length,
  components,
  types,
};

writeFileSync(OUT, JSON.stringify(catalog, null, 2));
console.log(
  `catalog: ${components.length} components, ${Object.keys(types).length} types -> ${OUT}`,
);
