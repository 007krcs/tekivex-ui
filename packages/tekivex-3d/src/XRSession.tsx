// ─────────────────────────────────────────────────────────────────────────────
// TkxXRSession — WebXR enable + AR / VR entry buttons
//
// Drop inside a <TkxScene xr> to render entry buttons. Detects feature
// support per-device and only shows the ones that work:
//   - Quest 3 / Vision Pro: VR button works, AR button works (passthrough)
//   - Pixel / Galaxy with ARCore: AR button works
//   - Desktop Chrome: neither (gracefully hides)
//
// Once entered, the renderer's XR session takes over the animation loop —
// content from <TkxScene> renders inside the headset.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState, type CSSProperties } from 'react';
import { useScene } from './Scene';

export interface TkxXRSessionProps {
  /** Show VR button if supported. Default true. */
  vr?: boolean;
  /** Show AR button if supported. Default true. */
  ar?: boolean;
  /** Required AR features. Default ['hit-test']. */
  arFeatures?: string[];
  /** Required VR features. Default []. */
  vrFeatures?: string[];
  /** Button container style. */
  style?: CSSProperties;
  /** Called when user enters an XR session. */
  onSessionStart?: (mode: 'vr' | 'ar') => void;
  /** Called when XR session ends. */
  onSessionEnd?: () => void;
}

interface SupportState {
  vrSupported: boolean;
  arSupported: boolean;
  inSession: 'vr' | 'ar' | null;
}

export function TkxXRSession({
  vr = true,
  ar = true,
  arFeatures = ['hit-test'],
  vrFeatures = [],
  style,
  onSessionStart,
  onSessionEnd,
}: TkxXRSessionProps) {
  const { renderer } = useScene();
  const [state, setState] = useState<SupportState>({
    vrSupported: false,
    arSupported: false,
    inSession: null,
  });

  useEffect(() => {
    if (typeof navigator === 'undefined' || !('xr' in navigator)) return;
    const xr = (navigator as Navigator & { xr?: XRSystem }).xr;
    if (!xr) return;

    let cancelled = false;

    Promise.all([
      vr ? xr.isSessionSupported('immersive-vr').catch(() => false) : Promise.resolve(false),
      ar ? xr.isSessionSupported('immersive-ar').catch(() => false) : Promise.resolve(false),
    ]).then(([vrOk, arOk]) => {
      if (cancelled) return;
      setState((s) => ({ ...s, vrSupported: vrOk, arSupported: arOk }));
    });

    return () => {
      cancelled = true;
    };
  }, [vr, ar]);

  async function startSession(mode: 'vr' | 'ar') {
    const xr = (navigator as Navigator & { xr?: XRSystem }).xr;
    if (!xr) return;
    try {
      const sessionInit =
        mode === 'ar'
          ? { requiredFeatures: arFeatures }
          : vrFeatures.length
            ? { requiredFeatures: vrFeatures }
            : undefined;
      const session = await xr.requestSession(
        mode === 'ar' ? 'immersive-ar' : 'immersive-vr',
        sessionInit,
      );
      await renderer.xr.setSession(session as unknown as XRSession);
      setState((s) => ({ ...s, inSession: mode }));
      onSessionStart?.(mode);
      session.addEventListener('end', () => {
        setState((s) => ({ ...s, inSession: null }));
        onSessionEnd?.();
      });
    } catch (err) {
      console.warn(`tekivex-3d: failed to start ${mode.toUpperCase()} session`, err);
    }
  }

  if (!state.vrSupported && !state.arSupported) return null;

  const containerStyle: CSSProperties = {
    position: 'absolute',
    bottom: 16,
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    gap: 12,
    zIndex: 10,
    ...style,
  };

  const btnStyle: CSSProperties = {
    background: 'rgba(0, 245, 212, 0.15)',
    border: '1px solid rgba(0, 245, 212, 0.5)',
    color: '#00f5d4',
    padding: '12px 24px',
    fontSize: 14,
    fontWeight: 700,
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    borderRadius: 999,
    cursor: 'pointer',
    backdropFilter: 'blur(12px)',
    minHeight: 44,
    minWidth: 100,
  };

  return (
    <div style={containerStyle}>
      {state.vrSupported && vr && (
        <button
          type="button"
          onClick={() => startSession('vr')}
          disabled={state.inSession !== null}
          style={btnStyle}
          aria-label="Enter Virtual Reality"
        >
          {state.inSession === 'vr' ? '◉ In VR' : 'Enter VR'}
        </button>
      )}
      {state.arSupported && ar && (
        <button
          type="button"
          onClick={() => startSession('ar')}
          disabled={state.inSession !== null}
          style={btnStyle}
          aria-label="Enter Augmented Reality"
        >
          {state.inSession === 'ar' ? '◉ In AR' : 'Enter AR'}
        </button>
      )}
    </div>
  );
}
