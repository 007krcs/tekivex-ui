import { useState } from 'react';
import { TkxFileUpload } from 'tekivex-ui';
import { Preview } from '../Preview';

export function FileUploadDropzone() {
  const [count, setCount] = useState(0);
  return (
    <Preview label="Dropzone variant" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
      <TkxFileUpload
        multiple
        accept="image/*,application/pdf"
        maxSize={10 * 1024 * 1024}
        maxFiles={5}
        hint="JPG, PNG or PDF. Up to 10 MB each, 5 files max."
        onChange={(files) => setCount(files.length)}
      />
      <p style={{ marginTop: 12, fontSize: 13, opacity: 0.7 }}>
        Files queued: <strong>{count}</strong>
      </p>
    </Preview>
  );
}

export function FileUploadButton() {
  return (
    <Preview label="Compact button variant">
      <TkxFileUpload
        variant="button"
        label="Choose files"
        accept=".pdf,.docx"
      />
    </Preview>
  );
}
