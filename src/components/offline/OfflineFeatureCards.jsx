import { Link } from "react-router-dom";

export default function OfflineFeatureCards() {
  const offlineFeatures = [
    {
      id: "bookings",
      title: "My Bookings",
      desc: "View your cached reservations",
      to: "/bookings",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      id: "tickets",
      title: "E-Tickets",
      desc: "Access downloaded passes",
      to: "/bookings",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
        </svg>
      ),
    },
    {
      id: "packages",
      title: "Saved Packages",
      desc: "Browse offline destinations",
      to: "/packages",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
    },
    {
      id: "guidelines",
      title: "Travel Info",
      desc: "Important travel guidelines",
      to: "/",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="space-y-4 pt-4">
      {/* Header */}
      <div className="text-center sm:text-left">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block">
          Offline Access
        </span>
        <h3 className="font-extrabold text-lg sm:text-xl text-charcoal dark:text-white">
          You can still access
        </h3>
      </div>

      {/* 4 Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {offlineFeatures.map((f) => (
          <Link
            key={f.id}
            to={f.to}
            className="group p-4 sm:p-5 rounded-3xl border border-[#E2E8F0] dark:border-[#1E2E42] bg-white dark:bg-[#0E1A29] hover:border-orange/50 dark:hover:border-orange/50 hover:shadow-md hover:shadow-orange/5 transition-all duration-200 flex flex-col justify-between space-y-3 cursor-pointer"
          >
            <div className="w-10 h-10 rounded-2xl bg-orange/10 text-orange border border-orange/20 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
              {f.icon}
            </div>

            <div className="space-y-0.5">
              <h4 className="font-extrabold text-xs sm:text-sm text-charcoal dark:text-white group-hover:text-orange transition-colors">
                {f.title}
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {f.desc}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
