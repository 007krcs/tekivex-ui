import { TkxLogo } from 'tekivex-ui';
import { Preview } from '../Preview';

export function LogoBasic() {
  return (
    <Preview label="Basic — wordmark with tagline">
      <TkxLogo text="TekiVex" tagline="UI library" />
    </Preview>
  );
}

export function LogoSizes() {
  return (
    <Preview label="Sizes" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 12 }}>
      <TkxLogo text="TekiVex" size="sm" />
      <TkxLogo text="TekiVex" size="md" />
      <TkxLogo text="TekiVex" size="lg" />
    </Preview>
  );
}
