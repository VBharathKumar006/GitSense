import Link from "next/link";
import { ArrowLeft, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center bg-background text-foreground">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-6">
        <Compass className="h-8 w-8" />
      </div>
      <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">404</h1>
      <p className="mt-3 text-lg font-medium text-foreground">Page Not Found</p>
      <p className="mt-1 text-sm text-muted-foreground max-w-md">
        The repository or page you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-all"
      >
        <ArrowLeft className="h-4 w-4" />
        Return to Home
      </Link>
    </div>
  );
}
