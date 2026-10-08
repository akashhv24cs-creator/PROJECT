import { LINKS } from "../../../index.js";

export default function CheckoutSecuritySupport() {
  return (
    <div className="space-y-5">

      {/* 2. INSTANT CONFIRMATION CARD */}
      <div className="rounded-3xl border border-[#E2E8F0] dark:border-[#1E2E42] bg-white dark:bg-[#0E1A29] p-5 sm:p-6 shadow-sm space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-orange/10 text-orange border border-orange/20 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-charcoal dark:text-white">
              Instant Confirmation
            </h4>
            <p className="text-[11px] text-slate-400">
              Immediate digital trip pass
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          Your reservation is confirmed instantly upon successful deposit. Chauffeur details and live tracking will be assigned prior to departure.
        </p>
      </div>

      {/* 3. 24/7 SUPPORT CARD */}
      <div className="rounded-3xl border border-[#E2E8F0] dark:border-[#1E2E42] bg-white dark:bg-[#0E1A29] p-5 sm:p-6 shadow-sm space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-charcoal dark:text-white">
              Need Help?
            </h4>
            <p className="text-[11px] text-slate-400">
              24/7 Dispatch Desk
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          Have questions regarding your payment or custom itinerary? Contact our priority support concierge.
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

    </div>
  );
}
