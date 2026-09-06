import { TkxQRCode } from 'tekivex-ui';
import { Preview } from '../Preview';

export function QRCodeBasic() {
  return (
    <Preview label="Basic — encodes a URL">
      <TkxQRCode value="https://www.tekivex.com/ui" />
    </Preview>
  );
}

export function QRCodeSized() {
  return (
    <Preview label="Three sizes">
      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <TkxQRCode value="https://www.tekivex.com/ui" size={80} />
        <TkxQRCode value="https://www.tekivex.com/ui" size={120} />
        <TkxQRCode value="https://www.tekivex.com/ui" size={160} />
      </div>
    </Preview>
  );
}

export function QRCodeColored() {
  return (
    <Preview label="Custom colour">
      <TkxQRCode value="https://www.tekivex.com/ui" size={160} color="#4338ca" bgColor="#f1f5f9" />
    </Preview>
  );
}
