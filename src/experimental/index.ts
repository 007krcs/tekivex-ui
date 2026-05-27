// ── tekivex-ui/experimental ────────────────────────────────────────────────
// Opt-in entry point for components that are NOT part of the public API.
//
// Components here are kept in-tree (source lives under src/components/) but
// excluded from the root barrel and the headline component count. The API
// surface, prop names, and runtime behaviour MAY change in any minor release.
//
// If you depend on something here, pin an exact version of tekivex-ui and
// open an issue describing the use case so we can decide whether to graduate
// the component to the public API.
//
// Import path:
//   import { TkxQuantumForm } from 'tekivex-ui/experimental';
// ───────────────────────────────────────────────────────────────────────────

export { TkxQuantumForm } from '../components/TkxQuantumForm';
export type {
  TkxQuantumFormProps,
  QuantumFieldConfig,
} from '../components/TkxQuantumForm';

export { TkxAIConfidenceBar } from '../components/TkxAIConfidenceBar';
export type { TkxAIConfidenceBarProps } from '../components/TkxAIConfidenceBar';

export { TkxAIThinking } from '../components/TkxAIThinking';
export type { TkxAIThinkingProps } from '../components/TkxAIThinking';

export { TkxAIChatBubble } from '../components/TkxAIChatBubble';
export type {
  TkxAIChatBubbleProps,
  AIRole,
} from '../components/TkxAIChatBubble';
