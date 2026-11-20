import { NextRequest, NextResponse } from "next/server";
import { analyzeRepository } from "@/lib/indexing/analyzer";
import { getServerGitHubToken } from "@/lib/auth/github";
import { demoArchitectureDiagrams } from "@/lib/demo-data";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ owner: string; name: string }> }
) {
  try {
    const { owner, name } = await params;
    const branch = req.nextUrl.searchParams.get("branch") || "main";
    const token = (await getServerGitHubToken()) || undefined;

    try {
      const analysis = await analyzeRepository(owner, name, branch, token);
      return NextResponse.json({
        success: true,
        data: analysis.diagrams.length > 0 ? analysis.diagrams : demoArchitectureDiagrams,
      });
    } catch {
      return NextResponse.json({
        success: true,
        data: demoArchitectureDiagrams,
        isFallback: true,
      });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
