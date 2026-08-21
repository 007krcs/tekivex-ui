'use client';

import { useState, useRef, useEffect, useCallback, useId } from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from '../themes';
import { sanitizeString } from '../engine/security';
import { useReducedMotion } from '../hooks';
import { tkx } from '../engine/tkx';

// ── Types ────────────────────────────────────────────────────────────────────

export interface CascaderOption {
  value: string;
  label: string;
  children?: CascaderOption[];
  disabled?: boolean;
}

export interface TkxCascaderProps {
  options: CascaderOption[];
  value?: string[];
  onChange?: (value: string[], selectedOptions: CascaderOption[]) => void;
  placeholder?: string;
  label?: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function getColumns(
  options: CascaderOption[],
  selected: string[],
): CascaderOption[][] {
  const columns: CascaderOption[][] = [options];
  let current = options;
  for (const val of selected) {
    const found = current.find((o) => o.value === val);
    if (found?.children?.length) {
      columns.push(found.children);
      current = found.children;
    } else {
      break;
    }
  }
  return columns;
}

function getSelectedOptions(
  options: CascaderOption[],
  values: string[],
): CascaderOption[] {
  const result: CascaderOption[] = [];
  let current = options;
  for (const val of values) {
    const found = current.find((o) => o.value === val);
    if (found) {
      result.push(found);
      current = found.children ?? [];
    } else break;
  }
  return result;
}

function getLabelPath(options: CascaderOption[], values: string[]): string {
  return getSelectedOptions(options, values)
    .map((o) => sanitizeString(o.label))
    .join(' / ');
}

// ── Component ────────────────────────────────────────────────────────────────

export function TkxCascader({
  options,
  value = [],
  onChange,
  placeholder = 'Select...',
  label,
}: TkxCascaderProps) {
  const theme = useTheme();
  const reducedMotion = useReducedMotion();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [hoverPath, setHoverPath] = useState<string[]>(value);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });
  // Combobox↔tree wiring: the popup tree gets a stable id so the trigger can
  // reference it via aria-controls, and each treeitem gets a deterministic id
  // so the trigger's aria-activedescendant can point at the active option.
  const treeId = useId();
  const treeItemId = (colIdx: number, rowIdx: number) => `${treeId}-item-${colIdx}-${rowIdx}`;
  // Tree-structure semantics (APG Tree View): columns render as *sibling*
  // role="group" lists under the tree rather than nested inside their parent
  // treeitem, so the DOM alone cannot convey hierarchy. Each column gets a
  // deterministic id so an expanded parent can claim its child column via
  // aria-owns, letting AT reconstruct the parent→children relationship.
  const groupId = (colIdx: number) => `${treeId}-group-${colIdx}`;

  const safeLabel = label ? sanitizeString(label) : undefined;
  const safePlaceholder = sanitizeString(placeholder);
  const displayText = value.length > 0 ? getLabelPath(options, value) : '';

  // Position dropdown
  useEffect(() => {
    if (!open || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setDropdownPos({
      top: rect.bottom + 4 + window.scrollY,
      left: rect.left + window.scrollX,
      width: Math.max(rect.width, 200),
    });
  }, [open]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        !triggerRef.current?.contains(e.target as Node) &&
        !dropdownRef.current?.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleSelect = useCallback(
    (colIdx: number, opt: CascaderOption) => {
      if (opt.disabled) return;
      const newPath = [...hoverPath.slice(0, colIdx), opt.value];
      setHoverPath(newPath);

      // If leaf node (no children), commit selection
      if (!opt.children?.length) {
        const selected = getSelectedOptions(options, newPath);
        onChange?.(newPath, selected);
        setOpen(false);
      }
    },
    [hoverPath, options, onChange],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      } else if (e.key === 'Enter' || e.key === ' ') {
        if (!open) {
          e.preventDefault();
          setOpen(true);
        }
      }
    },
    [open],
  );

  const columns = getColumns(options, hoverPath);

  // The active treeitem is the deepest entry of hoverPath (the option the
  // user last hovered/navigated to). Resolve it to its column/row so the
  // combobox can expose it via aria-activedescendant.
  const activeColIdx = hoverPath.length - 1;
  const activeRowIdx =
    activeColIdx >= 0 && columns[activeColIdx]
      ? columns[activeColIdx].findIndex((o) => o.value === hoverPath[activeColIdx])
      : -1;
  const activeDescendantId =
    open && activeRowIdx >= 0 ? treeItemId(activeColIdx, activeRowIdx) : undefined;

  const dropdown = open
    ? createPortal(
        <div
          ref={dropdownRef}
          id={treeId}
          role="tree"
          aria-label={safeLabel ?? 'Cascader options'}
          className={tkx('flex rounded-lg border overflow-hidden')}
          style={{
            position: 'absolute',
            zIndex: 9999,
            top: dropdownPos.top,
            left: dropdownPos.left,
            backgroundColor: theme.css.surface,
            borderColor: theme.css.border,
            boxShadow: `0 4px 16px ${theme.css.bg}80`,
            animation: reducedMotion ? 'none' : 'tkxFadeIn 0.15s ease',
          }}
        >
          {columns.map((col, colIdx) => (
            <ul
              key={colIdx}
              id={groupId(colIdx)}
              role="group"
              className={tkx('m-0 p-0 overflow-auto')}
              style={{
                listStyle: 'none',
                minWidth: 160,
                maxHeight: 260,
                borderRight: colIdx < columns.length - 1 ? `1px solid ${theme.css.border}` : 'none',
              }}
            >
              {col.map((opt, rowIdx) => {
                const isSelected = hoverPath[colIdx] === opt.value;
                const hasChildren = Boolean(opt.children?.length);
                // A parent is expanded exactly when it sits on hoverPath at
                // this depth: getColumns() then renders its child column,
                // which the parent claims via aria-owns (see groupId note).
                const isExpanded = hasChildren && isSelected;
                const childColumnShown = isExpanded && colIdx + 1 < columns.length;
                const safeOptLabel = sanitizeString(opt.label);
                return (
                  <li
                    key={opt.value}
                    id={treeItemId(colIdx, rowIdx)}
                    role="treeitem"
                    aria-selected={isSelected}
                    aria-disabled={opt.disabled || undefined}
                    aria-expanded={hasChildren ? isExpanded : undefined}
                    // APG Tree View structure props: sibling columns mean the
                    // DOM carries no nesting, so level/setsize/posinset must be
                    // stated explicitly per treeitem.
                    aria-level={colIdx + 1}
                    aria-setsize={col.length}
                    aria-posinset={rowIdx + 1}
                    aria-owns={childColumnShown ? groupId(colIdx + 1) : undefined}
                    // Keyboard operability (WCAG 2.1.1): the tree was previously
                    // mouse-only. Enter/Space selects, ArrowRight drills into a
                    // node with children, ArrowLeft steps back a column.
                    tabIndex={opt.disabled ? -1 : 0}
                    className={tkx('flex items-center justify-between px-3 py-2 cursor-pointer text-sm')}
                    style={{
                      backgroundColor: isSelected ? theme.css.surfaceAlt : 'transparent',
                      color: opt.disabled ? theme.css.textMuted : theme.css.text,
                      opacity: opt.disabled ? 0.5 : 1,
                      cursor: opt.disabled ? 'not-allowed' : 'pointer',
                    }}
                    onClick={() => handleSelect(colIdx, opt)}
                    onKeyDown={(e) => {
                      if (opt.disabled) return;
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleSelect(colIdx, opt);
                      } else if (e.key === 'ArrowRight' && opt.children?.length) {
                        e.preventDefault();
                        setHoverPath((prev) => [...prev.slice(0, colIdx), opt.value]);
                      } else if (e.key === 'ArrowLeft' && colIdx > 0) {
                        e.preventDefault();
                        setHoverPath((prev) => prev.slice(0, colIdx));
                      }
                    }}
                    onMouseEnter={() => {
                      if (!opt.disabled) {
                        setHoverPath((prev) => [...prev.slice(0, colIdx), opt.value]);
                      }
                    }}
                  >
                    <span>{safeOptLabel}</span>
                    {opt.children && opt.children.length > 0 && (
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        aria-hidden="true"
                        style={{ color: theme.css.textMuted, flexShrink: 0 }}
                      >
                        <path d="M10 6l6 6-6 6V6z" />
                      </svg>
                    )}
                  </li>
                );
              })}
            </ul>
          ))}
        </div>,
        document.body,
      )
    : null;

  return (
    <div className={tkx('relative font-sans')} onKeyDown={handleKeyDown}>
      {safeLabel && (
        <label
          className={tkx('block text-sm font-medium mb-1')}
          style={{ color: theme.css.text }}
        >
          {safeLabel}
        </label>
      )}

      <button
        ref={triggerRef}
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-haspopup="tree"
        // Only reference the popup while it exists in the DOM — a dangling
        // aria-controls idref is itself an ARIA defect.
        aria-controls={open ? treeId : undefined}
        aria-activedescendant={activeDescendantId}
        aria-label={safeLabel ?? 'Cascader'}
        className={tkx('w-full flex items-center justify-between rounded-lg border px-3 py-2 text-sm cursor-pointer')}
        style={{
          backgroundColor: theme.css.surface,
          borderColor: open ? theme.css.primary : theme.css.border,
          color: displayText ? theme.css.text : theme.css.textMuted,
          outline: 'none',
          minHeight: 38,
          textAlign: 'left',
        }}
        onClick={() => setOpen((v) => !v)}
      >
        <span className={tkx('truncate')}>{displayText || safePlaceholder}</span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
          style={{
            color: theme.css.textMuted,
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: reducedMotion ? 'none' : 'transform 0.2s ease',
            flexShrink: 0,
          }}
        >
          <path d="M7 10l5 5 5-5H7z" />
        </svg>
      </button>

      {dropdown}
    </div>
  );
}