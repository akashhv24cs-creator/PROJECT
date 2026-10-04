export default function BookingDetailSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-pulse">
      
      {/* Left Column (Cols 1-8 / 67%) */}
      <div className="lg:col-span-8 space-y-6">
        
        {/* Hero Card Skeleton */}
        <div className="rounded-3xl border border-[#E2E8F0] dark:border-[#1E2E42] bg-white dark:bg-[#0E1A29] overflow-hidden">
          <div className="h-48 sm:h-60 bg-slate-200 dark:bg-slate-800" />
          <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-3 w-16 bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="h-5 w-24 bg-slate-200 dark:bg-slate-800 rounded" />
              </div>
            ))}
          </div>
        </div>

        {/* Route Timeline Skeleton */}
        <div className="rounded-3xl border border-[#E2E8F0] dark:border-[#1E2E42] bg-white dark:bg-[#0E1A29] p-6 space-y-4">
          <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="h-20 bg-slate-100 dark:bg-slate-800/60 rounded-2xl" />
        </div>

        {/* 4-Item Info Grid Skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-[#E2E8F0] dark:border-[#1E2E42] bg-white dark:bg-[#0E1A29] p-4 space-y-2"
            >
              <div className="h-3 w-12 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="h-5 w-20 bg-slate-200 dark:bg-slate-800 rounded" />
            </div>
          ))}
        </div>

        {/* Passenger & Seat Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-3xl border border-[#E2E8F0] dark:border-[#1E2E42] bg-white dark:bg-[#0E1A29] p-6 h-40" />
          <div className="rounded-3xl border border-[#E2E8F0] dark:border-[#1E2E42] bg-white dark:bg-[#0E1A29] p-6 h-40" />
        </div>

        {/* Payment Summary Skeleton */}
        <div className="rounded-3xl border border-[#E2E8F0] dark:border-[#1E2E42] bg-white dark:bg-[#0E1A29] p-6 space-y-4">
          <div className="h-4 w-36 bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="h-20 bg-slate-100 dark:bg-slate-800 rounded-2xl" />
            <div className="h-20 bg-slate-100 dark:bg-slate-800 rounded-2xl" />
            <div className="h-20 bg-slate-100 dark:bg-slate-800 rounded-2xl" />
          </div>
        </div>

      </div>

      {/* Right Column Skeleton (Cols 9-12 / 33%) */}
      <div className="lg:col-span-4 space-y-6">
        <div className="rounded-3xl border border-[#E2E8F0] dark:border-[#1E2E42] bg-white dark:bg-[#0E1A29] p-6 h-36" />
        <div className="rounded-3xl border border-[#E2E8F0] dark:border-[#1E2E42] bg-white dark:bg-[#0E1A29] p-6 h-48" />
        <div className="rounded-3xl border border-[#E2E8F0] dark:border-[#1E2E42] bg-white dark:bg-[#0E1A29] p-6 h-36" />
      </div>

    </div>
  );
}
