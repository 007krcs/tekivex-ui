// ══════════════════════════════════════════════════════════════════════════════
// CITATIONS (#12) — Extract / merge / format citations.
// ══════════════════════════════════════════════════════════════════════════════

export interface Citation {
  id: string;
  text: string;
  source?: string;
  url?: string;
  score?: number;
}

export function extractCitations(text: string): Citation[] {
  const citations: Citation[] = [];
  const regex = /\[Source\s+(\d+)(?:\s*\|\s*score=([\d.]+))?\]\s*\n?([^[]+?)(?=\n\n\[Source|\n---|$)/gs;
  for (const m of text.matchAll(regex)) {
    citations.push({
      id: m[1],
      score: m[2] ? parseFloat(m[2]) : undefined,
      text: m[3].trim(),
    });
  }
  return citations;
}

export function mergeCitations(...lists: Citation[][]): Citation[] {
  const seen = new Map<string, Citation>();
  let nextId = 1;
  for (const list of lists) {
    for (const c of list) {
      const key = (c.source ?? '') + '|' + c.text.slice(0, 80);
      if (!seen.has(key)) {
        seen.set(key, { ...c, id: String(nextId++) });
      }
    }
  }
  return Array.from(seen.values());
}

export function formatCitationsList(citations: Citation[]): string {
  return citations
    .map((c) => `[${c.id}] ${c.source ? `${c.source} — ` : ''}${c.text.slice(0, 240)}`)
    .join('\n');
}
