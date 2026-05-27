// ══════════════════════════════════════════════════════════════════════════════
// RETRIEVER — Port for RAG. Implement against any vector store / KB / search.
// Pinecone, Weaviate, pgvector, Elasticsearch, in-memory — same interface.
// ══════════════════════════════════════════════════════════════════════════════

export interface RetrievalResult {
  text: string;
  score: number;
  metadata?: Record<string, unknown>;
}

export interface RetrieveOptions {
  topK?: number;
  signal?: AbortSignal;
  filter?: Record<string, unknown>;
}

export interface Retriever {
  retrieve(query: string, opts?: RetrieveOptions): Promise<RetrievalResult[]>;
}
