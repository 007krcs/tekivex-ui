'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useTheme } from '../themes';
import { sanitizeString } from '../engine/security';
import { useReducedMotion } from '../hooks';
import { tkx } from '../engine/tkx';

// ── Types ────────────────────────────────────────────────────────────────────

export interface AnchorLink {
  key: string;
  href: string;
  title: string;
  children?: AnchorLink[];
}

export interface TkxAnchorProps {
  items: AnchorLink[];
  offsetTop?: number;
  getCurrentAnchor?: (activeLink: string) => string;
  onChange?: (currentLink: string) => void;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function flattenLinks(items: AnchorLink[]): AnchorLink[] {
  const result: AnchorLink[] = [];
  for (const item of items) {
    result.push(item);
    if (item.children) result.push(...flattenLinks(item.children));
  }
  return result;
}

function getAnchorId(href: string): string {
  return href.startsWith('#') ? href.slice(1) : href;
}

// ── Link Item ────────────────────────────────────────────────────────────────

function AnchorItem({
  item,
  activeKey,
  depth,
  onClick,
  theme,
  reducedMotion,
}: {
  item: AnchorLink;
  activeKey: string;
  depth: number;
  onClick: (href: string) => void;
  theme: ReturnType<typeof useTheme>;
  reducedMotion: boolean;
}) {
  const isActive = item.key === activeKey;
  const safeTitle = sanitizeString(item.title);

  return (
    <li role="none" style={{ listStyle: 'none' }}>
      <a
        role="treeitem"
        aria-current={isActive ? 'location' : undefined}
        href={item.href}
        onClick={(e) => {
          e.preventDefault();
          onClick(item.href);
        }}
        className={tkx('block text-sm py-1 no-underline')}
        style={{
          paddingLeft: 12 + depth * 16,
          color: isActive ? theme.primary : theme.textMuted,
          fontWeight: isActive ? 600 : 400,
          borderLeft: `2px solid ${isActive ? theme.primary : 'transparent'}`,
          transition: reducedMotion ? 'none' : 'color 0.15s ease, border-color 0.15s ease',
        }}
      >
        {safeTitle}
      </a>
      {item.children && item.children.length > 0 && (
        <ul role="group" style={{ margin: 0, padding: 0 }}>
          {item.children.map((child) => (
            <AnchorItem
              key={child.key}
              item={child}
              activeKey={activeKey}
              depth={depth + 1}
              onClick={onClick}
              theme={theme}
              reducedMotion={reducedMotion}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

// ── Component ────────────────────────────────────────────────────────────────

export function TkxAnchor({
  items,
  offsetTop = 0,
  getCurrentAnchor,
  onChange,
}: TkxAnchorProps) {
  const theme = useTheme();
  const reducedMotion = useReducedMotion();
  const [activeKey, setActiveKey] = useState(items[0]?.key ?? '');
  const isScrolling = useRef(false);

  const flat = flattenLinks(items);

  const updateActive = useCallback(() => {
    if (isScrolling.current) return;

    let current = flat[0]?.key ?? '';
    for (const link of flat) {
      const id = getAnchorId(link.href);
      const el = document.getElementById(id);
      if (el) {
        const top = el.getBoundingClientRect().top;
        if (top <= offsetTop + 10) {
          current = link.key;
        }
      }
    }

    if (getCurrentAnchor) {
      current = getCurrentAnchor(current);
    }

    if (current !== activeKey) {
      setActiveKey(current);
      onChange?.(current);
    }
  }, [flat, offsetTop, getCurrentAnchor, activeKey, onChange]);

  useEffect(() => {
    window.addEventListener('scroll', updateActive, { passive: true });
    updateActive();
    return () => window.removeEventListener('scroll', updateActive);
  }, [updateActive]);

  const handleClick = useCallback(
    (href: string) => {
      const id = getAnchorId(href);
      const el = document.getElementById(id);
      if (!el) return;

      isScrolling.current = true;
      const top = el.getBoundingClientRect().top + window.scrollY - offsetTop;
      window.scrollTo({ top, behavior: reducedMotion ? 'auto' : 'smooth' });

      // Find the link by href and set active
      const link = flat.find((l) => l.href === href);
      if (link) {
        setActiveKey(link.key);
        onChange?.(link.key);
      }

      setTimeout(() => {
        isScrolling.current = false;
      }, 800);
    },
    [flat, offsetTop, reducedMotion, onChange],
  );

  return (
    <nav
      role="tree"
      aria-label="Anchor navigation"
      className={tkx('font-sans')}
      style={{
        borderLeft: `1px solid ${theme.border}`,
        padding: '4px 0',
      }}
    >
      <ul role="group" style={{ margin: 0, padding: 0 }}>
        {items.map((item) => (
          <AnchorItem
            key={item.key}
            item={item}
            activeKey={activeKey}
            depth={0}
            onClick={handleClick}
            theme={theme}
            reducedMotion={reducedMotion}
          />
        ))}
      </ul>
    </nav>
  );
}