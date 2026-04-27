/// <reference types="vite/client" />

// Compiled MDX modules expose a default-exported React component.
declare module '*.mdx' {
  import type { ComponentType } from 'react';
  const MDXComponent: ComponentType;
  export default MDXComponent;
}
