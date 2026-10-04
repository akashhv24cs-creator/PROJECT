import { useState, useEffect } from "react";
import Navbar from "../../Navbar.jsx";
import Footer from "../../Footer.jsx";
import { usePageSEO } from "../hooks/usePageSEO";

// Modular Offline Components
import OfflineHero from "../components/offline/OfflineHero";
import OfflineFeatureCards from "../components/offline/OfflineFeatureCards";
import SyncStatusBanner from "../components/offline/SyncStatusBanner";

export default function OfflinePage() {
  usePageSEO({
    title: "You're Offline | Zenera Trips",
    description: "You are currently browsing offline. Access your cached passes, e-tickets, and travel guidelines.",
    robots: "noindex, nofollow, noarchive",
  });

  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleRetry = () => {
    if (typeof navigator !== "undefined" && navigator.onLine) {
      setIsOnline(true);
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFBF7] dark:bg-[#07111F] text-charcoal dark:text-white font-sans selection:bg-orange selection:text-white flex flex-col justify-between transition-colors duration-200">
      
      {/* Top Navigation Header */}
      <Navbar />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 space-y-10 sm:space-y-12">
        
        {/* 1. Main Offline Hero (Travel Offline Illustration & Reassurance) */}
        <OfflineHero
          isOnline={isOnline}
          onRetry={handleRetry}
        />

        {/* 2. Offline Accessible Features Grid */}
        <OfflineFeatureCards />

        {/* 3. Sync Resumption Banner */}
        <SyncStatusBanner isOnline={isOnline} />

      </main>

      {/* Footer */}
      <Footer />

    </div>
  );
}
