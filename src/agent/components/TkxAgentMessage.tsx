// ══════════════════════════════════════════════════════════════════════════════
// TkxAgentMessage (#10) — Renders one Message with text + tool_use + tool_result.
// ══════════════════════════════════════════════════════════════════════════════

import type { CSSProperties, ReactNode } from 'react';
import type { ContentBlock, Message } from '../core/types';

export interface TkxAgentMessageProps {
  message: Message;
  streamingText?: string;
  renderToolCall?(block: Extract<ContentBlock, { type: 'tool_use' }>): ReactNode;
  renderToolResult?(block: Extract<ContentBlock, { type: 'tool_result' }>): ReactNode;
  className?: string;
  style?: CSSProperties;
}

export function TkxAgentMessage({
  message,
  streamingText,
  renderToolCall,
  renderToolResult,
  className,
  style,
}: TkxAgentMessageProps) {
  const blocks: ContentBlock[] =
    typeof message.content === 'string'
      ? [{ type: 'text', text: message.content }]
      : message.content;

  return (
    <div
      className={className}
      style={style}
      data-role={message.role}
      role="article"
      aria-label={`${message.role} message`}
    >
      {blocks.map((b, i) => {
        if (b.type === 'text') {
          return (
            <div key={i} data-block="text">
              {b.text}
            </div>
          );
        }
        if (b.type === 'tool_use') {
          return (
            <div key={i} data-block="tool_use">
              {renderToolCall ? (
                renderToolCall(b)
              ) : (
                <code>
                  {b.name}({JSON.stringify(b.input)})
                </code>
              )}
            </div>
          );
        }
        if (b.type === 'tool_result') {
          return (
            <div key={i} data-block="tool_result">
              {renderToolResult ? (
                renderToolResult(b)
              ) : (
                <pre>
                  {typeof b.output === 'string'
                    ? b.output
                    : JSON.stringify(b.output, null, 2)}
                </pre>
              )}
            </div>
          );
        }
        if (b.type === 'image') {
          const src =
            b.source.kind === 'base64'
              ? `data:${b.source.mediaType ?? 'image/png'};base64,${b.source.data}`
              : b.source.data;
          return <img key={i} src={src} alt="" data-block="image" />;
        }
        return null;
      })}
      {streamingText ? <div data-block="streaming">{streamingText}</div> : null}
    </div>
  );
}
