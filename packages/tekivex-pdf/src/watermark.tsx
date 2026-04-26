// ─────────────────────────────────────────────────────────────────────────────
// TkxPDFWatermark — diagonal text overlay stamped behind page content.
// Pairs with the in-browser TkxWatermark (v2) so a screenshot of the live
// page and the downloaded PDF carry the same identifier.
// ─────────────────────────────────────────────────────────────────────────────

import { Text, View, type Style } from '@react-pdf/renderer';
import { usePDFTheme } from './primitives';

export interface TkxPDFWatermarkProps {
  text: string | string[];
  /** Visual mode: 'tiled' repeats; 'single' is one big diagonal stamp. */
  pattern?: 'tiled' | 'single';
  /** Rotation in degrees. Negative tilts up-right. Default -28. */
  rotate?: number;
  /** Opacity 0..1. Default 0.08 (very subtle). */
  opacity?: number;
  /** Font size for tiled mode (default 18) or single mode (default 60). */
  fontSize?: number;
  /** Tile spacing in px when pattern='tiled'. Default 180. */
  spacing?: number;
  color?: string;
}

export function TkxPDFWatermark({
  text,
  pattern = 'tiled',
  rotate = -28,
  opacity = 0.08,
  fontSize,
  spacing = 180,
  color,
}: TkxPDFWatermarkProps) {
  const theme = usePDFTheme();
  const lines = Array.isArray(text) ? text : [text];
  const fill = color ?? theme.textMuted;

  const baseTextStyle: Style = {
    color: fill,
    fontSize: fontSize ?? (pattern === 'single' ? 60 : 18),
    fontWeight: 'bold',
    opacity,
  };

  const wrapperStyle: Style = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none' as any,
  };

  if (pattern === 'single') {
    return (
      <View style={wrapperStyle} fixed>
        <View
          style={{
            position: 'absolute',
            top: '40%',
            left: 0,
            right: 0,
            transform: `rotate(${rotate}deg)`,
            alignItems: 'center',
          }}
        >
          {lines.map((line, i) => (
            <Text key={i} style={baseTextStyle}>
              {line}
            </Text>
          ))}
        </View>
      </View>
    );
  }

  // Tiled — generate a grid of stamped text positions. PDF-friendly: explicit
  // absolute positions instead of a CSS background-image (which @react-pdf
  // doesn't fully support for repeating patterns).
  const cols = 4;
  const rows = 7;
  const tiles: Array<{ x: number; y: number; key: string }> = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      tiles.push({
        x: (c * spacing) - 50,
        y: (r * (spacing / 2)) - 30,
        key: `${r}-${c}`,
      });
    }
  }

  return (
    <View style={wrapperStyle} fixed>
      {tiles.map(({ x, y, key }) => (
        <View
          key={key}
          style={{
            position: 'absolute',
            top: y,
            left: x,
            transform: `rotate(${rotate}deg)`,
          }}
        >
          {lines.map((line, i) => (
            <Text key={i} style={baseTextStyle}>
              {line}
            </Text>
          ))}
        </View>
      ))}
    </View>
  );
}
