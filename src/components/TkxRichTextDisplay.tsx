'use client';

import {
  useMemo,
  type ReactNode,
  type CSSProperties,
} from 'react';
import { useTheme } from '../themes';
import { sanitizeString } from '../engine/security';
import { useReducedMotion } from '../hooks';
import { tkx } from '../engine/tkx';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface RichTextBlock {
  type: 'heading' | 'paragraph' | 'blockquote' | 'code' | 'list' | 'divider' | 'image' | 'callout';
  content?: string;
  level?: 1 | 2 | 3;
  language?: string;
  items?: string[];
  ordered?: boolean;
  src?: string;
  alt?: string;
  variant?: 'info' | 'warning' | 'success' | 'danger';
}

export interface TkxRichTextDisplayProps {
  blocks: RichTextBlock[];
  className?: string;
  style?: CSSProperties;
}

// ── Callout icons ───────────────────────────────────────────────────────────

const CALLOUT_ICONS: Record<string, ReactNode> = {
  info: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
    </svg>
  ),
  warning: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
    </svg>
  ),
  success: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm-2 14.5l-4-4 1.41-1.41L10 13.67l6.59-6.59L18 8.5l-8 8z" />
    </svg>
  ),
  danger: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
    </svg>
  ),
};

// ── Heading sizes ───────────────────────────────────────────────────────────

const HEADING_SIZES: Record<number, CSSProperties> = {
  1: { fontSize: '1.75rem', fontWeight: 700, lineHeight: 1.25, marginTop: 24, marginBottom: 12 },
  2: { fontSize: '1.375rem', fontWeight: 600, lineHeight: 1.3, marginTop: 20, marginBottom: 10 },
  3: { fontSize: '1.1rem', fontWeight: 600, lineHeight: 1.35, marginTop: 16, marginBottom: 8 },
};

// ── Block renderers ─────────────────────────────────────────────────────────

interface BlockRendererProps {
  block: RichTextBlock;
  index: number;
}

function HeadingBlock({ block }: BlockRendererProps) {
  const theme = useTheme();
  const level = block.level ?? 1;
  const Tag = `h${level}` as 'h1' | 'h2' | 'h3';
  const safeContent = sanitizeString(block.content ?? '');

  return (
    <Tag
      className={tkx('m-0')}
      style={{
        ...HEADING_SIZES[level],
        color: theme.text,
      }}
    >
      {safeContent}
    </Tag>
  );
}

function ParagraphBlock({ block }: BlockRendererProps) {
  const theme = useTheme();
  const safeContent = sanitizeString(block.content ?? '');

  return (
    <p
      className={tkx('m-0')}
      style={{
        fontSize: '0.938rem',
        lineHeight: 1.7,
        color: theme.text,
        marginBottom: 12,
      }}
    >
      {safeContent}
    </p>
  );
}

function BlockquoteBlock({ block }: BlockRendererProps) {
  const theme = useTheme();
  const safeContent = sanitizeString(block.content ?? '');

  return (
    <blockquote
      className={tkx('m-0')}
      style={{
        borderLeft: `3px solid ${theme.primary}`,
        paddingLeft: 16,
        paddingTop: 8,
        paddingBottom: 8,
        marginTop: 12,
        marginBottom: 12,
        backgroundColor: `${theme.surfaceAlt}`,
        borderRadius: '0 6px 6px 0',
        color: theme.textMuted,
        fontStyle: 'italic',
        fontSize: '0.938rem',
        lineHeight: 1.6,
      }}
    >
      {safeContent}
    </blockquote>
  );
}

function CodeBlock({ block }: BlockRendererProps) {
  const theme = useTheme();
  const safeContent = sanitizeString(block.content ?? '');
  const safeLanguage = block.language ? sanitizeString(block.language) : null;

  return (
    <div
      className={tkx('rounded-lg overflow-hidden')}
      style={{
        marginTop: 12,
        marginBottom: 12,
        border: `1px solid ${theme.border}`,
        backgroundColor: theme.surfaceAlt,
      }}
    >
      {/* Language label */}
      {safeLanguage && (
        <div
          className={tkx('px-3 py-1 text-[11px] font-semibold uppercase tracking-wider')}
          style={{
            color: theme.textMuted,
            borderBottom: `1px solid ${theme.border}`,
            backgroundColor: theme.surface,
          }}
        >
          {safeLanguage}
        </div>
      )}

      {/* Code content */}
      <pre
        className={tkx('m-0 p-4 overflow-x-auto')}
        style={{
          fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
          fontSize: '0.85rem',
          lineHeight: 1.6,
          color: theme.text,
          tabSize: 2,
        }}
      >
        <code aria-label={safeLanguage ? `Code block in ${safeLanguage}` : 'Code block'}>
          {safeContent}
        </code>
      </pre>
    </div>
  );
}

function ListBlock({ block }: BlockRendererProps) {
  const theme = useTheme();
  const Tag = block.ordered ? 'ol' : 'ul';
  const safeItems = (block.items ?? []).map((item) => sanitizeString(item));

  return (
    <Tag
      className={tkx('m-0')}
      style={{
        paddingLeft: 24,
        marginTop: 8,
        marginBottom: 12,
        color: theme.text,
        fontSize: '0.938rem',
        lineHeight: 1.7,
        listStyleType: block.ordered ? 'decimal' : 'disc',
      }}
      role="list"
    >
      {safeItems.map((item, i) => (
        <li
          key={i}
          role="listitem"
          style={{ marginBottom: 4 }}
        >
          {item}
        </li>
      ))}
    </Tag>
  );
}

function DividerBlock() {
  const theme = useTheme();
  return (
    <hr
      aria-hidden="true"
      style={{
        border: 'none',
        borderTop: `1px solid ${theme.border}`,
        marginTop: 20,
        marginBottom: 20,
      }}
    />
  );
}

function ImageBlock({ block }: BlockRendererProps) {
  const theme = useTheme();
  const safeSrc = sanitizeString(block.src ?? '');
  const safeAlt = sanitizeString(block.alt ?? 'Image');

  return (
    <figure
      className={tkx('m-0')}
      style={{ marginTop: 12, marginBottom: 12 }}
    >
      <img
        src={safeSrc}
        alt={safeAlt}
        loading="lazy"
        className={tkx('rounded-lg')}
        style={{
          maxWidth: '100%',
          height: 'auto',
          display: 'block',
          border: `1px solid ${theme.border}`,
        }}
      />
      {block.alt && (
        <figcaption
          className={tkx('text-xs mt-2 text-center')}
          style={{ color: theme.textMuted }}
        >
          {safeAlt}
        </figcaption>
      )}
    </figure>
  );
}

function CalloutBlock({ block }: BlockRendererProps) {
  const theme = useTheme();
  const variant = block.variant ?? 'info';
  const safeContent = sanitizeString(block.content ?? '');

  const variantColorMap: Record<string, string> = {
    info: theme.info,
    warning: theme.warning,
    success: theme.success,
    danger: theme.danger,
  };

  const accentColor = variantColorMap[variant];
  const icon = CALLOUT_ICONS[variant];

  // Role mapping for semantics
  const roleMap: Record<string, string> = {
    info: 'note',
    warning: 'alert',
    success: 'status',
    danger: 'alert',
  };

  return (
    <div
      role={roleMap[variant]}
      className={tkx('flex gap-3 px-4 py-3 rounded-lg')}
      style={{
        backgroundColor: `${accentColor}12`,
        border: `1px solid ${accentColor}33`,
        marginTop: 12,
        marginBottom: 12,
      }}
    >
      <span
        className={tkx('shrink-0 mt-[2px]')}
        style={{ color: accentColor }}
      >
        {icon}
      </span>
      <div
        className={tkx('flex-1')}
        style={{
          fontSize: '0.9rem',
          lineHeight: 1.6,
          color: theme.text,
        }}
      >
        {safeContent}
      </div>
    </div>
  );
}

// ── Block dispatcher ────────────────────────────────────────────────────────

const BLOCK_RENDERERS: Record<string, (props: BlockRendererProps) => ReactNode> = {
  heading: HeadingBlock,
  paragraph: ParagraphBlock,
  blockquote: BlockquoteBlock,
  code: CodeBlock,
  list: ListBlock,
  divider: DividerBlock,
  image: ImageBlock,
  callout: CalloutBlock,
};

// ── Main component ──────────────────────────────────────────────────────────

export function TkxRichTextDisplay({
  blocks,
  className,
  style,
}: TkxRichTextDisplayProps) {
  const theme = useTheme();
  const reduced = useReducedMotion();

  // Memoize the rendered blocks
  const renderedBlocks = useMemo(() => {
    return blocks.map((block, index) => {
      const Renderer = BLOCK_RENDERERS[block.type];
      if (!Renderer) return null;

      return (
        <div
          key={index}
          style={
            reduced
              ? undefined
              : {
                  animation: `tkx-rich-text-fade-in 300ms ease both`,
                  animationDelay: `${Math.min(index * 30, 300)}ms`,
                }
          }
        >
          <Renderer block={block} index={index} />
        </div>
      );
    });
  }, [blocks, reduced]);

  // Inject keyframes
  useMemo(() => {
    if (typeof document === 'undefined') return;
    if (document.getElementById('tkx-rich-text-kf')) return;
    const styleEl = document.createElement('style');
    styleEl.id = 'tkx-rich-text-kf';
    styleEl.textContent = `
      @keyframes tkx-rich-text-fade-in {
        from { opacity: 0; }
        to   { opacity: 1; }
      }
    `;
    document.head.appendChild(styleEl);
  }, []);

  return (
    <article
      aria-label="Rich text content"
      className={tkx('font-sans', className ?? '')}
      style={{
        color: theme.text,
        maxWidth: 720,
        ...style,
      }}
    >
      {renderedBlocks}
    </article>
  );
}