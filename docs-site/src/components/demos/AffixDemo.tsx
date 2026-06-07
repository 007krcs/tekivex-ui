import { TkxAffix, TkxButton } from 'tekivex-ui';
import { Preview } from '../Preview';

export function AffixBasic() {
  return (
    <Preview label="Sticky on scroll — try scrolling the page" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
      <div style={{ height: 200, padding: 16, background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 8 }}>
        <p style={{ fontSize: 12, color: '#475569', margin: 0 }}>
          Scroll the surrounding page to see the button below "stick" to
          a fixed offset from the top once it would otherwise scroll
          out of view.
        </p>
        <div style={{ marginTop: 24 }}>
          <TkxAffix offsetTop={20}>
            <TkxButton variant="primary">Affixed button</TkxButton>
          </TkxAffix>
        </div>
      </div>
    </Preview>
  );
}
