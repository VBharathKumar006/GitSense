import { NextRequest, NextResponse } from "next/server";
import { chatWithRepository, generateEmbedding } from "@/lib/ai/gemini";
import { getRepositoryStore } from "@/lib/search/vector-store";
import { analyzeRepository } from "@/lib/indexing/analyzer";
import { getServerGitHubToken } from "@/lib/auth/github";
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
    const token = (await getServerGitHubToken()) || undefined;

    const repoId = `${owner}/${name}`.toLowerCase();
    const store = getRepositoryStore(repoId);
    const isDemo = owner.toLowerCase() === "vercel" && name.toLowerCase() === "commerce";

    if (store.getChunks().length === 0) {
      try {
        await analyzeRepository(owner, name, "main", token);
      } catch {
        // Fallback
      }
    }

    if (store.getChunks().length === 0) {
      if (isDemo) {
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
      } else {
        const repoChunk: CodeChunk = {
          id: `${owner}/${name}#root`,
          filePath: "README.md",
          fileName: "README.md",
          language: "Markdown",
          startLine: 1,
          endLine: 25,
          content: `# ${owner}/${name}\n\nRepository: https://github.com/${owner}/${name}\nIndexed by GitSense for grounded code search and architecture understanding.`,
          type: "module",
          name: `${owner}/${name}`,
        };
        store.addChunks([repoChunk]);
      }
    }

    // Retrieve user query from the last message to find the most relevant chunks
    const lastUserMessage = messages[messages.length - 1]?.content || "";
    let queryEmbedding: number[] | undefined;
    try {
      const emb = await generateEmbedding(lastUserMessage);
      if (emb) queryEmbedding = emb;
    } catch {
      // Non-fatal
    }

    const matchedResults = store.search(lastUserMessage, queryEmbedding, 5);
    const topChunks: CodeChunk[] = matchedResults.length > 0
      ? matchedResults.map((r) => ({
          id: r.id,
          filePath: r.filePath,
          fileName: r.fileName,
          language: r.language,
          startLine: r.startLine,
          endLine: r.endLine,
          content: r.snippet,
          type: "function" as const,
          name: r.fileName,
        }))
      : store.getChunks().slice(0, 5);

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
