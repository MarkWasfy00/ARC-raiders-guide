export default function Loading() {
  return (
    <div className="container mx-auto p-6">
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="h-8 w-48 bg-muted animate-pulse rounded"></div>

        {/* Tabs skeleton */}
        <div className="flex gap-2">
          <div className="h-10 w-32 bg-muted animate-pulse rounded"></div>
          <div className="h-10 w-32 bg-muted animate-pulse rounded"></div>
        </div>

        {/* Listings skeleton */}
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="border rounded-lg p-4 space-y-3">
              <div className="h-6 w-2/3 bg-muted animate-pulse rounded"></div>
              <div className="h-4 w-1/2 bg-muted animate-pulse rounded"></div>
              <div className="flex gap-2">
                <div className="h-8 w-24 bg-muted animate-pulse rounded"></div>
                <div className="h-8 w-24 bg-muted animate-pulse rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
