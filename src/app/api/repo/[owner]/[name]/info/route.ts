import { NextRequest, NextResponse } from "next/server";
import { fetchRepoMetadata } from "@/lib/github/api";
import { demoRepository } from "@/lib/demo-data";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ owner: string; name: string }> }
) {
  try {
    const { owner, name } = await params;

    // If matches demo repo or GitHub request fails, fallback gracefully
    try {
      const metadata = await fetchRepoMetadata(owner, name);
      return NextResponse.json({ success: true, data: metadata });
    } catch (err: any) {
      if (owner.toLowerCase() === "vercel" && name.toLowerCase() === "commerce") {
        return NextResponse.json({ success: true, data: demoRepository });
      }
      return NextResponse.json(
        {
          success: true,
          data: {
            ...demoRepository,
            owner,
            name,
            fullName: `${owner}/${name}`,
            url: `https://github.com/${owner}/${name}`,
          },
          warning: err.message,
        },
        { status: 200 }
      );
    }
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
