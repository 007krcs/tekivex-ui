// ══════════════════════════════════════════════════════════════════════════════
// AGENT EVENTS — union of provider stream events + agent-loop events.
// Kept in a leaf module so middleware/observers can import without cycles.
// ══════════════════════════════════════════════════════════════════════════════

import type { StreamEvent } from './Provider';
import type { StopReason } from './types';

export type AgentEvent =
  | StreamEvent
  | { type: 'step_start'; step: number }
  | { type: 'tool_result'; id: string; name: string; output: unknown }
  | { type: 'tool_error'; id: string; name: string; error: Error }
  | { type: 'done'; reason: StopReason };
