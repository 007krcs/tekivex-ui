// ══════════════════════════════════════════════════════════════════════════════
// A2A CLIENT (#17) — Agent-to-Agent protocol client.
// Minimal sync `sendTask`. Streaming + state polling can layer on top later.
// ══════════════════════════════════════════════════════════════════════════════

import { fetchTransport, type Transport } from '../core/Transport';

export interface A2AClientOptions {
  endpoint: string;
  transport?: Transport;
  headers?: Record<string, string>;
}

export interface A2APart {
  type: 'text';
  text: string;
}

export interface A2AMessage {
  role: 'user' | 'agent';
  parts: A2APart[];
}

export interface A2ATaskRequest {
  id: string;
  message: A2AMessage;
  metadata?: Record<string, unknown>;
}

export interface A2ATaskResponse {
  id: string;
  status: 'completed' | 'failed' | 'in_progress';
  messages: A2AMessage[];
  metadata?: Record<string, unknown>;
}

export class A2AClient {
  private readonly transport: Transport;

  constructor(private readonly opts: A2AClientOptions) {
    this.transport = opts.transport ?? fetchTransport;
  }

  async sendTask(req: A2ATaskRequest, signal?: AbortSignal): Promise<A2ATaskResponse> {
    const res = await this.transport.request({
      url: this.opts.endpoint,
      method: 'POST',
      headers: { 'content-type': 'application/json', ...this.opts.headers },
      body: JSON.stringify(req),
      signal,
    });
    if (res.status >= 400) {
      throw new Error(`A2A ${res.status}: ${await res.text()}`);
    }
    return (await res.json()) as A2ATaskResponse;
  }

  static newTaskId(): string {
    return `task_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  }
}
