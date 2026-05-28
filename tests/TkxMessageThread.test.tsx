import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within, act } from '@testing-library/react';
import { TkxMessageThread } from '../src/components/TkxMessageThread';
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
    // No actual <script> element should be present
    expect(container.querySelector('script')).toBeNull();
    // The escaped text should appear as content
    expect(container.textContent).toContain('&lt;script&gt;');
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
    const [text] = onSend.mock.calls[0];
    expect(text).not.toContain('<b>');
    expect(text).toContain('&lt;b&gt;');
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
