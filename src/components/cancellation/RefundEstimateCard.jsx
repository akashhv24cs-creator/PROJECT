export default function RefundEstimateCard() {
  return (
    <div className="rounded-3xl border border-[#E2E8F0] dark:border-[#1E2E42] bg-white dark:bg-[#0E1A29] p-5 sm:p-6 shadow-sm space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center justify-center shrink-0">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h4 className="font-extrabold text-sm sm:text-base text-charcoal dark:text-white">
            Estimated Refund Time
          </h4>
          <p className="text-[11px] text-slate-400">
            Standard Banking Cycles
          </p>
        </div>
      </div>

      <div className="p-3.5 rounded-2xl bg-[#F5F7FA] dark:bg-[#152436] border border-[#E2E8F0] dark:border-[#1E2E42] text-center space-y-0.5">
        <span className="font-mono font-extrabold text-lg text-charcoal dark:text-white">
          1–3 Business Days
        </span>
        <p className="text-[10px] text-slate-400">
          UPI settlements typically clear within 2–4 hours
        </p>
      </div>

      <p className="text-[11px] text-slate-400 leading-relaxed">
        You will receive an automated email and WhatsApp alert as soon as the gateway processes your transfer advice.
      </p>
    </div>
  );
}
