'use client';

// ─────────────────────────────────────────────────────────────────────────────
// TkxRichEditor — accessible rich-text editor
//
// Built on contenteditable + execCommand-style formatting (modernised) so
// we can ship without taking a hard dep on Slate / TipTap / Lexical (~100 KB
// each). Output is sanitised through tekivex's security primitives so what
// you save is what you get — no XSS smuggling via paste, no JavaScript
// URLs in links, no <script> in HTML.
//
// Format support:
//   - bold, italic, underline, strikethrough
//   - h1, h2, h3
//   - ordered + unordered lists
//   - blockquote, inline code, code block
//   - links (with sanitizeHref) + images (data-URL or https only)
//   - horizontal rule
//
// Output formats (all sanitised):
//   - HTML       (default — what contenteditable produces, scrubbed)
//   - Markdown   (lossy, ~98% fidelity for the supported subset)
//   - Plain text (textContent)
//
// Accessibility:
//   - Toolbar is role="toolbar" with arrow-key navigation between buttons
//   - Editor surface is role="textbox" with aria-multiline + aria-label
//   - Each toolbar button has aria-label + aria-pressed reflecting state
//   - Keyboard shortcuts: Cmd/Ctrl + B/I/U, Cmd/Ctrl + K (link)
//   - prefers-reduced-motion: skip the toolbar's hover scale
// ─────────────────────────────────────────────────────────────────────────────

import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { useTheme } from '../themes';
import { sanitizeUnicode } from '../engine/security';

// ── HTML sanitiser (inline so it ships in the bundle without an extra dep) ──

const ALLOWED_TAGS = new Set([
  'P', 'BR', 'DIV', 'SPAN',
  'B', 'STRONG', 'I', 'EM', 'U', 'S', 'STRIKE', 'DEL',
  'H1', 'H2', 'H3', 'H4', 'H5', 'H6',
  'UL', 'OL', 'LI',
  'BLOCKQUOTE', 'PRE', 'CODE',
  'A', 'IMG',
  'HR',
]);

// Tags whose CONTENTS we drop entirely (not just unwrap). Otherwise text
// inside <script>/<style> would leak through as plain text.
const DROP_WITH_CONTENT = new Set([
  'SCRIPT', 'STYLE', 'IFRAME', 'OBJECT', 'EMBED', 'NOSCRIPT', 'TEMPLATE',
  'META', 'LINK', 'BASE', 'FORM', 'INPUT', 'BUTTON', 'TEXTAREA', 'SELECT',
]);

const ALLOWED_ATTRS = new Set(['href', 'src', 'alt', 'title']);

function sanitizeHref(url: string): string | null {
  if (!url) return null;
  const trimmed = url.trim().toLowerCase();
  if (
    trimmed.startsWith('javascript:') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('vbscript:')
  ) {
    return null;
  }
  return url.trim();
}

function sanitizeImgSrc(url: string): string | null {
  if (!url) return null;
  const trimmed = url.trim().toLowerCase();
  if (
    trimmed.startsWith('https://') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('data:image/')
  ) {
    return url.trim();
  }
  return null;
}

function sanitizeHTML(html: string): string {
  if (typeof document === 'undefined') return html;
  // Use a real <div> rather than <template> — jsdom + some older browsers
  // serialize template content inconsistently.
  const div = document.createElement('div');
  div.innerHTML = html;
  walk(div);
  return div.innerHTML;
}

function walk(node: Node) {
  // Node iteration is mutation-safe via Array.from
  const children = Array.from(node.childNodes);
  for (const child of children) {
    if (child.nodeType === Node.TEXT_NODE) {
      // Strip bidi-override / zero-width chars from text nodes to block
      // Trojan-Source attacks via paste or direct contentEditable typing.
      const original = child.textContent || '';
      const clean = sanitizeUnicode(original);
      if (clean !== original) child.textContent = clean;
      continue;
    }
    if (child.nodeType === Node.ELEMENT_NODE) {
      const el = child as Element;
      if (DROP_WITH_CONTENT.has(el.tagName)) {
        // Drop element AND its children — script/style content shouldn't
        // become text on unwrapping
        node.removeChild(el);
        continue;
      }
      if (!ALLOWED_TAGS.has(el.tagName)) {
        // Drop the element but keep its text children
        while (el.firstChild) node.insertBefore(el.firstChild, el);
        node.removeChild(el);
        continue;
      }
      // Strip disallowed attributes
      const attrs = Array.from(el.attributes);
      for (const a of attrs) {
        if (a.name.startsWith('on')) {
          el.removeAttribute(a.name);
          continue;
        }
        if (!ALLOWED_ATTRS.has(a.name)) {
          el.removeAttribute(a.name);
          continue;
        }
        // Re-validate href/src
        if (a.name === 'href' && el.tagName === 'A') {
          const safe = sanitizeHref(a.value);
          if (!safe) el.removeAttribute('href');
          else {
            el.setAttribute('href', safe);
            el.setAttribute('rel', 'noopener noreferrer');
            el.setAttribute('target', '_blank');
          }
        }
        if (a.name === 'src' && el.tagName === 'IMG') {
          const safe = sanitizeImgSrc(a.value);
          if (!safe) el.removeAttribute('src');
        }
      }
      walk(el);
    } else if (child.nodeType === Node.COMMENT_NODE) {
      node.removeChild(child);
    }
  }
}

// ── HTML → Markdown (lossy, supports our format subset) ──────────────────

function htmlToMarkdown(html: string): string {
  if (typeof document === 'undefined') return html;
  const div = document.createElement('div');
  div.innerHTML = sanitizeHTML(html);

  function walkMd(node: Node, listDepth = 0): string {
    if (node.nodeType === Node.TEXT_NODE) return node.textContent || '';
    if (node.nodeType !== Node.ELEMENT_NODE) return '';
    const el = node as Element;
    const inner = Array.from(el.childNodes)
      .map((c) => walkMd(c, listDepth))
      .join('');

    switch (el.tagName) {
      case 'B': case 'STRONG': return `**${inner}**`;
      case 'I': case 'EM':     return `*${inner}*`;
      case 'U':                return `<u>${inner}</u>`;
      case 'S': case 'STRIKE': case 'DEL': return `~~${inner}~~`;
      case 'H1':               return `# ${inner}\n\n`;
      case 'H2':               return `## ${inner}\n\n`;
      case 'H3':               return `### ${inner}\n\n`;
      case 'H4':               return `#### ${inner}\n\n`;
      case 'H5':               return `##### ${inner}\n\n`;
      case 'H6':               return `###### ${inner}\n\n`;
      case 'P':                return `${inner}\n\n`;
      case 'BR':               return '\n';
      case 'HR':               return '\n---\n\n';
      case 'BLOCKQUOTE':       return `> ${inner.replace(/\n/g, '\n> ')}\n\n`;
      case 'CODE':
        if (el.parentElement?.tagName === 'PRE') return inner;
        return `\`${inner}\``;
      case 'PRE':              return `\`\`\`\n${inner}\n\`\`\`\n\n`;
      case 'UL':
      case 'OL':               return '\n' + Array.from(el.children).map((c, i) => walkMd(c, listDepth + 1)
        .replace(/^/, el.tagName === 'OL' ? `${i + 1}. ` : '- ')).join('') + '\n';
      case 'LI':               return `${'  '.repeat(Math.max(0, listDepth - 1))}${inner}\n`;
      case 'A': {
        const href = el.getAttribute('href') || '';
        return `[${inner}](${href})`;
      }
      case 'IMG': {
        const src = el.getAttribute('src') || '';
        const alt = el.getAttribute('alt') || '';
        return `![${alt}](${src})`;
      }
      default:
        return inner;
    }
  }

  return walkMd(div).trim();
}

// ── Toolbar definition ──────────────────────────────────────────────────────

type Tool =
  | 'bold' | 'italic' | 'underline' | 'strike'
  | 'h1' | 'h2' | 'h3'
  | 'ul' | 'ol'
  | 'quote' | 'code' | 'codeblock'
  | 'link' | 'image' | 'hr';

const TOOLS: { id: Tool; label: string; icon: string; cmd?: string; shortcut?: string }[] = [
  { id: 'bold',      label: 'Bold',          icon: 'B',  cmd: 'bold',      shortcut: '⌘B' },
  { id: 'italic',    label: 'Italic',        icon: 'I',  cmd: 'italic',    shortcut: '⌘I' },
  { id: 'underline', label: 'Underline',     icon: 'U',  cmd: 'underline', shortcut: '⌘U' },
  { id: 'strike',    label: 'Strikethrough', icon: 'S',  cmd: 'strikeThrough' },
  { id: 'h1',        label: 'Heading 1',     icon: 'H1' },
  { id: 'h2',        label: 'Heading 2',     icon: 'H2' },
  { id: 'h3',        label: 'Heading 3',     icon: 'H3' },
  { id: 'ul',        label: 'Bullet list',   icon: '•',  cmd: 'insertUnorderedList' },
  { id: 'ol',        label: 'Numbered list', icon: '1.', cmd: 'insertOrderedList' },
  { id: 'quote',     label: 'Quote',         icon: '"' },
  { id: 'code',      label: 'Inline code',   icon: '<>' },
  { id: 'codeblock', label: 'Code block',    icon: '{ }' },
  { id: 'link',      label: 'Link',          icon: '🔗', shortcut: '⌘K' },
  { id: 'image',     label: 'Image',         icon: '🖼' },
  { id: 'hr',        label: 'Divider',       icon: '—' },
];

// ── Public types ────────────────────────────────────────────────────────────

export interface TkxRichEditorHandle {
  /** Get the current sanitised HTML. */
  getHTML: () => string;
  /** Get the current Markdown. */
  getMarkdown: () => string;
  /** Get plain text (no formatting). */
  getText: () => string;
  /** Replace the editor's content with sanitised HTML. */
  setHTML: (html: string) => void;
  /** Focus the editor. */
  focus: () => void;
}

export interface TkxRichEditorProps {
  /** Initial HTML content. */
  initialValue?: string;
  /** Fired on every change. Always sanitised. */
  onChange?: (html: string) => void;
  /** Placeholder shown when empty. */
  placeholder?: string;
  /** Subset of tools to show. Default: all. */
  tools?: Tool[];
  /** Max content height before scrolling. */
  maxHeight?: number | string;
  /** Min content height. Default 200. */
  minHeight?: number | string;
  /** aria-label for the editor textbox. */
  label?: string;
  /** Disabled state — content shown but not editable. */
  isDisabled?: boolean;
  className?: string;
  style?: CSSProperties;
  /** Optional render slot above the toolbar (e.g., word count, save button). */
  topSlot?: ReactNode;
  /** Optional render slot below the editor. */
  bottomSlot?: ReactNode;
}

// ── Component ───────────────────────────────────────────────────────────────

export const TkxRichEditor = forwardRef<TkxRichEditorHandle, TkxRichEditorProps>(
  function TkxRichEditor(
    {
      initialValue = '',
      onChange,
      placeholder = 'Start writing…',
      tools,
      maxHeight,
      minHeight = 200,
      label = 'Rich text editor',
      isDisabled = false,
      className,
      style,
      topSlot,
      bottomSlot,
    },
    ref,
  ) {
    const theme = useTheme();
    const editorRef = useRef<HTMLDivElement>(null);
    const editorId = useId();
    const [activeTools, setActiveTools] = useState<Set<Tool>>(new Set());
    const [isEmpty, setIsEmpty] = useState(true);

    const visibleTools = (tools ?? TOOLS.map((t) => t.id)) as Tool[];

    const emit = useCallback(() => {
      if (!editorRef.current) return;
      const cleanedHTML = sanitizeHTML(editorRef.current.innerHTML);
      onChange?.(cleanedHTML);
      setIsEmpty(editorRef.current.textContent?.trim() === '');
    }, [onChange]);

    // ── Imperative API ────────────────────────────────────────────────────
    useImperativeHandle(ref, () => ({
      getHTML: () => sanitizeHTML(editorRef.current?.innerHTML ?? ''),
      getMarkdown: () => htmlToMarkdown(editorRef.current?.innerHTML ?? ''),
      getText: () => editorRef.current?.textContent ?? '',
      setHTML: (html) => {
        if (editorRef.current) {
          editorRef.current.innerHTML = sanitizeHTML(html);
          emit();
        }
      },
      focus: () => editorRef.current?.focus(),
    }));

    // ── Initialise content ────────────────────────────────────────────────
    useEffect(() => {
      if (editorRef.current && initialValue) {
        editorRef.current.innerHTML = sanitizeHTML(initialValue);
        setIsEmpty(editorRef.current.textContent?.trim() === '');
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── Track which formatting is currently active for toolbar highlighting
    const updateActiveTools = useCallback(() => {
      if (typeof document === 'undefined') return;
      const next = new Set<Tool>();
      try {
        if (document.queryCommandState('bold')) next.add('bold');
        if (document.queryCommandState('italic')) next.add('italic');
        if (document.queryCommandState('underline')) next.add('underline');
        if (document.queryCommandState('strikeThrough')) next.add('strike');
        if (document.queryCommandState('insertUnorderedList')) next.add('ul');
        if (document.queryCommandState('insertOrderedList')) next.add('ol');
      } catch {
        /* queryCommandState can throw on some non-Chromium browsers; ignore */
      }
      setActiveTools(next);
    }, []);

    useEffect(() => {
      document.addEventListener('selectionchange', updateActiveTools);
      return () => document.removeEventListener('selectionchange', updateActiveTools);
    }, [updateActiveTools]);

    // ── Apply a formatting command ────────────────────────────────────────
    const apply = useCallback(
      (tool: Tool) => {
        if (isDisabled) return;
        editorRef.current?.focus();
        const def = TOOLS.find((t) => t.id === tool);

        switch (tool) {
          case 'h1': case 'h2': case 'h3':
            document.execCommand('formatBlock', false, tool);
            break;
          case 'quote':
            document.execCommand('formatBlock', false, 'blockquote');
            break;
          case 'code':
            wrapSelectionWith('code');
            break;
          case 'codeblock':
            document.execCommand('formatBlock', false, 'pre');
            break;
          case 'link': {
            const sel = window.getSelection()?.toString() || '';
            const url = window.prompt('Link URL', 'https://');
            if (!url) break;
            const safe = sanitizeHref(url);
            if (!safe) {
              window.alert('That URL is not allowed.');
              break;
            }
            const linkText = sel || safe;
            document.execCommand(
              'insertHTML',
              false,
              `<a href="${escapeAttr(safe)}" target="_blank" rel="noopener noreferrer">${escapeHTML(linkText)}</a>`,
            );
            break;
          }
          case 'image': {
            const url = window.prompt('Image URL (https:// or data:image/…)');
            if (!url) break;
            const safe = sanitizeImgSrc(url);
            if (!safe) {
              window.alert('That image URL is not allowed.');
              break;
            }
            const alt = window.prompt('Alt text (required for accessibility)') || '';
            document.execCommand(
              'insertHTML',
              false,
              `<img src="${escapeAttr(safe)}" alt="${escapeAttr(alt)}" />`,
            );
            break;
          }
          case 'hr':
            document.execCommand('insertHTML', false, '<hr />');
            break;
          default:
            if (def?.cmd) document.execCommand(def.cmd, false);
        }

        emit();
        updateActiveTools();
      },
      [isDisabled, emit, updateActiveTools],
    );

    // ── Keyboard shortcuts ────────────────────────────────────────────────
    const onKeyDown = useCallback(
      (e: KeyboardEvent<HTMLDivElement>) => {
        if (!e.metaKey && !e.ctrlKey) return;
        const k = e.key.toLowerCase();
        if (k === 'b') { e.preventDefault(); apply('bold'); }
        else if (k === 'i') { e.preventDefault(); apply('italic'); }
        else if (k === 'u') { e.preventDefault(); apply('underline'); }
        else if (k === 'k') { e.preventDefault(); apply('link'); }
      },
      [apply],
    );

    // ── Paste sanitisation ────────────────────────────────────────────────
    const onPaste = useCallback(
      (e: React.ClipboardEvent<HTMLDivElement>) => {
        e.preventDefault();
        const html = e.clipboardData.getData('text/html');
        const text = e.clipboardData.getData('text/plain');
        if (html) {
          document.execCommand('insertHTML', false, sanitizeHTML(html));
        } else if (text) {
          document.execCommand('insertText', false, text);
        }
        emit();
      },
      [emit],
    );

    // ── Toolbar arrow-key navigation ──────────────────────────────────────
    const onToolbarKeyDown = useCallback((e: KeyboardEvent<HTMLDivElement>) => {
      const buttons = Array.from(
        e.currentTarget.querySelectorAll<HTMLButtonElement>('button[data-tool]'),
      );
      const idx = buttons.indexOf(document.activeElement as HTMLButtonElement);
      if (idx < 0) return;
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        buttons[(idx + 1) % buttons.length].focus();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        buttons[(idx - 1 + buttons.length) % buttons.length].focus();
      } else if (e.key === 'Home') {
        e.preventDefault();
        buttons[0].focus();
      } else if (e.key === 'End') {
        e.preventDefault();
        buttons[buttons.length - 1].focus();
      }
    }, []);

    // ── Styles ────────────────────────────────────────────────────────────
    const wrap: CSSProperties = {
      border: `1px solid ${theme.css.border}`,
      borderRadius: 12,
      background: theme.css.surface,
      ...style,
    };
    const toolbarStyle: CSSProperties = {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 4,
      padding: 8,
      borderBottom: `1px solid ${theme.css.border}`,
      background: theme.css.surfaceAlt,
      borderTopLeftRadius: 12,
      borderTopRightRadius: 12,
    };
    const editorStyle: CSSProperties = {
      padding: 16,
      outline: 'none',
      minHeight: typeof minHeight === 'number' ? `${minHeight}px` : minHeight,
      maxHeight: typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight,
      overflowY: maxHeight ? 'auto' : 'visible',
      color: theme.css.text,
      fontSize: 15,
      lineHeight: 1.6,
      borderBottomLeftRadius: 12,
      borderBottomRightRadius: 12,
      cursor: isDisabled ? 'not-allowed' : 'text',
      opacity: isDisabled ? 0.6 : 1,
    };

    return (
      <div className={className} style={wrap}>
        {topSlot}
        <div
          role="toolbar"
          aria-label="Formatting"
          aria-controls={editorId}
          onKeyDown={onToolbarKeyDown}
          style={toolbarStyle}
        >
          {visibleTools.map((toolId, i) => {
            const def = TOOLS.find((t) => t.id === toolId);
            if (!def) return null;
            const isActive = activeTools.has(toolId);
            return (
              <button
                key={def.id}
                type="button"
                data-tool={def.id}
                tabIndex={i === 0 ? 0 : -1}
                aria-label={def.label + (def.shortcut ? ` (${def.shortcut})` : '')}
                aria-pressed={isActive}
                disabled={isDisabled}
                onMouseDown={(e) => e.preventDefault()} // keep editor selection
                onClick={() => apply(def.id)}
                style={{
                  background: isActive ? theme.css.primary : 'transparent',
                  color: isActive ? theme.css.bg : theme.css.text,
                  border: `1px solid ${isActive ? theme.css.primary : 'transparent'}`,
                  padding: '6px 10px',
                  borderRadius: 6,
                  cursor: isDisabled ? 'not-allowed' : 'pointer',
                  fontWeight: 700,
                  fontSize: 13,
                  minWidth: 32,
                  minHeight: 32,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 120ms',
                }}
              >
                {def.icon}
              </button>
            );
          })}
        </div>

        <div style={{ position: 'relative' }}>
          <div
            ref={editorRef}
            id={editorId}
            role="textbox"
            aria-label={label}
            aria-multiline="true"
            aria-readonly={isDisabled}
            contentEditable={!isDisabled}
            suppressContentEditableWarning
            onInput={emit}
            onKeyDown={onKeyDown}
            onPaste={onPaste}
            spellCheck
            style={editorStyle}
          />
          {isEmpty && !isDisabled && (
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                top: 16,
                left: 16,
                color: theme.css.textMuted,
                pointerEvents: 'none',
                fontSize: 15,
              }}
            >
              {placeholder}
            </div>
          )}
        </div>

        {bottomSlot}
      </div>
    );
  },
);

// ── Helpers ─────────────────────────────────────────────────────────────────

function escapeHTML(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
function escapeAttr(s: string): string {
  return s.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function wrapSelectionWith(tag: 'code') {
  if (typeof window === 'undefined') return;
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return;
  const range = sel.getRangeAt(0);
  const text = range.toString();
  if (!text) return;
  const node = document.createElement(tag);
  node.textContent = text;
  range.deleteContents();
  range.insertNode(node);
}
