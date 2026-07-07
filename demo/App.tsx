import { useState, useEffect, lazy, Suspense, Component, type CSSProperties, type ReactNode } from 'react';
import { ThemeProvider, useTheme, quantumDark, auroraLight } from 'tekivex-ui';
import type { ThemeTokens } from 'tekivex-ui';

// ── Chunk error boundary — catches "Failed to fetch dynamically imported module"
// errors that occur when a new deploy invalidates cached chunk hashes.
// On first failure: force a hard reload (clears the stale module cache).
// On repeated failure (already reloaded): show a user-friendly message.
class ChunkErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; reloaded: boolean }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, reloaded: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    const isChunkError =
      error.message.includes('Failed to fetch dynamically imported module') ||
      error.message.includes('Importing a module script failed') ||
      error.message.includes('error loading dynamically imported module');

    if (isChunkError && !sessionStorage.getItem('tkx-chunk-reloaded')) {
      sessionStorage.setItem('tkx-chunk-reloaded', '1');
      window.location.reload();
    } else {
      this.setState({ reloaded: true });
    }
  }

  render() {
    if (this.state.hasError && this.state.reloaded) {
      const reset = () => {
        try {
          sessionStorage.removeItem('tkx-chunk-reloaded');
          sessionStorage.removeItem('tkx-route');
        } catch { /* ignore */ }
        window.location.replace(window.location.pathname);
      };
      return (
        <div style={{ padding: '48px 32px', color: '#f72585', fontFamily: 'monospace', maxWidth: 720 }}>
          <strong style={{ fontSize: 18 }}>⚠ TekiVex UI — Render Error</strong>
          <p style={{ marginTop: 16, color: '#e8e8f4', fontSize: 14, lineHeight: 1.6 }}>
            A page chunk failed to load. This usually means the dev server is stale —
            either it was restarted, or it&apos;s running an older config.
          </p>
          <ol style={{ color: '#e8e8f4', fontSize: 14, lineHeight: 1.8, paddingLeft: 20 }}>
            <li>In the terminal where vite is running, press <code>Ctrl+C</code> and re-run <code>npm run dev</code>.</li>
            <li>Click the button below — it clears the chunk-reload guard and reloads the page.</li>
          </ol>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: 16, padding: '10px 20px', borderRadius: 8, border: 'none',
              background: '#00f5d4', color: '#0a0a1a', fontWeight: 700, cursor: 'pointer',
              fontFamily: 'inherit', fontSize: 14,
            }}
          >
            Reset and reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
import { Sidebar } from './layout/Sidebar';
import { Header } from './layout/Header';

// ── Critical pages — eager (small, always needed) ─────────────────────────────
import { HomePage } from './pages/HomePage';
import { GettingStartedPage } from './pages/GettingStartedPage';
import { BundlersPage } from './pages/BundlersPage';
const V27Page = lazy(() => import('./docs/v27Page').then(m => ({ default: m.V27Page })));
import { CSSSystemPage } from './pages/CSSSystemPage';
import { AboutPage } from './pages/AboutPage';
import { EcosystemPage } from './pages/EcosystemPage';
import { LicensePage } from './pages/LicensePage';
import { BlogPage } from './pages/BlogPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';

// ── Component doc pages — lazy loaded ────────────────────────────────────────
const ButtonPage = lazy(() => import('./docs/ButtonPage').then(m => ({ default: m.ButtonPage })));
const CardPage = lazy(() => import('./docs/CardPage').then(m => ({ default: m.CardPage })));
const InputPage = lazy(() => import('./docs/InputPage').then(m => ({ default: m.InputPage })));
const BadgePage = lazy(() => import('./docs/BadgePage').then(m => ({ default: m.BadgePage })));
const ProgressPage = lazy(() => import('./docs/ProgressPage').then(m => ({ default: m.ProgressPage })));
const TogglePage = lazy(() => import('./docs/TogglePage').then(m => ({ default: m.TogglePage })));
const AlertPage = lazy(() => import('./docs/AlertPage').then(m => ({ default: m.AlertPage })));
const ModalPage = lazy(() => import('./docs/ModalPage').then(m => ({ default: m.ModalPage })));
const TabsPage = lazy(() => import('./docs/TabsPage').then(m => ({ default: m.TabsPage })));
const TooltipPage = lazy(() => import('./docs/TooltipPage').then(m => ({ default: m.TooltipPage })));
const SkeletonPage = lazy(() => import('./docs/SkeletonPage').then(m => ({ default: m.SkeletonPage })));
const AvatarPage = lazy(() => import('./docs/AvatarPage').then(m => ({ default: m.AvatarPage })));
const TablePage = lazy(() => import('./docs/TablePage').then(m => ({ default: m.TablePage })));
const DividerPage = lazy(() => import('./docs/DividerPage').then(m => ({ default: m.DividerPage })));
const SelectPage = lazy(() => import('./docs/SelectPage').then(m => ({ default: m.SelectPage })));
const CheckboxPage = lazy(() => import('./docs/CheckboxPage').then(m => ({ default: m.CheckboxPage })));
const RadioPage = lazy(() => import('./docs/RadioPage').then(m => ({ default: m.RadioPage })));
const ToastPage = lazy(() => import('./docs/ToastPage').then(m => ({ default: m.ToastPage })));
const AccordionPage = lazy(() => import('./docs/AccordionPage').then(m => ({ default: m.AccordionPage })));
const DrawerPage = lazy(() => import('./docs/DrawerPage').then(m => ({ default: m.DrawerPage })));
const DatePickerPage = lazy(() => import('./docs/DatePickerPage').then(m => ({ default: m.DatePickerPage })));
const SliderPage = lazy(() => import('./docs/SliderPage').then(m => ({ default: m.SliderPage })));
const PaginationPage = lazy(() => import('./docs/PaginationPage').then(m => ({ default: m.PaginationPage })));
const ImagePage = lazy(() => import('./docs/ImagePage').then(m => ({ default: m.ImagePage })));
const FileUploadPage = lazy(() => import('./docs/FileUploadPage').then(m => ({ default: m.FileUploadPage })));
const RatingPage = lazy(() => import('./docs/RatingPage').then(m => ({ default: m.RatingPage })));
const ChatPage = lazy(() => import('./docs/ChatPage').then(m => ({ default: m.ChatPage })));
const MessageThreadPage = lazy(() => import('./docs/MessageThreadPage').then(m => ({ default: m.MessageThreadPage })));
const TagPage = lazy(() => import('./docs/TagPage').then(m => ({ default: m.TagPage })));
const TimelinePage = lazy(() => import('./docs/TimelinePage').then(m => ({ default: m.TimelinePage })));
const MenuPage = lazy(() => import('./docs/MenuPage').then(m => ({ default: m.MenuPage })));
const OrgChartPage = lazy(() => import('./docs/OrgChartPage').then(m => ({ default: m.OrgChartPage })));
const ClockPage = lazy(() => import('./docs/ClockPage').then(m => ({ default: m.ClockPage })));
const VideoPlayerPage = lazy(() => import('./docs/VideoPlayerPage').then(m => ({ default: m.VideoPlayerPage })));
const StepperPage = lazy(() => import('./docs/StepperPage').then(m => ({ default: m.StepperPage })));
const ColorPickerPage = lazy(() => import('./docs/ColorPickerPage').then(m => ({ default: m.ColorPickerPage })));
const NumberInputPage = lazy(() => import('./docs/NumberInputPage').then(m => ({ default: m.NumberInputPage })));
const OTPPage = lazy(() => import('./docs/OTPPage').then(m => ({ default: m.OTPPage })));
const CommandPage = lazy(() => import('./docs/CommandPage').then(m => ({ default: m.CommandPage })));
const CarouselPage = lazy(() => import('./docs/CarouselPage').then(m => ({ default: m.CarouselPage })));
const IconPage = lazy(() => import('./docs/IconPage').then(m => ({ default: m.IconPage })));
const BreadcrumbPage = lazy(() => import('./docs/BreadcrumbPage').then(m => ({ default: m.BreadcrumbPage })));
const PopoverPage = lazy(() => import('./docs/PopoverPage').then(m => ({ default: m.PopoverPage })));
const AutocompletePage = lazy(() => import('./docs/AutocompletePage').then(m => ({ default: m.AutocompletePage })));
const TreeViewPage = lazy(() => import('./docs/TreeViewPage').then(m => ({ default: m.TreeViewPage })));
const ToolbarPage = lazy(() => import('./docs/ToolbarPage').then(m => ({ default: m.ToolbarPage })));
const TransferListPage = lazy(() => import('./docs/TransferListPage').then(m => ({ default: m.TransferListPage })));
const SpeedDialPage = lazy(() => import('./docs/SpeedDialPage').then(m => ({ default: m.SpeedDialPage })));
const AppBarPage = lazy(() => import('./docs/AppBarPage').then(m => ({ default: m.AppBarPage })));
const BottomNavPage = lazy(() => import('./docs/BottomNavPage').then(m => ({ default: m.BottomNavPage })));
const SnackbarPage = lazy(() => import('./docs/SnackbarPage').then(m => ({ default: m.SnackbarPage })));
const DataGridPage = lazy(() => import('./docs/DataGridPage').then(m => ({ default: m.DataGridPage })));
const MasonryPage = lazy(() => import('./docs/MasonryPage').then(m => ({ default: m.MasonryPage })));
const RichTextDisplayPage = lazy(() => import('./docs/RichTextDisplayPage').then(m => ({ default: m.RichTextDisplayPage })));
const MarkdownPage = lazy(() => import('./docs/MarkdownPage').then(m => ({ default: m.MarkdownPage })));
const FormPage = lazy(() => import('./docs/FormPage').then(m => ({ default: m.FormPage })));
const LayoutPage = lazy(() => import('./docs/LayoutPage').then(m => ({ default: m.LayoutPage })));
const TypographyPage = lazy(() => import('./docs/TypographyPage').then(m => ({ default: m.TypographyPage })));
const SpinPage = lazy(() => import('./docs/SpinPage').then(m => ({ default: m.SpinPage })));
const EmptyPage = lazy(() => import('./docs/EmptyPage').then(m => ({ default: m.EmptyPage })));
const StatisticPage = lazy(() => import('./docs/StatisticPage').then(m => ({ default: m.StatisticPage })));
const ConfigProviderPage = lazy(() => import('./docs/ConfigProviderPage').then(m => ({ default: m.ConfigProviderPage })));
const TextareaPage = lazy(() => import('./docs/TextareaPage').then(m => ({ default: m.TextareaPage })));
const FieldPage = lazy(() => import('./docs/FieldPage').then(m => ({ default: m.FieldPage })));
const ComboBoxPage = lazy(() => import('./docs/ComboBoxPage').then(m => ({ default: m.ComboBoxPage })));
const CodePage = lazy(() => import('./docs/CodePage').then(m => ({ default: m.CodePage })));
const SplitterPage = lazy(() => import('./docs/SplitterPage').then(m => ({ default: m.SplitterPage })));
const DescriptionsPage = lazy(() => import('./docs/DescriptionsPage').then(m => ({ default: m.DescriptionsPage })));

// ── Real-Time pages — lazy loaded ─────────────────────────────────────────────
const LiveFeedPage = lazy(() => import('./docs/LiveFeedPage').then(m => ({ default: m.LiveFeedPage })));
const LiveMetricsPage = lazy(() => import('./docs/LiveMetricsPage').then(m => ({ default: m.LiveMetricsPage })));
const RealTimeChartPage = lazy(() => import('./docs/RealTimeChartPage').then(m => ({ default: m.RealTimeChartPage })));
const LiveLogPage = lazy(() => import('./docs/LiveLogPage').then(m => ({ default: m.LiveLogPage })));
const DataGridInfinitePage = lazy(() => import('./docs/DataGridInfinitePage').then(m => ({ default: m.DataGridInfinitePage })));

// ── Agent runtime page — lazy loaded ──────────────────────────────────────────
const AgentPage = lazy(() => import('./docs/AgentPage').then(m => ({ default: m.AgentPage })));

// ── Quantum AI pages — lazy loaded ────────────────────────────────────────────
const QuantumFormPage = lazy(() => import('./docs/QuantumFormPage').then(m => ({ default: m.QuantumFormPage })));
const ThemeBuilderPage = lazy(() => import('./docs/ThemeBuilderPage').then(m => ({ default: m.ThemeBuilderPage })));
const PlaygroundPage = lazy(() => import('./docs/PlaygroundPage').then(m => ({ default: m.PlaygroundPage })));

// ── Previously missing component pages — lazy loaded ──────────────────────────
const AffixPage = lazy(() => import('./docs/AffixPage').then(m => ({ default: m.AffixPage })));
const AnchorPage = lazy(() => import('./docs/AnchorPage').then(m => ({ default: m.AnchorPage })));
const CascaderPage = lazy(() => import('./docs/CascaderPage').then(m => ({ default: m.CascaderPage })));
const MentionsPage = lazy(() => import('./docs/MentionsPage').then(m => ({ default: m.MentionsPage })));
const QRCodePage = lazy(() => import('./docs/QRCodePage').then(m => ({ default: m.QRCodePage })));
const ResultPage = lazy(() => import('./docs/ResultPage').then(m => ({ default: m.ResultPage })));
const SegmentedPage = lazy(() => import('./docs/SegmentedPage').then(m => ({ default: m.SegmentedPage })));
const TourPage = lazy(() => import('./docs/TourPage').then(m => ({ default: m.TourPage })));
const WatermarkPage = lazy(() => import('./docs/WatermarkPage').then(m => ({ default: m.WatermarkPage })));

// ── New section pages — lazy loaded ───────────────────────────────────────────
const ChartsPage = lazy(() => import('./docs/ChartsPage').then(m => ({ default: m.ChartsPage })));
const HeadlessPage = lazy(() => import('./docs/HeadlessPage').then(m => ({ default: m.HeadlessPage })));
const SecurityPage = lazy(() => import('./docs/SecurityPage').then(m => ({ default: m.SecurityPage })));
const AIComponentsPage = lazy(() => import('./docs/AIComponentsPage').then(m => ({ default: m.AIComponentsPage })));
// Individual AI component doc pages re-use the same page with hash anchors — single lazy chunk
const AIConfidenceBarPage = lazy(() => import('./docs/AIComponentsPage').then(m => ({ default: m.AIComponentsPage })));
const AIChatBubblePage    = lazy(() => import('./docs/AIComponentsPage').then(m => ({ default: m.AIComponentsPage })));
const AIThinkingPage      = lazy(() => import('./docs/AIComponentsPage').then(m => ({ default: m.AIComponentsPage })));

// ── Growth / meta pages — eager ───────────────────────────────────────────────
import { RSCPage } from './pages/RSCPage';

// ── Template pages — lazy loaded ──────────────────────────────────────────────
const DashboardTemplate = lazy(() => import('./templates/DashboardTemplate').then(m => ({ default: m.DashboardTemplate })));
const PortfolioTemplate = lazy(() => import('./templates/PortfolioTemplate').then(m => ({ default: m.PortfolioTemplate })));
const EcommerceTemplate = lazy(() => import('./templates/EcommerceTemplate').then(m => ({ default: m.EcommerceTemplate })));
const SupplyChainTemplate = lazy(() => import('./templates/SupplyChainTemplate').then(m => ({ default: m.SupplyChainTemplate })));
const BlogTemplate = lazy(() => import('./templates/BlogTemplate').then(m => ({ default: m.BlogTemplate })));
const AdminSettingsTemplate = lazy(() => import('./templates/AdminSettingsTemplate').then(m => ({ default: m.AdminSettingsTemplate })));
const LandingPageTemplate = lazy(() => import('./templates/LandingPageTemplate').then(m => ({ default: m.LandingPageTemplate })));

// ── Route → Component map ─────────────────────────────────────────────────────
type PageComponent = React.ComponentType<{ theme: ThemeTokens }>;

const ROUTE_MAP: Record<string, PageComponent> = {
  '/': HomePage,
  '/getting-started': GettingStartedPage,
  '/bundlers': BundlersPage,
  '/v2-7': V27Page,
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
  '/components/message-thread': MessageThreadPage,
  '/components/tag': TagPage,
  '/components/timeline': TimelinePage,
  '/components/menu': MenuPage,
  '/components/org-chart': OrgChartPage,
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
  '/components/markdown': MarkdownPage,
  '/components/form': FormPage,
  '/components/layout': LayoutPage,
  '/components/typography': TypographyPage,
  '/components/spin': SpinPage,
  '/components/empty': EmptyPage,
  '/components/statistic': StatisticPage,
  '/components/config-provider': ConfigProviderPage,
  '/components/textarea': TextareaPage,
  '/components/field': FieldPage,
  '/components/combobox': ComboBoxPage,
  '/components/code': CodePage,
  '/components/splitter': SplitterPage,
  '/components/descriptions': DescriptionsPage,
  // ── Real-Time routes ──────────────────────────────────────────────────────
  '/live-feed': LiveFeedPage,
  '/live-metrics': LiveMetricsPage,
  '/realtime-chart': RealTimeChartPage,
  '/live-log': LiveLogPage,
  '/datagrid-infinite': DataGridInfinitePage,
  // ── Agent runtime ─────────────────────────────────────────────────────────
  '/agent': AgentPage,
  // ── Quantum AI routes ─────────────────────────────────────────────────────
  '/quantum-form': QuantumFormPage,
  '/theme-builder': ThemeBuilderPage,
  '/playground': PlaygroundPage,
  // ── Previously missing component routes ──────────────────────────────────
  '/components/affix': AffixPage,
  '/components/anchor': AnchorPage,
  '/components/cascader': CascaderPage,
  '/components/mentions': MentionsPage,
  '/components/qr-code': QRCodePage,
  '/components/result': ResultPage,
  '/components/segmented': SegmentedPage,
  '/components/tour': TourPage,
  '/components/watermark': WatermarkPage,
  // ── New routes ────────────────────────────────────────────────────────────
  '/charts': ChartsPage,
  '/headless': HeadlessPage,
  '/security': SecurityPage,
  '/ai-components': AIComponentsPage,
  '/ai-components/confidence-bar': AIConfidenceBarPage,
  '/ai-components/chat-bubble': AIChatBubblePage,
  '/ai-components/thinking': AIThinkingPage,
  '/rsc': RSCPage,
  '/templates/dashboard': DashboardTemplate,
  '/templates/portfolio': PortfolioTemplate,
  '/templates/ecommerce': EcommerceTemplate,
  '/templates/supply-chain': SupplyChainTemplate,
  '/templates/blog': BlogTemplate,
  '/templates/admin-settings': AdminSettingsTemplate,
  '/templates/landing-page': LandingPageTemplate,
  '/about': AboutPage,
  '/ecosystem': EcosystemPage,
  '/license': LicensePage,
  '/blog': BlogPage,
  '/privacy-policy': PrivacyPolicyPage,
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
    /* Use 'clip' not 'hidden' — hidden silently makes overflow-y 'auto' per
       the CSS Overflow spec, creating a second scroll container that fights
       with the document scroll and causes the nested-scrollbar / "footer
       moves separately" distortion. */
    body { overflow-x: hidden; overflow-x: clip; }
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
    // Single scroll container is the document body. We intentionally do NOT
    // set overflowY here — and we also do NOT set overflowX: 'hidden' — because
    // per the CSS Overflow spec, setting one axis to a non-visible value
    // promotes the other axis from `visible` to `auto`, silently turning this
    // element into a scroll container that fights with the document scroll
    // (symptom: scrollbar inside scrollbar, header/footer drift). Horizontal
    // overflow is already clipped at body level via `overflow-x: clip`.
    flex: 1,
    padding: '0',
    backgroundColor: theme.bg,
    minWidth: 0,
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
          <ChunkErrorBoundary>
            <Suspense fallback={
              <div style={{ padding: '48px 32px', display: 'flex', alignItems: 'center', gap: 12, color: theme.textMuted, fontSize: 14 }}>
                <span style={{ width: 18, height: 18, border: `2px solid ${theme.border}`, borderTopColor: theme.primary, borderRadius: '50%', display: 'inline-block', animation: 'tkx-spin 0.7s linear infinite' }} />
                Loading…
                <style>{`@keyframes tkx-spin { to { transform: rotate(360deg); } } @media (prefers-reduced-motion: reduce) { .tkx-spin-el { animation: none; } }`}</style>
              </div>
            }>
              <PageComponent theme={theme} />
            </Suspense>
          </ChunkErrorBoundary>
        </main>
      </div>
    </div>
  );
}

// ── Root App component ─────────────────────────────────────────────────────────
export function App() {
  // Default to light theme — flips automatically with prefers-color-scheme on first load.
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  });
  const theme = isDark ? quantumDark : auroraLight;

  const handleToggleTheme = () => setIsDark((d) => !d);

  return (
    <ThemeProvider theme={theme}>
      <AppInner isDark={isDark} onToggleTheme={handleToggleTheme} />
    </ThemeProvider>
  );
}
