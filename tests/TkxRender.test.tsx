import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  TkxCanvasRenderer,
  TkxTemplateRenderer,
  createTemplateRegistry,
  useTemplateScene,
  TkxIndicShaper,
  TkxPdfExport,
  TkxImageExport,
} from '../index';
import { renderHook } from '@testing-library/react';
import type { Scene } from '../src/engine/canvas';

const sample: Scene = {
  width: 200,
  height: 100,
  background: '#ffffff',
  nodes: [
    { type: 'rect', x: 0, y: 0, width: 200, height: 30, fill: '#fbbf24' },
    { type: 'text', x: 10, y: 10, text: 'Marriage Biodata', fontSize: 14 },
  ],
};

/* -------------------------------------------------------------------------- */
/* TkxCanvasRenderer                                                            */
/* -------------------------------------------------------------------------- */

describe('TkxCanvasRenderer', () => {
  it('renders a canvas element', () => {
    const { container } = render(<TkxCanvasRenderer scene={sample} />);
    expect(container.querySelector('canvas')).toBeTruthy();
  });

  it('shows an alert when the scene fails validation', () => {
    const onError = vi.fn();
    const bad: Scene = {
      width: 0,
      height: 100,
      nodes: [],
    };
    render(<TkxCanvasRenderer scene={bad} onValidationError={onError} />);
    expect(screen.getByRole('alert')).toBeTruthy();
    expect(onError).toHaveBeenCalled();
  });
});

/* -------------------------------------------------------------------------- */
/* TkxTemplateRenderer + registry                                              */
/* -------------------------------------------------------------------------- */

describe('TkxTemplateRenderer', () => {
  const tpl = {
    id: 'tpl-test',
    label: 'Test',
    audience: 'all',
    build: () => sample,
  };

  it('createTemplateRegistry registers, gets, and lists templates', () => {
    const r = createTemplateRegistry();
    r.register(tpl);
    r.register({ ...tpl, id: 'tpl-other', audience: 'other' });
    expect(r.get('tpl-test')?.id).toBe('tpl-test');
    expect(r.list().length).toBe(2);
    expect(r.list('other').length).toBe(1);
  });

  it('useTemplateScene returns the produced scene', () => {
    const { result } = renderHook(() => useTemplateScene(tpl, {}));
    expect(result.current.width).toBe(200);
  });

  it('renders the template into DOM and tags it with template id', () => {
    const { container } = render(<TkxTemplateRenderer template={tpl} data={{}} />);
    expect(container.querySelector('[data-tkx-template="tpl-test"]')).toBeTruthy();
    expect(container.textContent).toContain('Marriage Biodata');
  });

  it('calls onScene with the produced scene', () => {
    const onScene = vi.fn();
    render(<TkxTemplateRenderer template={tpl} data={{}} onScene={onScene} />);
    expect(onScene).toHaveBeenCalled();
    expect(onScene.mock.calls[0][0].width).toBe(200);
  });

  it('respects maxWidth by scaling down', () => {
    const { container } = render(
      <TkxTemplateRenderer template={tpl} data={{}} maxWidth={100} />,
    );
    const el = container.firstChild as HTMLElement;
    // outer container width clamped
    expect(el.style.width).toBe('100px');
  });

  it('renders an alert for an invalid scene from the template', () => {
    const broken = {
      id: 'bad',
      label: 'b',
      audience: 'all',
      build: (): Scene => ({ width: 0, height: 0, nodes: [] }),
    };
    render(<TkxTemplateRenderer template={broken} data={{}} />);
    expect(screen.getByRole('alert')).toBeTruthy();
  });
});

/* -------------------------------------------------------------------------- */
/* TkxIndicShaper                                                               */
/* -------------------------------------------------------------------------- */

describe('TkxIndicShaper', () => {
  it('wraps Latin text in a single simple-mode span', () => {
    const { container } = render(<TkxIndicShaper text="Krishna Singh" />);
    const runs = container.querySelectorAll('[data-tkx-run]');
    expect(runs.length).toBe(1);
    expect(runs[0].getAttribute('data-tkx-run')).toBe('simple');
  });

  it('marks Devanagari runs with lang and complex mode', () => {
    const { container } = render(<TkxIndicShaper text="Name: कृष्ण" />);
    const complex = container.querySelector('[data-tkx-run="complex"]');
    expect(complex).toBeTruthy();
    expect(complex?.getAttribute('lang')).toBe('hi');
  });

  it('applies rtl direction for Arabic runs', () => {
    const { container } = render(<TkxIndicShaper text="Hello مرحبا" />);
    const arabic = container.querySelector('[data-tkx-script="Arabic"]') as HTMLElement;
    expect(arabic).toBeTruthy();
    expect(arabic.style.direction).toBe('rtl');
  });

  it('allows font override per script', () => {
    const { container } = render(
      <TkxIndicShaper
        text="कृष्ण"
        fonts={{ Devanagari: '"My Hindi Font", serif' }}
      />,
    );
    const dev = container.querySelector('[data-tkx-script="Devanagari"]') as HTMLElement;
    expect(dev.style.fontFamily).toContain('My Hindi Font');
  });
});

/* -------------------------------------------------------------------------- */
/* TkxPdfExport                                                                  */
/* -------------------------------------------------------------------------- */

describe('TkxPdfExport', () => {
  it('renders a button with default label', () => {
    render(<TkxPdfExport scene={sample} />);
    expect(screen.getByRole('button', { name: /Download PDF/i })).toBeTruthy();
  });

  it('hands the produced Blob to onExport instead of downloading', async () => {
    const onExport = vi.fn();
    render(<TkxPdfExport scene={sample} onExport={onExport} />);
    const btn = screen.getByRole('button');
    btn.click();
    // Wait a tick for the async flow to settle
    await new Promise((r) => setTimeout(r, 0));
    expect(onExport).toHaveBeenCalled();
    const blob = onExport.mock.calls[0][0];
    expect(blob.type).toBe('application/pdf');
    expect(blob.size).toBeGreaterThan(0);
  });

  it('accepts a custom child as the button label', () => {
    render(<TkxPdfExport scene={sample}>Save Biodata</TkxPdfExport>);
    expect(screen.getByRole('button', { name: 'Save Biodata' })).toBeTruthy();
  });
});

/* -------------------------------------------------------------------------- */
/* TkxImageExport                                                                */
/* -------------------------------------------------------------------------- */

describe('TkxImageExport', () => {
  it('renders a button with default label', () => {
    render(<TkxImageExport scene={sample} />);
    expect(screen.getByRole('button', { name: /Download Image/i })).toBeTruthy();
  });
});
