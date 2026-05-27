// ─────────────────────────────────────────────────────────────────────────────
// #6 · MCP (Model Context Protocol) — import remote tools
// ─────────────────────────────────────────────────────────────────────────────

import {
  AnthropicProvider,
  MCPClient,
  createAgent,
  mcpTools,
} from 'tekivex-ui/agent';

async function main() {
  const mcp = new MCPClient({
    endpoint: 'https://my-mcp-server.example/jsonrpc',
    headers: { authorization: `Bearer ${process.env.MCP_TOKEN}` },
  });

  // Discover and wrap every tool the server exposes.
  const tools = await mcpTools(mcp);
  console.log(`Imported ${tools.length} MCP tools:`, tools.map(t => t.name));

  const agent = createAgent({
    provider: new AnthropicProvider({ endpoint: '/api/anthropic' }),
    model: 'claude-opus-4-7',
    tools,
    system: 'Use the available tools to help the user.',
  });

  for await (const evt of agent.run({ message: 'List the open issues in repo X' })) {
    if (evt.type === 'text_delta') process.stdout.write(evt.text);
  }
}

main();
