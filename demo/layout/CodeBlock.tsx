import { useState, type CSSProperties } from 'react';

// ── Types ─────────────────────────────────────────────────────────────────────

interface CodeBlockProps {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
  title?: string;
}

// ── Token colors (dark theme — fixed regardless of active theme) ──────────────

const CODE_BG = '#0d0d14';
const CODE_SURFACE = '#12121e';
const CODE_BORDER = '#1e1e2e';
const CODE_TEXT = '#cdd6f4';
const CODE_MUTED = '#6c7086';
const COLOR_KEYWORD = '#cba6f7';    // purple — keywords
const COLOR_STRING = '#a6e3a1';     // green — strings
const COLOR_COMMENT = '#6c7086';    // muted — comments
const COLOR_NUMBER = '#fab387';     // peach — numbers
const COLOR_FUNCTION = '#89b4fa';   // blue — function names
const COLOR_PROP = '#89dceb';       // teal — JSX props / object keys
const COLOR_OPERATOR = '#89b4fa';   // blue — operators
const COLOR_TYPE = '#f38ba8';       // red — types/interfaces

// ── Simple syntax highlighter ─────────────────────────────────────────────────
// Tokenizes common patterns for TSX/TS/CSS/Bash code without dependencies.

function tokenize(code: string, language: string): Array<{ text: string; color: string }> {
  const tokens: Array<{ text: string; color: string }> = [];

  if (language === 'bash' || language === 'sh') {
    // Very simple bash: comments + strings
    const lines = code.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.trimStart().startsWith('#')) {
        tokens.push({ text: line, color: COLOR_COMMENT });
      } else if (line.trimStart().startsWith('$')) {
        tokens.push({ text: '$', color: COLOR_PROP });
        tokens.push({ text: line.slice(line.indexOf('$') + 1), color: CODE_TEXT });
      } else {
        tokens.push({ text: line, color: CODE_TEXT });
      }
      if (i < lines.length - 1) tokens.push({ text: '\n', color: CODE_TEXT });
    }
    return tokens;
  }

  // TypeScript / TSX / JS / CSS tokenizer
  const patterns: Array<{ regex: RegExp; color: string }> = [
    // Comments (must come first)
    { regex: /^(\/\/[^\n]*)/, color: COLOR_COMMENT },
    { regex: /^(\/\*[\s\S]*?\*\/)/, color: COLOR_COMMENT },
    // Template literals
    { regex: /^(`(?:[^`\\]|\\.)*`)/, color: COLOR_STRING },
    // Strings
    { regex: /^("(?:[^"\\]|\\.)*")/, color: COLOR_STRING },
    { regex: /^('(?:[^'\\]|\\.)*')/, color: COLOR_STRING },
    // JSX / HTML attributes (word=)
    { regex: /^([a-zA-Z][a-zA-Z0-9-]*)(?==)/, color: COLOR_PROP },
    // Types after : or < or extends
    { regex: /^(:\s*)([A-Z][a-zA-Z0-9<>[\], |&]+)/, color: COLOR_TYPE },
    // Keywords
    {
      regex:
        /^(import|export|from|const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|new|typeof|instanceof|default|class|extends|implements|interface|type|enum|namespace|async|await|throw|try|catch|finally|void|null|undefined|true|false|this|super|static|abstract|override|readonly|public|private|protected|declare|as|in|of|keyof|infer|never|any|unknown)\b/,
      color: COLOR_KEYWORD,
    },
    // CSS properties
    { regex: /^([a-z-]+)(?=\s*:)/, color: COLOR_PROP },
    // Numbers
    { regex: /^(\d+(?:\.\d+)?(?:px|em|rem|%|vh|vw|s|ms)?\b)/, color: COLOR_NUMBER },
    // Function calls
    { regex: /^([a-zA-Z_$][a-zA-Z0-9_$]*)(?=\s*\()/, color: COLOR_FUNCTION },
    // JSX component names (capitalized)
    { regex: /^(<\/?[A-Z][a-zA-Z0-9]*)/, color: COLOR_FUNCTION },
    // Operators
    { regex: /^([=><!+\-*/&|^~?:]+)/, color: COLOR_OPERATOR },
    // Fallback: any character sequence
    { regex: /^([^\s\S]*[\s\S])/, color: CODE_TEXT },
  ];

  let remaining = code;
  let emergency = 0;

  while (remaining.length > 0 && emergency < 100000) {
    emergency++;
    let matched = false;

    for (const { regex, color } of patterns) {
      const m = remaining.match(regex);
      if (m) {
        tokens.push({ text: m[0], color });
        remaining = remaining.slice(m[0].length);
        matched = true;
        break;
      }
    }

    if (!matched) {
      // consume one char
      tokens.push({ text: remaining[0], color: CODE_TEXT });
      remaining = remaining.slice(1);
    }
  }

  return tokens;
}

// ── Copy icon ─────────────────────────────────────────────────────────────────

function IconCopy({ color }: { color: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <rect x="4" y="4" width="8" height="8" rx="1.5" stroke={color} strokeWidth="1.3" />
      <path
        d="M3 10H2.5A1.5 1.5 0 011 8.5v-6A1.5 1.5 0 012.5 1h6A1.5 1.5 0 0110 2.5V3"
        stroke={color}
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconCheck({ color }: { color: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M2.5 7L5.5 10L11.5 4"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ── CodeBlock component ───────────────────────────────────────────────────────

export function CodeBlock({
  code,
  language = 'tsx',
  showLineNumbers = false,
  title,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const el = document.createElement('textarea');
      el.value = code;
      el.style.position = 'fixed';
      el.style.opacity = '0';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const tokens = tokenize(code, language);
  const lines = code.split('\n');

  const wrapperStyle: CSSProperties = {
    borderRadius: '10px',
    border: `1px solid ${CODE_BORDER}`,
    overflow: 'hidden',
    backgroundColor: CODE_BG,
    fontFamily: '"JetBrains Mono", "Fira Code", "Cascadia Code", "SF Mono", "Monaco", "Inconsolata", "Roboto Mono", "Courier New", monospace',
    fontSize: '13px',
    lineHeight: '1.65',
  };

  const headerBarStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 14px',
    backgroundColor: CODE_SURFACE,
    borderBottom: `1px solid ${CODE_BORDER}`,
    gap: '12px',
  };

  const dotRowStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    flexShrink: 0,
  };

  const langBadgeStyle: CSSProperties = {
    flex: 1,
    fontSize: '11px',
    fontWeight: 600,
    color: CODE_MUTED,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    textAlign: title ? 'left' : 'center',
  };

  const titleStyle: CSSProperties = {
    fontSize: '12px',
    color: '#7f849c',
    flex: 1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  };

  const copyBtnStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    padding: '3px 8px',
    borderRadius: '5px',
    border: `1px solid ${CODE_BORDER}`,
    backgroundColor: 'transparent',
    color: copied ? '#a6e3a1' : CODE_MUTED,
    cursor: 'pointer',
    fontSize: '11px',
    fontWeight: 500,
    fontFamily: 'inherit',
    transition: 'all 0.15s ease',
    flexShrink: 0,
  };

  const preStyle: CSSProperties = {
    margin: 0,
    padding: '16px',
    overflowX: 'auto',
    overflowY: 'hidden',
    backgroundColor: CODE_BG,
    display: 'flex',
  };

  const lineNumColStyle: CSSProperties = {
    flexShrink: 0,
    textAlign: 'right',
    userSelect: 'none',
    paddingRight: '16px',
    color: '#45475a',
    fontSize: '12px',
    lineHeight: '1.65',
    minWidth: `${String(lines.length).length + 1}ch`,
    borderRight: `1px solid ${CODE_BORDER}`,
    marginRight: '16px',
  };

  const codeContentStyle: CSSProperties = {
    flex: 1,
    minWidth: 0,
    color: CODE_TEXT,
    whiteSpace: 'pre',
    wordBreak: 'normal',
    overflowWrap: 'normal',
  };

  const dot = (color: string) => (
    <div
      style={{
        width: '10px',
        height: '10px',
        borderRadius: '50%',
        backgroundColor: color,
      }}
    />
  );

  return (
    <div style={wrapperStyle} role="region" aria-label={`Code example${language ? ` in ${language}` : ''}`}>
      {/* Header bar */}
      <div style={headerBarStyle}>
        <div style={dotRowStyle}>
          {dot('#ff5f57')}
          {dot('#febc2e')}
          {dot('#28c840')}
        </div>

        {title ? (
          <span style={titleStyle}>{title}</span>
        ) : (
          <span style={langBadgeStyle}>{language}</span>
        )}

        {title && (
          <span style={{ ...langBadgeStyle, flex: 'none', fontSize: '11px' }}>
            {language}
          </span>
        )}

        <button
          type="button"
          style={copyBtnStyle}
          onClick={handleCopy}
          aria-label={copied ? 'Copied!' : 'Copy code to clipboard'}
          onMouseEnter={(e) => {
            if (!copied) {
              (e.currentTarget as HTMLButtonElement).style.borderColor = '#45475a';
              (e.currentTarget as HTMLButtonElement).style.color = CODE_TEXT;
            }
          }}
          onMouseLeave={(e) => {
            if (!copied) {
              (e.currentTarget as HTMLButtonElement).style.borderColor = CODE_BORDER;
              (e.currentTarget as HTMLButtonElement).style.color = CODE_MUTED;
            }
          }}
        >
          {copied ? (
            <IconCheck color="#a6e3a1" />
          ) : (
            <IconCopy color="currentColor" />
          )}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      {/* Code area */}
      <pre style={preStyle} aria-label="Code block">
        {showLineNumbers && (
          <div style={lineNumColStyle} aria-hidden="true">
            {lines.map((_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>
        )}

        <code style={codeContentStyle}>
          {tokens.map((token, i) => (
            <span key={i} style={{ color: token.color }}>
              {token.text}
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}
