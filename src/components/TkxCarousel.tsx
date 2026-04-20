'use client';

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useId,
  type CSSProperties,
  type ReactNode,
  type TouchEvent,
  type MouseEvent as ReactMouseEvent,
} from 'react';
import { useTheme } from '../themes';
import { tkx, cx } from '../engine/tkx';
import { useReducedMotion } from '../hooks';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface CarouselSlide {
  id: string;
  content: ReactNode;
  thumbnail?: string;
}

export interface TkxCarouselProps {
  slides: CarouselSlide[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
  pauseOnHover?: boolean;
  loop?: boolean;
  showArrows?: boolean;
  showDots?: boolean;
  showThumbnails?: boolean;
  orientation?: 'horizontal' | 'vertical';
  slidesToShow?: number;
  gap?: number;
  transitionDuration?: number;
  swipeable?: boolean;
  initialIndex?: number;
  onChange?: (index: number) => void;
  arrowPosition?: 'inside' | 'outside';
  height?: string | number;
  className?: string;
  style?: CSSProperties;
}

// ── Arrow button ──────────────────────────────────────────────────────────────

interface ArrowBtnProps {
  direction: 'prev' | 'next';
  onClick: () => void;
  isDisabled: boolean;
  primaryColor: string;
  position: 'inside' | 'outside';
  orientation: 'horizontal' | 'vertical';
}

function ArrowBtn({ direction, onClick, isDisabled, primaryColor, position, orientation }: ArrowBtnProps) {
  const isVertical = orientation === 'vertical';
  const isPrev = direction === 'prev';

  const posStyle: CSSProperties = position === 'inside'
    ? {
        position: 'absolute',
        zIndex: 3,
        ...(isVertical
          ? { [isPrev ? 'top' : 'bottom']: 10, left: '50%', transform: 'translateX(-50%)' }
          : { [isPrev ? 'left' : 'right']: 10, top: '50%', transform: 'translateY(-50%)' }),
      }
    : {
        flexShrink: 0,
        position: 'relative',
      };

  return (
    <button
      type="button"
      aria-label={isPrev ? 'Previous slide' : 'Next slide'}
      disabled={isDisabled}
      onClick={onClick}
      style={{
        ...posStyle,
        width: 36,
        height: 36,
        borderRadius: '50%',
        border: 'none',
        backgroundColor: 'rgba(0,0,0,0.45)',
        backdropFilter: 'blur(4px)',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        opacity: isDisabled ? 0.35 : 1,
        transition: 'background 150ms ease, opacity 150ms ease',
        outline: 'none',
      }}
      onFocus={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = `0 0 0 3px ${primaryColor}55`; }}
      onBlur={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}
      onMouseEnter={(e) => { if (!isDisabled) (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(0,0,0,0.65)'; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(0,0,0,0.45)'; }}
    >
      {isVertical ? (
        isPrev ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
            <polyline points="18 15 12 9 6 15" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        )
      ) : isPrev ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      )}
    </button>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function TkxCarousel({
  slides,
  autoPlay = false,
  autoPlayInterval = 4000,
  pauseOnHover = true,
  loop = true,
  showArrows = true,
  showDots = true,
  showThumbnails = false,
  orientation = 'horizontal',
  slidesToShow = 1,
  gap = 0,
  transitionDuration = 400,
  swipeable = true,
  initialIndex = 0,
  onChange,
  arrowPosition = 'inside',
  height = 320,
  className,
  style,
}: TkxCarouselProps) {
  const theme = useTheme();
  const reducedMotion = useReducedMotion();
  const carouselId = useId();

  const count = slides.length;

  // ── Index state ──────────────────────────────────────────────────────────
  // When loop=true we clone first & last slides → real slides are at indices 1..count
  // displayed index is the "real" index (0-based, 0..count-1)
  const [currentIdx, setCurrentIdx] = useState(initialIndex);
  // internal track index (for cloned-slide loop trick)
  const [trackIdx, setTrackIdx] = useState(loop ? initialIndex + 1 : initialIndex);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [paused, setPaused] = useState(false);

  const trackRef = useRef<HTMLDivElement>(null);
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Drag / swipe state
  const dragStartRef = useRef<number | null>(null);
  const dragDeltaRef = useRef<number>(0);
  const isDraggingRef = useRef(false);

  const isVertical = orientation === 'vertical';
  const actualDuration = reducedMotion ? 0 : transitionDuration;

  // Slides to render (with optional clones for seamless loop)
  const renderSlides: CarouselSlide[] = loop && count > 1
    ? [slides[count - 1], ...slides, slides[0]]
    : slides;

  const totalTracks = renderSlides.length;

  // Compute transform for current trackIdx
  const slideWidthPct = 100 / slidesToShow;

  const getTransform = (idx: number, extra = 0) => {
    const px = extra !== 0 ? ` - ${extra}px` : '';
    if (isVertical) return `translateY(calc(-${idx * slideWidthPct}%${px}))`;
    return `translateX(calc(-${idx * slideWidthPct}%${px}))`;
  };

  // Navigate to a real index
  const goTo = useCallback((realIdx: number, skipTransition = false) => {
    const clamped = loop
      ? ((realIdx % count) + count) % count
      : Math.max(0, Math.min(count - 1, realIdx));

    const newTrackIdx = loop ? clamped + 1 : clamped;

    if (skipTransition && trackRef.current) {
      trackRef.current.style.transition = 'none';
      setTrackIdx(newTrackIdx);
      setCurrentIdx(clamped);
      // Force reflow
      void trackRef.current.offsetHeight;
      trackRef.current.style.transition = '';
    } else {
      setIsTransitioning(true);
      setTrackIdx(newTrackIdx);
      setCurrentIdx(clamped);
    }

    onChange?.(clamped);
  }, [count, loop, onChange]);

  const prev = useCallback(() => goTo(currentIdx - 1), [currentIdx, goTo]);
  const next = useCallback(() => goTo(currentIdx + 1), [currentIdx, goTo]);

  // Handle seamless loop: after transition ends, snap without animation
  const handleTransitionEnd = useCallback(() => {
    setIsTransitioning(false);
    if (!loop || count <= 1) return;

    if (trackIdx === 0) {
      // Was on cloned-last → snap to real last
      goTo(count - 1, true);
    } else if (trackIdx === totalTracks - 1) {
      // Was on cloned-first → snap to real first
      goTo(0, true);
    }
  }, [loop, count, trackIdx, totalTracks, goTo]);

  // Auto-play
  useEffect(() => {
    if (!autoPlay || paused || count <= 1) return;
    autoPlayRef.current = setInterval(next, autoPlayInterval);
    return () => { if (autoPlayRef.current) clearInterval(autoPlayRef.current); };
  }, [autoPlay, paused, autoPlayInterval, next, count]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const focused = document.activeElement;
      const container = document.getElementById(carouselId);
      if (!container?.contains(focused as Node)) return;

      if (e.key === (isVertical ? 'ArrowUp' : 'ArrowLeft')) { e.preventDefault(); prev(); }
      if (e.key === (isVertical ? 'ArrowDown' : 'ArrowRight')) { e.preventDefault(); next(); }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [carouselId, isVertical, prev, next]);

  // ── Swipe handling ────────────────────────────────────────────────────────

  const getEventCoord = (e: TouchEvent | ReactMouseEvent): number => {
    if ('touches' in e) {
      return isVertical ? e.touches[0].clientY : e.touches[0].clientX;
    }
    return isVertical ? (e as ReactMouseEvent).clientY : (e as ReactMouseEvent).clientX;
  };

  const onDragStart = (e: TouchEvent | ReactMouseEvent) => {
    if (!swipeable) return;
    dragStartRef.current = getEventCoord(e);
    dragDeltaRef.current = 0;
    isDraggingRef.current = true;
  };

  const onDragMove = (e: TouchEvent | ReactMouseEvent) => {
    if (!isDraggingRef.current || dragStartRef.current === null) return;
    const delta = getEventCoord(e) - dragStartRef.current;
    dragDeltaRef.current = delta;
    // Live-drag offset
    if (trackRef.current) {
      trackRef.current.style.transition = 'none';
      trackRef.current.style.transform = getTransform(trackIdx, -delta);
    }
  };

  const onDragEnd = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;

    const delta = dragDeltaRef.current;
    const threshold = 50;

    // Restore transition
    if (trackRef.current) {
      trackRef.current.style.transition = '';
      trackRef.current.style.transform = '';
    }

    if (delta < -threshold) next();
    else if (delta > threshold) prev();
    else {
      // Snap back
      if (trackRef.current) {
        trackRef.current.style.transform = getTransform(trackIdx);
      }
    }

    dragStartRef.current = null;
    dragDeltaRef.current = 0;
  };

  // ── Sizing ────────────────────────────────────────────────────────────────

  const heightVal = typeof height === 'number' ? `${height}px` : height;

  const trackStyle: CSSProperties = {
    display: 'flex',
    flexDirection: isVertical ? 'column' : 'row',
    width: isVertical ? '100%' : `${(totalTracks / slidesToShow) * 100}%`,
    height: isVertical ? `${(totalTracks / slidesToShow) * 100}%` : '100%',
    transform: getTransform(trackIdx),
    transition: isTransitioning || !reducedMotion
      ? `transform ${actualDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`
      : 'none',
    willChange: 'transform',
    gap: gap > 0 ? gap : undefined,
  };

  const slideStyle: CSSProperties = {
    flexShrink: 0,
    width: isVertical ? '100%' : `${slideWidthPct / (totalTracks / slidesToShow)}%`,
    height: isVertical ? `${slideWidthPct / (totalTracks / slidesToShow)}%` : '100%',
    overflow: 'hidden',
    position: 'relative',
  };

  const canPrev = loop || currentIdx > 0;
  const canNext = loop || currentIdx < count - 1;

  const outsideArrows = arrowPosition === 'outside';

  return (
    <div
      id={carouselId}
      className={cx(tkx('flex flex-col gap-2'), className)}
      style={style}
      aria-roledescription="carousel"
      aria-label="Content carousel"
    >
      {/* Main carousel row */}
      <div
        className={tkx('flex items-center gap-2')}
        style={{ gap: outsideArrows && showArrows ? 8 : 0 }}
      >
        {/* Outside prev arrow */}
        {showArrows && outsideArrows && (
          <ArrowBtn
            direction="prev"
            onClick={prev}
            isDisabled={!canPrev}
            primaryColor={theme.primary}
            position="outside"
            orientation={orientation}
          />
        )}

        {/* Viewport */}
        <div
          style={{
            position: 'relative',
            flex: 1,
            overflow: 'hidden',
            height: isVertical ? heightVal : heightVal,
            borderRadius: 12,
            cursor: swipeable ? (isDraggingRef.current ? 'grabbing' : 'grab') : 'default',
            userSelect: 'none',
          }}
          onMouseEnter={() => pauseOnHover && setPaused(true)}
          onMouseLeave={() => { setPaused(false); onDragEnd(); }}
          onTouchStart={onDragStart}
          onTouchMove={onDragMove}
          onTouchEnd={onDragEnd}
          onMouseDown={onDragStart}
          onMouseMove={onDragMove}
          onMouseUp={onDragEnd}
          aria-live="polite"
          aria-atomic="false"
        >
          {/* Inside arrows */}
          {showArrows && !outsideArrows && (
            <>
              <ArrowBtn
                direction="prev"
                onClick={prev}
                isDisabled={!canPrev}
                primaryColor={theme.primary}
                position="inside"
                orientation={orientation}
              />
              <ArrowBtn
                direction="next"
                onClick={next}
                isDisabled={!canNext}
                primaryColor={theme.primary}
                position="inside"
                orientation={orientation}
              />
            </>
          )}

          {/* Track */}
          <div ref={trackRef} style={trackStyle} onTransitionEnd={handleTransitionEnd}>
            {renderSlides.map((slide, idx) => (
              <div
                key={`${slide.id}-${idx}`}
                style={slideStyle}
                role="group"
                aria-roledescription="slide"
                aria-label={`Slide ${((idx - (loop ? 1 : 0) + count) % count) + 1} of ${count}`}
                aria-hidden={((idx - (loop ? 1 : 0) + count) % count) !== currentIdx}
              >
                {slide.content}
              </div>
            ))}
          </div>

          {/* Dot indicators (inside) */}
          {showDots && !showThumbnails && (
            <div
              aria-label="Slide indicators"
              style={{
                position: 'absolute',
                bottom: 12,
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: 6,
                zIndex: 2,
              }}
            >
              {slides.map((slide, idx) => (
                <button
                  key={slide.id}
                  type="button"
                  aria-label={`Go to slide ${idx + 1}`}
                  aria-current={idx === currentIdx ? 'true' : undefined}
                  onClick={() => goTo(idx)}
                  style={{
                    width: idx === currentIdx ? 20 : 8,
                    height: 8,
                    borderRadius: 9999,
                    border: 'none',
                    backgroundColor: idx === currentIdx ? theme.primary : 'rgba(255,255,255,0.5)',
                    cursor: 'pointer',
                    padding: 0,
                    transition: 'width 250ms ease, background 250ms ease',
                    outline: 'none',
                  }}
                  onFocus={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = `0 0 0 3px ${theme.primary}66`; }}
                  onBlur={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Outside next arrow */}
        {showArrows && outsideArrows && (
          <ArrowBtn
            direction="next"
            onClick={next}
            isDisabled={!canNext}
            primaryColor={theme.primary}
            position="outside"
            orientation={orientation}
          />
        )}
      </div>

      {/* Thumbnail strip */}
      {showThumbnails && (
        <div
          role="tablist"
          aria-label="Slide thumbnails"
          style={{
            display: 'flex',
            gap: 6,
            overflowX: 'auto',
            paddingBottom: 4,
            scrollbarWidth: 'thin',
          }}
        >
          {slides.map((slide, idx) => (
            <button
              key={slide.id}
              type="button"
              role="tab"
              aria-selected={idx === currentIdx}
              aria-label={`Thumbnail for slide ${idx + 1}`}
              onClick={() => goTo(idx)}
              style={{
                flexShrink: 0,
                width: 60,
                height: 42,
                border: `2px solid ${idx === currentIdx ? theme.primary : theme.border}`,
                borderRadius: 6,
                overflow: 'hidden',
                cursor: 'pointer',
                padding: 0,
                background: theme.surfaceAlt,
                transition: 'border-color 150ms ease',
                outline: 'none',
                position: 'relative',
              }}
              onFocus={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = `0 0 0 3px ${theme.primary}55`; }}
              onBlur={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}
            >
              {slide.thumbnail ? (
                <img
                  src={slide.thumbnail}
                  alt=""
                  aria-hidden="true"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              ) : (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.625rem',
                    color: theme.textMuted,
                    fontWeight: 600,
                  }}
                >
                  {idx + 1}
                </div>
              )}
              {idx === currentIdx && (
                <div
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundColor: `${theme.primary}22`,
                  }}
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

TkxCarousel.displayName = 'TkxCarousel';