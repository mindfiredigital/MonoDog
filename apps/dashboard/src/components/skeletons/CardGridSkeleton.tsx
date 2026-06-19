export const CardGridSkeleton = ({ cards = 6 }: { cards?: number }) => {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: cards }).map((_, index) => (
        <div
          key={index}
          className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 flex flex-col h-full animate-pulse"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="h-10 w-10 rounded-lg bg-neutral-200" />
            <div className="space-y-2 flex-1">
              <div className="h-4 w-1/2 rounded bg-neutral-200" />
              <div className="h-3 w-1/3 rounded bg-neutral-100" />
            </div>
          </div>

          <div className="space-y-3 flex-1 mt-4">
            <div className="h-3 w-full rounded bg-neutral-100" />
            <div className="h-3 w-5/6 rounded bg-neutral-100" />
            <div className="h-3 w-4/6 rounded bg-neutral-100" />
          </div>

          <div className="mt-6 pt-4 border-t border-neutral-100 flex justify-between">
            <div className="h-4 w-1/4 rounded bg-neutral-200" />
            <div className="h-4 w-1/4 rounded bg-neutral-200" />
          </div>
        </div>
      ))}
    </div>
  );
};
