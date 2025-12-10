/**
 * Global loading.tsx - Displays skeleton UI while the page is loading
 * Used by Next.js Suspense boundaries to show placeholder content
 * Mirrors the grid layout of HabitList for smooth visual transition
 */

export default function Loading() {
  const SkeletonCard = () => (
    <div className="space-y-4 rounded-lg border border-border bg-card p-6 animate-pulse">
      {/* Title skeleton */}
      <div className="h-6 w-3/4 rounded bg-muted" />

      {/* Description skeleton */}
      <div className="space-y-2">
        <div className="h-4 w-full rounded bg-muted" />
        <div className="h-4 w-4/5 rounded bg-muted" />
      </div>

      {/* Metadata skeleton (frequency badge + streak) */}
      <div className="flex gap-2">
        <div className="h-6 w-20 rounded-full bg-muted" />
        <div className="h-6 w-16 rounded-full bg-muted" />
      </div>

      {/* Action button skeleton */}
      <div className="h-10 w-full rounded bg-muted" />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-1/3 rounded bg-muted animate-pulse" />
        <div className="h-4 w-1/2 rounded bg-muted animate-pulse" />
      </div>

      {/* Grid of skeleton cards - matching HabitList responsive layout */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}
