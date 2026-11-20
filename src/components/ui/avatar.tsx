"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface AvatarProps extends React.HTMLAttributes<HTMLSpanElement> {
  src?: string | null;
  alt?: string;
  fallback?: string;
  size?: "sm" | "default" | "lg";
}

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  default: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
} as const;

function Avatar({
  className,
  src,
  alt = "",
  fallback,
  size = "default",
  ...props
}: AvatarProps) {
  const [hasError, setHasError] = React.useState(false);

  const showImage = src && !hasError;

  const fallbackText = React.useMemo(() => {
    if (fallback) return fallback;
    if (alt) {
      return alt
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return "?";
  }, [fallback, alt]);

  return (
    <span
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted",
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {showImage ? (
        <img
          src={src}
          alt={alt}
          className="aspect-square h-full w-full object-cover"
          onError={() => setHasError(true)}
        />
      ) : (
        <span className="font-medium text-muted-foreground">
          {fallbackText}
        </span>
      )}
    </span>
  );
}

export { Avatar };
export type { AvatarProps };
