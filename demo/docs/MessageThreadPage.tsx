import { useState, useCallback } from 'react';
import type { ThemeTokens } from 'tekivex-ui';
import { TkxMessageThread } from 'tekivex-ui';
import type {
  PeerMessage,
  PeerSender,
  PeerReaction,
} from 'tekivex-ui';
import { DemoSection } from '../layout/DemoSection';
import { PropTable } from '../layout/PropTable';
import { WCAGBadgeGroup } from '../layout/WCAGBadge';

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeId(): string {
  return Math.random().toString(36).slice(2, 10);
}

function minutesAgo(n: number): Date {
  return new Date(Date.now() - n * 60 * 1000);
}

function hoursAgo(n: number): Date {
  return new Date(Date.now() - n * 60 * 60 * 1000);
}

function toggleReaction(
  reactions: PeerReaction[] | undefined,
  emoji: string,
  userId: string,
): PeerReaction[] {
  const list = reactions ? reactions.map((r) => ({ ...r, by: [...r.by] })) : [];
  const existing = list.find((r) => r.emoji === emoji);
  if (existing) {
    if (existing.by.includes(userId)) {
      existing.by = existing.by.filter((u) => u !== userId);
    } else {
      existing.by.push(userId);
    }
    return list.filter((r) => r.by.length > 0);
  }
  list.push({ emoji, by: [userId] });
  return list;
}

// ── Avatar URLs (DiceBear) ───────────────────────────────────────────────────

const AV = (seed: string) =>
  `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;

// ── Section 1: 2-person chat (Alice + Bob) ───────────────────────────────────

const TWO_PERSON_SENDERS: Record<string, PeerSender> = {
  alice: { id: 'alice', name: 'Alice Chen', avatar: AV('alice'), presence: 'online', role: 'Staff Engineer' },
  bob: { id: 'bob', name: 'Bob Martinez', avatar: AV('bob'), presence: 'online', role: 'Senior Engineer' },
};

const TWO_PERSON_INITIAL: PeerMessage[] = [
  {
    id: 'p1',
    senderId: 'bob',
    text: 'Hey — ready to look at the auth refactor PR? It is finally green on CI.',
    timestamp: hoursAgo(26),
  },
  {
    id: 'p2',
    senderId: 'alice',
    text: 'Yes! Pulling it down now. Anything in particular you want me to focus on?',
    timestamp: hoursAgo(25.9),
    delivery: 'read',
    reactions: [{ emoji: '👍', by: ['bob'] }],
  },
  {
    id: 'p3',
    senderId: 'bob',
    text: 'The token rotation flow in src/auth/rotation.ts. I think the race condition is fixed but a second pair of eyes would help.',
    timestamp: hoursAgo(25.8),
  },
  {
    id: 'p4',
    senderId: 'alice',
    text: 'Here is the failing trace I captured yesterday for context:',
    timestamp: minutesAgo(45),
    delivery: 'read',
    attachments: [
      {
        id: 'att-img-1',
        kind: 'image',
        name: 'auth-trace.png',
        url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400',
        mimeType: 'image/png',
        width: 400,
        height: 250,
      },
    ],
  },
  {
    id: 'p5',
    senderId: 'bob',
    text: 'Oh that is exactly the case I was worried about. The mutex now wraps the refresh + persist together.',
    timestamp: minutesAgo(40),
    reactions: [
      { emoji: '🎉', by: ['alice'] },
      { emoji: '❤️', by: ['alice'] },
    ],
  },
  {
    id: 'p6',
    senderId: 'alice',
    text: 'Approved. Ship it.',
    timestamp: minutesAgo(2),
    delivery: 'sent',
    editedAt: minutesAgo(1),
  },
];

// ── Section 2: Group chat (4 engineers + viewer "me") ───────────────────────

const GROUP_SENDERS: Record<string, PeerSender> = {
  me: { id: 'me', name: 'You', avatar: AV('viewer'), presence: 'online' },
  priya: { id: 'priya', name: 'Priya Patel', avatar: AV('priya'), presence: 'online', role: 'SRE' },
  marcus: { id: 'marcus', name: 'Marcus Webb', avatar: AV('marcus'), presence: 'away', role: 'Backend' },
  jin: { id: 'jin', name: 'Jin Park', avatar: AV('jin'), presence: 'online', role: 'Frontend' },
};

const GROUP_INITIAL: PeerMessage[] = [
  {
    id: 'g1',
    senderId: 'priya',
    text: 'Pager just went off — checkout-service 500s climbing past 5% error rate. Anyone seeing it?',
    timestamp: hoursAgo(28),
  },
  {
    id: 'g2',
    senderId: 'marcus',
    text: 'On it. Pulling logs now.',
    timestamp: hoursAgo(27.95),
    reactions: [{ emoji: '👍', by: ['priya', 'jin'] }],
  },
  {
    id: 'g3',
    senderId: 'jin',
    text: 'Frontend metrics also showing elevated retry counts on /api/checkout/submit.',
    timestamp: hoursAgo(27.9),
  },
  {
    id: 'g4',
    senderId: 'marcus',
    text: 'Found it — the new payment-validator deploy is timing out on the Stripe SDK init. Rolling back deploy 4f2a1c.',
    timestamp: hoursAgo(27.8),
    replyTo: 'g1',
    reactions: [
      { emoji: '🎉', by: ['priya', 'jin', 'me'] },
      { emoji: '❤️', by: ['priya'] },
    ],
  },
  {
    id: 'g5',
    senderId: 'me',
    text: 'Posting the incident summary now.',
    timestamp: hoursAgo(27.7),
    delivery: 'read',
  },
  {
    id: 'g6',
    senderId: 'me',
    text: 'Incident report attached — please review before Monday standup.',
    timestamp: hoursAgo(2),
    delivery: 'read',
    editedAt: hoursAgo(1.9),
    attachments: [
      {
        id: 'att-file-1',
        kind: 'file',
        name: 'incident-2026-05-28.pdf',
        url: 'https://example.com/incident-2026-05-28.pdf',
        mimeType: 'application/pdf',
        size: 184320,
      },
    ],
  },
  {
    id: 'g7',
    senderId: 'priya',
    text: 'Great write-up. One nit: timeline says 14:02 UTC for first alert but PagerDuty has 14:01:47. Minor.',
    timestamp: hoursAgo(1.5),
    replyTo: 'g6',
  },
  {
    id: 'g8',
    senderId: 'jin',
    text: '',
    timestamp: hoursAgo(1.2),
    deletedAt: hoursAgo(1.1),
  },
  {
    id: 'g9',
    senderId: 'marcus',
    text: 'Adding a runbook entry for Stripe SDK init failures so we catch this sooner next time.',
    timestamp: minutesAgo(35),
    reactions: [{ emoji: '👍', by: ['me', 'priya'] }],
  },
  {
    id: 'g10',
    senderId: 'me',
    text: 'Trying to attach the runbook draft but uplink is flaky…',
    timestamp: minutesAgo(3),
    delivery: 'failed',
  },
];

// ── Section 3: Attachment showcase ───────────────────────────────────────────

const SHOWCASE_SENDERS: Record<string, PeerSender> = {
  demo: { id: 'demo', name: 'Demo Bot', avatar: AV('demo-bot'), presence: 'online' },
  me: { id: 'me', name: 'You', avatar: AV('viewer'), presence: 'online' },
};

const SHOWCASE_INITIAL: PeerMessage[] = [
  {
    id: 's1',
    senderId: 'demo',
    text: 'Image attachment — renders inline, click to open full-size:',
    timestamp: minutesAgo(20),
    attachments: [
      {
        id: 'sa-img',
        kind: 'image',
        name: 'sample-photo.jpg',
        url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400',
        mimeType: 'image/jpeg',
      },
    ],
  },
  {
    id: 's2',
    senderId: 'demo',
    text: 'Audio attachment — renders an inline player:',
    timestamp: minutesAgo(15),
    attachments: [
      {
        id: 'sa-audio',
        kind: 'audio',
        name: 'Kangaroo MusiQue — The Neverwritten Role Playing Game.mp3',
        url: 'https://commondatastorage.googleapis.com/codeskulptor-demos/DDR_assets/Kangaroo_MusiQue_-_The_Neverwritten_Role_Playing_Game.mp3',
        mimeType: 'audio/mpeg',
      },
    ],
  },
  {
    id: 's3',
    senderId: 'demo',
    text: 'Video attachment — renders an inline HTML5 video player:',
    timestamp: minutesAgo(10),
    attachments: [
      {
        id: 'sa-video',
        kind: 'video',
        name: 'BigBuckBunny.mp4',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        mimeType: 'video/mp4',
      },
    ],
  },
  {
    id: 's4',
    senderId: 'demo',
    text: 'Generic file attachment — renders as a file card with download:',
    timestamp: minutesAgo(5),
    attachments: [
      {
        id: 'sa-file',
        kind: 'file',
        name: 'spec.pdf',
        url: 'https://example.com/spec.pdf',
        mimeType: 'application/pdf',
        size: 524288,
      },
    ],
  },
];

// ── Prop tables ──────────────────────────────────────────────────────────────

const THREAD_PROPS = [
  { name: 'messages', type: 'PeerMessage[]', required: true, description: 'Ordered array of messages to render. Pass the full conversation; the component handles grouping + day separators.' },
  { name: 'senders', type: 'Record<string, PeerSender>', required: true, description: 'Map of sender id to sender metadata (name, avatar, presence, role).' },
  { name: 'currentUserId', type: 'string', required: true, description: 'ID of the viewer. Own messages right-align with primary-colored bubbles.' },
  { name: 'onSend', type: '(text: string, replyTo?: string) => void | Promise<void>', description: 'Called when the user submits the composer. Append the message to your state.' },
  { name: 'onReact', type: '(messageId: string, emoji: string) => void | Promise<void>', description: 'Called when a reaction is added or toggled.' },
  { name: 'onEdit', type: '(messageId: string, newText: string) => void | Promise<void>', description: 'Called when an own message is edited. Set editedAt on your state.' },
  { name: 'onDelete', type: '(messageId: string) => void | Promise<void>', description: 'Called when an own message is deleted. Set deletedAt for soft-delete.' },
  { name: 'onAttach', type: '(files: File[]) => void | Promise<void>', description: 'Called when files pass MIME sniffing. Upload them and append attachments to the next message.' },
  { name: 'height', type: 'number | string', default: '520', description: 'Height of the thread container.' },
  { name: 'placeholder', type: 'string', default: "'Type a message…'", description: 'Composer placeholder text.' },
  { name: 'showTimeSeparators', type: 'boolean', default: 'true', description: 'Render "Today" / "Yesterday" / date separator pills between day boundaries.' },
  { name: 'groupConsecutive', type: 'boolean', default: 'true', description: 'Collapse the avatar + name header on consecutive messages from the same sender within 5 minutes.' },
  { name: 'emojiPickerOptions', type: 'string[]', default: "['👍','❤️','😂','🎉','😢','👀']", description: 'Emoji shown in the reaction picker.' },
  { name: 'className', type: 'string', description: 'Extra class names on the root.' },
  { name: 'style', type: 'CSSProperties', description: 'Inline styles on the root.' },
];

const PEER_MESSAGE_PROPS = [
  { name: 'id', type: 'string', required: true, description: 'Unique message id.' },
  { name: 'senderId', type: 'string', required: true, description: 'Must match a key in the senders map.' },
  { name: 'text', type: 'string', description: 'Message body. Sanitized before render.' },
  { name: 'attachments', type: 'PeerAttachment[]', description: 'Inline media: image, audio, video, or file.' },
  { name: 'reactions', type: 'PeerReaction[]', description: 'Array of { emoji, by: userId[] }. Count is derived from by.length.' },
  { name: 'replyTo', type: 'string', description: 'ID of a message this message replies to. One level of threading is rendered.' },
  { name: 'timestamp', type: 'Date | string', required: true, description: 'Sent time. Drives time + day grouping.' },
  { name: 'editedAt', type: 'Date | string', description: 'When set on a non-deleted message, "(edited)" is shown in the header.' },
  { name: 'deletedAt', type: 'Date | string', description: 'When set, the bubble renders "Message deleted" and hides reactions + actions.' },
  { name: 'delivery', type: "'sending' | 'sent' | 'delivered' | 'read' | 'failed'", description: 'Only rendered on own messages. Drives the trailing checkmark / dot / "!" icon.' },
];

// ── Page ─────────────────────────────────────────────────────────────────────

export function MessageThreadPage({ theme }: { theme: ThemeTokens }) {
  // ── Section 1 state ────────────────────────────────────────────────────────
  const [twoMessages, setTwoMessages] = useState<PeerMessage[]>(TWO_PERSON_INITIAL);

  const twoSend = useCallback((text: string, replyTo?: string) => {
    setTwoMessages((prev) => [
      ...prev,
      { id: makeId(), senderId: 'alice', text, timestamp: new Date(), delivery: 'sent', replyTo },
    ]);
  }, []);

  const twoReact = useCallback((messageId: string, emoji: string) => {
    setTwoMessages((prev) =>
      prev.map((m) =>
        m.id === messageId ? { ...m, reactions: toggleReaction(m.reactions, emoji, 'alice') } : m,
      ),
    );
  }, []);

  const twoEdit = useCallback((messageId: string, newText: string) => {
    setTwoMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, text: newText, editedAt: new Date() } : m)),
    );
  }, []);

  const twoDelete = useCallback((messageId: string) => {
    setTwoMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, deletedAt: new Date(), text: '' } : m)),
    );
  }, []);

  // ── Section 2 state ────────────────────────────────────────────────────────
  const [groupMessages, setGroupMessages] = useState<PeerMessage[]>(GROUP_INITIAL);

  const groupSend = useCallback((text: string, replyTo?: string) => {
    setGroupMessages((prev) => [
      ...prev,
      { id: makeId(), senderId: 'me', text, timestamp: new Date(), delivery: 'sent', replyTo },
    ]);
  }, []);

  const groupReact = useCallback((messageId: string, emoji: string) => {
    setGroupMessages((prev) =>
      prev.map((m) =>
        m.id === messageId ? { ...m, reactions: toggleReaction(m.reactions, emoji, 'me') } : m,
      ),
    );
  }, []);

  const groupEdit = useCallback((messageId: string, newText: string) => {
    setGroupMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, text: newText, editedAt: new Date() } : m)),
    );
  }, []);

  const groupDelete = useCallback((messageId: string) => {
    setGroupMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, deletedAt: new Date(), text: '' } : m)),
    );
  }, []);

  const groupAttach = useCallback((files: File[]) => {
    setGroupMessages((prev) => [
      ...prev,
      {
        id: makeId(),
        senderId: 'me',
        text: '',
        timestamp: new Date(),
        delivery: 'sent',
        attachments: files.map((f) => ({
          id: makeId(),
          kind: (f.type.startsWith('image/')
            ? 'image'
            : f.type.startsWith('audio/')
              ? 'audio'
              : f.type.startsWith('video/')
                ? 'video'
                : 'file') as 'image' | 'audio' | 'video' | 'file',
          name: f.name,
          url: URL.createObjectURL(f),
          mimeType: f.type,
          size: f.size,
        })),
      },
    ]);
  }, []);

  // ── Section 3 state ────────────────────────────────────────────────────────
  const [showcaseMessages, setShowcaseMessages] = useState<PeerMessage[]>(SHOWCASE_INITIAL);

  const showcaseSend = useCallback((text: string, replyTo?: string) => {
    setShowcaseMessages((prev) => [
      ...prev,
      { id: makeId(), senderId: 'me', text, timestamp: new Date(), delivery: 'sent', replyTo },
    ]);
  }, []);

  // ── Layout ─────────────────────────────────────────────────────────────────

  const dividerStyle = { height: '1px', backgroundColor: theme.border, margin: '48px 0', border: 'none' };

  const versionBadgeStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '3px 10px',
    borderRadius: '9999px',
    fontSize: '11px',
    fontWeight: 600,
    backgroundColor: `${theme.primary}20`,
    color: theme.primary,
    border: `1px solid ${theme.primary}40`,
    letterSpacing: '0.02em',
    marginBottom: '14px',
  } as const;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 32px 80px' }}>
      {/* WCAG badges */}
      <div style={{ marginBottom: '20px' }}>
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
      <span style={versionBadgeStyle}>New in v3.18.2 — Preview, stable in v3.19</span>
      <h1
        style={{
          fontSize: '2.25rem',
          fontWeight: 800,
          color: theme.text,
          margin: '0 0 12px',
          letterSpacing: '-0.03em',
          lineHeight: 1.15,
        }}
      >
        TkxMessageThread
      </h1>
      <p
        style={{
          fontSize: '15px',
          color: theme.textMuted,
          lineHeight: '1.75',
          maxWidth: '640px',
          margin: '0 0 8px',
        }}
      >
        A peer-to-peer chat primitive — multi-sender threads with avatars, reactions, replies,
        edits, soft delete, delivery states, and four kinds of media attachments. Sanitizes all
        text and sniffs every uploaded file's MIME type before accepting it.
      </p>
      <p
        style={{
          fontSize: '13px',
          color: theme.textMuted,
          lineHeight: '1.6',
          maxWidth: '640px',
          margin: '0 0 48px',
        }}
      >
        <strong style={{ color: theme.text }}>Not the same as TkxChat.</strong> TkxChat is a single
        user ↔ AI assistant UI. TkxMessageThread models a many-to-many human conversation. They
        intentionally do not share state or types.
      </p>

      {/* ── Section 1: 2-person chat ── */}
      <DemoSection
        title="2-person chat — Alice & Bob review a PR"
        description="Viewer is Alice. Try replying, reacting, editing your own messages. Notice the (edited) suffix on the last message and the time/day separators."
        theme={theme}
        code={`const [messages, setMessages] = useState<PeerMessage[]>(initial);

<TkxMessageThread
  messages={messages}
  senders={{
    alice: { id: 'alice', name: 'Alice Chen', avatar: '…', presence: 'online' },
    bob:   { id: 'bob',   name: 'Bob Martinez', avatar: '…', presence: 'online' },
  }}
  currentUserId="alice"
  onSend={(text, replyTo) => setMessages(prev => [...prev, {
    id: makeId(), senderId: 'alice', text, timestamp: new Date(),
    delivery: 'sent', replyTo,
  }])}
  onReact={(id, emoji) => setMessages(prev => prev.map(m =>
    m.id === id ? { ...m, reactions: toggleReaction(m.reactions, emoji, 'alice') } : m
  ))}
  onEdit={(id, newText) => setMessages(prev => prev.map(m =>
    m.id === id ? { ...m, text: newText, editedAt: new Date() } : m
  ))}
  onDelete={(id) => setMessages(prev => prev.map(m =>
    m.id === id ? { ...m, deletedAt: new Date(), text: '' } : m
  ))}
/>`}
      >
        <div style={{ width: '100%' }}>
          <TkxMessageThread
            messages={twoMessages}
            senders={TWO_PERSON_SENDERS}
            currentUserId="alice"
            onSend={twoSend}
            onReact={twoReact}
            onEdit={twoEdit}
            onDelete={twoDelete}
            height={480}
            placeholder="Reply to Bob…"
          />
        </div>
      </DemoSection>

      {/* ── Section 2: Group chat ── */}
      <DemoSection
        title="Group chat — incident response in #ops"
        description="Four engineers triaging a checkout-service outage. Demonstrates reply threading, a file attachment, an edited summary, a soft-deleted message, and a failed-delivery state on the last own message. Click the paperclip to attach a file — it is sniffed before being accepted."
        theme={theme}
        code={`<TkxMessageThread
  messages={groupMessages}
  senders={{
    me:     { id: 'me',     name: 'You',          avatar: '…' },
    priya:  { id: 'priya',  name: 'Priya Patel',  avatar: '…', role: 'SRE' },
    marcus: { id: 'marcus', name: 'Marcus Webb',  avatar: '…', role: 'Backend' },
    jin:    { id: 'jin',    name: 'Jin Park',     avatar: '…', role: 'Frontend' },
  }}
  currentUserId="me"
  onSend={handleSend}
  onReact={handleReact}
  onEdit={handleEdit}
  onDelete={handleDelete}
  onAttach={(files) => uploadAndAppend(files)}
  height={560}
/>`}
      >
        <div style={{ width: '100%' }}>
          <TkxMessageThread
            messages={groupMessages}
            senders={GROUP_SENDERS}
            currentUserId="me"
            onSend={groupSend}
            onReact={groupReact}
            onEdit={groupEdit}
            onDelete={groupDelete}
            onAttach={groupAttach}
            height={560}
            placeholder="Message #ops-incident…"
          />
        </div>
      </DemoSection>

      {/* ── Section 3: Attachment showcase ── */}
      <DemoSection
        title="Attachment showcase — image, audio, video, file"
        description="The four supported attachment kinds, rendered inline. Images open full-size on click, audio + video use native browser players, and generic files render as downloadable cards."
        theme={theme}
        code={`const message: PeerMessage = {
  id: 's1',
  senderId: 'demo',
  text: 'Inline image:',
  timestamp: new Date(),
  attachments: [{
    id: 'a1',
    kind: 'image',
    name: 'photo.jpg',
    url: 'https://example.com/photo.jpg',
    mimeType: 'image/jpeg',
  }],
};

// Other kinds: 'audio' (HTML5 audio), 'video' (HTML5 video),
// 'file' (download card with size + mime label).`}
      >
        <div style={{ width: '100%' }}>
          <TkxMessageThread
            messages={showcaseMessages}
            senders={SHOWCASE_SENDERS}
            currentUserId="me"
            onSend={showcaseSend}
            height={500}
            placeholder="Type to add a message…"
          />
        </div>
      </DemoSection>

      <hr style={dividerStyle} />

      {/* Prop reference */}
      <h2
        style={{
          fontSize: '1.25rem',
          fontWeight: 700,
          color: theme.text,
          margin: '0 0 8px',
          letterSpacing: '-0.02em',
        }}
      >
        TkxMessageThread Props
      </h2>
      <div style={{ marginBottom: '40px' }}>
        <PropTable props={THREAD_PROPS} />
      </div>

      <h2
        style={{
          fontSize: '1.25rem',
          fontWeight: 700,
          color: theme.text,
          margin: '0 0 8px',
          letterSpacing: '-0.02em',
        }}
      >
        PeerMessage Shape
      </h2>
      <div style={{ marginBottom: '40px' }}>
        <PropTable props={PEER_MESSAGE_PROPS} />
      </div>

      <hr style={dividerStyle} />

      {/* Minimal copy-paste example */}
      <h2
        style={{
          fontSize: '1.25rem',
          fontWeight: 700,
          color: theme.text,
          margin: '0 0 12px',
          letterSpacing: '-0.02em',
        }}
      >
        Minimal example
      </h2>
      <p
        style={{
          fontSize: '14px',
          color: theme.textMuted,
          lineHeight: '1.7',
          margin: '0 0 16px',
          maxWidth: '640px',
        }}
      >
        The smallest working integration. Track messages in state; the component handles all
        rendering, grouping, day separators, scroll-to-bottom, and sanitization.
      </p>
      <DemoSection
        title="Copy-paste starter"
        description="Drop into a fresh React file. Replace the avatars + initial messages with your own data source."
        theme={theme}
        code={`import { useState } from 'react';
import { TkxMessageThread } from 'tekivex-ui';
import type { PeerMessage, PeerSender } from 'tekivex-ui';

const senders: Record<string, PeerSender> = {
  me:   { id: 'me',   name: 'You' },
  them: { id: 'them', name: 'Friend' },
};

export function Chat() {
  const [messages, setMessages] = useState<PeerMessage[]>([
    { id: '1', senderId: 'them', text: 'Hello!', timestamp: new Date() },
  ]);

  return (
    <TkxMessageThread
      messages={messages}
      senders={senders}
      currentUserId="me"
      onSend={(text) => setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        senderId: 'me',
        text,
        timestamp: new Date(),
        delivery: 'sent',
      }])}
    />
  );
}`}
      >
        <p style={{ fontSize: '13px', color: theme.textMuted, margin: 0 }}>
          Click <strong>View Code</strong> to see the snippet. The two interactive demos above are
          built on the same pattern.
        </p>
      </DemoSection>
    </div>
  );
}
