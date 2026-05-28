'use client';

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  type ReactNode,
  type KeyboardEvent,
  type ChangeEvent,
} from 'react';
import { useTheme } from '../themes';
import { tkx, cx } from '../engine/tkx';
import { sanitizeString } from '../engine/security';
import { useReducedMotion } from '../hooks';

// ── Types ─────────────────────────────────────────────────────────────────────

/**
 * SCOPE — TkxChat is an **LLM conversation primitive**, not a peer-to-peer
 * messenger. The role enum (`user | assistant | system`) is from the
 * OpenAI / Anthropic Chat Completions model. Content is string-only.
 * There are no attachments, reactions, threading, read receipts, presence,
 * or per-user identity beyond the 3-role distinction.
 *
 * If you need any of those — and especially if you're building consumer
 * peer-to-peer chat with media — use `TkxMessageThread` instead. It models
 * a `Record<senderId, PeerSender>` lookup, image/file/audio/video
 * attachments (with magic-byte verification), reactions, replyTo
 * threading, edit/delete actions, and delivery-state icons.
 *
 * The two components do not share types and are not interchangeable.
 */
export type MessageRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp?: Date;
  isStreaming?: boolean;
  error?: boolean;
}

/**
 * Props for the LLM-conversation chat surface. See the SCOPE block above
 * `MessageRole` if you're not sure this is the component you want.
 */
export interface TkxChatProps {
  messages: ChatMessage[];
  onSend?: (message: string) => void;
  isLoading?: boolean;
  placeholder?: string;
  maxLength?: number;
  showTimestamps?: boolean;
  avatarUser?: ReactNode;
  avatarAssistant?: ReactNode;
  height?: string | number;
  inputPosition?: 'bottom' | 'floating';
}

export interface TkxChatBubbleProps {
  message: ChatMessage;
  showTimestamp?: boolean;
  avatarUser?: ReactNode;
  avatarAssistant?: ReactNode;
}

// ── Animations (injected once) ────────────────────────────────────────────────

let _styleInjected = false;
function injectChatStyles() {
  if (_styleInjected || typeof document === 'undefined') return;
  _styleInjected = true;
  const style = document.createElement('style');
  style.textContent = `
    @keyframes tkx-blink { 0%,100% { opacity:1 } 50% { opacity:0 } }
    @keyframes tkx-bounce { 0%,100% { transform:translateY(0) } 50% { transform:translateY(-5px) } }
    .tkx-cursor::after { content:'▋'; display:inline-block; animation:tkx-blink 1s step-start infinite; margin-left:1px; }
    .tkx-dot1 { animation:tkx-bounce 1s ease-in-out infinite; }
    .tkx-dot2 { animation:tkx-bounce 1s ease-in-out 0.2s infinite; }
    .tkx-dot3 { animation:tkx-bounce 1s ease-in-out 0.4s infinite; }
  `;
  document.head.appendChild(style);
}

// ── Default Avatars ───────────────────────────────────────────────────────────

function DefaultUserAvatar() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <circle cx="14" cy="14" r="14" fill="currentColor" fillOpacity="0.15" />
      <circle cx="14" cy="11" r="4" fill="currentColor" />
      <path d="M6 24c0-4.418 3.582-8 8-8s8 3.582 8 8" fill="currentColor" />
    </svg>
  );
}

function DefaultAssistantAvatar() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <circle cx="14" cy="14" r="14" fill="currentColor" fillOpacity="0.15" />
      <path d="M14 5l2.2 6.5H23l-5.6 4 2.2 6.5L14 18l-5.6 4 2.2-6.5L5 11.5h6.8z" fill="currentColor" />
    </svg>
  );
}

// ── TkxThinkingIndicator ──────────────────────────────────────────────────────

export function TkxThinkingIndicator() {
  const theme = useTheme();
  return (
    <div
      className={tkx('flex items-center gap-1.5 px-4 py-3 rounded-2xl w-fit')}
      style={{ backgroundColor: theme.surface, border: `1px solid ${theme.border}` }}
      aria-label="Assistant is thinking"
    >
      <span
        className="tkx-dot1 inline-block w-2 h-2 rounded-full"
        style={{ backgroundColor: theme.textMuted }}
      />
      <span
        className="tkx-dot2 inline-block w-2 h-2 rounded-full"
        style={{ backgroundColor: theme.textMuted }}
      />
      <span
        className="tkx-dot3 inline-block w-2 h-2 rounded-full"
        style={{ backgroundColor: theme.textMuted }}
      />
    </div>
  );
}

// ── TkxChatBubble ─────────────────────────────────────────────────────────────

export function TkxChatBubble({ message, showTimestamp, avatarUser, avatarAssistant }: TkxChatBubbleProps) {
  const theme = useTheme();
  const reducedMotion = useReducedMotion();
  const { role, content, timestamp, isStreaming, error } = message;

  const safeContent = sanitizeString(content);

  const formattedTime = timestamp
    ? new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).format(timestamp)
    : null;

  if (role === 'system') {
    return (
      <div role="listitem" className={tkx('flex justify-center my-2')}>
        <p
          className={tkx('text-xs italic px-3 py-1 rounded-full')}
          style={{ color: theme.textMuted, backgroundColor: theme.surfaceAlt }}
        >
          {safeContent}
        </p>
      </div>
    );
  }

  const isUser = role === 'user';
  const avatar = isUser ? (avatarUser ?? <DefaultUserAvatar />) : (avatarAssistant ?? <DefaultAssistantAvatar />);

  const bubbleStyle: React.CSSProperties = isUser
    ? { backgroundColor: theme.primary, color: theme.bg }
    : {
        backgroundColor: theme.surface,
        color: theme.text,
        border: `1px solid ${error ? theme.danger : theme.border}`,
      };

  if (error) {
    bubbleStyle.borderColor = theme.danger;
    bubbleStyle.borderWidth = '2px';
  }

  return (
    <div
      role="listitem"
      className={tkx('flex gap-2 mb-4', isUser ? 'flex-row-reverse' : 'flex-row')}
    >
      <div
        className={tkx('shrink-0 w-8 h-8 rounded-full flex items-center justify-center overflow-hidden')}
        style={{ color: isUser ? theme.primary : theme.secondary }}
      >
        {avatar}
      </div>
      <div className={tkx('flex flex-col gap-1 max-w-[75%]', isUser ? 'items-end' : 'items-start')}>
        <div
          className={cx(
            tkx('px-4 py-2.5 rounded-2xl text-sm leading-relaxed break-words whitespace-pre-wrap'),
            isStreaming && !reducedMotion ? 'tkx-cursor' : '',
          )}
          style={bubbleStyle}
        >
          {safeContent}
          {error && (
            <span aria-label="Error" style={{ marginLeft: 6, color: theme.danger }}>⚠</span>
          )}
        </div>
        {showTimestamp && formattedTime && (
          <span className={tkx('text-[10px]')} style={{ color: theme.textMuted }}>
            {formattedTime}
          </span>
        )}
      </div>
    </div>
  );
}

// ── TkxChat ───────────────────────────────────────────────────────────────────

export function TkxChat({
  messages,
  onSend,
  isLoading = false,
  placeholder = 'Type a message…',
  maxLength,
  showTimestamps = false,
  avatarUser,
  avatarAssistant,
  height = 480,
  inputPosition = 'bottom',
}: TkxChatProps) {
  const theme = useTheme();
  const reducedMotion = useReducedMotion();
  const [draft, setDraft] = useState('');
  const listRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { injectChatStyles(); }, []);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: reducedMotion ? 'auto' : 'smooth' });
  }, [messages, isLoading, reducedMotion]);

  const handleSend = useCallback(() => {
    const trimmed = draft.trim();
    if (!trimmed || !onSend) return;
    onSend(trimmed);
    setDraft('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [draft, onSend]);

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  const handleChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    const val = maxLength ? e.target.value.slice(0, maxLength) : e.target.value;
    setDraft(val);
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = 'auto';
      const lineH = 24;
      const maxH = lineH * 4 + 24;
      ta.style.height = `${Math.min(ta.scrollHeight, maxH)}px`;
    }
  }, [maxLength]);

  const canSend = draft.trim().length > 0 && !isLoading;
  const heightVal = typeof height === 'number' ? `${height}px` : height;

  const isFloating = inputPosition === 'floating';

  const inputArea = (
    <div
      className={tkx('flex flex-col gap-1 p-3')}
      style={
        isFloating
          ? {
              position: 'absolute',
              bottom: 12,
              left: 12,
              right: 12,
              borderRadius: 16,
              backgroundColor: theme.surface,
              border: `1px solid ${theme.border}`,
              boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
            }
          : {
              borderTop: `1px solid ${theme.border}`,
              backgroundColor: theme.surface,
            }
      }
    >
      <div className={tkx('flex items-end gap-2')}>
        <textarea
          ref={textareaRef}
          rows={1}
          value={draft}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={sanitizeString(placeholder)}
          aria-label="Message input"
          aria-multiline="true"
          disabled={isLoading}
          className={tkx('flex-1 resize-none text-sm leading-6 bg-transparent outline-none py-1')}
          style={{
            color: theme.text,
            caretColor: theme.primary,
            minHeight: 32,
            maxHeight: 120,
          }}
        />
        <button
          onClick={handleSend}
          disabled={!canSend}
          aria-label="Send message"
          className={tkx(
            'shrink-0 w-9 h-9 rounded-xl flex items-center justify-center',
            !reducedMotion && 'transition-opacity duration-150',
            !canSend ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer opacity-100',
          )}
          style={{ backgroundColor: theme.primary, color: theme.bg }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M2 14L14 8 2 2v4.5l8 1.5-8 1.5V14z" fill="currentColor" />
          </svg>
        </button>
      </div>
      {maxLength && (
        <div className={tkx('text-right text-[10px]')} style={{ color: theme.textMuted }}>
          {draft.length}/{maxLength}
        </div>
      )}
    </div>
  );

  return (
    <div
      className={tkx('flex flex-col overflow-hidden rounded-2xl')}
      style={{
        height: heightVal,
        backgroundColor: theme.bg,
        border: `1px solid ${theme.border}`,
        position: 'relative',
      }}
    >
      <div
        ref={listRef}
        role="log"
        aria-live="polite"
        aria-label="Chat messages"
        className={tkx('flex-1 overflow-y-auto p-4')}
        style={{ paddingBottom: isFloating ? 80 : undefined }}
      >
        <div role="list">
          {messages.map((msg) => (
            <TkxChatBubble
              key={msg.id}
              message={msg}
              showTimestamp={showTimestamps}
              avatarUser={avatarUser}
              avatarAssistant={avatarAssistant}
            />
          ))}
          {isLoading && (
            <div role="listitem" className={tkx('flex gap-2 mb-4')}>
              <div className={tkx('w-8 h-8 shrink-0')} />
              <TkxThinkingIndicator />
            </div>
          )}
        </div>
      </div>
      {inputArea}
    </div>
  );
}