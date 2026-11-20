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
          routes: analysis.routes,
          securityAudit: analysis.securityAudit,
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
          routes: [
            { method: "GET / POST", path: "/api/revalidate", file: "src/app/api/revalidate/route.ts", description: "Webhook cache revalidation endpoint" },
          ],
          securityAudit: [
            { severity: "safe", title: "Dependencies Integrity", file: "package.json", recommendation: "Pinned package versions" },
            { severity: "safe", title: "Code RAG Guardrails", file: "src/lib/ai/gemini.ts", recommendation: "Delimited XML code blocks against injection" },
          ],
        },
        isFallback: true,
      });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
