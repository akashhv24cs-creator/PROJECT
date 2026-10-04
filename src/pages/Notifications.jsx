import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../../Navbar.jsx";
import Footer from "../../Footer.jsx";
import { useAuth } from "../hooks/useAuth";
import { usePageSEO } from "../hooks/usePageSEO";
import {
  subscribeToUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../services/notification.service";

// Modular Notification Components
import NotificationHeader from "../components/notifications/NotificationHeader";
import NotificationTabs from "../components/notifications/NotificationTabs";
import NotificationSearch from "../components/notifications/NotificationSearch";
import NotificationGroup from "../components/notifications/NotificationGroup";
import NotificationSettingsPanel from "../components/notifications/NotificationSettingsPanel";
import NotificationEmptyState from "../components/notifications/NotificationEmptyState";
import NotificationSkeleton from "../components/notifications/NotificationSkeleton";

export default function NotificationsPage() {
  usePageSEO({
    title: "Notifications | Zenera Trips",
    description: "Stay updated with your active outstation bookings, driver assignments, and exclusive travel offers.",
    robots: "noindex, nofollow, noarchive",
  });

  const { currentUser, loading: authLoading } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [markingAll, setMarkingAll] = useState(false);
  const [actionAlert, setActionAlert] = useState(null);

  // Subscribe to real-time Firestore notifications
  useEffect(() => {
    if (!currentUser?.uid) {
      setNotifications([]);
      setLoading(false);
      return () => {};
    }

    setLoading(true);
    setError(null);

    const unsubscribe = subscribeToUserNotifications(
      currentUser.uid,
      (fetchedNotifications) => {
        setNotifications(fetchedNotifications);
        setLoading(false);
      },
      (err) => {
        console.error("NotificationsPage fetch error:", err);
        setError("Unable to load notifications. Please check your connection.");
        setLoading(false);
      }
    );

    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, [currentUser?.uid]);

  const handleAlert = ({ type = "success", message }) => {
    setActionAlert({ type, message });
    setTimeout(() => {
      setActionAlert(null);
    }, 4000);
  };

  // Mark single notification as read
  const handleMarkAsRead = async (notificationId) => {
    if (!currentUser?.uid || !notificationId) return;

    // Optimistic local update
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true, status: "read" } : n))
    );

    try {
      await markNotificationAsRead(currentUser.uid, notificationId);
    } catch (err) {
      console.error("Mark single read error:", err);
    }
  };

  // Mark all unread notifications as read
  const handleMarkAllAsRead = async () => {
    if (!currentUser?.uid) return;

    const unreadList = notifications.filter((n) => !n.read);
    if (unreadList.length === 0) return;

    setMarkingAll(true);

    // Optimistic local update
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read: true, status: "read" }))
    );

    try {
      const res = await markAllNotificationsAsRead(currentUser.uid, unreadList);
      if (res.success) {
        handleAlert({
          type: "success",
          message: `Marked ${res.count} notification${res.count === 1 ? "" : "s"} as read.`,
        });
      }
    } catch (err) {
      console.error("Mark all read error:", err);
      handleAlert({
        type: "error",
        message: "Failed to mark all as read. Please try again.",
      });
    } finally {
      setMarkingAll(false);
    }
  };

  // Counts by category & unread
  const { counts, unreadCount } = useMemo(() => {
    let unread = 0;
    const catCounts = { all: notifications.length, bookings: 0, offers: 0, updates: 0, reminders: 0 };

    notifications.forEach((n) => {
      if (!n.read) unread++;
      const cat = n.category || "updates";
      if (catCounts[cat] !== undefined) {
        catCounts[cat]++;
      }
    });

    return { counts: catCounts, unreadCount: unread };
  }, [notifications]);

  // Filter and search notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      // 1. Tab category filter
      if (activeTab !== "all") {
        if (n.category !== activeTab) return false;
      }

      // 2. Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = (n.title || "").toLowerCase().includes(q);
        const messageMatch = (n.message || "").toLowerCase().includes(q);
        const bookingMatch = (n.bookingId || "").toLowerCase().includes(q);
        if (!titleMatch && !messageMatch && !bookingMatch) return false;
      }

      return true;
    });
  }, [notifications, activeTab, searchQuery]);

  // Chronological Date Groups (TODAY, YESTERDAY, EARLIER)
  const groupedNotifications = useMemo(() => {
    const today = [];
    const yesterday = [];
    const earlier = [];

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterdayStart = todayStart - 24 * 60 * 60 * 1000;

    const parseMs = (val) => {
      if (!val) return 0;
      if (val.toDate && typeof val.toDate === "function") return val.toDate().getTime();
      if (val.seconds) return val.seconds * 1000;
      return new Date(val).getTime() || 0;
    };

    filteredNotifications.forEach((n) => {
      const ms = parseMs(n.sentAt);
      if (ms >= todayStart) {
        today.push(n);
      } else if (ms >= yesterdayStart) {
        yesterday.push(n);
      } else {
        earlier.push(n);
      }
    });

    return { today, yesterday, earlier };
  }, [filteredNotifications]);

  return (
    <div className="min-h-screen bg-[#FFFBF7] dark:bg-[#07111F] text-charcoal dark:text-white font-sans selection:bg-orange selection:text-white flex flex-col justify-between transition-colors duration-200">
      
      {/* Top Navigation Header */}
      <Navbar />

      {/* Main Centered Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 space-y-6 sm:space-y-8">
        
        {/* Page Header Area */}
        <NotificationHeader
          unreadCount={unreadCount}
          onMarkAllAsRead={handleMarkAllAsRead}
          markingAll={markingAll}
        />

        {/* Global Feedback Banner */}
        <AnimatePresence>
          {actionAlert && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-200 text-xs sm:text-sm font-semibold flex items-center justify-between shadow-sm"
            >
              <div className="flex items-center gap-2.5">
                <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span>{actionAlert.message}</span>
              </div>
              <button
                type="button"
                onClick={() => setActionAlert(null)}
                className="text-emerald-600 dark:text-emerald-400 hover:opacity-75 cursor-pointer text-xs"
                title="Close"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content States */}
        {loading || authLoading ? (
          
          /* Loading Skeletons */
          <NotificationSkeleton />

        ) : error ? (
          
          /* Error State */
          <div className="rounded-3xl border border-rose-500/20 bg-white dark:bg-[#0E1A29] p-8 sm:p-12 text-center space-y-4 max-w-lg mx-auto shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center justify-center mx-auto text-2xl">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="font-extrabold text-lg sm:text-xl text-charcoal dark:text-white">
              Unable to Load Notifications
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              {error}
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="py-2.5 px-5 rounded-xl bg-orange hover:bg-orangeLight text-white font-bold text-xs shadow-md shadow-orange/20 transition-all cursor-pointer"
            >
              Try Again
            </button>
          </div>

        ) : !currentUser ? (
          
          /* Unauthenticated State */
          <div className="rounded-3xl border border-[#E2E8F0] dark:border-[#1E2E42] bg-white dark:bg-[#0E1A29] p-8 sm:p-12 text-center space-y-4 max-w-lg mx-auto shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-orange/10 border border-orange/20 text-orange flex items-center justify-center text-3xl mx-auto">
              <svg className="w-8 h-8 text-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <h2 className="font-extrabold text-2xl text-charcoal dark:text-white">
              Sign In to View Notifications
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
              Please sign in to receive live updates about your chauffeur dispatches and outstation bookings.
            </p>
            <div className="pt-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 py-3 px-6 rounded-2xl bg-orange hover:bg-orangeLight text-white font-bold text-xs sm:text-sm shadow-lg shadow-orange/25 transition-all"
              >
                <span>Go to Login →</span>
              </Link>
            </div>
          </div>

        ) : (

          /* ========================================================
              TWO-COLUMN RESPONSIVE LAYOUT (68% Feed / 32% Panel)
             ======================================================== */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            
            {/* LEFT COLUMN: 68% (Cols 1-8) */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Category Filter Tabs & Search Bar */}
              <div className="space-y-4">
                <NotificationTabs
                  activeTab={activeTab}
                  onChangeTab={(tabId) => setActiveTab(tabId)}
                  counts={counts}
                />

                <NotificationSearch
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  onClear={() => setSearchQuery("")}
                />
              </div>

              {/* Feed Content */}
              {filteredNotifications.length === 0 ? (
                
                <NotificationEmptyState
                  category={activeTab}
                  searchQuery={searchQuery}
                  onClearSearch={() => setSearchQuery("")}
                />

              ) : (

                <div className="space-y-8">
                  {/* Today Group */}
                  <NotificationGroup
                    label="TODAY"
                    notifications={groupedNotifications.today}
                    onMarkAsRead={handleMarkAsRead}
                  />

                  {/* Yesterday Group */}
                  <NotificationGroup
                    label="YESTERDAY"
                    notifications={groupedNotifications.yesterday}
                    onMarkAsRead={handleMarkAsRead}
                  />

                  {/* Earlier Group */}
                  <NotificationGroup
                    label="EARLIER"
                    notifications={groupedNotifications.earlier}
                    onMarkAsRead={handleMarkAsRead}
                  />
                </div>

              )}

            </div>

            {/* RIGHT COLUMN: 32% (Cols 9-12 Contextual Settings Panel) */}
            <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
              <NotificationSettingsPanel
                unreadCount={unreadCount}
                onMarkAllAsRead={handleMarkAllAsRead}
                markingAll={markingAll}
                onAlert={handleAlert}
              />
            </div>

          </div>

        )}

      </main>

      {/* Footer */}
      <Footer />

    </div>
  );
}
