import { useState, useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import { useTheme } from '../themes';
import { cx, tkx } from '../engine/tkx';
import { sanitizeString } from '../engine/security';

export type AIRole = 'user' | 'assistant' | 'system';

export interface TkxAIChatBubbleProps {
  /** Who sent this message */
  role: AIRole;
  /** Message text (will be sanitized) or arbitrary ReactNode */
  content: string | ReactNode;
  /** Optional avatar URL or initials */
  avatar?: string;
  /** Optional display name */
  name?: string;
  /** ISO timestamp string */
  timestamp?: string;
  /** Animate text in character-by-character (streaming effect) */
  streaming?: boolean;
  /** AI confidence 0–100 — renders a mini confidence bar when provided */
  confidence?: number;
  /** Show copy-to-clipboard button */
  copyable?: boolean;
  className?: string;
  style?: CSSProperties;
}

function confidenceColor(v: number, primary: string) {
  if (v >= 80) return '#10b981';
  if (v >= 55) return primary;
  if (v >= 30) return '#f59e0b';
  return '#ef4444';
}

function Avatar({ src, name, size = 32 }: { src?: string; name?: string; size?: number }) {
  const theme = useTheme();
  const initials = name
    ? name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  if (src) {
    return (
      <img src={src} alt={name ?? 'avatar'} width={size} height={size}
        style={{ borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
    );
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: `${theme.primary}22`, border: `1px solid ${theme.primary}44`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.35, fontWeight: 700, color: theme.primary,
    }}>
      {initials}
    </div>
  );
}

export function TkxAIChatBubble({
  role,
  content,
  avatar,
  name,
  timestamp,
  streaming = false,
  confidence,
  copyable = false,
  className,
  style,
}: TkxAIChatBubbleProps) {
  const theme = useTheme();
  const isUser = role === 'user';
  const isSystem = role === 'system';

  // Streaming typewriter effect
  const fullText = typeof content === 'string' ? sanitizeString(content) : '';
  const [displayed, setDisplayed] = useState(streaming ? '' : fullText);
  const [copied, setCopied] = useState(false);
  const idxRef = useRef(0);

  useEffect(() => {
    if (!streaming || typeof content !== 'string') return;
    idxRef.current = 0;
    setDisplayed('');
    const interval = setInterval(() => {
      idxRef.current++;
      setDisplayed(fullText.slice(0, idxRef.current));
      if (idxRef.current >= fullText.length) clearInterval(interval);
    }, 18);
    return () => clearInterval(interval);
  }, [fullText, streaming, content]);

  const handleCopy = () => {
    navigator.clipboard?.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // System message style
  if (isSystem) {
    return (
      <div style={{
        display: 'flex', justifyContent: 'center', padding: '8px 0',
      }}>
        <div style={{
          padding: '6px 16px', borderRadius: 999, fontSize: 12,
          background: `${theme.border}`, color: theme.textMuted,
          fontStyle: 'italic',
        }}>
          {typeof content === 'string' ? sanitizeString(content) : content}
        </div>
      </div>
    );
  }

  const bubbleStyle: CSSProperties = {
    maxWidth: '75%',
    padding: '12px 16px',
    borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
    background: isUser
      ? `linear-gradient(135deg, ${theme.primary}, ${theme.primary}cc)`
      : `${theme.surface}`,
    border: isUser ? 'none' : `1px solid ${theme.border}`,
    color: isUser ? '#fff' : theme.text,
    fontSize: 14,
    lineHeight: 1.65,
    boxShadow: isUser
      ? `0 4px 16px -4px ${theme.primary}55`
      : `0 2px 8px -2px rgba(0,0,0,0.2)`,
    position: 'relative',
    wordBreak: 'break-word',
  };

  return (
    <div
      className={cx(tkx('flex gap-2'), className)}
      style={{
        flexDirection: isUser ? 'row-reverse' : 'row',
        alignItems: 'flex-end',
        ...style,
      }}
    >
      {/* Avatar */}
      <Avatar src={avatar} name={name ?? (isUser ? 'You' : 'AI')} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: isUser ? 'flex-end' : 'flex-start' }}>
        {/* Name + timestamp */}
        {(name || timestamp) && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', paddingInline: 4 }}>
            {name && <span style={{ fontSize: 11, fontWeight: 700, color: theme.textMuted }}>{name}</span>}
            {timestamp && <span style={{ fontSize: 10, color: theme.textMuted }}>{timestamp}</span>}
          </div>
        )}

        {/* Bubble */}
        <div style={bubbleStyle}>
          {typeof content === 'string' ? (
            <>
              {streaming ? displayed : sanitizeString(content)}
              {streaming && displayed.length < fullText.length && (
                <span style={{ display: 'inline-block', width: 2, height: 14, background: isUser ? '#fff' : theme.primary, marginLeft: 2, animation: 'tkx-blink 1s step-end infinite', verticalAlign: 'text-bottom' }} />
              )}
            </>
          ) : content}

          {/* Copy button */}
          {copyable && !isUser && (
            <button
              onClick={handleCopy}
              title="Copy message"
              style={{
                position: 'absolute', top: 8, right: 8,
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 13, color: copied ? '#10b981' : theme.textMuted,
                padding: '2px 4px', borderRadius: 4,
                transition: 'color 0.2s',
              }}
            >
              {copied ? '✓' : '⎘'}
            </button>
          )}
        </div>

        {/* Confidence bar (AI only) */}
        {!isUser && confidence !== undefined && (
          <div style={{ paddingInline: 4, width: '100%', maxWidth: 240 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ flex: 1, height: 3, borderRadius: 3, background: theme.border, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', width: `${confidence}%`,
                  background: confidenceColor(confidence, theme.primary),
                  borderRadius: 3, transition: 'width 0.8s ease',
                }} />
              </div>
              <span style={{ fontSize: 10, color: theme.textMuted, whiteSpace: 'nowrap' }}>
                {confidence}% confident
              </span>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes tkx-blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
      `}</style>
    </div>
  );
}
