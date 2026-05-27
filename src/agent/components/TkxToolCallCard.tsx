// ══════════════════════════════════════════════════════════════════════════════
// TkxToolCallCard (#10) — Single tool invocation: name, input, status, output.
// ══════════════════════════════════════════════════════════════════════════════

import type { CSSProperties } from 'react';

export type ToolCallStatus = 'pending' | 'running' | 'success' | 'error';

export interface TkxToolCallCardProps {
  name: string;
  input: unknown;
  output?: unknown;
  error?: Error;
  status: ToolCallStatus;
  className?: string;
  style?: CSSProperties;
}

export function TkxToolCallCard({
  name,
  input,
  output,
  error,
  status,
  className,
  style,
}: TkxToolCallCardProps) {
  return (
    <section
      className={className}
      style={style}
      data-status={status}
      role="region"
      aria-label={`Tool call ${name}`}
    >
      <header>
        <strong>{name}</strong>
        <span data-role="status" aria-live="polite">
          {status}
        </span>
      </header>
      <details>
        <summary>Input</summary>
        <pre>{JSON.stringify(input, null, 2)}</pre>
      </details>
      {output !== undefined && (
        <details open>
          <summary>Output</summary>
          <pre>
            {typeof output === 'string' ? output : JSON.stringify(output, null, 2)}
          </pre>
        </details>
      )}
      {error && (
        <p role="alert" data-role="error">
          {error.message}
        </p>
      )}
    </section>
  );
}
