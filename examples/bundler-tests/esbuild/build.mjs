import * as esbuild from 'esbuild';
import { copyFile } from 'node:fs/promises';

const result = await esbuild.build({
  entryPoints: ['src/main.tsx'],
  bundle: true,
  outfile: 'dist/bundle.js',
  format: 'esm',
  target: ['es2022', 'chrome120', 'firefox120', 'safari17'],
  jsx: 'automatic',
  // Conditional exports — esbuild needs explicit conditions because it
  // doesn't honour the package.json exports map otherwise.
  conditions: ['import', 'default'],
  loader: { '.css': 'css' },
  // tekivex-ui ships ESM; everything else gets bundled inline.
  metafile: true,
  logLevel: 'info',
  // Treat warnings as errors so this build is a real smoke test.
  logOverride: {
    'unsupported-css-property': 'error',
    'unsupported-jsx-comment': 'error',
  },
});

await copyFile('index.html', 'dist/index.html');

if (result.warnings.length > 0) {
  console.error('✗ esbuild produced warnings:');
  for (const w of result.warnings) console.error(`  ${w.text}`);
  process.exit(1);
}
console.log('✓ esbuild bundle written to dist/bundle.js');
