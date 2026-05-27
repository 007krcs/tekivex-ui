// ══════════════════════════════════════════════════════════════════════════════
// DEEP RESEARCH (#12) — Planner → parallel sub-agents → synthesis.
// 1. Decompose the question into sub-tasks via structured output.
// 2. Run a sub-agent per sub-task in parallel (RAG + tools).
// 3. Synthesize a final answer that cites the sub-findings.
// ══════════════════════════════════════════════════════════════════════════════

import { createAgent } from '../core/Agent';
import type { Provider } from '../core/Provider';
import type { Tool } from '../core/Tool';
import { retrievalTool } from '../rag/retrievalTool';
import type { Retriever } from '../rag/Retriever';
import { generateObject } from '../structured/generateObject';

export interface DeepResearchOptions {
  provider: Provider;
  model: string;
  retriever?: Retriever;
  tools?: Tool[];
  maxSubtasks?: number;
  concurrency?: number;
  signal?: AbortSignal;
}

export interface ResearchPlan {
  subtasks: Array<{ id: string; question: string }>;
}

export interface SubFinding {
  id: string;
  question: string;
  findings: string;
  error?: string;
}

export interface ResearchResult {
  question: string;
  plan: ResearchPlan;
  subFindings: SubFinding[];
  synthesis: string;
}

export class DeepResearch {
  constructor(private readonly opts: DeepResearchOptions) {}

  async run(question: string, signal?: AbortSignal): Promise<ResearchResult> {
    const ac = signal ?? this.opts.signal;
    const baseTools: Tool[] = [...(this.opts.tools ?? [])];
    if (this.opts.retriever) {
      baseTools.push(retrievalTool({ retriever: this.opts.retriever }));
    }

    const plan = await generateObject<ResearchPlan>({
      provider: this.opts.provider,
      model: this.opts.model,
      schema: {
        type: 'object',
        properties: {
          subtasks: {
            type: 'array',
            maxItems: this.opts.maxSubtasks ?? 5,
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                question: { type: 'string' },
              },
              required: ['id', 'question'],
            },
          },
        },
        required: ['subtasks'],
      },
      system:
        "You are a research planner. Break the user's question into 3-5 atomic, independently researchable sub-questions.",
      prompt: question,
      signal: ac,
    });

    const concurrency = this.opts.concurrency ?? 3;
    const subFindings = await pool(plan.subtasks, concurrency, (st) =>
      this.research(st.id, st.question, baseTools, ac),
    );

    const synthesizer = createAgent({
      provider: this.opts.provider,
      model: this.opts.model,
      system:
        'Synthesize sub-agent findings into one coherent answer. Preserve citations and call out conflicts.',
    });
    const synthesisPrompt =
      `Original question: ${question}\n\n` +
      subFindings
        .map(
          (f) =>
            `## Sub-question [${f.id}]: ${f.question}\n` +
            (f.error ? `(Error: ${f.error})` : f.findings),
        )
        .join('\n\n---\n\n');

    let synthesis = '';
    for await (const evt of synthesizer.run({ message: synthesisPrompt, signal: ac })) {
      if (evt.type === 'text_delta') synthesis += evt.text;
    }

    return { question, plan, subFindings, synthesis };
  }

  private async research(
    id: string,
    question: string,
    tools: Tool[],
    signal?: AbortSignal,
  ): Promise<SubFinding> {
    const agent = createAgent({
      provider: this.opts.provider,
      model: this.opts.model,
      tools,
      system: 'Investigate the question rigorously. Cite sources inline as [Source N].',
    });
    let findings = '';
    try {
      for await (const evt of agent.run({ message: question, signal })) {
        if (evt.type === 'text_delta') findings += evt.text;
      }
      return { id, question, findings };
    } catch (err) {
      return {
        id,
        question,
        findings: '',
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }
}

export function createDeepResearch(opts: DeepResearchOptions): DeepResearch {
  return new DeepResearch(opts);
}

async function pool<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let cursor = 0;
  async function worker() {
    while (true) {
      const i = cursor++;
      if (i >= items.length) return;
      results[i] = await fn(items[i]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, worker));
  return results;
}
