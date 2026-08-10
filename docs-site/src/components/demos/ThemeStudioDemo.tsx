import { TkxThemeStudio } from 'tekivex-ui';
import { Preview } from '../Preview';

// ─────────────────────────────────────────────────────────────────────────────
// Live demo for /components/theme-studio/.
//
// The studio edits its own internal working copy of the theme tokens (seeded
// from the docs site's ambient ThemeProvider), so playing with it here never
// changes the docs site itself. Constrained to the content column width.
// ─────────────────────────────────────────────────────────────────────────────

export function ThemeStudioBasic() {
  return (
    <Preview
      label="Fully interactive — edits stay inside the studio's preview pane"
      style={{ flexDirection: 'column', alignItems: 'stretch' }}
    >
      <div style={{ width: '100%', maxWidth: 960, overflow: 'auto' }}>
        <TkxThemeStudio
          className="tk-studio-grid"
          exportName="myDocsTheme"
          onExport={() => {
            /* demo no-op — the export text is already visible in the panel */
          }}
        />
      </div>
    </Preview>
  );
}
