'use client';

import {
  forwardRef,
  useCallback,
  useState,
  type ReactNode,
} from 'react';
import { TkxButton, type TkxButtonProps } from './TkxButton';
import { renderToBlob, type Scene } from '../engine/canvas';

export interface TkxImageExportProps
  extends Omit<TkxButtonProps, 'onClick' | 'children'> {
  scene: Scene;
  /** Filename presented to the browser save dialog. */
  filename?: string;
  /** Output format. Default image/png. */
  mimeType?: 'image/png' | 'image/jpeg' | 'image/webp';
  /** JPEG / WebP quality (0..1). Default 0.92. */
  quality?: number;
  /** Render multiplier; 2 = 2x DPI. Default 2. */
  scale?: number;
  /** Called instead of triggering the download. */
  onExport?: (blob: Blob) => void | Promise<void>;
  children?: ReactNode;
}

/**
 * One-click image export button. Renders the scene to a canvas at the chosen
 * scale and exports as PNG / JPEG / WebP. Used for the WhatsApp-share flow
 * after payment.
 */
export const TkxImageExport = forwardRef<HTMLButtonElement, TkxImageExportProps>(
  function TkxImageExport(
    {
      scene,
      filename = 'biodata.png',
      mimeType = 'image/png',
      quality = 0.92,
      scale = 2,
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
        const blob = await renderToBlob(scene, { mimeType, quality, scale });
        if (onExport) {
          await onExport(blob);
        } else if (typeof document !== 'undefined') {
          triggerDownload(blob, filename);
        }
      } finally {
        setBusy(false);
      }
    }, [scene, mimeType, quality, scale, onExport, filename]);

    return (
      <TkxButton
        ref={ref}
        {...buttonProps}
        onClick={handleClick}
        isLoading={busy || buttonProps.isLoading}
      >
        {children ?? 'Download Image'}
      </TkxButton>
    );
  },
);

TkxImageExport.displayName = 'TkxImageExport';

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
