import { useEffect, useState } from 'react';
import { TkxProgress } from 'tekivex-ui';
import { Preview } from '../Preview';

export function ProgressColors() {
  return (
    <Preview style={{ flexDirection: 'column', alignItems: 'stretch' }}>
      <TkxProgress value={25} colorScheme="primary" label="Primary" showValue />
      <TkxProgress value={50} colorScheme="success" label="Success" showValue />
      <TkxProgress value={75} colorScheme="warning" label="Warning" showValue />
      <TkxProgress value={90} colorScheme="danger"  label="Danger"  showValue />
    </Preview>
  );
}

export function ProgressLive() {
  const [value, setValue] = useState(0);
  useEffect(() => {
    const id = setInterval(() => {
      setValue((v) => (v >= 100 ? 0 : v + 5));
    }, 250);
    return () => clearInterval(id);
  }, []);
  return (
    <Preview label="Live updating" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
      <TkxProgress value={value} label="Uploading…" showValue colorScheme="primary" />
    </Preview>
  );
}

export function ProgressIndeterminate() {
  return (
    <Preview label="Indeterminate (no value)" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
      <TkxProgress indeterminate label="Reticulating splines…" />
    </Preview>
  );
}

export function ProgressCircular() {
  return (
    <Preview label="Circular variant">
      <TkxProgress variant="circular" value={66} colorScheme="primary" />
      <TkxProgress variant="circular" value={42} colorScheme="success" />
      <TkxProgress variant="circular" indeterminate />
    </Preview>
  );
}
