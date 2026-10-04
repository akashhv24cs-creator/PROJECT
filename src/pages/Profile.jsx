import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../../Navbar.jsx";
import Footer from "../../Footer.jsx";
import { useAuth } from "../hooks/useAuth";
import { usePageSEO } from "../hooks/usePageSEO";
import { subscribeToUserBookings } from "../services/booking.service";

// Modular Profile Components
import ProfileSummaryHeader from "../components/profile/ProfileSummaryHeader";
import ProfileTabsNav from "../components/profile/ProfileTabsNav";
import PersonalInfoTab from "../components/profile/PersonalInfoTab";
import SecurityTab from "../components/profile/SecurityTab";
import PreferencesTab from "../components/profile/PreferencesTab";
import PaymentMethodsTab from "../components/profile/PaymentMethodsTab";
import AddressBookTab from "../components/profile/AddressBookTab";
import AccountSummarySidebar from "../components/profile/AccountSummarySidebar";
import ProfileSkeleton from "../components/profile/ProfileSkeleton";

export default function ProfilePage() {
  usePageSEO({
    title: "My Profile | Zenera Trips",
    description: "Manage your Zenera Trips account details, outstation ride preferences, and security settings.",
    robots: "noindex, nofollow, noarchive",
  });

  const {
    currentUser,
    userProfile,
    profileLoading,
    profileNotFound,
    profileError,
  } = useAuth();

  const [activeTab, setActiveTab] = useState("personal");
  const [actionAlert, setActionAlert] = useState(null);

  // Live Booking Statistics
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    completed: 0,
    cancelled: 0,
    totalSpent: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  // Subscribe to Live Bookings for Real-Time Account Metrics
  useEffect(() => {
    if (!currentUser?.uid) {
      setStats({ total: 0, active: 0, completed: 0, cancelled: 0, totalSpent: 0 });
      setStatsLoading(false);
      return () => {};
    }

    setStatsLoading(true);

    const upcomingStatuses = [
      "pending",
      "confirmed",
      "driver_assigned",
      "driver_en_route",
      "driver_arrived",
      "trip_started",
      "ongoing",
    ];
    const completedStatuses = ["trip_completed", "completed", "reviewed"];
    const cancelledStatuses = ["cancelled"];

    const unsubscribe = subscribeToUserBookings(
      currentUser.uid,
      (bookings) => {
        let activeCount = 0;
        let completedCount = 0;
        let cancelledCount = 0;
        let totalFareSum = 0;

        bookings.forEach((b) => {
          const status = (b.status || "").toLowerCase();
          if (upcomingStatuses.includes(status)) activeCount++;
          else if (completedStatuses.includes(status)) completedCount++;
          else if (cancelledStatuses.includes(status)) cancelledCount++;

          const fare = b.totalAmount || b.estimatedFare;
          if (typeof fare === "number" && !cancelledStatuses.includes(status)) {
            totalFareSum += fare;
          }
        });

        setStats({
          total: bookings.length,
          active: activeCount,
          completed: completedCount,
          cancelled: cancelledCount,
          totalSpent: totalFareSum,
        });
        setStatsLoading(false);
      },
      (err) => {
        console.warn("ProfilePage bookings listener error:", err);
        setStatsLoading(false);
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

  return (
    <div className="min-h-screen bg-[#FFFBF7] dark:bg-[#07111F] text-charcoal dark:text-white font-sans selection:bg-orange selection:text-white flex flex-col justify-between transition-colors duration-200">
      
      {/* Top Navbar */}
      <Navbar />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 space-y-6 sm:space-y-8">
        
        {/* ========================================================
            1. BREADCRUMB & PAGE HEADER
           ======================================================== */}
        <div className="pb-3 border-b border-[#E2E8F0] dark:border-[#1E2E42] space-y-2">
          
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <Link to="/" className="hover:text-orange transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-charcoal dark:text-white">Profile</span>
          </nav>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
            <div>
              <h1 className="font-extrabold text-2xl sm:text-3xl lg:text-4xl text-charcoal dark:text-white tracking-tight">
                My Profile
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Manage your account information, preferences, and verified credentials
              </p>
            </div>
          </div>
        </div>

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

        {/* ========================================================
            2. PROFILE STATES & TWO-COLUMN CONTENT
           ======================================================== */}
        {profileLoading ? (
          
          /* Loading Skeleton */
          <ProfileSkeleton />

        ) : !currentUser ? (
          
          /* Unauthenticated State */
          <div className="rounded-3xl border border-[#E2E8F0] dark:border-[#1E2E42] bg-white dark:bg-[#0E1A29] p-8 sm:p-12 text-center space-y-4 max-w-lg mx-auto shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-orange/10 border border-orange/20 text-orange flex items-center justify-center text-3xl mx-auto">
              <svg className="w-8 h-8 text-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="font-extrabold text-2xl text-charcoal dark:text-white">
              Authentication Required
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
              Please sign in with your mobile OTP to view your profile and manage your outstation bookings.
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

          <div className="space-y-6 sm:space-y-8">
            
            {/* Top Profile Summary Card */}
            <ProfileSummaryHeader
              currentUser={currentUser}
              userProfile={userProfile}
              stats={stats}
              onAlert={handleAlert}
              onEditAvatar={() => setActiveTab("personal")}
            />

            {/* ========================================================
                TWO-COLUMN DESKTOP LAYOUT (68% Left / 32% Right Sidebar)
               ======================================================== */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
              
              {/* LEFT COLUMN: 68% (Cols 1-8) */}
              <div className="lg:col-span-8 space-y-6">
                
                {/* Horizontal Navigation Tabs */}
                <ProfileTabsNav
                  activeTab={activeTab}
                  onChangeTab={(tabId) => setActiveTab(tabId)}
                />

                {/* Tab Views */}
                {activeTab === "personal" && (
                  <PersonalInfoTab onAlert={handleAlert} />
                )}

                {activeTab === "security" && (
                  <SecurityTab onAlert={handleAlert} />
                )}

                {activeTab === "preferences" && (
                  <PreferencesTab onAlert={handleAlert} />
                )}

                {activeTab === "payment" && (
                  <PaymentMethodsTab />
                )}

                {activeTab === "addresses" && (
                  <AddressBookTab />
                )}

              </div>

              {/* RIGHT COLUMN: 32% (Cols 9-12 Sticky Sidebar) */}
              <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
                <AccountSummarySidebar
                  stats={stats}
                  statsLoading={statsLoading}
                />
              </div>

            </div>

          </div>

        )}

      </main>

      {/* Footer */}
      <Footer />

    </div>
  );
}
