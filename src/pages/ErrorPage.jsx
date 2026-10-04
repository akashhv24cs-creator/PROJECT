import Navbar from "../../Navbar.jsx";
import Footer from "../../Footer.jsx";
import { usePageSEO } from "../hooks/usePageSEO";

// Modular Error Components
import ErrorHero from "../components/error/ErrorHero";
import ErrorPopularPages from "../components/error/ErrorPopularPages";
import ErrorSupportBanner from "../components/error/ErrorSupportBanner";

export default function ErrorPage({
  errorCode = "500",
  errorMessage,
  onRetry,
}) {
  usePageSEO({
    title: "Oops! Something Went Wrong | Zenera Trips",
    description: "We encountered a temporary issue while loading this page. Let's get you back on track.",
    robots: "noindex, nofollow, noarchive",
  });

  return (
    <div className="min-h-screen bg-[#FFFBF7] dark:bg-[#07111F] text-charcoal dark:text-white font-sans selection:bg-orange selection:text-white flex flex-col justify-between transition-colors duration-200">
      
      {/* Top Navigation Header */}
      <Navbar />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 space-y-10 sm:space-y-12">
        
        {/* 1. Main Error Hero (Travel Error Illustration & Actions) */}
        <ErrorHero
          errorCode={errorCode}
          errorMessage={errorMessage}
          onRetry={onRetry}
        />

        {/* 2. Popular Pages Discovery Grid */}
        <ErrorPopularPages />

        {/* 3. 24/7 Concierge Support Banner */}
        <ErrorSupportBanner />

      </main>

      {/* Footer */}
      <Footer />

    </div>
  );
}
