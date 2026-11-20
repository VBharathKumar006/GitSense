import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForToken } from "@/lib/auth/github";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const host = req.headers.get("host") || "localhost:3000";
  const protocol = req.headers.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
  const redirectUri = `${protocol}://${host}/api/auth/github/callback`;

  if (!code) {
    return NextResponse.redirect(`${protocol}://${host}/?error=missing_code`);
  }

  try {
    const token = await exchangeCodeForToken(code, redirectUri);
    const response = NextResponse.redirect(`${protocol}://${host}/?auth=success`);

    // Store in secure HTTP-only cookie valid for 30 days
    response.cookies.set("gitsense_gh_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });

    return response;
  } catch (err: any) {
    return NextResponse.redirect(`${protocol}://${host}/?error=${encodeURIComponent(err.message)}`);
  }
}
