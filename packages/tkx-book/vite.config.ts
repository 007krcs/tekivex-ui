import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import mdx from '@mdx-js/rollup';

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
});
