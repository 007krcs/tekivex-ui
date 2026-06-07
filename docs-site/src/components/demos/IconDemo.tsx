import { TkxIcon } from 'tekivex-ui';
import { Preview } from '../Preview';

export function IconGallery() {
  const NAMES: Array<'home' | 'menu' | 'search' | 'settings' | 'bell' | 'check' | 'x' | 'plus' | 'minus' | 'trash' | 'edit' | 'download' | 'upload' | 'share' | 'copy' | 'play' | 'pause' | 'moon' | 'sun'> = [
    'home', 'menu', 'search', 'settings', 'bell', 'check', 'x', 'plus', 'minus', 'trash',
    'edit', 'download', 'upload', 'share', 'copy', 'play', 'pause', 'moon', 'sun',
  ];
  return (
    <Preview label="Built-in icon set (sample of ~80 named icons)">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: 12, width: '100%' }}>
        {NAMES.map((name) => (
          <div key={name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: 8, border: '1px solid #e5e7eb', borderRadius: 6 }}>
            <TkxIcon name={name} size={24} />
            <code style={{ fontSize: 10, color: '#475569' }}>{name}</code>
          </div>
        ))}
      </div>
    </Preview>
  );
}

export function IconSizesAndColours() {
  return (
    <Preview label="Sizes + custom colours">
      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <TkxIcon name="check-circle" size={16} color="#0d9488" />
        <TkxIcon name="check-circle" size={24} color="#4338ca" />
        <TkxIcon name="check-circle" size={32} color="#dc2626" />
        <TkxIcon name="check-circle" size={48} color="#1f2937" />
      </div>
    </Preview>
  );
}
