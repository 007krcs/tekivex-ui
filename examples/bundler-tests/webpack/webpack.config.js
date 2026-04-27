const path = require('node:path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/index.tsx',
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.jsx', '.mjs'],
    // Required for tekivex-ui's exports map (subpaths like /styles, /i18n).
    conditionNames: ['import', 'require', 'default'],
  },
  module: {
    rules: [
      { test: /\.tsx?$/, loader: 'ts-loader', exclude: /node_modules/ },
      { test: /\.css$/, use: ['style-loader', 'css-loader'] },
    ],
  },
  plugins: [new HtmlWebpackPlugin({ template: 'index.html' })],
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.[contenthash:8].js',
    clean: true,
  },
  // Strict mode — warnings become hard fails so the smoke test catches drift.
  performance: { hints: false },
  stats: { warnings: true, errors: true },
};
