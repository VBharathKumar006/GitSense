import { CodeChunk, SearchResult } from "@/types/repository";

export interface PgVectorConfig {
  databaseUrl?: string;
}

/**
 * Checks if a PostgreSQL connection is available for pgvector persistence.
 */
export function isPgVectorEnabled(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

/**
 * Formats a vector array for PostgreSQL vector literal format: '[0.1, 0.2, ...]'
 */
export function formatVectorLiteral(vector: number[]): string {
  return `[${vector.join(",")}]`;
}

/**
 * Parses vector string '[0.1,0.2,...]' from PostgreSQL into number array.
 */
export function parseVectorLiteral(vectorStr: string): number[] {
  const trimmed = vectorStr.trim().replace(/^\[|\]$/g, "");
  if (!trimmed) return [];
  return trimmed.split(",").map((v) => parseFloat(v));
}

/**
 * Queries pgvector if DATABASE_URL is configured, otherwise returns null.
 */
export async function queryPgVector(
  repoId: string,
  queryEmbedding: number[],
  limit = 8
): Promise<SearchResult[] | null> {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) return null;

  try {
    // Dynamic import to avoid bundling errors in purely client/offline environments
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pg = await (Function('return import("pg")')() as Promise<any>);
    const pool = new pg.Pool({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });

    const client = await pool.connect();
    try {
      const vectorLiteral = formatVectorLiteral(queryEmbedding);
      const res = await client.query(
        `SELECT * FROM match_code_chunks($1, $2::vector, 0.2, $3)`,
        [repoId, vectorLiteral, limit]
      );

      return res.rows.map((row: any) => ({
        id: row.id,
        filePath: row.file_path,
        fileName: row.file_name,
        language: row.language,
        snippet: row.content,
        startLine: row.start_line,
        endLine: row.end_line,
        score: row.similarity,
        matchType: "semantic",
        explanation: `Matched pgvector index with ${(row.similarity * 100).toFixed(1)}% cosine similarity.`,
      }));
    } finally {
      client.release();
      await pool.end();
    }
  } catch (err: any) {
    console.warn("pgvector query failed, falling back to memory store:", err.message);
    return null;
  }
}
