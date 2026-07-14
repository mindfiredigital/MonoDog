export const TableSkeleton = ({ rows = 5 }: { rows?: number }) => {
  return (
    <div className="w-full bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
      {/* Header Skeleton */}
      <div className="bg-neutral-50 px-6 py-4 border-b border-neutral-200 flex justify-between items-center">
        <div className="flex gap-4 w-full">
          <div className="h-4 w-1/4 rounded bg-neutral-200 animate-pulse" />
          <div className="h-4 w-1/4 rounded bg-neutral-200 animate-pulse" />
          <div className="h-4 w-1/4 rounded bg-neutral-200 animate-pulse" />
          <div className="h-4 w-1/4 rounded bg-neutral-200 animate-pulse" />
        </div>
      </div>

      {/* Rows Skeleton */}
      <div className="divide-y divide-neutral-200">
        {Array.from({ length: rows }).map((_, index) => (
          <div
            key={index}
            className="px-6 py-4 flex justify-between items-center bg-white"
          >
            <div className="flex items-center gap-3 w-full">
              <div className="h-8 w-8 rounded-full bg-neutral-200 animate-pulse" />
              <div className="space-y-2 w-full">
                <div className="h-4 w-1/3 rounded bg-neutral-200 animate-pulse" />
                <div className="h-3 w-1/4 rounded bg-neutral-100 animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
