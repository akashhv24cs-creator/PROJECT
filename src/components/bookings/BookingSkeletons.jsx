export default function BookingSkeletons({ count = 3 }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-3xl border border-[#E2E8F0] dark:border-[#1E2E42] bg-white dark:bg-[#0E1A29] p-4 sm:p-5 shadow-sm animate-pulse"
        >
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
            
            {/* Left side */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto flex-1">
              
              {/* Thumbnail skeleton */}
              <div className="w-full sm:w-40 h-32 sm:h-28 rounded-2xl bg-slate-200 dark:bg-slate-800 shrink-0" />

              {/* Text content skeleton */}
              <div className="space-y-2.5 flex-1 w-full">
                <div className="flex items-center gap-2">
                  <div className="w-20 h-5 rounded-full bg-slate-200 dark:bg-slate-800" />
                  <div className="w-24 h-5 rounded-md bg-slate-200 dark:bg-slate-800" />
                </div>

                <div className="w-48 sm:w-64 h-6 rounded-lg bg-slate-200 dark:bg-slate-800" />

                <div className="flex items-center gap-4">
                  <div className="w-24 h-4 rounded bg-slate-200 dark:bg-slate-800" />
                  <div className="w-16 h-4 rounded bg-slate-200 dark:bg-slate-800" />
                  <div className="w-20 h-4 rounded bg-slate-200 dark:bg-slate-800 hidden sm:block" />
                </div>
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center justify-between w-full lg:w-auto pt-3 lg:pt-0 border-t lg:border-t-0 border-[#E2E8F0] dark:border-[#1E2E42] gap-4">
              <div className="space-y-1">
                <div className="w-16 h-3 rounded bg-slate-200 dark:bg-slate-800" />
                <div className="w-24 h-6 rounded-lg bg-slate-200 dark:bg-slate-800" />
              </div>

              <div className="flex items-center gap-2">
                <div className="w-20 h-9 rounded-xl bg-slate-200 dark:bg-slate-800" />
                <div className="w-28 h-9 rounded-xl bg-slate-200 dark:bg-slate-800" />
              </div>
            </div>

          </div>
        </div>
      ))}
    </div>
  );
}
