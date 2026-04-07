import type { CSSProperties } from 'react';
import { useTheme } from '@tekivex/ui';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface PropDef {
  name: string;
  /** alias for name — used by some pages */
  prop?: string;
  type: string;
  default?: string;
  required?: boolean;
  description: string;
}

interface PropTableProps {
  /** canonical prop name */
  props?: PropDef[];
  /** alias accepted by pages that were generated with rows= */
  rows?: PropDef[];
  /** optional section title rendered above the table */
  title?: string;
  /** accepted but unused — component calls useTheme() internally */
  theme?: unknown;
}

// ── PropTable component ───────────────────────────────────────────────────────

export function PropTable({ props, rows, title }: PropTableProps) {
  // normalise: support both `props` and `rows` aliases
  const rawItems = props ?? rows ?? [];
  // support `prop` field as alias for `name`
  const normalizedProps: PropDef[] = rawItems.map((p) => ({
    ...p,
    name: p.name ?? (p as { prop?: string }).prop ?? '',
  }));
  const theme = useTheme();

  const wrapperStyle: CSSProperties = {
    borderRadius: '10px',
    border: `1px solid ${theme.border}`,
    overflow: 'hidden',
    backgroundColor: theme.surface,
  };

  const tableStyle: CSSProperties = {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '13.5px',
  };

  const thStyle: CSSProperties = {
    padding: '10px 14px',
    textAlign: 'left',
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: theme.textMuted,
    backgroundColor: theme.surfaceAlt,
    borderBottom: `1px solid ${theme.border}`,
    whiteSpace: 'nowrap',
  };

  const getTdStyle = (isLast: boolean): CSSProperties => ({
    padding: '10px 14px',
    verticalAlign: 'top',
    borderBottom: isLast ? 'none' : `1px solid ${theme.border}`,
    color: theme.text,
    lineHeight: '1.5',
  });

  const codeStyle: CSSProperties = {
    fontFamily:
      '"JetBrains Mono", "Fira Code", "SF Mono", "Cascadia Code", monospace',
    fontSize: '12px',
    backgroundColor: `${theme.primary}12`,
    color: theme.primary,
    padding: '1px 5px',
    borderRadius: '4px',
    border: `1px solid ${theme.primary}20`,
    whiteSpace: 'nowrap',
  };

  const defaultCodeStyle: CSSProperties = {
    ...codeStyle,
    backgroundColor: `${theme.secondary}10`,
    color: theme.secondary,
    border: `1px solid ${theme.secondary}20`,
  };

  const requiredBadgeStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '14px',
    height: '14px',
    borderRadius: '50%',
    backgroundColor: `${theme.danger}20`,
    color: theme.danger,
    fontSize: '9px',
    fontWeight: 800,
    marginLeft: '4px',
    verticalAlign: 'middle',
    border: `1px solid ${theme.danger}40`,
    flexShrink: 0,
  };

  const propNameStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '2px',
  };

  const nameCellStyle: CSSProperties = {
    ...codeStyle,
    backgroundColor: 'transparent',
    border: 'none',
    padding: '0',
    fontWeight: 600,
    color: theme.text,
  };

  const descStyle: CSSProperties = {
    color: theme.textMuted,
    fontSize: '13px',
    lineHeight: '1.5',
  };

  if (normalizedProps.length === 0) {
    return (
      <div
        style={{
          ...wrapperStyle,
          padding: '24px',
          textAlign: 'center',
          color: theme.textMuted,
          fontSize: '13px',
        }}
      >
        No props documented.
      </div>
    );
  }

  return (
    <div style={{ marginBottom: '32px' }}>
      {title && (
        <h3 style={{ fontSize: '14px', fontWeight: 700, color: theme.text, marginBottom: '10px', marginTop: 0 }}>
          {title}
        </h3>
      )}
      <div style={wrapperStyle} role="region" aria-label={title ? `${title} props` : 'Component props documentation'}>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle} scope="col">Prop</th>
            <th style={thStyle} scope="col">Type</th>
            <th style={thStyle} scope="col">Default</th>
            <th style={{ ...thStyle, width: '60px', textAlign: 'center' }} scope="col">
              Req.
            </th>
            <th style={thStyle} scope="col">Description</th>
          </tr>
        </thead>
        <tbody>
          {normalizedProps.map((prop, i) => {
            const isLast = i === normalizedProps.length - 1;
            return (
              <tr
                key={prop.name}
                style={{
                  backgroundColor: i % 2 === 1 ? `${theme.surfaceAlt}60` : 'transparent',
                }}
              >
                {/* Prop name */}
                <td style={getTdStyle(isLast)}>
                  <div style={propNameStyle}>
                    <code style={nameCellStyle}>{prop.name}</code>
                    {prop.required && (
                      <span
                        style={requiredBadgeStyle}
                        title="Required prop"
                        aria-label="Required"
                      >
                        *
                      </span>
                    )}
                  </div>
                </td>

                {/* Type */}
                <td style={getTdStyle(isLast)}>
                  <code style={codeStyle}>{prop.type}</code>
                </td>

                {/* Default */}
                <td style={getTdStyle(isLast)}>
                  {prop.default !== undefined ? (
                    <code style={defaultCodeStyle}>{prop.default}</code>
                  ) : (
                    <span style={{ color: theme.border }}>—</span>
                  )}
                </td>

                {/* Required */}
                <td style={{ ...getTdStyle(isLast), textAlign: 'center' }}>
                  {prop.required ? (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        backgroundColor: `${theme.danger}20`,
                        color: theme.danger,
                        fontSize: '11px',
                        fontWeight: 800,
                        border: `1px solid ${theme.danger}30`,
                      }}
                      aria-label="Required"
                      title="Required prop"
                    >
                      *
                    </span>
                  ) : (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        backgroundColor: `${theme.success}15`,
                        color: theme.success,
                        fontSize: '10px',
                        border: `1px solid ${theme.success}25`,
                      }}
                      aria-label="Optional"
                      title="Optional prop"
                    >
                      ○
                    </span>
                  )}
                </td>

                {/* Description */}
                <td style={getTdStyle(isLast)}>
                  <span style={descStyle}>{prop.description}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
    </div>
  );
}
