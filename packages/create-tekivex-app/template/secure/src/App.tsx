import { useState } from 'react';
import { TkxButton, TkxCard, TkxInput } from 'tekivex-ui';
import { sanitizeHref, sanitizeUnicode, scrubPII, createRateLimiter } from 'tekivex-security-core';

const limiter = createRateLimiter(3, 2000);

export function App() {
  const [url, setUrl] = useState('');
  const [unicode, setUnicode] = useState('');
  const [log, setLog] = useState('');
  const [rateMsg, setRateMsg] = useState('');

  return (
    <div style={{ minHeight: '100vh', padding: 24, display: 'flex', justifyContent: 'center' }}>
      <div style={{ maxWidth: 720, width: '100%', display: 'grid', gap: 20 }}>
        <header style={{ textAlign: 'center', padding: '24px 0' }}>
          <h1 style={{ margin: 0 }}>{{APP_NAME}}</h1>
          <p style={{ opacity: 0.7, margin: '8px 0 0' }}>Secure by default — React + tekivex-ui + SecurityCore</p>
        </header>

        <TkxCard style={{ padding: 24 }}>
          <h3 style={{ marginTop: 0 }}>sanitizeHref</h3>
          <TkxInput value={url} onChange={(e) => setUrl((e.target as HTMLInputElement).value)} placeholder="paste any URL..." />
          <p style={{ marginTop: 8, fontSize: 13, opacity: 0.7 }}>Result: <code>{String(sanitizeHref(url))}</code></p>
        </TkxCard>

        <TkxCard style={{ padding: 24 }}>
          <h3 style={{ marginTop: 0 }}>sanitizeUnicode</h3>
          <TkxInput value={unicode} onChange={(e) => setUnicode((e.target as HTMLInputElement).value)} placeholder="try pasting bidi-override chars..." />
          <p style={{ marginTop: 8, fontSize: 13, opacity: 0.7 }}>Cleaned: <code>{sanitizeUnicode(unicode)}</code></p>
        </TkxCard>

        <TkxCard style={{ padding: 24 }}>
          <h3 style={{ marginTop: 0 }}>scrubPII</h3>
          <textarea value={log} onChange={(e) => setLog(e.target.value)} placeholder="call 415-555-0100 or email jane@example.com" style={{ width: '100%', minHeight: 60, padding: 8 }} />
          <p style={{ marginTop: 8, fontSize: 13, opacity: 0.7 }}>Scrubbed: <code>{scrubPII(log)}</code></p>
        </TkxCard>

        <TkxCard style={{ padding: 24 }}>
          <h3 style={{ marginTop: 0 }}>createRateLimiter</h3>
          <TkxButton variant="primary" onClick={() => setRateMsg(limiter.take('click') ? 'allowed' : 'rate-limited')}>Click me fast</TkxButton>
          <p style={{ marginTop: 8, fontSize: 13, opacity: 0.7 }}>{rateMsg}</p>
        </TkxCard>

        <footer style={{ textAlign: 'center', padding: 24, opacity: 0.5, fontSize: 13 }}>
          Built with <a href="https://www.tekivex.com/ui">tekivex-ui</a> · <a href="https://www.tekivex.com/ui/#/security">SecurityCore</a>
        </footer>
      </div>
    </div>
  );
}
