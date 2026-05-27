// ══════════════════════════════════════════════════════════════════════════════
// MCP ADAPTER (#6) — Wrap an MCP server's tools as native Agent Tools.
// One call: `mcpTools(client)` → `Tool[]` ready to pass to createAgent.
// ══════════════════════════════════════════════════════════════════════════════

import { defineTool, type Tool } from '../core/Tool';
import { MCPClient, type MCPCallResult, type MCPTool } from './MCPClient';

export async function mcpTools(
  client: MCPClient,
  signal?: AbortSignal,
): Promise<Tool[]> {
  const tools = await client.listTools(signal);
  return tools.map((t) => wrapMCPTool(client, t));
}

function wrapMCPTool(client: MCPClient, mt: MCPTool): Tool {
  return defineTool({
    name: mt.name,
    description: mt.description ?? '',
    inputSchema: mt.inputSchema,
    async execute(input, ctx) {
      const result = await client.callTool(mt.name, input, ctx.signal);
      return normalizeCallResult(result);
    },
  });
}

function normalizeCallResult(result: MCPCallResult): string {
  const parts = result.content ?? [];
  const text = parts
    .filter((p) => p.type === 'text' && typeof p.text === 'string')
    .map((p) => p.text!)
    .join('\n');
  if (result.isError) return `Tool reported error: ${text}`;
  return text || '(empty result)';
}
