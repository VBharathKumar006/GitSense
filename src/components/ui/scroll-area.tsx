import * as React from "react";
import { cn } from "@/lib/utils";

interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "vertical" | "horizontal" | "both";
}

const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ className, orientation = "vertical", children, ...props }, ref) => {
    const overflowClass =
      orientation === "vertical"
        ? "overflow-y-auto overflow-x-hidden"
        : orientation === "horizontal"
          ? "overflow-x-auto overflow-y-hidden"
          : "overflow-auto";

    return (
      <div
        ref={ref}
        className={cn(
          "relative",
          overflowClass,
          // Custom scrollbar styles
          "[&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar]:h-1.5",
          "[&::-webkit-scrollbar-track]:bg-transparent",
          "[&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border",
          "[&::-webkit-scrollbar-thumb:hover]:bg-muted-foreground/50",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
ScrollArea.displayName = "ScrollArea";

export { ScrollArea };
export type { ScrollAreaProps };
