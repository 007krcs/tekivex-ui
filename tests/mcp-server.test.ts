import { describe, it, expect } from 'vitest';
import { TekivexMcpServer, TOOLS } from '../packages/tekivex-mcp/src/server';
import { configFromEnv, Guard, ToolError } from '../packages/tekivex-mcp/src/enterprise';
import { validateAria } from '../src/a11y/aria/validate';
import catalog from '../packages/tekivex-mcp/src/catalog.json';

/** The suite runs in jsdom, so a DOM is already available. */
function validate(html: string) {
  const host = document.createElement('div');
  host.innerHTML = html;
  return validateAria(host);
}

function server(env: NodeJS.ProcessEnv = {}) {
  return new TekivexMcpServer(validate, configFromEnv(env));
}

async function call(srv: TekivexMcpServer, name: string, args: unknown, token?: string) {
  const res = (await srv.handle({
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/call',
    params: { name, arguments: args, ...(token ? { _meta: { token } } : {}) },
  })) as { result: { content: Array<{ text: string }>; isError?: boolean } };
  return {
    isError: res.result.isError ?? false,
    data: JSON.parse(res.result.content[0].text),
  };
}

describe('MCP protocol', () => {
  it('completes the initialize handshake', async () => {
    const res = (await server().handle({ jsonrpc: '2.0', id: 1, method: 'initialize' })) as {
      result: { protocolVersion: string; serverInfo: { name: string }; capabilities: object };
    };
    expect(res.result.protocolVersion).toBe('2024-11-05');
    expect(res.result.serverInfo.name).toBe('tekivex-ui');
    expect(res.result.capabilities).toHaveProperty('tools');
  });

  it('returns null for the initialized notification', async () => {
    expect(
      await server().handle({ jsonrpc: '2.0', method: 'notifications/initialized' }),
    ).toBeNull();
  });

  it('lists every tool with a valid JSON Schema', async () => {
    const res = (await server().handle({ jsonrpc: '2.0', id: 1, method: 'tools/list' })) as {
      result: { tools: typeof TOOLS };
    };
    expect(res.result.tools).toHaveLength(5);
    for (const tool of res.result.tools) {
      expect(tool.name).toMatch(/^ui_/);
      expect(tool.description.length).toBeGreaterThan(40);
      expect(tool.inputSchema).toHaveProperty('type', 'object');
    }
  });

  it('rejects an unknown method with JSON-RPC -32601', async () => {
    const res = (await server().handle({ jsonrpc: '2.0', id: 9, method: 'nope' })) as {
      error: { code: number };
    };
    expect(res.error.code).toBe(-32601);
  });
});

describe('ui_get_component_api — ground truth, not guesses', () => {
  it('reports the props TkxSelect really has', async () => {
    const { data } = await call(server(), 'ui_get_component_api', { name: 'TkxSelect' });
    const names = data.props.map((p: { name: string }) => p.name);
    expect(names).toContain('options');
    expect(names).toContain('placeholder');
    expect(data.props.find((p: { name: string }) => p.name === 'options').required).toBe(true);
  });

  it('exposes the item shapes callers get wrong', async () => {
    // These exact fields were mis-guessed in this repo's own fixtures: a
    // CommandPalette command is {id,title}, not {id,label}.
    const { data } = await call(server(), 'ui_get_component_api', {
      name: 'TkxCommandPalette',
    });
    const cmd = data.relatedTypes.CommandPaletteCommand;
    expect(cmd).toBeDefined();
    const fields = cmd.props.map((p: { name: string }) => p.name);
    expect(fields).toContain('title');
    expect(fields).not.toContain('label');
  });

  it('reports RSC safety accurately', async () => {
    const badge = await call(server(), 'ui_get_component_api', { name: 'TkxBadge' });
    expect(badge.data.rscSafe).toBe(true);
    expect(badge.data.clientDirectiveRequired).toBe(false);

    const select = await call(server(), 'ui_get_component_api', { name: 'TkxSelect' });
    expect(select.data.rscSafe).toBe(false);
  });

  it('suggests alternatives for an unknown component instead of inventing one', async () => {
    const { isError, data } = await call(server(), 'ui_get_component_api', {
      name: 'TkxDropDownMenu',
    });
    expect(isError).toBe(true);
    expect(data.error).toBe('not_found');
    expect(data.message).toMatch(/Did you mean/);
  });

  it('the catalog tracks the shipped library version', () => {
    expect(catalog.libraryVersion).toMatch(/^\d+\.\d+\.\d+$/);
    expect(catalog.componentCount).toBeGreaterThan(100);
  });
});

describe('ui_list_components', () => {
  it('filters by substring', async () => {
    const { data } = await call(server(), 'ui_list_components', { filter: 'select' });
    expect(data.components.some((c: { name: string }) => c.name === 'TkxSelect')).toBe(true);
  });

  it('rscOnly returns only server-safe components', async () => {
    const { data } = await call(server(), 'ui_list_components', { rscOnly: true });
    expect(data.count).toBeGreaterThan(0);
    expect(data.components.every((c: { rscSafe: boolean }) => c.rscSafe)).toBe(true);
  });
});

describe('ui_audit_accessibility — the real validator', () => {
  it('passes conformant markup', async () => {
    const { data } = await call(server(), 'ui_audit_accessibility', {
      html: '<button type="button">Save</button>',
    });
    expect(data.conformant).toBe(true);
  });

  it('catches a prohibited attribute', async () => {
    const { data } = await call(server(), 'ui_audit_accessibility', {
      html: '<div role="menu"><div role="menuitem" aria-selected="true">x</div></div>',
    });
    expect(data.conformant).toBe(false);
    expect(data.violations.map((v: { rule: string }) => v.rule)).toContain('prohibited-attr');
  });

  it('catches a dangling idref', async () => {
    const { data } = await call(server(), 'ui_audit_accessibility', {
      html: '<button aria-describedby="missing">x</button>',
    });
    expect(data.violations.map((v: { rule: string }) => v.rule)).toContain('dangling-idref');
  });

  it('states its own limits rather than implying full coverage', async () => {
    const { data } = await call(server(), 'ui_audit_accessibility', { html: '<p>hi</p>' });
    expect(data.note).toMatch(/contrast/i);
  });
});

describe('ui_verify_security', () => {
  it('flags dangerouslySetInnerHTML as critical with a remedy', async () => {
    const { data } = await call(server(), 'ui_verify_security', {
      code: 'const El = () => <div dangerouslySetInnerHTML={{ __html: userInput }} />;',
    });
    expect(data.pass).toBe(false);
    expect(data.highestSeverity).toBe('critical');
    expect(data.findings[0].remedy).toMatch(/sanitizeHTML/);
  });

  it('flags javascript: URLs and eval', async () => {
    const { data } = await call(server(), 'ui_verify_security', {
      code: ['<a href="javascript:alert(1)">x</a>', 'eval(userCode);'].join('\n'),
    });
    expect(data.findingCount).toBeGreaterThanOrEqual(2);
    expect(data.findings.map((f: { rule: string }) => f.rule)).toContain('eval-family');
  });

  it('flags sanitizeString used at an HTML sink (the 4.0 trap)', async () => {
    const { data } = await call(server(), 'ui_verify_security', {
      code: 'el.innerHTML = sanitizeString(value);',
    });
    const rules = data.findings.map((f: { rule: string }) => f.rule);
    expect(rules).toContain('sanitize-string-into-html-sink');
  });

  it('passes clean code', async () => {
    const { data } = await call(server(), 'ui_verify_security', {
      code: 'export const Hello = () => <p>{name}</p>;',
    });
    expect(data.pass).toBe(true);
  });
});

describe('ui_scaffold_form', () => {
  it('generates a form from components that exist', async () => {
    const { data } = await call(server(), 'ui_scaffold_form', {
      formName: 'SignupForm',
      fields: [
        { name: 'email', type: 'string', label: 'Email', required: true },
        { name: 'age', type: 'number' },
      ],
    });
    expect(data.code).toContain('export function SignupForm');
    expect(data.code).toContain('TkxFormField');
    expect(data.componentsUsed).toContain('TkxInput');
    expect(data.componentsUsed).toContain('TkxNumberInput');
    expect(data.code).toContain("'use client'");
  });

  it('refuses an unsupported field type rather than inventing a component', async () => {
    const { isError, data } = await call(server(), 'ui_scaffold_form', {
      fields: [{ name: 'sig', type: 'hologram' }],
    });
    expect(isError).toBe(true);
    expect(data.error).toBe('unsupported_field_type');
    expect(data.message).toMatch(/Supported:/);
  });

  it('generated markup is itself ARIA-conformant in spirit (no invented roles)', async () => {
    const { data } = await call(server(), 'ui_scaffold_form', {
      fields: [{ name: 'a', type: 'string' }],
    });
    expect(data.code).not.toMatch(/role=/);
  });
});

describe('enterprise controls', () => {
  const TOKENS = { TEKIVEX_MCP_TOKENS: 'team-a:s3cret' } as NodeJS.ProcessEnv;

  it('runs unauthenticated when no tokens are configured (stdio default)', async () => {
    const { isError } = await call(server(), 'ui_list_components', {});
    expect(isError).toBe(false);
  });

  it('denies a call with no token once tokens are configured', async () => {
    const { isError, data } = await call(server(TOKENS), 'ui_list_components', {});
    expect(isError).toBe(true);
    expect(data.error).toBe('unauthenticated');
  });

  it('denies a wrong token and accepts the right one', async () => {
    const bad = await call(server(TOKENS), 'ui_list_components', {}, 'nope');
    expect(bad.data.error).toBe('unauthenticated');
    const good = await call(server(TOKENS), 'ui_list_components', {}, 's3cret');
    expect(good.isError).toBe(false);
  });

  it('rate limits per principal', () => {
    const guard = new Guard({ ...configFromEnv({}), rateLimit: 2, rateWindowMs: 60_000 });
    guard.checkRate('p');
    guard.checkRate('p');
    expect(() => guard.checkRate('p')).toThrow(ToolError);
    // A different principal has its own budget.
    expect(() => guard.checkRate('other')).not.toThrow();
  });

  it('rejects oversized input rather than buffering it', async () => {
    const srv = server({ TEKIVEX_MCP_MAX_INPUT_BYTES: '100' } as NodeJS.ProcessEnv);
    const { isError, data } = await call(srv, 'ui_verify_security', { code: 'x'.repeat(500) });
    expect(isError).toBe(true);
    expect(data.error).toBe('payload_too_large');
  });

  it('writes an audit entry for allowed and denied calls', async () => {
    const srv = server(TOKENS);
    await call(srv, 'ui_list_components', {}, 's3cret');
    await call(srv, 'ui_list_components', {});
    const log = srv.auditLog();
    expect(log).toHaveLength(2);
    expect(log[0]).toMatchObject({ tool: 'ui_list_components', principal: 'team-a', outcome: 'ok' });
    expect(log[1].outcome).toBe('denied');
    expect(Date.parse(log[0].at)).not.toBeNaN();
  });
});
