import {
  type ReactNode,
  type ElementType,
  type ComponentPropsWithoutRef,
} from 'react';
import { useFocusTrap } from '../hooks';

// ── SkipNav ──────────────────────────────────────────────────────────────────

export interface SkipNavProps {
  contentId?: string;
  label?: string;
}

export function SkipNav({
  contentId = 'tkx-main-content',
  label = 'Skip to main content',
}: SkipNavProps) {
  return (
    <a href={`#${contentId}`} className="tkx-skip-nav">
      {label}
    </a>
  );
}

// ── LiveRegion ───────────────────────────────────────────────────────────────

export interface LiveRegionProps {
  politeness?: 'polite' | 'assertive';
  children?: ReactNode;
  atomic?: boolean;
}

export function LiveRegion({
  politeness = 'polite',
  children,
  atomic = true,
}: LiveRegionProps) {
  return (
    <div
      role="status"
      aria-live={politeness}
      aria-atomic={atomic}
      className="tkx-sr-only"
    >
      {children}
    </div>
  );
}

// ── FocusTrap ────────────────────────────────────────────────────────────────

export interface FocusTrapProps {
  active: boolean;
  children: ReactNode;
  as?: ElementType;
}

export function FocusTrap({ active, children, as: Tag = 'div' }: FocusTrapProps) {
  const ref = useFocusTrap(active);
  return (
    <Tag ref={ref as React.Ref<HTMLElement>}>
      {children}
    </Tag>
  );
}

// ── VisuallyHidden ────────────────────────────────────────────────────────────

export type VisuallyHiddenProps<T extends ElementType = 'span'> = {
  as?: T;
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<T>, 'as' | 'children'>;

export function VisuallyHidden<T extends ElementType = 'span'>({
  as,
  children,
  ...rest
}: VisuallyHiddenProps<T>) {
  const Tag = (as ?? 'span') as ElementType;
  return (
    <Tag className="tkx-sr-only" {...rest}>
      {children}
    </Tag>
  );
}

