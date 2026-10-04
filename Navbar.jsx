import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LINKS } from "./index.js";
import { useAuth } from "./src/hooks/useAuth";
import { useTheme } from "./src/context/ThemeContext";
import { subscribeToUserNotifications } from "./src/services/notification.service";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [unreadNotifsCount, setUnreadNotifsCount] = useState(0);
  const settingsRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, userProfile, currentUser, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  // Close menus on route change
  useEffect(() => {
    setSettingsOpen(false);
    setMenuOpen(false);
  }, [location.pathname]);

  // Outside click listener for Settings popup
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target)) {
        setSettingsOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setSettingsOpen(false);
    };

    if (settingsOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [settingsOpen]);

  // Real-time unread notifications subscription for badge
  useEffect(() => {
    if (!currentUser?.uid) {
      setUnreadNotifsCount(0);
      return () => {};
    }

    const unsubscribe = subscribeToUserNotifications(
      currentUser.uid,
      (notifs) => {
        const unread = notifs.filter((n) => !n.read).length;
        setUnreadNotifsCount(unread);
      },
      () => {}
    );

    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, [currentUser?.uid]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNav = (href) => {
    setMenuOpen(false);
    if (href.startsWith("#")) {
      if (location.pathname !== "/") {
        navigate(`/${href}`);
        return;
      }
      const el = document.querySelector(href);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
        return;
      }
    }
    navigate(href);
  };

  const userInitial = (userProfile?.name || currentUser?.phoneNumber || "U")
    .charAt(0)
    .toUpperCase();
  const userShortName = userProfile?.name
    ? userProfile.name.split(" ")[0]
    : "Profile";

  const isHome = location.pathname === "/";
  const isBookings =
    location.pathname === "/bookings" || location.pathname.startsWith("/booking");
  const isDashboard =
    location.pathname === "/dashboard" || location.pathname === "/profile";
  const isPackages =
    location.pathname === "/packages" || location.pathname === "/tour-packages";
  const isProfile = location.pathname === "/profile";
  const isNotifications = location.pathname === "/notifications";
  const isLogin = location.pathname === "/login";

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        scrolled
          ? "bg-white/95 dark:bg-[#07111F]/95 backdrop-blur-md border-b border-[#E2E8F0] dark:border-[#1E2E42] shadow-sm shadow-black/5 dark:shadow-black/40"
          : "bg-white/80 dark:bg-[#07111F]/80 backdrop-blur-sm border-b border-[#E2E8F0]/70 dark:border-[#1E2E42]/60"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          
          {/* Logo & Brand Lockup */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl overflow-hidden shadow-sm flex items-center justify-center bg-black/5 dark:bg-white/5 border border-[#E2E8F0]/80 dark:border-[#1E2E42]">
              <img
                src="/favicon.svg"
                alt="Zenera Trips Logo"
                className="w-full h-full object-contain p-0.5 group-hover:scale-105 transition-transform duration-200"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-heading font-extrabold text-lg sm:text-xl text-charcoal dark:text-white tracking-tight leading-none group-hover:text-orange transition-colors">
                Zenera Trips
              </span>
              <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 tracking-wider uppercase leading-tight mt-0.5 hidden sm:block">
                Travel & Outstation
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-7">
            <Link
              to="/"
              className={`relative py-1.5 text-xs font-semibold tracking-wide transition-colors duration-150 ${
                isHome
                  ? "text-orange"
                  : "text-slate-600 dark:text-slate-300 hover:text-charcoal dark:hover:text-white"
              }`}
            >
              <span>Home</span>
              {isHome && (
                <motion.div
                  layoutId="nav-underline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange rounded-full"
                />
              )}
            </Link>

            <Link
              to="/destinations"
              className={`relative py-1.5 text-xs font-semibold tracking-wide transition-colors duration-150 ${
                location.pathname.startsWith("/destination")
                  ? "text-orange"
                  : "text-slate-600 dark:text-slate-300 hover:text-charcoal dark:hover:text-white"
              }`}
            >
              <span>Destinations</span>
              {location.pathname.startsWith("/destination") && (
                <motion.div
                  layoutId="nav-underline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange rounded-full"
                />
              )}
            </Link>

            <Link
              to="/fleets"
              className={`relative py-1.5 text-xs font-semibold tracking-wide transition-colors duration-150 ${
                location.pathname === "/fleets" || location.pathname === "/book"
                  ? "text-orange"
                  : "text-slate-600 dark:text-slate-300 hover:text-charcoal dark:hover:text-white"
              }`}
            >
              <span>Fleets</span>
              {(location.pathname === "/fleets" || location.pathname === "/book") && (
                <motion.div
                  layoutId="nav-underline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange rounded-full"
                />
              )}
            </Link>

            <Link
              to={isAuthenticated ? "/bookings" : "/login?redirect=/bookings"}
              className={`relative py-1.5 text-xs font-semibold tracking-wide transition-colors duration-150 ${
                isBookings
                  ? "text-orange"
                  : "text-slate-600 dark:text-slate-300 hover:text-charcoal dark:hover:text-white"
              }`}
            >
              <span>Bookings</span>
              {isBookings && (
                <motion.div
                  layoutId="nav-underline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange rounded-full"
                />
              )}
            </Link>

            <Link
              to={isAuthenticated ? "/dashboard" : "/login?redirect=/dashboard"}
              className={`relative py-1.5 text-xs font-semibold tracking-wide transition-colors duration-150 ${
                isDashboard
                  ? "text-orange"
                  : "text-slate-600 dark:text-slate-300 hover:text-charcoal dark:hover:text-white"
              }`}
            >
              <span>Dashboard</span>
              {isDashboard && (
                <motion.div
                  layoutId="nav-underline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange rounded-full"
                />
              )}
            </Link>

          </nav>

          {/* Desktop Right Actions: Auth, CTA & Settings */}
          <div className="hidden lg:flex items-center gap-3">
            
            {/* My Profile / Login Button */}
            {isAuthenticated ? (
              <Link
                to="/profile"
                className={`text-xs font-semibold transition-all duration-200 flex items-center gap-2 px-3.5 py-2 rounded-xl border ${
                  isProfile
                    ? "bg-orange/10 border-orange/40 text-orange"
                    : "bg-slate-100 dark:bg-[#0E1A29] border-[#E2E8F0] dark:border-[#1E2E42] hover:border-orange/40 text-charcoal dark:text-white"
                }`}
              >
                {userProfile?.photoURL ? (
                  <img
                    src={userProfile.photoURL}
                    alt={userShortName}
                    className="w-5 h-5 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-orange/20 text-orange flex items-center justify-center text-[10px] font-bold shrink-0">
                    {userInitial}
                  </div>
                )}
                <span>{userShortName}</span>
              </Link>
            ) : (
              <Link
                to="/login"
                className={`text-xs font-semibold transition-all duration-200 px-4 py-2 rounded-xl border ${
                  isLogin
                    ? "bg-orange/10 border-orange/50 text-orange"
                    : "bg-slate-100 dark:bg-[#0E1A29] hover:bg-slate-200 dark:hover:bg-[#152436] border-[#E2E8F0] dark:border-[#1E2E42] text-charcoal dark:text-white"
                }`}
              >
                Login
              </Link>
            )}

            {/* Primary Action CTA */}
            <Link
              to="/book"
              className="px-4 py-2 rounded-xl bg-orange hover:bg-orangeLight text-white text-xs font-bold transition-all duration-200 shadow-md shadow-orange/20 flex items-center gap-1.5 cursor-pointer"
            >
              <span>Book Your Trip</span>
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </Link>

            {/* Settings Trigger & Pop-up Window */}
            <div className="relative" ref={settingsRef}>
              <button
                type="button"
                onClick={() => setSettingsOpen((prev) => !prev)}
                className={`relative p-2.5 rounded-xl border transition-all duration-200 cursor-pointer shadow-sm flex items-center justify-center ${
                  settingsOpen
                    ? "bg-orange/15 border-orange/50 text-orange shadow-orange/10"
                    : "bg-slate-100 dark:bg-[#0E1A29] border-[#E2E8F0] dark:border-[#1E2E42] text-slate-700 dark:text-slate-200 hover:text-orange dark:hover:text-orange hover:border-orange/40 dark:hover:border-orange/40"
                }`}
                aria-label="Settings and Preferences"
                title="Settings & Preferences"
              >
                <svg
                  className={`transition-transform duration-300 ${
                    settingsOpen ? "rotate-90 text-orange" : "text-slate-700 dark:text-slate-200"
                  }`}
                  style={{ width: "20px", height: "20px", minWidth: "20px", minHeight: "20px" }}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
                {unreadNotifsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-orange ring-2 ring-white dark:ring-[#07111F] animate-pulse" />
                )}
              </button>

              {/* Settings Pop-up Window */}
              <AnimatePresence>
                {settingsOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -8 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    className="absolute right-0 top-full mt-2.5 w-72 sm:w-80 rounded-2xl bg-white/95 dark:bg-[#0E1A29]/95 backdrop-blur-xl border border-[#E2E8F0] dark:border-[#1E2E42] shadow-2xl shadow-black/15 dark:shadow-black/60 p-4 z-50 overflow-hidden"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#E2E8F0] dark:border-[#1E2E42]">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-orange/10 text-orange flex items-center justify-center">
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <circle cx="12" cy="12" r="3" />
                            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                          </svg>
                        </div>
                        <span className="text-xs font-bold text-charcoal dark:text-white uppercase tracking-wider">
                          Preferences
                        </span>
                      </div>
                      <button
                        onClick={() => setSettingsOpen(false)}
                        className="p-1 rounded-lg text-slate-400 hover:text-charcoal dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                        aria-label="Close settings"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </div>

                    {/* Pop-up Options List */}
                    <div className="space-y-2">
                      {/* 1. Theme Switcher */}
                      <div
                        onClick={toggleTheme}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-[#152436] transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-[#1E2E42] flex items-center justify-center text-slate-700 dark:text-slate-300 group-hover:text-orange transition-colors">
                            {isDark ? (
                              <svg className="w-4 h-4 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="4" fill="currentColor" />
                                <line x1="12" y1="2" x2="12" y2="4" />
                                <line x1="12" y1="20" x2="12" y2="22" />
                                <line x1="4.93" y1="4.93" x2="6.34" y2="6.34" />
                                <line x1="17.66" y1="17.66" x2="19.07" y2="19.07" />
                                <line x1="2" y1="12" x2="4" y2="12" />
                                <line x1="20" y1="12" x2="22" y2="12" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4 text-slate-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="currentColor" fillOpacity="0.2" />
                              </svg>
                            )}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-charcoal dark:text-white">
                              {isDark ? "Dark Mode" : "Light Mode"}
                            </p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400">
                              {isDark ? "Sleek night theme" : "Crisp daylight theme"}
                            </p>
                          </div>
                        </div>

                        {/* Interactive Toggle Pill */}
                        <div
                          className={`w-10 h-5 rounded-full p-0.5 transition-colors duration-200 flex items-center ${
                            isDark ? "bg-orange justify-end" : "bg-slate-300 dark:bg-slate-700 justify-start"
                          }`}
                        >
                          <motion.div
                            layout
                            className="w-4 h-4 rounded-full bg-white shadow-xs"
                          />
                        </div>
                      </div>

                      {/* 2. Notifications Link */}
                      <Link
                        to="/notifications"
                        onClick={() => setSettingsOpen(false)}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-[#152436] transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-[#1E2E42] flex items-center justify-center text-slate-700 dark:text-slate-300 group-hover:text-orange transition-colors">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-charcoal dark:text-white">
                              Notifications
                            </p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400">
                              Trip alerts & updates
                            </p>
                          </div>
                        </div>

                        {unreadNotifsCount > 0 ? (
                          <span className="px-2 py-0.5 rounded-full bg-orange text-white text-[10px] font-mono font-bold">
                            {unreadNotifsCount} new
                          </span>
                        ) : (
                          <svg className="w-4 h-4 text-slate-400 group-hover:text-orange transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="9 18 15 12 9 6" />
                          </svg>
                        )}
                      </Link>

                      {/* 3. My Bookings Link */}
                      <Link
                        to={isAuthenticated ? "/bookings" : "/login?redirect=/bookings"}
                        onClick={() => setSettingsOpen(false)}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-[#152436] transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-[#1E2E42] flex items-center justify-center text-slate-700 dark:text-slate-300 group-hover:text-orange transition-colors">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                              <line x1="16" y1="2" x2="16" y2="6" />
                              <line x1="8" y1="2" x2="8" y2="6" />
                              <line x1="3" y1="10" x2="21" y2="10" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-charcoal dark:text-white">
                              My Bookings
                            </p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400">
                              View upcoming & past trips
                            </p>
                          </div>
                        </div>
                        <svg className="w-4 h-4 text-slate-400 group-hover:text-orange transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </Link>
                    </div>

                    {/* Footer / Account Action */}
                    {isAuthenticated && (
                      <div className="mt-3 pt-3 border-t border-[#E2E8F0] dark:border-[#1E2E42] flex items-center justify-between">
                        <Link
                          to="/profile"
                          onClick={() => setSettingsOpen(false)}
                          className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:text-orange transition-colors"
                        >
                          Account Profile
                        </Link>
                        <button
                          onClick={() => {
                            setSettingsOpen(false);
                            if (typeof logout === "function") logout();
                          }}
                          className="text-[11px] font-bold text-red-500 hover:text-red-600 transition-colors cursor-pointer"
                        >
                          Sign Out
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Mobile Right Controls: Settings Cog & Hamburger Menu */}
          <div className="flex items-center gap-2 lg:hidden">
            {/* Mobile Settings Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setSettingsOpen((prev) => !prev)}
                className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
                  settingsOpen
                    ? "bg-orange/15 border-orange/50 text-orange"
                    : "bg-slate-100 dark:bg-[#0E1A29] border-[#E2E8F0] dark:border-[#1E2E42] text-slate-700 dark:text-slate-200 hover:text-orange"
                }`}
                aria-label="Settings and Preferences"
                title="Settings"
              >
                <svg
                  style={{ width: "18px", height: "18px", minWidth: "18px", minHeight: "18px" }}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
                {unreadNotifsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-orange ring-2 ring-white dark:ring-[#07111F]" />
                )}
              </button>

              {/* Mobile Settings Pop-up */}
              <AnimatePresence>
                {settingsOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -6 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -6 }}
                    transition={{ duration: 0.18 }}
                    className="absolute right-0 top-full mt-2 w-72 rounded-2xl bg-white/95 dark:bg-[#0E1A29]/95 backdrop-blur-xl border border-[#E2E8F0] dark:border-[#1E2E42] shadow-2xl p-4 z-50"
                  >
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#E2E8F0] dark:border-[#1E2E42]">
                      <span className="text-xs font-bold text-charcoal dark:text-white uppercase tracking-wider">
                        Preferences
                      </span>
                      <button
                        onClick={() => setSettingsOpen(false)}
                        className="p-1 rounded text-slate-400"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="space-y-1.5">
                      <div
                        onClick={toggleTheme}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer"
                      >
                        <span className="text-xs font-semibold text-charcoal dark:text-white">
                          {isDark ? "Dark Theme" : "Light Theme"}
                        </span>
                        <div
                          className={`w-9 h-5 rounded-full p-0.5 flex items-center ${
                            isDark ? "bg-orange justify-end" : "bg-slate-300 justify-start"
                          }`}
                        >
                          <div className="w-3.5 h-3.5 rounded-full bg-white" />
                        </div>
                      </div>
                      <Link
                        to="/notifications"
                        onClick={() => setSettingsOpen(false)}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5"
                      >
                        <span className="text-xs font-semibold text-charcoal dark:text-white">
                          Notifications
                        </span>
                        {unreadNotifsCount > 0 && (
                          <span className="px-1.5 py-0.5 rounded-full bg-orange text-white text-[9px] font-bold">
                            {unreadNotifsCount}
                          </span>
                        )}
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              className="p-2 text-charcoal dark:text-white cursor-pointer rounded-xl bg-slate-100 dark:bg-[#0E1A29] border border-[#E2E8F0] dark:border-[#1E2E42]"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle navigation menu"
            >
              <div
                className={`w-5 h-0.5 bg-current mb-1.5 transition-all duration-300 ${
                  menuOpen ? "rotate-45 translate-y-2" : ""
                }`}
              />
              <div
                className={`w-5 h-0.5 bg-current mb-1.5 transition-all duration-300 ${
                  menuOpen ? "opacity-0" : ""
                }`}
              />
              <div
                className={`w-5 h-0.5 bg-current transition-all duration-300 ${
                  menuOpen ? "-rotate-45 -translate-y-2" : ""
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden bg-white dark:bg-[#07111F] border-t border-[#E2E8F0] dark:border-[#1E2E42] overflow-hidden shadow-2xl"
          >
            <div className="px-5 py-5 space-y-3">
              {isAuthenticated ? (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-100 dark:bg-[#0E1A29] border border-[#E2E8F0] dark:border-[#1E2E42] mb-3">
                  <div className="w-9 h-9 rounded-lg bg-orange/20 border border-orange/40 text-orange flex items-center justify-center font-bold text-sm shrink-0">
                    {userInitial}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-sm text-charcoal dark:text-white truncate">
                      {userProfile?.name || "Traveler"}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate">
                      {userProfile?.phone || currentUser?.phoneNumber || ""}
                    </p>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="text-xs text-orange font-semibold px-2.5 py-1 rounded-lg bg-orange/10 border border-orange/20"
                  >
                    Profile
                  </Link>
                </div>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="block w-full py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-[#0E1A29] border border-[#E2E8F0] dark:border-[#1E2E42] text-center font-bold text-sm text-charcoal dark:text-white mb-2"
                >
                  Login to Account
                </Link>
              )}

              <Link
                to="/"
                onClick={() => setMenuOpen(false)}
                className={`block py-2.5 px-2 text-sm font-semibold border-b border-[#E2E8F0]/60 dark:border-white/5 ${
                  isHome
                    ? "text-orange"
                    : "text-slate-700 dark:text-slate-200"
                }`}
              >
                Home
              </Link>
              <Link
                to="/destinations"
                onClick={() => setMenuOpen(false)}
                className={`block py-2.5 px-2 text-sm font-semibold border-b border-[#E2E8F0]/60 dark:border-white/5 ${
                  location.pathname.startsWith("/destination")
                    ? "text-orange"
                    : "text-slate-700 dark:text-slate-200"
                }`}
              >
                Destinations
              </Link>
              <Link
                to="/fleets"
                onClick={() => setMenuOpen(false)}
                className={`block py-2.5 px-2 text-sm font-semibold border-b border-[#E2E8F0]/60 dark:border-white/5 ${
                  location.pathname === "/fleets" || location.pathname === "/book"
                    ? "text-orange"
                    : "text-slate-700 dark:text-slate-200"
                }`}
              >
                Fleets
              </Link>
              <Link
                to={isAuthenticated ? "/bookings" : "/login?redirect=/bookings"}
                onClick={() => setMenuOpen(false)}
                className={`block py-2.5 px-2 text-sm font-semibold border-b border-[#E2E8F0]/60 dark:border-white/5 ${
                  isBookings
                    ? "text-orange"
                    : "text-slate-700 dark:text-slate-200"
                }`}
              >
                Bookings
              </Link>
              <Link
                to={isAuthenticated ? "/dashboard" : "/login?redirect=/dashboard"}
                onClick={() => setMenuOpen(false)}
                className={`block py-2.5 px-2 text-sm font-semibold border-b border-[#E2E8F0]/60 dark:border-white/5 ${
                  isDashboard
                    ? "text-orange"
                    : "text-slate-700 dark:text-slate-200"
                }`}
              >
                My Dashboard
              </Link>
              {isAuthenticated && (
                <Link
                  to="/notifications"
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center justify-between py-2.5 px-2 text-sm font-semibold border-b border-[#E2E8F0]/60 dark:border-white/5 ${
                    isNotifications
                      ? "text-orange"
                      : "text-slate-700 dark:text-slate-200"
                  }`}
                >
                  <span>Notifications</span>
                  {unreadNotifsCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-orange text-white text-xs font-mono font-bold">
                      {unreadNotifsCount} new
                    </span>
                  )}
                </Link>
              )}
              <button
                onClick={() => handleNav("#about")}
                className="block w-full text-left py-2.5 px-2 text-sm font-semibold text-slate-700 dark:text-slate-200 border-b border-[#E2E8F0]/60 dark:border-white/5 cursor-pointer"
              >
                About Us
              </button>
              <a
                href={LINKS.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMenuOpen(false)}
                className="block py-2.5 px-2 text-sm font-semibold text-slate-700 dark:text-slate-200 border-b border-[#E2E8F0]/60 dark:border-white/5"
              >
                Contact
              </a>

              <div className="pt-3">
                <Link
                  to="/book"
                  onClick={() => setMenuOpen(false)}
                  className="block w-full py-3 rounded-xl bg-orange text-white text-center font-bold text-sm shadow-lg shadow-orange/30 hover:bg-orangeLight transition-all"
                >
                  Book Your Trip
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

