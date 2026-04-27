import { describe, it, expect, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { TkxSEO, seoSchema } from '../src/components/TkxSEO';

describe('TkxSEO', () => {
  beforeEach(() => {
    document.querySelectorAll('[data-tkx-seo]').forEach((el) => el.remove());
    document.title = '';
  });

  it('sets document.title', () => {
    render(<TkxSEO title="Hello world" />);
    expect(document.title).toBe('Hello world');
  });

  it('writes a meta description', () => {
    render(<TkxSEO description="A description" />);
    const desc = document.querySelector('meta[name="description"][data-tkx-seo]') as HTMLMetaElement;
    expect(desc).toBeTruthy();
    expect(desc.content).toBe('A description');
  });

  it('writes Open Graph tags for og:title / og:description / og:type', () => {
    render(<TkxSEO title="T" description="D" ogType="article" />);
    expect(
      document.querySelector('meta[property="og:title"]')?.getAttribute('content'),
    ).toBe('T');
    expect(
      document.querySelector('meta[property="og:description"]')?.getAttribute('content'),
    ).toBe('D');
    expect(
      document.querySelector('meta[property="og:type"]')?.getAttribute('content'),
    ).toBe('article');
  });

  it('writes Twitter Card meta', () => {
    render(<TkxSEO title="T" image="https://example.com/x.png" />);
    expect(
      document.querySelector('meta[name="twitter:card"]')?.getAttribute('content'),
    ).toBe('summary_large_image');
    expect(
      document.querySelector('meta[name="twitter:image"]')?.getAttribute('content'),
    ).toBe('https://example.com/x.png');
  });

  it('writes canonical link', () => {
    render(<TkxSEO canonical="https://example.com/foo" />);
    const link = document.querySelector('link[rel="canonical"][data-tkx-seo]') as HTMLLinkElement;
    expect(link.href).toBe('https://example.com/foo');
  });

  it('writes JSON-LD schema', () => {
    render(<TkxSEO schema={{ '@type': 'Thing', name: 'foo' }} />);
    const script = document.querySelector('script[type="application/ld+json"][data-tkx-seo]') as HTMLScriptElement;
    expect(JSON.parse(script.text)).toEqual({ '@type': 'Thing', name: 'foo' });
  });

  it('cleans up own tags on rerender', () => {
    const { rerender } = render(<TkxSEO title="A" description="A desc" />);
    rerender(<TkxSEO title="B" description="B desc" />);
    const descs = document.querySelectorAll('meta[name="description"][data-tkx-seo]');
    expect(descs.length).toBe(1);
    expect((descs[0] as HTMLMetaElement).content).toBe('B desc');
  });

  it('removes all owned tags on unmount', () => {
    const { unmount } = render(<TkxSEO title="A" description="A desc" />);
    expect(document.querySelectorAll('[data-tkx-seo]').length).toBeGreaterThan(0);
    unmount();
    expect(document.querySelectorAll('[data-tkx-seo]').length).toBe(0);
  });

  it('schema factory: softwareApplication', () => {
    const s = seoSchema.softwareApplication({
      name: 'tekivex-ui',
      description: 'd',
      url: 'https://x',
      version: '2.9.0',
      price: '0',
    });
    expect(s).toMatchObject({
      '@type': 'SoftwareApplication',
      name: 'tekivex-ui',
      version: '2.9.0',
      offers: { price: '0' },
    });
  });

  it('schema factory: faqPage', () => {
    const s = seoSchema.faqPage([
      { question: 'Q?', answer: 'A.' },
    ]);
    expect((s as any).mainEntity).toHaveLength(1);
    expect((s as any).mainEntity[0]).toMatchObject({
      '@type': 'Question',
      name: 'Q?',
    });
  });

  it('schema factory: breadcrumbList', () => {
    const s = seoSchema.breadcrumbList([
      { name: 'Home', url: '/' },
      { name: 'Components', url: '/components' },
    ]);
    expect((s as any).itemListElement).toHaveLength(2);
    expect((s as any).itemListElement[0]).toMatchObject({ position: 1, name: 'Home' });
  });

  it('schema factory: product', () => {
    const s = seoSchema.product({
      name: 'X',
      description: 'd',
      image: 'i.png',
      brand: 'B',
      price: '99',
      currency: 'USD',
      rating: { value: 4.5, count: 12 },
    });
    expect((s as any).aggregateRating.ratingValue).toBe(4.5);
  });
});
