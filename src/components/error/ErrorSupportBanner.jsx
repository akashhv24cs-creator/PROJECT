import { LINKS } from "../../../index.js";

export default function ErrorSupportBanner() {
  return (
    <div className="rounded-3xl border border-orange/20 bg-orange/[0.03] dark:bg-[#0E1A29] p-6 sm:p-8 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        
        {/* Support Details */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-orange/10 text-orange border border-orange/20 flex items-center justify-center shrink-0">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          <div className="space-y-0.5">
            <h4 className="font-extrabold text-base sm:text-lg text-charcoal dark:text-white">
              Still need help?
            </h4>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Our support team is here for you 24/7. Reach out anytime for immediate booking assistance.
            </p>
          </div>
        </div>

        {/* Support CTA */}
        <a
          href={LINKS.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="self-start sm:self-auto py-3 px-6 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-bold text-xs sm:text-sm transition-all flex items-center gap-2 shrink-0"
        >
          <span>Contact Support</span>
          <span>→</span>
        </a>

      </div>
    </div>
  );
}
