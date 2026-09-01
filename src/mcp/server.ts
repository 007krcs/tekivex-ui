/**
 * TekiVex UI MCP server — JSON-RPC 2.0 over stdio.
 *
 * Implements the Model Context Protocol handshake and tool surface directly
 * rather than pulling in an SDK, for two reasons: the protocol subset a
 * tool-only server needs is small, and adding a dependency tree to a package
 * whose whole selling point is a small supply chain would be self-defeating.
 *
 * Every tool answers from the extracted component catalog or from the same
 * validators the library's own CI uses. Nothing here invents an answer.
 */
import { createInterface } from 'node:readline';
import { Guard, ToolError, configFromEnv, type ServerConfig } from './enterprise';
import {
  listComponents,
  getComponentApi,
  auditAccessibility,
  verifySecurity,
  scaffoldForm,
  type AriaCheck,
} from './tools';

const PROTOCOL_VERSION = '2024-11-05';
const SERVER_INFO = { name: 'tekivex-ui', version: '0.1.0' };

interface JsonRpcRequest {
  jsonrpc: '2.0';
  id?: number | string | null;
  method: string;
  params?: Record<string, unknown>;
}

export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}

export const TOOLS: ToolDefinition[] = [
  {
    name: 'ui_list_components',
    description:
      'Compact catalog: name, category, one-line summary and RSC status for each component tekivex-ui ships. Deliberately omits props to keep context small — call ui_get_component_api for the full API of a chosen component.',
    inputSchema: {
      type: 'object',
      properties: {
        filter: { type: 'string', description: 'Case-insensitive substring of name or description.' },
        rscOnly: { type: 'boolean', description: 'Only components renderable without "use client".' },
        category: { type: 'string', description: 'input | data | chart | overlay | layout | display | ai | commerce | other' },
      },
    },
  },
  {
    name: 'ui_get_component_api',
    description:
      "Return a component's exact props — names, TypeScript types, which are required — extracted from source, plus the item shapes those props reference (e.g. SelectOption, MenuItem). Call this instead of guessing prop names.",
    inputSchema: {
      type: 'object',
      properties: { name: { type: 'string', description: 'Component name, e.g. TkxSelect.' } },
      required: ['name'],
    },
  },
  {
    name: 'ui_audit_accessibility',
    description:
      'Validate an HTML fragment against WAI-ARIA 1.2 using the same checker that gates the library build: role validity, required and prohibited properties, required context, idref integrity, accessible names, duplicate ids.',
    inputSchema: {
      type: 'object',
      properties: { html: { type: 'string', description: 'Rendered HTML to validate.' } },
      required: ['html'],
    },
  },
  {
    name: 'ui_verify_security',
    description:
      'Scan code for the XSS and CSP sinks named in the published threat model (dangerouslySetInnerHTML, innerHTML assignment, javascript: URLs, eval, misuse of sanitizeString at an HTML sink) and return the remedy for each.',
    inputSchema: {
      type: 'object',
      properties: { code: { type: 'string', description: 'Source to review.' } },
      required: ['code'],
    },
  },
  {
    name: 'ui_scaffold_form',
    description:
      'Generate an accessible form using the real components this library ships for each field type. Fails loudly on a field type with no component rather than inventing one.',
    inputSchema: {
      type: 'object',
      properties: {
        formName: { type: 'string' },
        fields: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              type: { type: 'string' },
              label: { type: 'string' },
              required: { type: 'boolean' },
            },
            required: ['name', 'type'],
          },
        },
      },
      required: ['fields'],
    },
  },
];

/** Injected so the server has no hard DOM dependency; see createAriaValidator. */
export type AriaValidator = (html: string) => AriaCheck[];

export class TekivexMcpServer {
  private readonly guard: Guard;

  constructor(
    private readonly validateAria: AriaValidator,
    config: ServerConfig = configFromEnv(),
  ) {
    this.guard = new Guard(config);
  }

  /** Handle one JSON-RPC request. Returns null for notifications. */
  async handle(req: JsonRpcRequest): Promise<Record<string, unknown> | null> {
    const respond = (result: unknown) => ({ jsonrpc: '2.0' as const, id: req.id ?? null, result });
    const fail = (code: number, message: string, data?: unknown) => ({
      jsonrpc: '2.0' as const,
      id: req.id ?? null,
      error: { code, message, ...(data ? { data } : {}) },
    });

    switch (req.method) {
      case 'initialize':
        return respond({
          protocolVersion: PROTOCOL_VERSION,
          capabilities: { tools: {} },
          serverInfo: SERVER_INFO,
        });

      case 'notifications/initialized':
        return null;

      case 'tools/list':
        return respond({ tools: TOOLS });

      case 'tools/call': {
        const name = String(req.params?.name ?? '');
        const args = (req.params?.arguments ?? {}) as Record<string, unknown>;
        // The token rides in _meta so the tool schemas stay clean.
        const token = (req.params?._meta as { token?: string } | undefined)?.token;

        let principal = 'unknown';
        try {
          principal = this.guard.authenticate(token);
          this.guard.checkRate(principal);
          this.guard.checkSize(
            typeof args.html === 'string'
              ? args.html
              : typeof args.code === 'string'
                ? args.code
                : undefined,
          );

          const result = this.dispatch(name, args);
          this.guard.record({
            at: new Date().toISOString(),
            tool: name,
            principal,
            outcome: 'ok',
          });
          return respond({
            content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
          });
        } catch (err) {
          const isToolError = err instanceof ToolError;
          const toolErr = err as ToolError;
          this.guard.record({
            at: new Date().toISOString(),
            tool: name,
            principal,
            outcome: isToolError && toolErr.code === 'unauthenticated' ? 'denied' : 'error',
            detail: err instanceof Error ? err.message : String(err),
          });
          if (isToolError) {
            // Tool-level failures are returned as content with isError so the
            // model can read and act on them, per MCP guidance.
            return respond({
              content: [
                {
                  type: 'text',
                  text: JSON.stringify({ error: toolErr.code, message: toolErr.message }, null, 2),
                },
              ],
              isError: true,
            });
          }
          return fail(-32603, 'Internal error', String(err));
        }
      }

      default:
        return fail(-32601, `Method not found: ${req.method}`);
    }
  }

  private dispatch(name: string, args: Record<string, unknown>): unknown {
    switch (name) {
      case 'ui_list_components':
        return listComponents(args as { filter?: string; rscOnly?: boolean; category?: string });
      case 'ui_get_component_api':
        return getComponentApi(args as unknown as { name: string });
      case 'ui_audit_accessibility':
        return auditAccessibility(args as unknown as { html: string }, this.validateAria);
      case 'ui_verify_security':
        return verifySecurity(args as unknown as { code: string });
      case 'ui_scaffold_form':
        return scaffoldForm(args as unknown as Parameters<typeof scaffoldForm>[0]);
      default:
        throw new ToolError('unknown_tool', `No such tool: ${name}`);
    }
  }

  auditLog() {
    return this.guard.auditLog();
  }

  /** Read JSON-RPC lines from stdin and write responses to stdout. */
  listen(input: NodeJS.ReadableStream = process.stdin, output: NodeJS.WritableStream = process.stdout) {
    const rl = createInterface({ input, terminal: false });
    rl.on('line', async (line) => {
      const text = line.trim();
      if (!text) return;
      let req: JsonRpcRequest;
      try {
        req = JSON.parse(text);
      } catch {
        output.write(
          JSON.stringify({
            jsonrpc: '2.0',
            id: null,
            error: { code: -32700, message: 'Parse error' },
          }) + '\n',
        );
        return;
      }
      const res = await this.handle(req);
      if (res) output.write(JSON.stringify(res) + '\n');
    });
  }
}
