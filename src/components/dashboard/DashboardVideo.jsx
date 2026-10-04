import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";

export default function DashboardVideo({ onBookClick }) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

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

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // Autoplay may be restricted by browser until user interaction
        setIsPlaying(false);
      });
    }
  }, []);

  return (
    <section className="relative w-full overflow-hidden rounded-3xl border border-cream/15 bg-charcoal shadow-[0_20px_50px_rgba(0,0,0,0.7)] hover:border-orange/30 transition-all duration-500 my-8">
      {/* Video Container with Aspect Ratio */}
      <div className="relative w-full h-[420px] sm:h-[500px] lg:h-[560px] flex items-center justify-center overflow-hidden group">
        {/* Video Element */}
        <video
          ref={videoRef}
          autoPlay
          muted={isMuted}
          loop
          playsInline
          poster="/images/video-poster.jpg"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          className="absolute inset-0 w-full h-full object-cover scale-[1.18] origin-[40%_40%] transition-transform duration-700 ease-out"
          style={{
            filter: "contrast(1.08) saturate(1.15) brightness(1.02)",
            WebkitFilter: "contrast(1.08) saturate(1.15) brightness(1.02)",
            imageRendering: "-webkit-optimize-contrast",
            willChange: "transform, opacity",
            backfaceVisibility: "hidden",
          }}
        >
          <source src="/videos/zenera-dashboard.mp4" type="video/mp4" />
          {/* Fallback if video tag is not supported */}
        </video>

        {/* Optimized Charcoal Overlay for Maximum Video Prominence & Text Readability (No Blur, Crystal Clear) */}
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/50 to-transparent pointer-events-none" />

        {/* Video Content Overlay */}
        <div className="relative z-10 text-center px-4 sm:px-6 max-w-3xl mx-auto flex flex-col items-center">
          {/* Eyebrow Badge */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="mb-4"
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-orange/40 bg-orange/15 text-orange text-xs font-semibold uppercase tracking-widest backdrop-blur-md shadow-lg shadow-orange/20">
              <span className="w-2 h-2 rounded-full bg-orange animate-ping" />
              Zenera Experience
            </span>
          </motion.div>

          {/* Main Headline */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            className="font-heading font-extrabold text-4xl sm:text-5xl lg:text-6xl text-cream tracking-tight leading-[1.1] mb-3 drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]"
          >
            Your group. Your ride.
          </motion.h2>

          {/* Subtitle / Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="font-heading font-bold text-2xl sm:text-3xl text-orange mb-8 tracking-wide drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]"
          >
            Chalo Kahi Bhi.
          </motion.p>

          {/* Book A Trip Action Button */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
          >
            <button
              onClick={onBookClick}
              className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-orange text-white font-heading font-bold text-base sm:text-lg hover:bg-orangeLight hover:shadow-orange/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-xl shadow-orange/30 group border border-orange/40 cursor-pointer"
            >
              <span>BOOK A TRIP</span>
              <svg
                className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </motion.div>
        </div>

        {/* Video Control Buttons (Play/Pause & Mute/Unmute) */}
        <div className="absolute bottom-5 right-5 z-20 flex items-center gap-2">
          <button
            onClick={togglePlay}
            className="p-3 rounded-full bg-charcoal/70 border border-cream/20 text-cream/80 hover:text-orange hover:bg-charcoal hover:border-orange/40 backdrop-blur-md transition-all duration-200 cursor-pointer shadow-lg"
            title={isPlaying ? "Pause Video" : "Play Video"}
            aria-label={isPlaying ? "Pause Video" : "Play Video"}
          >
            {isPlaying ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          <button
            onClick={toggleMute}
            className="p-3 rounded-full bg-charcoal/70 border border-cream/20 text-cream/80 hover:text-orange hover:bg-charcoal hover:border-orange/40 backdrop-blur-md transition-all duration-200 cursor-pointer shadow-lg"
            title={isMuted ? "Unmute Audio" : "Mute Audio"}
            aria-label={isMuted ? "Unmute Audio" : "Mute Audio"}
          >
            {isMuted ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </section>
  );
}

