export default function ResultLoading() {
  return (
    <main className="min-h-screen bg-surface-2 px-4 py-12">
      <div className="max-w-[640px] mx-auto space-y-8">
        {/* Band 1 Skeleton */}
        <div className="bg-surface rounded-xl shadow-sm p-6">
          <div className="h-4 bg-border-light rounded w-32 mb-4 animate-pulse" />
          <div className="flex items-end gap-2 mb-3">
            <div className="h-10 bg-border-light rounded w-24 animate-pulse" />
            <div className="h-6 bg-border-light rounded-full w-20 animate-pulse" />
          </div>
          <div className="h-4 bg-border-light rounded w-64 animate-pulse" />
        </div>

        {/* Band 2 Skeleton — 4 rows */}
        <div className="bg-surface rounded-xl shadow-sm p-6">
          <div className="h-5 bg-border-light rounded w-24 mb-6 animate-pulse" />
          {[...Array(4)].map((_, i) => (
            <div key={i} className="mb-6">
              <div className="flex justify-between mb-1">
                <div className="h-4 bg-border-light rounded w-16 animate-pulse" />
                <div className="h-4 bg-border-light rounded w-12 animate-pulse" />
              </div>
              <div className="h-2 bg-surface-2 rounded-full overflow-hidden">
                <div className="h-full bg-border-light rounded-full animate-pulse" style={{ width: '60%' }} />
              </div>
            </div>
          ))}
        </div>

        {/* Band 3 Skeleton */}
        <div className="bg-surface rounded-xl shadow-sm p-6">
          <div className="h-4 bg-border-light rounded w-full mb-2 animate-pulse" />
          <div className="h-4 bg-border-light rounded w-3/4 mb-2 animate-pulse" />
          <div className="h-4 bg-border-light rounded w-5/6 mb-6 animate-pulse" />
          <div className="h-10 bg-border-light rounded-md w-full animate-pulse" />
        </div>
      </div>
    </main>
  );
}
