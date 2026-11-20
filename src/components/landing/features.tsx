import {
  Search,
  MessageSquare,
  BarChart3,
  Network,
  GitBranch,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

const FEATURES: Feature[] = [
  {
    icon: Search,
    title: "AI Code Search",
    description:
      "Ask natural-language questions about any codebase and get precise, context-aware answers with file references.",
  },
  {
    icon: MessageSquare,
    title: "Repository Chat",
    description:
      "Have a conversation with the code. Ask follow-ups, explore patterns, and understand design decisions interactively.",
  },
  {
    icon: BarChart3,
    title: "Smart Overview",
    description:
      "Auto-generated architecture summaries, tech stack detection, and key metrics at a glance.",
  },
  {
    icon: Network,
    title: "Architecture Maps",
    description:
      "Visual diagrams of module relationships, data flow, and system boundaries — generated automatically.",
  },
  {
    icon: GitBranch,
    title: "Dependency Explorer",
    description:
      "Interactive import/export relationship graphs that reveal how every piece of the codebase connects.",
  },
  {
    icon: Zap,
    title: "Instant Analysis",
    description:
      "Index any public GitHub repository in seconds. No setup, no configuration — just paste and go.",
  },
];

export function Features() {
  return (
    <section className="px-6 py-24 md:py-32">
      <div className="mx-auto max-w-7xl">
        {/* Heading */}
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Everything you need to understand a codebase
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Powerful tools that work together to give you deep insight into any
            repository.
          </p>
        </div>

        {/* Grid */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className={cn(
                "group relative rounded-xl border border-border/60 bg-card p-6",
                "transition-all duration-300",
                "hover:scale-[1.02] hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5"
              )}
            >
              <div
                className={cn(
                  "mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg",
                  "bg-primary/10 text-primary",
                  "transition-colors group-hover:bg-primary/15"
                )}
              >
                <feature.icon className="h-5 w-5" />
              </div>

              <h3 className="mb-2 text-base font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
