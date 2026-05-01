import { describe, it, expect } from 'vitest';
import {
  PAGE_A4,
  PAGE_LETTER,
  buildFontShorthand,
  wrapText,
  measureBlock,
  validateScene,
  collectImageSources,
  renderScene,
  type Scene,
} from '../src/engine/canvas';

/* jsdom does not implement canvas drawing; we use an in-memory mock for the
 * subset of CanvasRenderingContext2D we exercise.
 */
function mockCtx(): CanvasRenderingContext2D {
  const calls: string[] = [];
  const ctx: Record<string, unknown> = {
    font: '',
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
    globalAlpha: 1,
    textAlign: 'left',
    textBaseline: 'alphabetic',
    save: () => calls.push('save'),
    restore: () => calls.push('restore'),
    translate: (x: number, y: number) => calls.push(`translate(${x},${y})`),
    rotate: (r: number) => calls.push(`rotate(${r})`),
    scale: () => {},
    beginPath: () => calls.push('beginPath'),
    closePath: () => calls.push('closePath'),
    moveTo: () => {},
    lineTo: () => {},
    quadraticCurveTo: () => {},
    fill: () => calls.push('fill'),
    stroke: () => calls.push('stroke'),
    fillRect: (x: number, y: number, w: number, h: number) =>
      calls.push(`fillRect(${x},${y},${w},${h})`),
    strokeRect: (x: number, y: number, w: number, h: number) =>
      calls.push(`strokeRect(${x},${y},${w},${h})`),
    clearRect: () => calls.push('clearRect'),
    fillText: (text: string) => calls.push(`fillText(${text})`),
    drawImage: () => calls.push('drawImage'),
    setLineDash: () => {},
    measureText: (s: string) => ({ width: s.length * 6 }), // 6px per char approx
    clip: () => calls.push('clip'),
  };
  // expose for assertions
  (ctx as unknown as { _calls: string[] })._calls = calls;
  return ctx as unknown as CanvasRenderingContext2D;
}

describe('engine/canvas — page presets', () => {
  it('A4 size in pt', () => {
    expect(PAGE_A4.width).toBe(595);
    expect(PAGE_A4.height).toBe(842);
  });
  it('Letter size in pt', () => {
    expect(PAGE_LETTER.width).toBe(612);
    expect(PAGE_LETTER.height).toBe(792);
  });
});

describe('engine/canvas — font shorthand', () => {
  it('builds default', () => {
    expect(buildFontShorthand({})).toContain('12px');
  });
  it('respects size and weight', () => {
    expect(buildFontShorthand({ fontSize: 18, fontWeight: 'bold' })).toContain(
      'bold 18px',
    );
  });
  it('includes italic', () => {
    expect(buildFontShorthand({ fontStyle: 'italic' })).toContain('italic');
  });
});

describe('engine/canvas — text wrapping', () => {
  it('returns single line when text fits', () => {
    const ctx = mockCtx();
    expect(wrapText(ctx, 'hello', 1000)).toEqual(['hello']);
  });

  it('wraps long text into multiple lines', () => {
    const ctx = mockCtx();
    // 6px per char * width=60 -> ~10 chars per line
    const lines = wrapText(ctx, 'one two three four five six seven', 60);
    expect(lines.length).toBeGreaterThan(1);
  });

  it('preserves manual newlines', () => {
    const ctx = mockCtx();
    const lines = wrapText(ctx, 'a\nb\nc', 1000);
    expect(lines).toEqual(['a', 'b', 'c']);
  });

  it('handles empty input', () => {
    const ctx = mockCtx();
    expect(wrapText(ctx, '', 100)).toEqual(['']);
  });

  it('keeps a long single token on its own line', () => {
    const ctx = mockCtx();
    const lines = wrapText(ctx, 'supercalifragilisticexpialidocious', 30);
    expect(lines).toHaveLength(1);
  });
});

describe('engine/canvas — measureBlock', () => {
  it('returns width and height for single line', () => {
    const ctx = mockCtx();
    const m = measureBlock(ctx, 'hello', { fontSize: 12 });
    expect(m.height).toBeCloseTo(12 * 1.2);
    expect(m.lines).toEqual(['hello']);
  });

  it('multiplies height by lines for wrapped text', () => {
    const ctx = mockCtx();
    const m = measureBlock(ctx, 'a b c d e f g h i j k l m', {
      fontSize: 10,
      maxWidth: 30,
    });
    expect(m.lines.length).toBeGreaterThan(1);
    expect(m.height).toBeGreaterThan(12);
  });
});

describe('engine/canvas — scene validation', () => {
  it('passes a valid scene', () => {
    const scene: Scene = {
      width: 595,
      height: 842,
      nodes: [
        { type: 'rect', x: 10, y: 10, width: 100, height: 50, fill: '#fff' },
        { type: 'text', x: 20, y: 30, text: 'Hello' },
        { type: 'line', x: 0, y: 0, x2: 100, y2: 100 },
        {
          type: 'group',
          x: 0,
          y: 0,
          children: [{ type: 'text', x: 5, y: 5, text: 'inside' }],
        },
      ],
    };
    expect(validateScene(scene)).toEqual([]);
  });

  it('flags non-finite numbers', () => {
    const scene: Scene = {
      width: 595,
      height: 842,
      nodes: [{ type: 'rect', x: NaN, y: 0, width: 10, height: 10 }],
    };
    const issues = validateScene(scene);
    expect(issues.some((i) => i.path === 'nodes[0].x')).toBe(true);
  });

  it('flags missing image src', () => {
    const scene = {
      width: 595,
      height: 842,
      nodes: [{ type: 'image', x: 0, y: 0, width: 10, height: 10, src: '' }],
    } as unknown as Scene;
    const issues = validateScene(scene);
    expect(issues.some((i) => i.path === 'nodes[0].src')).toBe(true);
  });

  it('flags zero/negative page dimensions', () => {
    const scene: Scene = { width: 0, height: -1, nodes: [] };
    const issues = validateScene(scene);
    expect(issues.find((i) => i.path === 'width')).toBeDefined();
    expect(issues.find((i) => i.path === 'height')).toBeDefined();
  });
});

describe('engine/canvas — collectImageSources', () => {
  it('returns unique string srcs', () => {
    const scene: Scene = {
      width: 100,
      height: 100,
      nodes: [
        { type: 'image', x: 0, y: 0, width: 10, height: 10, src: 'a.png' },
        {
          type: 'group',
          x: 0,
          y: 0,
          children: [
            { type: 'image', x: 0, y: 0, width: 10, height: 10, src: 'b.png' },
            { type: 'image', x: 0, y: 0, width: 10, height: 10, src: 'a.png' },
          ],
        },
      ],
    };
    expect(collectImageSources(scene).sort()).toEqual(['a.png', 'b.png']);
  });
});

describe('engine/canvas — renderScene (mock ctx)', () => {
  it('paints background and draws nodes', () => {
    const ctx = mockCtx();
    const calls = (ctx as unknown as { _calls: string[] })._calls;
    const scene: Scene = {
      width: 100,
      height: 100,
      background: '#ffffff',
      nodes: [
        { type: 'rect', x: 0, y: 0, width: 50, height: 50, fill: '#abcdef' },
        { type: 'text', x: 10, y: 20, text: 'Shubh' },
        { type: 'line', x: 0, y: 60, x2: 100, y2: 60, stroke: '#000' },
      ],
    };
    renderScene(ctx, scene);
    expect(calls).toContain('fillRect(0,0,100,100)'); // background fill
    expect(calls).toContain('fillRect(0,0,50,50)'); // rect
    expect(calls.some((c) => c.startsWith('fillText(Shubh'))).toBe(true);
    expect(calls).toContain('stroke'); // line stroke
  });

  it('handles groups and nested transforms', () => {
    const ctx = mockCtx();
    const calls = (ctx as unknown as { _calls: string[] })._calls;
    const scene: Scene = {
      width: 100,
      height: 100,
      nodes: [
        {
          type: 'group',
          x: 5,
          y: 5,
          children: [{ type: 'rect', x: 0, y: 0, width: 10, height: 10, fill: '#000' }],
        },
      ],
    };
    renderScene(ctx, scene);
    expect(calls).toContain('translate(5,5)');
  });

  it('supports rotation on text node', () => {
    const ctx = mockCtx();
    const calls = (ctx as unknown as { _calls: string[] })._calls;
    const scene: Scene = {
      width: 100,
      height: 100,
      nodes: [{ type: 'text', x: 50, y: 50, text: 'rotate me', rotate: 45 }],
    };
    renderScene(ctx, scene);
    expect(calls.some((c) => c.startsWith('rotate'))).toBe(true);
  });
});
