import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

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
    lib: {
      // Multiple entry points — each generates its own dist file.
      // index.ts     → dist/index.{js,cjs}
      // src/charts   → dist/charts.{js,cjs}
      // src/headless → dist/headless.{js,cjs}
      entry: {
        index: resolve(__dirname, 'index.ts'),
        charts: resolve(__dirname, 'src/charts/index.ts'),
        headless: resolve(__dirname, 'src/headless/index.ts'),
        i18n: resolve(__dirname, 'src/i18n/index.ts'),
        quantum: resolve(__dirname, 'src/quantum/index.ts'),
        realtime: resolve(__dirname, 'src/realtime/index.ts'),
      },
      name: 'TekiVexUI',
      formats: ['es', 'cjs'],
      fileName: (format, entryName) =>
        `${entryName}.${format === 'cjs' ? 'cjs' : 'js'}`,
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
        // Hide filename of split chunks so file-names don't leak component
        // organization (TkxButton.js → chunk-a3f2.js).
        chunkFileNames: 'chunk-[hash].js',
      },
    },
    cssCodeSplit: false,
  },
});
