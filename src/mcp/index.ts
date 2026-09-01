/**
 * Model Context Protocol server for tekivex-ui.
 *
 * Ships inside the main package rather than as a separate one: the tools answer
 * from this library's own source, so versioning them apart would let the
 * catalog drift from the components it describes.
 *
 * Run it via the `tekivex-mcp` bin, or embed it:
 *
 *   import { TekivexMcpServer, createAriaValidator } from 'tekivex-ui/mcp';
 */
export { TekivexMcpServer, TOOLS } from './server';
export type { ToolDefinition, AriaValidator } from './server';
export { Guard, ToolError, configFromEnv } from './enterprise';
export type { ServerConfig, AuditEntry } from './enterprise';
export { createAriaValidator, defaultDomFactory } from './ariaValidator';
export type { DomFactory } from './ariaValidator';
export {
  listComponents,
  getComponentApi,
  auditAccessibility,
  verifySecurity,
  scaffoldForm,
} from './tools';
export type { AriaCheck, ScaffoldField } from './tools';
