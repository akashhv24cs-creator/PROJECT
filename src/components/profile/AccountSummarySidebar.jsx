import { Link } from "react-router-dom";
import { LINKS } from "../../../index.js";

export default function AccountSummarySidebar({ stats = {}, statsLoading = false }) {
  const total = stats.total ?? 0;
  const active = stats.active ?? 0;
  const completed = stats.completed ?? 0;
  const cancelled = stats.cancelled ?? 0;
  const totalSpent = stats.totalSpent ?? null;

  return (
    <div className="space-y-6">
      
      {/* 1. ACCOUNT SUMMARY CARD */}
      <div className="rounded-3xl border border-[#E2E8F0] dark:border-[#1E2E42] bg-white dark:bg-[#0E1A29] p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] dark:border-[#1E2E42]">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-orange block">
              Trip Records
            </span>
            <h3 className="font-extrabold text-base sm:text-lg text-charcoal dark:text-white">
              Account Summary
            </h3>
          </div>

          <div className="w-8 h-8 rounded-xl bg-orange/10 text-orange flex items-center justify-center">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="space-y-2.5 text-xs">
          
          {/* Total Bookings */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#F5F7FA] dark:bg-[#152436] border border-[#E2E8F0] dark:border-[#1E2E42]">
            <span className="text-slate-500 dark:text-slate-400 font-medium">
              Total Reservations
            </span>
            <span className="font-mono font-extrabold text-sm text-charcoal dark:text-white">
              {statsLoading ? "—" : total}
            </span>
          </div>

          {/* Upcoming Trips */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-orange/5 dark:bg-orange/10 border border-orange/20">
            <span className="text-orange font-bold">
              Upcoming Trips
            </span>
            <span className="font-mono font-extrabold text-sm text-orange">
              {statsLoading ? "—" : active}
            </span>
          </div>

          {/* Completed Trips */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#F5F7FA] dark:bg-[#152436] border border-[#E2E8F0] dark:border-[#1E2E42]">
            <span className="text-slate-500 dark:text-slate-400 font-medium">
              Completed Journeys
            </span>
            <span className="font-mono font-extrabold text-sm text-emerald-600 dark:text-emerald-400">
              {statsLoading ? "—" : completed}
            </span>
          </div>

          {/* Cancelled Trips */}
          {cancelled > 0 && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#F5F7FA] dark:bg-[#152436] border border-[#E2E8F0] dark:border-[#1E2E42]">
              <span className="text-slate-500 dark:text-slate-400 font-medium">
                Cancelled Bookings
              </span>
              <span className="font-mono font-extrabold text-sm text-slate-400">
                {statsLoading ? "—" : cancelled}
              </span>
            </div>
          )}

          {/* Total Spent (if calculated) */}
          {typeof totalSpent === "number" && totalSpent > 0 && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#F5F7FA] dark:bg-[#152436] border border-[#E2E8F0] dark:border-[#1E2E42]">
              <span className="text-slate-500 dark:text-slate-400 font-medium">
                Total Spent
              </span>
              <span className="font-mono font-extrabold text-sm text-charcoal dark:text-white">
                ₹{totalSpent.toLocaleString("en-IN")}
              </span>
            </div>
          )}

        </div>

        {/* Primary CTA Button */}
        <Link
          to="/bookings"
          className="w-full py-3 px-4 rounded-2xl bg-orange hover:bg-orangeLight text-white font-extrabold text-xs transition-all shadow-md shadow-orange/20 flex items-center justify-center gap-2"
        >
          <span>View My Bookings</span>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </Link>
      </div>

      {/* 2. LOYALTY & REWARDS CARD */}
      <div className="rounded-3xl border border-[#E2E8F0] dark:border-[#1E2E42] bg-white dark:bg-[#0E1A29] p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] dark:border-[#1E2E42]">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-orange block">
              Zenera Club
            </span>
            <h4 className="font-extrabold text-base text-charcoal dark:text-white">
              Loyalty & Perks
            </h4>
          </div>

          <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-extrabold text-charcoal dark:text-white">
              Tier Status: Explorer
            </span>
            <span className="text-orange font-bold">Active</span>
          </div>

          {/* Micro Progress Bar */}
          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-orange to-purple-500 w-3/4 rounded-full" />
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed pt-1">
            Enjoy priority chauffeur dispatch, 24/7 dedicated support, and verified sanitized vehicles on every booking.
          </p>
        </div>
      </div>

      {/* 3. 24/7 CONCIERGE & HELP CARD */}
      <div className="rounded-3xl border border-[#E2E8F0] dark:border-[#1E2E42] bg-white dark:bg-[#0E1A29] p-6 shadow-sm space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center text-base shrink-0">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-charcoal dark:text-white">
              Customer Support
            </h4>
            <p className="text-[11px] text-slate-400">
              Assistance with your account & bookings
            </p>
          </div>
        </div>

        <a
          href={LINKS.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-2.5 px-4 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-bold text-xs transition-all flex items-center justify-center gap-2"
        >
          <span>Chat with Support</span>
          <span>→</span>
        </a>
      </div>

    </div>
  );
}
