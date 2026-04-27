import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import mdx from '@mdx-js/rollup';

import { resolve } from 'node:path';

// VITE_BASE lets us deploy the book under a sub-path of the canonical
// docs domain (e.g. /book/). Default '/' for local `npm run dev`.
const base = process.env.VITE_BASE || '/';

export default defineConfig({
  base,
  plugins: [
    // MDX must run before React so it produces .jsx that the React plugin
    // then transforms.
    { enforce: 'pre', ...mdx({ providerImportSource: '@mdx-js/react' }) },
    react(),
  ],
  server: { port: 5174 },
  optimizeDeps: { include: ['tekivex-ui', 'axe-core', '@mdx-js/react'] },

  // CRITICAL: avoid two copies of React.
  //
  // The book consumes tekivex-ui via file:../.. — without this alias,
  // Vite would resolve `import { TkxButton } from 'tekivex-ui'` to the
  // published `dist/index.js` which already has React bundled into it.
  // Combined with the React in tkx-book's own node_modules, that gives
  // two React instances → hooks from one read state from the other →
  //   "Cannot read properties of null (reading 'useState')"
  // and a blank page.
  //
  // The fix mirrors what demo/vite.config.ts does: alias `tekivex-ui`
  // to the SOURCE TypeScript at the repo root, so Vite compiles it
  // inline against the same React copy as the rest of the book. The
  // dedupe is belt-and-suspenders for any transitive-dep edge cases.
  resolve: {
    dedupe: ['react', 'react-dom', 'react/jsx-runtime'],
    alias: {
      'tekivex-ui': resolve(__dirname, '../../index.ts'),
      '@engine': resolve(__dirname, '../../src/engine'),
      '@themes': resolve(__dirname, '../../src/themes'),
      '@hooks': resolve(__dirname, '../../src/hooks'),
      '@a11y': resolve(__dirname, '../../src/a11y'),
    },
  },
});
