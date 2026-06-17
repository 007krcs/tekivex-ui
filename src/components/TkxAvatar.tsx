'use client';

import { forwardRef, useState, type ImgHTMLAttributes } from 'react';
import { useTheme } from '../themes';
import { getAccessibleForeground } from '../engine/wcag';
import { sanitizeString } from '../engine/security';
import { tkx, cx } from '../engine/tkx';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type AvatarShape = 'circle' | 'square';
export type AvatarStatus = 'online' | 'offline' | 'away' | 'busy';

export interface TkxAvatarProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'> {
  src?: string;
  alt: string;
  initials?: string;
  size?: AvatarSize;
  shape?: AvatarShape;
  status?: AvatarStatus;
}

const SIZE_PX: Record<AvatarSize, number> = { xs: 24, sm: 32, md: 40, lg: 56, xl: 72 };

export const TkxAvatar = forwardRef<HTMLDivElement, TkxAvatarProps>(
  ({ src, alt, initials, size = 'md', shape = 'circle', status, className, style, ...rest }, ref) => {
    const theme = useTheme();
    const [imageError, setImageError] = useState(false);
    const px = SIZE_PX[size];
    const isCircle = shape === 'circle';
    const bgColor = theme.surfaceAlt;
    const textColor = getAccessibleForeground(bgColor, [theme.text, theme.textMuted]);
    const showImage = src && !imageError;
    const showInitials = !showImage && initials;
    const statusDotSize = Math.max(8, px * 0.22);
    const statusColors: Record<AvatarStatus, string> = {
      online: theme.success,
      away: theme.warning,
      busy: theme.danger,
      offline: theme.textMuted,
    };

    const containerClass = tkx(
      'relative inline-flex shrink-0',
      isCircle ? 'rounded-full' : 'rounded-lg',
    );

    const mediaClass = tkx(
      'block object-cover',
      isCircle ? 'rounded-full' : 'rounded-lg',
    );

    const fallbackClass = tkx(
      'flex items-center justify-center font-semibold font-sans select-none',
      isCircle ? 'rounded-full' : 'rounded-lg',
    );

    return (
      <div
        ref={ref}
        className={cx(containerClass, className)}
        style={{ width: px, height: px, ...style }}
        {...(rest as React.HTMLAttributes<HTMLDivElement>)}
      >
        {showImage ? (
          <img
            src={sanitizeString(src!)}
            alt={sanitizeString(alt)}
            onError={() => setImageError(true)}
            className={mediaClass}
            style={{ width: px, height: px }}
          />
        ) : (
          <div
            role="img"
            aria-label={sanitizeString(alt)}
            className={fallbackClass}
            style={{ width: px, height: px, backgroundColor: bgColor, color: textColor, fontSize: px * 0.38 }}
          >
            {showInitials ? (
              sanitizeString(initials!).slice(0, 2).toUpperCase()
            ) : (
              <svg width={px * 0.5} height={px * 0.5} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            )}
          </div>
        )}

        {status && (
          <span
            aria-label={`Status: ${status}`}
            className={tkx('absolute bottom-0 right-0 rounded-full')}
            style={{
              width: statusDotSize, height: statusDotSize,
              backgroundColor: statusColors[status],
              border: `2px solid ${theme.bg}`,
            }}
          />
        )}
      </div>
    );
  },
);

TkxAvatar.displayName = 'TkxAvatar';