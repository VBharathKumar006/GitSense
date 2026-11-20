"use client";

import { Braces, Github, Sun, Moon } from "lucide-react";
import { useTheme } from "@/components/providers/theme-provider";
import { cn } from "@/lib/utils";

export function Navbar() {
  const { theme, toggleTheme } = useTheme();

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
        <div className="flex items-center gap-1">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "inline-flex h-9 w-9 items-center justify-center rounded-lg",
              "text-muted-foreground transition-colors",
              "hover:bg-accent hover:text-foreground"
            )}
            aria-label="GitHub"
          >
            <Github className="h-[18px] w-[18px]" />
          </a>

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
              "ml-2 inline-flex h-9 items-center rounded-lg px-4 text-sm font-medium",
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
