import { NextRequest, NextResponse } from "next/server";
import { analyzeRepository } from "@/lib/indexing/analyzer";
import { demoDependencies } from "@/lib/demo-data";

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
        data: analysis.dependencies,
      });
    } catch {
      return NextResponse.json({
        success: true,
        data: demoDependencies,
        isFallback: true,
      });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
