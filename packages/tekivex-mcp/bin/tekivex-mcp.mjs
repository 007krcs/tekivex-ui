#!/usr/bin/env node
/**
 * Entry point for the TekiVex UI MCP server (stdio transport).
 *
 * Claude Desktop / IDE config:
 *   {
 *     "mcpServers": {
 *       "tekivex-ui": { "command": "npx", "args": ["-y", "tekivex-mcp"] }
 *     }
 *   }
 *
 * Over stdio the transport is the trust boundary, so authentication is off by
 * default. Set TEKIVEX_MCP_TOKENS ("team-a:secret,team-b:secret") when exposing
 * this over anything else.
 */
import { TekivexMcpServer } from '../dist/server.js';
import { createAriaValidator, defaultDomFactory } from '../dist/ariaValidator.js';

const domFactory = await defaultDomFactory();
const validate = domFactory
  ? createAriaValidator(domFactory)
  : () => {
      throw new Error(
        'ui_audit_accessibility needs a DOM. Install the optional peer dependency: npm i -D jsdom',
      );
    };

new TekivexMcpServer(validate).listen();
