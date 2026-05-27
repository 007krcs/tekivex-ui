// ══════════════════════════════════════════════════════════════════════════════
// TkxReasoningTrace (#10) — Step-by-step view of the agent event stream.
// ══════════════════════════════════════════════════════════════════════════════

import type { CSSProperties, ReactElement } from 'react';
import type { AgentEvent } from '../core/events';

export interface TkxReasoningTraceProps {
  events: AgentEvent[];
  hideTextDeltas?: boolean;
  className?: string;
  style?: CSSProperties;
}

export function TkxReasoningTrace({
  events,
  hideTextDeltas = true,
  className,
  style,
}: TkxReasoningTraceProps) {
  return (
    <ol className={className} style={style} aria-label="Reasoning trace">
      {events.map((e, i) => renderEvent(e, i, hideTextDeltas))}
    </ol>
  );
}

function renderEvent(e: AgentEvent, i: number, hideTextDeltas: boolean): ReactElement | null {
  switch (e.type) {
    case 'step_start':
      return (
        <li key={i} data-type="step">
          Step {e.step}
        </li>
      );
    case 'text_delta':
      return hideTextDeltas ? null : (
        <li key={i} data-type="text">
          {e.text}
        </li>
      );
    case 'tool_call_start':
      return (
        <li key={i} data-type="tool-start">
          → {e.name} <small>({e.id})</small>
        </li>
      );
    case 'tool_call_end':
      return (
        <li key={i} data-type="tool-args">
          input: <code>{JSON.stringify(e.input)}</code>
        </li>
      );
    case 'tool_result':
      return (
        <li key={i} data-type="tool-result">
          ✓ {e.name} returned
        </li>
      );
    case 'tool_error':
      return (
        <li key={i} data-type="tool-error">
          ✗ {e.name}: {e.error.message}
        </li>
      );
    case 'message_stop':
      return (
        <li key={i} data-type="stop">
          stop ({e.reason})
        </li>
      );
    case 'done':
      return (
        <li key={i} data-type="done">
          done ({e.reason})
        </li>
      );
    case 'error':
      return (
        <li key={i} data-type="error">
          error: {e.error.message}
        </li>
      );
    default:
      return null;
  }
}
