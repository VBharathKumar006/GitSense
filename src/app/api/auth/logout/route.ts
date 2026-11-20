import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const host = req.headers.get("host") || "localhost:3000";
  const protocol = req.headers.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");

  const response = NextResponse.json({ success: true, message: "Logged out" });
  response.cookies.delete("gitsense_gh_token");
  return response;
}
