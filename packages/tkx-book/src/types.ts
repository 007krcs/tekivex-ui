import type { ReactNode } from 'react';

export type ControlType = 'select' | 'boolean' | 'text' | 'number' | 'color';

export interface ControlSpec {
  type: ControlType;
  options?: string[]; // for type === 'select'
  default: unknown;
  min?: number;
  max?: number;
  step?: number;
}

export interface Story {
  /** Display name shown in sidebar. */
  name: string;
  /** Optional one-line description. */
  description?: string;
  /** Map of prop name → control spec. The default values feed render(). */
  controls: Record<string, ControlSpec>;
  /** Render function — receives a props object built from current control values. */
  render: (props: Record<string, any>) => ReactNode;
}

export type StorySlug = string;

export interface BookConfig {
  stories: Record<StorySlug, Story>;
}
