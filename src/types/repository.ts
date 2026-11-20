export interface Repository {
  id: string;
  owner: string;
  name: string;
  fullName: string;
  description: string;
  url: string;
  defaultBranch: string;
  language: string;
  languages: Record<string, number>;
  stars: number;
  forks: number;
  openIssues: number;
  size: number;
  lastUpdated: string;
  indexedAt?: string;
  commitSha?: string;
  isPrivate?: boolean;
}

export interface FileNode {
  path: string;
  name: string;
  type: "file" | "directory";
  size?: number;
  language?: string;
  children?: FileNode[];
}

export interface CodeChunk {
  id: string;
  filePath: string;
  fileName: string;
  language: string;
  startLine: number;
  endLine: number;
  content: string;
  type: "function" | "class" | "module" | "block";
  name?: string;
  imports?: string[];
  exports?: string[];
  embedding?: number[];
}

export interface SearchResult {
  id: string;
  filePath: string;
  fileName: string;
  language: string;
  snippet: string;
  startLine: number;
  endLine: number;
  score: number;
  explanation: string;
  matchType: "semantic" | "keyword" | "hybrid";
  relatedFiles?: string[];
}

export interface Citation {
  filePath: string;
  startLine: number;
  endLine: number;
  snippet: string;
  functionName?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
  timestamp: string;
  isStreaming?: boolean;
}

export interface TechStackItem {
  name: string;
  category: "language" | "framework" | "library" | "tool" | "database" | "runtime" | "devops";
  version?: string;
  description?: string;
}

export interface ModuleInfo {
  path: string;
  name: string;
  description: string;
  fileCount: number;
  mainFiles: string[];
  responsibility: string;
  dependencies?: string[];
}

export interface RepositoryOverview {
  summary: string;
  purpose: string;
  techStack: TechStackItem[];
  entryPoints: { path: string; description: string }[];
  keyModules: ModuleInfo[];
  architectureOverview: string;
  frontendBackendPattern?: string;
  dataStoragePattern?: string;
  authPattern?: string;
  testingInfrastructure?: string;
}

export interface ArchitectureDiagram {
  type: "system" | "auth" | "api" | "data";
  title: string;
  description: string;
  mermaidCode: string;
  nodes: { id: string; label: string; filePaths: string[] }[];
}

export interface DependencyNode {
  id: string;
  path: string;
  name: string;
  type: "file" | "package";
  incoming: string[];
  outgoing: string[];
  language?: string;
  linesOfCode?: number;
}

export interface DependencyGraph {
  nodes: DependencyNode[];
  edges: { source: string; target: string; type: "import" | "call" }[];
  circularDependencies?: string[][];
  centralModules?: string[];
}
