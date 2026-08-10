import { TkxTextarea } from 'tekivex-ui';
import { Preview } from '../Preview';

export function TextareaBasic() {
  return (
    <Preview style={{ flexDirection: 'column', alignItems: 'stretch' }}>
      <div style={{ minWidth: 300, maxWidth: 420 }}>
        <TkxTextarea
          label="Bio"
          hint="A short description shown on your profile"
          placeholder="Tell us about yourself"
        />
      </div>
    </Preview>
  );
}

export function TextareaAutoResize() {
  return (
    <Preview label="autoResize" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
      <div style={{ minWidth: 300, maxWidth: 420 }}>
        <TkxTextarea
          label="Notes"
          autoResize
          minRows={2}
          maxRows={6}
          placeholder="Type a few lines — the field grows with the content"
        />
      </div>
    </Preview>
  );
}

export function TextareaCounter() {
  return (
    <Preview label="showCount + maxLength" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
      <div style={{ minWidth: 300, maxWidth: 420 }}>
        <TkxTextarea
          label="Tweet"
          showCount
          maxLength={140}
          defaultValue="Live character counter — turns danger-coloured at the limit."
        />
      </div>
    </Preview>
  );
}
