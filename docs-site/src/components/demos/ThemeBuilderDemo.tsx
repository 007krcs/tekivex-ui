import { TkxThemeBuilder } from 'tekivex-ui/quantum';
import { Preview } from '../Preview';

// ─────────────────────────────────────────────────────────────────────────────
// Live demo for /components/theme-builder/.
//
// TkxThemeBuilder ships from the 'tekivex-ui/quantum' subpath entry (it is
// heavy, so it is kept out of the main bundle). It is fully self-contained:
// the annealing run only starts on click, edits stay inside the builder, and
// nothing here changes the docs site theme.
// ─────────────────────────────────────────────────────────────────────────────

export function ThemeBuilderBasic() {
  return (
    <Preview
      label="Self-contained — optimisation runs on click; the docs theme is unaffected"
      style={{ flexDirection: 'column', alignItems: 'stretch' }}
    >
      <div style={{ width: '100%', maxWidth: 960, overflow: 'auto' }}>
        <TkxThemeBuilder initialMode="dark" initialHue={210} />
      </div>
    </Preview>
  );
}
