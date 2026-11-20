"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Network,
  Sparkles,
  ArrowRight,
  GitBranch,
  Layers,
  FileCode2,
  ZoomIn,
  RefreshCw,
  Info,
} from "lucide-react";
import { demoArchitectureDiagrams } from "@/lib/demo-data";
import { ArchitectureDiagram } from "@/types/repository";
import { cn } from "@/lib/utils";

export default function ArchitecturePage() {
  const routeParams = useParams();
  const owner = (routeParams?.owner as string) || "owner";
  const name = (routeParams?.name as string) || "repo";

  const [diagrams, setDiagrams] = useState<ArchitectureDiagram[]>(demoArchitectureDiagrams);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [svgOutput, setSvgOutput] = useState<string>("");
  const [renderError, setRenderError] = useState<string>("");

  useEffect(() => {
    let isMounted = true;
    async function loadDiagrams() {
      try {
        const res = await fetch(`/api/repo/${owner}/${name}/architecture`);
        if (res.ok) {
          const json = await res.json();
          if (json.data && json.data.length > 0 && isMounted) {
            setDiagrams(json.data);
          }
        }
      } catch {
        // Fallback
      }
    }
    loadDiagrams();
    return () => {
      isMounted = false;
    };
  }, [owner, name]);

  const currentDiagram = diagrams[activeTab] || diagrams[0] || demoArchitectureDiagrams[0];

  useEffect(() => {
    let isMounted = true;
    async function renderMermaid() {
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: "dark",
          securityLevel: "loose",
          fontFamily: "Inter, system-ui, sans-serif",
        });
        const id = `mermaid-${Date.now()}`;
        const { svg } = await mermaid.render(id, currentDiagram.mermaidCode);
        if (isMounted) {
          setSvgOutput(svg);
          setRenderError("");
        }
      } catch (err: any) {
        if (isMounted) {
          setRenderError("Rendering diagram preview");
        }
      }
    }

    renderMermaid();
    return () => {
      isMounted = false;
    };
  }, [currentDiagram]);

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-6 py-8">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          <Network className="h-3.5 w-3.5" />
          Interactive Architecture Maps
        </div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          System Architecture & Execution Flows
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Synthesized diagrams grounded in the verified AST and dependency structure of{" "}
          <span className="font-mono text-foreground font-medium">{owner}/{name}</span>.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border pb-3">
        {diagrams.map((d, idx) => (
          <button
            key={d.title}
            onClick={() => setActiveTab(idx)}
            className={cn(
              "rounded-xl px-4 py-2 text-sm font-semibold transition-all",
              activeTab === idx
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-card text-muted-foreground hover:bg-muted hover:text-foreground border border-border/80"
            )}
          >
            {d.title}
          </button>
        ))}
      </div>

      {/* Diagram Viewer Card */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card/60 shadow-xs">
        <div className="flex flex-col gap-2 border-b border-border/60 bg-muted/30 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-bold text-foreground">
              {currentDiagram.title}
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {currentDiagram.description}
            </p>
          </div>
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary self-start sm:self-auto">
            Mermaid Directed Graph
          </span>
        </div>

        {/* Diagram Render Canvas */}
        <div className="relative min-h-[400px] flex items-center justify-center p-6 bg-background/50 overflow-auto">
          {svgOutput ? (
            <div
              className="w-full flex justify-center [&_svg]:max-w-full [&_svg]:h-auto"
              dangerouslySetInnerHTML={{ __html: svgOutput }}
            />
          ) : (
            <div className="w-full max-w-2xl rounded-xl border border-border bg-[#0d1117] p-4 text-xs font-mono text-[#e6edf3]">
              <div className="text-muted-foreground mb-2">// Mermaid Definition:</div>
              <pre>{currentDiagram.mermaidCode}</pre>
            </div>
          )}
        </div>

        {/* Mapped Component Nodes */}
        <div className="border-t border-border/60 p-5 bg-card/40 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <Info className="h-3.5 w-3.5" />
            Associated Code Modules & Target Files:
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {currentDiagram.nodes.map((node) => (
              <div
                key={node.id}
                className="rounded-xl border border-border/80 bg-background/80 p-3 space-y-1.5"
              >
                <div className="text-xs font-bold text-foreground">{node.label}</div>
                <div className="space-y-1">
                  {node.filePaths.map((fp) => (
                    <Link
                      key={fp}
                      href={`/repo/${owner}/${name}/explorer?file=${encodeURIComponent(fp)}`}
                      className="flex items-center gap-1 font-mono text-[11px] text-primary hover:underline"
                    >
                      <FileCode2 className="h-3 w-3 shrink-0" />
                      <span className="truncate">{fp}</span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
