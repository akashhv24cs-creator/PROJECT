import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import Navbar from "../../Navbar.jsx";
import Footer from "../../Footer.jsx";
import DestinationImage from "../components/common/DestinationImage.jsx";
import { DESTINATIONS } from "../data/destinations.js";
import { usePageSEO } from "../hooks/usePageSEO";
import { useTheme } from "../context/ThemeContext";

// Configurable Auto-Motion Constants
const AUTO_SCROLL_SPEED = 0.5; // Subtle horizontal auto-scroll (px per frame)
const INACTIVITY_RESUME_DELAY = 3500; // Time in ms to resume auto-scroll after user interaction

// Curated Category Filter Tabs (Original Clean Labels)
const CATEGORY_TABS = [
  { id: "all", label: "All" },
  { id: "nature-wildlife", label: "Nature" },
  { id: "beaches-coastal", label: "Beaches" },
  { id: "culture-heritage", label: "Heritage" },
  { id: "pilgrimage-spiritual", label: "Pilgrimage" },
  { id: "hill-stations", label: "Hill Stations" },
  { id: "adventure", label: "Adventure" },
];

export default function DestinationsPage() {
  usePageSEO({
    title: "Destinations — Cinematic Travel Film Strip | Zenera Trips",
    description:
      "Discover iconic places across South India. Browse our interactive horizontal destination film strip and plan your next chauffeur-driven road trip.",
    robots: "index, follow",
    canonical: "https://zenera-trips.web.app/destinations",
  });

  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [searchParams, setSearchParams] = useSearchParams();

  // Category filter state
  const initialCategory = searchParams.get("category") || "all";
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);

  // Active centered destination index
  const [activeIndex, setActiveIndex] = useState(0);
  const [toastMessage, setToastMessage] = useState(null);

  // Whether all destination cards grid is expanded
  const [showAllCards, setShowAllCards] = useState(false);

  // Interaction & Auto-motion state
  const [isUserInteracting, setIsUserInteracting] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Desktop mouse parallax for active card
  const [mouseParallax, setMouseParallax] = useState({ x: 0, y: 0 });

  // DOM Refs
  const stripContainerRef = useRef(null);
  const allCardsSectionRef = useRef(null);
  const cardRefs = useRef([]);
  const animFrameRef = useRef(null);
  const inactivityTimerRef = useRef(null);
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const scrollStartXRef = useRef(0);
  const lastScrollLeftRef = useRef(0);
  const isProgrammaticScrollRef = useRef(false);

  // Touch handling refs
  const touchStartXRef = useRef(0);
  const touchStartYRef = useRef(0);
  const isHorizontalSwipeRef = useRef(null);

  // Prefers reduced motion check
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  // Sync category state with URL search param
  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat && CATEGORY_TABS.some((t) => t.id === cat)) {
      setSelectedCategory(cat);
    } else {
      setSelectedCategory("all");
    }
  }, [searchParams]);

  const handleCategorySelect = (catId) => {
    setSelectedCategory(catId);
    setActiveIndex(0);
    if (catId === "all") {
      searchParams.delete("category");
      setSearchParams(searchParams);
    } else {
      setSearchParams({ category: catId });
    }
  };

  // Filter destinations based on selected category
  const filteredDestinations = useMemo(() => {
    if (selectedCategory === "all") return DESTINATIONS;
    return DESTINATIONS.filter(
      (dest) => dest.categories && dest.categories.includes(selectedCategory)
    );
  }, [selectedCategory]);

  const totalCount = filteredDestinations.length;
  const currentDest = filteredDestinations[activeIndex] || filteredDestinations[0] || DESTINATIONS[0];

  // Secondary "People Also Visit" / All Destinations list
  const displayedCardsList = useMemo(() => {
    if (showAllCards) {
      return filteredDestinations;
    }
    // By default show first 6 or 8 destinations in the grid
    return filteredDestinations.slice(0, 6);
  }, [filteredDestinations, showAllCards]);

  // ============================================================
  // SCROLL TO CENTER HELPER
  // ============================================================
  const scrollToDestination = useCallback(
    (index, smooth = true) => {
      const container = stripContainerRef.current;
      const cardEl = cardRefs.current[index];
      if (!container || !cardEl) return;

      isProgrammaticScrollRef.current = true;
      const containerCenter = container.clientWidth / 2;
      const cardCenter = cardEl.offsetLeft + cardEl.offsetWidth / 2;
      const targetScrollLeft = cardCenter - containerCenter;

      container.scrollTo({
        left: Math.max(0, targetScrollLeft),
        behavior: smooth && !prefersReducedMotion ? "smooth" : "auto",
      });

      setActiveIndex(index);

      setTimeout(() => {
        isProgrammaticScrollRef.current = false;
      }, 600);
    },
    [prefersReducedMotion]
  );

  // Center the initial destination on mount and category change
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToDestination(0, false);
    }, 100);
    return () => clearTimeout(timer);
  }, [selectedCategory, scrollToDestination]);

  // ============================================================
  // CENTER DETECTION LOGIC (Calculates closest card to center)
  // ============================================================
  const updateActiveFromScroll = useCallback(() => {
    if (isProgrammaticScrollRef.current) return;
    const container = stripContainerRef.current;
    if (!container || cardRefs.current.length === 0) return;

    const containerCenter = container.scrollLeft + container.clientWidth / 2;
    let closestIndex = 0;
    let minDistance = Infinity;

    cardRefs.current.forEach((cardEl, idx) => {
      if (!cardEl) return;
      const cardCenter = cardEl.offsetLeft + cardEl.offsetWidth / 2;
      const distance = Math.abs(containerCenter - cardCenter);
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = idx;
      }
    });

    if (closestIndex !== activeIndex && closestIndex >= 0 && closestIndex < totalCount) {
      setActiveIndex(closestIndex);
    }
  }, [activeIndex, totalCount]);

  // Snap to nearest destination when user stops scrolling/dragging
  const snapToNearest = useCallback(() => {
    const container = stripContainerRef.current;
    if (!container || cardRefs.current.length === 0) return;

    const containerCenter = container.scrollLeft + container.clientWidth / 2;
    let closestIndex = 0;
    let minDistance = Infinity;

    cardRefs.current.forEach((cardEl, idx) => {
      if (!cardEl) return;
      const cardCenter = cardEl.offsetLeft + cardEl.offsetWidth / 2;
      const distance = Math.abs(containerCenter - cardCenter);
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = idx;
      }
    });

    scrollToDestination(closestIndex, true);
  }, [scrollToDestination]);

  // Reset inactivity timer for auto-motion
  const handleUserActivity = useCallback(() => {
    setIsUserInteracting(true);
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    inactivityTimerRef.current = setTimeout(() => {
      setIsUserInteracting(false);
    }, INACTIVITY_RESUME_DELAY);
  }, []);

  // ============================================================
  // CONTINUOUS HORIZONTAL MOTION LOOP (Does not stop on hover)
  // ============================================================
  useEffect(() => {
    if (prefersReducedMotion) return;

    const container = stripContainerRef.current;
    if (!container) return;

    const autoScroll = () => {
      if (!isDraggingRef.current && !isProgrammaticScrollRef.current) {
        if (container.scrollLeft + container.clientWidth >= container.scrollWidth - 10) {
          scrollToDestination(0, true);
        } else {
          container.scrollLeft += AUTO_SCROLL_SPEED;
          updateActiveFromScroll();
        }
      }
      animFrameRef.current = requestAnimationFrame(autoScroll);
    };

    animFrameRef.current = requestAnimationFrame(autoScroll);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [prefersReducedMotion, scrollToDestination, updateActiveFromScroll]);

  // ============================================================
  // MOUSE DRAGGING HANDLERS (Desktop)
  // ============================================================
  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    isDraggingRef.current = true;
    dragStartXRef.current = e.clientX;
    scrollStartXRef.current = stripContainerRef.current?.scrollLeft || 0;
    handleUserActivity();
  };

  const handleMouseMove = (e) => {
    if (!isDraggingRef.current || !stripContainerRef.current) return;
    e.preventDefault();
    const deltaX = e.clientX - dragStartXRef.current;
    stripContainerRef.current.scrollLeft = scrollStartXRef.current - deltaX;
    updateActiveFromScroll();
    handleUserActivity();
  };

  const handleMouseUp = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    snapToNearest();
    handleUserActivity();
  };

  // ============================================================
  // TOUCH SWIPE HANDLERS (Mobile)
  // ============================================================
  const handleTouchStart = (e) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
    isHorizontalSwipeRef.current = null;
    handleUserActivity();
  };

  const handleTouchMove = (e) => {
    const deltaX = Math.abs(e.touches[0].clientX - touchStartXRef.current);
    const deltaY = Math.abs(e.touches[0].clientY - touchStartYRef.current);

    if (isHorizontalSwipeRef.current === null) {
      isHorizontalSwipeRef.current = deltaX > deltaY && deltaX > 8;
    }

    if (isHorizontalSwipeRef.current) {
      handleUserActivity();
    }
  };

  const handleTouchEnd = (e) => {
    if (isHorizontalSwipeRef.current) {
      const endX = e.changedTouches[0].clientX;
      const swipeDistance = endX - touchStartXRef.current;

      if (Math.abs(swipeDistance) > 40) {
        if (swipeDistance < 0) {
          handleNext();
        } else {
          handlePrev();
        }
      } else {
        snapToNearest();
      }
    }
    isHorizontalSwipeRef.current = null;
    handleUserActivity();
  };

  const handleNext = () => {
    const nextIdx = (activeIndex + 1) % totalCount;
    scrollToDestination(nextIdx, true);
    handleUserActivity();
  };

  const handlePrev = () => {
    const prevIdx = (activeIndex - 1 + totalCount) % totalCount;
    scrollToDestination(prevIdx, true);
    handleUserActivity();
  };

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (document.activeElement?.tagName === "INPUT") return;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrev();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, totalCount]);

  // Active Card Desktop Mouse Parallax
  const handleCardMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 12;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 12;
    setMouseParallax({ x, y });
  };

  const handleCardMouseLeave = () => {
    setMouseParallax({ x: 0, y: 0 });
  };

  // Add to Trip Handler
  const handleAddToTrip = (dest) => {
    try {
      const existing = JSON.parse(sessionStorage.getItem("zenera_selected_stops") || "[]");
      const alreadyAdded = existing.some((s) => s.id === dest.id);

      if (!alreadyAdded) {
        const updated = [
          ...existing,
          {
            id: dest.id,
            name: dest.name,
            state: dest.state,
            category: dest.categories?.[0] || "city-escapes",
            distance: dest.distance,
            image: dest.image,
            alt: dest.alt,
          },
        ];
        sessionStorage.setItem("zenera_selected_stops", JSON.stringify(updated));
        setToastMessage(`Added ${dest.name} to your trip plan!`);
      } else {
        setToastMessage(`${dest.name} is already in your trip plan.`);
      }
    } catch {
      setToastMessage(`Added ${dest.name} to your trip plan!`);
    }

    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // View All Button Click
  const handleViewAllDestinations = () => {
    setShowAllCards(true);
    setTimeout(() => {
      allCardsSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  return (
    <div className="min-h-screen bg-[#FFFBF7] dark:bg-[#07111F] text-charcoal dark:text-white flex flex-col justify-between transition-colors duration-200 selection:bg-orange selection:text-white font-sans">
      <Navbar />

      {/* Floating Add-to-Trip Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl bg-charcoal dark:bg-white text-white dark:text-charcoal shadow-2xl font-heading font-bold text-xs sm:text-sm border border-orange/40 flex items-center gap-2.5 backdrop-blur-md"
          >
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 pt-24 pb-16">
        {/* ============================================================ */}
        {/* 1. HERO HEADER & CATEGORY BAR (Exact Previous Clean Design) */}
        {/* ============================================================ */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-orange/10 border border-orange/20 text-orange text-xs font-heading font-extrabold uppercase tracking-wider mb-2">
            <span>Curated Road Experiences</span>
          </div>

          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl uppercase tracking-tight text-charcoal dark:text-white leading-none">
            Popular Destinations
          </h1>
          <p className="text-xs sm:text-sm lg:text-base text-slate-500 dark:text-slate-400 mt-2 max-w-xl mx-auto leading-relaxed">
            Discover breathtaking getaways across South India. Swipe or drag through our interactive route strip below.
          </p>

          {/* Minimal Filter Tabs Pill Bar */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 overflow-x-auto no-scrollbar py-4 mt-2">
            {CATEGORY_TABS.map((tab) => {
              const isActive = selectedCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleCategorySelect(tab.id)}
                  className={`px-4 sm:px-5 py-2 rounded-full font-heading font-bold text-xs sm:text-sm uppercase tracking-wider transition-all duration-300 cursor-pointer ${isActive
                    ? "bg-orange text-white shadow-md shadow-orange/30 scale-105"
                    : "bg-white dark:bg-[#0A1628] border border-slate-200 dark:border-[#1E2E42] text-slate-600 dark:text-slate-300 hover:border-orange hover:text-orange"
                    }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </section>

        {/* ============================================================ */}
        {/* 2. INTERACTIVE HORIZONTAL FILM STRIP */}
        {/* ============================================================ */}
        <section className="relative w-full py-4 sm:py-6" onMouseLeave={handleMouseUp}>
          {/* Film Strip Horizontal Scroll Rail */}
          <div
            ref={stripContainerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onScroll={updateActiveFromScroll}
            className="flex items-center gap-6 sm:gap-8 lg:gap-10 overflow-x-auto no-scrollbar scroll-smooth cursor-grab active:cursor-grabbing select-none px-[12vw] sm:px-[22vw] lg:px-[30vw] py-8"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {filteredDestinations.map((dest, idx) => {
              const isActive = idx === activeIndex;

              return (
                <div
                  key={dest.id || idx}
                  ref={(el) => (cardRefs.current[idx] = el)}
                  onClick={() => {
                    if (!isActive) scrollToDestination(idx, true);
                  }}
                  onMouseMove={isActive ? handleCardMouseMove : undefined}
                  onMouseLeave={isActive ? handleCardMouseLeave : undefined}
                  className={`relative shrink-0 rounded-3xl overflow-hidden transition-all duration-700 ease-out cursor-pointer ${isActive
                    ? "w-[82vw] sm:w-[480px] lg:w-[540px] xl:w-[600px] h-[480px] sm:h-[530px] lg:h-[570px] z-30 shadow-2xl ring-1 ring-orange/30 scale-100 opacity-100"
                    : "w-[56vw] sm:w-[280px] lg:w-[320px] h-[360px] sm:h-[400px] lg:h-[440px] z-10 scale-[0.82] sm:scale-[0.85] opacity-60 hover:opacity-85 brightness-90 contrast-95"
                    }`}
                  style={{
                    transform: isActive
                      ? `scale(1) translate3d(${mouseParallax.x}px, ${mouseParallax.y}px, 0)`
                      : undefined,
                  }}
                >
                  {/* Destination Photo Image */}
                  <div className="absolute inset-0 w-full h-full bg-slate-900 overflow-hidden">
                    <DestinationImage
                      src={dest.image}
                      alt={dest.alt || dest.name}
                      aspectRatio="aspect-auto"
                      className="w-full h-full"
                      imgClassName={`w-full h-full object-cover transition-transform duration-700 ease-out ${isActive ? "scale-105" : "scale-100"
                        }`}
                    />
                    {/* Atmospheric Dark Gradient Overlay */}
                    <div
                      className={`absolute inset-0 transition-opacity duration-500 ${isActive
                        ? "bg-gradient-to-t from-black/95 via-black/40 to-black/20"
                        : "bg-gradient-to-t from-black/85 via-black/50 to-transparent"
                        }`}
                    />
                  </div>

                  {/* ACTIVE DESTINATION EXPANDED CONTENT */}
                  {isActive && (
                    <div className="absolute inset-0 p-6 sm:p-8 lg:p-10 flex flex-col justify-between text-white z-20 pointer-events-auto">
                      {/* Top Header Badge & Stop Number */}
                      <div className="flex items-center justify-between">
                        <span className="px-3 py-1 rounded-full bg-orange text-[10px] sm:text-xs font-heading font-extrabold text-white uppercase tracking-widest shadow-md flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                          <span>ACTIVE DISCOVERY</span>
                        </span>

                        <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[11px] font-heading font-bold text-white uppercase">
                          {idx + 1} / {totalCount}
                        </span>
                      </div>

                      {/* Bottom Content Area */}
                      <div className="space-y-4">
                        {/* Destination Title & Tagline */}
                        <div className="space-y-1">
                          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl uppercase tracking-tight text-white drop-shadow-lg leading-tight">
                            {dest.name}
                          </h2>
                          <p className="text-sm sm:text-base text-orange font-heading font-bold uppercase tracking-wider">
                            {dest.tagline || `${dest.state || "South India"} Road Trip`}
                          </p>
                        </div>

                        {/* Minimal Highlights (3 Pills) */}
                        {dest.highlights && dest.highlights.length > 0 && (
                          <div className="flex items-center gap-2 flex-wrap pt-1">
                            {dest.highlights.slice(0, 3).map((item, hIdx) => (
                              <span
                                key={hIdx}
                                className="px-3 py-1 rounded-xl bg-white/15 backdrop-blur-md border border-white/20 text-white font-medium text-xs sm:text-sm"
                              >
                                • {typeof item === "string" ? item.split("&")[0].trim() : item}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Action Buttons: Explore & Add to Trip */}
                        <div className="flex items-center gap-3 sm:gap-4 pt-2">
                          <Link
                            to={`/destinations/${dest.id}`}
                            className="flex-1 px-5 sm:px-6 py-3 rounded-2xl bg-orange hover:bg-orangeLight active:scale-[0.98] text-white font-heading font-bold text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-orange/40 transition-all inline-flex items-center justify-center gap-2 group cursor-pointer btn-subtle-hover"
                          >
                            <span>Explore Destination</span>
                            <svg
                              className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                            >
                              <path d="M5 12h14" />
                              <path d="m12 5 7 7-7 7" />
                            </svg>
                          </Link>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddToTrip(dest);
                            }}
                            className="px-5 sm:px-6 py-3 rounded-2xl bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 text-white font-heading font-bold text-xs sm:text-sm uppercase tracking-wider transition-all cursor-pointer shadow-md"
                          >
                            + Add to Trip
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* INACTIVE SIDE DESTINATION */}
                  {!isActive && (
                    <div className="absolute inset-0 p-5 flex flex-col justify-end text-white z-20 pointer-events-none">
                      <span className="font-heading font-extrabold text-lg sm:text-xl uppercase tracking-tight text-white drop-shadow-md">
                        {dest.name}
                      </span>
                      <span className="text-[11px] text-white/70 uppercase font-medium">
                        {dest.state || "Explore"}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Left & Right Arrow Navigation Controls */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between mt-4">
            {/* Prev Button */}
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous Destination"
              className="px-4 sm:px-5 py-2.5 rounded-2xl bg-white dark:bg-[#0A1628] border border-slate-200 dark:border-[#1E2E42] hover:border-orange text-charcoal dark:text-white font-heading font-bold text-xs sm:text-sm transition-all shadow-md flex items-center gap-2 cursor-pointer group"
            >
              <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="m15 18-6-6 6-6" />
              </svg>
              <span>Previous</span>
            </button>

            {/* Minimal Progress Indicator */}
            <div className="flex flex-col items-center gap-1.5">
              <span className="text-xs font-heading font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                {String(activeIndex + 1).padStart(2, "0")} / {String(totalCount).padStart(2, "0")}
              </span>

              {/* Progress Segment Dots */}
              <div className="flex items-center gap-1.5">
                {filteredDestinations.map((_, pIdx) => (
                  <button
                    key={pIdx}
                    type="button"
                    onClick={() => scrollToDestination(pIdx, true)}
                    className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${pIdx === activeIndex
                      ? "w-6 bg-orange shadow-xs shadow-orange"
                      : "w-1.5 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400 dark:hover:bg-slate-500"
                      }`}
                    aria-label={`Jump to slide ${pIdx + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Next Button */}
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next Destination"
              className="px-4 sm:px-5 py-2.5 rounded-2xl bg-orange hover:bg-orangeLight text-white font-heading font-bold text-xs sm:text-sm transition-all shadow-md shadow-orange/30 flex items-center gap-2 cursor-pointer group"
            >
              <span>Next</span>
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </div>
        </section>

        {/* ============================================================ */}
        {/* 3. DESTINATIONS CARDS SECTION (With View All Action) */}
        {/* ============================================================ */}
        <section
          ref={allCardsSectionRef}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 sm:mt-24 pt-12 border-t border-slate-200 dark:border-[#1E2E42]"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-charcoal dark:text-white uppercase tracking-tight">
                {showAllCards ? "ALL DESTINATIONS" : "PEOPLE ALSO VISIT"}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                {showAllCards
                  ? `Browse all ${filteredDestinations.length} verified destinations across South India.`
                  : "Popular pairing destinations along similar scenic highway corridors."}
              </p>
            </div>

            {/* View All Option Button */}
            {!showAllCards ? (
              <button
                type="button"
                onClick={handleViewAllDestinations}
                className="text-xs sm:text-sm font-heading font-bold text-orange hover:underline uppercase inline-flex items-center gap-1.5 cursor-pointer"
              >
                <span>View All Destinations ({filteredDestinations.length}) →</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowAllCards(false)}
                className="text-xs sm:text-sm font-heading font-bold text-slate-500 hover:text-orange uppercase inline-flex items-center gap-1.5 cursor-pointer"
              >
                <span>Show Less ↑</span>
              </button>
            )}
          </div>

          {/* Destination Cards Responsive Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {displayedCardsList.map((dest) => (
              <div
                key={dest.id}
                className="rounded-3xl border border-[#E2E8F0] dark:border-[#1E2E42] bg-white dark:bg-[#0E1A29] overflow-hidden shadow-sm hover:shadow-2xl hover:border-orange/50 transition-all duration-300 flex flex-col justify-between group"
              >
                {/* Card Image Banner */}
                <Link to={`/destinations/${dest.id}`} className="relative aspect-[16/10] overflow-hidden bg-slate-900 block cursor-pointer">
                  <DestinationImage
                    src={dest.image}
                    alt={dest.alt || dest.name}
                    aspectRatio="aspect-auto"
                    className="w-full h-full"
                    imgClassName="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent pointer-events-none" />

                  {/* Top Badges */}
                  <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between pointer-events-none">
                    <span className="px-3 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-white font-heading font-bold text-[11px] uppercase tracking-wider">
                      {dest.state}
                    </span>
                  </div>

                  {/* Bottom Title on Image */}
                  <div className="absolute bottom-3.5 left-4 right-4 text-white pointer-events-none">
                    <span className="text-[11px] font-extrabold uppercase tracking-widest text-orangeLight block">
                      {dest.tagline}
                    </span>
                    <h3 className="font-heading font-extrabold text-2xl uppercase tracking-tight leading-tight mt-0.5">
                      {dest.name}
                    </h3>
                  </div>
                </Link>

                {/* Card Body Details */}
                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    {/* Distance & Duration Badge */}
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
                      <span className="flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                        <span>{dest.distance}</span>
                      </span>
                      <span className="text-[11px] font-bold text-slate-400 uppercase">
                        {dest.duration}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                      {dest.description}
                    </p>

                    {/* Highlights Chips */}
                    {dest.highlights && dest.highlights.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap pt-1">
                        {dest.highlights.slice(0, 3).map((hl, hIdx) => (
                          <span
                            key={hIdx}
                            className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-[#152436] text-slate-700 dark:text-slate-300 font-medium text-[11px] border border-[#E2E8F0] dark:border-[#1E2E42]"
                          >
                            • {typeof hl === "string" ? hl.split("&")[0].trim() : hl}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Card Actions Footer */}
                  <div className="pt-4 border-t border-[#E2E8F0] dark:border-[#1E2E42] flex items-center gap-2.5">
                    <Link
                      to={`/destinations/${dest.id}`}
                      className="flex-1 py-3 px-4 rounded-xl bg-orange hover:bg-orangeLight text-white font-heading font-bold text-xs uppercase tracking-wider shadow-md shadow-orange/25 transition-all text-center"
                    >
                      Explore Details →
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleAddToTrip(dest)}
                      title="Add to Trip Planner"
                      className="py-3 px-3.5 rounded-xl bg-slate-100 dark:bg-[#152436] hover:bg-orange/10 hover:text-orange text-slate-700 dark:text-slate-300 font-heading font-bold text-xs uppercase tracking-wider border border-[#E2E8F0] dark:border-[#1E2E42] transition-all cursor-pointer shrink-0"
                    >
                      + Trip
                    </button>

                    <button
                      type="button"
                      onClick={() => navigate(`/book?destination=${encodeURIComponent(dest.route || dest.name)}`)}
                      title="Book cab directly"
                      className="py-3 px-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-heading font-bold text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer shrink-0"
                    >
                      Book
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom View All Toggle Banner if not expanded */}
          {!showAllCards && filteredDestinations.length > 6 && (
            <div className="text-center mt-10">
              <button
                type="button"
                onClick={handleViewAllDestinations}
                className="px-6 py-3.5 rounded-2xl bg-orange hover:bg-orangeLight text-white font-heading font-bold text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-orange/30 transition-all cursor-pointer inline-flex items-center gap-2"
              >
                <span>View All {filteredDestinations.length} Destinations</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
