import { NextRequest, NextResponse } from "next/server";
import { analyzeRepository } from "@/lib/indexing/analyzer";
import { getServerGitHubToken } from "@/lib/auth/github";
import { demoFileTree } from "@/lib/demo-data";

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
      const isDemo = owner.toLowerCase() === "vercel" && name.toLowerCase() === "commerce";
      const fallbackTree = isDemo
        ? demoFileTree
        : [
            { path: "README.md", name: "README.md", type: "file" as const, size: 512, language: "Markdown" },
            { path: "package.json", name: "package.json", type: "file" as const, size: 1024, language: "JSON" },
          ];
      const tree = analysis.fileTree.length > 0 ? analysis.fileTree : fallbackTree;
      return NextResponse.json({
        success: true,
        count: tree.length,
        data: tree,
      });
    } catch {
      const isDemo = owner.toLowerCase() === "vercel" && name.toLowerCase() === "commerce";
      const fallbackTree = isDemo
        ? demoFileTree
        : [
            { path: "README.md", name: "README.md", type: "file" as const, size: 512, language: "Markdown" },
            { path: "package.json", name: "package.json", type: "file" as const, size: 1024, language: "JSON" },
          ];
      return NextResponse.json({
        success: true,
        count: fallbackTree.length,
        data: fallbackTree,
        isFallback: true,
      });
    }
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
