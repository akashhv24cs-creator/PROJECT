export default function NotificationSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start animate-pulse">
      
      {/* Left Feed Skeleton (68%) */}
      <div className="lg:col-span-8 space-y-6">
        <div className="h-10 bg-white dark:bg-[#0E1A29] border border-[#E2E8F0] dark:border-[#1E2E42] rounded-2xl" />
        
        <div className="space-y-3">
          <div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded" />
          
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="p-5 rounded-3xl border border-[#E2E8F0] dark:border-[#1E2E42] bg-white dark:bg-[#0E1A29] flex items-start gap-4"
            >
              <div className="w-10 h-10 rounded-2xl bg-slate-200 dark:bg-slate-800 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="flex justify-between">
                  <div className="h-4 w-44 bg-slate-200 dark:bg-slate-800 rounded" />
                  <div className="h-3 w-16 bg-slate-200 dark:bg-slate-800 rounded" />
                </div>
                <div className="h-3 w-3/4 bg-slate-200 dark:bg-slate-800 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Context Panel Skeleton (32%) */}
      <div className="lg:col-span-4 space-y-6">
        <div className="h-48 rounded-3xl bg-white dark:bg-[#0E1A29] border border-[#E2E8F0] dark:border-[#1E2E42]" />
        <div className="h-64 rounded-3xl bg-white dark:bg-[#0E1A29] border border-[#E2E8F0] dark:border-[#1E2E42]" />
      </div>

    </div>
  );
}
