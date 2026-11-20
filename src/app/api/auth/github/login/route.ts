import { NextRequest, NextResponse } from "next/server";
import { getGitHubAuthUrl } from "@/lib/auth/github";

export async function GET(req: NextRequest) {
  const host = req.headers.get("host") || "localhost:3000";
  const protocol = req.headers.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
  const redirectUri = `${protocol}://${host}/api/auth/github/callback`;

  const authUrl = getGitHubAuthUrl(redirectUri);
  return NextResponse.redirect(authUrl);
}
