import { forwardRef, type HTMLAttributes } from 'react';
import { useTheme } from '../themes';
import { useReducedMotion } from '../hooks';
import { tkx, cx } from '../engine/tkx';

export type SkeletonVariant = 'text' | 'circular' | 'rectangular';
export type SkeletonAnimation = 'pulse' | 'wave' | false;

export interface TkxSkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: SkeletonVariant;
  width?: string | number;
  height?: string | number;
  lines?: number;
  animation?: SkeletonAnimation;
}

interface SingleProps {
  variant: SkeletonVariant;
  width?: string | number;
  height?: string | number;
  animation: SkeletonAnimation;
  bgColor: string;
  accentColor: string;
}

function SingleSkeleton({ variant, width, height, animation, bgColor, accentColor }: SingleProps) {
  const w = width !== undefined ? (typeof width === 'number' ? `${width}px` : width) : '100%';
  const defaultH: Record<SkeletonVariant, string> = { text: '1em', circular: w, rectangular: '80px' };
  const h = height !== undefined ? (typeof height === 'number' ? `${height}px` : height) : defaultH[variant];

  const shapeClass = tkx(variant === 'circular' ? 'rounded-full' : variant === 'text' ? 'rounded' : 'rounded-lg');
  const animClass = animation === 'pulse'
    ? tkx('animate-pulse')
    : animation === 'wave'
      ? tkx('animate-shimmer')
      : '';

  const waveStyle = animation === 'wave'
    ? { background: `linear-gradient(90deg,${bgColor} 25%,${accentColor} 50%,${bgColor} 75%)`, backgroundSize: '200% 100%' }
    : { backgroundColor: bgColor };

  return (
    <div
      className={cx(shapeClass, animClass)}
      style={{ width: w, height: h, ...waveStyle }}
    />
  );
}

export const TkxSkeleton = forwardRef<HTMLDivElement, TkxSkeletonProps>(
  ({ variant = 'rectangular', width, height, lines, animation = 'pulse', className, style, ...rest }, ref) => {
    const theme = useTheme();
    const reducedMotion = useReducedMotion();
    const effectiveAnimation = reducedMotion ? false : animation;

    if (variant === 'text' && lines && lines > 1) {
      return (
        <div
          ref={ref}
          role="progressbar"
          aria-busy="true"
          aria-label="Loading..."
          className={cx(tkx('flex flex-col gap-2'), className)}
          style={style}
          {...rest}
        >
          {Array.from({ length: lines }, (_, i) => (
            <SingleSkeleton
              key={i}
              variant="text"
              width={i === lines - 1 ? '75%' : width}
              height={height}
              animation={effectiveAnimation}
              bgColor={theme.surfaceAlt}
              accentColor={theme.border}
            />
          ))}
        </div>
      );
    }

    return (
      <div
        ref={ref}
        role="progressbar"
        aria-busy="true"
        aria-label="Loading..."
        className={className}
        style={style}
        {...rest}
      >
        <SingleSkeleton
          variant={variant}
          width={width}
          height={height}
          animation={effectiveAnimation}
          bgColor={theme.surfaceAlt}
          accentColor={theme.border}
        />
      </div>
    );
  },
);

TkxSkeleton.displayName = 'TkxSkeleton';
