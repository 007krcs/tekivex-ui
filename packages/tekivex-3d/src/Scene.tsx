// ─────────────────────────────────────────────────────────────────────────────
// TkxScene — root WebGL canvas
//
// Sets up a theme-aware three.js renderer + scene + camera. Children render
// into the scene via the SceneContext; they get refs to add/remove their
// own three.js objects each render.
//
// Why vanilla three.js (no React-Three-Fiber):
//   - No reconciler overhead, no extra peer dep
//   - Smaller install footprint (~600KB three core vs ~750KB three+R3F)
//   - Direct three.js APIs — easier to integrate WebXR, custom shaders,
//     GPGPU, etc. later
//   - Components mount imperatively via context (similar pattern to MapboxGL,
//     deck.gl, vanilla react-leaflet)
// ─────────────────────────────────────────────────────────────────────────────

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import * as THREE from 'three';

export interface SceneContextValue {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  /** Register a per-frame callback. Returns an unsubscribe function. */
  onFrame: (cb: (delta: number, time: number) => void) => () => void;
}

const SceneContext = createContext<SceneContextValue | null>(null);

export function useScene(): SceneContextValue {
  const ctx = useContext(SceneContext);
  if (!ctx) {
    throw new Error('useScene() must be called inside a <TkxScene>');
  }
  return ctx;
}

export interface TkxSceneProps {
  children?: ReactNode;
  /** Background color or 'transparent'. Default '#0a0a0f'. */
  background?: string | 'transparent';
  /** Camera FOV in degrees. Default 50. */
  fov?: number;
  /** Initial camera position [x, y, z]. Default [0, 0, 5]. */
  cameraPosition?: [number, number, number];
  /** Enable shadow rendering. Default true. */
  shadows?: boolean;
  /** Enable antialiasing. Default true. */
  antialias?: boolean;
  /** Enable WebXR (AR + VR). Default false. Set to true to opt in. */
  xr?: boolean;
  /** Inline style for the canvas wrapper. */
  style?: CSSProperties;
  className?: string;
}

export function TkxScene({
  children,
  background = '#0a0a0f',
  fov = 50,
  cameraPosition = [0, 0, 5],
  shadows = true,
  antialias = true,
  xr = false,
  style,
  className,
}: TkxSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [ctx, setCtx] = useState<SceneContextValue | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    if (background !== 'transparent') {
      scene.background = new THREE.Color(background);
    }

    const { clientWidth: w, clientHeight: h } = container;
    const camera = new THREE.PerspectiveCamera(fov, w / h, 0.1, 1000);
    camera.position.set(...cameraPosition);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias,
      alpha: background === 'transparent',
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    if (shadows) {
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }
    if (xr) {
      renderer.xr.enabled = true;
    }
    container.appendChild(renderer.domElement);

    // Default lighting — overridden if user adds their own
    const ambient = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambient);
    const key = new THREE.DirectionalLight(0xffffff, 1.0);
    key.position.set(5, 8, 5);
    if (shadows) key.castShadow = true;
    scene.add(key);
    const rim = new THREE.DirectionalLight(0x00f5d4, 0.3);
    rim.position.set(-5, -3, -5);
    scene.add(rim);

    const callbacks = new Set<(delta: number, time: number) => void>();
    function onFrame(cb: (delta: number, time: number) => void) {
      callbacks.add(cb);
      return () => callbacks.delete(cb);
    }

    const clock = new THREE.Clock();
    function render() {
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();
      callbacks.forEach((cb) => cb(delta, time));
      renderer.render(scene, camera);
    }

    if (xr) {
      renderer.setAnimationLoop(render);
    } else {
      let raf = 0;
      const loop = () => {
        render();
        raf = requestAnimationFrame(loop);
      };
      loop();
      const cancel = () => cancelAnimationFrame(raf);
      // store on renderer so we can clean up below
      (renderer as unknown as { __tkxCancel?: () => void }).__tkxCancel = cancel;
    }

    function onResize() {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
    const ro = new ResizeObserver(onResize);
    ro.observe(container);

    setCtx({ scene, camera, renderer, onFrame });

    return () => {
      ro.disconnect();
      const cancel = (renderer as unknown as { __tkxCancel?: () => void }).__tkxCancel;
      if (cancel) cancel();
      if (xr) renderer.setAnimationLoop(null);
      callbacks.clear();
      scene.traverse((obj) => {
        if ((obj as THREE.Mesh).geometry) (obj as THREE.Mesh).geometry.dispose();
        const mat = (obj as THREE.Mesh).material;
        if (mat) {
          if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
          else (mat as THREE.Material).dispose();
        }
      });
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ width: '100%', height: '100%', position: 'relative', ...style }}
    >
      {ctx && <SceneContext.Provider value={ctx}>{children}</SceneContext.Provider>}
    </div>
  );
}
