// Aggregate every story file. Adding a new story = drop a file here + import it.

import type { Story } from '../src/types';
import { button } from './button';
import { card } from './card';
import { input } from './input';
import { badge } from './badge';
import { alert } from './alert';
import { progress } from './progress';
import { phoneInput } from './phoneInput';
import { signaturePad } from './signaturePad';
import { confetti } from './confetti';
import { addressInput } from './addressInput';
import { currencyInput } from './currencyInput';

export const stories: Record<string, Story> = {
  button,
  card,
  input,
  badge,
  alert,
  progress,
  'phone-input': phoneInput,
  'signature-pad': signaturePad,
  'confetti': confetti,
  'address-input': addressInput,
  'currency-input': currencyInput,
};
