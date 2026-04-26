import { TkxAvatar } from 'tekivex-ui';
import { Preview } from '../Preview';

// Inline data-URL SVG portraits — keeps demos self-contained.
const portrait = (initials: string, hue: number) =>
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120">
      <rect width="120" height="120" fill="hsl(${hue}, 60%, 55%)"/>
      <text x="60" y="78" font-family="sans-serif" font-size="48" font-weight="700" fill="white" text-anchor="middle">${initials}</text>
    </svg>`,
  );

export function AvatarSizes() {
  return (
    <Preview label="Sizes (xs → xl)">
      <TkxAvatar size="xs" alt="Aisha Khan" src={portrait('AK', 200)} />
      <TkxAvatar size="sm" alt="Aisha Khan" src={portrait('AK', 200)} />
      <TkxAvatar size="md" alt="Aisha Khan" src={portrait('AK', 200)} />
      <TkxAvatar size="lg" alt="Aisha Khan" src={portrait('AK', 200)} />
      <TkxAvatar size="xl" alt="Aisha Khan" src={portrait('AK', 200)} />
    </Preview>
  );
}

export function AvatarInitials() {
  return (
    <Preview label="Initials fallback (no src)">
      <TkxAvatar alt="Aisha Khan" />
      <TkxAvatar alt="Marcus Lee" />
      <TkxAvatar alt="Priya Sharma" />
      <TkxAvatar alt="Dan Choi" />
      <TkxAvatar alt="Eve Park" />
    </Preview>
  );
}

export function AvatarStatus() {
  return (
    <Preview label="Status indicators">
      <TkxAvatar alt="Aisha Khan" src={portrait('AK', 200)} status="online" />
      <TkxAvatar alt="Marcus Lee" src={portrait('ML', 30)} status="busy" />
      <TkxAvatar alt="Priya Sharma" src={portrait('PS', 280)} status="away" />
      <TkxAvatar alt="Dan Choi" src={portrait('DC', 100)} status="offline" />
    </Preview>
  );
}
