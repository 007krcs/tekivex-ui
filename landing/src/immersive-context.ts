import { createContext, useContext } from 'react';

interface ImmersiveCtx {
  open: () => void;
}

export const ImmersiveContext = createContext<ImmersiveCtx | null>(null);

export function useImmersive(): ImmersiveCtx {
  const ctx = useContext(ImmersiveContext);
  if (!ctx) {
    // Outside the home page (privacy, blog, docs, etc.) the immersive
    // overlay isn't mounted — return a no-op so consumers still work.
    return { open: () => {} };
  }
  return ctx;
}
