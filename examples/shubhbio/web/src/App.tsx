import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { ThemeProvider, auroraLight, TkxToastProvider, I18nProvider } from 'tekivex-ui';
import { TkxPaymentProvider, createRazorpayProvider } from 'tekivex-ui';
import { HomePage } from './pages/HomePage';
import { BuilderPage } from './pages/BuilderPage';
import { PreviewPage } from './pages/PreviewPage';
import { PayPage } from './pages/PayPage';
import { SuccessPage } from './pages/SuccessPage';
import { useLocaleCode } from './i18n';
import { ENV } from './lib/env';

const razorpay = createRazorpayProvider({
  keyId: ENV.razorpayKeyId,
  name: 'ShubhBio',
  themeColor: '#a16207',
});

function AppShell() {
  const locale = useLocaleCode();
  return (
    <I18nProvider locale={locale}>
      <ThemeProvider theme={auroraLight}>
        <TkxToastProvider>
          <TkxPaymentProvider providers={[razorpay]}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/build" element={<Navigate to="/build/hindu-traditional" replace />} />
              <Route path="/build/:templateId" element={<BuilderPage />} />
              <Route path="/preview/:draftId" element={<PreviewPage />} />
              <Route path="/pay/:draftId" element={<PayPage />} />
              <Route path="/success/:draftId" element={<SuccessPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </TkxPaymentProvider>
        </TkxToastProvider>
      </ThemeProvider>
    </I18nProvider>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}
