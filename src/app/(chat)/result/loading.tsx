export default function ResultLoading() {
  return (
    <main className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="max-w-[640px] mx-auto space-y-8">
        {/* Band 1 Skeleton */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="h-4 bg-gray-200 rounded w-32 mb-4 animate-pulse" />
          <div className="flex items-end gap-2 mb-3">
            <div className="h-10 bg-gray-200 rounded w-24 animate-pulse" />
            <div className="h-6 bg-gray-200 rounded-full w-20 animate-pulse" />
          </div>
          <div className="h-4 bg-gray-200 rounded w-64 animate-pulse" />
        </div>

        {/* Band 2 Skeleton — 4 rows */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="h-5 bg-gray-200 rounded w-24 mb-6 animate-pulse" />
          {[...Array(4)].map((_, i) => (
            <div key={i} className="mb-6">
              <div className="flex justify-between mb-1">
                <div className="h-4 bg-gray-200 rounded w-16 animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-12 animate-pulse" />
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-gray-200 rounded-full animate-pulse" style={{ width: '60%' }} />
              </div>
            </div>
          ))}
        </div>

        {/* Band 3 Skeleton */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="h-4 bg-gray-200 rounded w-full mb-2 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-5/6 mb-6 animate-pulse" />
          <div className="h-10 bg-gray-200 rounded-md w-full animate-pulse" />
        </div>
      </div>
    </main>
  );
}
