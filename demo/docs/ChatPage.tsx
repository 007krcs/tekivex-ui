import { useState, useRef } from 'react';
import type { ThemeTokens } from '@tekivex/ui';
import {
  TkxChat,
  TkxChatBubble,
  TkxThinkingIndicator,
  TkxButton,
} from '@tekivex/ui';
import { DemoSection } from '../layout/DemoSection';
import { PropTable } from '../layout/PropTable';
import { WCAGBadge, WCAGBadgeGroup } from '../layout/WCAGBadge';

// ── Types ─────────────────────────────────────────────────────────────────────

type Role = 'user' | 'assistant' | 'system';

interface ChatMessage {
  id: string;
  role: Role;
  content: string;
  timestamp?: Date;
  status?: 'sending' | 'sent' | 'error';
}

// ── Prop definitions ──────────────────────────────────────────────────────────

const CHAT_PROPS = [
  { name: 'messages', type: 'ChatMessage[]', required: true, description: 'Array of message objects to display in the chat window.' },
  { name: 'onSend', type: '(content: string) => void', required: true, description: 'Callback fired when the user submits a new message.' },
  { name: 'isLoading', type: 'boolean', default: 'false', description: 'Shows a TkxThinkingIndicator at the bottom of the message list.' },
  { name: 'placeholder', type: 'string', default: "'Type a message…'", description: 'Placeholder text for the message input field.' },
  { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the input and send button.' },
  { name: 'height', type: 'number | string', default: "'500px'", description: 'Height of the chat container.' },
  { name: 'className', type: 'string', default: 'undefined', description: 'Extra class names on the root wrapper.' },
  { name: 'style', type: 'CSSProperties', default: 'undefined', description: 'Inline styles on the root wrapper.' },
];

const MESSAGE_PROPS = [
  { name: 'id', type: 'string', required: true, description: 'Unique identifier for the message.' },
  { name: 'role', type: "'user' | 'assistant' | 'system'", required: true, description: "Role of the message sender. Controls bubble alignment and styling." },
  { name: 'content', type: 'string', required: true, description: 'Message text content. Markdown is rendered if enabled.' },
  { name: 'timestamp', type: 'Date', default: 'undefined', description: 'Optional timestamp shown below the message.' },
  { name: 'status', type: "'sending' | 'sent' | 'error'", default: 'undefined', description: 'Delivery status shown for user messages.' },
];

// ── Demo helpers ─────────────────────────────────────────────────────────────

function makeId(): string {
  return Math.random().toString(36).slice(2, 9);
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: '1',
    role: 'assistant',
    content: 'Hello! I\'m the TekiVex UI demo assistant. How can I help you explore the component library today?',
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    status: 'sent',
  },
  {
    id: '2',
    role: 'user',
    content: 'Tell me about the TkxButton component.',
    timestamp: new Date(Date.now() - 4 * 60 * 1000),
    status: 'sent',
  },
  {
    id: '3',
    role: 'assistant',
    content: 'TkxButton supports 4 variants (solid, outline, ghost, link), 5 color schemes, 4 sizes, loading states with aria-busy, left/right icon slots, a glow effect, and full-width layout. All variants are WCAG AAA compliant with automatic foreground color calculation.',
    timestamp: new Date(Date.now() - 3 * 60 * 1000),
    status: 'sent',
  },
];

const SIMULATED_RESPONSES: string[] = [
  'Great question! TekiVex UI has 40+ accessible components built to WCAG 2.1 AAA standards.',
  'All components use a token-based theme system. You can customize colors, typography, and spacing globally.',
  'Keyboard navigation is fully supported across all interactive components. Try using Tab, arrow keys, and Enter.',
  'Every component ships with TypeScript types. The ThemeTokens interface provides full type safety for theme customization.',
  'Focus management is handled automatically in overlays (modals, drawers, toasts). Focus trapping and restoration are built in.',
];

// ── Page ─────────────────────────────────────────────────────────────────────

export function ChatPage({ theme }: { theme: ThemeTokens }) {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [isLoading, setIsLoading] = useState(false);
  const responseIndex = useRef(0);

  function handleSend(content: string) {
    const userMsg: ChatMessage = {
      id: makeId(),
      role: 'user',
      content,
      timestamp: new Date(),
      status: 'sent',
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    setTimeout(() => {
      const response = SIMULATED_RESPONSES[responseIndex.current % SIMULATED_RESPONSES.length];
      responseIndex.current += 1;

      const assistantMsg: ChatMessage = {
        id: makeId(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        status: 'sent',
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setIsLoading(false);
    }, 1800);
  }

  const dividerStyle = { height: '1px', backgroundColor: theme.border, margin: '48px 0', border: 'none' };

  const noteBoxStyle = {
    borderRadius: '10px',
    border: `1px solid ${theme.border}`,
    backgroundColor: theme.surfaceAlt,
    padding: '20px 24px',
    marginBottom: '24px',
  };

  const noteHeadStyle = {
    fontSize: '13px',
    fontWeight: 700 as const,
    color: theme.text,
    margin: '0 0 12px',
  };

  const noteItemStyle = {
    fontSize: '13.5px',
    color: theme.textMuted,
    lineHeight: '1.7',
    margin: '0 0 6px',
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 32px 80px' }}>

      {/* WCAG badge row */}
      <div style={{ marginBottom: '24px' }}>
        <WCAGBadgeGroup
          label="WCAG 2.1 Compliance"
          badges={[
            { criterion: '1.3.1 Info & Relationships', level: 'AA', status: 'PASS' },
            { criterion: '1.4.3 Contrast', level: 'AAA', status: 'PASS' },
            { criterion: '2.1.1 Keyboard', level: 'AA', status: 'PASS' },
            { criterion: '4.1.3 Status Messages', level: 'AA', status: 'PASS' },
          ]}
        />
      </div>

      {/* Hero */}
      <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: theme.text, margin: '0 0 12px', letterSpacing: '-0.03em', lineHeight: 1.15 }}>
        TkxChat
      </h1>
      <p style={{ fontSize: '15px', color: theme.textMuted, lineHeight: '1.75', maxWidth: '640px', margin: '0 0 8px' }}>
        A fully accessible AI chat interface component with message bubbles, typing indicators, and a composable
        message input. New messages are announced to screen readers via a live region so assistive technology
        users get real-time updates without moving focus.
      </p>
      <p style={{ fontSize: '13px', color: theme.textMuted, lineHeight: '1.6', maxWidth: '640px', margin: '0 0 48px' }}>
        <strong style={{ color: theme.text }}>Components:</strong> TkxChat (full chat UI) |
        TkxChatBubble (individual message) |
        TkxThinkingIndicator (animated loading state).
      </p>

      {/* ── 1. Live Chat Demo ── */}
      <DemoSection
        title="Live Chat Demo"
        description="A fully interactive chat with simulated AI responses. Type a message and press Enter or click Send. The assistant responds after a 1.8-second simulated delay."
        theme={theme}
        code={`const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
const [isLoading, setIsLoading] = useState(false);

function handleSend(content: string) {
  setMessages(prev => [...prev, { id: makeId(), role: 'user', content }]);
  setIsLoading(true);
  setTimeout(() => {
    setMessages(prev => [...prev, { id: makeId(), role: 'assistant', content: response }]);
    setIsLoading(false);
  }, 1800);
}

<TkxChat
  messages={messages}
  onSend={handleSend}
  isLoading={isLoading}
  placeholder="Ask about TekiVex UI…"
/>`}
      >
        <TkxChat
          messages={messages}
          onSend={handleSend}
          isLoading={isLoading}
          placeholder="Ask about TekiVex UI…"
          height="420px"
        />
      </DemoSection>

      {/* ── 2. TkxThinkingIndicator ── */}
      <DemoSection
        title="TkxThinkingIndicator"
        description="A standalone animated three-dot indicator shown while the assistant is generating a response. Can be used inside TkxChat (via isLoading) or rendered independently."
        theme={theme}
        code={`// Standalone — shown while awaiting response
const [thinking, setThinking] = useState(false);

<TkxThinkingIndicator />

<TkxButton onClick={() => { setThinking(true); setTimeout(() => setThinking(false), 3000); }}>
  Simulate thinking
</TkxButton>
{thinking && <TkxThinkingIndicator />}`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '13px', color: theme.textMuted }}>Always visible:</span>
            <TkxThinkingIndicator />
          </div>
          <TkxButton
            size="sm"
            variant="outline"
            onClick={() => {
              setIsLoading(true);
              setTimeout(() => setIsLoading(false), 3000);
            }}
            disabled={isLoading}
          >
            {isLoading ? 'Thinking…' : 'Simulate 3s thinking state'}
          </TkxButton>
        </div>
      </DemoSection>

      {/* ── 3. TkxChatBubble ── */}
      <DemoSection
        title="TkxChatBubble — Individual Bubbles"
        description="TkxChatBubble can be used independently for custom chat layouts. User messages are right-aligned; assistant messages left-aligned. System messages are centered."
        theme={theme}
        code={`<TkxChatBubble
  role="user"
  content="What components are available?"
  timestamp={new Date()}
  status="sent"
/>

<TkxChatBubble
  role="assistant"
  content="Over 40 fully accessible components are available."
  timestamp={new Date()}
/>

<TkxChatBubble
  role="system"
  content="Conversation started"
/>`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '16px', backgroundColor: theme.bg, borderRadius: '12px', border: `1px solid ${theme.border}` }}>
          <TkxChatBubble
            message={{ id: 'demo-1', role: 'system', content: 'Conversation started' }}
          />
          <TkxChatBubble
            message={{ id: 'demo-2', role: 'user', content: 'What components are available in TekiVex UI?', timestamp: new Date(Date.now() - 2 * 60 * 1000) }}
            showTimestamp
          />
          <TkxChatBubble
            message={{ id: 'demo-3', role: 'assistant', content: 'Over 40 fully accessible components including buttons, inputs, selects, modals, drawers, chat, data tables, and more — all WCAG 2.1 AAA compliant.', timestamp: new Date(Date.now() - 1 * 60 * 1000) }}
            showTimestamp
          />
          <TkxChatBubble
            message={{ id: 'demo-4', role: 'user', content: 'Do they support dark mode?', timestamp: new Date(), isStreaming: true }}
            showTimestamp
          />
        </div>
      </DemoSection>

      {/* ── 4. Error & Status States ── */}
      <DemoSection
        title="Message Status States"
        description="User messages can carry a status: 'sending' shows a spinner, 'sent' shows a checkmark, 'error' shows a retry prompt. Status icons are aria-hidden with screen reader text provided separately."
        theme={theme}
        code={`<TkxChatBubble role="user" content="Message sending…" status="sending" />
<TkxChatBubble role="user" content="Message delivered"  status="sent"    />
<TkxChatBubble role="user" content="Failed to send"     status="error"   />`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '16px', backgroundColor: theme.bg, borderRadius: '12px', border: `1px solid ${theme.border}` }}>
          <TkxChatBubble message={{ id: 'status-1', role: 'user', content: 'This message is currently sending…', isStreaming: true }} />
          <TkxChatBubble message={{ id: 'status-2', role: 'user', content: 'This message was delivered successfully.' }} />
          <TkxChatBubble message={{ id: 'status-3', role: 'user', content: 'This message failed to send. Tap to retry.', error: true }} />
        </div>
      </DemoSection>

      <hr style={dividerStyle} />

      {/* Props Tables */}
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: theme.text, margin: '0 0 8px', letterSpacing: '-0.02em' }}>
        TkxChat Props
      </h2>
      <div style={{ marginBottom: '40px' }}>
        <PropTable props={CHAT_PROPS} />
      </div>

      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: theme.text, margin: '0 0 8px', letterSpacing: '-0.02em' }}>
        ChatMessage Shape
      </h2>
      <div style={{ marginBottom: '48px' }}>
        <PropTable props={MESSAGE_PROPS} />
      </div>

      <hr style={dividerStyle} />

      {/* Accessibility Notes */}
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: theme.text, margin: '0 0 20px', letterSpacing: '-0.02em' }}>
        Accessibility Notes
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
        <WCAGBadge criterion="1.3.1 Info & Relationships" level="AA" status="PASS" />
        <WCAGBadge criterion="1.4.3 Contrast (Minimum)" level="AA" status="PASS" />
        <WCAGBadge criterion="4.1.3 Status Messages" level="AA" status="PASS" />
        <WCAGBadge criterion="2.1.1 Keyboard Accessible" level="AA" status="PASS" />
      </div>
      <div style={noteBoxStyle}>
        <p style={noteHeadStyle}>Live Region for New Messages</p>
        <p style={noteItemStyle}>The message list container uses <code>aria-live="polite"</code>. When a new message is appended, screen readers announce it at the next natural pause. The thinking indicator uses <code>aria-live="polite"</code> with <code>aria-label="Assistant is thinking"</code>.</p>
        <p style={noteItemStyle}>For error messages (send failure), <code>role="alert"</code> is used to interrupt the screen reader immediately.</p>
      </div>
      <div style={noteBoxStyle}>
        <p style={noteHeadStyle}>Keyboard Interaction</p>
        <p style={noteItemStyle}><strong>Tab</strong> moves focus to the message input. <strong>Enter</strong> sends the message. <strong>Shift+Enter</strong> inserts a line break. The send button is also Tab-focusable and activated with Enter/Space.</p>
      </div>
    </div>
  );
}
