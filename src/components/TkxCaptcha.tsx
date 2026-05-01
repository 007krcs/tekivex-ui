'use client';

import {
  useCallback,
  useState,
  type CSSProperties,
  type PointerEvent,
} from 'react';
import { useTheme } from '../themes';
import type {
  Challenge,
  ImageGridChallenge,
  MathChallenge,
  SliderChallenge,
} from '../engine/captcha';

export interface TkxCaptchaProps {
  challenge: Challenge;
  /** Called with the user's submitted answer. The caller verifies via the
   *  CaptchaIssuer or verifySignedSolution. */
  onSubmit: (answer: number | ReadonlyArray<string>) => void;
  /** Optional alternative challenge generator triggered by the "Reload" button. */
  onReload?: () => void;
  /** Localized labels — supplied by the host's i18n layer. */
  labels?: {
    promptMath?: string;
    promptSlider?: string;
    promptImage?: string;
    submit?: string;
    reload?: string;
    answerLabel?: string;
  };
  className?: string;
  style?: CSSProperties;
}

const DEFAULT_LABELS: Required<NonNullable<TkxCaptchaProps['labels']>> = {
  promptMath: 'Solve to continue',
  promptSlider: 'Drag the handle to the marker',
  promptImage: 'Pick the items that match',
  submit: 'Verify',
  reload: 'Reload',
  answerLabel: 'Answer',
};

/**
 * Renders any of the three engine/captcha challenge types and returns the
 * user-supplied answer through onSubmit. UI only — verification is the host's
 * responsibility (via CaptchaIssuer.verify or verifySignedSolution).
 */
export function TkxCaptcha({
  challenge,
  onSubmit,
  onReload,
  labels,
  className,
  style,
}: TkxCaptchaProps) {
  const theme = useTheme();
  const L = { ...DEFAULT_LABELS, ...labels };

  if (challenge.type === 'math') {
    return (
      <CaptchaShell labels={L} onReload={onReload} className={className} style={style}>
        <MathBody challenge={challenge} onSubmit={onSubmit} labels={L} theme={theme} />
      </CaptchaShell>
    );
  }
  if (challenge.type === 'slider') {
    return (
      <CaptchaShell labels={L} onReload={onReload} className={className} style={style}>
        <SliderBody challenge={challenge} onSubmit={onSubmit} labels={L} theme={theme} />
      </CaptchaShell>
    );
  }
  return (
    <CaptchaShell labels={L} onReload={onReload} className={className} style={style}>
      <ImageGridBody challenge={challenge} onSubmit={onSubmit} labels={L} theme={theme} />
    </CaptchaShell>
  );
}

TkxCaptcha.displayName = 'TkxCaptcha';

/* -------------------------------------------------------------------------- */
/* Shell                                                                       */
/* -------------------------------------------------------------------------- */

function CaptchaShell({
  children,
  onReload,
  labels,
  className,
  style,
}: {
  children: React.ReactNode;
  onReload?: () => void;
  labels: Required<NonNullable<TkxCaptchaProps['labels']>>;
  className?: string;
  style?: CSSProperties;
}) {
  const theme = useTheme();
  return (
    <div
      className={className}
      data-tkx-captcha=""
      style={{
        border: `1px solid ${theme.border}`,
        borderRadius: 8,
        padding: 16,
        background: theme.surface,
        ...style,
      }}
    >
      {children}
      {onReload && (
        <button
          type="button"
          onClick={onReload}
          style={{
            marginTop: 8,
            background: 'transparent',
            border: 'none',
            color: theme.textMuted,
            cursor: 'pointer',
            fontSize: '0.75rem',
          }}
        >
          ↻ {labels.reload}
        </button>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Math                                                                        */
/* -------------------------------------------------------------------------- */

function MathBody({
  challenge,
  onSubmit,
  labels,
  theme,
}: {
  challenge: MathChallenge;
  onSubmit: TkxCaptchaProps['onSubmit'];
  labels: Required<NonNullable<TkxCaptchaProps['labels']>>;
  theme: ReturnType<typeof useTheme>;
}) {
  const [val, setVal] = useState('');

  return (
    <div>
      <p style={{ margin: 0, fontSize: '0.875rem', color: theme.textMuted }}>
        {labels.promptMath}
      </p>
      <div
        style={{
          marginTop: 8,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <code style={{ fontSize: '1.25rem', color: theme.text }}>
          {challenge.question} =
        </code>
        <input
          type="number"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          aria-label={labels.answerLabel}
          inputMode="numeric"
          style={{
            width: 80,
            padding: '6px 8px',
            border: `1px solid ${theme.border}`,
            borderRadius: 6,
            fontSize: '1rem',
          }}
        />
        <button
          type="button"
          onClick={() => onSubmit(Number(val))}
          disabled={val === ''}
          style={{
            padding: '6px 12px',
            background: theme.primary,
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            cursor: val === '' ? 'not-allowed' : 'pointer',
            opacity: val === '' ? 0.5 : 1,
          }}
        >
          {labels.submit}
        </button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Slider                                                                      */
/* -------------------------------------------------------------------------- */

function SliderBody({
  challenge,
  onSubmit,
  labels,
  theme,
}: {
  challenge: SliderChallenge;
  onSubmit: TkxCaptchaProps['onSubmit'];
  labels: Required<NonNullable<TkxCaptchaProps['labels']>>;
  theme: ReturnType<typeof useTheme>;
}) {
  const [pos, setPos] = useState(0);
  const [dragging, setDragging] = useState(false);

  const onPointerDown = (e: PointerEvent<HTMLDivElement>): void => {
    const t = e.target as HTMLElement & { setPointerCapture?: (id: number) => void };
    if (typeof t.setPointerCapture === 'function') t.setPointerCapture(e.pointerId);
    setDragging(true);
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>): void => {
    if (!dragging) return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const next = Math.max(0, Math.min(challenge.trackWidth, e.clientX - rect.left));
    setPos(next);
  };
  const onPointerUp = (): void => {
    setDragging(false);
    onSubmit(pos);
  };

  return (
    <div>
      <p style={{ margin: 0, fontSize: '0.875rem', color: theme.textMuted }}>
        {labels.promptSlider}
      </p>
      <div
        role="slider"
        aria-valuemin={0}
        aria-valuemax={challenge.trackWidth}
        aria-valuenow={pos}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{
          position: 'relative',
          marginTop: 12,
          height: 32,
          width: challenge.trackWidth,
          background: theme.surfaceAlt,
          border: `1px solid ${theme.border}`,
          borderRadius: 16,
          touchAction: 'none',
        }}
      >
        {/* Target marker */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            left: challenge.target - 1,
            top: 4,
            bottom: 4,
            width: 2,
            background: theme.success ?? '#10b981',
          }}
        />
        {/* Drag handle */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            left: pos - 12,
            top: 4,
            width: 24,
            height: 24,
            borderRadius: 12,
            background: theme.primary,
            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
          }}
        />
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Image grid                                                                  */
/* -------------------------------------------------------------------------- */

function ImageGridBody({
  challenge,
  onSubmit,
  labels,
  theme,
}: {
  challenge: ImageGridChallenge;
  onSubmit: TkxCaptchaProps['onSubmit'];
  labels: Required<NonNullable<TkxCaptchaProps['labels']>>;
  theme: ReturnType<typeof useTheme>;
}) {
  const [picked, setPicked] = useState<Set<string>>(new Set());

  const toggle = useCallback((id: string) => {
    setPicked((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }, []);

  const cols = 3;

  return (
    <div>
      <p style={{ margin: 0, fontSize: '0.875rem', color: theme.textMuted }}>
        {challenge.prompt || labels.promptImage}
      </p>
      <div
        role="group"
        aria-label={labels.promptImage}
        style={{
          marginTop: 8,
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gap: 4,
        }}
      >
        {challenge.items.map((it) => {
          const sel = picked.has(it.id);
          return (
            <button
              key={it.id}
              type="button"
              aria-pressed={sel}
              onClick={() => toggle(it.id)}
              style={{
                aspectRatio: '1 / 1',
                border: `2px solid ${sel ? theme.primary : theme.border}`,
                borderRadius: 6,
                background: sel ? `${theme.primary}22` : theme.surfaceAlt,
                cursor: 'pointer',
                fontSize: '0.875rem',
                color: theme.text,
              }}
            >
              {it.label}
            </button>
          );
        })}
      </div>
      <button
        type="button"
        onClick={() => onSubmit([...picked])}
        disabled={picked.size === 0}
        style={{
          marginTop: 8,
          padding: '6px 12px',
          background: theme.primary,
          color: '#fff',
          border: 'none',
          borderRadius: 6,
          cursor: picked.size === 0 ? 'not-allowed' : 'pointer',
          opacity: picked.size === 0 ? 0.5 : 1,
        }}
      >
        {labels.submit}
      </button>
    </div>
  );
}
