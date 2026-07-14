export const DetailHeaderSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-8 animate-pulse">
        <div className="flex justify-between items-start">
          <div className="space-y-4 w-1/2">
            <div className="h-8 w-3/4 rounded bg-neutral-200" />
            <div className="h-4 w-1/2 rounded bg-neutral-100" />

            <div className="flex gap-4 mt-6">
              <div className="h-6 w-20 rounded-full bg-neutral-200" />
              <div className="h-6 w-24 rounded-full bg-neutral-200" />
            </div>
          </div>

          <div className="flex gap-3">
            <div className="h-10 w-24 rounded bg-neutral-200" />
            <div className="h-10 w-24 rounded bg-neutral-200" />
          </div>
        </div>
      </div>

      {/* Content Area Skeleton */}
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 animate-pulse">
            <div className="h-6 w-1/3 rounded bg-neutral-200 mb-6" />
            <div className="space-y-3">
              <div className="h-4 w-full rounded bg-neutral-100" />
              <div className="h-4 w-5/6 rounded bg-neutral-100" />
              <div className="h-4 w-4/6 rounded bg-neutral-100" />
            </div>
          </div>
        </div>

        <div className="col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 animate-pulse">
            <div className="h-6 w-1/2 rounded bg-neutral-200 mb-6" />
            <div className="space-y-4">
              <div className="flex justify-between">
                <div className="h-4 w-1/3 rounded bg-neutral-100" />
                <div className="h-4 w-1/4 rounded bg-neutral-200" />
              </div>
              <div className="flex justify-between">
                <div className="h-4 w-1/3 rounded bg-neutral-100" />
                <div className="h-4 w-1/4 rounded bg-neutral-200" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
