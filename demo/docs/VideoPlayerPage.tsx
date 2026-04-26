import type { ThemeTokens } from 'tekivex-ui';
import { TkxVideoPlayer } from 'tekivex-ui';
import { DemoSection } from '../layout/DemoSection';

export function VideoPlayerPage({ theme }: { theme: ThemeTokens }) {
  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 32px', color: theme.text }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: 8 }}>Video Player</h1>
      <p style={{ color: theme.textMuted, marginBottom: 32 }}>
        Custom HTML5 video player with play/pause, seek, volume, fullscreen, and Picture-in-Picture support.
      </p>

      <DemoSection
        title="Basic Player"
        description="A video player with poster image and default controls."
        theme={theme}
        code={`import { TkxVideoPlayer } from 'tekivex-ui';

<TkxVideoPlayer
  src="https://www.w3schools.com/html/mov_bbb.mp4"
  poster="https://peach.blender.org/wp-content/uploads/title_anouncement.jpg"
/>`}
      >
        <TkxVideoPlayer
          src="https://www.w3schools.com/html/mov_bbb.mp4"
          poster="https://peach.blender.org/wp-content/uploads/title_anouncement.jpg"
        />
      </DemoSection>

      <DemoSection
        title="With Title"
        description="Displays a title overlay on the video player. Starts muted."
        theme={theme}
        code={`<TkxVideoPlayer
  src="https://www.w3schools.com/html/mov_bbb.mp4"
  title="Big Buck Bunny — Sample Video"
  autoPlay={false}
  muted
/>`}
      >
        <TkxVideoPlayer
          src="https://www.w3schools.com/html/mov_bbb.mp4"
          title="Big Buck Bunny — Sample Video"
          autoPlay={false}
          muted
        />
      </DemoSection>

      <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 16 }}>Props</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: `1px solid ${theme.border}` }}>
            {['Prop', 'Type', 'Default', 'Description'].map((h) => (
              <th key={h} style={{ textAlign: 'left', padding: '8px 12px', color: theme.textMuted, fontWeight: 600 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[
            ['src', 'string', '\u2014', 'Video source URL'],
            ['poster', 'string', '\u2014', 'Thumbnail image URL'],
            ['title', 'string', '\u2014', 'Video title shown in overlay'],
            ['autoPlay', 'boolean', 'false', 'Auto-play on mount'],
            ['muted', 'boolean', 'false', 'Start muted'],
            ['loop', 'boolean', 'false', 'Loop video playback'],
          ].map(([prop, type, def, desc]) => (
            <tr key={prop} style={{ borderBottom: `1px solid ${theme.border}` }}>
              <td style={{ padding: '8px 12px', fontFamily: 'monospace', color: theme.primary }}>{prop}</td>
              <td style={{ padding: '8px 12px', fontFamily: 'monospace', color: theme.info }}>{type}</td>
              <td style={{ padding: '8px 12px', fontFamily: 'monospace', color: theme.textMuted }}>{def}</td>
              <td style={{ padding: '8px 12px', color: theme.text }}>{desc}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
