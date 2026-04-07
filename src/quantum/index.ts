// ── @tekivex/ui/quantum ──────────────────────────────────────────────────────
// Quantum-inspired AI components: form inference (Boltzmann machines),
// theme optimization (quantum annealing), and live JSX playground (Grover's
// amplitude amplification for component suggestions).
//
// This entry point is split out so consumers who don't use quantum AI features
// don't pay for the ~100 KB of math + components in their bundle.
//
// Import from '@tekivex/ui/quantum'.
// ─────────────────────────────────────────────────────────────────────────────

export { TkxQuantumForm } from '../components/TkxQuantumForm';
export type { TkxQuantumFormProps, QuantumFieldConfig } from '../components/TkxQuantumForm';

export { TkxThemeBuilder } from '../components/TkxThemeBuilder';
export type { TkxThemeBuilderProps } from '../components/TkxThemeBuilder';

export { TkxPlayground } from '../components/TkxPlayground';
export type { TkxPlaygroundProps, PlaygroundExample } from '../components/TkxPlayground';

export {
  QuantumAI,
  inferFieldIntelligence,
  optimizeThemeColors,
  hslToHex,
  Qubit,
  QuantumRegister,
  QuantumAnnealer,
  QuantumBoltzmannMachine,
  AmplitudeAmplifier,
} from '../engine/quantum-ai';
export type {
  FieldIntelligence,
  ValidationSuggestion,
  ThemeColorState,
  AnnealerResult,
  QBMInference,
  AmplifiedResult,
} from '../engine/quantum-ai';
