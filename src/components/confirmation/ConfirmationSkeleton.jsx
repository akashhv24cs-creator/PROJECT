export default function ConfirmationSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      
      {/* Hero Skeleton */}
      <div className="rounded-3xl border border-[#E2E8F0] dark:border-[#1E2E42] bg-white dark:bg-[#0E1A29] p-10 flex flex-col items-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-800" />
        <div className="h-8 w-64 bg-slate-200 dark:bg-slate-800 rounded-lg" />
        <div className="h-4 w-96 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="h-10 w-40 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
      </div>

      {/* 2-Column Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column (68%) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="h-64 bg-white dark:bg-[#0E1A29] border border-[#E2E8F0] dark:border-[#1E2E42] rounded-3xl" />
          <div className="h-56 bg-white dark:bg-[#0E1A29] border border-[#E2E8F0] dark:border-[#1E2E42] rounded-3xl" />
        </div>

        {/* Right Column (32%) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="h-64 bg-white dark:bg-[#0E1A29] border border-[#E2E8F0] dark:border-[#1E2E42] rounded-3xl" />
          <div className="h-48 bg-white dark:bg-[#0E1A29] border border-[#E2E8F0] dark:border-[#1E2E42] rounded-3xl" />
        </div>

      </div>

    </div>
  );
}
