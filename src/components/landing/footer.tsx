import { Braces, Github } from "lucide-react";
import { cn } from "@/lib/utils";

export function Footer() {
  return (
    <footer className="border-t border-border/50 px-6 py-10">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
        {/* Branding */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
            <Braces className="h-3.5 w-3.5 text-primary-foreground" />
          </div>
          <span className="text-sm font-semibold text-foreground">
            GitSense
          </span>
          <span className="text-sm text-muted-foreground">
            · Built with AI for developers
          </span>
        </div>

        {/* Links */}
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "inline-flex items-center gap-1.5 text-sm text-muted-foreground",
            "transition-colors hover:text-foreground"
          )}
        >
          <Github className="h-4 w-4" />
          GitHub
        </a>
      </div>
    </footer>
  );
}
