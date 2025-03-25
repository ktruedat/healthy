import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

// Spinner for inline loading
export function Spinner({
  size = "default",
  className,
}: {
  size?: "sm" | "default" | "lg";
  className?: string;
}) {
  const sizeClasses = {
    sm: "h-4 w-4",
    default: "h-6 w-6",
    lg: "h-10 w-10",
  };

  return (
    <Loader2
      className={cn("animate-spin", sizeClasses[size], className)}
      aria-hidden="true"
    />
  );
}

// Full page loading spinner
export function PageLoader() {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center">
      <Spinner size="lg" />
      <p className="mt-2 text-muted-foreground">Loading...</p>
    </div>
  );
}

// Card skeleton for dashboard items
export function CardSkeleton() {
  return (
    <div className="rounded-lg border p-4 shadow animate-pulse">
      <div className="space-y-3">
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-12 w-1/2" />
        <Skeleton className="h-4 w-1/4" />
      </div>
    </div>
  );
}

// Table loading skeleton
export function TableSkeleton({
  rows = 5,
  columns = 3,
}: {
  rows?: number;
  columns?: number;
}) {
  return (
    <div className="w-full border rounded-md">
      <div className="border-b p-4">
        <Skeleton className="h-6 w-full" />
      </div>
      <div className="divide-y">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="p-4 grid gap-4" style={{ 
            gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`
          }}>
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton key={colIndex} className="h-4 w-full" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// Chart placeholder loading state
export function ChartSkeleton({ height = 300 }: { height?: number }) {
  return (
    <div 
      className="w-full rounded-md border flex items-center justify-center bg-muted/20"
      style={{ height: `${height}px` }}
    >
      <div className="text-center">
        <Spinner />
        <p className="text-sm text-muted-foreground mt-2">Loading chart data...</p>
      </div>
    </div>
  );
}

// Map loading skeleton
export function MapSkeleton({ height = 400 }: { height?: number }) {
  return (
    <div 
      className="w-full rounded-md border bg-muted/20 relative overflow-hidden"
      style={{ height: `${height}px` }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-muted/10 to-transparent animate-shimmer" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <Spinner />
          <p className="text-sm text-muted-foreground mt-2">Loading map data...</p>
        </div>
      </div>
    </div>
  );
}
