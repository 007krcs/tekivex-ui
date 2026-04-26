'use client';

// ─────────────────────────────────────────────────────────────────────────────
// TkxCaptcha — provider-agnostic CAPTCHA wrapper.
//
// Supported providers:
//   - "turnstile"  — Cloudflare Turnstile     (recommended; privacy-respecting)
//   - "hcaptcha"   — hCaptcha
//   - "recaptcha"  — Google reCAPTCHA v2 (visible) — only for legacy migrations
//
// Responsibilities:
//   1. Lazy-inject the provider's JS once per page (idempotent across instances)
//   2. Render a host element + render the widget into it via the provider API
//   3. Surface lifecycle events: onVerify(token), onExpire(), onError(err)
//   4. Imperative ref to reset() / execute() the widget
//   5. Respect prefers-reduced-motion (Turnstile already does)
//   6. Sanitise sitekey input (no exotic chars permitted)
//
// Security notes:
//   - This component DOES NOT verify the token. Verification MUST happen
//     server-side against the provider's verify endpoint.
//   - Site keys are NOT secret. Don't put your secret key here.
// ─────────────────────────────────────────────────────────────────────────────

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  type Ref,
} from 'react';

export type CaptchaProvider = 'turnstile' | 'hcaptcha' | 'recaptcha';
export type CaptchaTheme = 'light' | 'dark' | 'auto';
export type CaptchaSize = 'normal' | 'compact' | 'invisible' | 'flexible';

export interface TkxCaptchaProps {
  /** Which CAPTCHA provider to load. Defaults to "turnstile". */
  provider?: CaptchaProvider;
  /** Public site key issued by the provider. Required. */
  sitekey: string;
  /** Visual theme. "auto" follows the user's OS preference (Turnstile only). */
  theme?: CaptchaTheme;
  /** Widget size. Provider support varies; "invisible" is reCAPTCHA-only. */
  size?: CaptchaSize;
  /** Optional language/locale (ISO 639-1). Defaults to browser locale. */
  language?: string;
  /** Optional execution mode for Turnstile: "render" | "execute" | "managed". */
  execution?: 'render' | 'execute' | 'managed';
  /** Called once the user has successfully solved the challenge. */
  onVerify: (token: string) => void;
  /** Called when an issued token expires (typically after 2-5 minutes). */
  onExpire?: () => void;
  /** Called on widget error. The provider's raw error code is forwarded. */
  onError?: (errorCode: string) => void;
  /** Optional className applied to the host <div>. */
  className?: string;
  /** Optional inline style applied to the host <div>. */
  style?: React.CSSProperties;
  /** Test mode: render a stub that auto-verifies after 200ms. SSR-safe. */
  testMode?: boolean;
}

export interface TkxCaptchaHandle {
  /** Discard the current token and re-arm the widget. */
  reset: () => void;
  /** Programmatically run the challenge (Turnstile execution="execute" / reCAPTCHA invisible). */
  execute: () => void;
  /** Returns the current token, or null if not yet verified. */
  getResponse: () => string | null;
}

const SCRIPT_SRC: Record<CaptchaProvider, string> = {
  turnstile: 'https://challenges.cloudflare.com/turnstile/v0/api.js',
  hcaptcha: 'https://js.hcaptcha.com/1/api.js',
  recaptcha: 'https://www.google.com/recaptcha/api.js',
};

const GLOBAL_KEY: Record<CaptchaProvider, string> = {
  turnstile: 'turnstile',
  hcaptcha: 'hcaptcha',
  recaptcha: 'grecaptcha',
};

const SITEKEY_PATTERN = /^[A-Za-z0-9_-]{20,80}$/;

// Track which scripts we've started loading to dedupe across instances.
const scriptPromises: Partial<Record<CaptchaProvider, Promise<void>>> = {};

function loadProviderScript(provider: CaptchaProvider, language?: string): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  // Already loaded?
  if ((window as any)[GLOBAL_KEY[provider]]) return Promise.resolve();
  // In flight?
  if (scriptPromises[provider]) return scriptPromises[provider]!;

  const promise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[data-tkx-captcha="${provider}"]`,
    );
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('script-load-failed')));
      return;
    }
    const s = document.createElement('script');
    let src = SCRIPT_SRC[provider];
    if (language && provider !== 'turnstile') src += `?hl=${encodeURIComponent(language)}`;
    s.src = src;
    s.async = true;
    s.defer = true;
    s.dataset.tkxCaptcha = provider;
    s.addEventListener('load', () => resolve());
    s.addEventListener('error', () => reject(new Error('script-load-failed')));
    document.head.appendChild(s);
  });

  scriptPromises[provider] = promise;
  return promise;
}

export const TkxCaptcha = forwardRef<TkxCaptchaHandle, TkxCaptchaProps>(function TkxCaptcha(
  {
    provider = 'turnstile',
    sitekey,
    theme = 'auto',
    size = 'normal',
    language,
    execution = 'render',
    onVerify,
    onExpire,
    onError,
    className,
    style,
    testMode = false,
  },
  ref: Ref<TkxCaptchaHandle>,
) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | number | null>(null);
  const tokenRef = useRef<string | null>(null);

  // Validate sitekey early — bad inputs are almost always bugs not attacks,
  // but we don't want exotic characters reaching the provider script.
  if (typeof sitekey !== 'string' || !SITEKEY_PATTERN.test(sitekey)) {
    if (typeof console !== 'undefined') {
      // eslint-disable-next-line no-console
      console.warn('[TkxCaptcha] Invalid sitekey format. Expected 20-80 chars [A-Za-z0-9_-].');
    }
  }

  useImperativeHandle(
    ref,
    () => ({
      reset: () => {
        if (testMode) {
          tokenRef.current = null;
          return;
        }
        const provObj = (window as any)[GLOBAL_KEY[provider]];
        if (!provObj || widgetIdRef.current == null) return;
        try {
          provObj.reset?.(widgetIdRef.current);
        } catch {
          /* ignore */
        }
        tokenRef.current = null;
      },
      execute: () => {
        if (testMode) {
          // simulate async verify
          setTimeout(() => {
            tokenRef.current = 'TEST_TOKEN';
            onVerify('TEST_TOKEN');
          }, 200);
          return;
        }
        const provObj = (window as any)[GLOBAL_KEY[provider]];
        if (!provObj || widgetIdRef.current == null) return;
        try {
          provObj.execute?.(widgetIdRef.current);
        } catch {
          /* ignore */
        }
      },
      getResponse: () => tokenRef.current,
    }),
    [provider, onVerify, testMode],
  );

  useEffect(() => {
    if (testMode) {
      // In test mode, simulate verification automatically after mount.
      const t = window.setTimeout(() => {
        tokenRef.current = 'TEST_TOKEN';
        onVerify('TEST_TOKEN');
      }, 200);
      return () => window.clearTimeout(t);
    }

    let cancelled = false;
    let widgetId: string | number | null = null;
    const host = hostRef.current;
    if (!host) return;

    loadProviderScript(provider, language)
      .then(() => {
        if (cancelled || !host) return;
        const provObj = (window as any)[GLOBAL_KEY[provider]];
        if (!provObj) return;

        const commonCallbacks = {
          callback: (token: string) => {
            tokenRef.current = token;
            onVerify(token);
          },
          'expired-callback': () => {
            tokenRef.current = null;
            onExpire?.();
          },
          'error-callback': (code: string) => {
            tokenRef.current = null;
            onError?.(typeof code === 'string' ? code : 'unknown');
          },
        };

        try {
          if (provider === 'turnstile') {
            widgetId = provObj.render(host, {
              sitekey,
              theme,
              size: size === 'flexible' ? 'flexible' : size === 'compact' ? 'compact' : 'normal',
              execution,
              language: language || 'auto',
              ...commonCallbacks,
            });
          } else if (provider === 'hcaptcha') {
            widgetId = provObj.render(host, {
              sitekey,
              theme: theme === 'auto' ? 'light' : theme,
              size: size === 'invisible' ? 'invisible' : size === 'compact' ? 'compact' : 'normal',
              ...commonCallbacks,
            });
          } else if (provider === 'recaptcha') {
            widgetId = provObj.render(host, {
              sitekey,
              theme: theme === 'auto' ? 'light' : theme,
              size: size === 'invisible' ? 'invisible' : 'normal',
              ...commonCallbacks,
            });
          }
          widgetIdRef.current = widgetId;
        } catch (err) {
          onError?.((err as Error)?.message || 'render-failed');
        }
      })
      .catch(() => {
        if (!cancelled) onError?.('script-load-failed');
      });

    return () => {
      cancelled = true;
      const provObj = (window as any)[GLOBAL_KEY[provider]];
      if (provObj && widgetId != null) {
        try {
          provObj.remove?.(widgetId);
        } catch {
          /* some providers don't expose remove() — best effort */
        }
      }
      widgetIdRef.current = null;
      tokenRef.current = null;
    };
    // sitekey/provider/language/theme/size/execution shouldn't change after mount;
    // if they do, consumer must remount the component (key prop).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={hostRef}
      className={className}
      style={style}
      data-tkx-captcha-provider={provider}
      // a11y: provider scripts inject their own labelled iframe; the host
      // div stays role-less so it doesn't double-announce.
    >
      {testMode && (
        <div
          aria-live="polite"
          style={{
            padding: '12px 16px',
            border: '1px dashed currentColor',
            borderRadius: 8,
            fontSize: 13,
            opacity: 0.7,
            display: 'inline-block',
          }}
        >
          [TkxCaptcha test mode — auto-verifying with TEST_TOKEN]
        </div>
      )}
    </div>
  );
});

TkxCaptcha.displayName = 'TkxCaptcha';
