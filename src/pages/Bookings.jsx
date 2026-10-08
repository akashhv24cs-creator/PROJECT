import { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../../Navbar.jsx";
import Footer from "../../Footer.jsx";
import { useAuth } from "../hooks/useAuth";
import { usePageSEO } from "../hooks/usePageSEO";
import { subscribeToUserBookings } from "../services/booking.service";

// Modular Booking Components
import BookingCard from "../components/bookings/BookingCard";
import NextTripHighlight from "../components/bookings/NextTripHighlight";
import BookingDetailsDrawer from "../components/bookings/BookingDetailsDrawer";
import BookingTicketModal from "../components/bookings/BookingTicketModal";
import CancelBookingModal from "../components/bookings/CancelBookingModal";
import BookingFiltersModal from "../components/bookings/BookingFiltersModal";
import BookingSkeletons from "../components/bookings/BookingSkeletons";
import AIChatAssistantModal from "../components/chat/AIChatAssistantModal.jsx";

import {
  UPCOMING_STATUSES,
  COMPLETED_STATUSES,
  CANCELLED_STATUSES,
  parseDate,
} from "../components/bookings/bookingUtils";

export default function BookingsPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  usePageSEO({
    title: "My Bookings | Zenera Trips",
    description: "Manage your outstation rides, travel passes, booking history, and driver details.",
    robots: "noindex, nofollow, noarchive",
  });

  // State: Bookings Data Stream
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State: Navigation Tabs & Search & Filters
  const initialTab = searchParams.get("tab") || "all";
  const [activeTab, setActiveTab] = useState(initialTab);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    vehicle: "all",
    destination: "all",
    startDate: "",
  });
  const [filtersModalOpen, setFiltersModalOpen] = useState(false);

  // State: Modals & Drawer
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [ticketModalBooking, setTicketModalBooking] = useState(null);
  const [cancelModalBooking, setCancelModalBooking] = useState(null);
  const [actionAlert, setActionAlert] = useState(null);
  const [aiChatModalOpen, setAiChatModalOpen] = useState(false);

  // Sync tab with URL search parameter if changed
  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
    setSearchParams(tabKey === "all" ? {} : { tab: tabKey });
  };

  // 1. Subscribe to Live User Bookings
  const fetchBookings = useCallback(() => {
    if (!currentUser?.uid) {
      setBookings([]);
      setLoading(false);
      return () => {};
    }

    setLoading(true);
    setError(null);

    const unsubscribe = subscribeToUserBookings(
      currentUser.uid,
      (newBookings) => {
        // Sort bookings: upcoming trips by requestedStartDate ascending, others by createdAt/requestedStartDate descending
        const sorted = [...newBookings].sort((a, b) => {
          const getMs = (val) => {
            const d = parseDate(val);
            return d ? d.getTime() : 0;
          };
          return (
            (getMs(b.createdAt) || getMs(b.requestedStartDate)) -
            (getMs(a.createdAt) || getMs(a.requestedStartDate))
          );
        });

        setBookings(sorted);
        setLoading(false);
      },
      (err) => {
        console.error("BookingsPage subscription error:", err);
        setError("Unable to retrieve your bookings. Please check your connection.");
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [currentUser?.uid]);

  useEffect(() => {
    const unsub = fetchBookings();
    return () => {
      if (typeof unsub === "function") unsub();
    };
  }, [fetchBookings]);

  // Derived: Live Status Tab Counts
  const tabCounts = useMemo(() => {
    let upcoming = 0;
    let completed = 0;
    let cancelled = 0;

    bookings.forEach((b) => {
      const status = (b.status || "").toLowerCase();
      if (UPCOMING_STATUSES.includes(status)) upcoming++;
      else if (COMPLETED_STATUSES.includes(status)) completed++;
      else if (CANCELLED_STATUSES.includes(status)) cancelled++;
    });

    return {
      all: bookings.length,
      upcoming,
      completed,
      cancelled,
    };
  }, [bookings]);

  // Derived: Nearest Upcoming Trip for "Your Next Trip" Highlight
  const nextTrip = useMemo(() => {
    const active = bookings.filter((b) =>
      UPCOMING_STATUSES.includes((b.status || "").toLowerCase())
    );
    if (active.length === 0) return null;

    // Return the upcoming trip with closest start date
    return [...active].sort((a, b) => {
      const aMs = parseDate(a.requestedStartDate)?.getTime() || 0;
      const bMs = parseDate(b.requestedStartDate)?.getTime() || 0;
      return aMs - bMs;
    })[0];
  }, [bookings]);

  // Filtered Bookings based on Tab, Search, and Multi-attribute Filters
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const status = (b.status || "").toLowerCase();

      // 1. Tab Status Filtering
      if (activeTab === "upcoming" && !UPCOMING_STATUSES.includes(status)) return false;
      if (activeTab === "completed" && !COMPLETED_STATUSES.includes(status)) return false;
      if (activeTab === "cancelled" && !CANCELLED_STATUSES.includes(status)) return false;

      // 2. Search Query Filtering
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const bookingId = (b.bookingId || b.id || "").toLowerCase();
        const startLoc = (b.startLocation || "").toLowerCase();
        const dest = (b.destination || "").toLowerCase();
        const majorDests = Array.isArray(b.majorDestinations)
          ? b.majorDestinations.join(" ").toLowerCase()
          : "";
        const vehicleType = (b.vehicleType || "").toLowerCase();

        const matches =
          bookingId.includes(q) ||
          startLoc.includes(q) ||
          dest.includes(q) ||
          majorDests.includes(q) ||
          vehicleType.includes(q);

        if (!matches) return false;
      }

      // 3. Multi-attribute Modal Filters
      if (filters.vehicle !== "all") {
        if ((b.vehicleType || "").toLowerCase() !== filters.vehicle.toLowerCase()) {
          return false;
        }
      }

      if (filters.destination !== "all") {
        const destTarget = filters.destination.toLowerCase();
        const bMajor = Array.isArray(b.majorDestinations)
          ? b.majorDestinations
          : typeof b.majorDestinations === "string"
          ? [b.majorDestinations]
          : [];
        const bDetailed = Array.isArray(b.detailedDestinations)
          ? b.detailedDestinations
          : typeof b.detailedDestinations === "string"
          ? [b.detailedDestinations]
          : [];
        const bDests = [
          b.destination || "",
          ...bMajor,
          ...bDetailed,
        ]
          .join(" ")
          .toLowerCase();
        if (!bDests.includes(destTarget)) return false;
      }

      if (filters.startDate) {
        const filterDateMs = new Date(filters.startDate).getTime();
        const tripDate = parseDate(b.requestedStartDate);
        if (tripDate && tripDate.getTime() < filterDateMs) {
          return false;
        }
      }

      return true;
    });
  }, [bookings, activeTab, searchQuery, filters]);

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.vehicle !== "all") count++;
    if (filters.destination !== "all") count++;
    if (filters.startDate) count++;
    return count;
  }, [filters]);

  // Actions Handlers
  const handleOpenDetails = (booking) => {
    setSelectedBooking(booking);
    setDrawerOpen(true);
  };

  const handleOpenTicket = (booking) => {
    setTicketModalBooking(booking);
  };

  const handleOpenCancel = (booking) => {
    setCancelModalBooking(booking);
  };

  const handleCancelSuccess = (res) => {
    setActionAlert({
      type: "success",
      message: res.message || "Your booking has been cancelled successfully.",
      refundAmount: res.refundAmount,
    });
    // Close details drawer if the cancelled booking was open
    if (selectedBooking && (selectedBooking.id === cancelModalBooking?.id || selectedBooking.bookingId === cancelModalBooking?.bookingId)) {
      setDrawerOpen(false);
    }
  };

  const tabs = [
    { key: "all", label: "All Bookings", count: tabCounts.all },
    { key: "upcoming", label: "Upcoming", count: tabCounts.upcoming },
    { key: "completed", label: "Completed", count: tabCounts.completed },
    { key: "cancelled", label: "Cancelled", count: tabCounts.cancelled },
  ];

  return (
    <div className="min-h-screen bg-[#FFFBF7] dark:bg-[#07111F] text-charcoal dark:text-white font-sans selection:bg-orange selection:text-white flex flex-col justify-between transition-colors duration-200">
      
      {/* Top Main Navbar */}
      <Navbar />

      {/* Main Centered Content Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 space-y-6 sm:space-y-8">
        
        {/* ========================================================
            1. CLEAN PAGE HEADER WITH QUICK ZENAI ACTION
           ======================================================== */}
        <div className="pb-4 border-b border-[#E2E8F0] dark:border-[#1E2E42] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-orange">
                Personal Travel Manager
              </span>
            </div>
            <h1 className="font-extrabold text-2xl sm:text-3xl lg:text-4xl text-charcoal dark:text-white tracking-tight">
              My Bookings
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              View and manage all your trips in one place.
            </p>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
            {/* Ask ZenAI Trip Assistant Header Button */}
            <button
              type="button"
              onClick={() => setAiChatModalOpen(true)}
              className="px-3.5 py-2.5 rounded-xl bg-orange/10 hover:bg-orange/20 border border-orange/30 text-orange font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer shadow-sm group"
              title="Plan or ask anything with ZenAI"
            >
              <svg className="w-4 h-4 text-orange group-hover:rotate-12 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Ask ZenAI</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </button>

            {/* Book New Trip CTA */}
            <Link
              to="/fleets"
              className="px-4 py-2.5 rounded-xl bg-orange hover:bg-orangeLight text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-md shadow-orange/20 transition-all cursor-pointer"
            >
              <span>Book New Trip</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </Link>
          </div>
        </div>

          {/* Action Alert Notification Banner */}
          {actionAlert && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-200 text-xs sm:text-sm flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 font-medium">
                <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span>{actionAlert.message}</span>
                {typeof actionAlert.refundAmount === "number" && actionAlert.refundAmount > 0 && (
                  <strong className="text-emerald-600 dark:text-emerald-300 font-mono">
                    (Refund: ₹{actionAlert.refundAmount.toLocaleString("en-IN")})
                  </strong>
                )}
              </div>
              <button
                onClick={() => setActionAlert(null)}
                className="text-slate-400 hover:text-charcoal dark:hover:text-white cursor-pointer"
                title="Close"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          {/* Error Alert Banner */}
          {error && (
            <div className="p-5 rounded-3xl bg-rose-500/10 border border-rose-500/20 text-rose-800 dark:text-rose-200 text-xs sm:text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-rose-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <h4 className="font-extrabold text-rose-700 dark:text-rose-300">
                    Unable to load your bookings
                  </h4>
                  <p className="text-slate-600 dark:text-slate-400 text-xs">
                    {error}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={fetchBookings}
                className="py-2 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors self-start sm:self-center cursor-pointer"
              >
                Try Again
              </button>
            </div>
          )}

          {/* ========================================================
              2. SUBTLE "YOUR NEXT TRIP" HIGHLIGHT (If upcoming exists)
             ======================================================== */}
          {!loading && nextTrip && (activeTab === "all" || activeTab === "upcoming") && (
            <NextTripHighlight
              trip={nextTrip}
              onViewDetails={handleOpenDetails}
              onDownloadTicket={handleOpenTicket}
            />
          )}

          {/* ========================================================
              3. STATUS TABS & SEARCH & FILTER CONTROLS
             ======================================================== */}
          <div className="space-y-4">
            
            {/* Status Navigation Tabs */}
            <div className="flex items-center justify-between gap-2 border-b border-[#E2E8F0] dark:border-[#1E2E42] overflow-x-auto scrollbar-none pb-0.5">
              <div className="flex items-center gap-1 sm:gap-6 min-w-max">
                {tabs.map((tab) => {
                  const isActive = activeTab === tab.key;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => handleTabChange(tab.key)}
                      className={`relative pb-3 pt-1 text-xs sm:text-sm font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
                        isActive
                          ? "text-orange"
                          : "text-slate-500 dark:text-slate-400 hover:text-charcoal dark:hover:text-white"
                      }`}
                    >
                      <span>{tab.label}</span>
                      
                      {/* Subtle Badge Count */}
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold transition-colors ${
                          isActive
                            ? "bg-orange/15 text-orange"
                            : "bg-[#F5F7FA] dark:bg-[#152436] text-slate-500 dark:text-slate-400"
                        }`}
                      >
                        {tab.count}
                      </span>

                      {/* Active Underline Indicator */}
                      {isActive && (
                        <motion.div
                          layoutId="booking-tab-underline"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange rounded-full"
                          transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Search Bar & Filter Button Row */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              
              {/* Search Field */}
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by trip name, destination, vehicle, or ID..."
                  className="w-full bg-white dark:bg-[#0E1A29] border border-[#E2E8F0] dark:border-[#1E2E42] rounded-2xl pl-10 pr-10 py-3 text-xs sm:text-sm text-charcoal dark:text-white placeholder:text-slate-400 outline-none focus:border-orange focus:ring-1 focus:ring-orange shadow-sm transition-all"
                />
                <svg
                  className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>

                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-charcoal dark:hover:text-white text-xs p-1"
                    title="Clear search"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Filter Button */}
              <button
                type="button"
                onClick={() => setFiltersModalOpen(true)}
                className={`py-3 px-4 rounded-2xl border text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0 shadow-sm ${
                  activeFiltersCount > 0
                    ? "bg-orange/10 border-orange text-orange"
                    : "bg-white dark:bg-[#0E1A29] border-[#E2E8F0] dark:border-[#1E2E42] text-slate-600 dark:text-slate-300 hover:border-orange/40"
                }`}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                  />
                </svg>
                <span>Filters</span>
                {activeFiltersCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-orange text-white text-[10px] font-bold flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

            </div>

            {/* Active Filter Tags */}
            {activeFiltersCount > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                <span className="text-slate-400 text-[11px] font-semibold">Active:</span>
                {filters.destination !== "all" && (
                  <span className="px-2.5 py-1 rounded-lg bg-orange/10 border border-orange/20 text-orange font-semibold flex items-center gap-1.5">
                    <span>{filters.destination}</span>
                    <button
                      onClick={() => setFilters((f) => ({ ...f, destination: "all" }))}
                      className="hover:text-charcoal dark:hover:text-white"
                      title="Remove filter"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                )}
                {filters.vehicle !== "all" && (
                  <span className="px-2.5 py-1 rounded-lg bg-orange/10 border border-orange/20 text-orange font-semibold flex items-center gap-1.5">
                    <span>{filters.vehicle}</span>
                    <button
                      onClick={() => setFilters((f) => ({ ...f, vehicle: "all" }))}
                      className="hover:text-charcoal dark:hover:text-white"
                      title="Remove filter"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                )}
                {filters.startDate && (
                  <span className="px-2.5 py-1 rounded-lg bg-orange/10 border border-orange/20 text-orange font-semibold flex items-center gap-1.5">
                    <span>From {filters.startDate}</span>
                    <button
                      onClick={() => setFilters((f) => ({ ...f, startDate: "" }))}
                      className="hover:text-charcoal dark:hover:text-white"
                      title="Remove filter"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                )}
                <button
                  type="button"
                  onClick={() =>
                    setFilters({ vehicle: "all", destination: "all", startDate: "" })
                  }
                  className="text-slate-400 hover:text-orange text-xs underline ml-1 cursor-pointer"
                >
                  Clear all
                </button>
              </div>
            )}

          </div>

          {/* ========================================================
              4. MAIN BOOKINGS LISTING / EMPTY / SKELETON STATES
             ======================================================== */}
          {loading ? (
            <BookingSkeletons count={3} />
          ) : bookings.length === 0 ? (
            
            /* Empty State: Never booked before */
            <div className="rounded-3xl border border-[#E2E8F0] dark:border-[#1E2E42] bg-white dark:bg-[#0E1A29] p-8 sm:p-12 text-center space-y-4 shadow-sm">
              <div className="w-16 h-16 rounded-3xl bg-orange/10 text-orange flex items-center justify-center mx-auto">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
              <div className="space-y-1">
                <h3 className="font-extrabold text-xl text-charcoal dark:text-white">
                  No bookings yet
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  Your next adventure is waiting for you. Get an instant estimate for premium outstation vehicles with verified chauffeurs.
                </p>
              </div>
              <div className="pt-2">
                <Link
                  to="/packages"
                  className="inline-flex items-center gap-2 py-3 px-6 rounded-2xl bg-orange hover:bg-orangeLight text-white font-bold text-xs sm:text-sm shadow-lg shadow-orange/25 transition-all"
                >
                  <span>Explore Trips</span>
                  <span>→</span>
                </Link>
              </div>
            </div>

          ) : filteredBookings.length === 0 ? (
            
            /* Empty State: Category / Search empty */
            <div className="rounded-3xl border border-[#E2E8F0] dark:border-[#1E2E42] bg-white dark:bg-[#0E1A29] p-8 sm:p-10 text-center space-y-4 shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                <svg className="w-7 h-7 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>

              <div className="space-y-1">
                <h3 className="font-extrabold text-lg text-charcoal dark:text-white">
                  {activeTab === "upcoming"
                    ? "No upcoming trips"
                    : activeTab === "completed"
                    ? "No completed trips yet"
                    : activeTab === "cancelled"
                    ? "No cancelled bookings"
                    : "No matching bookings found"}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  {activeTab === "upcoming"
                    ? "Looks like it's time to plan your next adventure."
                    : activeTab === "completed"
                    ? "Your completed journeys and digital travel receipts will appear here."
                    : activeTab === "cancelled"
                    ? "You don't have any cancelled reservations."
                    : `No bookings matched your search or active filters.`}
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                {activeTab === "upcoming" ? (
                  <Link
                    to="/book"
                    className="py-2.5 px-5 rounded-xl bg-orange hover:bg-orangeLight text-white font-bold text-xs shadow-md shadow-orange/20 transition-all"
                  >
                    Book a Trip →
                  </Link>
                ) : searchQuery || activeFiltersCount > 0 ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setFilters({ vehicle: "all", destination: "all", startDate: "" });
                    }}
                    className="py-2 px-4 rounded-xl bg-orange/10 text-orange hover:bg-orange/20 border border-orange/30 font-bold text-xs transition-colors cursor-pointer"
                  >
                    Reset Search & Filters
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleTabChange("all")}
                    className="py-2 px-4 rounded-xl bg-[#F5F7FA] dark:bg-[#152436] border border-[#E2E8F0] dark:border-[#1E2E42] text-slate-600 dark:text-slate-300 font-bold text-xs transition-colors cursor-pointer"
                  >
                    Show All Bookings
                  </button>
                )}
              </div>
            </div>

          ) : (

            /* Normal Listing of Horizontal Booking Cards */
            <div className="space-y-4">
              {filteredBookings.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  onViewDetails={handleOpenDetails}
                  onDownloadTicket={handleOpenTicket}
                  onCancelBooking={handleOpenCancel}
                />
              ))}
            </div>

          )}

        </main>

      {/* ========================================================
          5. MODALS & SLIDE-OVER DRAWER
         ======================================================== */}
      
      {/* Slide-over Booking Details Drawer */}
      <BookingDetailsDrawer
        isOpen={drawerOpen}
        booking={selectedBooking}
        onClose={() => setDrawerOpen(false)}
        onDownloadTicket={handleOpenTicket}
        onCancelBooking={handleOpenCancel}
      />

      {/* Boarding Pass Ticket View / Print Modal */}
      <BookingTicketModal
        isOpen={!!ticketModalBooking}
        booking={ticketModalBooking}
        onClose={() => setTicketModalBooking(null)}
      />

      {/* Cancel Booking Confirmation Dialog */}
      <CancelBookingModal
        isOpen={!!cancelModalBooking}
        booking={cancelModalBooking}
        onClose={() => setCancelModalBooking(null)}
        onSuccess={handleCancelSuccess}
      />

      {/* Multi-attribute Filter Modal */}
      <BookingFiltersModal
        isOpen={filtersModalOpen}
        filters={filters}
        onApply={(newFilters) => setFilters(newFilters)}
        onReset={() => setFilters({ vehicle: "all", destination: "all", startDate: "" })}
        onClose={() => setFiltersModalOpen(false)}
      />

      {/* Floating ZenAI Assistant FAB Button */}
      <button
        type="button"
        onClick={() => setAiChatModalOpen(true)}
        className="fixed bottom-6 right-6 z-40 px-4 py-3 rounded-full bg-gradient-to-r from-orange to-orangeLight text-white font-bold text-xs sm:text-sm shadow-2xl shadow-orange/40 border border-orange/40 hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-2.5 cursor-pointer group"
        title="Plan or ask about trips with ZenAI"
      >
        <svg className="w-5 h-5 group-hover:rotate-12 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <span>ZenAI Assistant</span>
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
