// Aggregate every addon. Adding a new one = drop a file + register here.

import type { Addon } from './registry';
import { ControlsAddon } from './controls';
import { docsAddon } from './docs';
import { a11yAddon } from './a11y';
import { viewportAddon } from './viewport';
import { snapshotAddon } from './snapshot';
import { interactionsAddon } from './interactions';

export const ADDONS: Addon[] = [
  ControlsAddon,
  docsAddon,
  a11yAddon,
  viewportAddon,
  snapshotAddon,
  interactionsAddon,
];

export type { Addon, AddonContext } from './registry';
export { useViewport, dispatchViewport, DEVICE_PROFILES } from './viewport';
export type { DeviceProfile } from './viewport';
