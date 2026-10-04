import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

// Video candidates (picks hero-montage.mp4 with cache-busting parameter to guarantee fresh HD load)
const VIDEO_SOURCES = [
  "/videos/hero-montage.mp4?v=20260827_z125",
  "/videos/zenera-dashboard.mp4?v=20260827_z125",
  "/videos/zenera-hero.mp4",
  "/videos/kerala-goa.mp4",
];

export default function Hero() {
  const [videoSrc, setVideoSrc] = useState(VIDEO_SOURCES[0]);
  const [videoSourceIdx, setVideoSourceIdx] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [videoError, setVideoError] = useState(false);

  const videoRef = useRef(null);

  // Try fallback video candidates if primary name is not found
  const handleVideoError = () => {
    if (videoSourceIdx < VIDEO_SOURCES.length - 1) {
      const nextIdx = videoSourceIdx + 1;
      setVideoSourceIdx(nextIdx);
      setVideoSrc(VIDEO_SOURCES[nextIdx]);
    } else {
      setVideoError(true);
    }
  };

  // Autoplay handler
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsVideoPlaying(true);
            setVideoError(false);
          })
          .catch(() => {
            setIsVideoPlaying(false);
          });
      }
    }
  }, [videoSrc]);

  const scrollToSection = (sectionId) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative w-full h-[88vh] sm:h-[92vh] lg:h-[96vh] min-h-[580px] max-h-[1050px] overflow-hidden flex flex-col justify-between bg-[#07111F]">
      
      {/* 1. Cinematic Video Background Layer (Pure 100% Native HD Clarity, No Blur) */}
      <div className="absolute inset-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        
        {/* Scenic Background Fallback Image (shown only if video fails to load) */}
        {videoError && (
          <div
            className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: "url('/hero-scenic-road.jpg')",
            }}
          />
        )}

        {/* Continuous Drone Video Element - 100% Pure HD Native Clarity with Watermark Crop */}
        <video
          ref={videoRef}
          src={videoSrc}
          muted
          autoPlay
          loop
          playsInline
          preload="auto"
          onPlaying={() => {
            setIsVideoPlaying(true);
            setVideoError(false);
          }}
          onError={handleVideoError}
          className={`absolute inset-0 w-full h-full object-cover scale-[1.25] origin-top-left transition-opacity duration-500 ease-in-out ${
            isVideoPlaying && !videoError ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Subtle Top Shadow for Navbar Readability */}
        <div className="absolute top-0 inset-x-0 h-20 bg-gradient-to-b from-[#07111F]/50 to-transparent pointer-events-none" />

        {/* Clean Text-Area Vignette on Left (Leaves 100% of Center & Right Scenic Landscape Clear) */}
        <div className="absolute inset-y-0 left-0 w-full md:w-1/2 lg:w-5/12 bg-gradient-to-r from-[#07111F]/80 via-[#07111F]/25 to-transparent pointer-events-none" />

        {/* Subtle Bottom Section Transition */}
        <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-[#07111F] to-transparent pointer-events-none" />
      </div>

      {/* 2. Main Hero Content (Left / Center-Left) */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1 flex flex-col justify-center pt-20 sm:pt-24 pb-8">
        <div className="max-w-2xl sm:max-w-3xl text-left space-y-5 sm:space-y-6">
          
          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight leading-[1.12] drop-shadow-md"
          >
            YOUR JOURNEY.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-orangeLight">
              OUR EXPERTISE.
            </span>
          </motion.h1>

          {/* Supporting Description */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="text-white/85 text-xs sm:text-sm lg:text-base leading-relaxed max-w-lg font-normal drop-shadow-sm"
          >
            Discover incredible destinations, find places that match your interests and plan your next journey with Zenera Trips.
          </motion.p>

          {/* Action CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-3.5 flex-wrap pt-2"
          >
            {/* Primary CTA: Book Your Trip */}
            <button
              type="button"
              onClick={() => scrollToSection("book-trip")}
              className="inline-flex items-center gap-2.5 px-6 sm:px-7 py-3.5 sm:py-4 rounded-xl bg-orange hover:bg-orangeLight active:scale-[0.98] text-white font-heading font-bold text-xs sm:text-sm transition-all duration-200 shadow-xl shadow-orange/30 cursor-pointer group btn-subtle-hover"
            >
              <span>Book Your Trip</span>
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
            </button>

            {/* Secondary CTA: Popular Destinations */}
            <button
              type="button"
              onClick={() => scrollToSection("destinations")}
              className="inline-flex items-center gap-2 px-5 sm:px-6 py-3.5 sm:py-4 rounded-xl bg-white/15 hover:bg-white/25 active:scale-[0.98] border border-white/25 text-white font-heading font-semibold text-xs sm:text-sm backdrop-blur-md transition-all duration-200 shadow-md cursor-pointer btn-subtle-hover"
            >
              <span>Popular Destinations</span>
              <svg
                className="w-4 h-4 text-white/80"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
          </motion.div>
        </div>
      </div>

      {/* 3. Bottom Scroll Indicator */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pb-5 sm:pb-7 flex items-center justify-end">
        <button
          type="button"
          onClick={() => scrollToSection("book-trip")}
          className="flex items-center gap-2 text-white/80 hover:text-white text-xs sm:text-sm font-semibold transition-all duration-200 group cursor-pointer"
          aria-label="Scroll down to book trip"
        >
          <span>Explore More</span>
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
  );
}
