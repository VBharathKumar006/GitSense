"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  GitFork,
  FileCode2,
  Layers,
  ArrowRight,
  ArrowDownRight,
  ShieldCheck,
  Search,
  Filter,
} from "lucide-react";
import { demoDependencies } from "@/lib/demo-data";
import { DependencyGraph } from "@/types/repository";
import { cn } from "@/lib/utils";

export default function DependenciesPage() {
  const routeParams = useParams();
  const owner = (routeParams?.owner as string) || "owner";
  const name = (routeParams?.name as string) || "repo";

  const [graph, setGraph] = useState<DependencyGraph>(demoDependencies);
  const [filter, setFilter] = useState("");
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(
    demoDependencies.nodes[2]?.id || null
  );

  useEffect(() => {
    let isMounted = true;
    async function loadDeps() {
      try {
        const res = await fetch(`/api/repo/${owner}/${name}/dependencies`);
        if (res.ok) {
          const json = await res.json();
          if (json.data && json.data.nodes?.length > 0 && isMounted) {
            setGraph(json.data);
            setSelectedNodeId(json.data.nodes[0]?.id || null);
          }
        }
      } catch {
        // Fallback
      }
    }
    loadDeps();
    return () => {
      isMounted = false;
    };
  }, [owner, name]);

  const filteredNodes = graph.nodes.filter(
    (n) =>
      n.path.toLowerCase().includes(filter.toLowerCase()) ||
      n.name.toLowerCase().includes(filter.toLowerCase())
  );

  const selectedNode = graph.nodes.find((n) => n.id === selectedNodeId) || graph.nodes[0];

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-6 py-8">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          <GitFork className="h-3.5 w-3.5" />
          Code Relationship & Import Graph
        </div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Dependency & Module Explorer
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Trace incoming consumers, outgoing dependencies, and high-centrality modules inside{" "}
          <span className="font-mono text-foreground font-medium">{owner}/{name}</span>.
        </p>
      </div>

      {/* Central Hub Highlights */}
      <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary mb-2">
          <Layers className="h-4 w-4" />
          High Centrality Nodes (Architectural Anchors):
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {graph.centralModules?.map((cm) => (
            <button
              key={cm}
              onClick={() => setSelectedNodeId(cm)}
              className="rounded-lg border border-primary/30 bg-card px-3 py-1.5 font-mono text-xs font-semibold text-foreground transition-colors hover:border-primary hover:text-primary"
            >
              {cm}
            </button>
          ))}
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
        {/* Left Column: Node List */}
        <div className="space-y-3 md:col-span-5">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filter modules..."
              className="h-10 w-full rounded-xl border border-border bg-card pl-9 pr-3 text-xs outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
            />
          </div>

          <div className="rounded-2xl border border-border bg-card/60 divide-y divide-border/60 max-h-[500px] overflow-y-auto">
            {filteredNodes.map((node) => {
              const isSelected = selectedNodeId === node.id;
              return (
                <button
                  key={node.id}
                  onClick={() => setSelectedNodeId(node.id)}
                  className={cn(
                    "w-full text-left p-3.5 transition-colors flex items-center justify-between",
                    isSelected
                      ? "bg-primary/10 text-primary font-semibold"
                      : "hover:bg-muted/60 text-foreground"
                  )}
                >
                  <div className="space-y-0.5 truncate pr-2">
                    <div className="font-mono text-xs truncate">{node.path}</div>
                    <div className="text-[11px] text-muted-foreground">
                      {node.linesOfCode} lines · {node.incoming.length} incoming · {node.outgoing.length} outgoing
                    </div>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Node Details & Connected Edges */}
        <div className="md:col-span-7">
          {selectedNode ? (
            <div className="rounded-2xl border border-border bg-card/60 p-6 space-y-6">
              <div className="border-b border-border pb-4 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Module Inspector
                  </span>
                  <Link
                    href={`/repo/${owner}/${name}/explorer?file=${encodeURIComponent(selectedNode.path)}`}
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-mono"
                  >
                    View Source <ArrowDownRight className="h-3 w-3" />
                  </Link>
                </div>
                <h3 className="font-mono text-base font-bold text-foreground">
                  {selectedNode.path}
                </h3>
              </div>

              {/* Incoming Dependencies (Who calls this?) */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Incoming Dependents ({selectedNode.incoming.length})
                  </h4>
                  <span className="text-[11px] text-muted-foreground">Modules importing this file</span>
                </div>
                {selectedNode.incoming.length > 0 ? (
                  <div className="space-y-1.5">
                    {selectedNode.incoming.map((inc) => (
                      <button
                        key={inc}
                        onClick={() => setSelectedNodeId(inc)}
                        className="flex w-full items-center justify-between rounded-lg border border-border/80 bg-background/80 p-2.5 text-left text-xs font-mono transition-colors hover:border-primary hover:text-primary"
                      >
                        <span className="truncate">{inc}</span>
                        <ArrowRight className="h-3 w-3 shrink-0 text-muted-foreground" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-border/80 p-3 text-xs text-muted-foreground text-center">
                    Top-level entry point (no inbound imports)
                  </div>
                )}
              </div>

              {/* Outgoing Dependencies (What does this import?) */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Outgoing Dependencies ({selectedNode.outgoing.length})
                  </h4>
                  <span className="text-[11px] text-muted-foreground">Files imported by this module</span>
                </div>
                {selectedNode.outgoing.length > 0 ? (
                  <div className="space-y-1.5">
                    {selectedNode.outgoing.map((out) => (
                      <button
                        key={out}
                        onClick={() => setSelectedNodeId(out)}
                        className="flex w-full items-center justify-between rounded-lg border border-border/80 bg-background/80 p-2.5 text-left text-xs font-mono transition-colors hover:border-primary hover:text-primary"
                      >
                        <span className="truncate">{out}</span>
                        <ArrowRight className="h-3 w-3 shrink-0 text-muted-foreground" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-border/80 p-3 text-xs text-muted-foreground text-center">
                    Leaf node (no outbound local imports)
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">
              Select a module from the left to inspect its dependency connections
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
