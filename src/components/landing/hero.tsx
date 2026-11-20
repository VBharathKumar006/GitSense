"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Loader2,
  FileCode2,
  Network,
  Cpu,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

const EXAMPLES = [
  { owner: "facebook", name: "react" },
  { owner: "vercel", name: "next.js" },
  { owner: "microsoft", name: "vscode" },
  { owner: "vercel", name: "commerce" },
];

const ONBOARDING_STEPS = [
  { label: "Validating GitHub repository accessibility...", icon: ShieldCheck },
  { label: "Fetching default branch & commit tree...", icon: FileCode2 },
  { label: "Extracting AST symbols, functions & imports...", icon: Cpu },
  { label: "Synthesizing module graph & vector embeddings...", icon: Network },
  { label: "Analysis complete — launching GitSense dashboard...", icon: CheckCircle2 },
];

function parseGitHubUrl(input: string): { owner: string; name: string } | null {
  const trimmed = input.trim().replace(/\/+$/, "");

  // Try full URL: https://github.com/owner/repo
  const urlMatch = trimmed.match(
    /^https?:\/\/(?:www\.)?github\.com\/([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)/
  );
  if (urlMatch) return { owner: urlMatch[1], name: urlMatch[2] };

  // Try shorthand: owner/repo
  const shortMatch = trimmed.match(/^([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)$/);
  if (shortMatch) return { owner: shortMatch[1], name: shortMatch[2] };

  return null;
}

export function Hero() {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [targetRepo, setTargetRepo] = useState<{ owner: string; name: string } | null>(null);
  const [recentRepos, setRecentRepos] = useState<{ owner: string; name: string }[]>([]);
  const router = useRouter();

  useEffect(() => {
    try {
      const stored = localStorage.getItem("gitsense-recent-repos");
      if (stored) {
        setRecentRepos(JSON.parse(stored));
      }
    } catch {
      // Ignore storage access error
    }
  }, []);

  const saveRecentRepo = (owner: string, name: string) => {
    try {
      const updated = [
        { owner, name },
        ...recentRepos.filter((r) => !(r.owner.toLowerCase() === owner.toLowerCase() && r.name.toLowerCase() === name.toLowerCase())),
      ].slice(0, 4);
      setRecentRepos(updated);
      localStorage.setItem("gitsense-recent-repos", JSON.stringify(updated));
    } catch {
      // Ignore
    }
  };

  const startAnalysis = (owner: string, name: string) => {
    setTargetRepo({ owner, name });
    saveRecentRepo(owner, name);
    setIsAnalyzing(true);
    setAnalysisStep(0);

    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step < ONBOARDING_STEPS.length) {
        setAnalysisStep(step);
      } else {
        clearInterval(interval);
        const destination = `/repo/${encodeURIComponent(owner)}/${encodeURIComponent(name)}`;
        router.push(destination);
        // Fallback direct navigation to guarantee transition
        setTimeout(() => {
          window.location.assign(destination);
        }, 300);
      }
    }, 400);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseGitHubUrl(url);
    if (!parsed) {
      setError("Please enter a valid GitHub repository URL (e.g. vercel/next.js)");
      return;
    }
    setError("");
    startAnalysis(parsed.owner, parsed.name);
  };

  const handleExample = (owner: string, name: string) => {
    setUrl(`https://github.com/${owner}/${name}`);
    setError("");
    startAnalysis(owner, name);
  };

  return (
    <section
      id="hero"
      className="relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-6 py-20"
    >
      {/* Subtle radial glow */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        aria-hidden="true"
      >
        <div className="absolute left-1/2 top-1/4 h-[500px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[140px]" />
      </div>

      {/* Badge */}
      <div
        className={cn(
          "mb-8 inline-flex items-center gap-2 rounded-full",
          "border border-border/80 bg-card/60 px-4 py-1.5",
          "text-xs font-semibold text-muted-foreground backdrop-blur-sm shadow-2xs"
        )}
      >
        <Sparkles className="h-3.5 w-3.5 text-primary" />
        AI-Powered GitHub Repository Intelligence
      </div>

      {/* Heading */}
      <h1 className="max-w-4xl text-center text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
        Understand Any{" "}
        <span className="bg-gradient-to-r from-primary via-primary/90 to-primary/60 bg-clip-text text-transparent">
          Codebase
        </span>{" "}
        in Minutes
      </h1>

      {/* Subtitle */}
      <p className="mt-6 max-w-2xl text-center text-base leading-relaxed text-muted-foreground sm:text-lg">
        GitSense indexes any public GitHub repository and provides grounded AI code search,
        architecture visualization, and conversational understanding with exact file and line citations.
      </p>

      {/* Search Input Box */}
      {!isAnalyzing ? (
        <form
          onSubmit={handleSubmit}
          className="mt-10 flex w-full max-w-2xl flex-col gap-3 sm:flex-row"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (error) setError("");
              }}
              placeholder="https://github.com/owner/repo or owner/repo"
              className={cn(
                "h-13 w-full rounded-2xl border bg-card px-5 text-sm text-foreground shadow-xs",
                "placeholder:text-muted-foreground/60 outline-none transition-all",
                "focus:border-primary/50 focus:ring-2 focus:ring-primary/20",
                error ? "border-destructive/50" : "border-border"
              )}
            />
          </div>
          <button
            type="submit"
            className={cn(
              "inline-flex h-13 items-center justify-center gap-2 rounded-2xl px-7",
              "bg-primary text-sm font-semibold text-primary-foreground",
              "transition-all hover:bg-primary/90",
              "shadow-md shadow-primary/20 shrink-0"
            )}
          >
            Analyze Repository
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>
      ) : (
        /* Dynamic Onboarding Indexing Modal Card */
        <div className="mt-10 w-full max-w-xl rounded-2xl border border-primary/30 bg-card/90 p-6 shadow-lg backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div className="flex items-center gap-2 font-mono text-sm font-semibold text-foreground">
              <Loader2 className="h-4 w-4 text-primary animate-spin" />
              <span>Analyzing Codebase Architecture</span>
            </div>
            <span className="text-xs font-mono text-primary font-semibold">
              Step {analysisStep + 1} of {ONBOARDING_STEPS.length}
            </span>
          </div>

          <div className="space-y-3 pt-2">
            {ONBOARDING_STEPS.map((step, idx) => {
              const StepIcon = step.icon;
              const isPast = idx < analysisStep;
              const isCurrent = idx === analysisStep;
              const isFinalDone = idx === ONBOARDING_STEPS.length - 1 && analysisStep === ONBOARDING_STEPS.length - 1;

              return (
                <div
                  key={step.label}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-xs transition-all",
                    isPast || isFinalDone
                      ? "text-emerald-500 font-medium bg-emerald-500/10 border border-emerald-500/20"
                      : isCurrent
                      ? "bg-primary/10 text-primary font-semibold border border-primary/20"
                      : "text-muted-foreground/50"
                  )}
                >
                  {isPast || isFinalDone ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  ) : isCurrent ? (
                    <Loader2 className="h-4 w-4 text-primary animate-spin shrink-0" />
                  ) : (
                    <StepIcon className="h-4 w-4 shrink-0" />
                  )}
                  <span className="truncate">{step.label}</span>
                </div>
              );
            })}
          </div>

          {analysisStep === ONBOARDING_STEPS.length - 1 && targetRepo && (
            <div className="pt-2 flex justify-end">
              <a
                href={`/repo/${targetRepo.owner}/${targetRepo.name}`}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-all"
              >
                <span>Entering Dashboard...</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>
          )}
        </div>
      )}

      {error && <p className="mt-3 text-xs text-destructive font-medium">{error}</p>}

      {/* Recent repos & Example repos */}
      {!isAnalyzing && (
        <div className="mt-8 flex flex-col items-center gap-3 text-xs text-muted-foreground">
          {recentRepos.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="font-medium text-foreground/70">Recent:</span>
              {recentRepos.map((r) => (
                <button
                  key={`recent-${r.owner}/${r.name}`}
                  onClick={() => handleExample(r.owner, r.name)}
                  className={cn(
                    "rounded-lg border border-primary/30 bg-primary/5 px-2.5 py-1",
                    "text-xs font-mono text-primary transition-all shadow-2xs",
                    "hover:border-primary hover:bg-primary/10"
                  )}
                >
                  {r.owner}/{r.name}
                </button>
              ))}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-center gap-2">
            <span>Try an example:</span>
            {EXAMPLES.map((ex) => (
              <button
                key={`${ex.owner}/${ex.name}`}
                onClick={() => handleExample(ex.owner, ex.name)}
                className={cn(
                  "rounded-lg border border-border/80 bg-card/60 px-2.5 py-1",
                  "text-xs font-mono text-foreground/80 transition-all shadow-2xs",
                  "hover:border-primary/40 hover:bg-primary/5 hover:text-foreground"
                )}
              >
                {ex.owner}/{ex.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
