"use client";

import { useState, useEffect } from "react";
import { Braces, Github, Sun, Moon, LogOut, CheckCircle2 } from "lucide-react";
import { useTheme } from "@/components/providers/theme-provider";
import { cn } from "@/lib/utils";

interface AuthUser {
  login: string;
  avatar_url: string;
  name: string;
}

export function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const json = await res.json();
          if (json.authenticated && json.user && isMounted) {
            setUser(json.user);
          }
        }
      } catch {
        // Unauthenticated
      }
    }
    checkAuth();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
    } catch {
      // Ignore
    }
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full",
        "border-b border-border/50",
        "bg-background/80 backdrop-blur-xl",
        "supports-[backdrop-filter]:bg-background/60"
      )}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-80">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Braces className="h-4.5 w-4.5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold tracking-tight text-foreground">
            GitSense
          </span>
        </a>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {user ? (
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/5 px-2.5 py-1">
                <img
                  src={user.avatar_url}
                  alt={user.login}
                  className="h-5 w-5 rounded-full border border-primary/40"
                />
                <span className="font-mono text-xs font-semibold text-foreground">{user.login}</span>
                <span className="inline-flex items-center gap-0.5 rounded bg-emerald-500/10 px-1 py-0.5 text-[9px] font-semibold text-emerald-500">
                  <CheckCircle2 className="h-2.5 w-2.5" />
                  OAuth
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <a
              href="/api/auth/github/login"
              className={cn(
                "inline-flex h-9 items-center gap-1.5 rounded-lg border border-border px-3 text-xs font-medium text-foreground transition-all hover:bg-muted"
              )}
              title="Connect GitHub for private repositories and 5000 req/hr"
            >
              <Github className="h-4 w-4" />
              <span>Connect GitHub</span>
            </a>
          )}

          <button
            onClick={toggleTheme}
            className={cn(
              "inline-flex h-9 w-9 items-center justify-center rounded-lg",
              "text-muted-foreground transition-colors",
              "hover:bg-accent hover:text-foreground"
            )}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="h-[18px] w-[18px]" />
            ) : (
              <Moon className="h-[18px] w-[18px]" />
            )}
          </button>

          <a
            href="#hero"
            className={cn(
              "ml-1 inline-flex h-9 items-center rounded-lg px-4 text-sm font-medium",
              "bg-primary text-primary-foreground",
              "transition-all hover:bg-primary/90",
              "shadow-sm shadow-primary/20"
            )}
          >
            Get Started
          </a>
        </div>
      </nav>
    </header>
  );
}
