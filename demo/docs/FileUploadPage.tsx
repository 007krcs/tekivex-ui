import { useState } from 'react';
import type { ThemeTokens } from 'tekivex-ui';
import {
  TkxFileUpload,
} from 'tekivex-ui';
import { DemoSection } from '../layout/DemoSection';
import { PropTable } from '../layout/PropTable';
import { WCAGBadge, WCAGBadgeGroup } from '../layout/WCAGBadge';

// ── Prop definitions ──────────────────────────────────────────────────────────

const FILE_UPLOAD_PROPS = [
  { name: 'onChange', type: '(files: File[]) => void', required: true, description: 'Callback fired with the updated file list when files are added or removed.' },
  { name: 'value', type: 'File[]', default: '[]', description: 'Controlled list of currently selected files.' },
  { name: 'variant', type: "'dropzone' | 'button'", default: "'dropzone'", description: "Dropzone shows a drag-and-drop area; button shows a compact upload button." },
  { name: 'accept', type: 'string', default: 'undefined', description: 'Comma-separated MIME types or file extensions: e.g., "image/*,.pdf"' },
  { name: 'multiple', type: 'boolean', default: 'false', description: 'Allow selecting multiple files at once.' },
  { name: 'maxSize', type: 'number', default: 'undefined', description: 'Maximum individual file size in bytes. Files exceeding this are rejected with an error.' },
  { name: 'maxFiles', type: 'number', default: 'undefined', description: 'Maximum total number of files allowed.' },
  { name: 'showPreview', type: 'boolean', default: 'false', description: 'Show image thumbnails for accepted image files.' },
  { name: 'disabled', type: 'boolean', default: 'false', description: 'Prevents all interaction.' },
  { name: 'label', type: 'string', default: "'Upload files'", description: 'Accessible label for the drop zone or button.' },
  { name: 'hint', type: 'string', default: 'undefined', description: 'Helper text shown below the component.' },
  { name: 'error', type: 'string', default: 'undefined', description: 'Error message shown below the component.' },
  { name: 'className', type: 'string', default: 'undefined', description: 'Extra class names on the root wrapper.' },
  { name: 'style', type: 'CSSProperties', default: 'undefined', description: 'Inline styles on the root wrapper.' },
];

// ── Page ─────────────────────────────────────────────────────────────────────

export function FileUploadPage({ theme }: { theme: ThemeTokens }) {
  const [basicFiles, setBasicFiles] = useState<File[]>([]);
  const [buttonFiles, setButtonFiles] = useState<File[]>([]);
  const [multiFiles, setMultiFiles] = useState<File[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [sizeFiles, setSizeFiles] = useState<File[]>([]);
  const [acceptFiles, setAcceptFiles] = useState<File[]>([]);

  function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  }

  const dividerStyle = { height: '1px', backgroundColor: theme.border, margin: '48px 0', border: 'none' };

  const noteBoxStyle = {
    borderRadius: '10px',
    border: `1px solid ${theme.border}`,
    backgroundColor: theme.surfaceAlt,
    padding: '20px 24px',
    marginBottom: '24px',
  };

  const noteHeadStyle = {
    fontSize: '13px',
    fontWeight: 700 as const,
    color: theme.text,
    margin: '0 0 12px',
  };

  const noteItemStyle = {
    fontSize: '13.5px',
    color: theme.textMuted,
    lineHeight: '1.7',
    margin: '0 0 6px',
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 32px 80px' }}>

      {/* WCAG badge row */}
      <div style={{ marginBottom: '24px' }}>
        <WCAGBadgeGroup
          label="WCAG 2.1 Compliance"
          badges={[
            { criterion: '1.3.1 Info & Relationships', level: 'AA', status: 'PASS' },
            { criterion: '2.1.1 Keyboard', level: 'AA', status: 'PASS' },
            { criterion: '3.3.1 Error Identification', level: 'AA', status: 'PASS' },
            { criterion: '4.1.2 Name/Role/Value', level: 'AA', status: 'PASS' },
          ]}
        />
      </div>

      {/* Hero */}
      <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: theme.text, margin: '0 0 12px', letterSpacing: '-0.03em', lineHeight: 1.15 }}>
        TkxFileUpload
      </h1>
      <p style={{ fontSize: '15px', color: theme.textMuted, lineHeight: '1.75', maxWidth: '640px', margin: '0 0 8px' }}>
        An accessible file upload component supporting drag-and-drop and button variants. Files can be added via
        drag, click, or keyboard — the underlying{' '}
        <code style={{ fontSize: '12px', backgroundColor: `${theme.primary}14`, color: theme.primary, padding: '1px 5px', borderRadius: '4px' }}>{'<input type="file">'}</code>{' '}
        is always focusable and activatable from the keyboard.
      </p>
      <p style={{ fontSize: '13px', color: theme.textMuted, lineHeight: '1.6', maxWidth: '640px', margin: '0 0 48px' }}>
        <strong style={{ color: theme.text }}>Validation:</strong> maxSize and accept constraints are validated
        client-side with descriptive error messages. Rejected files are announced via a live region so screen
        reader users know which files were rejected and why.
      </p>

      {/* ── 1. Basic Dropzone ── */}
      <DemoSection
        title="Basic Dropzone"
        description="The default dropzone variant. Users can drag files onto the zone or click to open the file picker. The drop zone border activates on drag-over for visual feedback."
        theme={theme}
        code={`const [files, setFiles] = useState<File[]>([]);

<TkxFileUpload
  label="Upload documents"
  value={files}
  onChange={setFiles}
  hint="Drag files here or click to browse"
/>`}
      >
        <div style={{ width: '100%', maxWidth: '480px' }}>
          <TkxFileUpload
            label="Upload documents"
            value={basicFiles}
            onChange={setBasicFiles}
            hint="Drag files here or click to browse"
          />
          {basicFiles.length > 0 && (
            <p style={{ margin: '8px 0 0', fontSize: '12px', color: theme.textMuted }}>
              {basicFiles.length} file(s): {basicFiles.map((f) => f.name).join(', ')}
            </p>
          )}
        </div>
      </DemoSection>

      {/* ── 2. Button Variant ── */}
      <DemoSection
        title="Button Variant"
        description="variant='button' renders a compact button that opens the file picker on click. Suitable for inline use in forms where a full dropzone is too prominent."
        theme={theme}
        code={`<TkxFileUpload
  label="Attach file"
  variant="button"
  value={files}
  onChange={setFiles}
/>`}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <TkxFileUpload
            label="Attach file"
            variant="button"
            value={buttonFiles}
            onChange={setButtonFiles}
          />
          {buttonFiles.length > 0 && (
            <span style={{ fontSize: '13px', color: theme.textMuted }}>
              {buttonFiles[0].name} ({formatBytes(buttonFiles[0].size)})
            </span>
          )}
        </div>
      </DemoSection>

      {/* ── 3. Multiple Files ── */}
      <DemoSection
        title="Multiple Files"
        description="Set multiple to allow selecting more than one file at a time. The file list is shown with individual remove buttons."
        theme={theme}
        code={`<TkxFileUpload
  label="Upload attachments"
  multiple
  value={files}
  onChange={setFiles}
  hint="Select one or more files"
/>`}
      >
        <div style={{ width: '100%', maxWidth: '480px' }}>
          <TkxFileUpload
            label="Upload attachments"
            multiple
            value={multiFiles}
            onChange={setMultiFiles}
            hint="Select one or more files"
          />
          {multiFiles.length > 0 && (
            <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {multiFiles.map((f, i) => (
                <div key={i} style={{ fontSize: '12px', color: theme.textMuted, display: 'flex', justifyContent: 'space-between' }}>
                  <span>{f.name}</span>
                  <span>{formatBytes(f.size)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </DemoSection>

      {/* ── 4. Image Preview ── */}
      <DemoSection
        title="Image Preview"
        description="Set showPreview and accept='image/*' to display thumbnails of selected images. Thumbnails are generated client-side via URL.createObjectURL."
        theme={theme}
        code={`<TkxFileUpload
  label="Upload photos"
  accept="image/*"
  multiple
  showPreview
  value={files}
  onChange={setFiles}
  hint="JPG, PNG, WebP, GIF — any image format"
/>`}
      >
        <div style={{ width: '100%', maxWidth: '480px' }}>
          <TkxFileUpload
            label="Upload photos"
            accept="image/*"
            multiple
            showPreview
            value={imageFiles}
            onChange={setImageFiles}
            hint="JPG, PNG, WebP, GIF — any image format"
          />
        </div>
      </DemoSection>

      {/* ── 5. Max Size Validation ── */}
      <DemoSection
        title="Max Size Validation"
        description="Set maxSize in bytes. Files larger than the limit are rejected immediately with an error message, announced via a live region for screen reader users."
        theme={theme}
        code={`// Reject files larger than 2MB
<TkxFileUpload
  label="Upload document"
  maxSize={2 * 1024 * 1024} // 2MB
  value={files}
  onChange={setFiles}
  hint="Max file size: 2 MB"
/>`}
      >
        <div style={{ width: '100%', maxWidth: '480px' }}>
          <TkxFileUpload
            label="Upload document"
            maxSize={2 * 1024 * 1024}
            value={sizeFiles}
            onChange={setSizeFiles}
            hint="Max file size: 2 MB. Larger files will be rejected."
          />
        </div>
      </DemoSection>

      {/* ── 6. Accept Filter ── */}
      <DemoSection
        title="Accept Filter"
        description="The accept prop passes to the native input's accept attribute and is also validated client-side. Files not matching the filter show a specific rejection error."
        theme={theme}
        code={`// Only accept PDF and Word documents
<TkxFileUpload
  label="Upload contract"
  accept=".pdf,.doc,.docx"
  value={files}
  onChange={setFiles}
  hint="PDF or Word documents only"
/>`}
      >
        <div style={{ width: '100%', maxWidth: '480px' }}>
          <TkxFileUpload
            label="Upload contract"
            accept=".pdf,.doc,.docx,application/pdf"
            value={acceptFiles}
            onChange={setAcceptFiles}
            hint="PDF or Word documents only (.pdf, .doc, .docx)"
          />
        </div>
      </DemoSection>

      <hr style={dividerStyle} />

      {/* Props Table */}
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: theme.text, margin: '0 0 20px', letterSpacing: '-0.02em' }}>
        Props Reference
      </h2>
      <div style={{ marginBottom: '48px' }}>
        <PropTable props={FILE_UPLOAD_PROPS} />
      </div>

      <hr style={dividerStyle} />

      {/* Accessibility Notes */}
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: theme.text, margin: '0 0 20px', letterSpacing: '-0.02em' }}>
        Accessibility Notes
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
        <WCAGBadge criterion="1.3.1 Info & Relationships" level="AA" status="PASS" />
        <WCAGBadge criterion="2.1.1 Keyboard Accessible" level="AA" status="PASS" />
        <WCAGBadge criterion="3.3.1 Error Identification" level="AA" status="PASS" />
        <WCAGBadge criterion="4.1.2 Name, Role, Value" level="AA" status="PASS" />
      </div>
      <div style={noteBoxStyle}>
        <p style={noteHeadStyle}>Keyboard Access</p>
        <p style={noteItemStyle}>The drop zone is a focusable <code>{'<div role="button">'}</code> that activates the hidden file input on Enter or Space. The native file input is visually hidden but remains in the tab order as a fallback for assistive technologies that interact with native inputs directly.</p>
      </div>
      <div style={noteBoxStyle}>
        <p style={noteHeadStyle}>Error Announcements</p>
        <p style={noteItemStyle}>Validation errors (wrong type, too large) are injected into a{' '}
          <code>{'<div role="alert" aria-live="assertive">'}</code> so screen readers announce them immediately
          without requiring the user to navigate to the error location.
        </p>
        <p style={noteItemStyle}>Always pair TkxFileUpload with visible hint text listing the accepted formats and size limits — don't rely on validation errors alone (WCAG 3.3.2).</p>
      </div>
    </div>
  );
}
