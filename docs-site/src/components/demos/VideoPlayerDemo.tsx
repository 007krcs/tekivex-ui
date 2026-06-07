import { TkxVideoPlayer } from 'tekivex-ui';
import { Preview } from '../Preview';

// Big Buck Bunny — a long-standing free / open-source demo video
// commonly used for HTML5 video testing. Hosted by the Blender
// Foundation. We point at the standardised "blender.org" copy.
const SRC = 'https://download.blender.org/peach/bigbuckbunny_movies/BigBuckBunny_320x180.mp4';
const POSTER = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180" viewBox="0 0 320 180">
    <rect width="320" height="180" fill="#1f2937"/>
    <text x="160" y="90" font-family="ui-sans-serif" font-size="14" fill="#e5e7eb" text-anchor="middle" dy=".3em">Click ▶ to play</text>
  </svg>`
)}`;

export function VideoPlayerBasic() {
  return (
    <Preview label="HTML5 video player with controls">
      <TkxVideoPlayer src={SRC} poster={POSTER} width={320} height={180} title="Big Buck Bunny sample" />
    </Preview>
  );
}
