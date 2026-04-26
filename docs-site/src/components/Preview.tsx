import type { CSSProperties, ReactNode } from 'react';
import { ThemeProvider } from 'tekivex-ui';
// Vite/Astro hoist + dedupe this CSS — importing it from the shared Preview
// wrapper means every island gets the styles without us repeating it per file.
import 'tekivex-ui/styles';

// ─────────────────────────────────────────────────────────────────────────────
// <Preview> — shared wrapper for every live MDX demo island.
//
// Each MDX component page imports a thin demo file (Demos/<Name>Demo.tsx)
// that wraps its examples in <Preview>. The wrapper handles the boilerplate:
//   - ThemeProvider with mode="auto" so the demo follows the docs site theme
//   - Visible card frame with the same look as docs callouts
//   - A label slot so multiple demos on a page stay readable
// ─────────────────────────────────────────────────────────────────────────────

export interface PreviewProps {
  /** Optional title rendered above the demo. */
  label?: string;
  /** Inline style override for the inner content area. */
  style?: CSSProperties;
  /** When true, demos render against the dark theme regardless of system. */
  pinDark?: boolean;
  /** When true, against light. Mutually exclusive with pinDark. */
  pinLight?: boolean;
  children: ReactNode;
}

export function Preview({ label, style, pinDark, pinLight, children }: PreviewProps) {
  const mode = pinDark ? 'dark' : pinLight ? 'light' : 'auto';
  return (
    <ThemeProvider mode={mode}>
      <div
        className="tkx-preview"
        style={{
          // Defaults; can be overridden via the `style` prop.
          minHeight: 60,
          ...style,
        }}
      >
        {label && (
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--sl-color-text-accent)',
              marginBottom: 12,
              opacity: 0.7,
            }}
          >
            {label}
          </div>
        )}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
          {children}
        </div>
      </div>
    </ThemeProvider>
  );
}
