import { useState } from 'react';
import { TkxCheckbox } from 'tekivex-ui';
import { Preview } from '../Preview';

export function CheckboxBasic() {
  const [checked, setChecked] = useState(true);
  return (
    <Preview label="Basic — controlled">
      <TkxCheckbox checked={checked} onChange={setChecked} label="I agree to the terms" />
    </Preview>
  );
}

export function CheckboxStates() {
  const [a, setA] = useState(true);
  const [b, setB] = useState(false);
  return (
    <Preview label="States" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
      <TkxCheckbox checked={a} onChange={setA} label="Checked" />
      <TkxCheckbox checked={b} onChange={setB} label="Unchecked" />
      <TkxCheckbox checked={false} onChange={() => {}} isIndeterminate label="Indeterminate" />
      <TkxCheckbox checked={true} onChange={() => {}} disabled label="Disabled (checked)" />
      <TkxCheckbox checked={false} onChange={() => {}} disabled label="Disabled (unchecked)" />
    </Preview>
  );
}

export function CheckboxColorSchemes() {
  return (
    <Preview label="Color schemes" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
      <TkxCheckbox checked={true} onChange={() => {}} colorScheme="primary" label="primary" />
      <TkxCheckbox checked={true} onChange={() => {}} colorScheme="success" label="success" />
      <TkxCheckbox checked={true} onChange={() => {}} colorScheme="warning" label="warning" />
      <TkxCheckbox checked={true} onChange={() => {}} colorScheme="danger" label="danger" />
    </Preview>
  );
}

export function CheckboxWithError() {
  const [v, setV] = useState(false);
  return (
    <Preview label="With error message">
      <TkxCheckbox
        checked={v}
        onChange={setV}
        label="I accept the privacy policy"
        isInvalid={!v}
        errorMessage={v ? undefined : 'You must accept to continue'}
      />
    </Preview>
  );
}
