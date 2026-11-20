import { NextRequest, NextResponse } from "next/server";
import { chatWithRepository } from "@/lib/ai/gemini";
import { getRepositoryStore } from "@/lib/search/vector-store";
import { analyzeRepository } from "@/lib/indexing/analyzer";
import { demoSearchResults } from "@/lib/demo-data";
import { CodeChunk } from "@/types/repository";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ owner: string; name: string }> }
) {
  try {
    const { owner, name } = await params;
    const body = await req.json();
    const messages = body.messages || [];

    const repoId = `${owner}/${name}`.toLowerCase();
    const store = getRepositoryStore(repoId);

    if (store.getChunks().length === 0) {
      try {
        await analyzeRepository(owner, name);
      } catch {
        // Fallback
      }
    }

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

    const topChunks = store.getChunks().slice(0, 5);

    const { reply, citations } = await chatWithRepository(
      messages,
      topChunks,
      `${owner}/${name}`
    );

    return NextResponse.json({
      success: true,
      message: {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: reply,
        citations,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
