import { TkxButton, TkxCard } from 'tekivex-ui';

export function App() {
  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24 }}>
      <TkxCard style={{ maxWidth: 480, padding: 32, textAlign: 'center' }}>
        <h1 style={{ margin: '0 0 12px' }}>Welcome to {{APP_NAME}}</h1>
        <p style={{ margin: '0 0 24px', opacity: 0.75 }}>
          Built with <strong>tekivex-ui</strong> \u2014 production-grade React components, WCAG AAA, SecurityCore.
        </p>
        <TkxButton variant="primary" onClick={() => alert('Hello from tekivex-ui!')}>
          Try me
        </TkxButton>
      </TkxCard>
    </div>
  );
}
