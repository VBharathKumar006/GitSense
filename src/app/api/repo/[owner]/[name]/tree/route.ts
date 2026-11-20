import { NextRequest, NextResponse } from "next/server";
import { analyzeRepository } from "@/lib/indexing/analyzer";
import { demoFileTree } from "@/lib/demo-data";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ owner: string; name: string }> }
) {
  try {
    const { owner, name } = await params;
    const branch = req.nextUrl.searchParams.get("branch") || "main";

    try {
      const analysis = await analyzeRepository(owner, name, branch);
      const tree = analysis.fileTree.length > 0 ? analysis.fileTree : demoFileTree;
      return NextResponse.json({
        success: true,
        count: tree.length,
        data: tree,
      });
    } catch {
      return NextResponse.json({
        success: true,
        count: demoFileTree.length,
        data: demoFileTree,
        isFallback: true,
      });
    }
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
