// ══════════════════════════════════════════════════════════════════════════════
// TRANSPORT — Pluggable HTTP layer.
// Default uses global fetch. Swap in axios, RN fetch, Tauri invoke, Electron IPC,
// or a signed/auth-wrapped fetch — providers never touch the network directly.
// ══════════════════════════════════════════════════════════════════════════════

export interface TransportRequest {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: string | Uint8Array | null;
  signal?: AbortSignal;
}

export interface TransportResponse {
  status: number;
  headers: Record<string, string>;
  body: ReadableStream<Uint8Array> | null;
  json(): Promise<unknown>;
  text(): Promise<string>;
}

export interface Transport {
  request(req: TransportRequest): Promise<TransportResponse>;
}

export const fetchTransport: Transport = {
  async request(req) {
    const res = await fetch(req.url, {
      method: req.method,
      headers: req.headers,
      body: req.body as BodyInit | null | undefined,
      signal: req.signal,
    });
    const headers: Record<string, string> = {};
    res.headers.forEach((value, key) => {
      headers[key] = value;
    });
    return {
      status: res.status,
      headers,
      body: res.body,
      json: () => res.json(),
      text: () => res.text(),
    };
  },
};
