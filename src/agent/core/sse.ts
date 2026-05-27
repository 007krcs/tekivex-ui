// ══════════════════════════════════════════════════════════════════════════════
// SSE PARSER — Minimal Server-Sent Events parser for streaming providers.
// Standard format: fields per line, events separated by a blank line.
// ══════════════════════════════════════════════════════════════════════════════

export interface SSEMessage {
  event?: string;
  data: string;
  id?: string;
}

export async function* parseSSE(
  stream: ReadableStream<Uint8Array>,
): AsyncGenerator<SSEMessage> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let boundary = indexOfBoundary(buffer);
      while (boundary.index !== -1) {
        const raw = buffer.slice(0, boundary.index);
        buffer = buffer.slice(boundary.index + boundary.length);
        const msg = parseEvent(raw);
        if (msg) yield msg;
        boundary = indexOfBoundary(buffer);
      }
    }
    if (buffer.length > 0) {
      const msg = parseEvent(buffer);
      if (msg) yield msg;
    }
  } finally {
    reader.releaseLock();
  }
}

function indexOfBoundary(s: string): { index: number; length: number } {
  const lf = s.indexOf('\n\n');
  const crlf = s.indexOf('\r\n\r\n');
  if (lf === -1 && crlf === -1) return { index: -1, length: 0 };
  if (lf === -1) return { index: crlf, length: 4 };
  if (crlf === -1) return { index: lf, length: 2 };
  return lf < crlf ? { index: lf, length: 2 } : { index: crlf, length: 4 };
}

function parseEvent(raw: string): SSEMessage | null {
  let event: string | undefined;
  let id: string | undefined;
  const dataLines: string[] = [];

  for (const line of raw.split(/\r?\n/)) {
    if (line.startsWith(':')) continue;
    if (line.startsWith('event:')) event = line.slice(6).trim();
    else if (line.startsWith('id:')) id = line.slice(3).trim();
    else if (line.startsWith('data:')) dataLines.push(line.slice(5).replace(/^ /, ''));
  }

  if (dataLines.length === 0) return null;
  return { event, id, data: dataLines.join('\n') };
}
