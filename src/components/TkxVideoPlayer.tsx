'use client';

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { useTheme } from '../themes';
import { sanitizeString } from '../engine/security';
import { useReducedMotion } from '../hooks';

// ── Types ────────────────────────────────────────────────────────────────────

export interface VideoChapter {
  time: number;
  label: string;
}

export interface VideoSubtitle {
  label: string;
  src: string;
  lang: string;
  default?: boolean;
}

export interface TkxVideoPlayerProps {
  src: string | { src: string; type: string }[];
  poster?: string;
  title?: string;
  width?: string | number;
  height?: string | number;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;
  showTitle?: boolean;
  allowFullscreen?: boolean;
  allowPiP?: boolean;
  allowDownload?: boolean;
  chapters?: VideoChapter[];
  subtitles?: VideoSubtitle[];
  startTime?: number;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  className?: string;
  style?: CSSProperties;
}

// ── Utility ──────────────────────────────────────────────────────────────────

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || isNaN(seconds)) return '0:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${m}:${String(s).padStart(2, '0')}`;
}

// ── Icon primitives (inline SVG) ─────────────────────────────────────────────

function SvgIcon({ path, size = 20, color = 'currentColor', title }: { path: string; size?: number; color?: string; title?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      aria-hidden={title ? undefined : 'true'}
      role={title ? 'img' : undefined}
      aria-label={title}
      style={{ display: 'block', flexShrink: 0 }}
    >
      <path d={path} />
    </svg>
  );
}

// Material-style path data
const ICONS = {
  play: 'M8 5v14l11-7z',
  pause: 'M6 19h4V5H6v14zm8-14v14h4V5h-4z',
  volumeUp: 'M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z',
  volumeMute: 'M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z',
  volumeDown: 'M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z',
  fullscreen: 'M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z',
  fullscreenExit: 'M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z',
  pip: 'M19 11h-8v6h8v-6zm4 8V4.98C23 3.88 22.1 3 21 3H3c-1.1 0-2 .88-2 1.98V19c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2zm-2 .02H3V4.97h18v14.05z',
  download: 'M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z',
  closedCaption: 'M19 4H5c-1.11 0-2 .9-2 2v12c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-8 7H9.5v-.5h-2v3h2V13H11v1c0 .55-.45 1-1 1H7c-.55 0-1-.45-1-1v-4c0-.55.45-1 1-1h3c.55 0 1 .45 1 1v1zm7 0h-1.5v-.5h-2v3h2V13H18v1c0 .55-.45 1-1 1h-3c-.55 0-1-.45-1-1v-4c0-.55.45-1 1-1h3c.55 0 1 .45 1 1v1z',
  settings: 'M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z',
  replay10: 'M11.99 5V1l-5 5 5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6h-2c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z',
  forward10: 'M18 13c0 3.31-2.69 6-6 6s-6-2.69-6-6h-2c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8V1l-5 5 5 5V7c3.31 0 6 2.69 6 6z',
  errorOutline: 'M11 15h2v2h-2zm0-8h2v6h-2zm.99-5C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z',
  refresh: 'M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z',
};

// ── Control button ────────────────────────────────────────────────────────────

function CtrlBtn({
  onClick,
  title,
  children,
  active,
  primary,
}: {
  onClick: () => void;
  title: string;
  children: ReactNode;
  active?: boolean;
  primary: string;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'none',
        border: 'none',
        padding: '6px',
        cursor: 'pointer',
        color: active ? primary : hovered ? primary : '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '4px',
        flexShrink: 0,
        transition: 'color 0.15s ease',
      }}
    >
      {children}
    </button>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function TkxVideoPlayer({
  src,
  poster,
  title,
  width = '100%',
  height,
  autoPlay = false,
  loop = false,
  muted: initialMuted = false,
  controls = true,
  showTitle = true,
  allowFullscreen = true,
  allowPiP = true,
  allowDownload = false,
  chapters = [],
  subtitles = [],
  startTime,
  onPlay,
  onPause,
  onEnded,
  onTimeUpdate,
  className,
  style,
}: TkxVideoPlayerProps) {
  const theme = useTheme();
  const reducedMotion = useReducedMotion();

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(initialMuted);
  const [fullscreen, setFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [controlsLocked, setControlsLocked] = useState(false); // locked visible when paused
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [subtitleIdx, setSubtitleIdx] = useState<number>(-1); // -1 = off
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverX, setHoverX] = useState(0);
  const [centerFlash, setCenterFlash] = useState<'play' | 'pause' | null>(null);
  const [isPiP, setIsPiP] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [volumeHover, setVolumeHover] = useState(false);

  // ── Video event wiring ────────────────────────────────────────────────────

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    if (startTime !== undefined) v.currentTime = startTime;

    const onTimeUpdate = () => {
      setCurrentTime(v.currentTime);
      if (v.buffered.length > 0) {
        setBuffered(v.buffered.end(v.buffered.length - 1));
      }
    };
    const onDurationChange = () => setDuration(v.duration);
    const onPlayEvt = () => setPlaying(true);
    const onPauseEvt = () => { setPlaying(false); setControlsLocked(true); };
    const onEndedEvt = () => { setPlaying(false); setControlsLocked(true); onEnded?.(); };
    const onPiPEnter = () => setIsPiP(true);
    const onPiPLeave = () => setIsPiP(false);
    const onWaiting = () => setIsBuffering(true);
    const onCanPlay = () => setIsBuffering(false);
    const onError = () => {
      const err = v.error;
      setVideoError(err ? `Error ${err.code}: ${err.message || 'Failed to load video'}` : 'Failed to load video');
      setIsBuffering(false);
    };

    v.addEventListener('timeupdate', onTimeUpdate);
    v.addEventListener('durationchange', onDurationChange);
    v.addEventListener('play', onPlayEvt);
    v.addEventListener('pause', onPauseEvt);
    v.addEventListener('ended', onEndedEvt);
    v.addEventListener('enterpictureinpicture', onPiPEnter);
    v.addEventListener('leavepictureinpicture', onPiPLeave);
    v.addEventListener('waiting', onWaiting);
    v.addEventListener('canplay', onCanPlay);
    v.addEventListener('error', onError);

    return () => {
      v.removeEventListener('timeupdate', onTimeUpdate);
      v.removeEventListener('durationchange', onDurationChange);
      v.removeEventListener('play', onPlayEvt);
      v.removeEventListener('pause', onPauseEvt);
      v.removeEventListener('ended', onEndedEvt);
      v.removeEventListener('enterpictureinpicture', onPiPEnter);
      v.removeEventListener('leavepictureinpicture', onPiPLeave);
      v.removeEventListener('waiting', onWaiting);
      v.removeEventListener('canplay', onCanPlay);
      v.removeEventListener('error', onError);
    };
  }, [onEnded, startTime]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (playing) {
      onPlay?.();
    } else {
      onPause?.();
    }
  }, [playing, onPlay, onPause]);

  useEffect(() => {
    onTimeUpdate?.(currentTime, duration);
  }, [currentTime, duration, onTimeUpdate]);

  // ── Subtitle track activation ─────────────────────────────────────────────

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const tracks = v.textTracks;
    for (let i = 0; i < tracks.length; i++) {
      tracks[i].mode = i === subtitleIdx ? 'showing' : 'disabled';
    }
  }, [subtitleIdx]);

  // ── Fullscreen listener ───────────────────────────────────────────────────

  useEffect(() => {
    const onFSChange = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFSChange);
    return () => document.removeEventListener('fullscreenchange', onFSChange);
  }, []);

  // ── Keyboard shortcuts ────────────────────────────────────────────────────

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onKey = (e: KeyboardEvent) => {
      const v = videoRef.current;
      if (!v) return;
      if ((e.target as HTMLElement).tagName === 'INPUT') return;

      switch (e.key) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'f':
        case 'F':
          if (allowFullscreen) toggleFullscreen();
          break;
        case 'm':
        case 'M':
          toggleMute();
          break;
        case 'ArrowRight':
          e.preventDefault();
          v.currentTime = Math.min(v.currentTime + 10, v.duration);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          v.currentTime = Math.max(v.currentTime - 10, 0);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setVolume(Math.min(volume + 0.1, 1));
          if (videoRef.current) videoRef.current.volume = Math.min(volume + 0.1, 1);
          break;
        case 'ArrowDown':
          e.preventDefault();
          setVolume(Math.max(volume - 0.1, 0));
          if (videoRef.current) videoRef.current.volume = Math.max(volume - 0.1, 0);
          break;
      }
    };

    container.addEventListener('keydown', onKey);
    return () => container.removeEventListener('keydown', onKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [volume, allowFullscreen]);

  // ── Controls visibility ───────────────────────────────────────────────────

  const resetHideTimer = useCallback(() => {
    setShowControls(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      if (playing) setShowControls(false);
    }, 3000);
  }, [playing]);

  useEffect(() => {
    resetHideTimer();
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [playing, resetHideTimer]);

  // ── Actions ───────────────────────────────────────────────────────────────

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play().catch(() => {});
      setCenterFlash('play');
      setControlsLocked(false);
    } else {
      v.pause();
      setCenterFlash('pause');
    }
    setTimeout(() => setCenterFlash(null), 600);
  }, []);

  const toggleMute = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    const next = !muted;
    setMuted(next);
    v.muted = next;
  }, [muted]);

  const toggleFullscreen = useCallback(() => {
    const c = containerRef.current;
    if (!c) return;
    if (!document.fullscreenElement) {
      c.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }, []);

  const togglePiP = useCallback(async () => {
    const v = videoRef.current;
    if (!v) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await v.requestPictureInPicture();
      }
    } catch {
      // PiP not supported or denied
    }
  }, []);

  const cycleSubtitle = useCallback(() => {
    if (subtitles.length === 0) return;
    setSubtitleIdx((i) => (i + 1) % (subtitles.length + 1) - 1);
    // cycles: -1, 0, 1, ..., subtitles.length-1, -1
    setSubtitleIdx((i) => {
      const next = i + 1;
      return next >= subtitles.length ? -1 : next;
    });
  }, [subtitles.length]);

  const skipForward = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Math.min(v.currentTime + 10, v.duration || 0);
  }, []);

  const skipBack = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Math.max(v.currentTime - 10, 0);
  }, []);

  const retryLoad = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    setVideoError(null);
    v.load();
  }, []);

  const handleDoubleClick = useCallback(() => {
    if (allowFullscreen) toggleFullscreen();
  }, [allowFullscreen, toggleFullscreen]);

  const seek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const v = videoRef.current;
    const bar = progressRef.current;
    if (!v || !bar || !duration) return;
    const rect = bar.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    v.currentTime = ratio * duration;
  }, [duration]);

  const onProgressHover = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const bar = progressRef.current;
    if (!bar || !duration) return;
    const rect = bar.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setHoverTime(ratio * duration);
    setHoverX(e.clientX - rect.left);
  }, [duration]);

  const changeVolume = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (videoRef.current) {
      videoRef.current.volume = v;
      videoRef.current.muted = v === 0;
      setMuted(v === 0);
    }
  }, []);

  const changeSpeed = useCallback((rate: number) => {
    setPlaybackRate(rate);
    if (videoRef.current) videoRef.current.playbackRate = rate;
    setShowSpeedMenu(false);
  }, []);

  // ── Chapter lookup ────────────────────────────────────────────────────────

  const currentChapter = chapters.length > 0
    ? [...chapters].reverse().find((c) => currentTime >= c.time)
    : null;

  const getChapterAtTime = (t: number) => {
    return [...chapters].reverse().find((c) => t >= c.time) ?? null;
  };

  // ── Source resolution ─────────────────────────────────────────────────────

  const sources = Array.isArray(src) ? src : [{ src, type: 'video/mp4' }];
  const downloadSrc = Array.isArray(src) ? src[0].src : src;

  // ── Render ────────────────────────────────────────────────────────────────

  const controlsVisible = showControls || controlsLocked || !playing;
  const transition = reducedMotion ? 'none' : 'opacity 0.25s ease';

  const volumeIcon = muted || volume === 0
    ? ICONS.volumeMute
    : volume < 0.5
      ? ICONS.volumeDown
      : ICONS.volumeUp;

  const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;
  const bufferedPct = duration > 0 ? (buffered / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className={className}
      tabIndex={0}
      onMouseMove={resetHideTimer}
      onMouseLeave={() => { if (playing) setShowControls(false); }}
      style={{
        position: 'relative',
        width,
        height: height ?? 'auto',
        background: '#000',
        borderRadius: '8px',
        overflow: 'hidden',
        outline: 'none',
        userSelect: 'none',
        ...style,
      }}
    >
      {/* Video element */}
      <video
        ref={videoRef}
        style={{ width: '100%', height: '100%', display: 'block', objectFit: 'contain' }}
        poster={poster}
        autoPlay={autoPlay}
        loop={loop}
        muted={initialMuted}
        playsInline
        onClick={togglePlay}
        onDoubleClick={handleDoubleClick}
      >
        {sources.map((s, i) => (
          <source key={i} src={s.src} type={s.type} />
        ))}
        {subtitles.map((sub, i) => (
          <track
            key={i}
            kind="subtitles"
            label={sanitizeString(sub.label)}
            srcLang={sub.lang}
            src={sub.src}
            default={sub.default}
          />
        ))}
      </video>

      {/* Title overlay */}
      {showTitle && title && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.75) 0%, transparent 100%)',
            padding: '16px 16px 32px',
            opacity: controlsVisible ? 1 : 0,
            transition,
            pointerEvents: 'none',
          }}
        >
          <span
            style={{
              color: '#fff',
              fontSize: '0.95rem',
              fontWeight: 600,
              textShadow: '0 1px 3px rgba(0,0,0,0.7)',
            }}
          >
            {sanitizeString(title)}
          </span>
          {currentChapter && (
            <span style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.8rem', marginLeft: 8 }}>
              — {sanitizeString(currentChapter.label)}
            </span>
          )}
        </div>
      )}

      {/* Center play/pause flash */}
      {centerFlash && (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'rgba(0,0,0,0.45)',
            borderRadius: '50%',
            width: 64,
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: reducedMotion ? 'none' : 'tkxvp-flash 0.6s ease forwards',
            pointerEvents: 'none',
          }}
        >
          <SvgIcon path={centerFlash === 'play' ? ICONS.play : ICONS.pause} size={32} color="#fff" />
        </div>
      )}

      {/* Loading spinner overlay */}
      {isBuffering && !videoError && (
        <div
          aria-label="Loading"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
            zIndex: 10,
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              border: '4px solid rgba(255,255,255,0.25)',
              borderTopColor: theme.css.primary,
              borderRadius: '50%',
              animation: reducedMotion ? 'none' : 'tkxvp-spin 0.8s linear infinite',
            }}
          />
        </div>
      )}

      {/* Error state overlay */}
      {videoError && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.8)',
            zIndex: 20,
            gap: 12,
          }}
        >
          <SvgIcon path={ICONS.errorOutline} size={48} color="#ef4444" />
          <span style={{ color: '#fff', fontSize: '0.9rem', maxWidth: '80%', textAlign: 'center' }}>
            {videoError}
          </span>
          <button
            type="button"
            onClick={retryLoad}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: theme.css.primary,
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              padding: '8px 18px',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              marginTop: 4,
            }}
          >
            <SvgIcon path={ICONS.refresh} size={18} color="#fff" />
            Retry
          </button>
        </div>
      )}

      {/* Controls bar */}
      {controls && (
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 70%, transparent 100%)',
            padding: '32px 12px 8px',
            opacity: controlsVisible ? 1 : 0,
            transition,
          }}
          onMouseEnter={() => setControlsLocked(true)}
          onMouseLeave={() => setControlsLocked(false)}
        >
          {/* Progress bar */}
          <div
            ref={progressRef}
            role="slider"
            aria-label="Seek"
            aria-valuemin={0}
            aria-valuemax={Math.floor(duration)}
            aria-valuenow={Math.floor(currentTime)}
            tabIndex={0}
            onClick={seek}
            onMouseMove={onProgressHover}
            style={{
              position: 'relative',
              height: 4,
              borderRadius: 2,
              background: 'rgba(255,255,255,0.25)',
              cursor: 'pointer',
              marginBottom: 8,
              transition: 'height 0.15s ease',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.height = '8px'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.height = '4px'; setHoverTime(null); }}
          >
            {/* Buffered */}
            <div
              style={{
                position: 'absolute',
                top: 0, left: 0, bottom: 0,
                width: `${bufferedPct}%`,
                background: 'rgba(255,255,255,0.3)',
                borderRadius: 2,
                pointerEvents: 'none',
              }}
            />
            {/* Progress fill */}
            <div
              style={{
                position: 'absolute',
                top: 0, left: 0, bottom: 0,
                width: `${progressPct}%`,
                background: theme.css.primary,
                borderRadius: 2,
                pointerEvents: 'none',
              }}
            />
            {/* Scrubber thumb */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: `${progressPct}%`,
                transform: 'translate(-50%, -50%)',
                width: 12,
                height: 12,
                borderRadius: '50%',
                background: theme.css.primary,
                pointerEvents: 'none',
              }}
            />
            {/* Chapter markers (dots with hover labels) */}
            {chapters.map((ch, i) => {
              const pct = duration > 0 ? (ch.time / duration) * 100 : 0;
              return (
                <div
                  key={i}
                  title={sanitizeString(ch.label)}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: `${pct}%`,
                    transform: 'translate(-50%, -50%)',
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: '#fff',
                    border: `2px solid ${theme.css.primary}`,
                    zIndex: 2,
                    cursor: 'pointer',
                    pointerEvents: 'auto',
                  }}
                />
              );
            })}
            {/* Hover tooltip */}
            {hoverTime !== null && (
              <div
                style={{
                  position: 'absolute',
                  bottom: 12,
                  left: hoverX,
                  transform: 'translateX(-50%)',
                  background: 'rgba(0,0,0,0.8)',
                  color: '#fff',
                  fontSize: '0.72rem',
                  padding: '2px 6px',
                  borderRadius: 4,
                  whiteSpace: 'nowrap',
                  pointerEvents: 'none',
                }}
              >
                {formatTime(hoverTime)}
                {getChapterAtTime(hoverTime) && (
                  <span style={{ display: 'block', fontSize: '0.65rem', color: 'rgba(255,255,255,0.7)' }}>
                    {sanitizeString(getChapterAtTime(hoverTime)!.label)}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Button row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* Play/Pause */}
            <CtrlBtn onClick={togglePlay} title={playing ? 'Pause' : 'Play'} primary={theme.css.primary}>
              <SvgIcon path={playing ? ICONS.pause : ICONS.play} size={22} />
            </CtrlBtn>

            {/* Skip back 10s */}
            <CtrlBtn onClick={skipBack} title="Skip back 10 seconds" primary={theme.css.primary}>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <SvgIcon path={ICONS.replay10} size={22} />
                <span style={{ position: 'absolute', fontSize: '7px', fontWeight: 700, color: 'currentColor', marginTop: 1 }}>10</span>
              </div>
            </CtrlBtn>

            {/* Skip forward 10s */}
            <CtrlBtn onClick={skipForward} title="Skip forward 10 seconds" primary={theme.css.primary}>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <SvgIcon path={ICONS.forward10} size={22} />
                <span style={{ position: 'absolute', fontSize: '7px', fontWeight: 700, color: 'currentColor', marginTop: 1 }}>10</span>
              </div>
            </CtrlBtn>

            {/* Volume with hover slider */}
            <div
              style={{ display: 'flex', alignItems: 'center', position: 'relative' }}
              onMouseEnter={() => setVolumeHover(true)}
              onMouseLeave={() => setVolumeHover(false)}
            >
              <CtrlBtn onClick={toggleMute} title={muted ? 'Unmute' : 'Mute'} primary={theme.css.primary}>
                <SvgIcon path={volumeIcon} size={20} />
              </CtrlBtn>
              <div
                style={{
                  overflow: 'hidden',
                  width: volumeHover ? 64 : 0,
                  opacity: volumeHover ? 1 : 0,
                  transition: reducedMotion ? 'none' : 'width 0.2s ease, opacity 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={muted ? 0 : volume}
                  onChange={changeVolume}
                  aria-label="Volume"
                  style={{
                    width: 64,
                    accentColor: theme.css.primary,
                    cursor: 'pointer',
                    height: 4,
                  }}
                />
              </div>
            </div>

            {/* Time */}
            <span
              style={{
                color: '#fff',
                fontSize: '0.78rem',
                fontFamily: 'monospace',
                fontVariantNumeric: 'tabular-nums',
                marginLeft: 6,
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>

            {/* Spacer */}
            <div style={{ flex: 1 }} />

            {/* Subtitles */}
            {subtitles.length > 0 && (
              <CtrlBtn
                onClick={cycleSubtitle}
                title="Subtitles"
                primary={theme.css.primary}
                active={subtitleIdx >= 0}
              >
                <SvgIcon path={ICONS.closedCaption} size={20} />
              </CtrlBtn>
            )}

            {/* Playback speed */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => setShowSpeedMenu((v) => !v)}
                title="Playback speed"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#fff',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  padding: '6px 8px',
                  letterSpacing: '0.02em',
                  position: 'relative',
                }}
              >
                {playbackRate}×
              </button>
              {playbackRate !== 1 && (
                <span
                  style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    background: theme.css.primary,
                    color: '#fff',
                    fontSize: '0.55rem',
                    fontWeight: 700,
                    borderRadius: 6,
                    padding: '1px 4px',
                    lineHeight: 1.2,
                    pointerEvents: 'none',
                  }}
                >
                  {playbackRate}x
                </span>
              )}
              {showSpeedMenu && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: '100%',
                    right: 0,
                    background: 'rgba(20,20,20,0.97)',
                    border: `1px solid ${theme.css.border}`,
                    borderRadius: 6,
                    overflow: 'hidden',
                    zIndex: 100,
                    minWidth: 80,
                  }}
                >
                  {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                    <button
                      key={rate}
                      type="button"
                      onClick={() => changeSpeed(rate)}
                      style={{
                        display: 'block',
                        width: '100%',
                        padding: '6px 14px',
                        background: rate === playbackRate ? theme.css.primary + '30' : 'none',
                        border: 'none',
                        color: rate === playbackRate ? theme.css.primary : '#fff',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      {rate}×
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* PiP */}
            {allowPiP && typeof document !== 'undefined' && 'pictureInPictureEnabled' in document && (
              <CtrlBtn onClick={togglePiP} title="Picture-in-Picture" primary={theme.css.primary} active={isPiP}>
                <SvgIcon path={ICONS.pip} size={20} />
              </CtrlBtn>
            )}

            {/* Download */}
            {allowDownload && (
              <a
                href={downloadSrc}
                download
                title="Download"
                style={{
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '6px',
                }}
              >
                <SvgIcon path={ICONS.download} size={20} />
              </a>
            )}

            {/* Fullscreen */}
            {allowFullscreen && (
              <CtrlBtn onClick={toggleFullscreen} title={fullscreen ? 'Exit fullscreen' : 'Fullscreen'} primary={theme.css.primary}>
                <SvgIcon path={fullscreen ? ICONS.fullscreenExit : ICONS.fullscreen} size={20} />
              </CtrlBtn>
            )}
          </div>
        </div>
      )}

      {/* Keyframe for center flash animation */}
      <style>{`
        @keyframes tkxvp-flash {
          0% { opacity: 1; transform: translate(-50%,-50%) scale(1); }
          100% { opacity: 0; transform: translate(-50%,-50%) scale(1.5); }
        }
        @keyframes tkxvp-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

TkxVideoPlayer.displayName = 'TkxVideoPlayer';