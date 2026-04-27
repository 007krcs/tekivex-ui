import type { CSSProperties } from 'react';
import type { ThemeTokens } from 'tekivex-ui';

interface Props { theme: ThemeTokens; }

function Section({ title, children, theme }: { title: string; children: React.ReactNode; theme: ThemeTokens }) {
  return (
    <section style={{ marginBottom: '40px' }}>
      <h2 style={{ fontSize: '20px', fontWeight: 700, color: theme.primary, marginBottom: '12px', borderBottom: `1px solid ${theme.border}`, paddingBottom: '8px' }}>
        {title}
      </h2>
      {children}
    </section>
  );
}

export function PrivacyPolicyPage({ theme }: Props) {
  const prose: CSSProperties = { fontSize: '15px', lineHeight: '1.8', color: theme.text, marginBottom: '14px' };
  const listStyle: CSSProperties = { ...prose, paddingLeft: '24px', marginBottom: '8px' };
  const containerStyle: CSSProperties = {
    maxWidth: '860px',
    margin: '0 auto',
    padding: '48px 32px 80px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  };

  return (
    <main id="main-content" style={containerStyle}>
      {/* Header */}
      <header style={{ marginBottom: '48px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', borderRadius: '99px', background: `${theme.primary}18`, border: `1px solid ${theme.primary}40`, marginBottom: '16px' }}>
          <span style={{ color: theme.primary, fontSize: '12px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Legal</span>
        </div>
        <h1 style={{ fontSize: '36px', fontWeight: 800, color: theme.text, margin: '0 0 16px', lineHeight: '1.2' }}>
          Privacy Policy
        </h1>
        <p style={{ ...prose, color: theme.textMuted, marginBottom: 0 }}>
          <strong>Last updated:</strong> April 20, 2026 &nbsp;·&nbsp;
          <strong>Effective date:</strong> April 20, 2026
        </p>
        <p style={{ ...prose, marginTop: '12px', padding: '16px', background: `${theme.surface}`, borderRadius: '8px', border: `1px solid ${theme.border}` }}>
          TekiVex UI ("we", "our", or "us") operates the website <strong>tekivex.com</strong> and its subdomains, including <strong>ui.tekivex.com</strong>. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our websites. Please read this policy carefully. If you disagree with its terms, please discontinue use of our sites.
        </p>
      </header>

      {/* 1 */}
      <Section title="1. Information We Collect" theme={theme}>
        <p style={prose}>We may collect information about you in a variety of ways including:</p>

        <h3 style={{ fontSize: '16px', fontWeight: 700, color: theme.text, margin: '20px 0 8px' }}>1.1 Automatically Collected Data</h3>
        <p style={prose}>
          When you visit our site, our servers and third-party analytics services may automatically log standard data provided by your web browser. This may include your device's Internet Protocol (IP) address, browser type, browser version, the pages you visit, the time and date of your visit, the time spent on each page, referring URLs, and other diagnostic data.
        </p>

        <h3 style={{ fontSize: '16px', fontWeight: 700, color: theme.text, margin: '20px 0 8px' }}>1.2 Cookies and Tracking Technologies</h3>
        <p style={prose}>
          We use cookies, web beacons, pixel tags, and similar tracking technologies to help customize the site and improve your experience. When you access our site, your personal information may be collected through the use of cookies. You can choose to set your browser to refuse all cookies or to indicate when a cookie is being sent. However, some features of the site may not function properly if cookies are disabled.
        </p>
        <p style={prose}>Types of cookies we use:</p>
        <ul style={{ margin: '0 0 14px', paddingLeft: '24px' }}>
          {[
            'Essential cookies — required for the site to function.',
            'Preference cookies — remember your theme/settings choices.',
            'Analytics cookies — help us understand how visitors interact with our site (via Google Analytics).',
            'Advertising cookies — used by Google AdSense to serve relevant ads.',
          ].map(item => (
            <li key={item} style={listStyle}>{item}</li>
          ))}
        </ul>

        <h3 style={{ fontSize: '16px', fontWeight: 700, color: theme.text, margin: '20px 0 8px' }}>1.3 Information You Provide</h3>
        <p style={prose}>
          We do not currently offer account registration or contact forms. If this changes, any information you voluntarily provide (such as name or email address) will be collected only with your explicit consent and used only for the stated purpose.
        </p>
      </Section>

      {/* 2 */}
      <Section title="2. How We Use Your Information" theme={theme}>
        <p style={prose}>We use the information we collect to:</p>
        <ul style={{ margin: '0 0 14px', paddingLeft: '24px' }}>
          {[
            'Operate and maintain our website and documentation.',
            'Understand and analyze how you use our site (Google Analytics 4).',
            'Develop new features, products, and services.',
            'Serve relevant advertisements via Google AdSense.',
            'Detect, prevent, and address technical issues or security threats.',
            'Comply with legal obligations.',
          ].map(item => (
            <li key={item} style={listStyle}>{item}</li>
          ))}
        </ul>
        <p style={prose}>
          We will never sell your personal data to third parties.
        </p>
      </Section>

      {/* 3 */}
      <Section title="3. Google Analytics" theme={theme}>
        <p style={prose}>
          Our website uses <strong>Google Analytics 4 (GA4)</strong>, a web analytics service provided by Google LLC ("Google"). Google Analytics places cookies on your device to help us analyze how users interact with our site. The information generated by the cookie about your use of the website (including your anonymized IP address) will be transmitted to and stored by Google on servers in the United States.
        </p>
        <p style={prose}>
          Google will use this information on our behalf to evaluate your use of the website, compile reports on website activity, and provide other services relating to website activity and internet usage. Google may also transfer this information to third parties where required to do so by law, or where such third parties process the information on Google's behalf.
        </p>
        <p style={prose}>
          You may opt out of Google Analytics by installing the <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" style={{ color: theme.primary }}>Google Analytics Opt-out Browser Add-on</a>, or by using your browser's cookie controls.
        </p>
      </Section>

      {/* 4 */}
      <Section title="4. Google AdSense and Advertising" theme={theme}>
        <p style={prose}>
          We use <strong>Google AdSense</strong> to display advertisements on our site. Google AdSense uses cookies to serve ads based on a user's prior visits to our website or other websites on the Internet. Google's use of advertising cookies enables it and its partners to serve ads based on your visit to our site and/or other sites on the Internet.
        </p>
        <p style={prose}>Key points about advertising on our site:</p>
        <ul style={{ margin: '0 0 14px', paddingLeft: '24px' }}>
          {[
            'Third-party vendors, including Google, use cookies to serve ads based on your prior visits to our site or other sites.',
            "Google's use of advertising cookies enables it and its partners to serve ads based on your visit to our and/or other sites.",
            'You may opt out of personalized advertising by visiting Google\'s Ads Settings.',
            'You can also opt out via the Network Advertising Initiative opt-out page at networkadvertising.org.',
          ].map(item => (
            <li key={item} style={listStyle}>{item}</li>
          ))}
        </ul>
        <p style={prose}>
          <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" style={{ color: theme.primary }}>Manage Google ad preferences →</a>
        </p>
      </Section>

      {/* 5 */}
      <Section title="5. Third-Party Services" theme={theme}>
        <p style={prose}>
          Our site may link to or embed third-party services. These third parties have their own privacy policies and we do not accept any responsibility or liability for their policies or processing of your personal information. We encourage you to read the privacy policies of any third-party services you use.
        </p>
        <p style={prose}>Third-party services we use:</p>
        <ul style={{ margin: '0 0 14px', paddingLeft: '24px' }}>
          {[
            'Google Analytics 4 — analytics (privacy.google.com)',
            'Google AdSense — advertising (policies.google.com/technologies/ads)',
            'GitHub — code repository and CDN for npm packages',
            'npm / npmjs.com — package registry for tekivex-ui',
            'Render — web hosting',
          ].map(item => (
            <li key={item} style={listStyle}>{item}</li>
          ))}
        </ul>
      </Section>

      {/* 6 */}
      <Section title="6. Data Retention" theme={theme}>
        <p style={prose}>
          We retain automatically collected analytics data for up to 26 months, in line with Google Analytics 4's default retention settings. We do not store any personal information ourselves beyond what is aggregated anonymously by our analytics provider.
        </p>
      </Section>

      {/* 7 */}
      <Section title="7. Your Rights" theme={theme}>
        <p style={prose}>
          Depending on your location, you may have the following rights regarding your personal information:
        </p>
        <ul style={{ margin: '0 0 14px', paddingLeft: '24px' }}>
          {[
            'Right to access — request a copy of the data we hold about you.',
            'Right to rectification — request correction of inaccurate data.',
            'Right to erasure — request deletion of your data.',
            'Right to restrict processing — request we limit how we use your data.',
            'Right to data portability — receive your data in a portable format.',
            'Right to object — object to processing based on legitimate interests.',
            'Rights related to automated decision-making.',
          ].map(item => (
            <li key={item} style={listStyle}>{item}</li>
          ))}
        </ul>
        <p style={prose}>
          For EU/EEA residents, these rights are provided under the General Data Protection Regulation (GDPR). For California residents, similar rights are provided under the California Consumer Privacy Act (CCPA). To exercise any of these rights, please contact us at the email address below.
        </p>
      </Section>

      {/* 8 */}
      <Section title="8. Children's Privacy" theme={theme}>
        <p style={prose}>
          Our service is not directed at anyone under the age of 13. We do not knowingly collect personally identifiable information from children under 13. If you are a parent or guardian and you are aware that your child has provided us with personal information, please contact us so that we can take necessary action.
        </p>
      </Section>

      {/* 9 */}
      <Section title="9. Security" theme={theme}>
        <p style={prose}>
          We value your trust in providing us your information and strive to use commercially acceptable means of protecting it. Our site uses HTTPS/TLS encryption for all data in transit. However, no method of transmission over the internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
        </p>
        <p style={prose}>
          TekiVex UI itself is built with a zero-trust security model — all user inputs are sanitized, no eval()-based code execution is used in production builds, and all third-party scripts are loaded with appropriate CORS attributes.
        </p>
      </Section>

      {/* 10 */}
      <Section title="10. Changes to This Privacy Policy" theme={theme}>
        <p style={prose}>
          We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date at the top. You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
        </p>
      </Section>

      {/* 11 */}
      <Section title="11. Contact Us" theme={theme}>
        <p style={prose}>
          If you have any questions about this Privacy Policy, your rights, or our privacy practices, please contact us:
        </p>
        <div style={{ padding: '20px', background: theme.surface, borderRadius: '8px', border: `1px solid ${theme.border}` }}>
          <p style={{ ...prose, marginBottom: '6px' }}><strong>TekiVex UI</strong></p>
          <p style={{ ...prose, marginBottom: '6px' }}>GitHub: <a href="https://ui.tekivex.com" target="_blank" rel="noopener noreferrer" style={{ color: theme.primary }}>github.com/007krcs/tekivex-ui</a></p>
          <p style={{ ...prose, marginBottom: '6px' }}>npm: <a href="https://www.npmjs.com/package/tekivex-ui" target="_blank" rel="noopener noreferrer" style={{ color: theme.primary }}>npmjs.com/package/tekivex-ui</a></p>
          <p style={{ ...prose, marginBottom: 0 }}>Website: <a href="https://ui.tekivex.com" target="_blank" rel="noopener noreferrer" style={{ color: theme.primary }}>ui.tekivex.com</a></p>
        </div>
      </Section>

      {/* Footer note */}
      <div style={{ padding: '20px', borderRadius: '8px', border: `1px solid ${theme.border}`, background: `${theme.primary}08`, marginTop: '48px' }}>
        <p style={{ ...prose, margin: 0, color: theme.textMuted, fontSize: '13px' }}>
          This privacy policy was written to comply with the General Data Protection Regulation (GDPR), the California Consumer Privacy Act (CCPA), and the Google AdSense Program Policies. We are committed to protecting your privacy and handling your data transparently and responsibly.
        </p>
      </div>
    </main>
  );
}
