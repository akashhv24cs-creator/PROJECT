import { useState, useEffect, useMemo, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../../Navbar.jsx";
import Footer from "../../Footer.jsx";
import AIChatAssistantModal from "../components/chat/AIChatAssistantModal.jsx";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../context/ThemeContext";
import { usePageSEO } from "../hooks/usePageSEO";
import { subscribeToUserBookings } from "../services/booking.service";
import { subscribeToUserNotifications } from "../services/notification.service";
import { parseDate } from "../components/bookings/bookingUtils";
import { LINKS } from "../../index.js";

const ACTIVE_STATUSES = [
  "pending",
  "confirmed",
  "driver_assigned",
  "driver_en_route",
  "driver_arrived",
  "trip_started",
  "ongoing",
];

const COMPLETED_STATUSES = ["trip_completed", "completed", "reviewed"];

const CANCELLED_STATUSES = ["cancelled", "refund_pending", "refunded"];

const POPULAR_DESTINATIONS = [
  {
    id: "coorg",
    name: "Coorg",
    state: "Karnataka",
    tagline: "Scotland of India & Coffee Hills",
    image: "/destinations/coorg.jpg",
    distance: "248 km",
    duration: "5.5 hrs",
  },
  {
    id: "ooty",
    name: "Ooty",
    state: "Tamil Nadu",
    tagline: "Queen of Hill Stations",
    image: "/destinations/ooty.jpg",
    distance: "272 km",
    duration: "6 hrs",
  },
  {
    id: "chikmagalur",
    name: "Chikmagalur",
    state: "Karnataka",
    tagline: "Coffee Valleys & Mountain Treks",
    image: "/destinations/chikmagalur.jpg",
    distance: "245 km",
    duration: "4.5 hrs",
  },
  {
    id: "gokarna",
    name: "Gokarna",
    state: "Karnataka",
    tagline: "5-Beach Cliffside Trails",
    image: "/destinations/gokarna.jpg",
    distance: "485 km",
    duration: "8.5 hrs",
  },
];

const formatDate = (ts) => {
  if (!ts) return "Flexible Date";
  const dateObj = parseDate(ts);
  if (!dateObj) return "Flexible Date";

  return dateObj.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export default function Dashboard() {
  const { userProfile, currentUser, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  usePageSEO({
    title: "My Travel Dashboard | Zenera Trips",
    description: "Manage your outstation trips, view bookings, and explore curated tour packages.",
    robots: "noindex, nofollow, noarchive",
  });

  // State Management
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [bookingsError, setBookingsError] = useState(null);

  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);

  const [aiChatModalOpen, setAiChatModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Video State
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [videoError, setVideoError] = useState(false);

  // Dynamic Greeting based on time of day
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  }, []);

  const userName = userProfile?.name
    ? userProfile.name.split(" ")[0]
    : currentUser?.phoneNumber || "Traveler";

  const userInitial = (userProfile?.name?.charAt(0) || "T").toUpperCase();

  // Video Handlers
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const scrollToContent = () => {
    const el = document.getElementById("dashboard-content");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Subscribe to live Firestore bookings & notifications
  useEffect(() => {
    if (!currentUser?.uid) {
      setBookings([]);
      setBookingsLoading(false);
      setNotifications([]);
      setNotificationsLoading(false);
      return;
    }

    setBookingsLoading(true);
    setBookingsError(null);
    setNotificationsLoading(true);

    const unsubscribeBookings = subscribeToUserBookings(
      currentUser.uid,
      (newBookings) => {
        setBookings(newBookings);
        setBookingsError(null);
        setBookingsLoading(false);
      },
      (err) => {
        console.error("SAFE DIAGNOSTIC LOG — Dashboard bookings error:", err);
        setBookingsError("Unable to load live bookings. Showing cached data.");
        setBookingsLoading(false);
      }
    );

    const unsubscribeNotifications = subscribeToUserNotifications(
      currentUser.uid,
      (newNotifications) => {
        setNotifications(newNotifications);
        setNotificationsLoading(false);
      },
      (err) => {
        console.error("SAFE DIAGNOSTIC LOG — Dashboard notifications error:", err);
        setNotificationsLoading(false);
      }
    );

    return () => {
      if (typeof unsubscribeBookings === "function") unsubscribeBookings();
      if (typeof unsubscribeNotifications === "function") unsubscribeNotifications();
    };
  }, [currentUser?.uid]);

  // Derived Bookings Data
  const activeBookings = useMemo(() => {
    return bookings
      .filter((b) => ACTIVE_STATUSES.includes(b.status?.toLowerCase()))
      .sort((a, b) => {
        const getMs = (val) => {
          if (!val) return 0;
          if (val.toDate && typeof val.toDate === "function") return val.toDate().getTime();
          if (val.seconds) return val.seconds * 1000;
          return new Date(val).getTime() || 0;
        };
        return getMs(a.requestedStartDate) - getMs(b.requestedStartDate);
      });
  }, [bookings]);

  const completedBookings = useMemo(() => {
    return bookings.filter((b) => COMPLETED_STATUSES.includes(b.status?.toLowerCase()));
  }, [bookings]);

  return (
    <div className="min-h-screen bg-[#FFFBF7] dark:bg-[#07111F] text-charcoal dark:text-white font-sans selection:bg-orange selection:text-white flex flex-col justify-between transition-colors duration-200">
      
      {/* Top Navbar */}
      <Navbar />

      {/* ========================================================
          1. FULL-SCREEN CINEMATIC VIDEO HERO (Just like Home Page)
         ======================================================== */}
      <section className="relative w-full h-[88vh] sm:h-[92vh] lg:h-[96vh] min-h-[580px] max-h-[1050px] overflow-hidden flex flex-col justify-between bg-[#07111F]">
        
        {/* Cinematic Video Background Layer */}
        <div className="absolute inset-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          
          {/* Scenic Background Fallback Image */}
          <div
            className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat transition-opacity duration-1000"
            style={{
              backgroundImage: "url('/hero-scenic-road.jpg')",
              opacity: isPlaying && !videoError ? 0.3 : 1,
            }}
          />

          {/* Continuous Drone Video Element - 100% HD Crisp Clarity */}
          <video
            ref={videoRef}
            autoPlay
            muted={isMuted}
            loop
            playsInline
            preload="auto"
            poster="/hero-scenic-road.jpg"
            onPlay={() => {
              setIsPlaying(true);
              setVideoError(false);
            }}
            onPause={() => setIsPlaying(false)}
            onError={() => setVideoError(true)}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out ${
              isPlaying && !videoError ? "opacity-100" : "opacity-0"
            }`}
          >
            <source src="/videos/zenera-dashboard.mp4" type="video/mp4" />
            <source src="/videos/hero-montage.mp4" type="video/mp4" />
          </video>

          {/* High-Clarity Contrast Gradient (No Blur, 100% Sharp Video) */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#07111F]/80 via-[#07111F]/40 to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#07111F]/90 via-transparent to-black/30 pointer-events-none" />
        </div>

        {/* 2. Main Hero Content (Left / Center-Left) */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1 flex flex-col justify-center pt-20 sm:pt-24 pb-8">
          <div className="max-w-2xl sm:max-w-3xl text-left space-y-5 sm:space-y-6">
            
            {/* Greeting Pill */}
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-orange/40 bg-orange/20 text-orange text-[11px] font-extrabold uppercase tracking-widest backdrop-blur-md shadow-lg shadow-orange/20">
                <span className="w-1.5 h-1.5 rounded-full bg-orange animate-ping" />
                {greeting}, {userName}
              </span>
            </div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="font-heading font-extrabold text-3xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-[1.12] drop-shadow-md"
            >
              YOUR GROUP.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-orangeLight">
                YOUR RIDE.
              </span>
            </motion.h1>

            {/* Supporting Description */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="text-white/85 text-xs sm:text-sm lg:text-base leading-relaxed max-w-lg font-normal drop-shadow-sm"
            >
              Manage your outstation trips, view live driver passes, or customize your next weekend getaway with verified chauffeurs.
            </motion.p>

            {/* Action CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.32, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center gap-3.5 flex-wrap pt-2"
            >
              {/* Primary CTA: Book a Trip */}
              <Link
                to="/book"
                className="inline-flex items-center gap-2.5 px-6 sm:px-7 py-3.5 sm:py-4 rounded-xl bg-orange hover:bg-orangeLight active:scale-[0.98] text-white font-heading font-bold text-xs sm:text-sm transition-all duration-200 shadow-xl shadow-orange/30 cursor-pointer group"
              >
                <span>Book a Trip</span>
                <svg
                  className="w-4 h-4 group-hover:translate-x-0.5 transition-transform"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </Link>

              {/* Secondary CTA: View My Bookings */}
              <Link
                to="/bookings"
                className="inline-flex items-center gap-2 px-5 sm:px-6 py-3.5 sm:py-4 rounded-xl bg-white/15 hover:bg-white/25 active:scale-[0.98] border border-white/25 text-white font-heading font-semibold text-xs sm:text-sm backdrop-blur-md transition-all duration-200 shadow-md cursor-pointer"
              >
                <span>View My Bookings ({bookingsLoading ? "..." : activeBookings.length})</span>
                <svg
                  className="w-4 h-4 text-white/80"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </Link>
            </motion.div>
          </div>
        </div>

        {/* 3. Bottom Controls & Scroll Indicator */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pb-5 sm:pb-7 flex items-center justify-between">
          
          {/* Video Play/Pause & Audio Mute Controls */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={togglePlay}
              className="p-2.5 rounded-xl bg-black/60 hover:bg-black/80 text-white backdrop-blur-md text-xs cursor-pointer transition-colors shadow-md flex items-center gap-1.5"
              aria-label={isPlaying ? "Pause video" : "Play video"}
            >
              {isPlaying ? (
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
              <span className="text-[11px] font-semibold hidden sm:inline">
                {isPlaying ? "Pause" : "Play"}
              </span>
            </button>
            <button
              type="button"
              onClick={toggleMute}
              className="p-2.5 rounded-xl bg-black/60 hover:bg-black/80 text-white backdrop-blur-md text-xs cursor-pointer transition-colors shadow-md flex items-center gap-1.5"
              aria-label={isMuted ? "Unmute audio" : "Mute audio"}
            >
              {isMuted ? (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
              )}
              <span className="text-[11px] font-semibold hidden sm:inline">
                {isMuted ? "Unmute" : "Mute"}
              </span>
            </button>
          </div>

          {/* Scroll Down Indicator */}
          <button
            type="button"
            onClick={scrollToContent}
            className="flex items-center gap-2 text-white/80 hover:text-white text-xs sm:text-sm font-semibold transition-all duration-200 group cursor-pointer"
            aria-label="Scroll down to dashboard content"
          >
            <span>Explore Dashboard</span>
            <motion.span
              animate={{ y: [0, 4, 0] }}
              transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
              className="w-7 h-7 rounded-full bg-white/10 group-hover:bg-orange border border-white/20 flex items-center justify-center text-white transition-colors"
            >
              <svg
                className="w-3.5 h-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 5v14" />
                <path d="m19 12-7 7-7-7" />
              </svg>
            </motion.span>
          </button>
        </div>

      </section>

      {/* ========================================================
          2. MAIN DASHBOARD CONTENT (Cards & Trips)
         ======================================================== */}
      <div id="dashboard-content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <main className="space-y-10">

          {/* ========================================================
              4. REAL USER STATISTICS CARDS
             ======================================================== */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              
              {/* Stat 1: Upcoming Trips */}
              <div className="bg-white dark:bg-[#0E1A29] border border-[#E2E8F0] dark:border-[#1E2E42] rounded-3xl p-5 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Upcoming Trips
                  </span>
                  <div className="w-7 h-7 rounded-xl bg-orange/10 text-orange flex items-center justify-center text-xs font-bold">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h8m-8 4h8m-4 4h4M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z" />
                    </svg>
                  </div>
                </div>
                <div className="font-extrabold text-2xl text-charcoal dark:text-white font-mono">
                  {bookingsLoading ? "..." : activeBookings.length}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Confirmed active rides
                </p>
              </div>

              {/* Stat 2: Total Bookings */}
              <div className="bg-white dark:bg-[#0E1A29] border border-[#E2E8F0] dark:border-[#1E2E42] rounded-3xl p-5 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Total Bookings
                  </span>
                  <div className="w-7 h-7 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center text-xs font-bold">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
                <div className="font-extrabold text-2xl text-charcoal dark:text-white font-mono">
                  {bookingsLoading ? "..." : bookings.length}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Lifetime bookings created
                </p>
              </div>

              {/* Stat 3: Completed Trips */}
              <div className="bg-white dark:bg-[#0E1A29] border border-[#E2E8F0] dark:border-[#1E2E42] rounded-3xl p-5 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Completed Trips
                  </span>
                  <div className="w-7 h-7 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-xs font-bold">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <div className="font-extrabold text-2xl text-charcoal dark:text-white font-mono">
                  {bookingsLoading ? "..." : completedBookings.length}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Safe journeys finished
                </p>
              </div>

              {/* Stat 4: Active Notifications */}
              <div className="bg-white dark:bg-[#0E1A29] border border-[#E2E8F0] dark:border-[#1E2E42] rounded-3xl p-5 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Live Alerts
                  </span>
                  <div className="w-7 h-7 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center text-xs font-bold">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </div>
                </div>
                <div className="font-extrabold text-2xl text-charcoal dark:text-white font-mono">
                  {notificationsLoading ? "..." : notifications.length}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Driver & trip updates
                </p>
              </div>

            </div>


            {/* ========================================================
                6. UPCOMING TRIPS SECTION (Horizontal Scan Cards)
               ======================================================== */}
            <div className="bg-white dark:bg-[#0E1A29] border border-[#E2E8F0] dark:border-[#1E2E42] rounded-3xl p-6 sm:p-7 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] dark:border-[#1E2E42]">
                <div>
                  <h2 className="font-extrabold text-lg sm:text-xl text-charcoal dark:text-white tracking-tight">
                    Upcoming Trips
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Your scheduled rides and chauffeur assignments
                  </p>
                </div>

                <Link
                  to="/bookings"
                  className="text-xs font-bold text-orange hover:underline flex items-center gap-1"
                >
                  <span>View All Bookings</span>
                  <span>→</span>
                </Link>
              </div>

              {/* Active Bookings List or Clean Empty State */}
              {bookingsLoading ? (
                <div className="py-8 flex flex-col items-center justify-center gap-2">
                  <div className="w-7 h-7 border-2 border-orange border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs text-slate-400">Loading your upcoming journeys...</span>
                </div>
              ) : activeBookings.length > 0 ? (
                <div className="space-y-4">
                  {activeBookings.slice(0, 2).map((trip) => (
                    <div
                      key={trip.id}
                      className="p-4 sm:p-5 rounded-2xl bg-[#F5F7FA] dark:bg-[#0A1420] border border-[#E2E8F0] dark:border-[#1E2E42] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-orange/40 transition-colors"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-12 h-12 rounded-2xl bg-orange/10 border border-orange/20 text-orange flex items-center justify-center font-bold text-lg shrink-0">
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-extrabold text-sm sm:text-base text-charcoal dark:text-white capitalize truncate">
                              {trip.startLocation || "Bangalore"} → {trip.majorDestinations?.[0] || trip.destination || "Outstation"}
                            </h3>
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] uppercase">
                              {trip.status || "Confirmed"}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {formatDate(trip.requestedStartDate)} • {trip.vehicleName || "AC Group Vehicle"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                        {trip.estimatedFare && (
                          <span className="font-extrabold text-base text-orange font-mono">
                            ₹{Number(trip.estimatedFare).toLocaleString("en-IN")}
                          </span>
                        )}
                        <Link
                          to={`/bookings/${trip.id}`}
                          className="py-2 px-4 rounded-xl bg-orange hover:bg-orangeLight text-white font-bold text-xs transition-all shadow-sm cursor-pointer"
                        >
                          View Ride Details →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-10 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-orange/10 text-orange flex items-center justify-center text-xl mx-auto font-bold">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-sm sm:text-base text-charcoal dark:text-white">
                    No upcoming trips yet
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                    Your next adventure is waiting for you. Book an outstation ride or tour package with verified chauffeurs.
                  </p>
                  <div className="pt-1">
                    <Link
                      to="/packages"
                      className="inline-flex items-center gap-1.5 py-2.5 px-5 rounded-xl bg-orange text-white font-bold text-xs hover:bg-orangeLight transition-all shadow-md shadow-orange/20"
                    >
                      <span>Explore Tour Packages →</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>


            {/* ========================================================
                7. DESTINATION RECOMMENDATIONS
               ======================================================== */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-extrabold text-lg sm:text-xl text-charcoal dark:text-white tracking-tight">
                    Explore Destinations
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Top scenic getaways from Bangalore
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {POPULAR_DESTINATIONS.map((dest) => (
                  <Link
                    key={dest.id}
                    to={`/book?destination=${encodeURIComponent(dest.name)}`}
                    className="group relative rounded-3xl overflow-hidden h-44 shadow-sm border border-[#E2E8F0] dark:border-[#1E2E42]"
                  >
                    <img
                      src={dest.image}
                      alt={dest.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                    
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <h3 className="font-extrabold text-base leading-tight group-hover:text-orange transition-colors">
                        {dest.name}
                      </h3>
                      <p className="text-[10px] text-white/80 font-medium truncate">
                        {dest.tagline}
                      </p>
                      <div className="flex items-center justify-between pt-1 text-[10px] text-white/60">
                        <span>{dest.distance}</span>
                        <span className="text-orange font-bold">Book Ride →</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

          </main>
      </div>

      {/* Floating AI Assistant FAB Button */}
      <button
        type="button"
        onClick={() => setAiChatModalOpen(true)}
        className="fixed bottom-6 right-6 z-40 px-4 py-3 rounded-full bg-gradient-to-r from-orange to-orangeLight text-white font-bold text-xs sm:text-sm shadow-2xl shadow-orange/40 border border-orange/40 hover:scale-105 transition-all duration-300 flex items-center gap-2.5 cursor-pointer group"
      >
        <svg className="w-5 h-5 group-hover:rotate-12 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <span>Zenera AI</span>
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
      </button>

      {/* Zenera AI Assistant Modal */}
      <AIChatAssistantModal
        isOpen={aiChatModalOpen}
        onClose={() => setAiChatModalOpen(false)}
      />

      {/* Footer */}
      <Footer />

    </div>
  );
}
