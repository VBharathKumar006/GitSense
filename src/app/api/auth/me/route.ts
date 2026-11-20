import { NextResponse } from "next/server";
import { getServerGitHubToken, fetchAuthenticatedUser } from "@/lib/auth/github";

export async function GET() {
  try {
    const token = await getServerGitHubToken();
    if (!token) {
      return NextResponse.json({ authenticated: false });
    }

    const user = await fetchAuthenticatedUser(token);
    return NextResponse.json({
      authenticated: true,
      user,
    });
  } catch (err: any) {
    return NextResponse.json({ authenticated: false, error: err.message }, { status: 200 });
  }
}
