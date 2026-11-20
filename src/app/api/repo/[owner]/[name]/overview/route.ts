import { NextRequest, NextResponse } from "next/server";
import { analyzeRepository } from "@/lib/indexing/analyzer";
import { demoOverview } from "@/lib/demo-data";

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
        repository: `${owner}/${name}`,
        data: analysis.overview,
      });
    } catch {
      return NextResponse.json({
        success: true,
        repository: `${owner}/${name}`,
        data: demoOverview,
        isFallback: true,
      });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
