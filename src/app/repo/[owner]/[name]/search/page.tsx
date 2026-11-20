"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Search,
  Sparkles,
  ArrowRight,
  FileCode,
  Tag,
  CheckCircle2,
  Copy,
  ExternalLink,
  ChevronRight,
  Filter,
  Bot,
  AlertCircle,
} from "lucide-react";
import { demoSearchResults } from "@/lib/demo-data";
import { SearchResult, Citation } from "@/types/repository";
import { cn } from "@/lib/utils";

export default function CodeSearchPage() {
  const routeParams = useParams();
  const owner = (routeParams?.owner as string) || "owner";
  const name = (routeParams?.name as string) || "repo";

  const isDemo = owner.toLowerCase() === "vercel" && name.toLowerCase() === "commerce";

  const sampleQueries = [
    `Where are API requests handled in ${name}?`,
    `Explain the entry point execution flow in ${name}`,
    `Where is the database or state storage configured?`,
    `Which files handle authentication or security?`,
    `Find core export utilities in ${name}`,
  ];

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>(isDemo ? demoSearchResults : []);
  const [aiAnswer, setAiAnswer] = useState<string | null>(
    isDemo
      ? "In vercel/commerce, cart operations are implemented in `src/components/cart/actions.ts` via Server Actions that interact with Shopify Storefront GraphQL queries in `src/lib/shopify/index.ts`."
      : null
  );
  const [citations, setCitations] = useState<Citation[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedMatchFilter, setSelectedMatchFilter] = useState<"all" | "hybrid" | "semantic" | "keyword">("all");

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);

    try {
      const res = await fetch(`/api/repo/${owner}/${name}/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery }),
      });

      if (res.ok) {
        const data = await res.json();
        setResults(data.results || demoSearchResults);
        setAiAnswer(data.answer || null);
        setCitations(data.citations || []);
      } else {
        fallbackFilter(searchQuery);
      }
    } catch {
      fallbackFilter(searchQuery);
    } finally {
      setIsSearching(false);
    }
  };

  const fallbackFilter = (searchQuery: string) => {
    const q = searchQuery.toLowerCase();
    const filtered = demoSearchResults.filter(
      (r) =>
        r.snippet.toLowerCase().includes(q) ||
        r.explanation.toLowerCase().includes(q) ||
        r.filePath.toLowerCase().includes(q) ||
        r.fileName.toLowerCase().includes(q)
    );
    setResults(filtered.length > 0 ? filtered : demoSearchResults);
  };

  const copyCode = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredResults = results.filter((r) => {
    if (selectedMatchFilter === "all") return true;
    return r.matchType === selectedMatchFilter;
  });

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-6 py-8">
      {/* Search Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          <Sparkles className="h-3.5 w-3.5" />
          The Core Engine: Grounded Code Retrieval
        </div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          AI Code Search
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Ask natural-language questions about how features, algorithms, or APIs are implemented in{" "}
          <span className="font-mono text-foreground font-medium">{owner}/{name}</span>. Results are grounded with exact file paths and line ranges.
        </p>
      </div>

      {/* Search Bar Input */}
      <div className="space-y-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch(query);
          }}
          className="relative flex items-center"
        >
          <Search className="absolute left-4.5 h-5 w-5 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. Find where cart items are created and validated..."
            className={cn(
              "h-14 w-full rounded-2xl border bg-card pl-12 pr-32 text-base text-foreground shadow-sm",
              "placeholder:text-muted-foreground/60 outline-none transition-all",
              "focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
            )}
          />
          <button
            type="submit"
            disabled={isSearching}
            className="absolute right-2.5 inline-flex h-9 items-center gap-2 rounded-xl bg-primary px-4 text-xs font-semibold text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50"
          >
            {isSearching ? "Searching..." : "Search"}
            {!isSearching && <ArrowRight className="h-3.5 w-3.5" />}
          </button>
        </form>

        {/* Suggested Queries Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-muted-foreground font-medium">Suggestions:</span>
          {sampleQueries.map((sq) => (
            <button
              key={sq}
              onClick={() => {
                setQuery(sq);
                handleSearch(sq);
              }}
              className="rounded-lg border border-border/80 bg-card/60 px-2.5 py-1 text-foreground/80 transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-foreground"
            >
              {sq}
            </button>
          ))}
        </div>
      </div>

      {/* Direct AI Synthesis Answer Box (When Available) */}
      {aiAnswer && (
        <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5 space-y-3 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
            <Bot className="h-4 w-4" />
            Direct Synthesis & Grounded Verdict:
          </div>
          <div className="text-sm text-foreground/95 leading-relaxed whitespace-pre-wrap">
            {aiAnswer}
          </div>

          {citations.length > 0 && (
            <div className="pt-3 border-t border-primary/20 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-muted-foreground font-medium">Citations:</span>
              {citations.map((c, i) => (
                <Link
                  key={i}
                  href={`/repo/${owner}/${name}/explorer?file=${encodeURIComponent(c.filePath)}&start=${c.startLine}&end=${c.endLine}`}
                  className="font-mono text-[11px] text-primary hover:underline bg-background/80 px-2 py-0.5 rounded-md border border-primary/20"
                >
                  {c.filePath} L{c.startLine}-{c.endLine}
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Filter and Results Meta */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{filteredResults.length}</span> results found
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-muted-foreground flex items-center gap-1 mr-1">
            <Filter className="h-3 w-3" /> Match:
          </span>
          {(["all", "hybrid", "semantic", "keyword"] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedMatchFilter(filter)}
              className={cn(
                "rounded-md px-2.5 py-1 font-medium capitalize transition-colors",
                selectedMatchFilter === filter
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Results List */}
      <div className="space-y-6">
        {filteredResults.map((result) => (
          <div
            key={result.id}
            className="overflow-hidden rounded-2xl border border-border bg-card/80 transition-all hover:border-border/80 hover:shadow-xs"
          >
            {/* Header info */}
            <div className="flex flex-col gap-2 border-b border-border/60 bg-muted/30 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2.5">
                <FileCode className="h-4 w-4 text-primary" />
                <Link
                  href={`/repo/${owner}/${name}/explorer?file=${encodeURIComponent(result.filePath)}&start=${result.startLine}&end=${result.endLine}`}
                  className="font-mono text-sm font-semibold text-foreground hover:text-primary transition-colors hover:underline"
                >
                  {result.filePath}
                </Link>
                <span className="rounded-md bg-muted px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
                  L{result.startLine}–L{result.endLine}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 font-medium text-emerald-500">
                  {Math.round(result.score * 100)}% match
                </span>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 font-medium capitalize text-primary">
                  {result.matchType}
                </span>
              </div>
            </div>

            {/* Explanation */}
            <div className="px-5 py-3 text-sm text-foreground/90 leading-relaxed border-b border-border/40 bg-card/50">
              <span className="font-semibold text-xs text-muted-foreground uppercase tracking-wider block mb-1">
                Context & Significance:
              </span>
              {result.explanation}
            </div>

            {/* Code Snippet Box */}
            <div className="relative group bg-[#0d1117] text-[#e6edf3]">
              <div className="absolute top-2.5 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => copyCode(result.id, result.snippet)}
                  className="inline-flex items-center gap-1 rounded-md bg-white/10 px-2.5 py-1 text-xs text-white backdrop-blur-sm hover:bg-white/20 transition-colors"
                >
                  {copiedId === result.id ? (
                    <>
                      <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      Copy snippet
                    </>
                  )}
                </button>
              </div>

              <pre className="overflow-x-auto p-4 text-xs font-mono leading-relaxed">
                <code>{result.snippet}</code>
              </pre>
            </div>

            {/* Related Files footer */}
            {result.relatedFiles && result.relatedFiles.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 px-5 py-2.5 text-xs bg-muted/20 border-t border-border/40">
                <span className="text-muted-foreground font-medium">Related files:</span>
                {result.relatedFiles.map((rf) => (
                  <Link
                    key={rf}
                    href={`/repo/${owner}/${name}/explorer?file=${encodeURIComponent(rf)}`}
                    className="font-mono text-[11px] text-muted-foreground hover:text-primary transition-colors"
                  >
                    {rf}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
