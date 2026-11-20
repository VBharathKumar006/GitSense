import { NextResponse } from "next/server";
import { testGeminiConnection } from "@/lib/ai/gemini";
import { getServerGitHubToken } from "@/lib/auth/github";

export async function GET() {
  const geminiApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || null;
  const githubToken = (await getServerGitHubToken()) || process.env.GITHUB_TOKEN || null;

  const geminiTest = await testGeminiConnection();

  return NextResponse.json({
    status: geminiTest.success ? "healthy" : "degraded",
    gemini: {
      configured: Boolean(geminiApiKey),
      keyPrefix: geminiApiKey ? `${geminiApiKey.slice(0, 6)}...` : null,
      working: geminiTest.success,
      activeModel: geminiTest.model || null,
      error: geminiTest.error || null,
    },
    github: {
      configured: Boolean(githubToken),
      tokenPrefix: githubToken ? `${githubToken.slice(0, 7)}...` : null,
    },
    timestamp: new Date().toISOString(),
  });
}
