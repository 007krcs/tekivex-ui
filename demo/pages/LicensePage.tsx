import type { CSSProperties } from 'react';
import type { ThemeTokens } from '@tekivex/ui';
import { TkxCard, TkxCardBody, TkxBadge, TkxDivider } from '@tekivex/ui';
import { useBreakpoint } from '../hooks/useBreakpoint';

interface Props { theme: ThemeTokens }

const MIT_TEXT = `MIT License

Copyright (c) 2026 007krcs

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`;

export function LicensePage({ theme }: Props) {
  const bp = useBreakpoint();

  const s = {
    page: {
      maxWidth: 800,
      margin: '0 auto',
      padding: bp.isMobile ? '32px 16px 64px' : '48px 32px 80px',
      color: theme.text,
    } as CSSProperties,
    title: {
      fontSize: bp.isMobile ? '1.75rem' : '2.25rem',
      fontWeight: 800,
      letterSpacing: '-0.03em',
      marginBottom: 12,
    } as CSSProperties,
    sub: {
      fontSize: 15,
      color: theme.textMuted,
      lineHeight: 1.7,
      marginBottom: 32,
    } as CSSProperties,
    licenseBox: {
      fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Source Code Pro', monospace",
      fontSize: bp.isMobile ? 12 : 13,
      lineHeight: 1.8,
      whiteSpace: 'pre-wrap' as const,
      color: theme.text,
      padding: bp.isMobile ? 20 : 32,
      borderRadius: 12,
      background: theme.surfaceAlt,
      border: `1px solid ${theme.border}`,
    } as CSSProperties,
    faqTitle: {
      fontSize: 15,
      fontWeight: 700,
      marginBottom: 6,
    } as CSSProperties,
    faqDesc: {
      fontSize: 13,
      color: theme.textMuted,
      lineHeight: 1.7,
      marginBottom: 20,
    } as CSSProperties,
  };

  const faqs = [
    {
      q: 'Can I use TekiVex UI in commercial projects?',
      a: 'Yes. The MIT License allows unrestricted commercial use, modification, distribution, and sublicensing. You can use TekiVex UI in any project — personal, commercial, or enterprise.',
    },
    {
      q: 'Do I need to include the license in my project?',
      a: 'Yes. The MIT License requires that the copyright notice and permission notice are included in all copies or substantial portions of the Software. Include the LICENSE file in your distribution.',
    },
    {
      q: 'Can I modify the components?',
      a: 'Absolutely. You are free to modify, extend, and customize any component to suit your needs. No restrictions on derivative works.',
    },
    {
      q: 'Is there a warranty?',
      a: 'No. The software is provided "as is", without warranty of any kind. See the full license text above for details.',
    },
    {
      q: 'Can I rebrand and sell it?',
      a: 'Yes. The MIT License permits sublicensing and reselling. However, you must include the original copyright notice.',
    },
  ];

  return (
    <div style={s.page}>

      <h1 style={s.title}>License</h1>
      <p style={s.sub}>
        TekiVex UI is open-source software licensed under the <strong style={{ color: theme.text }}>MIT License</strong>.
        This is one of the most permissive licenses available — you can use it for anything.
      </p>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 32 }}>
        <TkxBadge variant="success">MIT License</TkxBadge>
        <TkxBadge variant="primary">Commercial Use ✓</TkxBadge>
        <TkxBadge variant="info">Modification ✓</TkxBadge>
        <TkxBadge variant="warning">Distribution ✓</TkxBadge>
      </div>

      {/* License text */}
      <TkxCard style={{ marginBottom: 40 }}>
        <TkxCardBody style={{ padding: 0 }}>
          <div style={s.licenseBox}>{MIT_TEXT}</div>
        </TkxCardBody>
      </TkxCard>

      <TkxDivider />

      {/* FAQ */}
      <div style={{ marginTop: 40 }}>
        <h2 style={{ fontSize: bp.isMobile ? '1.25rem' : '1.5rem', fontWeight: 700, marginBottom: 8, letterSpacing: '-0.02em' }}>
          Frequently Asked Questions
        </h2>
        <p style={{ fontSize: 14, color: theme.textMuted, marginBottom: 24, lineHeight: 1.6 }}>
          Common questions about using TekiVex UI under the MIT License.
        </p>

        {faqs.map((faq) => (
          <div key={faq.q}>
            <div style={s.faqTitle}>{faq.q}</div>
            <div style={s.faqDesc}>{faq.a}</div>
          </div>
        ))}
      </div>

      {/* Attribution */}
      <div style={{ marginTop: 32, padding: bp.isMobile ? 20 : 28, borderRadius: 12, border: `1px solid ${theme.border}`, background: theme.surface, textAlign: 'center' }}>
        <p style={{ fontSize: 14, color: theme.textMuted, lineHeight: 1.7, margin: 0 }}>
          MIT © 2026 <a href="https://github.com/007krcs" target="_blank" rel="noopener noreferrer" style={{ color: theme.primary, textDecoration: 'none', fontWeight: 600 }}>007krcs</a>
          {' · '}
          <a href="https://github.com/007krcs/tekivex-ui" target="_blank" rel="noopener noreferrer" style={{ color: theme.primary, textDecoration: 'none' }}>GitHub</a>
          {' · '}
          <a href="https://www.npmjs.com/package/tekivex-ui" target="_blank" rel="noopener noreferrer" style={{ color: theme.primary, textDecoration: 'none' }}>npm</a>
        </p>
      </div>

    </div>
  );
}
