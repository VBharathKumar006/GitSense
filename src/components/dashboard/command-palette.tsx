"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  FileCode2,
  FolderTree,
  LayoutDashboard,
  MessageSquare,
  Network,
  GitFork,
  Wrench,
  ArrowRight,
  X,
  FileText,
} from "lucide-react";
import { FileNode } from "@/types/repository";
import { cn } from "@/lib/utils";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  owner: string;
  name: string;
}

export function CommandPalette({ isOpen, onClose, owner, name }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [flatFiles, setFlatFiles] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch tree to extract flat list of file paths
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    async function loadTree() {
      try {
        const res = await fetch(`/api/repo/${owner}/${name}/tree`);
        if (res.ok) {
          const json = await res.json();
          if (json.data && isMounted) {
            const files: string[] = [];
            const collect = (nodes: FileNode[]) => {
              for (const n of nodes) {
                if (n.type === "file") files.push(n.path);
                if (n.children) collect(n.children);
              }
            };
            collect(json.data);
            setFlatFiles(files);
          }
        }
      } catch {
        // Fallback
      }
    }

    loadTree();
    return () => {
      isMounted = false;
    };
  }, [isOpen, owner, name]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery("");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Navigation pages
  const pages = [
    { label: "Overview", href: `/repo/${owner}/${name}`, icon: LayoutDashboard },
    { label: "AI Code Search", href: `/repo/${owner}/${name}/search`, icon: Search },
    { label: "AI Chat", href: `/repo/${owner}/${name}/chat`, icon: MessageSquare },
    { label: "File Explorer", href: `/repo/${owner}/${name}/explorer`, icon: FolderTree },
    { label: "Architecture", href: `/repo/${owner}/${name}/architecture`, icon: Network },
    { label: "Dependencies", href: `/repo/${owner}/${name}/dependencies`, icon: GitFork },
    { label: "Utilities & Security", href: `/repo/${owner}/${name}/utilities`, icon: Wrench },
  ];

  const filteredPages = pages.filter((p) =>
    p.label.toLowerCase().includes(query.toLowerCase())
  );

  const filteredFiles = flatFiles
    .filter((f) => f.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 10);

  const allItems = [
    ...filteredPages.map((p) => ({ type: "page" as const, ...p })),
    ...filteredFiles.map((f) => ({
      type: "file" as const,
      label: f,
      href: `/repo/${owner}/${name}/explorer?file=${encodeURIComponent(f)}`,
      icon: FileCode2,
    })),
  ];

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (allItems.length > 0 ? (prev + 1) % allItems.length : 0));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (allItems.length > 0 ? (prev - 1 + allItems.length) % allItems.length : 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (allItems[selectedIndex]) {
          router.push(allItems[selectedIndex].href);
          onClose();
        } else if (query.trim()) {
          router.push(`/repo/${owner}/${name}/search?q=${encodeURIComponent(query)}`);
          onClose();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, selectedIndex, allItems, query, owner, name, router, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/60 backdrop-blur-xs">
      <div
        className="fixed inset-0"
        onClick={onClose}
      />
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 border-b border-border/80 px-4 py-3 bg-muted/20">
          <Search className="h-5 w-5 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder={`Search files, symbols, or pages in ${name}...`}
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 outline-none"
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          )}
          <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
            ESC
          </kbd>
        </div>

        {/* Results list */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-1">
          {filteredPages.length > 0 && (
            <div className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Navigation Pages
            </div>
          )}
          {filteredPages.map((page, idx) => {
            const isSelected = selectedIndex === idx;
            const PageIcon = page.icon;
            return (
              <button
                key={page.href}
                onClick={() => {
                  router.push(page.href);
                  onClose();
                }}
                className={cn(
                  "flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs transition-colors",
                  isSelected
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "text-foreground hover:bg-muted"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <PageIcon className="h-4 w-4" />
                  <span>{page.label}</span>
                </div>
                <ArrowRight className="h-3 w-3 opacity-60" />
              </button>
            );
          })}

          {filteredFiles.length > 0 && (
            <div className="px-2 pt-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Repository Files ({filteredFiles.length})
            </div>
          )}
          {filteredFiles.map((file, idx) => {
            const actualIdx = filteredPages.length + idx;
            const isSelected = selectedIndex === actualIdx;
            return (
              <button
                key={file}
                onClick={() => {
                  router.push(`/repo/${owner}/${name}/explorer?file=${encodeURIComponent(file)}`);
                  onClose();
                }}
                className={cn(
                  "flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-mono transition-colors",
                  isSelected
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "text-foreground hover:bg-muted"
                )}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <FileCode2 className="h-4 w-4 shrink-0" />
                  <span className="truncate">{file}</span>
                </div>
                <span className="text-[10px] opacity-70 shrink-0">Open File</span>
              </button>
            );
          })}

          {allItems.length === 0 && (
            <div className="p-8 text-center text-xs text-muted-foreground space-y-2">
              <p>No direct files or views matching "{query}"</p>
              <button
                onClick={() => {
                  router.push(`/repo/${owner}/${name}/search?q=${encodeURIComponent(query)}`);
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors"
              >
                <Search className="h-3.5 w-3.5" />
                <span>Search with AI Code Search</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="flex items-center justify-between border-t border-border/80 px-4 py-2 bg-muted/10 text-[10px] text-muted-foreground">
          <span>Navigate with ↑ ↓, press Enter to open</span>
          <span>{owner}/{name}</span>
        </div>
      </div>
    </div>
  );
}
