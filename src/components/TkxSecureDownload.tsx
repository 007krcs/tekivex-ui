'use client';

import {
  forwardRef,
  useCallback,
  useState,
  type ReactNode,
} from 'react';
import { TkxButton, type TkxButtonProps } from './TkxButton';

export interface TkxSecureDownloadProps
  extends Omit<TkxButtonProps, 'onClick' | 'children' | 'onError'> {
  /** Pre-signed one-time URL — typically returned by the backend after
   *  successful payment verification. */
  url: string;
  /** Filename presented to the browser save dialog. */
  filename: string;
  /** Optional fetch init (headers, credentials, signal). */
  fetchInit?: RequestInit;
  /** Mime type to set on the blob. Default inferred from response, fallback
   *  application/octet-stream. */
  mimeType?: string;
  /** Called with the response Blob *before* the download is triggered, so
   *  the host can persist it (e.g., into IndexedDB for offline re-access). */
  onBlob?: (blob: Blob) => void | Promise<void>;
  /** Called when the request fails or returns non-2xx. */
  onError?: (error: Error) => void;
  /** Called when the download has been kicked off. */
  onDownloadStart?: () => void;
  children?: ReactNode;
}

/**
 * Single-use signed download button. The token semantics (single-use,
 * expiring, replay-blacklisted) are enforced by the backend; this component
 * provides the UX: fetch, stream into a Blob, trigger save dialog, revoke
 * the object URL.
 */
export const TkxSecureDownload = forwardRef<HTMLButtonElement, TkxSecureDownloadProps>(
  function TkxSecureDownload(
    {
      url,
      filename,
      fetchInit,
      mimeType,
      onBlob,
      onError,
      onDownloadStart,
      children,
      ...buttonProps
    },
    ref,
  ) {
    const [busy, setBusy] = useState(false);

    const handleClick = useCallback(async () => {
      if (typeof window === 'undefined') return;
      setBusy(true);
      try {
        const res = await fetch(url, { credentials: 'same-origin', ...fetchInit });
        if (!res.ok) {
          throw new Error(`download failed: ${res.status} ${res.statusText}`);
        }
        const blob = await res.blob();
        const finalBlob = mimeType
          ? new Blob([blob as unknown as ArrayBuffer], { type: mimeType })
          : blob;
        if (onBlob) await onBlob(finalBlob);
        const objectUrl = URL.createObjectURL(finalBlob);
        const a = document.createElement('a');
        a.href = objectUrl;
        a.download = filename;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        onDownloadStart?.();
        setTimeout(() => URL.revokeObjectURL(objectUrl), 1500);
      } catch (err) {
        onError?.(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setBusy(false);
      }
    }, [url, filename, fetchInit, mimeType, onBlob, onError, onDownloadStart]);

    return (
      <TkxButton
        ref={ref}
        {...buttonProps}
        onClick={handleClick}
        isLoading={busy || buttonProps.isLoading}
      >
        {children ?? 'Download'}
      </TkxButton>
    );
  },
);

TkxSecureDownload.displayName = 'TkxSecureDownload';
