"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import {
  LayoutDashboard,
  Search,
  MessageSquare,
  FolderTree,
  Network,
  GitFork,
  ArrowLeft,
  Github,
  Star,
  GitBranch,
  Sun,
  Moon,
  ChevronRight,
  Menu,
  X,
  Code2,
  Wrench,
} from "lucide-react";
import { useTheme } from "@/components/providers/theme-provider";
import { cn, formatNumber } from "@/lib/utils";
import { demoRepository } from "@/lib/demo-data";
import { Repository } from "@/types/repository";

export default function RepoDashboardLayout({ children }: { children: React.ReactNode }) {
  const routeParams = useParams();
  const owner = (routeParams?.owner as string) || "owner";
  const name = (routeParams?.name as string) || "repo";

  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [repo, setRepo] = useState<Repository>(demoRepository);

  useEffect(() => {
    if (owner !== demoRepository.owner || name !== demoRepository.name) {
      setRepo((prev) => ({
        ...prev,
        owner,
        name,
        fullName: `${owner}/${name}`,
        url: `https://github.com/${owner}/${name}`,
      }));
    }
  }, [owner, name]);

  const navItems = [
    {
      label: "Overview",
      href: `/repo/${owner}/${name}`,
      icon: LayoutDashboard,
      exact: true,
    },
    {
      label: "AI Code Search",
      href: `/repo/${owner}/${name}/search`,
      icon: Search,
      badge: "Core",
    },
    {
      label: "AI Chat",
      href: `/repo/${owner}/${name}/chat`,
      icon: MessageSquare,
    },
    {
      label: "File Explorer",
      href: `/repo/${owner}/${name}/explorer`,
      icon: FolderTree,
    },
    {
      label: "Architecture",
      href: `/repo/${owner}/${name}/architecture`,
      icon: Network,
    },
    {
      label: "Dependencies",
      href: `/repo/${owner}/${name}/dependencies`,
      icon: GitFork,
    },
    {
      label: "Utilities",
      href: `/repo/${owner}/${name}/utilities`,
      icon: Wrench,
    },
  ];

  const isItemActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      {/* Mobile menu backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-68 flex-col border-r border-border bg-card/60 backdrop-blur-md transition-transform duration-200 md:static md:translate-x-0",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand Header */}
        <div className="flex h-15 items-center justify-between border-b border-border px-5">
          <Link
            href="/"
            className="flex items-center gap-2.5 text-sm font-semibold tracking-tight transition-opacity hover:opacity-85"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
              <Code2 className="h-4 w-4" />
            </div>
            <span className="font-bold text-base bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              GitSense
            </span>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted md:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Selected Repo Card */}
        <div className="border-b border-border p-4">
          <div className="rounded-lg border border-border/80 bg-background/80 p-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Active Repository</span>
              <a
                href={repo.url}
                target="_blank"
                rel="noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                title="View on GitHub"
              >
                <Github className="h-3.5 w-3.5" />
              </a>
            </div>
            <div className="mt-1.5 flex items-center gap-2 font-mono text-sm font-medium">
              <GitBranch className="h-3.5 w-3.5 text-primary shrink-0" />
              <span className="truncate" title={repo.fullName}>
                {repo.owner}/<span className="text-primary font-semibold">{repo.name}</span>
              </span>
            </div>
            <div className="mt-2.5 flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                {formatNumber(repo.stars)}
              </span>
              <span className="flex items-center gap-1">
                <GitFork className="h-3 w-3" />
                {formatNumber(repo.forks)}
              </span>
              <span className="inline-flex items-center rounded-sm bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                {repo.defaultBranch}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-3">
          {navItems.map((item) => {
            const active = isItemActive(item.href, item.exact);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "group flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                    : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon
                    className={cn(
                      "h-4 w-4 shrink-0 transition-colors",
                      active ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
                    )}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && !active && (
                  <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Bar: Back & Theme */}
        <div className="border-t border-border p-3 space-y-1">
          <Link
            href="/"
            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Switch Repository</span>
          </Link>
          <div className="flex items-center justify-between px-3 py-2 text-xs text-muted-foreground">
            <span>Theme</span>
            <button
              onClick={toggleTheme}
              className="flex h-7 w-7 items-center justify-center rounded-md border border-border bg-background transition-colors hover:bg-muted"
              title="Toggle theme"
            >
              {theme === "dark" ? <Sun className="h-3.5 w-3.5 text-amber-400" /> : <Moon className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile Top Navbar */}
        <header className="flex h-14 items-center justify-between border-b border-border bg-card/60 px-4 backdrop-blur-md md:hidden">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="font-mono text-sm font-semibold truncate max-w-[200px]">
            {repo.owner}/{repo.name}
          </span>
          <button
            onClick={toggleTheme}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-border"
          >
            {theme === "dark" ? <Sun className="h-3.5 w-3.5 text-amber-400" /> : <Moon className="h-3.5 w-3.5" />}
          </button>
        </header>

        {/* Subpage dynamic content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
