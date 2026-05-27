// ══════════════════════════════════════════════════════════════════════════════
// CANCELLATION (#8) — Wrap a Tool so an AbortSignal really stops it.
// Races the tool's execute() against signal-abort.
// ══════════════════════════════════════════════════════════════════════════════

import { defineTool, type Tool } from '../core/Tool';

export class ToolAbortError extends Error {
  constructor(public readonly toolName: string) {
    super(`Tool '${toolName}' aborted`);
    this.name = 'ToolAbortError';
  }
}

export function cancellable<TInput, TOutput>(
  tool: Tool<TInput, TOutput>,
): Tool<TInput, TOutput> {
  return defineTool<TInput, TOutput>({
    name: tool.name,
    description: tool.description,
    inputSchema: tool.inputSchema,
    parse: tool.parse,
    async execute(input, ctx) {
      if (ctx.signal?.aborted) throw new ToolAbortError(tool.name);
      if (!ctx.signal) return tool.execute(input, ctx);
      return Promise.race<TOutput>([
        tool.execute(input, ctx),
        new Promise<TOutput>((_, reject) => {
          ctx.signal!.addEventListener(
            'abort',
            () => reject(new ToolAbortError(tool.name)),
            { once: true },
          );
        }),
      ]);
    },
  });
}
