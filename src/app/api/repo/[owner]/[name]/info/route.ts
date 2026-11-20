import { NextRequest, NextResponse } from "next/server";
import { fetchRepoMetadata } from "@/lib/github/api";
import { getServerGitHubToken } from "@/lib/auth/github";
import { demoRepository } from "@/lib/demo-data";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ owner: string; name: string }> }
) {
  try {
    const { owner, name } = await params;
    const token = (await getServerGitHubToken()) || undefined;

    // If matches demo repo or GitHub request fails, fallback gracefully
    try {
      const metadata = await fetchRepoMetadata(owner, name, token);
      return NextResponse.json({ success: true, data: metadata });
    } catch (err: any) {
      if (owner.toLowerCase() === "vercel" && name.toLowerCase() === "commerce") {
        return NextResponse.json({ success: true, data: demoRepository });
      }
      return NextResponse.json(
        {
          success: true,
          data: {
            id: 0,
            owner,
            name,
            fullName: `${owner}/${name}`,
            url: `https://github.com/${owner}/${name}`,
            description: `GitHub repository ${owner}/${name}`,
            defaultBranch: "main",
            stars: 0,
            forks: 0,
            openIssues: 0,
            size: 0,
            language: "Codebase",
            updatedAt: new Date().toISOString(),
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
