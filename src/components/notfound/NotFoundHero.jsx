import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import NotFoundIllustration from "./NotFoundIllustration";

export default function NotFoundHero() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center py-6 sm:py-10">
      
      {/* LEFT COLUMN: 404 Visual & Travel Illustration */}
      <div className="lg:col-span-6 space-y-4 text-center lg:text-left">
        <div className="space-y-1">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-orange block">
            Lost Your Way?
          </span>
          <h1 className="font-extrabold text-7xl sm:text-8xl lg:text-9xl text-transparent bg-clip-text bg-gradient-to-r from-orange via-orangeLight to-amber-500 font-mono tracking-tighter leading-none">
            404
          </h1>
        </div>

        {/* Travel Scene Illustration */}
        <NotFoundIllustration />
      </div>

      {/* RIGHT COLUMN: Messaging & Recovery CTAs */}
      <div className="lg:col-span-6 space-y-6 sm:space-y-7 text-center lg:text-left">
        
        {/* Error Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange/10 text-orange border border-orange/20 text-xs font-extrabold uppercase tracking-wider">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>Scenic Detour Ahead</span>
        </div>

        {/* Heading & Friendly Copy */}
        <div className="space-y-3">
          <h2 className="font-extrabold text-3xl sm:text-4xl lg:text-5xl text-charcoal dark:text-white tracking-tight leading-tight">
            Oops! Page Not Found
          </h2>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-md mx-auto lg:mx-0 leading-relaxed">
            The page you're looking for seems to have taken a detour. Don't worry, we'll help you get back on track.
          </p>
        </div>

        {/* Primary & Secondary Action CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
          {/* Primary CTA: Go to Homepage */}
          <Link
            to="/"
            className="w-full sm:w-auto min-h-[48px] py-3.5 px-7 rounded-2xl bg-orange hover:bg-orangeLight text-white font-extrabold text-xs sm:text-sm transition-all shadow-lg shadow-orange/25 flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span>Go to Homepage →</span>
          </Link>

          {/* Secondary CTA: View Bookings */}
          <Link
            to="/bookings"
            className="w-full sm:w-auto min-h-[48px] py-3.5 px-6 rounded-2xl bg-white dark:bg-[#0E1A29] hover:bg-slate-50 dark:hover:bg-[#152436] border border-[#E2E8F0] dark:border-[#1E2E42] text-charcoal dark:text-white font-bold text-xs sm:text-sm transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            <span>View Bookings</span>
          </Link>
        </div>

      </div>

    </div>
  );
}
