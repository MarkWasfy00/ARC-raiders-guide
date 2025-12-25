export default function Loading() {
  return (
    <div className="container mx-auto p-6">
      <div className="space-y-6">
        {/* Search bar skeleton */}
        <div className="h-10 w-full max-w-md bg-muted animate-pulse rounded"></div>

        {/* Filters skeleton */}
        <div className="flex gap-4 flex-wrap">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-10 w-28 bg-muted animate-pulse rounded"></div>
          ))}
        </div>

        {/* Items grid skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="border rounded-lg p-4 space-y-3">
              <div className="h-32 w-full bg-muted animate-pulse rounded"></div>
              <div className="h-5 w-3/4 bg-muted animate-pulse rounded"></div>
              <div className="h-4 w-1/2 bg-muted animate-pulse rounded"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
