import { NextRequest, NextResponse } from "next/server";
import { fetchFileContent } from "@/lib/github/api";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ owner: string; name: string }> }
) {
  try {
    const { owner, name } = await params;
    const filePath = req.nextUrl.searchParams.get("path");
    const branch = req.nextUrl.searchParams.get("branch") || "main";

    if (!filePath) {
      return NextResponse.json({ error: "Query param 'path' is required" }, { status: 400 });
    }

    try {
      const content = await fetchFileContent(owner, name, filePath, branch);
      return NextResponse.json({ success: true, path: filePath, content });
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 404 });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
