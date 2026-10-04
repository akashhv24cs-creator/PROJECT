export default function ProfileSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      
      {/* Header Skeleton */}
      <div className="rounded-3xl border border-[#E2E8F0] dark:border-[#1E2E42] bg-white dark:bg-[#0E1A29] p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-24 h-24 rounded-full bg-slate-200 dark:bg-slate-800 shrink-0" />
            <div className="space-y-3">
              <div className="h-6 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg" />
              <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="h-3 w-40 bg-slate-200 dark:bg-slate-800 rounded" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 w-full sm:w-auto">
            <div className="h-16 w-28 bg-slate-100 dark:bg-slate-800 rounded-2xl" />
            <div className="h-16 w-28 bg-slate-100 dark:bg-slate-800 rounded-2xl" />
            <div className="h-16 w-28 bg-slate-100 dark:bg-slate-800 rounded-2xl" />
          </div>
        </div>
      </div>

      {/* Tabs & Content Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column Skeleton (68%) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="h-12 bg-white dark:bg-[#0E1A29] border border-[#E2E8F0] dark:border-[#1E2E42] rounded-2xl" />
          <div className="h-96 bg-white dark:bg-[#0E1A29] border border-[#E2E8F0] dark:border-[#1E2E42] rounded-3xl" />
        </div>

        {/* Right Column Skeleton (32%) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="h-64 bg-white dark:bg-[#0E1A29] border border-[#E2E8F0] dark:border-[#1E2E42] rounded-3xl" />
          <div className="h-44 bg-white dark:bg-[#0E1A29] border border-[#E2E8F0] dark:border-[#1E2E42] rounded-3xl" />
        </div>

      </div>

    </div>
  );
}
