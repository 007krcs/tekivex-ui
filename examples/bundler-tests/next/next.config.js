/** @type {import('next').NextConfig} */
module.exports = {
  // Required: Next has to transpile tekivex-ui because it ships ESM and
  // uses 'use client' pragmas the older webpack pipeline can't pass through.
  transpilePackages: ['tekivex-ui'],
  experimental: {
    optimizePackageImports: ['tekivex-ui'],
  },
};
