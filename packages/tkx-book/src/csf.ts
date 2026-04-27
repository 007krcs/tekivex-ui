// ─────────────────────────────────────────────────────────────────────────────
// CSF (Component Story Format) compatibility layer.
//
// Storybook's CSF v3 looks like:
//
//   import { TkxButton } from 'tekivex-ui';
//   import type { Meta, StoryObj } from '@storybook/react';
//
//   const meta: Meta<typeof TkxButton> = {
//     title: 'Components/Button',
//     component: TkxButton,
//     argTypes: {
//       variant: { control: 'select', options: ['primary', 'secondary'] },
//       size: { control: 'radio', options: ['sm', 'md', 'lg'] },
//       disabled: { control: 'boolean' },
//     },
//   };
//   export default meta;
//
//   export const Primary: StoryObj<typeof TkxButton> = {
//     args: { variant: 'primary', children: 'Click me' },
//   };
//
// We accept this format natively. Anyone with existing Storybook stories
// can drop them straight into stories/ and tkx-book picks them up.
// ─────────────────────────────────────────────────────────────────────────────

import { createElement, type ComponentType, type ReactNode } from 'react';
import type { Story, ControlSpec, ControlType } from './types';

interface CsfArgType {
  control?: string | { type: string };
  options?: string[];
  description?: string;
  defaultValue?: any;
}

interface CsfMeta {
  title?: string;
  component?: ComponentType<any>;
  argTypes?: Record<string, CsfArgType>;
  args?: Record<string, any>;
}

interface CsfStory {
  args?: Record<string, any>;
  argTypes?: Record<string, CsfArgType>;
  render?: (args: Record<string, any>) => ReactNode;
  name?: string;
}

interface CsfModule {
  default: CsfMeta;
  // Named exports — each is a CsfStory.
  [storyName: string]: CsfMeta | CsfStory | undefined;
}

/** Detect whether a module is CSF or our native Story format. */
export function isCsfModule(mod: any): boolean {
  return (
    mod &&
    typeof mod === 'object' &&
    mod.default &&
    typeof mod.default === 'object' &&
    (mod.default.component || mod.default.title)
  );
}

/** Map a CSF argType to our ControlSpec. */
function csfArgTypeToControl(argType: CsfArgType, defaultValue: any): ControlSpec | null {
  const c = typeof argType.control === 'string' ? argType.control : argType.control?.type;
  let type: ControlType;
  if (c === 'select' || c === 'radio') type = 'select';
  else if (c === 'boolean') type = 'boolean';
  else if (c === 'text') type = 'text';
  else if (c === 'number') type = 'number';
  else if (c === 'color') type = 'color';
  else if (typeof defaultValue === 'boolean') type = 'boolean';
  else if (typeof defaultValue === 'number') type = 'number';
  else type = 'text';

  return {
    type,
    options: argType.options,
    default: defaultValue,
  };
}

/** Convert a CSF module into one or more tkx-book Stories. */
export function csfModuleToStories(mod: CsfModule, baseSlug: string): Record<string, Story> {
  const meta = mod.default;
  const Component = meta.component;
  const result: Record<string, Story> = {};

  for (const [exportName, exported] of Object.entries(mod)) {
    if (exportName === 'default' || !exported) continue;
    const csf = exported as CsfStory;

    // Merge meta-level + story-level args + argTypes.
    const mergedArgs = { ...meta.args, ...csf.args };
    const mergedArgTypes = { ...meta.argTypes, ...csf.argTypes };

    // Build controls map.
    const controls: Record<string, ControlSpec> = {};
    for (const [argName, argType] of Object.entries(mergedArgTypes ?? {})) {
      const def = mergedArgs[argName];
      const spec = csfArgTypeToControl(argType, def);
      if (spec) controls[argName] = spec;
    }
    // Also include any args that weren't in argTypes — infer their type.
    for (const [argName, value] of Object.entries(mergedArgs)) {
      if (controls[argName]) continue;
      controls[argName] = {
        type:
          typeof value === 'boolean'
            ? 'boolean'
            : typeof value === 'number'
            ? 'number'
            : 'text',
        default: value,
      };
    }

    // Render: prefer story.render, fall back to <component {...args} />.
    const render = csf.render
      ? csf.render
      : Component
      ? (props: Record<string, any>) => createElement(Component, props)
      : () => null;

    const slug = baseSlug + '/' + exportName.toLowerCase();
    result[slug] = {
      name: csf.name ?? `${meta.title ?? baseSlug} / ${exportName}`,
      controls,
      render,
    };
  }

  return result;
}
