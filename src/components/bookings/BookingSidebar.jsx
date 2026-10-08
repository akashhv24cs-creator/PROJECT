import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../context/ThemeContext";
import { LINKS } from "../../../index.js";

export default function BookingSidebar({ unreadCount = 0 }) {
  const location = useLocation();
  const { userProfile, currentUser, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const userName = userProfile?.name
    ? userProfile.name.split(" ")[0]
    : currentUser?.phoneNumber || "Traveler";
  const userInitial = (userProfile?.name?.charAt(0) || "T").toUpperCase();

  const navItems = [
    { label: "Bookings", href: "/bookings", active: true },
    { label: "Tour Packages", href: "/packages" },
    { label: "Destinations", href: "/book" },
    { label: "Offers", href: "/packages", badge: "New" },
    { label: "Wallet", href: "/profile" },
    { label: "Profile", href: "/profile" },
    {
      label: "Help & Support",
      href: `${LINKS.whatsapp}?text=Hello%20Zenera%20Support,%20I%20need%20help%20with%20my%20booking.`,
      external: true,
    },
    { label: "Settings", href: "/profile" },
  ];

  return (
    <>
      {/* ========================================================
          DESKTOP SIDEBAR (Fixed Left on lg+ screens)
         ======================================================== */}
      <aside className="hidden lg:flex flex-col justify-between w-64 xl:w-72 shrink-0 min-h-[calc(100vh-4rem)] border-r border-[#E2E8F0] dark:border-[#1E2E42] bg-white/70 dark:bg-[#07111F]/70 backdrop-blur-xl p-5 sticky top-16 transition-colors duration-200">
        <div className="space-y-6">
          
          {/* User Quick Profile Pill */}
          <div className="p-3.5 rounded-2xl bg-[#F5F7FA] dark:bg-[#0E1A29] border border-[#E2E8F0] dark:border-[#1E2E42] flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-orange/15 border border-orange/30 text-orange font-extrabold flex items-center justify-center text-sm shrink-0">
                {userInitial}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-extrabold text-charcoal dark:text-white truncate">
                  {userName}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                  {currentUser?.phoneNumber || "Verified Traveler"}
                </p>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-white dark:bg-[#152436] border border-[#E2E8F0] dark:border-[#1E2E42] text-slate-600 dark:text-slate-300 hover:text-orange dark:hover:text-orange text-xs transition-colors cursor-pointer"
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5" aria-label="Sidebar Navigation">
            {navItems.map((item) => {
              const isActive = item.active || location.pathname === item.href;

              if (item.external) {
                return (
                  <a
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5 hover:text-charcoal dark:hover:text-white transition-all cursor-pointer group"
                  >
                    <span>{item.label}</span>
                    <span className="text-[10px] text-slate-400 group-hover:text-orange">→</span>
                  </a>
                );
              }

              return (
                <Link
                  key={item.label}
                  to={item.href}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? "bg-orange text-white shadow-md shadow-orange/25 font-extrabold"
                      : "text-slate-600 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5 hover:text-charcoal dark:hover:text-white"
                  }`}
                >
                  <span>{item.label}</span>

                  {item.badge && (
                    <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-full bg-emerald-500 text-white">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Assistance Card */}
        <div className="pt-4 border-t border-[#E2E8F0] dark:border-[#1E2E42] space-y-3">
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-orange/10 to-orange/5 border border-orange/20 text-xs">
            <div className="flex items-center gap-2 text-orange font-extrabold mb-1">
              <span>24/7 Trip Support</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
              Got changes in itinerary or pickup timing? Contact our dispatch team instantly.
            </p>
          </div>

          <button
            type="button"
            onClick={logout}
            className="w-full py-2 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#1E2E42] hover:bg-rose-500/10 hover:border-rose-500/30 hover:text-rose-600 dark:hover:text-rose-400 text-slate-500 dark:text-slate-400 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ========================================================
          MOBILE BOTTOM NAVIGATION (Visible only on < lg screens)
         ======================================================== */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#07111F]/95 backdrop-blur-lg border-t border-[#E2E8F0] dark:border-[#1E2E42] px-4 py-2 flex items-center justify-around shadow-lg">
        <Link
          to="/"
          className="flex flex-col items-center gap-1 text-[11px] font-bold text-slate-500 dark:text-slate-400 hover:text-orange"
        >
          <span>Home</span>
        </Link>
        <Link
          to="/bookings"
          className="flex flex-col items-center gap-1 text-[11px] font-bold text-orange"
        >
          <span className="relative">
            Bookings
            <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-orange rounded-full" />
          </span>
        </Link>
        <Link
          to="/packages"
          className="flex flex-col items-center gap-1 text-[11px] font-bold text-slate-500 dark:text-slate-400 hover:text-orange"
        >
          <span>Explore</span>
        </Link>
        <Link
          to="/profile"
          className="flex flex-col items-center gap-1 text-[11px] font-bold text-slate-500 dark:text-slate-400 hover:text-orange"
        >
          <span>Profile</span>
        </Link>
      </div>
    </>
  );
}
