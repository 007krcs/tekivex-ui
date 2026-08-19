import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, within, act } from '@testing-library/react';
import { TkxMessageThread } from '../src/components/TkxMessageThread';
import { TkxPeerChat, TkxMessageThread as TkxMessageThreadFromRoot } from '../index';
import { ThemeProvider, quantumDark } from '../src/themes';
import type { PeerMessage, PeerSender } from '../src/components/TkxMessageThread';

// Mock the security module for the magic-byte test
vi.mock('../src/engine/security', async () => {
  const actual = await vi.importActual<typeof import('../src/engine/security')>('../src/engine/security');
  return {
    ...actual,
    sniffMimeType: vi.fn(async (file: File) => {
      // Default behavior: trust file.type; tests override per-call
      if (file.name === 'evil.png') return null; // mismatch / unknown
      return file.type || 'application/octet-stream';
    }),
  };
});

function Wrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={quantumDark}>{children}</ThemeProvider>;
}

const senders: Record<string, PeerSender> = {
  me: { id: 'me', name: 'Me' },
  alice: { id: 'alice', name: 'Alice', role: 'Clinician' },
  priya: { id: 'priya', name: 'Priya' },
  marcus: { id: 'marcus', name: 'Marcus' },
  jin: { id: 'jin', name: 'Jin' },
};

function ts(offsetMin: number): Date {
  return new Date(Date.now() - offsetMin * 60_000);
}

describe('TkxMessageThread', () => {
  beforeEach(() => {
    // jsdom alert/confirm shims
    vi.spyOn(window, 'confirm').mockReturnValue(true);
  });

  it('renders empty thread without crashing', () => {
    render(
      <TkxMessageThread messages={[]} senders={senders} currentUserId="me" />,
      { wrapper: Wrapper },
    );
    expect(screen.getByRole('log')).toBeInTheDocument();
  });

  it('renders a single message with sender name + text', () => {
    const messages: PeerMessage[] = [
      { id: '1', senderId: 'alice', text: 'hello world', timestamp: ts(1) },
    ];
    render(
      <TkxMessageThread messages={messages} senders={senders} currentUserId="me" />,
      { wrapper: Wrapper },
    );
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('hello world')).toBeInTheDocument();
  });

  it('sanitizes message text (escapes script tag)', () => {
    const messages: PeerMessage[] = [
      { id: '1', senderId: 'alice', text: '<script>alert(1)</script>', timestamp: ts(1) },
    ];
    const { container } = render(
      <TkxMessageThread messages={messages} senders={senders} currentUserId="me" />,
      { wrapper: Wrapper },
    );
    // The real security property: the payload never becomes an element.
    expect(container.querySelector('script')).toBeNull();
    // It renders as inert visible text — literally, not as "&lt;script&gt;".
    expect(container.textContent).toContain('<script>');
    expect(container.textContent).not.toContain('&lt;');
  });

  it('groups consecutive messages from same sender within 5 min', () => {
    const messages: PeerMessage[] = [
      { id: '1', senderId: 'alice', text: 'first', timestamp: ts(2) },
      { id: '2', senderId: 'alice', text: 'second', timestamp: ts(1) },
    ];
    render(
      <TkxMessageThread messages={messages} senders={senders} currentUserId="me" />,
      { wrapper: Wrapper },
    );
    const articles = screen.getAllByRole('article');
    expect(articles).toHaveLength(2);
    expect(articles[0].getAttribute('data-grouped')).toBe('false');
    expect(articles[1].getAttribute('data-grouped')).toBe('true');
  });

  it('does NOT group when 5+ minutes apart', () => {
    const messages: PeerMessage[] = [
      { id: '1', senderId: 'alice', text: 'first', timestamp: ts(10) },
      { id: '2', senderId: 'alice', text: 'second', timestamp: ts(1) },
    ];
    render(
      <TkxMessageThread messages={messages} senders={senders} currentUserId="me" />,
      { wrapper: Wrapper },
    );
    const articles = screen.getAllByRole('article');
    expect(articles[0].getAttribute('data-grouped')).toBe('false');
    expect(articles[1].getAttribute('data-grouped')).toBe('false');
  });

  it('renders own messages aligned right (data attr)', () => {
    const messages: PeerMessage[] = [
      { id: '1', senderId: 'me', text: 'mine', timestamp: ts(1) },
    ];
    render(
      <TkxMessageThread messages={messages} senders={senders} currentUserId="me" />,
      { wrapper: Wrapper },
    );
    const article = screen.getByRole('article');
    expect(article.getAttribute('data-own')).toBe('true');
  });

  it('renders peer messages aligned left', () => {
    const messages: PeerMessage[] = [
      { id: '1', senderId: 'alice', text: 'theirs', timestamp: ts(1) },
    ];
    render(
      <TkxMessageThread messages={messages} senders={senders} currentUserId="me" />,
      { wrapper: Wrapper },
    );
    const article = screen.getByRole('article');
    expect(article.getAttribute('data-own')).toBe('false');
  });

  it('renders image attachment as <img> with loading="lazy"', () => {
    const messages: PeerMessage[] = [
      {
        id: '1',
        senderId: 'alice',
        timestamp: ts(1),
        attachments: [
          { id: 'a1', kind: 'image', name: 'pic.png', url: 'https://x/pic.png', mimeType: 'image/png' },
        ],
      },
    ];
    const { container } = render(
      <TkxMessageThread messages={messages} senders={senders} currentUserId="me" />,
      { wrapper: Wrapper },
    );
    const imgs = container.querySelectorAll('img[loading="lazy"]');
    expect(imgs.length).toBeGreaterThanOrEqual(1);
    const att = container.querySelector('img[src="https://x/pic.png"]');
    expect(att).not.toBeNull();
    expect(att?.getAttribute('loading')).toBe('lazy');
  });

  it('renders file attachment with size + mime', () => {
    const messages: PeerMessage[] = [
      {
        id: '1',
        senderId: 'alice',
        timestamp: ts(1),
        attachments: [
          {
            id: 'a1',
            kind: 'file',
            name: 'doc.pdf',
            url: 'https://x/doc.pdf',
            mimeType: 'application/pdf',
            size: 2048,
          },
        ],
      },
    ];
    render(
      <TkxMessageThread messages={messages} senders={senders} currentUserId="me" />,
      { wrapper: Wrapper },
    );
    expect(screen.getByText('doc.pdf')).toBeInTheDocument();
    expect(screen.getByText(/application\/pdf/)).toBeInTheDocument();
    expect(screen.getByText(/2\.0 KB/)).toBeInTheDocument();
  });

  it('renders audio with native <audio controls>', () => {
    const messages: PeerMessage[] = [
      {
        id: '1',
        senderId: 'alice',
        timestamp: ts(1),
        attachments: [
          { id: 'a1', kind: 'audio', name: 'clip.mp3', url: 'https://x/clip.mp3', mimeType: 'audio/mpeg' },
        ],
      },
    ];
    const { container } = render(
      <TkxMessageThread messages={messages} senders={senders} currentUserId="me" />,
      { wrapper: Wrapper },
    );
    const audio = container.querySelector('audio');
    expect(audio).not.toBeNull();
    expect(audio?.hasAttribute('controls')).toBe(true);
  });

  it('reactions chip shows correct count', () => {
    const messages: PeerMessage[] = [
      {
        id: '1',
        senderId: 'alice',
        text: 'hi',
        timestamp: ts(1),
        reactions: [{ emoji: '👍', by: ['me', 'alice'] }],
      },
    ];
    render(
      <TkxMessageThread messages={messages} senders={senders} currentUserId="me" />,
      { wrapper: Wrapper },
    );
    expect(screen.getByText(/👍\s*2/)).toBeInTheDocument();
  });

  it('clicking a reaction chip calls onReact with the right emoji', () => {
    const onReact = vi.fn();
    const messages: PeerMessage[] = [
      {
        id: '1',
        senderId: 'alice',
        text: 'hi',
        timestamp: ts(1),
        reactions: [{ emoji: '❤️', by: ['alice'] }],
      },
    ];
    render(
      <TkxMessageThread messages={messages} senders={senders} currentUserId="me" onReact={onReact} />,
      { wrapper: Wrapper },
    );
    fireEvent.click(screen.getByLabelText(/React ❤️/));
    expect(onReact).toHaveBeenCalledWith('1', '❤️');
  });

  it('reply preview shows original sender + snippet when replyTo is set', () => {
    const messages: PeerMessage[] = [
      { id: '1', senderId: 'alice', text: 'original here', timestamp: ts(5) },
      { id: '2', senderId: 'me', text: 'replying', timestamp: ts(1), replyTo: '1' },
    ];
    render(
      <TkxMessageThread messages={messages} senders={senders} currentUserId="me" />,
      { wrapper: Wrapper },
    );
    // Reply preview block contains the original sender's name + text snippet.
    // "Alice" appears in both the original header and the reply preview,
    // and "original here" appears in both the original bubble and the preview.
    const previews = screen.getAllByText(/Alice/);
    expect(previews.length).toBeGreaterThan(0);
    const originalMatches = screen.getAllByText(/original here/);
    expect(originalMatches.length).toBeGreaterThanOrEqual(2);
  });

  it('editedAt renders "(edited)" suffix', () => {
    const messages: PeerMessage[] = [
      { id: '1', senderId: 'alice', text: 'old', timestamp: ts(2), editedAt: ts(1) },
    ];
    render(
      <TkxMessageThread messages={messages} senders={senders} currentUserId="me" />,
      { wrapper: Wrapper },
    );
    expect(screen.getByText('(edited)')).toBeInTheDocument();
  });

  it('deletedAt renders "Message deleted" placeholder + hides actions', () => {
    const messages: PeerMessage[] = [
      { id: '1', senderId: 'me', text: 'oops', timestamp: ts(2), deletedAt: ts(1) },
    ];
    render(
      <TkxMessageThread messages={messages} senders={senders} currentUserId="me" onDelete={() => {}} />,
      { wrapper: Wrapper },
    );
    expect(screen.getByText('Message deleted')).toBeInTheDocument();
    expect(screen.queryByLabelText('Delete message')).toBeNull();
    expect(screen.queryByLabelText('Reply to message')).toBeNull();
  });

  it('time separator renders "Today" when message is from today', () => {
    const messages: PeerMessage[] = [
      { id: '1', senderId: 'alice', text: 'hi today', timestamp: new Date() },
    ];
    render(
      <TkxMessageThread messages={messages} senders={senders} currentUserId="me" />,
      { wrapper: Wrapper },
    );
    expect(screen.getByText('Today')).toBeInTheDocument();
  });

  it('composer Enter key calls onSend with sanitized text', () => {
    const onSend = vi.fn();
    render(
      <TkxMessageThread messages={[]} senders={senders} currentUserId="me" onSend={onSend} />,
      { wrapper: Wrapper },
    );
    const input = screen.getByLabelText('Message input') as HTMLTextAreaElement;
    fireEvent.change(input, { target: { value: '<b>hi</b>' } });
    fireEvent.keyDown(input, { key: 'Enter', shiftKey: false });
    expect(onSend).toHaveBeenCalledTimes(1);
    // The composer hands back what the user actually typed; it is rendered as
    // text (never markup), so entity-encoding it here would corrupt the
    // message body with visible "&lt;b&gt;" for every recipient.
    const [text] = onSend.mock.calls[0];
    expect(text).toBe('<b>hi</b>');
  });

  it('composer Shift+Enter does NOT send', () => {
    const onSend = vi.fn();
    render(
      <TkxMessageThread messages={[]} senders={senders} currentUserId="me" onSend={onSend} />,
      { wrapper: Wrapper },
    );
    const input = screen.getByLabelText('Message input') as HTMLTextAreaElement;
    fireEvent.change(input, { target: { value: 'line one' } });
    fireEvent.keyDown(input, { key: 'Enter', shiftKey: true });
    expect(onSend).not.toHaveBeenCalled();
  });

  it('edit own message replaces bubble with editable textarea', () => {
    const onEdit = vi.fn();
    const messages: PeerMessage[] = [
      { id: '1', senderId: 'me', text: 'mine', timestamp: ts(1) },
    ];
    render(
      <TkxMessageThread messages={messages} senders={senders} currentUserId="me" onEdit={onEdit} />,
      { wrapper: Wrapper },
    );
    fireEvent.click(screen.getByLabelText('Edit message'));
    expect(screen.getByLabelText('Edit message')).toBeInTheDocument(); // the textarea
    const editArea = screen.getByLabelText('Edit message') as HTMLTextAreaElement;
    expect(editArea.tagName.toLowerCase()).toBe('textarea');
  });

  it('magic-byte mismatch on attachment shows inline warning and skips bad file', async () => {
    const onAttach = vi.fn();
    render(
      <TkxMessageThread messages={[]} senders={senders} currentUserId="me" onAttach={onAttach} />,
      { wrapper: Wrapper },
    );
    const goodFile = new File(['good content'], 'good.png', { type: 'image/png' });
    const badFile = new File(['bad content'], 'evil.png', { type: 'image/png' });

    // The file input is hidden via sr-only; query by type
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input).not.toBeNull();

    await act(async () => {
      fireEvent.change(input, { target: { files: [goodFile, badFile] } });
    });

    expect(onAttach).toHaveBeenCalledTimes(1);
    const passedFiles: File[] = onAttach.mock.calls[0][0];
    expect(passedFiles.map((f) => f.name)).toEqual(['good.png']);
    expect(screen.getByRole('alert').textContent).toMatch(/evil\.png/);
  });

  it('cancel reply removes the reply preview chip', () => {
    const messages: PeerMessage[] = [
      { id: '1', senderId: 'alice', text: 'original', timestamp: ts(2) },
    ];
    render(
      <TkxMessageThread messages={messages} senders={senders} currentUserId="me" onSend={() => {}} />,
      { wrapper: Wrapper },
    );
    fireEvent.click(screen.getByLabelText('Reply to message'));
    expect(screen.getByText(/Replying to/)).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('Cancel reply'));
    expect(screen.queryByText(/Replying to/)).toBeNull();
  });
});

// ── v3.19: TkxPeerChat promotion + typing indicator ─────────────────────────

describe('TkxPeerChat (v3.19 rename)', () => {
  it('TkxPeerChat is the v3.19 name — same component, two exported names', () => {
    // Both names should resolve to the literal same function reference.
    expect(TkxPeerChat).toBe(TkxMessageThreadFromRoot);
    expect(TkxPeerChat).toBe(TkxMessageThread);
  });
});

// ── Virtualization (useVariableVirtualList integration) ─────────────────────

// Alternating senders → no grouping → one <article> per message. All within
// the same second → a single day separator, so rows = n + 1.
function makeMany(n: number): PeerMessage[] {
  const base = Date.now();
  return Array.from({ length: n }, (_, i) => ({
    id: `m${i}`,
    senderId: i % 2 === 0 ? 'alice' : 'me',
    text: `message ${i}`,
    timestamp: new Date(base - (n - i) * 1000),
  }));
}

describe('TkxMessageThread — virtualization', () => {
  it('short threads (≤ threshold) render EVERY message (non-virtualized path)', () => {
    render(
      <TkxMessageThread messages={makeMany(20)} senders={senders} currentUserId="me" />,
      { wrapper: Wrapper },
    );
    // 20 messages, all rendered — the exact current path, no windowing.
    expect(screen.getAllByRole('article')).toHaveLength(20);
    // No jump-to-latest pill on the non-virtualized path.
    expect(screen.queryByRole('button', { name: /jump to latest/i })).toBeNull();
  });

  it('long threads window the DOM to far fewer rows than the model', () => {
    render(
      <TkxMessageThread messages={makeMany(60)} senders={senders} currentUserId="me" />,
      { wrapper: Wrapper },
    );
    const articles = screen.getAllByRole('article');
    // Windowed: only the slice near the top of the (zero-height jsdom) viewport
    // is mounted, so far fewer than the 60 total.
    expect(articles.length).toBeGreaterThan(0);
    expect(articles.length).toBeLessThan(60);
    // The windowed container is a labelled region (NOT a live region — that would
    // announce old messages as they page into view; the sr-only mirror announces).
    expect(screen.getByRole('region', { name: 'Message thread' })).toBeInTheDocument();
  });

  it('keeps the windowed container present and does not crash on a large thread', () => {
    render(
      <TkxMessageThread messages={makeMany(80)} senders={senders} currentUserId="me" />,
      { wrapper: Wrapper },
    );
    const region = screen.getByRole('region', { name: 'Message thread' });
    expect(region).toBeInTheDocument();
    // overflow-anchor:none is set on the virtualized scroll container so the
    // browser's native anchoring doesn't fight the hook's manual anchoring.
    expect((region as HTMLElement).style.overflowAnchor).toBe('none');
    // A spacer div sized to the full estimated height backs the scrollbar.
    const spacer = region.querySelector('div[style*="height"]') as HTMLElement | null;
    expect(spacer).not.toBeNull();
    // The windowed container must NOT be a live region (no aria-live).
    expect(region.getAttribute('aria-live')).toBeNull();
  });

  it('announces the latest message via a decoupled live region even when it is windowed out', () => {
    render(
      <TkxMessageThread messages={makeMany(60)} senders={senders} currentUserId="me" />,
      { wrapper: Wrapper },
    );
    // The last message (message 59) is outside the top-anchored window, so it is
    // not in the article list — but the decoupled aria-live region mirrors it.
    const live = screen.getByText(/message 59/);
    expect(live).toBeInTheDocument();
    expect(live.closest('[aria-live="polite"]')).not.toBeNull();
  });

  it('surfaces a "N new" pill when a message arrives while scrolled away from the bottom', () => {
    const { rerender } = render(
      <TkxMessageThread messages={makeMany(60)} senders={senders} currentUserId="me" />,
      { wrapper: Wrapper },
    );
    // Not at the bottom (zero-height jsdom viewport ⇒ never pinned), no pill yet.
    expect(screen.queryByRole('button', { name: /jump to latest/i })).toBeNull();

    const next = [
      ...makeMany(60),
      { id: 'm60', senderId: 'alice', text: 'brand new', timestamp: new Date() } as PeerMessage,
    ];
    rerender(
      <TkxMessageThread messages={next} senders={senders} currentUserId="me" />,
    );
    const pill = screen.getByRole('button', { name: /jump to latest/i });
    expect(pill).toBeInTheDocument();
    expect(pill.textContent).toMatch(/1 new/);

    // Clicking it scrolls to the latest and clears the pill (no crash on the
    // stubbed jsdom scroll primitives).
    fireEvent.click(pill);
    expect(screen.queryByRole('button', { name: /jump to latest/i })).toBeNull();
  });
});

describe('TkxMessageThread / TkxPeerChat — typing indicator', () => {
  it('renders nothing when typingUserIds is empty', () => {
    render(
      <TkxMessageThread
        messages={[]}
        senders={senders}
        currentUserId="me"
        typingUserIds={[]}
      />,
      { wrapper: Wrapper },
    );
    expect(screen.queryByRole('status')).toBeNull();
    expect(screen.queryByText(/is typing/)).toBeNull();
    expect(screen.queryByText(/Several people are typing/)).toBeNull();
  });

  it('renders nothing when typingUserIds is undefined', () => {
    render(
      <TkxMessageThread messages={[]} senders={senders} currentUserId="me" />,
      { wrapper: Wrapper },
    );
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('renders "Priya is typing" with role=status / aria-live=polite for a single typer', () => {
    render(
      <TkxMessageThread
        messages={[]}
        senders={senders}
        currentUserId="me"
        typingUserIds={['priya']}
      />,
      { wrapper: Wrapper },
    );
    const status = screen.getByRole('status');
    expect(status).toBeInTheDocument();
    expect(status.getAttribute('aria-live')).toBe('polite');
    expect(status.textContent).toMatch(/Priya is typing/);
  });

  it('renders "Priya and Marcus are typing" for two typers', () => {
    render(
      <TkxMessageThread
        messages={[]}
        senders={senders}
        currentUserId="me"
        typingUserIds={['priya', 'marcus']}
      />,
      { wrapper: Wrapper },
    );
    const status = screen.getByRole('status');
    expect(status.textContent).toMatch(/Priya and Marcus are typing/);
  });

  it('renders "Several people are typing" for 3+ typers', () => {
    render(
      <TkxMessageThread
        messages={[]}
        senders={senders}
        currentUserId="me"
        typingUserIds={['priya', 'marcus', 'jin']}
      />,
      { wrapper: Wrapper },
    );
    const status = screen.getByRole('status');
    expect(status.textContent).toMatch(/Several people are typing/);
    expect(status.textContent).not.toMatch(/Priya/);
  });

  it('onTypingStart fires on the first keystroke', () => {
    const onTypingStart = vi.fn();
    render(
      <TkxMessageThread
        messages={[]}
        senders={senders}
        currentUserId="me"
        onTypingStart={onTypingStart}
      />,
      { wrapper: Wrapper },
    );
    const input = screen.getByLabelText('Message input') as HTMLTextAreaElement;
    fireEvent.change(input, { target: { value: 'h' } });
    expect(onTypingStart).toHaveBeenCalledTimes(1);
    // Subsequent keystrokes within the typing session should NOT re-fire it
    fireEvent.change(input, { target: { value: 'hi' } });
    fireEvent.change(input, { target: { value: 'hi ' } });
    expect(onTypingStart).toHaveBeenCalledTimes(1);
  });

  describe('with fake timers', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });
    afterEach(() => {
      vi.useRealTimers();
    });

    it('onTypingStop fires after 3 seconds of idle', () => {
      const onTypingStart = vi.fn();
      const onTypingStop = vi.fn();
      render(
        <TkxMessageThread
          messages={[]}
          senders={senders}
          currentUserId="me"
          onTypingStart={onTypingStart}
          onTypingStop={onTypingStop}
        />,
        { wrapper: Wrapper },
      );
      const input = screen.getByLabelText('Message input') as HTMLTextAreaElement;
      fireEvent.change(input, { target: { value: 'hi' } });
      expect(onTypingStart).toHaveBeenCalledTimes(1);
      expect(onTypingStop).not.toHaveBeenCalled();
      // Just under 3s — still idle, no stop yet
      act(() => {
        vi.advanceTimersByTime(2999);
      });
      expect(onTypingStop).not.toHaveBeenCalled();
      // Cross the threshold
      act(() => {
        vi.advanceTimersByTime(2);
      });
      expect(onTypingStop).toHaveBeenCalledTimes(1);
    });

    it('onTypingStop fires immediately on send (not after idle)', () => {
      const onSend = vi.fn();
      const onTypingStop = vi.fn();
      render(
        <TkxMessageThread
          messages={[]}
          senders={senders}
          currentUserId="me"
          onSend={onSend}
          onTypingStop={onTypingStop}
        />,
        { wrapper: Wrapper },
      );
      const input = screen.getByLabelText('Message input') as HTMLTextAreaElement;
      fireEvent.change(input, { target: { value: 'hello' } });
      // Send before the 3s idle timer fires
      fireEvent.keyDown(input, { key: 'Enter', shiftKey: false });
      expect(onSend).toHaveBeenCalledTimes(1);
      expect(onTypingStop).toHaveBeenCalledTimes(1);
      // Advancing past the idle threshold should NOT double-fire stop
      act(() => {
        vi.advanceTimersByTime(5000);
      });
      expect(onTypingStop).toHaveBeenCalledTimes(1);
    });

    it('onTypingStop fires on textarea blur', () => {
      const onTypingStop = vi.fn();
      render(
        <TkxMessageThread
          messages={[]}
          senders={senders}
          currentUserId="me"
          onTypingStop={onTypingStop}
        />,
        { wrapper: Wrapper },
      );
      const input = screen.getByLabelText('Message input') as HTMLTextAreaElement;
      fireEvent.change(input, { target: { value: 'hi' } });
      fireEvent.blur(input);
      expect(onTypingStop).toHaveBeenCalledTimes(1);
    });
  });
});
