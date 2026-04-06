import {
  useState,
  useRef,
  useCallback,
  useEffect,
  useId,
  type DragEvent,
  type ChangeEvent,
} from 'react';
import { useTheme } from '../themes';
import { sanitizeString } from '../engine/security';
import { useReducedMotion } from '../hooks';
import { tkx, cx } from '../engine/tkx';

export interface TkxFileUploadProps {
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  maxFiles?: number;
  onChange?: (files: File[]) => void;
  onError?: (error: string) => void;
  label?: string;
  hint?: string;
  isDisabled?: boolean;
  preview?: boolean;
  dragDrop?: boolean;
  variant?: 'dropzone' | 'button';
}

interface UploadedFile {
  file: File;
  id: string;
  objectUrl?: string;
  progress: number;
  error?: string;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FileTypeIcon({ mimeType, color }: { mimeType: string; color: string }) {
  if (mimeType.startsWith('image/')) {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="M21 15l-5-5L5 21" />
      </svg>
    );
  }
  if (mimeType === 'application/pdf') {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} aria-hidden="true">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="9" y1="13" x2="15" y2="13" />
        <line x1="9" y1="17" x2="11" y2="17" />
      </svg>
    );
  }
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}

let idCounter = 0;
function uniqueId() { return `tkx-file-${++idCounter}`; }

export function TkxFileUpload({
  accept,
  multiple = false,
  maxSize,
  maxFiles,
  onChange,
  onError,
  label = 'Upload files',
  hint,
  isDisabled = false,
  preview = true,
  dragDrop = true,
  variant = 'dropzone',
}: TkxFileUploadProps) {
  const theme = useTheme();
  const reducedMotion = useReducedMotion();
  const hintId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [files, setFiles] = useState<UploadedFile[]>([]);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      files.forEach((f) => { if (f.objectUrl) URL.revokeObjectURL(f.objectUrl); });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const simulateProgress = useCallback((id: string) => {
    let current = 0;
    const interval = setInterval(() => {
      current += Math.floor(Math.random() * 20) + 10;
      if (current >= 100) {
        current = 100;
        clearInterval(interval);
      }
      setFiles((prev) =>
        prev.map((f) => (f.id === id ? { ...f, progress: current } : f)),
      );
    }, 100);
  }, []);

  const validateFile = useCallback((file: File): string | undefined => {
    if (maxSize && file.size > maxSize) {
      return `"${sanitizeString(file.name)}" exceeds max size of ${formatSize(maxSize)}`;
    }
    if (accept) {
      const accepted = accept.split(',').map((s) => s.trim());
      const matched = accepted.some((pattern) => {
        if (pattern.startsWith('.')) return file.name.toLowerCase().endsWith(pattern.toLowerCase());
        if (pattern.endsWith('/*')) return file.type.startsWith(pattern.slice(0, -1));
        return file.type === pattern;
      });
      if (!matched) {
        return `"${sanitizeString(file.name)}" is not an accepted file type`;
      }
    }
    return undefined;
  }, [accept, maxSize]);

  const processFiles = useCallback((incoming: File[]) => {
    const available = maxFiles ? maxFiles - files.length : Infinity;
    if (available <= 0) {
      onError?.(`Maximum of ${maxFiles} file${maxFiles === 1 ? '' : 's'} allowed`);
      return;
    }
    const toAdd = incoming.slice(0, available);
    const newEntries: UploadedFile[] = toAdd.map((file) => {
      const error = validateFile(file);
      const objectUrl = preview && file.type.startsWith('image/') && !error
        ? URL.createObjectURL(file)
        : undefined;
      return { file, id: uniqueId(), objectUrl, progress: error ? 0 : 0, error };
    });

    setFiles((prev) => {
      const updated = multiple ? [...prev, ...newEntries] : newEntries;
      const valid = updated.filter((f) => !f.error).map((f) => f.file);
      onChange?.(valid);
      return updated;
    });

    // Report per-file errors
    newEntries.forEach((entry) => {
      if (entry.error) onError?.(entry.error);
    });

    // Start progress simulation for valid files
    newEntries.forEach((entry) => {
      if (!entry.error) simulateProgress(entry.id);
    });
  }, [files.length, maxFiles, multiple, onChange, onError, preview, simulateProgress, validateFile]);

  const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    if (selected.length) processFiles(selected);
    // Reset input so same file can be re-added after removal
    e.target.value = '';
  }, [processFiles]);

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (isDisabled) return;
    const dropped = Array.from(e.dataTransfer.files);
    if (dropped.length) processFiles(dropped);
  }, [isDisabled, processFiles]);

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!isDisabled) setIsDragOver(true);
  }, [isDisabled]);

  const handleDragLeave = useCallback(() => setIsDragOver(false), []);

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => {
      const target = prev.find((f) => f.id === id);
      if (target?.objectUrl) URL.revokeObjectURL(target.objectUrl);
      const next = prev.filter((f) => f.id !== id);
      onChange?.(next.filter((f) => !f.error).map((f) => f.file));
      return next;
    });
  }, [onChange]);

  const openPicker = useCallback(() => {
    if (!isDisabled) inputRef.current?.click();
  }, [isDisabled]);

  const borderColor = isDragOver ? theme.primary : theme.border;
  const safeLabel = sanitizeString(label);
  const safeHint = hint ? sanitizeString(hint) : '';

  const dropzoneContent = (
    <div
      role="button"
      tabIndex={isDisabled ? -1 : 0}
      aria-label={safeLabel}
      aria-describedby={hint ? hintId : undefined}
      aria-disabled={isDisabled}
      onClick={openPicker}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openPicker(); } }}
      onDrop={dragDrop ? handleDrop : undefined}
      onDragOver={dragDrop ? handleDragOver : undefined}
      onDragLeave={dragDrop ? handleDragLeave : undefined}
      className={tkx('flex flex-col items-center justify-center gap-3 w-full p-8 rounded-lg')}
      style={{
        border: `2px dashed ${borderColor}`,
        backgroundColor: isDragOver ? `${theme.primary}10` : theme.surface,
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        opacity: isDisabled ? 0.5 : 1,
        transition: reducedMotion ? 'none' : 'border-color 150ms ease, background-color 150ms ease',
        outline: 'none',
      }}
    >
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={isDragOver ? theme.primary : theme.textMuted} strokeWidth={1.5} aria-hidden="true">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
      </svg>
      <div className={tkx('text-center')}>
        <p className={tkx('m-0 text-sm font-medium')} style={{ color: theme.text }}>
          {isDragOver ? 'Drop files here' : safeLabel}
        </p>
        {safeHint && (
          <p id={hintId} className={tkx('m-0 text-xs mt-1')} style={{ color: theme.textMuted }}>
            {safeHint}
          </p>
        )}
      </div>
    </div>
  );

  const buttonContent = (
    <button
      type="button"
      disabled={isDisabled}
      onClick={openPicker}
      aria-describedby={hint ? hintId : undefined}
      className={tkx('flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium font-sans border-none cursor-pointer')}
      style={{
        backgroundColor: theme.primary,
        color: theme.bg,
        opacity: isDisabled ? 0.5 : 1,
        cursor: isDisabled ? 'not-allowed' : 'pointer',
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
      </svg>
      {safeLabel}
      {hint && (
        <span id={hintId} className={tkx('sr-only')}>{safeHint}</span>
      )}
    </button>
  );

  return (
    <div className={tkx('flex flex-col gap-3 w-full font-sans')}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={isDisabled}
        onChange={handleInputChange}
        className={tkx('sr-only')}
        tabIndex={-1}
        aria-hidden="true"
      />

      {variant === 'dropzone' ? dropzoneContent : buttonContent}

      {files.length > 0 && (
        <ul
          role="status"
          aria-live="polite"
          aria-label="Uploaded files"
          className={tkx('m-0 p-0 flex flex-col gap-2')}
          style={{ listStyle: 'none' }}
        >
          {files.map((entry) => (
            <li
              key={entry.id}
              className={tkx('flex flex-col gap-1 rounded-md p-3')}
              style={{
                backgroundColor: theme.surfaceAlt,
                border: `1px solid ${entry.error ? theme.danger : theme.border}`,
              }}
            >
              <div className={tkx('flex items-center gap-3')}>
                {entry.objectUrl && preview ? (
                  <img
                    src={entry.objectUrl}
                    alt={sanitizeString(entry.file.name)}
                    className={tkx('rounded')}
                    style={{ width: 40, height: 40, objectFit: 'cover', flexShrink: 0 }}
                  />
                ) : (
                  <span style={{ flexShrink: 0 }}>
                    <FileTypeIcon mimeType={entry.file.type} color={entry.error ? theme.danger : theme.textMuted} />
                  </span>
                )}
                <div className={tkx('flex flex-col gap-0.5 flex-1 min-w-0')}>
                  <span
                    className={tkx('text-sm font-medium truncate')}
                    style={{ color: entry.error ? theme.danger : theme.text }}
                    title={entry.file.name}
                  >
                    {sanitizeString(entry.file.name)}
                  </span>
                  <span className={tkx('text-xs')} style={{ color: theme.textMuted }}>
                    {formatSize(entry.file.size)}
                    {entry.error && ` — ${entry.error}`}
                  </span>
                </div>
                <button
                  type="button"
                  aria-label={`Remove ${sanitizeString(entry.file.name)}`}
                  onClick={() => removeFile(entry.id)}
                  className={tkx('flex items-center justify-center bg-transparent border-none cursor-pointer rounded p-1')}
                  style={{ color: theme.textMuted, flexShrink: 0 }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              {!entry.error && entry.progress < 100 && (
                <div
                  className={tkx('w-full overflow-hidden')}
                  style={{ height: '3px', borderRadius: '3px', backgroundColor: theme.border }}
                  aria-hidden="true"
                >
                  <div
                    style={{
                      height: '100%',
                      borderRadius: '3px',
                      backgroundColor: theme.primary,
                      width: `${entry.progress}%`,
                      transition: reducedMotion ? 'none' : 'width 100ms ease',
                    }}
                  />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
