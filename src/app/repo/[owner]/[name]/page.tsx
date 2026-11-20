"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  FileCode2,
  FolderGit2,
  Layers,
  Sparkles,
  GitBranch,
  Terminal,
  ArrowRight,
  ShieldCheck,
  Database,
  Globe,
  Server,
  Zap,
  Activity,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { demoRepository, demoOverview } from "@/lib/demo-data";
import { getLanguageColor, formatNumber } from "@/lib/utils";
import { Repository, RepositoryOverview } from "@/types/repository";

export default function RepoOverviewPage() {
  const routeParams = useParams();
  const owner = (routeParams?.owner as string) || "owner";
  const name = (routeParams?.name as string) || "repo";

  const [repo, setRepo] = useState<Repository>({
    ...demoRepository,
    owner,
    name,
    fullName: `${owner}/${name}`,
  });
  const [loading, setLoading] = useState(false);
  const [overview, setOverview] = useState<RepositoryOverview>(demoOverview);

  useEffect(() => {
    let isMounted = true;
    async function loadLiveData() {
      try {
        setLoading(true);
        const [infoRes, overviewRes] = await Promise.all([
          fetch(`/api/repo/${owner}/${name}/info`),
          fetch(`/api/repo/${owner}/${name}/overview`),
        ]);

        if (infoRes.ok) {
          const json = await infoRes.json();
          if (json.data && isMounted) {
            setRepo((prev) => ({
              ...prev,
              ...json.data,
              owner,
              name,
              fullName: `${owner}/${name}`,
            }));
          }
        }

        if (overviewRes.ok) {
          const json = await overviewRes.json();
          if (json.data && isMounted) {
            setOverview(json.data);
          }
        }
      } catch {
        // Fallback to local data
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadLiveData();
    return () => {
      isMounted = false;
    };
  }, [owner, name]);

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-6 py-8">
      {/* Top Banner / Hero Card */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-b from-card to-card/50 p-6 md:p-8 shadow-xs">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              AI Intelligence Grounded & Ready
            </div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl text-foreground flex items-center gap-3">
              {repo.fullName}
              {loading && <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />}
            </h1>
            <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground md:text-base">
              {repo.description || overview.summary}
            </p>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2.5">
            <Link
              href={`/repo/${owner}/${name}/search`}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:bg-primary/90"
            >
              <span>Ask Code Search</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href={`/repo/${owner}/${name}/chat`}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
            >
              <span>Start AI Chat</span>
            </Link>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 pt-6 border-t border-border/60">
          <div className="rounded-xl border border-border/40 bg-background/50 p-3.5">
            <div className="text-xs text-muted-foreground">Primary Language</div>
            <div className="mt-1 flex items-center gap-2 font-mono text-base font-semibold">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: getLanguageColor(repo.language || "TypeScript") }}
              />
              {repo.language || "TypeScript"}
            </div>
          </div>
          <div className="rounded-xl border border-border/40 bg-background/50 p-3.5">
            <div className="text-xs text-muted-foreground">Stars & Forks</div>
            <div className="mt-1 font-mono text-base font-semibold">
              ★ {formatNumber(repo.stars)} · ⑂ {formatNumber(repo.forks)}
            </div>
          </div>
          <div className="rounded-xl border border-border/40 bg-background/50 p-3.5">
            <div className="text-xs text-muted-foreground">Index Coverage</div>
            <div className="mt-1 flex items-center gap-1.5 font-mono text-base font-semibold text-emerald-500">
              <CheckCircle2 className="h-4 w-4" />
              100% Grounded
            </div>
          </div>
          <div className="rounded-xl border border-border/40 bg-background/50 p-3.5">
            <div className="text-xs text-muted-foreground">Default Branch / SHA</div>
            <div className="mt-1 font-mono text-xs font-semibold text-muted-foreground truncate" title={repo.commitSha}>
              {repo.defaultBranch || "main"} {repo.commitSha ? `(${repo.commitSha.slice(0, 7)})` : ""}
            </div>
          </div>
        </div>
      </div>

      {/* Tech Stack Breakdown */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold tracking-tight">Technology Stack & Runtime</h2>
          </div>
          <span className="text-xs text-muted-foreground">Identified via manifest & AST analysis</span>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {overview.techStack.map((tech) => (
            <div
              key={tech.name}
              className="flex items-start gap-3 rounded-xl border border-border bg-card/60 p-4 transition-colors hover:border-primary/40 hover:bg-card"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
                {tech.category === "framework" && <Globe className="h-4 w-4" />}
                {tech.category === "language" && <FileCode2 className="h-4 w-4" />}
                {tech.category === "runtime" && <Zap className="h-4 w-4" />}
                {tech.category === "database" && <Database className="h-4 w-4" />}
                {tech.category === "tool" && <Server className="h-4 w-4" />}
                {tech.category === "devops" && <ShieldCheck className="h-4 w-4" />}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">{tech.name}</span>
                  {tech.version && (
                    <span className="rounded-sm bg-muted px-1.5 py-0.2 text-[10px] font-mono text-muted-foreground">
                      {tech.version}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {tech.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Architecture Patterns Overview */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold tracking-tight">Architectural Patterns & Mechanics</h2>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-border bg-card/40 p-5 space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              Frontend / Backend Communication
            </span>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {overview.frontendBackendPattern}
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card/40 p-5 space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              Data Storage & Caching Layer
            </span>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {overview.dataStoragePattern}
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card/40 p-5 space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              Authentication & Session Security
            </span>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {overview.authPattern}
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card/40 p-5 space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              Testing & Verification Setup
            </span>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {overview.testingInfrastructure}
            </p>
          </div>
        </div>
      </section>

      {/* Key Modules & Directory Responsibilities */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderGit2 className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold tracking-tight">Core Modules & Responsibilities</h2>
          </div>
          <span className="text-xs text-muted-foreground">Detailed directory breakdown</span>
        </div>

        <div className="space-y-3">
          {overview.keyModules.map((mod) => (
            <div
              key={mod.path}
              className="rounded-xl border border-border bg-card/60 p-5 transition-all hover:border-border/80"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-sm font-semibold text-primary">{mod.path}</span>
                  <span className="text-xs text-muted-foreground">({mod.fileCount} source files)</span>
                </div>
                <span className="rounded-full bg-muted/60 px-2.5 py-0.5 text-xs font-medium text-muted-foreground self-start sm:self-auto">
                  {mod.name}
                </span>
              </div>

              <p className="mt-2.5 text-sm text-foreground/90 leading-relaxed">
                {mod.description}
              </p>

              <div className="mt-3.5 flex flex-wrap items-center gap-2 pt-3 border-t border-border/40 text-xs">
                <span className="text-muted-foreground font-medium">Main files:</span>
                {mod.mainFiles.map((file) => (
                  <Link
                    key={file}
                    href={`/repo/${owner}/${name}/explorer?file=${encodeURIComponent(file)}`}
                    className="rounded-md border border-border/80 bg-background/80 px-2 py-0.5 font-mono text-[11px] text-foreground transition-colors hover:border-primary hover:text-primary"
                  >
                    {file}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Entry Points List */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Terminal className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold tracking-tight">Execution Entry Points</h2>
        </div>

        <div className="rounded-xl border border-border bg-card/60 divide-y divide-border/60">
          {overview.entryPoints.map((ep) => (
            <div key={ep.path} className="flex flex-col sm:flex-row sm:items-center gap-2 p-4 text-sm">
              <Link
                href={`/repo/${owner}/${name}/explorer?file=${encodeURIComponent(ep.path)}`}
                className="font-mono text-xs font-semibold text-primary hover:underline shrink-0 sm:w-60"
              >
                {ep.path}
              </Link>
              <span className="text-xs text-muted-foreground leading-normal">
                {ep.description}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
