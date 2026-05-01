'use client';

import {
  useMemo,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { validateScene, type Scene, type SceneNode } from '../engine/canvas';

/**
 * A Template is the producer of a Scene from biodata data. Templates are
 * registered into a registry and selected by id at render time. They are pure
 * functions of (data, options) → Scene so the same data can drive any
 * registered design without changing the rest of the pipeline.
 */
export type TkxBiodataTemplate<TData = unknown> = {
  id: string;
  /** Human-readable label shown in template pickers. */
  label: string;
  /** Religion or audience tag — used by the gallery filter. */
  audience: string;
  /** Pure scene producer. */
  build: (data: TData, options?: { language?: string }) => Scene;
};

export interface TkxTemplateRegistry {
  register<TData>(template: TkxBiodataTemplate<TData>): void;
  get(id: string): TkxBiodataTemplate | undefined;
  list(audience?: string): ReadonlyArray<TkxBiodataTemplate>;
}

export function createTemplateRegistry(): TkxTemplateRegistry {
  const map = new Map<string, TkxBiodataTemplate>();
  return {
    register(template) {
      map.set(template.id, template as TkxBiodataTemplate);
    },
    get(id) {
      return map.get(id);
    },
    list(audience) {
      const all = [...map.values()];
      return audience ? all.filter((t) => t.audience === audience) : all;
    },
  };
}

export interface TkxTemplateRendererProps<TData = unknown> {
  template: TkxBiodataTemplate<TData>;
  data: TData;
  language?: string;
  /** When true, render via DOM nodes instead of computing a Scene-only output.
   *  Defaults to true (for the on-screen preview). When false, the renderer
   *  returns null and the caller is expected to use scene from useTemplateScene. */
  domPreview?: boolean;
  /** Optional max-width applied to the rendered preview container. */
  maxWidth?: number;
  className?: string;
  style?: CSSProperties;
  /** Called after each successful render with the produced scene. Useful so the
   *  host can pipe the scene into TkxPdfExport / TkxImageExport without rebuilding. */
  onScene?: (scene: Scene) => void;
}

/** Hook form: get the Scene for a given template + data without rendering. */
export function useTemplateScene<TData>(
  template: TkxBiodataTemplate<TData>,
  data: TData,
  language?: string,
): Scene {
  return useMemo(
    () => template.build(data, { language }),
    [template, data, language],
  );
}

/**
 * Renders a Scene to absolutely-positioned DOM nodes — fast for live editing.
 * Pixel-equivalence with the PDF / canvas output is guaranteed by the
 * coordinate system; the same scene drives all three.
 */
export function TkxTemplateRenderer<TData>({
  template,
  data,
  language,
  domPreview = true,
  maxWidth,
  className,
  style,
  onScene,
}: TkxTemplateRendererProps<TData>) {
  const scene = useTemplateScene(template, data, language);
  const issues = useMemo(() => validateScene(scene), [scene]);

  // Surface the scene to the parent (used by the page to feed PDF/image export).
  if (onScene && issues.length === 0) onScene(scene);

  if (!domPreview) return null;
  if (issues.length > 0) {
    return (
      <div role="alert" style={{ color: 'crimson', fontFamily: 'sans-serif' }}>
        Invalid scene: {issues[0].path} {issues[0].message}
      </div>
    );
  }

  const scale = maxWidth && maxWidth < scene.width ? maxWidth / scene.width : 1;

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        width: scene.width * scale,
        height: scene.height * scale,
        background: scene.background ?? '#fff',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)',
        ...style,
      }}
      data-tkx-template={template.id}
    >
      <div
        style={{
          width: scene.width,
          height: scene.height,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
      >
        {scene.nodes.map((n, i) => (
          <RenderNode key={i} node={n} />
        ))}
      </div>
    </div>
  );
}

TkxTemplateRenderer.displayName = 'TkxTemplateRenderer';

function RenderNode({ node }: { node: SceneNode }): ReactNode {
  switch (node.type) {
    case 'rect':
      return (
        <div
          style={{
            position: 'absolute',
            left: node.x,
            top: node.y,
            width: node.width,
            height: node.height,
            background: node.fill,
            border: node.stroke
              ? `${node.strokeWidth ?? 1}px solid ${node.stroke}`
              : undefined,
            borderRadius: node.radius ?? 0,
            opacity: node.opacity,
            transform: node.rotate ? `rotate(${node.rotate}deg)` : undefined,
            transformOrigin: 'top left',
          }}
        />
      );
    case 'line':
      return (
        <svg
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            overflow: 'visible',
          }}
        >
          <line
            x1={node.x}
            y1={node.y}
            x2={node.x2}
            y2={node.y2}
            stroke={node.stroke ?? '#000'}
            strokeWidth={node.strokeWidth ?? 1}
            strokeDasharray={node.dash?.join(' ')}
          />
        </svg>
      );
    case 'text': {
      const textStyle: CSSProperties = {
        position: 'absolute',
        left: node.x,
        top: node.y,
        color: node.fill,
        fontSize: node.fontSize ?? 12,
        fontFamily: node.fontFamily ?? 'inherit',
        fontWeight: node.fontWeight,
        fontStyle: node.fontStyle,
        textAlign: node.align,
        maxWidth: node.maxWidth,
        whiteSpace: node.maxWidth ? 'normal' : 'pre',
        lineHeight: node.lineHeight,
        letterSpacing: node.letterSpacing,
        opacity: node.opacity,
        transform: node.rotate ? `rotate(${node.rotate}deg)` : undefined,
        transformOrigin: 'top left',
      };
      return <span style={textStyle}>{node.text}</span>;
    }
    case 'image':
      return (
        <img
          src={typeof node.src === 'string' ? node.src : ''}
          alt=""
          style={{
            position: 'absolute',
            left: node.x,
            top: node.y,
            width: node.width,
            height: node.height,
            objectFit:
              node.fit === 'contain' ? 'contain' : node.fit === 'fill' ? 'fill' : 'cover',
            borderRadius: node.radius ?? 0,
            opacity: node.opacity,
            transform: node.rotate ? `rotate(${node.rotate}deg)` : undefined,
            transformOrigin: 'top left',
          }}
        />
      );
    case 'group':
      return (
        <div
          style={{
            position: 'absolute',
            left: node.x,
            top: node.y,
            opacity: node.opacity,
            transform: node.rotate ? `rotate(${node.rotate}deg)` : undefined,
            transformOrigin: 'top left',
          }}
        >
          {node.children.map((c, i) => (
            <RenderNode key={i} node={c} />
          ))}
        </div>
      );
  }
}
