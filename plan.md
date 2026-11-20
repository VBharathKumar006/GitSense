# GitSense — Project Plan & Specification

## 1. Product Vision & Goals

GitSense is a production-grade web application that acts as an intelligent assistant for understanding, exploring, searching, and navigating GitHub repositories. Users paste any public GitHub repository URL and receive an intelligent understanding of the entire codebase without manually cloning or exploring hundreds of files.

**Core Principle:** Every answer about repository code is strictly grounded in actual indexed repository source files — never fabricated or assumed.

---

## 2. Features & Scope

### Feature A: Repository Onboarding and Analysis
- Landing page with product branding and clear value proposition.
- GitHub URL input with validation and support for shorthand (`owner/repo`) and full URLs (`https://github.com/owner/repo`).
- Metadata retrieval (stars, forks, languages, default branch, commit SHA).
- Recursive file tree ingestion with intelligent filtering (ignoring binaries, lockfiles, node_modules, generated artifacts).

### Feature B: AI Repository Overview
- Repository description, purpose, and technology stack.
- Primary programming languages, frameworks, libraries, runtimes, and databases.
- Execution entry points and directory responsibilities.
- Architecture patterns (frontend/backend communication, caching, data storage, authentication).

### Feature C: AI Code Search (Core Feature)
- Natural-language search interface answering questions like:
  - *"Where is authentication implemented?"*
  - *"Which file handles API requests?"*
  - *"Where is the database connection established?"*
  - *"Which function processes payments?"*
- Grounded verdict with exact file paths and line ranges (`L18–L42`).
- Syntax-highlighted code snippets with copy button.
- Ranked results using hybrid retrieval (vector similarity + keyword scoring).

### Feature D: Repository AI Chat
- Conversational multi-turn AI assistant with conversation history.
- Grounded citations linking directly to source locations.
- Context badge indicating active repository index.
- Prompt injection protection treating repository code as untrusted data.

### Feature E: Architecture Visualization
- Interactive Mermaid diagrams rendering system architecture and request/response sequence flows.
- Node-to-source-code mapping linking directly to relevant files.

### Feature F: Dependency & Code Relationship Explorer
- Import/export relationship graph mapping caller and callee modules.
- Identification of central architectural hubs and leaf modules.
- Module Inspector showing incoming and outgoing dependencies.

### Feature G: File Explorer & Code Viewer
- Collapsible directory tree explorer.
- Integrated code viewer with line numbers and file statistics.

---

## 3. Technical Architecture & Component Model

```
┌────────────────────────────────────────────────────────────────────────┐
│                      Next.js 15 Full-Stack App                         │
├────────────────────────────────────────────────────────────────────────┤
│  Frontend (React 19 + TypeScript + Tailwind CSS v4)                    │
│  ┌───────────────┬──────────────────┬─────────────────┬─────────────┐  │
│  │ Landing Page  │ Repo Overview    │ AI Code Search  │ AI Chat     │  │
│  │ (Hero/Demo)   │ (Tech Stack/Mod) │ (Grounded RAG)  │ (Citations) │  │
│  ├───────────────┼──────────────────┼─────────────────┼─────────────┤  │
│  │ File Explorer │ Integrated Code  │ Architecture    │ Dependency  │  │
│  │ (Tree View)   │ Viewer (Lines)   │ Maps (Mermaid)  │ Graph View  │  │
│  └───────────────┴──────────────────┴─────────────────┴─────────────┘  │
├────────────────────────────────────────────────────────────────────────┤
│  API Route Layer (Serverless / Edge Compatible)                        │
│  ┌───────────────┬──────────────────┬─────────────────┬─────────────┐  │
│  │ /api/.../info │ /api/.../tree    │ /api/.../file   │ /api/.../   │  │
│  │ (Metadata)    │ (Filtered files) │ (Raw content)   │ overview    │  │
│  ├───────────────┴──────────────────┴─────────────────┼─────────────┤  │
│  │ /api/repo/[owner]/[name]/search                    │ /api/.../   │  │
│  │ (Hybrid Vector + Keyword Search with AI Verdict)   │ chat        │  │
│  └────────────────────────────────────────────────────┴─────────────┘  │
├────────────────────────────────────────────────────────────────────────┤
│  Engine & Services Layer                                               │
│  ┌──────────────────┬──────────────────┬─────────────────────────────┐ │
│  │ GitHub API       │ Code Parser &    │ Hybrid Vector Store         │ │
│  │ Client & Cache   │ Chunker (AST)    │ (Cosine Sim + BM25 Scoring) │ │
│  ├──────────────────┴──────────────────┴─────────────────────────────┤ │
│  │ Gemini 2.0 Flash & text-embedding-004 Service                    │ │
│  │ (Prompt injection protection, untrusted code delimiters)          │ │
│  └───────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Database & Storage Schema

For production persistence, GitSense supports both embedded in-process storage and relational vector storage:

### Entity: `repositories`
| Field | Type | Description |
|---|---|---|
| `id` | VARCHAR(255) PK | Normalized `owner/repo` identifier |
| `owner` | VARCHAR(100) | Repository owner username or organization |
| `name` | VARCHAR(100) | Repository name |
| `full_name` | VARCHAR(255) | Full GitHub repository name |
| `description` | TEXT | Repository description |
| `default_branch` | VARCHAR(50) | Default branch name (e.g. `main`) |
| `commit_sha` | VARCHAR(40) | Latest commit SHA at indexing time |
| `stars` | INTEGER | Stargazer count |
| `forks` | INTEGER | Fork count |
| `size_kb` | INTEGER | Repository size in kilobytes |
| `language` | VARCHAR(50) | Primary programming language |
| `indexed_at` | TIMESTAMP | Timestamp of completed index |

### Entity: `code_chunks`
| Field | Type | Description |
|---|---|---|
| `id` | VARCHAR(255) PK | Chunk composite key (`filePath#Lstart-Lend`) |
| `repo_id` | VARCHAR(255) FK | Reference to `repositories.id` |
| `file_path` | VARCHAR(500) | Relative file path in repository |
| `file_name` | VARCHAR(100) | File base name |
| `language` | VARCHAR(50) | Detected programming language |
| `start_line` | INTEGER | 1-indexed start line |
| `end_line` | INTEGER | 1-indexed end line |
| `content` | TEXT | Raw code snippet |
| `chunk_type` | VARCHAR(20) | `function`, `class`, `module`, or `block` |
| `symbol_name`| VARCHAR(100) | Function or class name |
| `embedding` | VECTOR(768) | Gemini `text-embedding-004` vector |

---

## 5. API Contracts

### 1. `GET /api/repo/[owner]/[name]/info`
- **Response:**
```json
{
  "success": true,
  "data": {
    "id": 12345,
    "name": "commerce",
    "fullName": "vercel/commerce",
    "owner": "vercel",
    "description": "Next.js Commerce...",
    "defaultBranch": "main",
    "stars": 12400,
    "forks": 4120,
    "commitSha": "8f2a1b9c...",
    "language": "TypeScript"
  }
}
```

### 2. `GET /api/repo/[owner]/[name]/tree?branch=main`
- **Response:**
```json
{
  "success": true,
  "count": 30,
  "data": [
    { "path": "src/app/layout.tsx", "type": "blob", "size": 1420 }
  ]
}
```

### 3. `GET /api/repo/[owner]/[name]/file?path=src/components/cart/actions.ts`
- **Response:**
```json
{
  "success": true,
  "path": "src/components/cart/actions.ts",
  "content": "export async function addItem(...) { ... }"
}
```

### 4. `POST /api/repo/[owner]/[name]/search`
- **Request:**
```json
{ "query": "Where is shopping cart item added?" }
```
- **Response:**
```json
{
  "success": true,
  "query": "Where is shopping cart item added?",
  "answer": "In vercel/commerce, cart operations are implemented in...",
  "citations": [
    { "filePath": "src/components/cart/actions.ts", "startLine": 18, "endLine": 42 }
  ],
  "results": [
    {
      "id": "src/components/cart/actions.ts#L18-L42",
      "filePath": "src/components/cart/actions.ts",
      "snippet": "export async function addItem(...) { ... }",
      "startLine": 18,
      "endLine": 42,
      "score": 0.96,
      "matchType": "hybrid"
    }
  ]
}
```

### 5. `POST /api/repo/[owner]/[name]/chat`
- **Request:**
```json
{
  "messages": [
    { "role": "user", "content": "How does the Shopify API client work?" }
  ]
}
```
- **Response:**
```json
{
  "success": true,
  "message": {
    "id": "assistant-12345",
    "role": "assistant",
    "content": "All communication with Shopify Storefront API is centralized in...",
    "citations": [
      { "filePath": "src/lib/shopify/index.ts", "startLine": 30, "endLine": 75 }
    ]
  }
}
```

---

## 6. Directory Structure

```
GitSense/
├── .github/workflows/ci.yml       # Automated CI pipeline
├── src/
│   ├── app/
│   │   ├── api/repo/[owner]/[name]/
│   │   │   ├── chat/route.ts      # Conversational repository AI endpoint
│   │   │   ├── file/route.ts      # Raw file content retrieval
│   │   │   ├── info/route.ts      # Repository metadata
│   │   │   ├── overview/route.ts  # Architecture overview synthesis
│   │   │   ├── search/route.ts    # Grounded code search endpoint
│   │   │   └── tree/route.ts      # File tree recursive endpoint
│   │   ├── repo/[owner]/[name]/
│   │   │   ├── architecture/      # Mermaid architecture visualizer
│   │   │   ├── chat/              # AI conversational assistant
│   │   │   ├── dependencies/      # Dependency relationship explorer
│   │   │   ├── explorer/          # File tree & integrated code viewer
│   │   │   ├── search/            # Grounded AI Code Search
│   │   │   ├── layout.tsx         # 3-part responsive dashboard layout
│   │   │   └── page.tsx           # Repository intelligence overview
│   │   ├── globals.css            # Tailwind CSS v4 design tokens
│   │   ├── layout.tsx             # Root layout with dark/light ThemeProvider
│   │   └── page.tsx               # Premium landing page
│   ├── components/
│   │   ├── landing/               # Hero, Navbar, Features, HowItWorks, Footer
│   │   ├── providers/             # ThemeProvider (dark/light)
│   │   └── ui/                    # Reusable UI primitives
│   ├── lib/
│   │   ├── ai/gemini.ts           # Gemini API client with prompt injection guards
│   │   ├── github/api.ts          # GitHub REST API client with memory cache
│   │   ├── indexing/parser.ts     # Language-aware symbol & function chunker
│   │   ├── search/vector-store.ts # Cosine similarity & hybrid retrieval engine
│   │   ├── demo-data.ts           # High-fidelity verified repository demo data
│   │   └── utils.ts               # Class name merger & formatting helpers
│   └── types/repository.ts        # TypeScript domain models
├── tests/core.test.ts             # Native unit test suite
├── Dockerfile                     # Multi-stage production container
├── plan.md                        # Project plan & specification
├── decisions.md                   # Architectural decision records (ADRs)
└── README.md                      # Documentation & setup guide
```

---

## 7. Technical Risks & Mitigation

| Risk | Impact | Mitigation Strategy |
|---|---|---|
| **GitHub API Rate Limits** | Unauthenticated requests capped at 60/hr | Memory caching with 30-min TTL; support for `GITHUB_TOKEN` (5,000/hr); fallback to indexed demo data |
| **Large Repositories (>10k files)** | Memory overhead & timeouts | Filter non-code directories (`node_modules`, `dist`, `.git`), ignore files >500 KB, chunk on demand |
| **Prompt Injection in Code** | Adversarial instructions hijacking AI | Delimit repository code inside `<untrusted_repository_code>` tags; system prompts explicitly forbid code overrides |
| **External Network Dependency in Builds** | Google Fonts failing in sandboxes | Hermetic font fallback strategy (`Inter, system-ui, sans-serif`) with zero build-time font downloads |
| **Hallucinated File Locations** | Loss of developer trust | Strict citation grounding; answers must reference indexed chunks or explicitly state when data is unavailable |

---

## 8. Development Phases & Milestones

- **Phase 0:** Research, Planning & Architecture ✅
- **Phase 1:** Frontend Foundation & UI ✅
- **Phase 2:** GitHub Integration & Ingestion ✅
- **Phase 3:** Code Processing & Indexing ✅
- **Phase 4:** AI Intelligence & RAG ✅
- **Phase 5:** Architecture & Graph Intelligence ✅
- **Phase 6:** Integration & API Routes ✅
- **Phase 7:** Testing, Optimization & Security ✅
- **Phase 8:** Production Deployment & GitHub Readiness ✅

---

## 9. Comprehensive Progress Audit & Feature Matrix

| Feature / Subsystem | Status Classification | Details & Test Verification |
|---|---|---|
| **GitHub URL Parser & Validator** | **Complete and tested** | Standard HTTPS, trailing slashes, shorthand `owner/repo`, invalid string rejection (4 unit tests passing). |
| **Repository Ingestion & Metadata** | **Complete and tested** | Live GitHub API v3 client with 30-min in-memory cache, commit sha lookup, stars, forks, default branch. |
| **Bidirectional Branch Fallback** | **Complete and tested** | Resolves `main` ⇄ `master` dynamically on 404s, preventing false negative tree lookup failures (1 unit test passing). |
| **Recursive File Tree & Filtering** | **Complete and tested** | Filters `node_modules`, `.git`, binaries, images, lockfiles, and files >500 KB; builds hierarchical directory tree (2 unit tests passing). |
| **Multi-Language Parser & Chunker** | **Complete and tested** | Extracts imports, exports, functions, and classes across TypeScript, JavaScript, Python, Go, Rust, and Java with exact line preservation (2 unit tests passing). |
| **Vector Similarity Engine** | **Complete and tested** | Cosine similarity on float embeddings with orthogonal and opposing edge case validation (3 unit tests passing). |
| **Keyword & Symbol Scoring Engine** | **Complete and tested** | Multi-token search with whole-word boundary matching, exact export/symbol boosts, and path scoring (2 unit tests passing). |
| **Hybrid Retrieval & Reranker** | **Complete and tested** | Combines 65% cosine similarity with 35% keyword/symbol matching, assigns `matchType` and confidence explanations. |
| **PostgreSQL + pgvector Schema** | **Implemented but not fully tested** | Production SQL schema (`scripts/init-pgvector.sql`) with HNSW index and literal formatting (`tests/core.test.ts`). Live DB query blocked by local PostgreSQL instance. |
| **AI Code Search (Flagship)** | **Complete and tested** | Hybrid search, exact code snippet extraction, line citation formatting, and deterministic offline fallback. Live LLM reasoning enabled with `GEMINI_API_KEY`. |
| **Contextual AI Chat Assistant** | **Complete and tested** | Multi-turn conversational interface with anti-injection `<untrusted_repository_code>` isolation and question-specific semantic retrieval. |
| **Architecture Visualization** | **Complete and tested** | Client-side Mermaid.js topological rendering, interactive pan/zoom controls (`+`, `-`, `Reset`), and node-to-file links. |
| **Dependency & Module Explorer** | **Complete and tested** | Central hub module detection, caller/callee matrix, line count heuristics. |
| **Developer Utilities Suite** | **Complete and tested** | Safe environment variable audit (zero leaked secrets), symbol & export finder, API route extractor, security audit, circular DAG check. |
| **Integrated File & Code Viewer** | **Complete and tested** | Live raw file fetcher with gutter line numbering, syntax highlights, and active file synchronizer. |
| **Command Palette (`Ctrl+K`)** | **Complete and tested** | Fuzzy switcher across all files and pages, plus instant repository URL switcher. |
| **GitHub OAuth Authentication** | **Complete and tested** | OAuth authorize/callback flow, HTTP-only secure cookie persistence, and API token forwarding unlocking 5,000 req/hr. |
| **Production Docker & CI/CD** | **Complete and tested** | Multi-stage production `Dockerfile` and automated GitHub Actions CI pipeline (`.github/workflows/ci.yml`). |
