import { Link as LinkIcon, Cpu, Compass } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    number: 1,
    icon: LinkIcon,
    title: "Paste a Repository URL",
    description:
      "Enter any public GitHub repository URL — or just the owner/repo shorthand. That's all it takes to get started.",
  },
  {
    number: 2,
    icon: Cpu,
    title: "AI Analyzes the Code",
    description:
      "GitSense indexes every file, extracts the architecture, maps dependencies, and generates semantic embeddings.",
  },
  {
    number: 3,
    icon: Compass,
    title: "Explore & Ask Questions",
    description:
      "Search with natural language, chat with the codebase, visualize architecture, and understand every dependency.",
  },
];

export function HowItWorks() {
  return (
    <section className="px-6 py-24 md:py-32">
      <div className="mx-auto max-w-7xl">
        {/* Heading */}
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            How GitSense Works
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            From URL to full understanding in three simple steps.
          </p>
        </div>

        {/* Steps */}
        <div className="relative grid gap-10 md:grid-cols-3 md:gap-8">
          {/* Connecting line (desktop only) */}
          <div
            className="pointer-events-none absolute left-0 right-0 top-10 -z-10 hidden md:block"
            aria-hidden="true"
          >
            <div className="mx-auto h-px w-2/3 bg-gradient-to-r from-transparent via-border to-transparent" />
          </div>

          {STEPS.map((step) => (
            <div
              key={step.number}
              className="flex flex-col items-center text-center"
            >
              {/* Number badge */}
              <div
                className={cn(
                  "mb-6 flex h-14 w-14 items-center justify-center rounded-full",
                  "bg-primary text-lg font-bold text-primary-foreground",
                  "shadow-lg shadow-primary/25",
                  "ring-4 ring-background"
                )}
              >
                {step.number}
              </div>

              {/* Icon */}
              <div
                className={cn(
                  "mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg",
                  "bg-primary/10 text-primary"
                )}
              >
                <step.icon className="h-5 w-5" />
              </div>

              <h3 className="mb-2 text-lg font-semibold text-foreground">
                {step.title}
              </h3>
              <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
