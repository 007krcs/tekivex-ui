'use client';

import {
  forwardRef,
  useCallback,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { TkxButton, type TkxButtonProps } from './TkxButton';
import { sceneToPdfBlob } from '../engine/pdf';
import type { Scene } from '../engine/canvas';
import type { PdfDocumentInfo } from '../engine/pdf';

export interface TkxPdfExportProps
  extends Omit<TkxButtonProps, 'onClick' | 'children'> {
  scene: Scene;
  /** Filename presented to the browser save dialog. */
  filename?: string;
  /** Optional /Info dictionary entries (Title, Author, …). */
  info?: PdfDocumentInfo;
  /** Resolves an image src referenced by the scene to its JPEG bytes. */
  resolveImage?: (src: string) => Uint8Array | undefined;
  /** Called instead of triggering the download — gives the host the Blob to
   *  upload, attach to a fetch, or save manually. When provided no auto-
   *  download happens. */
  onExport?: (blob: Blob) => void | Promise<void>;
  /** Override the button label. Default "Download PDF". */
  children?: ReactNode;
}

/**
 * One-click PDF export button. Produces a Blob via engine/pdf and either
 * triggers a save dialog or hands it to the caller.
 */
export const TkxPdfExport = forwardRef<HTMLButtonElement, TkxPdfExportProps>(
  function TkxPdfExport(
    {
      scene,
      filename = 'biodata.pdf',
      info,
      resolveImage,
      onExport,
      children,
      ...buttonProps
    },
    ref,
  ) {
    const [busy, setBusy] = useState(false);

    const handleClick = useCallback(async () => {
      setBusy(true);
      try {
        const blob = sceneToPdfBlob(scene, { info, resolveImage });
        if (onExport) {
          await onExport(blob);
        } else if (typeof document !== 'undefined') {
          triggerDownload(blob, filename);
        }
      } finally {
        setBusy(false);
      }
    }, [scene, info, resolveImage, onExport, filename]);

    return (
      <TkxButton
        ref={ref}
        {...buttonProps}
        onClick={handleClick}
        isLoading={busy || buttonProps.isLoading}
      >
        {children ?? 'Download PDF'}
      </TkxButton>
    );
  },
);

TkxPdfExport.displayName = 'TkxPdfExport';

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  // Avoid leaving the link on screen; this matches the standard save-as flow.
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // Revoke after a short delay so the browser has time to start the download.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Re-export style symbol so consumers can spread it.
export type { CSSProperties };
