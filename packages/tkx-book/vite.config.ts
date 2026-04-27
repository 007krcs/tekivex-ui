import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import mdx from '@mdx-js/rollup';

export default defineConfig({
  plugins: [
    // MDX must run before React so it produces .jsx that the React plugin
    // then transforms.
    { enforce: 'pre', ...mdx({ providerImportSource: '@mdx-js/react' }) },
    react(),
  ],
  server: { port: 5174 },
  optimizeDeps: { include: ['tekivex-ui', 'axe-core', '@mdx-js/react'] },
});
