'use client';
import { ThemeProvider } from 'tekivex-ui';

export function Providers({ children }: { children: React.ReactNode }) {
  return <ThemeProvider mode="auto">{children}</ThemeProvider>;
}
