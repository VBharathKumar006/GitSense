import { CodeChunk, SearchResult } from "@/types/repository";

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export function computeKeywordScore(query: string, chunk: CodeChunk): number {
  const queryTerms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (queryTerms.length === 0) return 0;

  const contentLower = chunk.content.toLowerCase();
  const pathLower = chunk.filePath.toLowerCase();
  const nameLower = (chunk.name || "").toLowerCase();

  let score = 0;

  for (const term of queryTerms) {
    // Exact file or function name match gets heavy boost
    if (nameLower.includes(term)) {
      score += 0.4;
    }
    if (pathLower.includes(term)) {
      score += 0.3;
    }
    // Content occurrence
    const count = (contentLower.match(new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || []).length;
    if (count > 0) {
      score += Math.min(count * 0.1, 0.4);
    }
  }

  return Math.min(score / queryTerms.length, 1.0);
}

export class RepositoryVectorStore {
  private chunks: CodeChunk[] = [];
  private repoId: string;

  constructor(repoId: string, initialChunks: CodeChunk[] = []) {
    this.repoId = repoId;
    this.chunks = initialChunks;
  }

  public addChunks(newChunks: CodeChunk[]) {
    this.chunks.push(...newChunks);
  }

  public getChunks(): CodeChunk[] {
    return this.chunks;
  }

  public search(
    query: string,
    queryEmbedding?: number[],
    limit = 10
  ): SearchResult[] {
    const scored = this.chunks.map((chunk) => {
      const keywordScore = computeKeywordScore(query, chunk);
      let vectorScore = 0;

      if (queryEmbedding && chunk.embedding && chunk.embedding.length > 0) {
        vectorScore = cosineSimilarity(queryEmbedding, chunk.embedding);
      }

      // Hybrid calculation:
      // If we have vector embeddings, 65% vector + 35% keyword
      // Otherwise 100% keyword
      const finalScore = queryEmbedding && chunk.embedding
        ? vectorScore * 0.65 + keywordScore * 0.35
        : keywordScore;

      const matchType: "semantic" | "keyword" | "hybrid" =
        queryEmbedding && chunk.embedding && keywordScore > 0.2
          ? "hybrid"
          : queryEmbedding && chunk.embedding
          ? "semantic"
          : "keyword";

      return {
        id: chunk.id,
        filePath: chunk.filePath,
        fileName: chunk.fileName,
        language: chunk.language,
        snippet: chunk.content,
        startLine: chunk.startLine,
        endLine: chunk.endLine,
        score: finalScore,
        matchType,
        explanation: `Matched ${matchType} index on ${chunk.type || "block"} "${chunk.name || chunk.fileName}" (${Math.round(finalScore * 100)}% confidence).`,
        relatedFiles: chunk.imports?.filter((imp) => imp.startsWith(".") || imp.startsWith("@/")),
      };
    });

    return scored
      .filter((r) => r.score > 0.05)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }
}

// Global active store map for multi-repo sessions
const activeStores = new Map<string, RepositoryVectorStore>();

export function getRepositoryStore(repoId: string): RepositoryVectorStore {
  let store = activeStores.get(repoId);
  if (!store) {
    store = new RepositoryVectorStore(repoId);
    activeStores.set(repoId, store);
  }
  return store;
}
