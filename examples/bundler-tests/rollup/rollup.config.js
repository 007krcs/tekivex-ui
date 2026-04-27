import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import replace from '@rollup/plugin-replace';
import css from 'rollup-plugin-import-css';

export default {
  input: 'src/main.tsx',
  output: { file: 'dist/bundle.js', format: 'esm', sourcemap: true },
  plugins: [
    replace({
      preventAssignment: true,
      'process.env.NODE_ENV': JSON.stringify('production'),
    }),
    nodeResolve({
      // tekivex-ui's exports map ships modern ESM under the import condition.
      exportConditions: ['import', 'default'],
      // React's CJS won't resolve correctly without these extensions.
      extensions: ['.mjs', '.js', '.jsx', '.ts', '.tsx'],
    }),
    commonjs(),
    typescript({ tsconfig: './tsconfig.json' }),
    css({ output: 'bundle.css' }),
  ],
  // Strict — Rollup warnings (e.g. circular deps inside React) are flagged
  // by the smoke test's outer wrapper.
  onwarn(warning, warn) {
    // Skip the harmless "use client" warnings — RSC pragmas confuse Rollup.
    if (warning.code === 'MODULE_LEVEL_DIRECTIVE') return;
    warn(warning);
  },
};
