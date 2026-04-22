import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider } from 'tekivex-ui';
import { App } from './App';
import 'tekivex-ui/styles';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>,
);
