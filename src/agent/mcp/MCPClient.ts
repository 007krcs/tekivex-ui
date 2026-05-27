// ══════════════════════════════════════════════════════════════════════════════
// MCP CLIENT (#6) — Minimal Model Context Protocol client.
// JSON-RPC 2.0 over HTTP. Browser-friendly. Supports initialize, list tools,
// call tools. For stdio transport, write a custom Transport adapter.
// ══════════════════════════════════════════════════════════════════════════════

import { fetchTransport, type Transport } from '../core/Transport';

export interface MCPClientOptions {
  endpoint: string;
  transport?: Transport;
  headers?: Record<string, string>;
  clientInfo?: { name: string; version: string };
}

export interface MCPTool {
  name: string;
  description?: string;
  inputSchema: Record<string, unknown>;
}

export interface MCPCallResult {
  content?: Array<{ type: string; text?: string }>;
  isError?: boolean;
}

interface JSONRPCResponse {
  jsonrpc: '2.0';
  id: number;
  result?: unknown;
  error?: { code: number; message: string };
}

export class MCPClient {
  private idSeq = 0;
  private transport: Transport;
  private initialized = false;

  constructor(private readonly opts: MCPClientOptions) {
    this.transport = opts.transport ?? fetchTransport;
  }

  async initialize(signal?: AbortSignal): Promise<void> {
    if (this.initialized) return;
    await this.call(
      'initialize',
      {
        protocolVersion: '2024-11-05',
        capabilities: { tools: {} },
        clientInfo: this.opts.clientInfo ?? { name: 'tekivex-ui-agent', version: '1.0' },
      },
      signal,
    );
    this.initialized = true;
  }

  async listTools(signal?: AbortSignal): Promise<MCPTool[]> {
    await this.initialize(signal);
    const result = (await this.call('tools/list', {}, signal)) as { tools?: MCPTool[] };
    return result.tools ?? [];
  }

  async callTool(name: string, args: unknown, signal?: AbortSignal): Promise<MCPCallResult> {
    await this.initialize(signal);
    return (await this.call('tools/call', { name, arguments: args }, signal)) as MCPCallResult;
  }

  private async call(method: string, params: unknown, signal?: AbortSignal): Promise<unknown> {
    const id = ++this.idSeq;
    const res = await this.transport.request({
      url: this.opts.endpoint,
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        accept: 'application/json',
        ...this.opts.headers,
      },
      body: JSON.stringify({ jsonrpc: '2.0', id, method, params }),
      signal,
    });
    if (res.status >= 400) {
      const text = await res.text();
      throw new Error(`MCP ${method} failed (${res.status}): ${text}`);
    }
    const body = (await res.json()) as JSONRPCResponse;
    if (body.error) {
      throw new Error(`MCP error ${body.error.code}: ${body.error.message}`);
    }
    return body.result;
  }
}
