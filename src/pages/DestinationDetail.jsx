import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../../Navbar.jsx";
import Footer from "../../Footer.jsx";
import PeopleAlsoVisit from "../components/tripBuilder/PeopleAlsoVisit.jsx";
import AddStopSearch from "../components/tripBuilder/AddStopSearch.jsx";
import JourneyBuilder from "../components/tripBuilder/JourneyBuilder.jsx";
import DestinationImage from "../components/common/DestinationImage.jsx";
import DestinationTravelGuide from "../components/destinations/DestinationTravelGuide.jsx";
import { DESTINATIONS, DESTINATION_CATEGORIES, getRecommendationsForJourney } from "../data/destinations.js";
import { usePageSEO } from "../hooks/usePageSEO";
import {
  validateCustomStopAgainstRoute,
  filterAllowedStopsForRoute,
} from "../services/routeValidation.service";

export default function DestinationDetailPage() {
  const { destinationId } = useParams();

  // Find destination from dataset
  const destination =
    DESTINATIONS.find(
      (d) => d.id.toLowerCase() === (destinationId || "").toLowerCase()
    ) || DESTINATIONS[0];

  usePageSEO({
    title: `${destination.name}, ${destination.state} — Multi-Stop Travel Guide & Booking — Zenera Trips`,
    description: destination.overview || destination.description,
    robots: "index, follow",
    canonical: `https://zenera-trips.web.app/destinations/${destination.id}`,
  });

  // State: Added Stops for this trip
  const [selectedStops, setSelectedStops] = useState([]);
  const [mobileJourneyOpen, setMobileJourneyOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Primary Route Waypoints
  const primaryWaypoints = useMemo(() => {
    return [
      "Bangalore",
      destination.name,
      ...selectedStops.filter((s) => s.isPrimary).map((s) => s.name),
    ];
  }, [destination.name, selectedStops]);

  // Dynamic recommendations: update when stops are added and filter for route corridor
  const dynamicRecommendations = useMemo(() => {
    const raw = getRecommendationsForJourney(destination.id, selectedStops);
    return filterAllowedStopsForRoute(raw, primaryWaypoints);
  }, [destination.id, selectedStops, primaryWaypoints]);

  // Stop Actions
  const handleAddStop = (stop) => {
    setErrorMessage("");

    if (!stop.isPrimary) {
      const check = validateCustomStopAgainstRoute(stop, primaryWaypoints);
      if (!check.isValid) {
        setErrorMessage(
          check.reason ||
            `"${stop.name || stop}" is too far from your selected route corridor.`
        );
        return;
      }
    }

    if (!selectedStops.some((s) => s.id === stop.id || s.name.toLowerCase() === stop.name.toLowerCase())) {
      setSelectedStops((prev) => [...prev, stop]);
    }
  };

  const handleRemoveStop = (stopId) => {
    setSelectedStops((prev) => prev.filter((s) => s.id !== stopId && s.name.toLowerCase() !== stopId.toLowerCase()));
  };

  const handleMoveStopUp = (index) => {
    if (index > 0) {
      setSelectedStops((prev) => {
        const next = [...prev];
        const temp = next[index];
        next[index] = next[index - 1];
        next[index - 1] = temp;
        return next;
      });
    }
  };

  const handleMoveStopDown = (index) => {
    if (index < selectedStops.length - 1) {
      setSelectedStops((prev) => {
        const next = [...prev];
        const temp = next[index];
        next[index] = next[index + 1];
        next[index + 1] = temp;
        return next;
      });
    }
  };

  const handleReorderStops = (newStops) => {
    setSelectedStops(newStops);
  };

  const handleClearAllStops = () => {
    setSelectedStops([]);
  };

  // Similar / Nearby other destinations
  const similarDestinations = DESTINATIONS.filter(
    (d) => d.id !== destination.id
  ).slice(0, 3);

  const matchedCategories = DESTINATION_CATEGORIES.filter(
    (c) => destination.categories && destination.categories.includes(c.id)
  );

  return (
    <div className="min-h-screen bg-[#FFFBF7] dark:bg-[#07111F] text-charcoal dark:text-white flex flex-col justify-between transition-colors duration-200">
      <Navbar />

      <main className="flex-1 pt-16 sm:pt-20">
        
        {/* ========================================================
            1. DESTINATION HERO
           ======================================================== */}
        <section className="relative min-h-[440px] sm:min-h-[500px] lg:min-h-[540px] bg-[#0B1522] dark:bg-[#050D17] text-white flex flex-col justify-between overflow-hidden">
          {/* Main Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url('${destination.image}')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#07111F] via-[#07111F]/60 to-black/40" />

          {/* Breadcrumb & Navigation */}
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-8">
            <nav className="flex items-center gap-2 text-xs font-semibold text-white/80">
              <Link to="/" className="hover:text-orange transition-colors">
                Home
              </Link>
              <span>/</span>
              <Link to="/destinations" className="hover:text-orange transition-colors">
                Destinations
              </Link>
              <span>/</span>
              <span className="text-white font-bold">{destination.name}</span>
            </nav>
          </div>

          {/* Hero Main Content */}
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pb-12 sm:pb-16 space-y-4">
            {/* Category Tags */}
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full bg-orange text-white font-heading font-bold text-xs shadow-md">
                {destination.state}
              </span>
              {matchedCategories.map((c) => (
                <Link
                  key={c.id}
                  to={`/destinations?category=${c.id}`}
                  className="px-3 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-white text-xs font-medium hover:bg-black/70 transition-colors"
                >
                  {c.name}
                </Link>
              ))}
            </div>

            <h1 className="font-heading font-extrabold text-4xl sm:text-6xl lg:text-7xl text-white tracking-tight leading-[1.08] drop-shadow-md uppercase">
              {destination.name}
            </h1>

            <p className="text-base sm:text-xl text-orangeLight font-medium max-w-2xl">
              Explore {destination.name} and discover places worth adding to your journey.
            </p>

            <div className="flex items-center gap-6 text-xs sm:text-sm text-white/90 pt-2 flex-wrap">
              <span>{destination.distance}</span>
              <span>Ideal Stay: {destination.duration}</span>
              <span>Altitude: {destination.altitude}</span>
              {destination.nearbyStops && (
                <span className="px-2.5 py-0.5 rounded-full bg-orange/20 border border-orange/40 text-orangeLight font-semibold">
                  {destination.nearbyStops.length} Places People Also Visit
                </span>
              )}
            </div>
          </div>
        </section>

        {/* ========================================================
            2. MAIN CONTENT GRID (LEFT: About, Recommendations, Search | RIGHT: Journey)
           ======================================================== */}
        <section className="py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
              
              {/* Left Column: Destination Details + People Also Visit + Search Stop (8 cols) */}
              <div className="lg:col-span-8 space-y-12">
                
                {/* EXPANDABLE MINI TRAVEL GUIDE ("KNOW ABOUT [DESTINATION]") */}
                <DestinationTravelGuide
                  destination={destination}
                  onSelectPlace={handleAddStop}
                />

                {/* PEOPLE ALSO VISIT */}
                <PeopleAlsoVisit
                  destination={destination}
                  recommendations={dynamicRecommendations}
                  selectedStops={selectedStops}
                  onAddStop={handleAddStop}
                  onRemoveStop={handleRemoveStop}
                  title="PEOPLE ALSO VISIT"
                  subtitle={`Places travelers often explore while visiting ${destination.name}. Suggestions only — customize as you like.`}
                />

                {/* Global Error Notice */}
                {errorMessage && (
                  <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs sm:text-sm flex items-center justify-between gap-3 shadow-xs">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <p className="font-semibold">{errorMessage}</p>
                    </div>
                    <button onClick={() => setErrorMessage("")} className="text-xs underline font-bold cursor-pointer">
                      Dismiss
                    </button>
                  </div>
                )}

                {/* ADD YOUR OWN STOP */}
                <div className="bg-white dark:bg-[#0E1A29] p-6 sm:p-8 rounded-3xl border border-[#E2E8F0] dark:border-[#1E2E42] shadow-sm">
                  <AddStopSearch
                    selectedStops={selectedStops}
                    onAddStop={handleAddStop}
                    onRemoveStop={handleRemoveStop}
                    currentDestinationId={destination.id}
                    currentDestination={destination}
                    pickupLocation="Bangalore"
                    primaryWaypoints={primaryWaypoints}
                  />
                </div>

                {/* Top Sights in Destination */}
                {destination.attractions && destination.attractions.length > 0 && (
                  <div className="space-y-4">
                    <h2 className="font-heading font-extrabold text-2xl text-charcoal dark:text-white uppercase tracking-tight">
                      Top Sights in {destination.name}
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {destination.attractions.map((att, idx) => (
                        <div
                          key={idx}
                          className="p-5 rounded-2xl bg-white dark:bg-[#0E1A29] border border-[#E2E8F0] dark:border-[#1E2E42] shadow-xs space-y-2"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-orange/10 text-orange flex items-center justify-center text-xs font-bold font-mono">
                              0{idx + 1}
                            </span>
                            <h3 className="font-heading font-bold text-base text-charcoal dark:text-white">
                              {att.name}
                            </h3>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
                            {att.desc}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Highlights Checklist */}
                {destination.highlights && destination.highlights.length > 0 && (
                  <div className="bg-white dark:bg-[#0E1A29] p-6 sm:p-8 rounded-3xl border border-[#E2E8F0] dark:border-[#1E2E42] shadow-sm space-y-4">
                    <h2 className="font-heading font-extrabold text-xl text-charcoal dark:text-white uppercase tracking-tight">
                      Experience Highlights
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {destination.highlights.map((h, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                          <span className="text-orange font-bold">•</span>
                          <span>{h}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Similar / Other Destinations */}
                <div className="space-y-4 pt-2">
                  <h2 className="font-heading font-extrabold text-xl text-charcoal dark:text-white uppercase tracking-tight">
                    Explore Other Destinations
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {similarDestinations.map((sim) => (
                      <Link
                        key={sim.id}
                        to={`/destinations/${sim.id}`}
                        className="group bg-white dark:bg-[#0E1A29] rounded-2xl border border-[#E2E8F0] dark:border-[#1E2E42] overflow-hidden shadow-xs hover:border-orange transition-all flex flex-col justify-between"
                      >
                        <div className="relative">
                          <DestinationImage
                            src={sim.image}
                            alt={sim.alt || sim.name}
                            aspectRatio="aspect-[16/10]"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
                          <span className="absolute bottom-2 left-2 text-white font-heading font-bold text-sm">
                            {sim.name}
                          </span>
                        </div>
                        <div className="p-3 text-xs text-slate-500 dark:text-slate-400">
                          {sim.tagline}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

              </div>

              {/* Right Column: Sticky YOUR JOURNEY Panel (4 cols) */}
              <div className="lg:col-span-4 sticky top-24 space-y-6 w-full min-w-0">
                
                {/* YOUR JOURNEY */}
                <JourneyBuilder
                  destination={destination}
                  selectedStops={selectedStops}
                  primaryWaypoints={primaryWaypoints}
                  pickupLocation="Bangalore"
                  onAddStop={handleAddStop}
                  onRemoveStop={handleRemoveStop}
                  onMoveStopUp={handleMoveStopUp}
                  onMoveStopDown={handleMoveStopDown}
                  onReorderStops={handleReorderStops}
                  onClearAllStops={handleClearAllStops}
                />

                {/* Travel Information Box */}
                <div className="bg-white dark:bg-[#0E1A29] p-6 rounded-3xl border border-[#E2E8F0] dark:border-[#1E2E42] shadow-sm space-y-4">
                  <h4 className="font-heading font-bold text-sm text-charcoal dark:text-white uppercase tracking-wider">
                    Travel Information
                  </h4>

                  <div className="space-y-3 text-xs">
                    <div className="flex items-start gap-2.5">
                      <div>
                        <strong className="block text-charcoal dark:text-white">Best Time to Visit</strong>
                        <span className="text-slate-500 dark:text-slate-400">{destination.bestTime}</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <div>
                        <strong className="block text-charcoal dark:text-white">Recommended Stay</strong>
                        <span className="text-slate-500 dark:text-slate-400">{destination.duration}</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <div>
                        <strong className="block text-charcoal dark:text-white">Typical Weather</strong>
                        <span className="text-slate-500 dark:text-slate-400">{destination.weather || "Mild & Pleasant"}</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          </div>
        </section>

        {/* Mobile Floating Journey Bottom Bar */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 p-4 bg-white/95 dark:bg-[#07111F]/95 backdrop-blur-md border-t border-[#E2E8F0] dark:border-[#1E2E42] shadow-2xl flex items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-bold text-orange uppercase block">
              Your Journey
            </span>
            <span className="text-xs font-heading font-bold text-charcoal dark:text-white">
              {destination.name} {selectedStops.length > 0 && `+ ${selectedStops.length} stop${selectedStops.length > 1 ? "s" : ""}`}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setMobileJourneyOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-orange text-white font-heading font-bold text-xs shadow-md cursor-pointer"
          >
            <span>View Journey ({selectedStops.length + 1})</span>
          </button>
        </div>

        {/* Mobile Journey Modal / Drawer */}
        <AnimatePresence>
          {mobileJourneyOpen && (
            <div className="lg:hidden fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs p-4">
              <motion.div
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 100 }}
                className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-3xl"
              >
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setMobileJourneyOpen(false)}
                    className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-slate-100 dark:bg-[#152436] text-slate-500 hover:text-charcoal dark:hover:text-white flex items-center justify-center text-sm font-bold cursor-pointer"
                    title="Close"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>

                  <JourneyBuilder
                    destination={destination}
                    selectedStops={selectedStops}
                    primaryWaypoints={primaryWaypoints}
                    pickupLocation="Bangalore"
                    onAddStop={handleAddStop}
                    onRemoveStop={handleRemoveStop}
                    onMoveStopUp={handleMoveStopUp}
                    onMoveStopDown={handleMoveStopDown}
                    onReorderStops={handleReorderStops}
                    onClearAllStops={handleClearAllStops}
                  />
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </main>

      <Footer />
    </div>
  );
}
