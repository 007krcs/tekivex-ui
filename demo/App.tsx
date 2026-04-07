import { useState, useEffect, type CSSProperties } from 'react';
import { ThemeProvider, useTheme, quantumDark, auroraLight } from '@tekivex/ui';
import type { ThemeTokens } from '@tekivex/ui';
import { Sidebar } from './layout/Sidebar';
import { Header } from './layout/Header';

// ── Page imports ──────────────────────────────────────────────────────────────
import { HomePage } from './pages/HomePage';
import { GettingStartedPage } from './pages/GettingStartedPage';
import { CSSSystemPage } from './pages/CSSSystemPage';
import { AboutPage } from './pages/AboutPage';
import { LicensePage } from './pages/LicensePage';

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
import { SelectPage } from './docs/SelectPage';
import { CheckboxPage } from './docs/CheckboxPage';
import { RadioPage } from './docs/RadioPage';
import { ToastPage } from './docs/ToastPage';
import { AccordionPage } from './docs/AccordionPage';
import { DrawerPage } from './docs/DrawerPage';
import { DatePickerPage } from './docs/DatePickerPage';
import { SliderPage } from './docs/SliderPage';
import { PaginationPage } from './docs/PaginationPage';
import { ImagePage } from './docs/ImagePage';
import { FileUploadPage } from './docs/FileUploadPage';
import { RatingPage } from './docs/RatingPage';
import { ChatPage } from './docs/ChatPage';
import { TagPage } from './docs/TagPage';
import { TimelinePage } from './docs/TimelinePage';
import { MenuPage } from './docs/MenuPage';
import { ClockPage } from './docs/ClockPage';
import { VideoPlayerPage } from './docs/VideoPlayerPage';
import { StepperPage } from './docs/StepperPage';
import { ColorPickerPage } from './docs/ColorPickerPage';
import { NumberInputPage } from './docs/NumberInputPage';
import { OTPPage } from './docs/OTPPage';
import { CommandPage } from './docs/CommandPage';
import { CarouselPage } from './docs/CarouselPage';
import { IconPage } from './docs/IconPage';
import { BreadcrumbPage } from './docs/BreadcrumbPage';
import { PopoverPage } from './docs/PopoverPage';
import { AutocompletePage } from './docs/AutocompletePage';
import { TreeViewPage } from './docs/TreeViewPage';
import { ToolbarPage } from './docs/ToolbarPage';
import { TransferListPage } from './docs/TransferListPage';
import { SpeedDialPage } from './docs/SpeedDialPage';
import { AppBarPage } from './docs/AppBarPage';
import { BottomNavPage } from './docs/BottomNavPage';
import { SnackbarPage } from './docs/SnackbarPage';
import { DataGridPage } from './docs/DataGridPage';
import { MasonryPage } from './docs/MasonryPage';
import { RichTextDisplayPage } from './docs/RichTextDisplayPage';
import { FormPage } from './docs/FormPage';
import { LayoutPage } from './docs/LayoutPage';
import { TypographyPage } from './docs/TypographyPage';
import { SpinPage } from './docs/SpinPage';
import { EmptyPage } from './docs/EmptyPage';
import { StatisticPage } from './docs/StatisticPage';
import { ConfigProviderPage } from './docs/ConfigProviderPage';

// ── New section pages ──────────────────────────────────────────────────────────
import { ChartsPage } from './docs/ChartsPage';
import { HeadlessPage } from './docs/HeadlessPage';
import { SecurityPage } from './docs/SecurityPage';

// ── Template pages ─────────────────────────────────────────────────────────────
import { DashboardTemplate } from './templates/DashboardTemplate';
import { PortfolioTemplate } from './templates/PortfolioTemplate';
import { EcommerceTemplate } from './templates/EcommerceTemplate';
import { SupplyChainTemplate } from './templates/SupplyChainTemplate';
import { BlogTemplate } from './templates/BlogTemplate';
import { AdminSettingsTemplate } from './templates/AdminSettingsTemplate';
import { LandingPageTemplate } from './templates/LandingPageTemplate';

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
  '/components/select': SelectPage,
  '/components/checkbox': CheckboxPage,
  '/components/radio': RadioPage,
  '/components/toast': ToastPage,
  '/components/accordion': AccordionPage,
  '/components/drawer': DrawerPage,
  '/components/date-picker': DatePickerPage,
  '/components/slider': SliderPage,
  '/components/pagination': PaginationPage,
  '/components/image': ImagePage,
  '/components/file-upload': FileUploadPage,
  '/components/rating': RatingPage,
  '/components/chat': ChatPage,
  '/components/tag': TagPage,
  '/components/timeline': TimelinePage,
  '/components/menu': MenuPage,
  '/components/clock': ClockPage,
  '/components/video-player': VideoPlayerPage,
  '/components/stepper': StepperPage,
  '/components/color-picker': ColorPickerPage,
  '/components/number-input': NumberInputPage,
  '/components/otp': OTPPage,
  '/components/command': CommandPage,
  '/components/carousel': CarouselPage,
  '/components/icon': IconPage,
  '/components/breadcrumb': BreadcrumbPage,
  '/components/popover': PopoverPage,
  '/components/autocomplete': AutocompletePage,
  '/components/tree-view': TreeViewPage,
  '/components/toolbar': ToolbarPage,
  '/components/transfer-list': TransferListPage,
  '/components/speed-dial': SpeedDialPage,
  '/components/app-bar': AppBarPage,
  '/components/bottom-nav': BottomNavPage,
  '/components/snackbar': SnackbarPage,
  '/components/data-grid': DataGridPage,
  '/components/masonry': MasonryPage,
  '/components/rich-text': RichTextDisplayPage,
  '/components/form': FormPage,
  '/components/layout': LayoutPage,
  '/components/typography': TypographyPage,
  '/components/spin': SpinPage,
  '/components/empty': EmptyPage,
  '/components/statistic': StatisticPage,
  '/components/config-provider': ConfigProviderPage,
  // ── New routes ────────────────────────────────────────────────────────────
  '/charts': ChartsPage,
  '/headless': HeadlessPage,
  '/security': SecurityPage,
  '/templates/dashboard': DashboardTemplate,
  '/templates/portfolio': PortfolioTemplate,
  '/templates/ecommerce': EcommerceTemplate,
  '/templates/supply-chain': SupplyChainTemplate,
  '/templates/blog': BlogTemplate,
  '/templates/admin-settings': AdminSettingsTemplate,
  '/templates/landing-page': LandingPageTemplate,
  '/about': AboutPage,
  '/license': LicensePage,
};

function getRoute(): string {
  const hash = window.location.hash.replace(/^#/, '') || '/';
  return hash || '/';
}

// ── Responsive breakpoint ─────────────────────────────────────────────────────

function useIsMobile(breakpoint = 768): boolean {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < breakpoint : false,
  );
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < breakpoint);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, [breakpoint]);
  return isMobile;
}

// ── Global responsive styles (injected once) ──────────────────────────────────

function injectResponsiveStyles() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('tkx-demo-responsive')) return;
  const style = document.createElement('style');
  style.id = 'tkx-demo-responsive';
  style.textContent = `
    * { box-sizing: border-box; }
    body { overflow-x: hidden; }
    @media (max-width: 767px) {
      /* Doc page outer wrapper — reduce horizontal padding */
      #main-content > div {
        padding-left: 16px !important;
        padding-right: 16px !important;
        padding-top: 28px !important;
      }
      /* Prop tables — allow horizontal scroll instead of clip */
      [role="region"][aria-label="Component props documentation"] {
        overflow-x: auto !important;
      }
      /* Demo preview area — tighter padding */
      [role="region"][aria-label^="Live demo:"] {
        padding: 20px 12px !important;
        flex-direction: column !important;
      }
      /* Any inline grid with two columns — stack on mobile */
      [style*="grid-template-columns: 1fr 1fr"] {
        grid-template-columns: 1fr !important;
      }
      [style*="grid-template-columns: repeat(2"] {
        grid-template-columns: 1fr !important;
      }
      /* Reduce font sizes slightly for hero headings */
      h1[style*="2.25rem"] {
        font-size: 1.75rem !important;
      }
    }
    @media (max-width: 480px) {
      #main-content > div {
        padding-left: 12px !important;
        padding-right: 12px !important;
      }
    }
  `;
  document.head.appendChild(style);
}

// ── Inner app (has access to theme context) ───────────────────────────────────
function AppInner({ isDark, onToggleTheme }: { isDark: boolean; onToggleTheme: () => void }) {
  const theme = useTheme();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentRoute, setCurrentRoute] = useState<string>(getRoute);

  useEffect(() => { injectResponsiveStyles(); }, []);

  useEffect(() => {
    const handler = () => setCurrentRoute(getRoute());
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  }, []);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    if (isMobile) setSidebarOpen(false);
  }, [currentRoute, isMobile]);

  // Close sidebar when switching to desktop
  useEffect(() => {
    if (!isMobile) setSidebarOpen(false);
  }, [isMobile]);

  const handleNavigate = (route: string) => {
    window.location.hash = route;
    if (isMobile) setSidebarOpen(false);
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
    zIndex: 200,
    overflowY: 'auto',
    backgroundColor: theme.surface,
    borderRight: `1px solid ${theme.border}`,
    flexShrink: 0,
    transform: isMobile && !sidebarOpen ? 'translateX(-260px)' : 'translateX(0)',
    transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
  };

  const overlayStyle: CSSProperties = {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    zIndex: 199,
    backdropFilter: 'blur(2px)',
  };

  const mainWrapStyle: CSSProperties = {
    marginLeft: isMobile ? 0 : '260px',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    minWidth: 0,
    transition: 'margin-left 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
  };

  const headerStyle: CSSProperties = {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    backgroundColor: theme.surface,
    borderBottom: `1px solid ${theme.border}`,
  };

  const contentStyle: CSSProperties = {
    flex: 1,
    overflowY: 'auto',
    overflowX: 'hidden',
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

      {/* Mobile overlay */}
      {isMobile && sidebarOpen && (
        <div
          style={overlayStyle}
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar (fixed, slides in on mobile) */}
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
            isMobile={isMobile}
            onMenuToggle={() => setSidebarOpen((o) => !o)}
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
