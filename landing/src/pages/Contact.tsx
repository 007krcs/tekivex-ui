import { useState } from 'react';
import { PageShell } from './PageShell';
import { usePageMeta } from '../use-page-meta';
import { openMail } from '../contact-mail';

export const meta = {
  title: 'Contact TekiVex UI',
  description:
    'Email, GitHub issue tracker, and a contact form for the TekiVex UI maintainers. Bug reports, feature requests, and consulting inquiries.',
};

export function Contact() {
  usePageMeta(meta.title, meta.description);
  const [sent, setSent] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState('Question');
  const [message, setMessage] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    openMail({
      subject: `[TekiVex UI · ${topic}] from ${name || 'Anonymous'}`,
      body: `From: ${name} <${email}>\nTopic: ${topic}\n\n${message}\n\n---\nSent from www.tekivex.com/ui/contact`,
    });
    setSent(true);
  }

  return (
    <PageShell
      title="Contact"
      eyebrow="Get in touch"
      subtitle="Bug reports, feature requests, consulting inquiries, and everything in between."
      breadcrumbs={[{ label: 'Contact' }]}
    >
      <p>
        TekiVex UI is maintained by a small team. We try to read every message inside three
        business days, though more involved technical questions can take longer. Before sending,
        please consider which channel is the best fit for your question — it usually gets you a
        faster, better answer.
      </p>

      <h2>For bug reports + feature requests</h2>
      <p>
        Open an issue on our <a href="https://github.com/007krcs/tekivex-ui/issues" target="_blank" rel="noopener noreferrer">public GitHub issue tracker</a>.
        Public issues are the fastest path to a fix because anyone can see the discussion and
        contribute. Please include:
      </p>
      <ul>
        <li>Which package + version (<code>npm ls tekivex-ui</code>)</li>
        <li>A minimal repro — a Codesandbox or a paste of the smallest component that misbehaves</li>
        <li>What you expected vs. what happened</li>
        <li>Browser + OS if it's a rendering bug</li>
      </ul>

      <h2>For commercial / consulting inquiries</h2>
      <p>
        We take on integration work and custom components.{' '}
        <button
          type="button"
          onClick={() => openMail({ subject: '[TekiVex UI] Consulting inquiry' })}
          style={inlineLinkStyle}
        >
          Send the maintainers an email
        </button>{' '}
        with a brief description of what you're building, your timeline, and whether the work
        needs an NDA. We typically respond within one business day.
      </p>

      <h2>For privacy + legal</h2>
      <ul>
        <li>Privacy: <a href="mailto:privacy@tekivex.com">privacy@tekivex.com</a></li>
        <li>Legal / trademark: <a href="mailto:legal@tekivex.com">legal@tekivex.com</a></li>
        <li>Security disclosure: <a href="mailto:novaai0401@gmail.com">novaai0401@gmail.com</a> (PGP key on request)</li>
      </ul>

      <h2>For everything else, the form below</h2>
      <p>
        It opens your default mail client with a pre-filled message. We don't run a server-side
        contact endpoint for the open-source project — that way nothing about you is logged
        before you actually hit Send.
      </p>

      {sent ? (
        <div
          role="status"
          style={{
            padding: 16,
            borderRadius: 8,
            background: 'rgba(0,245,212,0.08)',
            border: '1px solid rgba(0,245,212,0.3)',
            color: '#00f5d4',
          }}
        >
          ✓ Your mail client should have opened. If nothing happened, copy the message and{' '}
          <button type="button" onClick={() => openMail()} style={inlineLinkStyle}>
            click here to retry
          </button>
          .
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          style={{ display: 'grid', gap: 14, marginTop: 16 }}
          aria-label="Contact form"
        >
          <Field label="Your name" required>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={inputStyle}
            />
          </Field>
          <Field label="Email address" required>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
            />
          </Field>
          <Field label="Topic">
            <select value={topic} onChange={(e) => setTopic(e.target.value)} style={inputStyle}>
              <option>Question</option>
              <option>Bug report</option>
              <option>Feature request</option>
              <option>Consulting / commercial</option>
              <option>Privacy / legal</option>
              <option>Other</option>
            </select>
          </Field>
          <Field label="Message" required>
            <textarea
              required
              rows={6}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              style={{ ...inputStyle, minHeight: 140, fontFamily: 'inherit' }}
            />
          </Field>
          <button
            type="submit"
            style={{
              padding: '10px 18px',
              minHeight: 44,
              borderRadius: 8,
              border: 'none',
              background: 'linear-gradient(135deg, #00f5d4, #7b8eff, #c4a8ff)',
              color: '#0a0a0f',
              fontWeight: 800,
              fontSize: 14,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Send via mail client →
          </button>
        </form>
      )}
    </PageShell>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, color: '#aaa' }}>
      <span>
        {label}
        {required && <span style={{ color: '#ff7eaf' }}> *</span>}
      </span>
      {children}
    </label>
  );
}

const inputStyle: React.CSSProperties = {
  padding: '10px 12px',
  minHeight: 42,
  borderRadius: 8,
  border: '1px solid rgba(255,255,255,0.12)',
  background: 'rgba(13, 13, 20, 0.6)',
  color: '#e8e8f4',
  fontSize: 14,
  fontFamily: 'inherit',
};

// Used for inline buttons that should look like text links — no
// "click here mailto:foo@bar.com" tooltip leaks because there's no href.
const inlineLinkStyle: React.CSSProperties = {
  background: 'transparent',
  border: 'none',
  padding: 0,
  margin: 0,
  font: 'inherit',
  color: 'var(--tk-prose-link)',
  textDecoration: 'underline',
  textUnderlineOffset: 3,
  cursor: 'pointer',
};
