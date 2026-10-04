import { useState, useMemo, useEffect, useCallback } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../../Navbar.jsx";
import Footer from "../../Footer.jsx";
import { useTheme } from "../context/ThemeContext";
import { usePageSEO } from "../hooks/usePageSEO";
import { TOUR_PACKAGES } from "../data/packages.js";
import { LINKS } from "../../index.js";

// Enhanced package metadata mapping images, pricing, ratings, and categories
const PACKAGE_METADATA = {
  "coorg-escape": {
    image: "/destinations/coorg.jpg",
    price: 8499,
    pricePerPerson: 2833,
    rating: 4.9,
    reviews: 342,
    categoryType: "family",
    location: "Coorg, Karnataka",
    badge: "Best Seller",
    shortDesc: "Experience lush coffee plantations, misty Western Ghats trails, cascading Abbey Falls and sacred monasteries.",
    amenities: ["Private SUV", "All Tolls & Permits", "Sightseeing", "Chauffeur Stay"],
  },
  "ooty-hills": {
    image: "/destinations/ooty.jpg",
    price: 8999,
    pricePerPerson: 2999,
    rating: 4.8,
    reviews: 289,
    categoryType: "honeymoon",
    location: "Ooty, Tamil Nadu",
    badge: "Family Favorite",
    shortDesc: "Misty heights, aromatic tea factories, scenic Pykara lake boating, and panoramic views from Doddabetta Peak.",
    amenities: ["AC Innova", "Hill Road Permits", "Sightseeing", "Forest Transit"],
  },
  "chikmagalur-retreat": {
    image: "/destinations/chikmagalur.jpg",
    price: 6499,
    pricePerPerson: 3249,
    rating: 4.9,
    reviews: 412,
    categoryType: "weekend",
    location: "Chikmagalur, Karnataka",
    badge: "Weekend Special",
    shortDesc: "Trek to Mullayanagiri peak, explore Hoysala architecture in Belur, and unwind in secluded coffee valley retreats.",
    amenities: ["Private SUV", "Doorstep Pickup", "Fuel & Parking", "Coffee Walk"],
  },
  "mysore-heritage": {
    image: "/destinations/mysore.jpg",
    price: 4999,
    pricePerPerson: 2499,
    rating: 4.7,
    reviews: 198,
    categoryType: "luxury",
    location: "Mysore, Karnataka",
    badge: "Express Route",
    shortDesc: "Grand palace illumination, hilltop Chamundi temple, Tipu Sultan's heritage and evening Brindavan garden fountains.",
    amenities: ["Private Sedan", "Expressway Tolls", "All Sights Covered", "City Guide Driver"],
  },
  "wayanad-trail": {
    image: "/destinations/kerala.jpg",
    price: 8799,
    pricePerPerson: 2933,
    rating: 4.8,
    reviews: 265,
    categoryType: "adventure",
    location: "Wayanad, Kerala",
    badge: "Kerala Escapes",
    shortDesc: "Prehistoric Edakkal rock carvings, Banasura earth dam, dense rainforest drives, and breathtaking waterfalls.",
    amenities: ["Dedicated Vehicle", "Interstate Permits", "Border Taxes", "Night Charges"],
  },
  "gokarna-coastal": {
    image: "/destinations/gokarna.jpg",
    price: 9999,
    pricePerPerson: 3333,
    rating: 4.9,
    reviews: 520,
    categoryType: "adventure",
    location: "Gokarna, Karnataka",
    badge: "Group Favorite",
    shortDesc: "Iconic 5-beach cliffside treks, the majestic Murudeshwar Shiva monument, seaside shacks, and sacred coastal temples.",
    amenities: ["Tempo Traveller / SUV", "Driver Allowances", "Toll Clearance", "Group Pickup"],
  },
};

const CATEGORIES = [
  { id: "all", label: "All Packages", icon: "compass" },
  { id: "family", label: "Family Packages", icon: "users" },
  { id: "honeymoon", label: "Honeymoon & Hills", icon: "heart" },
  { id: "adventure", label: "Adventure & Nature", icon: "mountain" },
  { id: "luxury", label: "Luxury & Heritage", icon: "crown" },
  { id: "weekend", label: "Weekend Getaways", icon: "sun" },
];

export default function TourPackages() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isDark } = useTheme();

  usePageSEO({
    title: "Handcrafted Tour Packages | Zenera Trips",
    description: "Explore handpicked tour packages from Bangalore to Coorg, Ooty, Chikmagalur, Gokarna, Mysore, and Wayanad with verified chauffeur vehicles.",
    robots: "index, follow",
    canonical: "https://zenera-trips.web.app/packages",
  });

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState(searchParams.get("destination") || "");
  const [searchDate, setSearchDate] = useState("");
  const [travelersCount, setTravelersCount] = useState("2");
  const [activeCategory, setActiveCategory] = useState("all");
  const [sortBy, setSortBy] = useState("popular");
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Wishlist State with localStorage persistence
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem("zenera_wishlist");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const toggleWishlist = useCallback((pkgId, e) => {
    if (e) e.stopPropagation();
    setWishlist((prev) => {
      const updated = prev.includes(pkgId)
        ? prev.filter((id) => id !== pkgId)
        : [...prev, pkgId];
      try {
        localStorage.setItem("zenera_wishlist", JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  // Merge packages with metadata
  const fullPackages = useMemo(() => {
    return TOUR_PACKAGES.map((pkg) => {
      const meta = PACKAGE_METADATA[pkg.id] || {
        image: "/destinations/coorg.jpg",
        price: 7999,
        pricePerPerson: 2666,
        rating: 4.8,
        reviews: 210,
        categoryType: "family",
        location: `${pkg.destination}, India`,
        badge: pkg.badge || "Popular",
        shortDesc: pkg.tagline,
        amenities: ["Commercial Vehicle", "All Tolls Included", "Sightseeing"],
      };

      return {
        ...pkg,
        ...meta,
        isWishlisted: wishlist.includes(pkg.id),
      };
    });
  }, [wishlist]);

  // Filter & Sort packages
  const filteredPackages = useMemo(() => {
    let result = fullPackages.filter((pkg) => {
      // Destination Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesDest = pkg.destination.toLowerCase().includes(q);
        const matchesName = pkg.name.toLowerCase().includes(q);
        const matchesLoc = pkg.location.toLowerCase().includes(q);
        if (!matchesDest && !matchesName && !matchesLoc) return false;
      }

      // Category filter
      if (activeCategory !== "all") {
        if (pkg.categoryType !== activeCategory) return false;
      }

      return true;
    });

    // Sorting
    if (sortBy === "price-asc") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === "rating") {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === "duration") {
      result.sort((a, b) => a.duration.localeCompare(b.duration));
    } else {
      // Default: Popular (by reviews & rating)
      result.sort((a, b) => b.reviews - a.reviews);
    }

    return result;
  }, [fullPackages, searchQuery, activeCategory, sortBy]);

  // Handle Search Submission
  const handleSearch = (e) => {
    if (e) e.preventDefault();
    if (searchQuery) {
      setSearchParams({ destination: searchQuery });
    } else {
      setSearchParams({});
    }
  };

  // Direct Book Trip action from package
  const handleBookPackage = (pkg) => {
    navigate(
      `/book?destination=${encodeURIComponent(pkg.destination)}&route=${encodeURIComponent(pkg.name)}&vehicle=${encodeURIComponent(pkg.suggestedVehicle)}&pickup=Bangalore`
    );
  };

  // Modal Escape key listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setSelectedPackage(null);
        setIsMobileFilterOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Category Icon Renderer
  const renderCategoryIcon = (iconName) => {
    switch (iconName) {
      case "compass":
        return (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
          </svg>
        );
      case "users":
        return (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        );
      case "heart":
        return (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
          </svg>
        );
      case "mountain":
        return (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
          </svg>
        );
      case "crown":
        return (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14" />
          </svg>
        );
      case "sun":
        return (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFBF7] dark:bg-[#07111F] text-charcoal dark:text-white font-sans selection:bg-orange selection:text-white flex flex-col justify-between transition-colors duration-200">
      
      {/* Top Main Navigation */}
      <Navbar />

      <main className="flex-1 pt-18 sm:pt-20">
        
        {/* ========================================================
            1. HERO SECTION (Compact & Scenic)
           ======================================================== */}
        <section className="relative overflow-hidden pt-12 pb-20 sm:pt-16 sm:pb-24 px-4 sm:px-6 lg:px-8 border-b border-[#E2E8F0] dark:border-[#1E2E42]">
          
          {/* Background Realistic Scenery Image */}
          <div className="absolute inset-0 z-0">
            <img
              src="/tour-packages-hero.jpg"
              alt="Scenic high mountain lake and tranquil landscape"
              className="w-full h-full object-cover object-center"
            />
            {/* Luminous Light/Dark Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-white via-white/85 to-white/60 dark:hidden" />
            <div className="hidden dark:block absolute inset-0 bg-gradient-to-t from-[#07111F] via-[#07111F]/85 to-[#07111F]/60" />
            <div className="absolute inset-0 bg-radial-gradient from-transparent to-black/20" />
          </div>

          {/* Hero Header Content */}
          <div className="relative z-10 max-w-4xl mx-auto text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-orange/10 border border-orange/20 text-orange text-xs font-semibold backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-orange animate-pulse" />
              <span>Verified Outstation Packages</span>
            </div>

            <h1 className="font-extrabold text-3xl sm:text-5xl lg:text-6xl text-charcoal dark:text-white tracking-tight leading-[1.12]">
              Tour Packages
            </h1>

            <p className="text-sm sm:text-lg text-slate-600 dark:text-slate-300 font-medium max-w-2xl mx-auto leading-relaxed">
              Handpicked tour packages for your perfect getaway with private commercial vehicles & expert hill drivers.
            </p>
          </div>

          {/* ========================================================
              2. SEARCH PANEL (Overlapping Hero)
             ======================================================== */}
          <div className="relative z-10 max-w-4xl mx-auto mt-8 sm:mt-10">
            <form
              onSubmit={handleSearch}
              className="bg-white dark:bg-[#0E1A29] border border-[#E2E8F0] dark:border-[#1E2E42] rounded-3xl p-3 sm:p-4 shadow-xl shadow-slate-900/5 dark:shadow-2xl grid grid-cols-1 sm:grid-cols-12 gap-3 items-center"
            >
              {/* Destination Field */}
              <div className="sm:col-span-6 p-2 sm:p-2.5 rounded-2xl bg-[#F5F7FA] dark:bg-[#0A1420] border border-[#E2E8F0] dark:border-[#1E2E42] flex items-center gap-3">
                <svg className="w-5 h-5 text-orange ml-1 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div className="flex-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Destination
                  </label>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Where do you want to go? (e.g. Coorg, Ooty)"
                    className="w-full bg-transparent text-xs sm:text-sm font-semibold text-charcoal dark:text-white placeholder:text-slate-400 outline-none"
                  />
                </div>
              </div>

              {/* Date Field */}
              <div className="sm:col-span-4 p-2 sm:p-2.5 rounded-2xl bg-[#F5F7FA] dark:bg-[#0A1420] border border-[#E2E8F0] dark:border-[#1E2E42] flex items-center gap-2.5">
                <svg className="w-5 h-5 text-orange ml-1 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <div className="flex-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Travel Date
                  </label>
                  <input
                    type="date"
                    value={searchDate}
                    onChange={(e) => setSearchDate(e.target.value)}
                    className="w-full bg-transparent text-xs sm:text-sm font-semibold text-charcoal dark:text-white outline-none cursor-pointer"
                  />
                </div>
              </div>

              {/* Search CTA */}
              <div className="sm:col-span-2">
                <button
                  type="submit"
                  className="w-full py-3.5 px-4 rounded-2xl bg-orange hover:bg-orangeLight active:scale-[0.99] text-white font-bold text-xs sm:text-sm tracking-wide transition-all duration-200 shadow-md shadow-orange/25 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <span>Search</span>
                </button>
              </div>
            </form>
          </div>

        </section>

        {/* ========================================================
            3. CATEGORIES & SORT CONTROLS
           ======================================================== */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0] dark:border-[#1E2E42]">
            
            {/* Category Filter Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {CATEGORIES.map((cat) => {
                const isSelected = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveCategory(cat.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                      isSelected
                        ? "bg-orange/10 border-2 border-orange text-orange shadow-sm shadow-orange/15"
                        : "bg-white dark:bg-[#0E1A29] border border-[#E2E8F0] dark:border-[#1E2E42] text-slate-600 dark:text-slate-300 hover:border-orange/40 hover:text-orange"
                    }`}
                  >
                    <span className={isSelected ? "text-orange" : "text-slate-400"}>
                      {renderCategoryIcon(cat.icon)}
                    </span>
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Desktop Sort Dropdown & Count */}
            <div className="flex items-center justify-between md:justify-end gap-3 shrink-0">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {filteredPackages.length} {filteredPackages.length === 1 ? "Package" : "Packages"}
              </span>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider hidden sm:inline">
                  Sort:
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-white dark:bg-[#0E1A29] border border-[#E2E8F0] dark:border-[#1E2E42] rounded-xl px-3 py-2 text-xs font-semibold text-charcoal dark:text-white outline-none cursor-pointer focus:border-orange"
                >
                  <option value="popular">Popular</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                  <option value="duration">Duration</option>
                </select>
              </div>
            </div>

          </div>
        </section>

        {/* ========================================================
            4. POPULAR TOUR PACKAGES GRID
           ======================================================== */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-extrabold text-2xl sm:text-3xl text-charcoal dark:text-white tracking-tight">
                Popular Tour Packages
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                All-inclusive outstation itineraries with doorstep pickup from Bangalore
              </p>
            </div>

            {activeCategory !== "all" || searchQuery ? (
              <button
                type="button"
                onClick={() => {
                  setActiveCategory("all");
                  setSearchQuery("");
                  setSearchParams({});
                }}
                className="text-xs text-orange font-bold hover:underline cursor-pointer"
              >
                Clear Filters
              </button>
            ) : null}
          </div>

          {/* Empty State */}
          {filteredPackages.length === 0 ? (
            <div className="bg-white dark:bg-[#0E1A29] border border-[#E2E8F0] dark:border-[#1E2E42] rounded-3xl p-12 text-center space-y-4 max-w-lg mx-auto shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-orange/10 border border-orange/20 text-orange flex items-center justify-center mx-auto">
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
                </svg>
              </div>
              <h3 className="font-extrabold text-xl text-charcoal dark:text-white">
                No packages found
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                We couldn't find any packages matching "<strong>{searchQuery}</strong>". Try clearing your destination search or selecting a different category.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setActiveCategory("all");
                  setSearchParams({});
                }}
                className="px-6 py-2.5 rounded-xl bg-orange text-white font-bold text-xs hover:bg-orangeLight transition-all shadow-md shadow-orange/20 cursor-pointer"
              >
                Show All Packages
              </button>
            </div>
          ) : (
            /* 3-Column Responsive Package Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {filteredPackages.map((pkg) => {
                return (
                  <motion.div
                    key={pkg.id}
                    layout
                    whileHover={{ y: -5 }}
                    transition={{ duration: 0.25 }}
                    className="group bg-white dark:bg-[#0E1A29] border border-[#E2E8F0] dark:border-[#1E2E42] hover:border-orange/50 dark:hover:border-orange/50 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-slate-900/5 dark:hover:shadow-black/50 transition-all flex flex-col justify-between"
                  >
                    {/* Card Top Image Container */}
                    <div className="relative h-52 sm:h-56 overflow-hidden">
                      <img
                        src={pkg.image}
                        alt={pkg.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                      {/* Top Badges: Badge + Wishlist */}
                      <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between z-10">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-white/90 dark:bg-black/80 backdrop-blur-md text-orange border border-orange/20 shadow-sm">
                          {pkg.badge}
                        </span>

                        <button
                          type="button"
                          onClick={(e) => toggleWishlist(pkg.id, e)}
                          className={`p-2 rounded-full backdrop-blur-md transition-transform active:scale-90 cursor-pointer shadow-sm ${
                            pkg.isWishlisted
                              ? "bg-rose-500 text-white"
                              : "bg-black/40 hover:bg-black/60 text-white"
                          }`}
                          aria-label="Wishlist Package"
                        >
                          <svg
                            className="w-4 h-4"
                            viewBox="0 0 24 24"
                            fill={pkg.isWishlisted ? "currentColor" : "none"}
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                          </svg>
                        </button>
                      </div>

                      {/* Bottom Image Stats: Duration & Rating */}
                      <div className="absolute bottom-3 left-3.5 right-3.5 flex items-center justify-between text-white text-xs font-semibold z-10">
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/50 backdrop-blur-md">
                          <svg className="w-3.5 h-3.5 text-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{pkg.duration}</span>
                        </div>

                        <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/50 backdrop-blur-md">
                          <svg className="w-3.5 h-3.5 text-amber-400 fill-current" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span>{pkg.rating}</span>
                          <span className="text-white/70 text-[10px]">({pkg.reviews})</span>
                        </div>
                      </div>
                    </div>

                    {/* Card Body Information */}
                    <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                          <svg className="w-3.5 h-3.5 text-orange shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          </svg>
                          <span>{pkg.location}</span>
                        </div>

                        <h3 className="font-extrabold text-lg text-charcoal dark:text-white tracking-tight leading-snug group-hover:text-orange transition-colors">
                          {pkg.name}
                        </h3>

                        <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                          {pkg.shortDesc}
                        </p>
                      </div>

                      {/* Package Inclusions Pills */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {pkg.amenities.slice(0, 3).map((item, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] font-semibold px-2.5 py-0.5 rounded-md bg-[#F5F7FA] dark:bg-[#0A1420] border border-[#E2E8F0] dark:border-[#1E2E42] text-slate-600 dark:text-slate-300"
                          >
                            • {item}
                          </span>
                        ))}
                      </div>

                      {/* Price & CTA Action */}
                      <div className="pt-4 border-t border-[#E2E8F0] dark:border-[#1E2E42] flex items-center justify-between">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">
                            Starting Price
                          </span>
                          <div className="flex items-baseline gap-1">
                            <span className="font-extrabold text-xl sm:text-2xl text-orange font-mono">
                              ₹{pkg.price.toLocaleString("en-IN")}
                            </span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400">
                              / group
                            </span>
                          </div>
                        </div>

                        <Link
                          to={`/packages/${pkg.id}`}
                          className="py-2.5 px-4 rounded-xl bg-orange hover:bg-orangeLight text-white font-bold text-xs transition-all shadow-md shadow-orange/20 flex items-center gap-1 cursor-pointer group-hover:scale-102"
                        >
                          <span>View Details</span>
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M5 12h14" />
                            <path d="m12 5 7 7-7 7" />
                          </svg>
                        </Link>
                      </div>

                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

        </section>

      </main>

      {/* ========================================================
          7. INTERACTIVE PACKAGE DETAIL MODAL
         ======================================================== */}
      <AnimatePresence>
        {selectedPackage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPackage(null)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25 }}
              className="relative w-full max-w-3xl bg-white dark:bg-[#0E1A29] border border-[#E2E8F0] dark:border-[#1E2E42] rounded-3xl overflow-hidden shadow-2xl z-10 max-h-[90vh] flex flex-col"
            >
              {/* Modal Header Media */}
              <div className="relative h-56 sm:h-64 shrink-0">
                <img
                  src={selectedPackage.image}
                  alt={selectedPackage.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setSelectedPackage(null)}
                  className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center cursor-pointer transition-colors"
                  aria-label="Close modal"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                {/* Title & Badge */}
                <div className="absolute bottom-4 left-5 right-5 text-white">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-orange text-white">
                      {selectedPackage.badge}
                    </span>
                    <span className="text-xs text-white/90 font-semibold">
                      {selectedPackage.location}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-xl sm:text-2xl tracking-tight">
                    {selectedPackage.name}
                  </h3>
                </div>
              </div>

              {/* Modal Scrollable Content */}
              <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1 text-xs sm:text-sm">
                
                {/* 4 Key Package Specs */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-2xl bg-[#F5F7FA] dark:bg-[#0A1420] border border-[#E2E8F0] dark:border-[#1E2E42]">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Duration</span>
                    <span className="font-extrabold text-charcoal dark:text-white text-xs sm:text-sm">{selectedPackage.duration}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-[#F5F7FA] dark:bg-[#0A1420] border border-[#E2E8F0] dark:border-[#1E2E42]">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Distance</span>
                    <span className="font-extrabold text-charcoal dark:text-white text-xs sm:text-sm">{selectedPackage.distance}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-[#F5F7FA] dark:bg-[#0A1420] border border-[#E2E8F0] dark:border-[#1E2E42]">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Best Season</span>
                    <span className="font-extrabold text-charcoal dark:text-white text-xs sm:text-sm">{selectedPackage.bestTime}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-[#F5F7FA] dark:bg-[#0A1420] border border-[#E2E8F0] dark:border-[#1E2E42]">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Vehicle</span>
                    <span className="font-extrabold text-orange text-xs sm:text-sm">{selectedPackage.suggestedVehicle}</span>
                  </div>
                </div>

                {/* Route Overview */}
                <div className="space-y-1.5">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">Route Plan</h4>
                  <p className="p-3 rounded-2xl bg-[#F5F7FA] dark:bg-[#0A1420] border border-[#E2E8F0] dark:border-[#1E2E42] font-semibold text-charcoal dark:text-white text-xs">
                    {selectedPackage.routeDescription}
                  </p>
                </div>

                {/* Highlights */}
                <div className="space-y-2">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">Package Highlights</h4>
                  <ul className="space-y-1.5 text-slate-600 dark:text-slate-300">
                    {selectedPackage.highlights?.map((h, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <svg className="w-3.5 h-3.5 text-orange shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Destinations Covered */}
                <div className="space-y-2">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">Sightseeing Spots Covered</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedPackage.majorDestinations?.map((d, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 rounded-xl bg-orange/10 border border-orange/20 text-orange font-bold text-xs"
                      >
                        {d}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Inclusions & Exclusions Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-2 p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
                    <h5 className="font-bold text-xs text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                      Inclusions
                    </h5>
                    <ul className="space-y-1 text-slate-600 dark:text-slate-300 text-xs">
                      {selectedPackage.inclusions?.map((inc, i) => (
                        <li key={i}>• {inc}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-2 p-4 rounded-2xl bg-rose-500/5 border border-rose-500/20">
                    <h5 className="font-bold text-xs text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                      Exclusions
                    </h5>
                    <ul className="space-y-1 text-slate-600 dark:text-slate-300 text-xs">
                      {selectedPackage.exclusions?.map((exc, i) => (
                        <li key={i}>• {exc}</li>
                      ))}
                    </ul>
                  </div>
                </div>

              </div>

              {/* Modal Footer CTA */}
              <div className="p-4 sm:p-6 bg-[#F5F7FA] dark:bg-[#0A1420] border-t border-[#E2E8F0] dark:border-[#1E2E42] flex items-center justify-between shrink-0">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Package Starting</span>
                  <span className="font-extrabold text-2xl text-orange font-mono">
                    ₹{selectedPackage.price.toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedPackage(null)}
                    className="px-4 py-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#1E2E42] text-xs font-semibold cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={() => handleBookPackage(selectedPackage)}
                    className="px-6 py-2.5 rounded-xl bg-orange hover:bg-orangeLight text-white font-bold text-xs sm:text-sm transition-all shadow-md shadow-orange/25 flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Book This Package</span>
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M5 12h14" />
                      <path d="m12 5 7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Footer */}
      <Footer />

    </div>
  );
}
