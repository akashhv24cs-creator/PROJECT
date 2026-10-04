export default function SyncStatusBanner({ isOnline }) {
  return (
    <div className="rounded-3xl border border-[#E2E8F0] dark:border-[#1E2E42] bg-white dark:bg-[#0E1A29] p-6 sm:p-8 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        
        {/* Banner Details */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-orange/10 text-orange border border-orange/20 flex items-center justify-center shrink-0">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
            </svg>
          </div>

          <div className="space-y-0.5">
            <h4 className="font-extrabold text-base sm:text-lg text-charcoal dark:text-white">
              Your activity will resume once you're back online
            </h4>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Any pending reservations or profile changes will automatically sync as soon as connectivity is restored.
            </p>
          </div>
        </div>

        {/* Live Indicator */}
        <div className="self-start sm:self-auto flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-[#152436] border border-[#E2E8F0] dark:border-[#1E2E42] text-xs font-bold text-slate-600 dark:text-slate-300 shrink-0">
          <span
            className={`w-2 h-2 rounded-full ${
              isOnline ? "bg-emerald-500" : "bg-amber-500"
            }`}
          />
          <span>{isOnline ? "Sync Ready" : "Awaiting Network"}</span>
        </div>

      </div>
    </div>
  );
}
