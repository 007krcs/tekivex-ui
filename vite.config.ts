import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// ---------------------------------------------------------------------------
// Multi-entry library build — one entry per `vite build` invocation.
//
// Why single-entry instead of `lib.entry: { ... }`?
//
// With multi-entry lib mode, Rollup hoists shared code into separate
// `chunk-*.js` files using Vite's chunk runtime format. That runtime format
// breaks Next.js webpack-RSC consumption:
//
//   TypeError: Cannot read properties of undefined (reading 'call')
//     at mountLazyComponent in react-server-dom-webpack-client
//
// Webpack's module factory map cannot find the Vite-shaped chunks even with
// `transpilePackages: ['tekivex-ui']`. Since Next.js powers ~70% of React
// production apps, that broken chunk format was a complete adoption blocker.
//
// Fix: build each entry as its own self-contained bundle with
// `inlineDynamicImports: true`. No chunk files are emitted; the output is
// the same plain-bundle shape that webpack, esbuild, parcel, turbopack, and
// rollup all consume identically. Trade-off: shared internals (security
// engine, CSS engine, etc.) get duplicated across entries — tree-shaking
// keeps the runtime cost flat, the tarball grows ~30%.
//
// Driver: `scripts/build-all-entries.mjs` runs `vite build` once per entry
// with `ENTRY=<name>` set in the environment.
// ---------------------------------------------------------------------------

const entries: Record<string, string> = {
  index: 'index.ts',
  themes: 'src/themes/index.ts',
  charts: 'src/charts/index.ts',
  headless: 'src/headless/index.ts',
  i18n: 'src/i18n/index.ts',
  quantum: 'src/quantum/index.ts',
  realtime: 'src/realtime/index.ts',
  agent: 'src/agent/index.ts',
  experimental: 'src/experimental/index.ts',
};

const entry = process.env.ENTRY ?? 'index';
const entryPath = entries[entry];
if (!entryPath) {
  throw new Error(
    `Unknown ENTRY="${entry}". Valid entries: ${Object.keys(entries).join(', ')}`,
  );
}

// Only the first build of the run clears dist — every subsequent entry
// appends to the same directory so we end up with all bundles in one place.
const isFirstEntry = entry === 'index';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@engine': resolve(__dirname, 'src/engine'),
      '@themes': resolve(__dirname, 'src/themes'),
      '@hooks': resolve(__dirname, 'src/hooks'),
      '@a11y': resolve(__dirname, 'src/a11y'),
    },
  },
  build: {
    // Strip sourcemaps from published package — prevents trivial reversal
    // of our atomic CSS engine, quantum algorithms, and security engine.
    sourcemap: false,
    // Use Terser for aggressive mangling + dead-code elimination.
    minify: 'terser',
    terserOptions: {
      compress: {
        passes: 3,
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.debug', 'console.info'],
        ecma: 2020,
      },
      mangle: {
        toplevel: true,
        // Mangle any identifier prefixed with an underscore (internal).
        properties: {
          regex: /^_[a-zA-Z0-9]/,
        },
      },
      format: {
        comments: false,
        ecma: 2020,
      },
    },
    emptyOutDir: isFirstEntry,
    lib: {
      entry: resolve(__dirname, entryPath),
      name: 'TekiVexUI',
      formats: ['es', 'cjs'],
      fileName: (format) => `${entry}.${format === 'cjs' ? 'cjs' : 'js'}`,
    },
    rollupOptions: {
      // recharts is a dependency but mark it external to keep bundle lean.
      // Consumers install it alongside tekivex-ui.
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        'recharts',
      ],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          recharts: 'Recharts',
        },
        // CRITICAL: do NOT emit chunk files. Bundle each entry's dependencies
        // inline so the output is webpack-compatible. The Vite chunk runtime
        // format breaks Next.js RSC. See docs/TROUBLESHOOTING.md and the
        // header comment in this file.
        //
        // Rollup 4 renamed `inlineDynamicImports` to `codeSplitting: false`
        // but still honours the old name for compatibility. We pass both —
        // the modern flag silences the deprecation warning under recent
        // Rollup builds, the legacy flag stays correct on older versions.
        inlineDynamicImports: true,
        // @ts-expect-error — `codeSplitting` is Rollup 4+ only; not yet in
        //   the bundled Vite Rollup typings.
        codeSplitting: false,
      },
    },
    cssCodeSplit: false,
  },
});
