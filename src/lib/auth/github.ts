import { cookies } from "next/headers";

export interface GitHubUser {
  id: number;
  login: string;
  name: string;
  avatar_url: string;
  email?: string;
  public_repos: number;
  total_private_repos?: number;
}

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || "";
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || "";
const AUTH_COOKIE_NAME = "gitsense_gh_token";

/**
 * Returns the GitHub OAuth authorization URL
 */
export function getGitHubAuthUrl(redirectUri: string, state?: string): string {
  const params = new URLSearchParams({
    client_id: GITHUB_CLIENT_ID,
    redirect_uri: redirectUri,
    scope: "repo,read:user",
    state: state || "gitsense_auth",
  });
  return `https://github.com/login/oauth/authorize?${params.toString()}`;
}

/**
 * Exchanges authorization code for an OAuth access token
 */
export async function exchangeCodeForToken(code: string, redirectUri: string): Promise<string> {
  const res = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: GITHUB_CLIENT_ID,
      client_secret: GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: redirectUri,
    }),
  });

  if (!res.ok) {
    throw new Error(`Failed to exchange code: ${res.statusText}`);
  }

  const data = await res.json();
  if (data.error) {
    throw new Error(data.error_description || data.error);
  }

  return data.access_token;
}

/**
 * Fetches authenticated user profile from GitHub
 */
export async function fetchAuthenticatedUser(token: string): Promise<GitHubUser> {
  const res = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "GitSense-Platform",
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch user profile: ${res.statusText}`);
  }

  return res.json();
}

/**
 * Retrieves the GitHub token from Next.js server cookies
 */
export async function getServerGitHubToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get(AUTH_COOKIE_NAME);
  return tokenCookie?.value || process.env.GITHUB_TOKEN || null;
}
