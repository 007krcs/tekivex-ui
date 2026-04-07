import {
  createContext,
  useContext,
  useMemo,
  useCallback,
  type ReactNode,
  type CSSProperties,
} from 'react';

// ══════════════════════════════════════════════════════════════════════════════
// TkxConfigProvider — Global configuration provider for TekiVex UI.
//
// Provides locale, direction, component defaults, and a CSS class prefix to
// all descendant components via React context. Supports nesting: a child
// ConfigProvider merges its values on top of its parent.
// ══════════════════════════════════════════════════════════════════════════════

// ── Component Defaults ───────────────────────────────────────────────────────

export interface ComponentDefaults {
  /** Default size for all components that support sizing. */
  size?: 'sm' | 'md' | 'lg';
  /** Default variant name. Interpretation depends on the component. */
  variant?: string;
  /** Enable or disable animations globally. */
  animation?: boolean;
  /** Show borders by default on components that support it. */
  bordered?: boolean;
}

// ── Per-component overrides ──────────────────────────────────────────────────

export interface ButtonConfig {
  size?: 'sm' | 'md' | 'lg';
  variant?: string;
}

export interface InputConfig {
  size?: 'sm' | 'md' | 'lg';
  bordered?: boolean;
}

export interface TableConfig {
  size?: 'sm' | 'md' | 'lg';
  bordered?: boolean;
  striped?: boolean;
}

export interface ModalConfig {
  centered?: boolean;
  maskClosable?: boolean;
  animation?: boolean;
}

export interface ComponentOverrides {
  button?: ButtonConfig;
  input?: InputConfig;
  table?: TableConfig;
  modal?: ModalConfig;
}

// ── Config Context Value ─────────────────────────────────────────────────────

export interface ConfigContextValue {
  /** BCP 47 locale code (e.g. "en-US", "ja-JP"). */
  locale: string;
  /** Text direction. */
  direction: 'ltr' | 'rtl';
  /** Global defaults applied to every component. */
  componentDefaults: Required<ComponentDefaults>;
  /** Per-component configuration overrides. */
  componentOverrides: ComponentOverrides;
  /** CSS class prefix used by all TekiVex components. */
  prefixCls: string;
  /** Whether we are inside at least one ConfigProvider. */
  configured: boolean;
  /** Helper: build a prefixed class name. */
  cls: (name: string) => string;
  /** Helper: resolve size for a component (component override > global default). */
  getSize: (component?: keyof ComponentOverrides, local?: 'sm' | 'md' | 'lg') => 'sm' | 'md' | 'lg';
  /** Helper: resolve whether animations should run. */
  getAnimation: (local?: boolean) => boolean;
  /** Helper: resolve bordered default. */
  getBordered: (component?: keyof ComponentOverrides, local?: boolean) => boolean;
}

// ── Sensible Defaults ────────────────────────────────────────────────────────

const DEFAULT_COMPONENT_DEFAULTS: Required<ComponentDefaults> = {
  size: 'md',
  variant: 'default',
  animation: true,
  bordered: true,
};

const DEFAULT_CONFIG: ConfigContextValue = {
  locale: 'en-US',
  direction: 'ltr',
  componentDefaults: DEFAULT_COMPONENT_DEFAULTS,
  componentOverrides: {},
  prefixCls: 'tkx',
  configured: false,
  cls: (name: string) => `tkx-${name}`,
  getSize: () => 'md',
  getAnimation: () => true,
  getBordered: () => true,
};

// ── Context ──────────────────────────────────────────────────────────────────

const ConfigContext = createContext<ConfigContextValue>(DEFAULT_CONFIG);

// ── Props ────────────────────────────────────────────────────────────────────

export interface TkxConfigProviderProps {
  children: ReactNode;
  /** BCP 47 locale code. Default "en-US". */
  locale?: string;
  /** Text direction. Default "ltr". */
  direction?: 'ltr' | 'rtl';
  /** Global component defaults. Merged with parent provider values. */
  componentDefaults?: ComponentDefaults;
  /** Per-component overrides. Merged shallowly per component key. */
  componentOverrides?: ComponentOverrides;
  /** CSS class prefix. Default "tkx". */
  prefixCls?: string;
}

// ══════════════════════════════════════════════════════════════════════════════
// TkxConfigProvider Component
// ══════════════════════════════════════════════════════════════════════════════

export function TkxConfigProvider({
  children,
  locale,
  direction,
  componentDefaults,
  componentOverrides,
  prefixCls,
}: TkxConfigProviderProps) {
  // Read parent config (supports nesting).
  const parent = useContext(ConfigContext);

  // Merge defaults: child overrides parent.
  const mergedDefaults: Required<ComponentDefaults> = useMemo(
    () => ({
      size: componentDefaults?.size ?? parent.componentDefaults.size,
      variant: componentDefaults?.variant ?? parent.componentDefaults.variant,
      animation: componentDefaults?.animation ?? parent.componentDefaults.animation,
      bordered: componentDefaults?.bordered ?? parent.componentDefaults.bordered,
    }),
    [componentDefaults, parent.componentDefaults],
  );

  // Merge per-component overrides: shallow merge per key.
  const mergedOverrides: ComponentOverrides = useMemo(() => {
    const parentOv = parent.componentOverrides;
    const childOv = componentOverrides ?? {};
    return {
      button: { ...parentOv.button, ...childOv.button },
      input: { ...parentOv.input, ...childOv.input },
      table: { ...parentOv.table, ...childOv.table },
      modal: { ...parentOv.modal, ...childOv.modal },
    };
  }, [componentOverrides, parent.componentOverrides]);

  const resolvedLocale = locale ?? parent.locale;
  const resolvedDirection = direction ?? parent.direction;
  const resolvedPrefix = prefixCls ?? parent.prefixCls;

  // Helper: build prefixed class name.
  const cls = useCallback(
    (name: string) => `${resolvedPrefix}-${name}`,
    [resolvedPrefix],
  );

  // Helper: resolve component size.
  const getSize = useCallback(
    (component?: keyof ComponentOverrides, local?: 'sm' | 'md' | 'lg'): 'sm' | 'md' | 'lg' => {
      // Local prop wins.
      if (local !== undefined) return local;
      // Then per-component override.
      if (component) {
        const ov = mergedOverrides[component] as { size?: 'sm' | 'md' | 'lg' } | undefined;
        if (ov?.size) return ov.size;
      }
      // Then global default.
      return mergedDefaults.size;
    },
    [mergedDefaults.size, mergedOverrides],
  );

  // Helper: resolve animation preference.
  const getAnimation = useCallback(
    (local?: boolean): boolean => {
      if (local !== undefined) return local;
      return mergedDefaults.animation;
    },
    [mergedDefaults.animation],
  );

  // Helper: resolve bordered preference.
  const getBordered = useCallback(
    (component?: keyof ComponentOverrides, local?: boolean): boolean => {
      if (local !== undefined) return local;
      if (component) {
        const ov = mergedOverrides[component] as { bordered?: boolean } | undefined;
        if (ov?.bordered !== undefined) return ov.bordered;
      }
      return mergedDefaults.bordered;
    },
    [mergedDefaults.bordered, mergedOverrides],
  );

  // Assemble context value.
  const value: ConfigContextValue = useMemo(
    () => ({
      locale: resolvedLocale,
      direction: resolvedDirection,
      componentDefaults: mergedDefaults,
      componentOverrides: mergedOverrides,
      prefixCls: resolvedPrefix,
      configured: true,
      cls,
      getSize,
      getAnimation,
      getBordered,
    }),
    [
      resolvedLocale,
      resolvedDirection,
      mergedDefaults,
      mergedOverrides,
      resolvedPrefix,
      cls,
      getSize,
      getAnimation,
      getBordered,
    ],
  );

  // Apply dir attribute to the wrapper so CSS logical properties work.
  // Also set lang attribute for accessibility.
  return (
    <ConfigContext.Provider value={value}>
      <div
        dir={resolvedDirection}
        lang={resolvedLocale}
        className={`${resolvedPrefix}-config-root`}
        style={{ direction: resolvedDirection }}
      >
        {children}
      </div>
    </ConfigContext.Provider>
  );
}

TkxConfigProvider.displayName = 'TkxConfigProvider';

// ══════════════════════════════════════════════════════════════════════════════
// useConfig — Hook for components to read the global configuration.
// ══════════════════════════════════════════════════════════════════════════════

export function useConfig(): ConfigContextValue {
  return useContext(ConfigContext);
}

// ══════════════════════════════════════════════════════════════════════════════
// useDirection — Convenience hook for reading text direction.
// ══════════════════════════════════════════════════════════════════════════════

export function useDirection(): 'ltr' | 'rtl' {
  const { direction } = useConfig();
  return direction;
}

// ══════════════════════════════════════════════════════════════════════════════
// useLocale — Convenience hook for reading the active locale.
// ══════════════════════════════════════════════════════════════════════════════

export function useLocale(): string {
  const { locale } = useConfig();
  return locale;
}

// ══════════════════════════════════════════════════════════════════════════════
// usePrefixCls — Convenience hook for building prefixed class names.
// ══════════════════════════════════════════════════════════════════════════════

export function usePrefixCls(componentName: string, customPrefix?: string): string {
  const { prefixCls } = useConfig();
  const prefix = customPrefix ?? prefixCls;
  return `${prefix}-${componentName}`;
}

// ══════════════════════════════════════════════════════════════════════════════
// useComponentSize — Resolves the effective size for a component.
// ══════════════════════════════════════════════════════════════════════════════

export function useComponentSize(
  component: keyof ComponentOverrides,
  localSize?: 'sm' | 'md' | 'lg',
): 'sm' | 'md' | 'lg' {
  const { getSize } = useConfig();
  return getSize(component, localSize);
}

// ══════════════════════════════════════════════════════════════════════════════
// SIZE & SPACING TOKENS — Maps config sizes to concrete pixel/rem values.
// Components can use these to avoid duplicating size-to-dimension logic.
// ══════════════════════════════════════════════════════════════════════════════

export const SIZE_HEIGHT: Record<'sm' | 'md' | 'lg', number> = {
  sm: 32,
  md: 40,
  lg: 48,
};

export const SIZE_FONT: Record<'sm' | 'md' | 'lg', string> = {
  sm: '0.75rem',
  md: '0.875rem',
  lg: '1rem',
};

export const SIZE_PADDING_X: Record<'sm' | 'md' | 'lg', number> = {
  sm: 8,
  md: 12,
  lg: 16,
};

export const SIZE_PADDING_Y: Record<'sm' | 'md' | 'lg', number> = {
  sm: 4,
  md: 8,
  lg: 12,
};

export const SIZE_BORDER_RADIUS: Record<'sm' | 'md' | 'lg', number> = {
  sm: 4,
  md: 6,
  lg: 8,
};

export const SIZE_ICON: Record<'sm' | 'md' | 'lg', number> = {
  sm: 14,
  md: 16,
  lg: 20,
};

// ══════════════════════════════════════════════════════════════════════════════
// RTL Utilities
// ══════════════════════════════════════════════════════════════════════════════

/** Returns a transform that flips an element horizontally for RTL layouts. */
export function useRtlFlip(): CSSProperties | undefined {
  const { direction } = useConfig();
  if (direction === 'rtl') {
    return { transform: 'scaleX(-1)' };
  }
  return undefined;
}

/** Returns logical margin/padding properties that respect direction. */
export function useLogicalSpacing(
  inlineStart: number | string,
  inlineEnd: number | string = 0,
): CSSProperties {
  const { direction } = useConfig();
  const start = typeof inlineStart === 'number' ? `${inlineStart}px` : inlineStart;
  const end = typeof inlineEnd === 'number' ? `${inlineEnd}px` : inlineEnd;

  if (direction === 'rtl') {
    return { marginRight: start, marginLeft: end };
  }
  return { marginLeft: start, marginRight: end };
}

// ══════════════════════════════════════════════════════════════════════════════
// Locale Utilities
// ══════════════════════════════════════════════════════════════════════════════

/** Built-in locale display names for the most common locales. */
const LOCALE_DISPLAY_NAMES: Record<string, string> = {
  'en-US': 'English (US)',
  'en-GB': 'English (UK)',
  'es-ES': 'Spanish',
  'fr-FR': 'French',
  'de-DE': 'German',
  'ja-JP': 'Japanese',
  'ko-KR': 'Korean',
  'zh-CN': 'Chinese (Simplified)',
  'zh-TW': 'Chinese (Traditional)',
  'pt-BR': 'Portuguese (Brazil)',
  'ar-SA': 'Arabic',
  'hi-IN': 'Hindi',
  'ru-RU': 'Russian',
  'it-IT': 'Italian',
  'nl-NL': 'Dutch',
  'sv-SE': 'Swedish',
  'pl-PL': 'Polish',
  'tr-TR': 'Turkish',
  'th-TH': 'Thai',
  'vi-VN': 'Vietnamese',
};

/** RTL locales — used to auto-detect direction when not explicitly set. */
const RTL_LOCALES = new Set([
  'ar', 'ar-SA', 'ar-EG', 'ar-AE',
  'he', 'he-IL',
  'fa', 'fa-IR',
  'ur', 'ur-PK',
  'ps', 'ps-AF',
]);

/**
 * Returns true if the given locale code is typically written right-to-left.
 * Useful for auto-setting direction based on locale.
 */
export function isRtlLocale(locale: string): boolean {
  return RTL_LOCALES.has(locale) || RTL_LOCALES.has(locale.split('-')[0]);
}

/**
 * Returns the human-readable name for a locale code, falling back to
 * the Intl.DisplayNames API or the raw code itself.
 */
export function getLocaleDisplayName(locale: string): string {
  if (LOCALE_DISPLAY_NAMES[locale]) return LOCALE_DISPLAY_NAMES[locale];

  if (typeof Intl !== 'undefined' && Intl.DisplayNames) {
    try {
      const dn = new Intl.DisplayNames(['en'], { type: 'language' });
      return dn.of(locale) ?? locale;
    } catch {
      return locale;
    }
  }

  return locale;
}

// ══════════════════════════════════════════════════════════════════════════════
// Usage example:
//
// <TkxConfigProvider
//   locale="ja-JP"
//   direction="ltr"
//   componentDefaults={{ size: 'sm', animation: true, bordered: false }}
//   componentOverrides={{ table: { striped: true } }}
//   prefixCls="myapp"
// >
//   <App />
// </TkxConfigProvider>
//
// Inside any component:
//   const { locale, direction, getSize, cls } = useConfig();
//   const size = getSize('button', props.size);
//   const className = cls('button');
// ══════════════════════════════════════════════════════════════════════════════
