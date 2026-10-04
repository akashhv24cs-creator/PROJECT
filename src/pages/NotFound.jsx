import Navbar from "../../Navbar.jsx";
import Footer from "../../Footer.jsx";
import { usePageSEO } from "../hooks/usePageSEO";

// Modular 404 Components
import NotFoundHero from "../components/notfound/NotFoundHero";
import PopularPagesGrid from "../components/notfound/PopularPagesGrid";
import NotFoundSupportBanner from "../components/notfound/NotFoundSupportBanner";

export default function NotFoundPage() {
  usePageSEO({
    title: "404 - Page Not Found | Zenera Trips",
    description: "The page you are looking for seems to have taken a detour. Let Zenera Trips get you back on track.",
    robots: "noindex, nofollow, noarchive",
  });

  return (
    <div className="min-h-screen bg-[#FFFBF7] dark:bg-[#07111F] text-charcoal dark:text-white font-sans selection:bg-orange selection:text-white flex flex-col justify-between transition-colors duration-200">
      
      {/* Top Navigation Header */}
      <Navbar />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 space-y-10 sm:space-y-12">
        
        {/* 1. Main 404 Hero (Illustration & Recovery CTAs) */}
        <NotFoundHero />

        {/* 2. Popular Pages Discovery Grid */}
        <PopularPagesGrid />

        {/* 3. 24/7 Concierge Support Banner */}
        <NotFoundSupportBanner />

      </main>

      {/* Footer */}
      <Footer />

    </div>
  );
}
