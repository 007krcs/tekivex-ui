import { useState, useEffect, type CSSProperties } from 'react';
import { ThemeProvider, useTheme, quantumDark, auroraLight } from '@tekivex/ui';
import type { ThemeTokens } from '@tekivex/ui';
import { Sidebar } from './layout/Sidebar';
import { Header } from './layout/Header';

// ── Page imports ──────────────────────────────────────────────────────────────
import { HomePage } from './pages/HomePage';
import { GettingStartedPage } from './pages/GettingStartedPage';
import { CSSSystemPage } from './pages/CSSSystemPage';

// ── Component doc pages ───────────────────────────────────────────────────────
// These are loaded lazily via dynamic import paths but imported statically here
// to keep bundle simple for a local demo.
import { ButtonPage } from './docs/ButtonPage';
import { CardPage } from './docs/CardPage';
import { InputPage } from './docs/InputPage';
import { BadgePage } from './docs/BadgePage';
import { ProgressPage } from './docs/ProgressPage';
import { TogglePage } from './docs/TogglePage';
import { AlertPage } from './docs/AlertPage';
import { ModalPage } from './docs/ModalPage';
import { TabsPage } from './docs/TabsPage';
import { TooltipPage } from './docs/TooltipPage';
import { SkeletonPage } from './docs/SkeletonPage';
import { AvatarPage } from './docs/AvatarPage';
import { TablePage } from './docs/TablePage';
import { DividerPage } from './docs/DividerPage';

// ── Template pages ─────────────────────────────────────────────────────────────
import { DashboardTemplate } from './templates/DashboardTemplate';
import { PortfolioTemplate } from './templates/PortfolioTemplate';
import { EcommerceTemplate } from './templates/EcommerceTemplate';
import { SupplyChainTemplate } from './templates/SupplyChainTemplate';

// ── Route → Component map ─────────────────────────────────────────────────────
type PageComponent = React.ComponentType<{ theme: ThemeTokens }>;

const ROUTE_MAP: Record<string, PageComponent> = {
  '/': HomePage,
  '/getting-started': GettingStartedPage,
  '/css-system': CSSSystemPage,
  '/components/button': ButtonPage,
  '/components/card': CardPage,
  '/components/input': InputPage,
  '/components/badge': BadgePage,
  '/components/progress': ProgressPage,
  '/components/toggle': TogglePage,
  '/components/alert': AlertPage,
  '/components/modal': ModalPage,
  '/components/tabs': TabsPage,
  '/components/tooltip': TooltipPage,
  '/components/skeleton': SkeletonPage,
  '/components/avatar': AvatarPage,
  '/components/table': TablePage,
  '/components/divider': DividerPage,
  '/templates/dashboard': DashboardTemplate,
  '/templates/portfolio': PortfolioTemplate,
  '/templates/ecommerce': EcommerceTemplate,
  '/templates/supply-chain': SupplyChainTemplate,
};

function getRoute(): string {
  const hash = window.location.hash.replace(/^#/, '') || '/';
  return hash || '/';
}

// ── Inner app (has access to theme context) ───────────────────────────────────
function AppInner({ isDark, onToggleTheme }: { isDark: boolean; onToggleTheme: () => void }) {
  const theme = useTheme();
  const [currentRoute, setCurrentRoute] = useState<string>(getRoute);

  useEffect(() => {
    const handler = () => setCurrentRoute(getRoute());
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  }, []);

  const handleNavigate = (route: string) => {
    window.location.hash = route;
  };

  const PageComponent = ROUTE_MAP[currentRoute] ?? HomePage;

  const rootStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    minHeight: '100vh',
    backgroundColor: theme.bg,
    color: theme.text,
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", "Inter", "Roboto", sans-serif',
    fontSize: '16px',
    lineHeight: '1.5',
  };

  const sidebarStyle: CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    bottom: 0,
    width: '260px',
    zIndex: 100,
    overflowY: 'auto',
    backgroundColor: theme.surface,
    borderRight: `1px solid ${theme.border}`,
    flexShrink: 0,
  };

  const mainWrapStyle: CSSProperties = {
    marginLeft: '260px',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    minWidth: 0,
  };

  const headerStyle: CSSProperties = {
    position: 'sticky',
    top: 0,
    zIndex: 50,
    backgroundColor: theme.surface,
    borderBottom: `1px solid ${theme.border}`,
  };

  const contentStyle: CSSProperties = {
    flex: 1,
    overflowY: 'auto',
    padding: '0',
    backgroundColor: theme.bg,
  };

  return (
    <div style={rootStyle}>
      {/* Skip navigation for a11y */}
      <a
        href="#main-content"
        style={{
          position: 'absolute',
          left: '-9999px',
          top: 'auto',
          width: '1px',
          height: '1px',
          overflow: 'hidden',
          zIndex: 999,
          padding: '8px 16px',
          backgroundColor: theme.primary,
          color: theme.bg,
          fontSize: '14px',
          fontWeight: 600,
          borderRadius: '4px',
          textDecoration: 'none',
        }}
        onFocus={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.left = '16px';
          (e.currentTarget as HTMLAnchorElement).style.top = '16px';
          (e.currentTarget as HTMLAnchorElement).style.width = 'auto';
          (e.currentTarget as HTMLAnchorElement).style.height = 'auto';
        }}
        onBlur={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.left = '-9999px';
          (e.currentTarget as HTMLAnchorElement).style.width = '1px';
          (e.currentTarget as HTMLAnchorElement).style.height = '1px';
        }}
      >
        Skip to main content
      </a>

      {/* Fixed sidebar */}
      <nav style={sidebarStyle} aria-label="Main navigation">
        <Sidebar
          currentRoute={currentRoute}
          onNavigate={handleNavigate}
          theme={theme}
        />
      </nav>

      {/* Main content area */}
      <div style={mainWrapStyle}>
        <div style={headerStyle}>
          <Header
            currentRoute={currentRoute}
            isDark={isDark}
            onToggleTheme={onToggleTheme}
            theme={theme}
          />
        </div>

        <main id="main-content" style={contentStyle} tabIndex={-1}>
          <PageComponent theme={theme} />
        </main>
      </div>
    </div>
  );
}

// ── Root App component ─────────────────────────────────────────────────────────
export function App() {
  const [isDark, setIsDark] = useState(true);
  const theme = isDark ? quantumDark : auroraLight;

  const handleToggleTheme = () => setIsDark((d) => !d);

  return (
    <ThemeProvider theme={theme}>
      <AppInner isDark={isDark} onToggleTheme={handleToggleTheme} />
    </ThemeProvider>
  );
}
