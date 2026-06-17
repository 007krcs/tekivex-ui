'use client';

import {
  useCallback,
  useEffect,
  useState,
  type ReactNode,
  type CSSProperties,
  type KeyboardEvent,
} from 'react';
import { useTheme } from '../themes';
import { useLocale } from '../i18n';
import { sanitizeString } from '../engine/security';
import { useReducedMotion } from '../hooks';
import { tkx } from '../engine/tkx';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: ReactNode;
}

export interface TkxBreadcrumbProps {
  items: BreadcrumbItem[];
  separator?: ReactNode;
  maxItems?: number;
  onNavigate?: (item: BreadcrumbItem, index: number) => void;
  className?: string;
  style?: CSSProperties;
}

// ── Chevron separator icon ──────────────────────────────────────────────────

function DefaultSeparator({ color }: { color: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <path
        d="M6 3l5 5-5 5"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ── Ellipsis button ─────────────────────────────────────────────────────────

function EllipsisButton({
  onClick,
  bgColor,
  hoverColor,
  textColor,
  label,
}: {
  onClick: () => void;
  bgColor: string;
  hoverColor: string;
  textColor: string;
  label: string;
}) {
  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      onKeyDown={handleKeyDown}
      aria-label={label}
      className={tkx(
        'inline-flex items-center justify-center rounded px-1.5 py-0.5',
        'text-sm font-medium cursor-pointer border-none outline-none',
        'focus-visible:ring-2 focus-visible:ring-offset-1',
      )}
      style={{
        backgroundColor: bgColor,
        color: textColor,
        transition: 'background-color 150ms ease',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.backgroundColor = hoverColor;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.backgroundColor = bgColor;
      }}
    >
      &hellip;
    </button>
  );
}

// ── Component ───────────────────────────────────────────────────────────────

export function TkxBreadcrumb({
  items,
  separator,
  maxItems,
  onNavigate,
  className,
  style,
}: TkxBreadcrumbProps) {
  const theme = useTheme();
  const t = useLocale();
  const reducedMotion = useReducedMotion();

  // Clicking the ellipsis expands the trail in place (reset when items change).
  const [expanded, setExpanded] = useState(false);
  useEffect(() => {
    setExpanded(false);
  }, [items]);

  // Collapse logic: show first, last, and ellipsis when items exceed maxItems
  const shouldCollapse =
    !expanded && maxItems !== undefined && maxItems > 1 && items.length > maxItems;

  const getVisibleItems = useCallback((): { item: BreadcrumbItem; originalIndex: number }[] => {
    if (!shouldCollapse || !maxItems) {
      return items.map((item, i) => ({ item, originalIndex: i }));
    }

    const headCount = Math.ceil((maxItems - 1) / 2);
    const tailCount = maxItems - 1 - headCount;

    const head = items.slice(0, headCount).map((item, i) => ({
      item,
      originalIndex: i,
    }));

    const tail = items.slice(items.length - tailCount).map((item, i) => ({
      item,
      originalIndex: items.length - tailCount + i,
    }));

    return head.concat(tail);
  }, [items, maxItems, shouldCollapse]);

  const visibleItems = getVisibleItems();

  // Where to insert the ellipsis
  const headCount = shouldCollapse && maxItems ? Math.ceil((maxItems - 1) / 2) : -1;

  const handleClick = (item: BreadcrumbItem, index: number) => {
    onNavigate?.(item, index);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLElement>, item: BreadcrumbItem, index: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick(item, index);
    }
  };

  const transitionStyle: CSSProperties = reducedMotion
    ? {}
    : { transition: 'color 150ms ease, background-color 150ms ease' };

  const renderSeparator = (key: string) => (
    <li
      key={key}
      role="presentation"
      aria-hidden="true"
      className={tkx('flex items-center mx-1.5')}
    >
      {separator ?? <DefaultSeparator color={theme.textMuted} />}
    </li>
  );

  const renderItem = (
    item: BreadcrumbItem,
    originalIndex: number,
    isLast: boolean,
  ) => {
    const safeLabel = sanitizeString(item.label);

    if (isLast) {
      return (
        <li key={`item-${originalIndex}`}>
          <span
            aria-current="page"
            className={tkx('inline-flex items-center gap-1.5 text-sm font-medium')}
            style={{ color: theme.text }}
          >
            {item.icon && (
              <span aria-hidden="true" className={tkx('flex-shrink-0')}>
                {item.icon}
              </span>
            )}
            {safeLabel}
          </span>
        </li>
      );
    }

    const isLink = !!item.href;

    const commonStyle: CSSProperties = {
      color: theme.textMuted,
      textDecoration: 'none',
      ...transitionStyle,
    };

    const hoverHandlers = {
      onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
        (e.currentTarget as HTMLElement).style.color = theme.primary;
      },
      onMouseLeave: (e: React.MouseEvent<HTMLElement>) => {
        (e.currentTarget as HTMLElement).style.color = theme.textMuted;
      },
    };

    const content = (
      <>
        {item.icon && (
          <span aria-hidden="true" className={tkx('flex-shrink-0')}>
            {item.icon}
          </span>
        )}
        {safeLabel}
      </>
    );

    if (isLink) {
      return (
        <li key={`item-${originalIndex}`}>
          <a
            href={item.href}
            onClick={(e) => {
              if (onNavigate) {
                e.preventDefault();
                handleClick(item, originalIndex);
              }
            }}
            className={tkx(
              'inline-flex items-center gap-1.5 text-sm rounded',
              'outline-none focus-visible:ring-2 focus-visible:ring-offset-1',
            )}
            style={{
              ...commonStyle,
              focusRingColor: theme.primary,
            } as CSSProperties}
            {...hoverHandlers}
          >
            {content}
          </a>
        </li>
      );
    }

    return (
      <li key={`item-${originalIndex}`}>
        <button
          type="button"
          onClick={() => handleClick(item, originalIndex)}
          onKeyDown={(e) => handleKeyDown(e, item, originalIndex)}
          className={tkx(
            'inline-flex items-center gap-1.5 text-sm rounded',
            'border-none bg-transparent cursor-pointer p-0',
            'outline-none focus-visible:ring-2 focus-visible:ring-offset-1',
          )}
          style={commonStyle}
          {...hoverHandlers}
        >
          {content}
        </button>
      </li>
    );
  };

  // Build the rendered list
  const rendered: ReactNode[] = [];
  let ellipsisInserted = false;

  for (let vi = 0; vi < visibleItems.length; vi++) {
    const { item, originalIndex } = visibleItems[vi];
    const isLast = originalIndex === items.length - 1;

    // Insert ellipsis after headCount items
    if (shouldCollapse && !ellipsisInserted && vi === headCount) {
      if (rendered.length > 0) {
        rendered.push(renderSeparator(`sep-ellipsis-before`));
      }
      rendered.push(
        <li key="ellipsis" role="presentation">
          <EllipsisButton
            onClick={() => {
              // Reveal the hidden middle items in place.
              setExpanded(true);
            }}
            bgColor={theme.surfaceAlt}
            hoverColor={theme.surface}
            textColor={theme.textMuted}
            label={t.showHiddenItems ?? 'Show hidden breadcrumb items'}
          />
        </li>,
      );
      ellipsisInserted = true;
    }

    if (rendered.length > 0 && rendered[rendered.length - 1] !== null) {
      rendered.push(renderSeparator(`sep-${originalIndex}`));
    }

    rendered.push(renderItem(item, originalIndex, isLast));
  }

  return (
    <nav
      aria-label={t.breadcrumb ?? 'Breadcrumb'}
      className={tkx('font-sans', className ?? '')}
      style={{
        ...style,
      }}
    >
      <ol
        role="list"
        className={tkx('flex items-center flex-wrap list-none m-0 p-0')}
      >
        {rendered}
      </ol>
    </nav>
  );
}

export default TkxBreadcrumb;