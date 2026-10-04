import { Link } from "react-router-dom";

export default function PopularPagesGrid() {
  const popularPages = [
    {
      id: "bookings",
      title: "Bookings",
      desc: "View your trips & passes",
      to: "/bookings",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      id: "destinations",
      title: "Destinations",
      desc: "Explore top outstation spots",
      to: "/packages",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      id: "packages",
      title: "Tour Packages",
      desc: "Find your next getaway",
      to: "/packages",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      id: "offers",
      title: "Offers & Deals",
      desc: "Discover seasonal savings",
      to: "/packages",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="space-y-4 pt-4">
      {/* Section Header */}
      <div className="text-center sm:text-left">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block">
          Quick Recovery
        </span>
        <h3 className="font-extrabold text-lg sm:text-xl text-charcoal dark:text-white">
          Or explore popular pages
        </h3>
      </div>

      {/* 4 Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {popularPages.map((p) => (
          <Link
            key={p.id}
            to={p.to}
            className="group p-4 sm:p-5 rounded-3xl border border-[#E2E8F0] dark:border-[#1E2E42] bg-white dark:bg-[#0E1A29] hover:border-orange/50 dark:hover:border-orange/50 hover:shadow-md hover:shadow-orange/5 transition-all duration-200 flex flex-col justify-between space-y-3 cursor-pointer"
          >
            <div className="w-10 h-10 rounded-2xl bg-orange/10 text-orange border border-orange/20 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
              {p.icon}
            </div>

            <div className="space-y-0.5">
              <h4 className="font-extrabold text-xs sm:text-sm text-charcoal dark:text-white group-hover:text-orange transition-colors">
                {p.title}
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {p.desc}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
