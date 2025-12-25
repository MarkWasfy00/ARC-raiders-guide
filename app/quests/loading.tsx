export default function Loading() {
  return (
    <div className="container mx-auto p-6">
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="h-8 w-48 bg-muted animate-pulse rounded"></div>

        {/* Quest cards skeleton */}
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="border rounded-lg p-6 space-y-3">
              <div className="h-6 w-2/3 bg-muted animate-pulse rounded"></div>
              <div className="h-4 w-full bg-muted animate-pulse rounded"></div>
              <div className="h-4 w-5/6 bg-muted animate-pulse rounded"></div>
              <div className="flex gap-2 mt-4">
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
