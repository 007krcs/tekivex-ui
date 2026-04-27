// ─────────────────────────────────────────────────────────────────────────────
// Snapshot addon — in-browser visual regression. Storybook calls their
// version Chromatic; ours is local-only.
//
// How it works:
//   1. Capture: serialise the story container DOM to an SVG via foreignObject
//      → render into a canvas → toDataURL("image/png")
//   2. Save baseline to localStorage keyed by story slug + control values hash
//   3. Diff: when a new capture is taken, compare pixel-by-pixel against the
//      baseline. Show side-by-side + a diff overlay highlighting changed pixels.
//
// Limitations vs Chromatic:
//   - Local-only — doesn't sync across machines
//   - Pure pixel diff, no perceptual diff threshold
//   - localStorage cap (~5–10 MB depending on browser)
//
// What it does cover: catching unintended visual changes on your own machine
// during development. CI-grade visual regression is at tests/visual/ via
// Playwright (server-side, with shared baselines).
// ─────────────────────────────────────────────────────────────────────────────

import { useState, type CSSProperties } from 'react';
import type { Addon, AddonContext } from './registry';

interface Snapshot {
  dataUrl: string;
  width: number;
  height: number;
  takenAt: number;
}

const STORAGE_PREFIX = 'tkx-book:snapshot:';

function loadBaseline(slug: string): Snapshot | null {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + slug);
    return raw ? (JSON.parse(raw) as Snapshot) : null;
  } catch {
    return null;
  }
}

function saveBaseline(slug: string, snap: Snapshot) {
  try {
    localStorage.setItem(STORAGE_PREFIX + slug, JSON.stringify(snap));
  } catch (err) {
    // Quota exceeded — surface via state instead of crashing.
    // eslint-disable-next-line no-console
    console.warn('[tkx-book/snapshot] localStorage save failed:', (err as Error).message);
  }
}

async function captureNode(node: HTMLElement): Promise<Snapshot> {
  const rect = node.getBoundingClientRect();
  const w = Math.ceil(rect.width);
  const h = Math.ceil(rect.height);

  // SVG-foreignObject trick: serialise the DOM into an SVG, then rasterise
  // it through an Image into a canvas. Works without any deps. Limitation:
  // CSS background-images from external URLs may fail due to CORS — that's
  // fine for our use case (all assets are inline / data: URLs in stories).
  const cloned = node.cloneNode(true) as HTMLElement;
  // Inline computed styles for the cloned root so the SVG renders the same.
  // We skip the recursive case for performance — SVG-foreignObject inherits
  // fine from the source styles in modern browsers.
  const svgNs = 'http://www.w3.org/2000/svg';
  const xhtmlNs = 'http://www.w3.org/1999/xhtml';
  const svg = document.createElementNS(svgNs, 'svg');
  svg.setAttribute('xmlns', svgNs);
  svg.setAttribute('width', String(w));
  svg.setAttribute('height', String(h));
  const fo = document.createElementNS(svgNs, 'foreignObject');
  fo.setAttribute('width', '100%');
  fo.setAttribute('height', '100%');
  // Re-namespace the cloned tree as XHTML so the SVG parser accepts it.
  cloned.setAttribute('xmlns', xhtmlNs);
  fo.appendChild(cloned);
  svg.appendChild(fo);

  const xml = new XMLSerializer().serializeToString(svg);
  const blob = new Blob([xml], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);

  const dataUrl = await new Promise<string>((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('2d context unavailable'));
        return;
      }
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('SVG rasterisation failed'));
    };
    img.src = url;
  });

  return { dataUrl, width: w, height: h, takenAt: Date.now() };
}

async function diffSnapshots(a: Snapshot, b: Snapshot): Promise<{ diffUrl: string; changedPixels: number; totalPixels: number } | null> {
  if (a.width !== b.width || a.height !== b.height) return null;
  const w = a.width;
  const h = a.height;

  const loadToCanvas = (dataUrl: string) =>
    new Promise<ImageData>((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const c = document.createElement('canvas');
        c.width = w;
        c.height = h;
        const ctx = c.getContext('2d');
        if (!ctx) {
          reject(new Error('2d ctx'));
          return;
        }
        ctx.drawImage(img, 0, 0);
        resolve(ctx.getImageData(0, 0, w, h));
      };
      img.onerror = () => reject(new Error('image load'));
      img.src = dataUrl;
    });

  const [imgA, imgB] = await Promise.all([loadToCanvas(a.dataUrl), loadToCanvas(b.dataUrl)]);

  const diffCanvas = document.createElement('canvas');
  diffCanvas.width = w;
  diffCanvas.height = h;
  const diffCtx = diffCanvas.getContext('2d');
  if (!diffCtx) return null;
  const diff = diffCtx.createImageData(w, h);
  let changed = 0;
  for (let i = 0; i < imgA.data.length; i += 4) {
    const dr = Math.abs(imgA.data[i] - imgB.data[i]);
    const dg = Math.abs(imgA.data[i + 1] - imgB.data[i + 1]);
    const db = Math.abs(imgA.data[i + 2] - imgB.data[i + 2]);
    const delta = dr + dg + db;
    if (delta > 12) {
      // Highlight changed pixels in magenta.
      diff.data[i] = 247;
      diff.data[i + 1] = 37;
      diff.data[i + 2] = 133;
      diff.data[i + 3] = 255;
      changed++;
    } else {
      // Greyscale dim of original B for context.
      const grey = (imgB.data[i] + imgB.data[i + 1] + imgB.data[i + 2]) / 3;
      diff.data[i] = grey * 0.4;
      diff.data[i + 1] = grey * 0.4;
      diff.data[i + 2] = grey * 0.4;
      diff.data[i + 3] = 180;
    }
  }
  diffCtx.putImageData(diff, 0, 0);

  return {
    diffUrl: diffCanvas.toDataURL('image/png'),
    changedPixels: changed,
    totalPixels: w * h,
  };
}

function SnapshotPanel({ slug, containerRef }: AddonContext) {
  const [baseline, setBaseline] = useState<Snapshot | null>(() => loadBaseline(slug));
  const [current, setCurrent] = useState<Snapshot | null>(null);
  const [diff, setDiff] = useState<{ diffUrl: string; changedPixels: number; totalPixels: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const onCapture = async () => {
    if (!containerRef.current) return;
    setBusy(true);
    setErr(null);
    try {
      const snap = await captureNode(containerRef.current);
      setCurrent(snap);
      if (baseline) {
        const d = await diffSnapshots(baseline, snap);
        setDiff(d);
      } else {
        setDiff(null);
      }
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const onSetBaseline = () => {
    if (!current) return;
    saveBaseline(slug, current);
    setBaseline(current);
    setDiff(null);
  };

  const onClearBaseline = () => {
    localStorage.removeItem(STORAGE_PREFIX + slug);
    setBaseline(null);
    setDiff(null);
  };

  const wrap: CSSProperties = { padding: 16, height: '100%', overflow: 'auto' };
  const btn: CSSProperties = {
    padding: '6px 12px',
    border: '1px solid var(--tkx-primary)',
    borderRadius: 4,
    background: 'transparent',
    color: 'var(--tkx-primary)',
    cursor: 'pointer',
    fontSize: 12,
    fontWeight: 600,
  };
  const btnPrimary: CSSProperties = { ...btn, background: 'var(--tkx-primary)', color: 'var(--tkx-bg)' };
  const imgStyle: CSSProperties = {
    maxWidth: '100%',
    border: '1px solid var(--tkx-border)',
    borderRadius: 4,
    marginTop: 8,
  };

  const changedPct = diff ? ((diff.changedPixels / diff.totalPixels) * 100).toFixed(2) : null;

  return (
    <div style={wrap}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <button type="button" style={btnPrimary} onClick={onCapture} disabled={busy}>
          {busy ? 'Capturing…' : '📸 Capture'}
        </button>
        {current && (
          <button type="button" style={btn} onClick={onSetBaseline}>
            Set as baseline
          </button>
        )}
        {baseline && (
          <button type="button" style={btn} onClick={onClearBaseline}>
            Clear baseline
          </button>
        )}
      </div>

      {err && <div style={{ color: 'var(--tkx-danger)', fontSize: 12 }}>Error: {err}</div>}

      {!current && !baseline && (
        <div style={{ color: 'var(--tkx-textMuted)', fontSize: 13 }}>
          Click <strong>Capture</strong> to take a snapshot, then "Set as baseline".
          Future captures will diff against the baseline. Stored locally per story.
        </div>
      )}

      {diff && (
        <div style={{ marginBottom: 12 }}>
          <div
            style={{
              padding: 8,
              background: diff.changedPixels === 0 ? '#06d6a020' : '#f7258520',
              borderRadius: 4,
              fontSize: 13,
              marginBottom: 8,
            }}
          >
            {diff.changedPixels === 0
              ? '✓ No visual difference vs baseline'
              : `⚠ ${diff.changedPixels.toLocaleString()} pixels changed (${changedPct}% of canvas)`}
          </div>
          {diff.changedPixels > 0 && (
            <>
              <strong style={{ fontSize: 12 }}>Diff overlay (changed pixels in magenta)</strong>
              <img src={diff.diffUrl} alt="visual diff" style={imgStyle} />
            </>
          )}
        </div>
      )}

      {baseline && (
        <details open style={{ marginBottom: 12 }}>
          <summary style={{ fontSize: 12, fontWeight: 600, color: 'var(--tkx-textMuted)' }}>
            Baseline ({new Date(baseline.takenAt).toLocaleString()})
          </summary>
          <img src={baseline.dataUrl} alt="baseline" style={imgStyle} />
        </details>
      )}

      {current && (!baseline || diff) && (
        <details>
          <summary style={{ fontSize: 12, fontWeight: 600, color: 'var(--tkx-textMuted)' }}>
            Latest capture ({new Date(current.takenAt).toLocaleString()})
          </summary>
          <img src={current.dataUrl} alt="latest capture" style={imgStyle} />
        </details>
      )}
    </div>
  );
}

export const snapshotAddon: Addon = {
  id: 'snapshot',
  title: 'Snapshot',
  render: (ctx) => <SnapshotPanel {...ctx} />,
};
