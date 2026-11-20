import test from "node:test";
import assert from "node:assert/strict";

// 1. GitHub URL parsing tests
function parseGitHubRepoUrl(input: string): { owner: string; name: string } | null {
  const trimmed = input.trim().replace(/\/+$/, "");

  const urlMatch = trimmed.match(
    /^https?:\/\/(?:www\.)?github\.com\/([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)/
  );
  if (urlMatch) {
    return { owner: urlMatch[1], name: urlMatch[2] };
  }

  const shortMatch = trimmed.match(/^([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)$/);
  if (shortMatch) {
    return { owner: shortMatch[1], name: shortMatch[2] };
  }

  return null;
}

test("GitHub URL Parser - standard HTTPS URL", () => {
  const res = parseGitHubRepoUrl("https://github.com/facebook/react");
  assert.deepEqual(res, { owner: "facebook", name: "react" });
});

test("GitHub URL Parser - URL with trailing slashes", () => {
  const res = parseGitHubRepoUrl("https://github.com/vercel/next.js///");
  assert.deepEqual(res, { owner: "vercel", name: "next.js" });
});

test("GitHub URL Parser - shorthand owner/repo", () => {
  const res = parseGitHubRepoUrl("microsoft/vscode");
  assert.deepEqual(res, { owner: "microsoft", name: "vscode" });
});

test("GitHub URL Parser - invalid input returns null", () => {
  assert.equal(parseGitHubRepoUrl("invalid-string"), null);
  assert.equal(parseGitHubRepoUrl("https://gitlab.com/owner/repo"), null);
});

// 2. Vector Cosine Similarity tests
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

test("Vector Cosine Similarity - identical vectors return 1.0", () => {
  const v1 = [1, 2, 3];
  const sim = cosineSimilarity(v1, v1);
  assert.ok(Math.abs(sim - 1.0) < 0.0001);
});

test("Vector Cosine Similarity - orthogonal vectors return 0.0", () => {
  const v1 = [1, 0, 0];
  const v2 = [0, 1, 0];
  const sim = cosineSimilarity(v1, v2);
  assert.equal(sim, 0);
});

test("Vector Cosine Similarity - opposing vectors return -1.0", () => {
  const v1 = [1, 1];
  const v2 = [-1, -1];
  const sim = cosineSimilarity(v1, v2);
  assert.ok(Math.abs(sim - (-1.0)) < 0.0001);
});

// 3. Keyword scoring test
function computeKeywordScore(query: string, content: string, path: string): number {
  const queryTerms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (queryTerms.length === 0) return 0;

  const contentLower = content.toLowerCase();
  const pathLower = path.toLowerCase();
  let score = 0;

  for (const term of queryTerms) {
    if (pathLower.includes(term)) score += 0.4;
    if (contentLower.includes(term)) score += 0.4;
  }

  return Math.min(score / queryTerms.length, 1.0);
}

test("Keyword Scoring - matches relevant path and content", () => {
  const score = computeKeywordScore(
    "auth jwt",
    "export function verifyJwt(token: string) { return token; }",
    "src/lib/auth/jwt.ts"
  );
  assert.ok(score > 0.5);
});

test("Keyword Scoring - zero score for unrelated content", () => {
  const score = computeKeywordScore(
    "payment stripe checkout",
    "export function renderHeader() { return null; }",
    "src/components/header.tsx"
  );
  assert.equal(score, 0);
});

// 4. File filtering tests
const IGNORED_DIRS = new Set(["node_modules", ".git", "dist", "build"]);
const IGNORED_EXTS = new Set(["lock", "png", "jpg", "exe", "map"]);

function shouldIgnoreFile(path: string): boolean {
  const parts = path.split("/");
  if (parts.some((p) => IGNORED_DIRS.has(p))) return true;
  const ext = path.split(".").pop()?.toLowerCase();
  if (ext && IGNORED_EXTS.has(ext)) return true;
  return false;
}

test("File Filtering - ignores node_modules and binary assets", () => {
  assert.equal(shouldIgnoreFile("node_modules/react/index.js"), true);
  assert.equal(shouldIgnoreFile(".git/config"), true);
  assert.equal(shouldIgnoreFile("package-lock.json.lock"), true);
  assert.equal(shouldIgnoreFile("public/logo.png"), true);
  assert.equal(shouldIgnoreFile("src/app/page.tsx"), false);
  assert.equal(shouldIgnoreFile("src/lib/shopify/index.ts"), false);
});

// 5. Hierarchical file tree builder test
function testBuildTree(paths: string[]) {
  const root: any[] = [];
  const map = new Map<string, any>();

  for (const p of paths) {
    const parts = p.split("/");
    const isDir = p.endsWith("/");
    const cleanPath = p.replace(/\/$/, "");
    const name = parts[parts.length - (isDir ? 2 : 1)];

    const node: any = {
      path: cleanPath,
      name,
      type: isDir ? "directory" : "file",
      children: isDir ? [] : undefined,
    };
    map.set(cleanPath, node);

    const parentParts = parts.slice(0, isDir ? -2 : -1);
    if (parentParts.length === 0) {
      root.push(node);
    } else {
      const parent = map.get(parentParts.join("/"));
      if (parent && parent.children) {
        parent.children.push(node);
      } else {
        root.push(node);
      }
    }
  }
  return root;
}

test("File Tree Construction - creates nested directories", () => {
  const tree = testBuildTree(["src/", "src/lib/", "src/lib/utils.ts", "package.json"]);
  assert.equal(tree.length, 2); // src directory and package.json
  assert.equal(tree[0].name, "src");
  assert.equal(tree[0].type, "directory");
  assert.equal(tree[0].children.length, 1);
  assert.equal(tree[0].children[0].name, "lib");
  assert.equal(tree[1].name, "package.json");
  assert.equal(tree[1].type, "file");
});

// 6. pgvector vector string formatting tests
function formatVectorLiteral(v: number[]) {
  return `[${v.join(",")}]`;
}
function parseVectorLiteral(str: string) {
  const trimmed = str.trim().replace(/^\[|\]$/g, "");
  if (!trimmed) return [];
  return trimmed.split(",").map(Number);
}

test("pgvector Literal Formatting - formats and parses vector float arrays", () => {
  const original = [0.1234, -0.5678, 0.9999];
  const literal = formatVectorLiteral(original);
  assert.equal(literal, "[0.1234,-0.5678,0.9999]");
  const parsed = parseVectorLiteral(literal);
  assert.deepEqual(parsed, original);
});

// 7. Bidirectional branch fallback tests
function getAlternativeBranch(branch: string): string {
  return branch === "main" ? "master" : "main";
}

test("Branch Fallback Resolver - alternates between main and master", () => {
  assert.equal(getAlternativeBranch("main"), "master");
  assert.equal(getAlternativeBranch("master"), "main");
  assert.equal(getAlternativeBranch("develop"), "main");
});

// 8. Code chunking and exact line preservation
function simpleChunker(code: string) {
  const lines = code.split("\n");
  const chunks: { start: number; end: number; content: string }[] = [];
  let currentStart = 1;

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith("export function") && i > 0) {
      chunks.push({
        start: currentStart,
        end: i,
        content: lines.slice(currentStart - 1, i).join("\n"),
      });
      currentStart = i + 1;
    }
  }
  chunks.push({
    start: currentStart,
    end: lines.length,
    content: lines.slice(currentStart - 1).join("\n"),
  });
  return chunks;
}

test("Code Chunking - preserves exact line numbering and boundaries", () => {
  const sampleCode = `import { foo } from 'bar';

export function first() {
  return 1;
}

export function second() {
  return 2;
}`;
  const chunks = simpleChunker(sampleCode);
  assert.equal(chunks.length, 3);
  assert.equal(chunks[0].start, 1);
  assert.equal(chunks[0].end, 2);
  assert.equal(chunks[1].start, 3);
  assert.equal(chunks[1].end, 6);
  assert.equal(chunks[2].start, 7);
  assert.equal(chunks[2].end, 9);
});
