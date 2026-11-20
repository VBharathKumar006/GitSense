export interface GitHubRepoMetadata {
  id: number;
  name: string;
  fullName: string;
  owner: string;
  description: string;
  defaultBranch: string;
  stars: number;
  forks: number;
  openIssues: number;
  size: number;
  language: string;
  url: string;
  updatedAt: string;
  commitSha?: string;
}

export interface GitHubFileItem {
  path: string;
  mode: string;
  type: "blob" | "tree";
  sha: string;
  size?: number;
  url: string;
}

const IGNORED_DIRECTORIES = new Set([
  "node_modules",
  ".git",
  ".github",
  ".next",
  "dist",
  "build",
  "out",
  "coverage",
  ".turbo",
  ".cache",
  "vendor",
  "__pycache__",
  ".venv",
  "venv",
  "target", // Rust / Java target
  ".idea",
  ".vscode",
  "Pods",
]);

const IGNORED_EXTENSIONS = new Set([
  // Binaries & archives
  "exe", "dll", "so", "dylib", "bin", "zip", "tar", "gz", "7z", "rar",
  // Images & audio/video
  "png", "jpg", "jpeg", "gif", "svg", "ico", "webp", "mp4", "mp3", "wav",
  // Fonts
  "woff", "woff2", "ttf", "eot", "otf",
  // Lock files & maps
  "lock", "map",
  // Documents
  "pdf", "docx", "xlsx",
]);

const IGNORED_FILENAMES = new Set([
  "package-lock.json",
  "yarn.lock",
  "pnpm-lock.yaml",
  "composer.lock",
  "Cargo.lock",
  "Gemfile.lock",
  "poetry.lock",
]);

// Memory cache for repository metadata and trees to prevent rate-limit exhaustion
const metadataCache = new Map<string, { data: GitHubRepoMetadata; expires: number }>();
const treeCache = new Map<string, { data: GitHubFileItem[]; expires: number }>();
const fileContentCache = new Map<string, { data: string; expires: number }>();

const CACHE_TTL_MS = 1000 * 60 * 30; // 30 minutes

function getAuthHeaders(customToken?: string): HeadersInit {
  const token = customToken || process.env.GITHUB_TOKEN;
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "GitSense-Platform",
  };
  if (token) {
    headers.Authorization = `token ${token}`;
  }
  return headers;
}

export function parseGitHubRepoUrl(input: string): { owner: string; name: string } | null {
  const trimmed = input.trim().replace(/\/+$/, "");

  // Match full URLs: https://github.com/owner/repo or http://
  const urlMatch = trimmed.match(
    /^https?:\/\/(?:www\.)?github\.com\/([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)/
  );
  if (urlMatch) {
    return { owner: urlMatch[1], name: urlMatch[2] };
  }

  // Match shorthand: owner/repo
  const shortMatch = trimmed.match(/^([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)$/);
  if (shortMatch) {
    return { owner: shortMatch[1], name: shortMatch[2] };
  }

  return null;
}

export async function fetchRepoMetadata(
  owner: string,
  repo: string,
  authToken?: string
): Promise<GitHubRepoMetadata> {
  const cacheKey = `${owner}/${repo}`.toLowerCase();
  const cached = metadataCache.get(cacheKey);
  if (cached && cached.expires > Date.now()) {
    return cached.data;
  }

  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
    headers: getAuthHeaders(authToken),
    next: { revalidate: 1800 },
  });

  if (!res.ok) {
    if (res.status === 404) {
      throw new Error(`Repository "${owner}/${repo}" was not found or is private.`);
    }
    if (res.status === 403) {
      throw new Error("GitHub API rate limit exceeded. Set GITHUB_TOKEN in .env.local to increase limits.");
    }
    throw new Error(`GitHub API error (${res.status}): ${res.statusText}`);
  }

  const raw = await res.json();

  // Also fetch latest commit SHA of default branch
  let commitSha = "";
  try {
    const commitRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/commits/${raw.default_branch}`,
      { headers: getAuthHeaders() }
    );
    if (commitRes.ok) {
      const commitData = await commitRes.json();
      commitSha = commitData.sha;
    }
  } catch {
    // Non-fatal if commit SHA lookup fails
  }

  const metadata: GitHubRepoMetadata = {
    id: raw.id,
    name: raw.name,
    fullName: raw.full_name,
    owner: raw.owner.login,
    description: raw.description || "No description provided.",
    defaultBranch: raw.default_branch,
    stars: raw.stargazers_count,
    forks: raw.forks_count,
    openIssues: raw.open_issues_count,
    size: raw.size,
    language: raw.language || "Unknown",
    url: raw.html_url,
    updatedAt: raw.updated_at,
    commitSha: commitSha || undefined,
  };

  metadataCache.set(cacheKey, { data: metadata, expires: Date.now() + CACHE_TTL_MS });
  return metadata;
}

export async function fetchRepoFileTree(
  owner: string,
  repo: string,
  defaultBranch = "main",
  authToken?: string
): Promise<GitHubFileItem[]> {
  const cacheKey = `${owner}/${repo}/${defaultBranch}`.toLowerCase();
  const cached = treeCache.get(cacheKey);
  if (cached && cached.expires > Date.now()) {
    return cached.data;
  }

  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`,
    {
      headers: getAuthHeaders(authToken),
      next: { revalidate: 1800 },
    }
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch file tree for ${owner}/${repo}: ${res.statusText}`);
  }

  const data = await res.json();
  const rawItems: GitHubFileItem[] = data.tree || [];

  // Filter out unwanted files and directories
  const filtered = rawItems.filter((item) => {
    const parts = item.path.split("/");
    // Check if inside ignored directories
    if (parts.some((p) => IGNORED_DIRECTORIES.has(p))) return false;

    if (item.type === "blob") {
      const fileName = parts[parts.length - 1];
      if (IGNORED_FILENAMES.has(fileName)) return false;

      const ext = fileName.split(".").pop()?.toLowerCase();
      if (ext && IGNORED_EXTENSIONS.has(ext)) return false;

      // Ignore huge files (> 500 KB) for indexing performance
      if (item.size && item.size > 500 * 1024) return false;
    }

    return true;
  });

  treeCache.set(cacheKey, { data: filtered, expires: Date.now() + CACHE_TTL_MS });
  return filtered;
}

export async function fetchFileContent(
  owner: string,
  repo: string,
  filePath: string,
  branch = "main",
  authToken?: string
): Promise<string> {
  const cacheKey = `${owner}/${repo}/${branch}/${filePath}`.toLowerCase();
  const cached = fileContentCache.get(cacheKey);
  if (cached && cached.expires > Date.now()) {
    return cached.data;
  }

  // Fetch raw file content directly from raw.githubusercontent.com for maximum speed
  const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filePath}`;
  const token = authToken || process.env.GITHUB_TOKEN;
  const res = await fetch(rawUrl, {
    headers: token ? { Authorization: `token ${token}` } : {},
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch file content for ${filePath} (${res.status})`);
  }

  const content = await res.text();
  fileContentCache.set(cacheKey, { data: content, expires: Date.now() + CACHE_TTL_MS });
  return content;
}
