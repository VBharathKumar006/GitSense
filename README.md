# GitSense — AI-Powered GitHub Repository Intelligence Platform

GitSense is a production-grade web application that acts as an intelligent assistant for understanding, exploring, searching, and navigating GitHub repositories. Users paste any GitHub repository URL to receive an interactive, grounded architectural overview, hybrid semantic code search with exact line numbers, conversational repository AI chat with citations, Mermaid architecture visualization, and a dependency graph explorer.

> **Core Principle:** Every answer about repository code is strictly grounded in actual indexed repository source files — never fabricated or assumed.

---

## 🌟 Key Features

### 1. 🔍 AI Code Search (Core Feature)
- Natural-language queries (e.g., *"Where are shopping cart operations implemented?"*, *"Which file handles Shopify GraphQL API queries?"*, *"Find product page dynamic routing logic"*).
- **Grounded Verdict:** Direct explanation synthesized from retrieved code snippets.
- **Precise Citations:** Exact file paths and line ranges (`L18–L42`).
- **Hybrid Retrieval:** Blends vector similarity embeddings (Gemini `text-embedding-004`) with BM25 keyword and symbol scoring.
- **Interactive Snippet Box:** Syntax-highlighted code block with 1-click clipboard copy.

### 2. 💬 Repository AI Chat
- Multi-turn conversational assistant with conversation history.
- Context badge indicating verified repository index grounding.
- Answers cite specific files and functions with links straight to the code viewer.
- Security-hardened prompt delimiters preventing repository code injection.

### 3. 📊 AI Repository Overview
- High-level executive summary and purpose statement.
- Tech stack and runtime detection (languages, frameworks, libraries, databases).
- Architectural patterns breakdown (frontend/backend communication, caching, data storage, authentication).
- Key modules breakdown with file counts, responsibilities, and main file links.
- Verified execution entry points.

### 4. 🏗️ Architecture Visualization
- Dynamic, interactive Mermaid diagrams for:
  - **System & Module Architecture:** Component relationships between Next.js, RSC, Server Actions, and external APIs.
  - **Cart & Execution Flow:** Sequence diagrams illustrating user actions down to database/API mutations.
- Interactive node mapping linking directly to associated source files.

### 5. 🔗 Dependency & Module Explorer
- Import/export relationship graph mapping incoming and outgoing dependencies.
- Identifies architectural anchors (high-centrality hub modules).
- Interactive Module Inspector showing caller/callee file trees.

### 6. 📁 File Explorer & Integrated Code Viewer
- Collapsible repository file tree explorer.
- Integrated code viewer with line numbers and file statistics.
- Direct navigation from search results, chat citations, and architecture nodes.

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Framework** | Next.js 15 (App Router) | Full-stack architecture, React Server Components, API routes |
| **Language** | TypeScript (strict mode) | End-to-end type safety between backend and frontend |
| **Styling** | Tailwind CSS v4 | Dark-first developer UI design system with CSS custom properties |
| **UI System** | Radix UI primitives & Lucide React | Accessible buttons, cards, badges, inputs, tabs, icons |
| **Diagrams** | Mermaid.js | Text-to-diagram client-side rendering for architectural maps |
| **LLM & Embeddings** | Google Gemini 2.0 Flash & `text-embedding-004` | Fast, low-latency grounded reasoning and vector embeddings |
| **Vector Store** | In-Memory Cosine Similarity Store | High-performance embedded vector indexing with hybrid fallback |
| **GitHub Access** | GitHub REST v3 API | Repository metadata, recursive git trees, and raw file access |
| **CI/CD & Deploy** | GitHub Actions & Docker / Vercel | Automated typecheck, unit testing, and containerized deployment |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20 or 22+
- npm (or pnpm)
- *(Optional)* Google Gemini API Key (`GEMINI_API_KEY`)
- *(Optional)* GitHub Personal Access Token (`GITHUB_TOKEN` — increases API rate limits)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/gitsense.git
cd gitsense

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
```

### Environment Configuration (`.env.local`)

```env
# Optional: Google Gemini API key for dynamic AI generation
GEMINI_API_KEY=your_gemini_api_key_here

# Optional: GitHub token to increase rate limit from 60 to 5,000 req/hr
GITHUB_TOKEN=your_github_personal_access_token

# Optional: Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> **Note:** If `GEMINI_API_KEY` is not provided, GitSense automatically falls back to deterministic AST and hybrid keyword retrieval with pre-computed intelligence, allowing full functionality offline!

### Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to open GitSense.

---

## 🧪 Testing & Verification

GitSense includes native automated unit tests covering GitHub URL parsing, vector cosine similarity math, keyword frequency scoring, and file filtering logic:

```bash
# Run unit tests
npm test

# Run TypeScript type check
npm run typecheck

# Build for production
npm run build
```

---

## 🐳 Docker Deployment

A production-ready multi-stage Dockerfile is included:

```bash
# Build Docker image
docker build -t gitsense:latest .

# Run container
docker run -p 3000:3000 --env-file .env.local gitsense:latest
```

---

## 🏛️ Project Directory Structure

```
GitSense/
├── .github/
│   └── workflows/
│       └── ci.yml               # GitHub Actions CI workflow
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── repo/[owner]/[name]/
│   │   │       ├── chat/route.ts      # Conversational repository AI endpoint
│   │   │       ├── file/route.ts      # Raw file content retrieval
│   │   │       ├── info/route.ts      # Repository metadata
│   │   │       ├── overview/route.ts  # Architecture overview synthesis
│   │   │       ├── search/route.ts    # Grounded code search endpoint
│   │   │       └── tree/route.ts      # File tree recursive endpoint
│   │   ├── repo/[owner]/[name]/
│   │   │   ├── architecture/page.tsx  # Mermaid architecture visualizer
│   │   │   ├── chat/page.tsx          # AI conversational assistant
│   │   │   ├── dependencies/page.tsx  # Dependency relationship explorer
│   │   │   ├── explorer/page.tsx      # File tree & integrated code viewer
│   │   │   ├── search/page.tsx        # Grounded AI Code Search
│   │   │   ├── layout.tsx             # 3-part responsive dashboard layout
│   │   │   └── page.tsx               # Repository intelligence overview
│   │   ├── globals.css                # Tailwind CSS v4 design tokens
│   │   ├── layout.tsx                 # Root layout with dark/light ThemeProvider
│   │   └── page.tsx                   # Premium landing page
│   ├── components/
│   │   ├── landing/                   # Hero, Navbar, Features, HowItWorks, Footer
│   │   ├── providers/                 # ThemeProvider (dark/light)
│   │   └── ui/                        # Reusable UI primitives (Button, Card, Input, etc.)
│   ├── lib/
│   │   ├── ai/
│   │   │   └── gemini.ts              # Gemini API client with prompt injection guards
│   │   ├── github/
│   │   │   └── api.ts                 # GitHub REST API client with memory cache
│   │   ├── indexing/
│   │   │   └── parser.ts              # Language-aware symbol & function chunker
│   │   ├── search/
│   │   │   └── vector-store.ts        # Cosine similarity & hybrid retrieval engine
│   │   ├── demo-data.ts               # High-fidelity verified repository demo data
│   │   └── utils.ts                   # Class name merger & formatting helpers
│   └── types/
│       └── repository.ts              # Core TypeScript domain models
├── tests/
│   └── core.test.ts                   # Native unit tests (Node.js test runner)
├── Dockerfile                         # Multi-stage production container
├── plan.md                            # Complete phased project plan
├── decisions.md                       # Architectural decision records (ADRs)
└── package.json                       # Scripts and dependencies
```

---

## 🔒 Security Architecture

1. **No Code Execution:** GitSense only analyzes AST and text syntax; repository code is never executed.
2. **Prompt Injection Safeguards:** Repository source files are treated as untrusted data and wrapped in `<untrusted_repository_code>` delimiters with strict system instructions prohibiting prompt overrides.
3. **API Key Isolation:** Gemini API keys and GitHub personal access tokens remain server-side in API routes and are never exposed to client browsers.
4. **Input Sanitization:** Strict regex-based URL validation and path traversal checks on file requests.

---

## 📄 License

MIT License. Designed and engineered for developer productivity.
