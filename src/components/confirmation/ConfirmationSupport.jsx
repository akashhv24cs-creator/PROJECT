import { LINKS } from "../../../index.js";

export default function ConfirmationSupport() {
  return (
    <div className="rounded-3xl border border-[#E2E8F0] dark:border-[#1E2E42] bg-white dark:bg-[#0E1A29] p-5 sm:p-6 shadow-sm space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 flex items-center justify-center shrink-0">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
        <div>
          <h4 className="font-extrabold text-sm sm:text-base text-charcoal dark:text-white">
            Need Trip Assistance?
          </h4>
          <p className="text-[11px] text-slate-400">
            24/7 Priority Support Concierge
          </p>
        </div>
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
        Need to change your pickup address or coordinate customized stopovers? Contact our dispatch team anytime.
      </p>

      <a
        href={LINKS.whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full py-2.5 px-4 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-bold text-xs transition-all flex items-center justify-center gap-2"
      >
        <span>Chat on WhatsApp</span>
        <span>→</span>
      </a>
    </div>
  );
}
