import { NextRequest, NextResponse } from "next/server";
import { getRepositoryStore } from "@/lib/search/vector-store";
import { queryPgVector, isPgVectorEnabled } from "@/lib/search/pgvector";
import { generateEmbedding, answerCodeQuestion } from "@/lib/ai/gemini";
import { analyzeRepository } from "@/lib/indexing/analyzer";
import { demoSearchResults } from "@/lib/demo-data";
import { CodeChunk, SearchResult } from "@/types/repository";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ owner: string; name: string }> }
) {
  try {
    const { owner, name } = await params;
    const body = await req.json();
    const query = body.query;

    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "A search 'query' string is required" }, { status: 400 });
    }

    const repoId = `${owner}/${name}`.toLowerCase();
    const store = getRepositoryStore(repoId);

    // If store has no chunks yet, analyze and index the repository
    if (store.getChunks().length === 0) {
      try {
        await analyzeRepository(owner, name);
      } catch {
        // Fallback
      }
    }

    // If still empty (e.g. offline/fallback), seed with sample chunks
    if (store.getChunks().length === 0) {
      const seedChunks: CodeChunk[] = demoSearchResults.map((r) => ({
        id: r.id,
        filePath: r.filePath,
        fileName: r.fileName,
        language: r.language,
        startLine: r.startLine,
        endLine: r.endLine,
        content: r.snippet,
        type: "function",
        name: r.fileName,
      }));
      store.addChunks(seedChunks);
    }

    // Try embedding generation
    let queryEmbedding: number[] | undefined;
    try {
      const emb = await generateEmbedding(query);
      if (emb) queryEmbedding = emb;
    } catch {
      // Fallback gracefully to keyword search
    }

    // Check pgvector first if configured
    let matchedResults: SearchResult[] = [];
    if (queryEmbedding && isPgVectorEnabled()) {
      const pgResults = await queryPgVector(repoId, queryEmbedding, 8);
      if (pgResults && pgResults.length > 0) {
        matchedResults = pgResults;
      }
    }

    if (matchedResults.length === 0) {
      matchedResults = store.search(query, queryEmbedding, 8);
    }
    const topChunks = store.getChunks().slice(0, 5);

    // AI synthesis
    const { answer, citations } = await answerCodeQuestion(
      query,
      topChunks,
      `${owner}/${name}`
    );

    return NextResponse.json({
      success: true,
      query,
      answer,
      citations,
      results: matchedResults.length > 0 ? matchedResults : demoSearchResults,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
