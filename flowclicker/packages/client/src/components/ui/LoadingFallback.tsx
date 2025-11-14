/**
 * Loading fallback component for React.lazy Suspense boundaries
 * Provides smooth loading experience during code splitting
 */
export function LoadingFallback() {
  return (
    <div className="flex items-center justify-center p-4">
      <div className="flex flex-col items-center gap-2">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm text-text-muted">Loading...</p>
      </div>
    </div>
  );
}

/**
 * Minimal loading skeleton for component placeholders
 */
export function ComponentSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-xl border border-border bg-bg-card p-6 ${className}`}>
      <div className="h-4 w-1/3 rounded bg-text-muted/20 mb-4" />
      <div className="space-y-2">
        <div className="h-3 w-full rounded bg-text-muted/20" />
        <div className="h-3 w-5/6 rounded bg-text-muted/20" />
        <div className="h-3 w-4/6 rounded bg-text-muted/20" />
      </div>
    </div>
  );
}
