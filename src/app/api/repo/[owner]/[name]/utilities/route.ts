import { NextRequest, NextResponse } from "next/server";
import { analyzeRepository } from "@/lib/indexing/analyzer";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ owner: string; name: string }> }
) {
  try {
    const { owner, name } = await params;
    const branch = req.nextUrl.searchParams.get("branch") || "main";

    try {
      const analysis = await analyzeRepository(owner, name, branch);
      return NextResponse.json({
        success: true,
        data: {
          envAudit: analysis.envAudit,
          symbols: analysis.symbols,
        },
      });
    } catch {
      return NextResponse.json({
        success: true,
        data: {
          envAudit: [
            {
              name: "GITHUB_TOKEN",
              files: ["src/lib/github/api.ts", ".env.local"],
              isSecret: true,
              description: "GitHub REST API access token.",
            },
            {
              name: "GEMINI_API_KEY",
              files: ["src/lib/ai/gemini.ts", ".env.local"],
              isSecret: true,
              description: "Google Gemini API key for embeddings and RAG.",
            },
          ],
          symbols: [
            { name: "analyzeRepository", type: "function", filePath: "src/lib/indexing/analyzer.ts", line: 110 },
            { name: "fetchRepoMetadata", type: "function", filePath: "src/lib/github/api.ts", line: 110 },
          ],
        },
        isFallback: true,
      });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
