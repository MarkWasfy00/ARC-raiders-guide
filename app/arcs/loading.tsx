export default function Loading() {
  return (
    <div className="container mx-auto p-6">
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="h-8 w-48 bg-muted animate-pulse rounded"></div>

        {/* Cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="border rounded-lg p-6 space-y-4">
              <div className="h-6 w-3/4 bg-muted animate-pulse rounded"></div>
              <div className="space-y-2">
                <div className="h-4 w-full bg-muted animate-pulse rounded"></div>
                <div className="h-4 w-5/6 bg-muted animate-pulse rounded"></div>
                <div className="h-4 w-4/6 bg-muted animate-pulse rounded"></div>
              </div>
              <div className="h-10 w-full bg-muted animate-pulse rounded"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
