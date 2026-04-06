import { StrictMode, Component, type ReactNode, type ErrorInfo } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[TekiVex] Render error:', error, info);
  }
  render() {
    if (this.state.error) {
      const err = this.state.error as Error;
      return (
        <div style={{
          fontFamily: 'monospace', padding: '32px', background: '#0a0f1a',
          color: '#ff6b6b', minHeight: '100vh', whiteSpace: 'pre-wrap',
        }}>
          <div style={{ fontSize: '20px', marginBottom: '16px' }}>⚠ TekiVex UI — Render Error</div>
          <div style={{ color: '#ff4444', marginBottom: '12px' }}>{err.message}</div>
          <div style={{ color: '#888', fontSize: '13px' }}>{err.stack}</div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);
