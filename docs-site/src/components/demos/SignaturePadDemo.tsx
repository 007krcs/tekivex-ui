import { TkxSignaturePad } from 'tekivex-ui';
import { Preview } from '../Preview';

export function SignaturePadBasic() {
  return (
    <Preview label="Sign with mouse, finger, or stylus">
      <TkxSignaturePad label="Sign here" width={400} height={150} />
    </Preview>
  );
}
