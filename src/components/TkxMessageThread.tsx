'use client';

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  type KeyboardEvent,
  type ChangeEvent,
  type CSSProperties,
} from 'react';
import { useTheme } from '../themes';
import { tkx, cx } from '../engine/tkx';
import { sanitizeString, sniffMimeType } from '../engine/security';
import { useReducedMotion } from '../hooks';

// ── Types ─────────────────────────────────────────────────────────────────────

export type PeerPresence = 'online' | 'offline' | 'away' | 'unknown';
export type MessageDeliveryState = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

export interface PeerSender {
  id: string;
  name: string;
  avatar?: string;
  presence?: PeerPresence;
  role?: string;
}

export type AttachmentKind = 'image' | 'file' | 'audio' | 'video';

export interface PeerAttachment {
  id: string;
  kind: AttachmentKind;
  name: string;
  url: string;
  mimeType: string;
  size?: number;
  width?: number;
  height?: number;
  duration?: number;
  thumbnail?: string;
}

export interface PeerReaction {
  emoji: string;
  by: string[];
}

export interface PeerMessage {
  id: string;
  senderId: string;
  text?: string;
  attachments?: PeerAttachment[];
  reactions?: PeerReaction[];
  replyTo?: string;
  timestamp: Date | string;
  editedAt?: Date | string;
  deletedAt?: Date | string;
  delivery?: MessageDeliveryState;
}

export interface TkxMessageThreadProps {
  messages: PeerMessage[];
  senders: Record<string, PeerSender>;
  currentUserId: string;
  onSend?: (text: string, replyTo?: string) => void | Promise<void>;
  onReact?: (messageId: string, emoji: string) => void | Promise<void>;
  onEdit?: (messageId: string, newText: string) => void | Promise<void>;
  onDelete?: (messageId: string) => void | Promise<void>;
  onAttach?: (files: File[]) => void | Promise<void>;
  height?: string | number;
  placeholder?: string;
  showTimeSeparators?: boolean;
  groupConsecutive?: boolean;
  emojiPickerOptions?: string[];
  className?: string;
  style?: CSSProperties;

  /**
   * Sender IDs currently typing. The component renders a typing indicator
   * below the message list ("Priya is typing…" / "Priya and Marcus are
   * typing…" / "Several people are typing…"). Consumer drives this from a
   * presence/typing channel (Pusher, Socket.io, Ably, custom WebSocket).
   */
  typingUserIds?: string[];

  /**
   * Called when the local user starts typing in the composer. Note: the
   * v3.19 implementation is simpler than the originally-sketched 500ms
   * debounce — it fires once on the FIRST keystroke of a new typing
   * session, then is suppressed until the idle timer (`onTypingStop`)
   * fires. This avoids fan-out spam on the consumer's broadcast channel
   * without the extra timer state a debounce would need.
   */
  onTypingStart?: () => void;

  /**
   * Called when the local user has been idle for 3+ seconds since the
   * last keystroke. Also called on blur and on send.
   */
  onTypingStop?: () => void;
}

// ── Utilities ─────────────────────────────────────────────────────────────────

const DEFAULT_EMOJIS = ['👍', '❤️', '😂', '🎉', '😢', '👀'];
const GROUP_WINDOW_MS = 5 * 60 * 1000;

function toDate(input: Date | string): Date {
  return input instanceof Date ? input : new Date(input);
}

function formatTime(d: Date): string {
  return new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(d);
}

function formatDayLabel(d: Date): string {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  if (sameDay(d, today)) return 'Today';
  if (sameDay(d, yesterday)) return 'Yesterday';
  return d.toLocaleDateString();
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function initials(name: string): string {
  return sanitizeString(name)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? '')
    .join('');
}

// ── Delivery icon ─────────────────────────────────────────────────────────────

function DeliveryIcon({ state, color, danger }: { state: MessageDeliveryState; color: string; danger: string }) {
  const common = { width: 14, height: 14, viewBox: '0 0 16 16', fill: 'none', 'aria-hidden': true } as const;
  if (state === 'sending') {
    return <span aria-label="Sending" title="Sending" style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', backgroundColor: color, opacity: 0.6 }} />;
  }
  if (state === 'failed') {
    return <span aria-label="Failed" title="Failed" style={{ color: danger, fontWeight: 700, fontSize: 12 }}>!</span>;
  }
  if (state === 'sent') {
    return (
      <svg {...common} aria-label="Sent"><path d="M2 8l4 4 8-8" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" /></svg>
    );
  }
  // delivered + read both render double check; read is bolder
  const stroke = state === 'read' ? 2.2 : 1.4;
  return (
    <svg width={18} height={14} viewBox="0 0 22 16" fill="none" aria-label={state === 'read' ? 'Read' : 'Delivered'}>
      <path d="M2 8l4 4 8-8" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 12l4 4 8-8" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── Avatar ────────────────────────────────────────────────────────────────────

function Avatar({ sender, color, bg }: { sender: PeerSender; color: string; bg: string }) {
  if (sender.avatar) {
    return (
      <img
        src={sender.avatar}
        alt={sanitizeString(sender.name)}
        className={tkx('rounded-full')}
        style={{ width: 32, height: 32, objectFit: 'cover' }}
      />
    );
  }
  return (
    <div
      className={tkx('rounded-full flex items-center justify-center text-xs font-medium')}
      style={{ width: 32, height: 32, backgroundColor: bg, color }}
      aria-hidden="true"
    >
      {initials(sender.name) || '?'}
    </div>
  );
}

// ── Attachments ───────────────────────────────────────────────────────────────

function AttachmentBlock({ att, theme }: { att: PeerAttachment; theme: ReturnType<typeof useTheme> }) {
  const safeName = sanitizeString(att.name);
  if (att.kind === 'image') {
    return (
      <a href={att.url} target="_blank" rel="noopener noreferrer" className={tkx('block mt-2')}>
        <img
          src={att.url}
          alt={safeName}
          loading="lazy"
          className={tkx('rounded-md')}
          style={{ maxWidth: 260, maxHeight: 260, display: 'block' }}
        />
      </a>
    );
  }
  if (att.kind === 'audio') {
    return (
      <audio
        controls
        src={att.url}
        className={tkx('mt-2 block')}
        style={{ maxWidth: 260 }}
        aria-label={safeName}
      />
    );
  }
  if (att.kind === 'video') {
    return (
      <video
        controls
        src={att.url}
        poster={att.thumbnail}
        className={tkx('mt-2 rounded-md')}
        style={{ maxWidth: 260, display: 'block' }}
        aria-label={safeName}
      />
    );
  }
  // file
  return (
    <a
      href={att.url}
      download={att.name}
      target="_blank"
      rel="noopener noreferrer"
      className={tkx('flex items-center gap-2 mt-2 px-2.5 py-2 rounded-md text-xs no-underline')}
      style={{ backgroundColor: theme.surfaceAlt, color: theme.text, border: `1px solid ${theme.border}` }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
      </svg>
      <div className={tkx('flex flex-col min-w-0')}>
        <span className={tkx('truncate font-medium')} style={{ maxWidth: 200 }}>{safeName}</span>
        <span style={{ color: theme.textMuted, fontSize: 10 }}>
          {sanitizeString(att.mimeType)}{att.size != null ? ` · ${formatSize(att.size)}` : ''}
        </span>
      </div>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
        <path d="M12 3v12m0 0l-4-4m4 4l4-4M4 21h16" />
      </svg>
    </a>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function TkxMessageThread({
  messages,
  senders,
  currentUserId,
  onSend,
  onReact,
  onEdit,
  onDelete,
  onAttach,
  height = 520,
  placeholder = 'Type a message…',
  showTimeSeparators = true,
  groupConsecutive = true,
  emojiPickerOptions = DEFAULT_EMOJIS,
  className,
  style,
  typingUserIds,
  onTypingStart,
  onTypingStop,
}: TkxMessageThreadProps) {
  const theme = useTheme();
  const reducedMotion = useReducedMotion();
  const [draft, setDraft] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [reactPickerFor, setReactPickerFor] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState('');
  const [attachWarning, setAttachWarning] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // ── Typing state machine ──────────────────────────────────────────────────
  // Simpler than a debounce: fire onTypingStart on the FIRST keystroke of a
  // new typing session; every subsequent keystroke just resets the 3s idle
  // timer. When the timer fires (or blur/send happens) → onTypingStop,
  // and the session ends so the next keystroke fires onTypingStart again.
  const typingActiveRef = useRef(false);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopTyping = useCallback(() => {
    if (typingTimerRef.current != null) {
      clearTimeout(typingTimerRef.current);
      typingTimerRef.current = null;
    }
    if (typingActiveRef.current) {
      typingActiveRef.current = false;
      onTypingStop?.();
    }
  }, [onTypingStop]);

  const bumpTyping = useCallback(() => {
    if (!typingActiveRef.current) {
      typingActiveRef.current = true;
      onTypingStart?.();
    }
    if (typingTimerRef.current != null) {
      clearTimeout(typingTimerRef.current);
    }
    typingTimerRef.current = setTimeout(() => {
      typingTimerRef.current = null;
      if (typingActiveRef.current) {
        typingActiveRef.current = false;
        onTypingStop?.();
      }
    }, 3000);
  }, [onTypingStart, onTypingStop]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typingTimerRef.current != null) {
        clearTimeout(typingTimerRef.current);
        typingTimerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: reducedMotion ? 'auto' : 'smooth' });
  }, [messages.length, reducedMotion]);

  const messageById = useMemo(() => {
    const m: Record<string, PeerMessage> = {};
    for (const msg of messages) m[msg.id] = msg;
    return m;
  }, [messages]);

  const handleSend = useCallback(() => {
    const trimmed = draft.trim();
    if (!trimmed || !onSend) return;
    onSend(sanitizeString(trimmed), replyTo ?? undefined);
    setDraft('');
    setReplyTo(null);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    stopTyping();
  }, [draft, onSend, replyTo, stopTyping]);

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  const handleChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    const next = e.target.value;
    setDraft(next);
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = 'auto';
      const max = 24 * 6 + 16;
      ta.style.height = `${Math.min(ta.scrollHeight, max)}px`;
    }
    // If the user cleared the composer, treat it as "stopped typing" now
    // rather than waiting for the idle timer.
    if (next.length === 0) {
      stopTyping();
    } else {
      bumpTyping();
    }
  }, [bumpTyping, stopTyping]);

  const handleComposerBlur = useCallback(() => {
    stopTyping();
  }, [stopTyping]);

  const handleFilesChosen = useCallback(async (e: ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files ?? []);
    e.target.value = '';
    if (!picked.length || !onAttach) return;
    setAttachWarning(null);
    const accepted: File[] = [];
    const rejected: string[] = [];
    for (const file of picked) {
      try {
        const sniffed = await sniffMimeType(file);
        // sniff returned null OR major type mismatch → reject
        const declaredMajor = (file.type || '').split('/')[0];
        const sniffedMajor = sniffed ? sniffed.split('/')[0] : null;
        if (!sniffed || (declaredMajor && sniffedMajor && declaredMajor !== sniffedMajor)) {
          rejected.push(file.name);
          continue;
        }
        accepted.push(file);
      } catch {
        rejected.push(file.name);
      }
    }
    if (rejected.length) {
      setAttachWarning(
        `File type does not match its content — refusing to attach: ${rejected.map(sanitizeString).join(', ')}`
      );
    }
    if (accepted.length) await onAttach(accepted);
  }, [onAttach]);

  const handleReact = useCallback((messageId: string, emoji: string) => {
    setReactPickerFor(null);
    onReact?.(messageId, emoji);
  }, [onReact]);

  const handleDelete = useCallback((messageId: string) => {
    if (typeof window !== 'undefined' && !window.confirm('Delete this message?')) return;
    onDelete?.(messageId);
  }, [onDelete]);

  const startEdit = useCallback((msg: PeerMessage) => {
    setEditingId(msg.id);
    setEditDraft(msg.text ?? '');
  }, []);

  const submitEdit = useCallback((messageId: string) => {
    const t = editDraft.trim();
    if (!t) return;
    onEdit?.(messageId, sanitizeString(t));
    setEditingId(null);
    setEditDraft('');
  }, [editDraft, onEdit]);

  const heightVal = typeof height === 'number' ? `${height}px` : height;
  const replyPreview = replyTo ? messageById[replyTo] : null;
  const replyPreviewSender = replyPreview ? senders[replyPreview.senderId] : null;

  // ── Typing-indicator label ─────────────────────────────────────────────────
  // 1 typer → "Priya is typing…"
  // 2 typers → "Priya and Marcus are typing…"
  // 3+ typers → "Several people are typing…"
  // Unknown sender IDs fall back to "Unknown" rather than the raw id so the
  // user-visible string is never a leaking implementation detail.
  const typingLabel = useMemo(() => {
    if (!typingUserIds || typingUserIds.length === 0) return null;
    const names = typingUserIds.map((id) =>
      sanitizeString(senders[id]?.name ?? 'Unknown'),
    );
    if (names.length === 1) return `${names[0]} is typing`;
    if (names.length === 2) return `${names[0]} and ${names[1]} are typing`;
    return 'Several people are typing';
  }, [typingUserIds, senders]);

  // ── Render rows with grouping + day separators ──────────────────────────────
  const rows: Array<
    | { kind: 'sep'; key: string; label: string }
    | { kind: 'msg'; key: string; msg: PeerMessage; showHeader: boolean }
  > = [];
  let prev: PeerMessage | null = null;
  for (const msg of messages) {
    const d = toDate(msg.timestamp);
    if (showTimeSeparators) {
      const prevDay = prev ? toDate(prev.timestamp).toDateString() : null;
      if (prevDay !== d.toDateString()) {
        rows.push({ kind: 'sep', key: `sep-${msg.id}`, label: formatDayLabel(d) });
      }
    }
    const grouped =
      groupConsecutive &&
      prev != null &&
      prev.senderId === msg.senderId &&
      toDate(prev.timestamp).toDateString() === d.toDateString() &&
      d.getTime() - toDate(prev.timestamp).getTime() < GROUP_WINDOW_MS;
    rows.push({ kind: 'msg', key: msg.id, msg, showHeader: !grouped });
    prev = msg;
  }

  return (
    <div
      className={cx(tkx('flex flex-col overflow-hidden rounded-2xl'), className)}
      style={{
        height: heightVal,
        backgroundColor: theme.bg,
        border: `1px solid ${theme.border}`,
        ...style,
      }}
    >
      <div
        ref={listRef}
        role="log"
        aria-live="polite"
        aria-label="Message thread"
        className={tkx('flex-1 overflow-y-auto p-4')}
      >
        {rows.map((row) => {
          if (row.kind === 'sep') {
            return (
              <div key={row.key} className={tkx('flex items-center justify-center my-3')}>
                <span
                  className={tkx('text-[11px] px-2.5 py-0.5 rounded-full')}
                  style={{ color: theme.textMuted, backgroundColor: theme.surfaceAlt }}
                >
                  {row.label}
                </span>
              </div>
            );
          }
          const msg = row.msg;
          const sender = senders[msg.senderId] ?? { id: msg.senderId, name: 'Unknown' };
          const isOwn = msg.senderId === currentUserId;
          const ts = toDate(msg.timestamp);
          const isDeleted = !!msg.deletedAt;
          const replyOriginal = msg.replyTo ? messageById[msg.replyTo] : null;
          const replyOriginalSender = replyOriginal ? senders[replyOriginal.senderId] : null;
          const isEditing = editingId === msg.id;

          const bubbleStyle: CSSProperties = isOwn
            ? { backgroundColor: theme.primary, color: theme.bg }
            : { backgroundColor: theme.surface, color: theme.text, border: `1px solid ${theme.border}` };

          return (
            <div
              key={row.key}
              role="article"
              aria-label={`${sanitizeString(sender.name)}, ${formatTime(ts)}`}
              data-own={isOwn ? 'true' : 'false'}
              data-grouped={!row.showHeader ? 'true' : 'false'}
              className={tkx('flex gap-2 mb-1', isOwn ? 'flex-row-reverse' : 'flex-row')}
              style={{ marginTop: row.showHeader ? 12 : 2 }}
            >
              <div className={tkx('shrink-0')} style={{ width: 32 }}>
                {row.showHeader ? (
                  <Avatar sender={sender} color={theme.primary} bg={theme.surfaceAlt} />
                ) : null}
              </div>
              <div className={tkx('flex flex-col max-w-[75%]', isOwn ? 'items-end' : 'items-start')}>
                {row.showHeader && (
                  <div className={tkx('flex items-center gap-2 mb-0.5 text-xs')} style={{ color: theme.textMuted }}>
                    <span style={{ fontWeight: 600, color: theme.text }}>{sanitizeString(sender.name)}</span>
                    {sender.role && <span>· {sanitizeString(sender.role)}</span>}
                    <span>· {formatTime(ts)}</span>
                    {msg.editedAt && !isDeleted && <span>(edited)</span>}
                  </div>
                )}

                {/* Reply preview */}
                {replyOriginal && !isDeleted && (
                  <div
                    className={tkx('mb-1 px-2 py-1 rounded text-xs')}
                    style={{
                      backgroundColor: theme.surfaceAlt,
                      borderLeft: `3px solid ${theme.primary}`,
                      color: theme.textMuted,
                      maxWidth: '100%',
                    }}
                  >
                    <span style={{ fontWeight: 600 }}>
                      {sanitizeString(replyOriginalSender?.name ?? 'Unknown')}:{' '}
                    </span>
                    {sanitizeString((replyOriginal.text ?? '').slice(0, 80))}
                    {(replyOriginal.text ?? '').length > 80 ? '…' : ''}
                  </div>
                )}

                {/* Bubble */}
                <div
                  className={tkx('px-3 py-2 rounded-2xl text-sm leading-relaxed break-words whitespace-pre-wrap')}
                  style={bubbleStyle}
                >
                  {isDeleted ? (
                    <span style={{ fontStyle: 'italic', opacity: 0.7 }}>Message deleted</span>
                  ) : isEditing ? (
                    <div className={tkx('flex flex-col gap-1')}>
                      <textarea
                        value={editDraft}
                        onChange={(e) => setEditDraft(e.target.value)}
                        aria-label="Edit message"
                        className={tkx('text-sm leading-relaxed bg-transparent outline-none resize-none w-full')}
                        style={{ color: 'inherit', minHeight: 48, border: `1px solid ${theme.border}`, borderRadius: 8, padding: 4 }}
                      />
                      <div className={tkx('flex gap-2 justify-end')}>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className={tkx('text-xs px-2 py-1 rounded bg-transparent border-none cursor-pointer')}
                          style={{ color: 'inherit' }}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => submitEdit(msg.id)}
                          className={tkx('text-xs px-2 py-1 rounded border-none cursor-pointer')}
                          style={{ backgroundColor: theme.bg, color: theme.primary }}
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {msg.text && sanitizeString(msg.text)}
                      {msg.attachments?.map((a) => (
                        <AttachmentBlock key={a.id} att={a} theme={theme} />
                      ))}
                    </>
                  )}
                </div>

                {/* Reactions + delivery */}
                {!isDeleted && (
                  <div className={tkx('flex items-center gap-1 mt-1 flex-wrap', isOwn ? 'justify-end' : 'justify-start')}>
                    {msg.reactions?.map((r) => {
                      const mine = r.by.includes(currentUserId);
                      return (
                        <button
                          key={r.emoji}
                          type="button"
                          onClick={() => onReact?.(msg.id, r.emoji)}
                          aria-label={`React ${r.emoji} (${r.by.length})`}
                          aria-pressed={mine}
                          className={tkx('text-xs px-1.5 py-0.5 rounded-full cursor-pointer')}
                          style={{
                            backgroundColor: mine ? theme.primary + '33' : theme.surfaceAlt,
                            border: `1px solid ${mine ? theme.primary : theme.border}`,
                            color: theme.text,
                          }}
                        >
                          {r.emoji} {r.by.length}
                        </button>
                      );
                    })}
                    {isOwn && msg.delivery && (
                      <span className={tkx('inline-flex items-center ml-1')}>
                        <DeliveryIcon state={msg.delivery} color={theme.textMuted} danger={theme.danger} />
                      </span>
                    )}
                  </div>
                )}

                {/* Per-message actions */}
                {!isDeleted && !isEditing && (
                  <div
                    className={tkx('flex items-center gap-1 mt-1 text-xs')}
                    style={{ color: theme.textMuted, opacity: 0.85 }}
                  >
                    <button
                      type="button"
                      onClick={() => setReplyTo(msg.id)}
                      aria-label="Reply to message"
                      className={tkx('bg-transparent border-none cursor-pointer px-1 py-0.5 rounded')}
                      style={{ color: 'inherit' }}
                    >
                      Reply
                    </button>
                    <button
                      type="button"
                      onClick={() => setReactPickerFor((id) => (id === msg.id ? null : msg.id))}
                      aria-label="React to message"
                      aria-expanded={reactPickerFor === msg.id}
                      className={tkx('bg-transparent border-none cursor-pointer px-1 py-0.5 rounded')}
                      style={{ color: 'inherit' }}
                    >
                      React
                    </button>
                    {isOwn && onEdit && (
                      <button
                        type="button"
                        onClick={() => startEdit(msg)}
                        aria-label="Edit message"
                        className={tkx('bg-transparent border-none cursor-pointer px-1 py-0.5 rounded')}
                        style={{ color: 'inherit' }}
                      >
                        Edit
                      </button>
                    )}
                    {isOwn && onDelete && (
                      <button
                        type="button"
                        onClick={() => handleDelete(msg.id)}
                        aria-label="Delete message"
                        className={tkx('bg-transparent border-none cursor-pointer px-1 py-0.5 rounded')}
                        style={{ color: 'inherit' }}
                      >
                        Delete
                      </button>
                    )}
                    {reactPickerFor === msg.id && (
                      <div
                        role="menu"
                        aria-label="Pick a reaction"
                        className={tkx('flex items-center gap-1 ml-1 px-1.5 py-1 rounded-full')}
                        style={{ backgroundColor: theme.surface, border: `1px solid ${theme.border}` }}
                      >
                        {emojiPickerOptions.map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            role="menuitem"
                            onClick={() => handleReact(msg.id, emoji)}
                            aria-label={`React with ${emoji}`}
                            className={tkx('bg-transparent border-none cursor-pointer text-sm px-1')}
                            style={{ color: 'inherit' }}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Typing indicator (above composer, below message list) */}
      {typingLabel && (
        <div
          role="status"
          aria-live="polite"
          className={tkx('px-4 py-1 flex items-center gap-1')}
          style={{
            color: theme.textMuted,
            fontSize: 12,
            fontStyle: 'italic',
            borderTop: `1px solid ${theme.border}`,
            backgroundColor: theme.bg,
          }}
        >
          <span>{typingLabel}</span>
          {reducedMotion ? (
            <span aria-hidden="true">…</span>
          ) : (
            <span
              aria-hidden="true"
              className={tkx('inline-flex items-end gap-0.5')}
              style={{ marginLeft: 2 }}
            >
              <span
                style={{
                  width: 3,
                  height: 3,
                  borderRadius: '50%',
                  backgroundColor: 'currentColor',
                  animation: 'tkx-typing-dot 1.2s infinite ease-in-out',
                  animationDelay: '0s',
                  display: 'inline-block',
                }}
              />
              <span
                style={{
                  width: 3,
                  height: 3,
                  borderRadius: '50%',
                  backgroundColor: 'currentColor',
                  animation: 'tkx-typing-dot 1.2s infinite ease-in-out',
                  animationDelay: '0.15s',
                  display: 'inline-block',
                }}
              />
              <span
                style={{
                  width: 3,
                  height: 3,
                  borderRadius: '50%',
                  backgroundColor: 'currentColor',
                  animation: 'tkx-typing-dot 1.2s infinite ease-in-out',
                  animationDelay: '0.3s',
                  display: 'inline-block',
                }}
              />
              <style>{`@keyframes tkx-typing-dot { 0%, 60%, 100% { opacity: 0.25; transform: translateY(0); } 30% { opacity: 1; transform: translateY(-2px); } } @media (prefers-reduced-motion: reduce) { @keyframes tkx-typing-dot { 0%, 100% { opacity: 1; transform: none; } } }`}</style>
            </span>
          )}
        </div>
      )}

      {/* Composer */}
      <div
        className={tkx('flex flex-col gap-1 p-3')}
        style={{ borderTop: `1px solid ${theme.border}`, backgroundColor: theme.surface }}
      >
        {attachWarning && (
          <div
            role="alert"
            className={tkx('text-xs px-2 py-1 rounded')}
            style={{
              backgroundColor: theme.danger + '20',
              color: theme.danger,
              border: `1px solid ${theme.danger}`,
            }}
          >
            {attachWarning}
          </div>
        )}
        {replyPreview && (
          <div
            className={tkx('flex items-center gap-2 px-2 py-1 rounded text-xs')}
            style={{ backgroundColor: theme.surfaceAlt, color: theme.textMuted }}
          >
            <span className={tkx('truncate flex-1')}>
              Replying to{' '}
              <span style={{ fontWeight: 600, color: theme.text }}>
                {sanitizeString(replyPreviewSender?.name ?? 'Unknown')}
              </span>
              : {sanitizeString((replyPreview.text ?? '').slice(0, 80))}
            </span>
            <button
              type="button"
              onClick={() => setReplyTo(null)}
              aria-label="Cancel reply"
              className={tkx('bg-transparent border-none cursor-pointer')}
              style={{ color: 'inherit' }}
            >
              ×
            </button>
          </div>
        )}
        <div className={tkx('flex items-end gap-2')}>
          {onAttach && (
            <>
              <input
                ref={fileRef}
                type="file"
                multiple
                onChange={handleFilesChosen}
                className={tkx('sr-only')}
                tabIndex={-1}
                aria-hidden="true"
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                aria-label="Attach files"
                className={tkx('shrink-0 w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer border-none')}
                style={{ backgroundColor: theme.surfaceAlt, color: theme.text }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
                  <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                </svg>
              </button>
            </>
          )}
          <textarea
            ref={textareaRef}
            rows={1}
            value={draft}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onBlur={handleComposerBlur}
            placeholder={sanitizeString(placeholder)}
            aria-label="Message input"
            aria-multiline="true"
            className={tkx('flex-1 resize-none text-sm leading-6 bg-transparent outline-none py-1')}
            style={{ color: theme.text, caretColor: theme.primary, minHeight: 32, maxHeight: 24 * 6 + 16 }}
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!draft.trim()}
            aria-label="Send message"
            className={tkx(
              'shrink-0 w-9 h-9 rounded-xl flex items-center justify-center border-none',
              !draft.trim() ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer opacity-100',
            )}
            style={{ backgroundColor: theme.primary, color: theme.bg }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M2 14L14 8 2 2v4.5l8 1.5-8 1.5V14z" fill="currentColor" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Backend-dependent features ─────────────────────────────────────────────
// What this component CAN'T do on its own (consumer responsibilities):
//
//   - real-time message arrival — consumer pushes new messages via the `messages` prop
//   - delivery-state transitions — consumer updates `message.delivery` from server ACKs
//   - presence updates         — consumer updates `senders[].presence` from a presence service
//   - attachment upload progress — onAttach returns a Promise but no per-file
//                                  progress is surfaced; consumer's responsibility
//
// What v3.19 added — typing indicators are now consumer-wirable:
//   - `typingUserIds` (display)       — drive from your presence channel
//   - `onTypingStart` / `onTypingStop` — fire your own broadcast events
//
// Still explicitly out of scope:
//   - message search           — separate concern; pair with TkxInput + filter logic
//   - threading depth > 1      — only one level of replyTo is rendered; nested
//                                threads would need a real tree view
//   - end-to-end encryption    — this is a UI primitive
//
// As of v3.19 the public name is `TkxPeerChat` (this file's `TkxMessageThread`
// export is the same component re-exported under both names; the original
// name is preserved as a deprecated alias and will be removed in v3.20).
