import { Link } from 'react-router-dom';
import { TkxButton, TkxLayout, TkxAppBar, TkxCard, useTheme } from 'tekivex-ui';
import { LocaleSwitcher } from '../components/LocaleSwitcher';

/**
 * Landing page. Phase 2 will replace the placeholder card grid with the real
 * religion picker and the 8-template gallery.
 */
export function HomePage() {
  const theme = useTheme();
  return (
    <TkxLayout>
      <TkxAppBar
        title="ShubhBio"
        right={<LocaleSwitcher />}
        style={{ background: theme.surface }}
      />
      <main
        style={{
          maxWidth: 960,
          margin: '0 auto',
          padding: '32px 16px',
        }}
      >
        <h1 style={{ fontSize: '2rem', marginBottom: 8, color: theme.text }}>
          Marriage Biodata in Minutes — ₹20
        </h1>
        <p style={{ color: theme.textMuted, marginBottom: 24 }}>
          Sabka biodata, sabki bhasha, sirf ₹20. No login. Pay only when you
          download.
        </p>

        <TkxCard variant="elevated" style={{ padding: 24, marginBottom: 24 }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: 12, color: theme.text }}>
            Pick your religion to get started
          </h2>
          <p style={{ color: theme.textMuted, marginBottom: 16 }}>
            (Phase 2 will replace this with the religion picker and 8-template
            gallery — Hindu, Muslim, Christian, Sikh, Jain, plus modern minimal,
            royal-card and resume-style designs.)
          </p>
          <Link to="/build/hindu-traditional" style={{ textDecoration: 'none' }}>
            <TkxButton variant="solid" colorScheme="primary">
              Try the placeholder builder
            </TkxButton>
          </Link>
        </TkxCard>
      </main>
    </TkxLayout>
  );
}
