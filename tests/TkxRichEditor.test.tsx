import { describe, it, expect, vi } from 'vitest';
import { createRef } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, quantumDark } from '../src/themes';
import { TkxRichEditor, type TkxRichEditorHandle } from '../src/components/TkxRichEditor';

function W({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={quantumDark}>{children}</ThemeProvider>;
}

describe('TkxRichEditor', () => {
  it('renders toolbar with default tools', () => {
    render(<TkxRichEditor />, { wrapper: W });
    const toolbar = screen.getByRole('toolbar', { name: /Formatting/i });
    expect(toolbar).toBeInTheDocument();
    expect(screen.getByLabelText(/Bold/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Italic/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Heading 1/i)).toBeInTheDocument();
  });

  it('renders editor textbox with aria-multiline', () => {
    render(<TkxRichEditor label="My editor" />, { wrapper: W });
    const editor = screen.getByRole('textbox', { name: 'My editor' });
    expect(editor).toHaveAttribute('aria-multiline', 'true');
    expect(editor).toHaveAttribute('contenteditable', 'true');
  });

  it('shows placeholder when empty', () => {
    render(<TkxRichEditor placeholder="Type here…" />, { wrapper: W });
    expect(screen.getByText('Type here…')).toBeInTheDocument();
  });

  it('respects custom tools list', () => {
    render(<TkxRichEditor tools={['bold', 'italic']} />, { wrapper: W });
    expect(screen.getByLabelText(/Bold/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Italic/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/Heading 1/i)).not.toBeInTheDocument();
  });

  it('isDisabled prevents editing', () => {
    render(<TkxRichEditor isDisabled />, { wrapper: W });
    const editor = screen.getByRole('textbox');
    expect(editor).toHaveAttribute('contenteditable', 'false');
    expect(editor).toHaveAttribute('aria-readonly', 'true');
  });

  it('imperative API: setHTML + getHTML', () => {
    const ref = createRef<TkxRichEditorHandle>();
    render(<TkxRichEditor ref={ref} />, { wrapper: W });
    ref.current!.setHTML('<p>Hello <strong>world</strong></p>');
    const html = ref.current!.getHTML();
    expect(html).toContain('Hello');
    expect(html).toContain('<strong>world</strong>');
  });

  it('imperative API: getMarkdown converts HTML to MD', () => {
    const ref = createRef<TkxRichEditorHandle>();
    render(<TkxRichEditor ref={ref} />, { wrapper: W });
    ref.current!.setHTML('<h1>Title</h1><p>Body with <strong>bold</strong>.</p>');
    const md = ref.current!.getMarkdown();
    expect(md).toContain('# Title');
    expect(md).toContain('**bold**');
  });

  it('imperative API: getText returns plain text', () => {
    const ref = createRef<TkxRichEditorHandle>();
    render(<TkxRichEditor ref={ref} />, { wrapper: W });
    ref.current!.setHTML('<p>Hello <strong>world</strong></p>');
    expect(ref.current!.getText()).toBe('Hello world');
  });

  it('sanitises malicious HTML on setHTML', () => {
    const ref = createRef<TkxRichEditorHandle>();
    render(<TkxRichEditor ref={ref} />, { wrapper: W });
    ref.current!.setHTML('<p>safe</p><script>alert(1)</script>');
    const html = ref.current!.getHTML();
    expect(html).toContain('safe');
    expect(html).not.toContain('<script');
    expect(html).not.toContain('alert(1)');
  });

  it('strips javascript: hrefs from <a>', () => {
    const ref = createRef<TkxRichEditorHandle>();
    render(<TkxRichEditor ref={ref} />, { wrapper: W });
    ref.current!.setHTML('<a href="javascript:alert(1)">click</a>');
    const html = ref.current!.getHTML();
    expect(html).not.toContain('javascript:');
  });

  it('strips on* event handlers', () => {
    const ref = createRef<TkxRichEditorHandle>();
    render(<TkxRichEditor ref={ref} />, { wrapper: W });
    ref.current!.setHTML('<p onclick="alert(1)">hi</p>');
    const html = ref.current!.getHTML();
    expect(html).not.toContain('onclick');
  });

  it('toolbar buttons have aria-label and pressed state', () => {
    render(<TkxRichEditor />, { wrapper: W });
    const bold = screen.getByLabelText(/Bold/i);
    expect(bold).toHaveAttribute('aria-pressed');
  });

  it('bottomSlot + topSlot render', () => {
    render(
      <TkxRichEditor
        topSlot={<div data-testid="top">top</div>}
        bottomSlot={<div data-testid="bot">bot</div>}
      />,
      { wrapper: W },
    );
    expect(screen.getByTestId('top')).toBeInTheDocument();
    expect(screen.getByTestId('bot')).toBeInTheDocument();
  });

  it('arrow-key navigation between toolbar buttons', () => {
    render(<TkxRichEditor tools={['bold', 'italic', 'underline']} />, { wrapper: W });
    const bold = screen.getByLabelText(/Bold/i);
    const italic = screen.getByLabelText(/Italic/i);
    bold.focus();
    fireEvent.keyDown(bold.parentElement!, { key: 'ArrowRight' });
    expect(document.activeElement).toBe(italic);
  });

  it('initialValue gets sanitised + rendered', () => {
    const ref = createRef<TkxRichEditorHandle>();
    render(
      <TkxRichEditor ref={ref} initialValue="<p>Hi <em>there</em></p><script>x</script>" />,
      { wrapper: W },
    );
    const html = ref.current!.getHTML();
    expect(html).toContain('<em>there</em>');
    expect(html).not.toContain('script');
  });

  it('onChange fires on programmatic setHTML', () => {
    const onChange = vi.fn();
    const ref = createRef<TkxRichEditorHandle>();
    render(<TkxRichEditor ref={ref} onChange={onChange} />, { wrapper: W });
    ref.current!.setHTML('<p>changed</p>');
    expect(onChange).toHaveBeenCalled();
    expect(onChange.mock.calls.at(-1)?.[0]).toContain('changed');
  });
});
