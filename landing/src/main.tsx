import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider, quantumDark } from 'tekivex-ui';
import 'tekivex-ui/styles';
import { App } from './App';
import './styles.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={quantumDark}>
      <App />
    </ThemeProvider>
  </StrictMode>,
);
