import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider } from 'tekivex-ui';
import { installTrustedTypes, installFrameBuster, isFramed } from 'tekivex-security-core';
import { App } from './App';
import 'tekivex-ui/styles';

// ── Boot-time security wiring ───────────────────────────────────────────────
installTrustedTypes();

if (import.meta.env.PROD) {
  installFrameBuster(() => {
    window.top?.location?.replace(window.location.href);
  });
}

if (isFramed()) {
  console.warn('[security] app is loaded inside an iframe');
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>,
);
