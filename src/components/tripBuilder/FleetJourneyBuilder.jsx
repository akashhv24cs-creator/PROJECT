import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DestinationImage from "../common/DestinationImage.jsx";
import { DESTINATIONS } from "../../data/destinations.js";
import { isSameLocation } from "../../services/routeValidation.service.ts";
import InlineCustomStopInput from "./InlineCustomStopInput.jsx";

const POPULAR_PICKUPS = [
  "Bangalore, Karnataka",
  "Kempegowda Int'l Airport (BLR)",
  "Indiranagar, Bangalore",
  "Koramangala, Bangalore",
  "Whitefield, Bangalore",
  "Electronic City, Bangalore",
  "Jayanagar, Bangalore",
  "Majestic Railway Station",
];

/**
 * FleetJourneyBuilder
 * 
 * Provides interactive, destination-grade stop selection and journey timeline
 * directly inside the Fleet / Booking page.
 * 
 * Enforces:
 * - Pickup Origin and Primary Destination CANNOT be the same location.
 * - Point A & Point B clean, responsive UI without overflowing badges.
 * - Full editability of origin, destination, and custom stops.
 */
export default function FleetJourneyBuilder({
  pickupLocation = "Bangalore, Karnataka",
  onChangePickupLocation,
  destination,
  onChangeDestination,
  selectedStops = [],
  selectedVehicle,
  vehiclePriceDisplay = "₹16/km",
  primaryWaypoints = [],
  onAddStop,
  onRemoveStop,
  onEditStopName,
  onMoveStopUp,
  onMoveStopDown,
  onReorderStops,
  onClearAllStops,
}) {
  const [isPrimaryModalOpen, setIsPrimaryModalOpen] = useState(false);
  const [isDestSelectorOpen, setIsDestSelectorOpen] = useState(false);
  const [destSearchQuery, setDestSearchQuery] = useState("");
  const [isAddingInlineStop, setIsAddingInlineStop] = useState(false);
  const [isDragOverZone, setIsDragOverZone] = useState(false);
  const [draggedItemIndex, setDraggedItemIndex] = useState(null);
  const [dragOverItemIndex, setDragOverItemIndex] = useState(null);

  // Point A Pickup inline editing state & validation error
  const [isEditingPickup, setIsEditingPickup] = useState(false);
  const [pickupInput, setPickupInput] = useState(pickupLocation || "Bangalore, Karnataka");
  const [pickupError, setPickupError] = useState("");
  const pickupInputRef = useRef(null);

  // Destination selection modal error
  const [destModalError, setDestModalError] = useState("");

  // Custom stop renaming state
  const [editingStopId, setEditingStopId] = useState(null);
  const [editingStopName, setEditingStopName] = useState("");
  const stopEditInputRef = useRef(null);

  // Keep pickupInput in sync with external prop
  useEffect(() => {
    if (!isEditingPickup) {
      setPickupInput(pickupLocation || "Bangalore, Karnataka");
      setPickupError("");
    }
  }, [pickupLocation, isEditingPickup]);

  // Focus pickup input when edit mode opens
  useEffect(() => {
    if (isEditingPickup && pickupInputRef.current) {
      pickupInputRef.current.focus();
      pickupInputRef.current.select();
    }
  }, [isEditingPickup]);

  // Focus stop edit input when rename opens
  useEffect(() => {
    if (editingStopId && stopEditInputRef.current) {
      stopEditInputRef.current.focus();
      stopEditInputRef.current.select();
    }
  }, [editingStopId]);

  const handleSavePickup = () => {
    setPickupError("");
    const trimmed = pickupInput.trim();
    if (!trimmed) {
      setPickupError("Please enter a valid pickup address.");
      return;
    }

    // Guard: Prevent Source and Destination from being the exact same location
    if (destination && isSameLocation(trimmed, destination)) {
      setPickupError(
        `Pickup origin cannot be the same as destination (${destination.name}). Please enter a different pickup point or change your destination.`
      );
      return;
    }

    if (onChangePickupLocation) {
      onChangePickupLocation(trimmed);
    }
    setIsEditingPickup(false);
  };

  const handleSelectPickupPreset = (preset) => {
    setPickupError("");
    if (destination && isSameLocation(preset, destination)) {
      setPickupError(`Pickup origin cannot be the same as destination (${destination.name}).`);
      return;
    }
    setPickupInput(preset);
    if (onChangePickupLocation) {
      onChangePickupLocation(preset);
    }
    setIsEditingPickup(false);
  };

  const handleStartEditingStop = (stop) => {
    setEditingStopId(stop.id);
    setEditingStopName(stop.name);
  };

  const handleSaveStopName = (stopId) => {
    const trimmed = editingStopName.trim();
    if (trimmed && onEditStopName) {
      onEditStopName(stopId, trimmed);
    }
    setEditingStopId(null);
  };

  // Available other primary destinations to add as extra stops
  const availablePrimaryDestinations = DESTINATIONS.filter(
    (d) =>
      (!destination || d.id !== destination.id) &&
      !selectedStops.some((s) => s.id === d.id || s.name?.toLowerCase() === d.name?.toLowerCase())
  );

  // Filtered list for Changing Primary Destination (Point B)
  const filteredAllDestinations = DESTINATIONS.filter((d) => {
    if (!destSearchQuery.trim()) return true;
    const q = destSearchQuery.toLowerCase();
    return (
      d.name.toLowerCase().includes(q) ||
      (d.state && d.state.toLowerCase().includes(q)) ||
      (d.tagline && d.tagline.toLowerCase().includes(q)) ||
      (d.categories && d.categories.some((c) => c.toLowerCase().includes(q)))
    );
  });

  // Count primary destinations vs custom stops
  const primaryStopsCount = (destination ? 1 : 0) + selectedStops.filter((s) => s.isPrimary).length;
  const customStopsCount = selectedStops.filter((s) => !s.isPrimary).length;

  // Helper for dynamic timeline letter: 0 -> A, 1 -> B, 2 -> C, 3 -> D, etc.
  const getTimelineLetter = (index) => {
    return String.fromCharCode(65 + index);
  };

  const handleAddPrimaryDestination = (primaryDest) => {
    if (pickupLocation && isSameLocation(primaryDest, pickupLocation)) {
      alert(`Cannot add ${primaryDest.name} because it matches your pickup origin (${pickupLocation.split(",")[0]}).`);
      return;
    }
    if (onAddStop) {
      onAddStop({
        id: primaryDest.id,
        name: primaryDest.name,
        image: primaryDest.image,
        alt: primaryDest.alt,
        state: primaryDest.state,
        tagline: primaryDest.tagline,
        duration: primaryDest.duration,
        categoryName: "Primary Destination",
        isPrimary: true,
      });
    }
    setIsPrimaryModalOpen(false);
  };

  const handleSelectNewPrimaryDestination = (dest) => {
    setDestModalError("");
    // Guard: Prevent Source and Destination from being the exact same location
    if (pickupLocation && isSameLocation(dest, pickupLocation)) {
      setDestModalError(
        `Destination cannot be the same as pickup origin (${pickupLocation.split(",")[0]}). Please choose a different destination.`
      );
      return;
    }

    if (onChangeDestination) {
      onChangeDestination(dest.id || dest);
    }
    setIsDestSelectorOpen(false);
    setDestSearchQuery("");
  };

  const handleReorder = (fromIdx, toIdx) => {
    if (
      fromIdx === toIdx ||
      fromIdx < 0 ||
      toIdx < 0 ||
      fromIdx >= selectedStops.length ||
      toIdx >= selectedStops.length
    ) {
      return;
    }
    const updated = [...selectedStops];
    const [moved] = updated.splice(fromIdx, 1);
    updated.splice(toIdx, 0, moved);

    if (onReorderStops) {
      onReorderStops(updated);
    } else if (fromIdx < toIdx) {
      for (let i = fromIdx; i < toIdx; i++) onMoveStopDown?.(i);
    } else {
      for (let i = fromIdx; i > toIdx; i--) onMoveStopUp?.(i);
    }
  };

  const handleDropOnContainer = (e) => {
    e.preventDefault();
    setIsDragOverZone(false);
    setDragOverItemIndex(null);

    const jsonStr = e.dataTransfer.getData("application/json");
    if (jsonStr) {
      try {
        const stopData = JSON.parse(jsonStr);
        if (stopData && onAddStop) {
          onAddStop(stopData);
        }
      } catch (err) {
        console.error("Failed to parse dropped stop:", err);
      }
    }
  };

  const scrollToFleets = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "copy";
        setIsDragOverZone(true);
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
          setIsDragOverZone(false);
        }
      }}
      onDrop={handleDropOnContainer}
      className={`w-full min-w-0 bg-white dark:bg-[#0E1A29] p-5 sm:p-6 rounded-3xl border transition-all duration-200 shadow-xl space-y-5 relative overflow-hidden ${
        isDragOverZone
          ? "border-orange ring-2 ring-orange/40 bg-orange/5 dark:bg-[#152436]"
          : "border-[#E2E8F0] dark:border-[#1E2E42]"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#1E2E42] pb-3.5">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-orange animate-pulse" />
            <h3 className="font-heading font-extrabold text-base sm:text-lg uppercase tracking-wider text-charcoal dark:text-white">
              YOUR JOURNEY
            </h3>
          </div>
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-orange block font-heading mt-0.5">
            Personalized Outstation Route
          </span>
        </div>

        {selectedStops.length > 0 && (
          <button
            type="button"
            onClick={onClearAllStops}
            className="text-xs text-slate-400 hover:text-red-500 transition-colors cursor-pointer font-medium px-2 py-1 rounded-lg hover:bg-red-500/10"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Journey Timeline Sequence */}
      <div className="space-y-3 w-full min-w-0">
        
        {/* POINT A: Pickup Origin (Start Point - Editable) */}
        <div className="flex items-start gap-2.5 sm:gap-3 w-full min-w-0">
          <div className="flex flex-col items-center shrink-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-heading font-extrabold text-xs shadow-md shadow-emerald-500/20 shrink-0">
              A
            </div>
            <div className="w-0.5 h-6 bg-slate-300 dark:bg-[#1E2E42] my-1" />
          </div>

          <div className="flex-1 min-w-0 p-3 rounded-2xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 flex flex-col justify-between gap-2 shadow-xs transition-all">
            {isEditingPickup ? (
              <div className="space-y-2 w-full">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
                    Edit Pickup Location
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setPickupInput(pickupLocation || "Bangalore, Karnataka");
                      setPickupError("");
                      setIsEditingPickup(false);
                    }}
                    className="text-[11px] font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    ✕ Cancel
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <input
                    ref={pickupInputRef}
                    type="text"
                    value={pickupInput}
                    onChange={(e) => {
                      setPickupInput(e.target.value);
                      setPickupError("");
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleSavePickup();
                      } else if (e.key === "Escape") {
                        setIsEditingPickup(false);
                      }
                    }}
                    placeholder="Enter pickup address / city..."
                    className="flex-1 py-1.5 px-2.5 rounded-xl bg-white dark:bg-[#07111F] border border-emerald-500/40 text-xs font-semibold text-charcoal dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
                  <button
                    type="button"
                    onClick={handleSavePickup}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-heading font-bold text-xs shadow-xs cursor-pointer shrink-0"
                  >
                    Save
                  </button>
                </div>

                {pickupError && (
                  <p className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 leading-tight">
                    {pickupError}
                  </p>
                )}

                {/* Quick Presets */}
                <div className="pt-1">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Quick Pick:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {POPULAR_PICKUPS.slice(0, 4).map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => handleSelectPickupPreset(preset)}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-white dark:bg-[#0E1A29] border border-emerald-500/20 text-slate-600 dark:text-slate-300 hover:bg-emerald-500/10 hover:text-emerald-600 cursor-pointer font-medium transition-colors"
                      >
                        {preset.split(",")[0]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3 w-full">
                <div
                  onClick={() => setIsEditingPickup(true)}
                  className="min-w-0 flex-1 overflow-hidden cursor-pointer group"
                  title="Click to edit pickup origin"
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block truncate">
                    Pickup Origin
                  </span>
                  <strong className="font-heading font-bold text-xs sm:text-sm text-charcoal dark:text-white truncate block group-hover:text-emerald-600 transition-colors mt-0.5">
                    {pickupLocation || "Bangalore, Karnataka"}
                  </strong>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsEditingPickup(true)}
                    className="px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] uppercase tracking-wider cursor-pointer transition-colors flex items-center gap-1"
                  >
                    <span>✎</span>
                    <span>Change</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* POINT B: Anchor Primary Destination (Editable / Switchable) */}
        {destination ? (
          <div className="flex items-start gap-2.5 sm:gap-3 w-full min-w-0">
            <div className="flex flex-col items-center shrink-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-orange text-white flex items-center justify-center font-heading font-extrabold text-xs shadow-md shadow-orange/20 shrink-0">
                B
              </div>
              {(selectedStops.length > 0 || isAddingInlineStop || isDragOverZone) && (
                <div className="w-0.5 h-6 bg-gradient-to-b from-orange to-slate-300 dark:to-[#1E2E42] my-1" />
              )}
            </div>

            <div className="flex-1 min-w-0 p-3 rounded-2xl bg-orange/5 dark:bg-orange/10 border border-orange/20 flex items-center justify-between gap-3 shadow-xs overflow-hidden group">
              <div
                onClick={() => {
                  setDestModalError("");
                  setIsDestSelectorOpen(true);
                }}
                className="flex items-center gap-2.5 min-w-0 flex-1 overflow-hidden cursor-pointer"
                title="Click to change destination"
              >
                {destination.image && (
                  <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-orange/30 group-hover:scale-105 transition-transform bg-slate-900">
                    <DestinationImage
                      src={destination.image}
                      alt={destination.alt || destination.name}
                      aspectRatio="aspect-square"
                    />
                  </div>
                )}
                <div className="min-w-0 flex-1 overflow-hidden">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-orange block truncate">
                    Primary Destination
                  </span>
                  <strong className="font-heading font-bold text-xs sm:text-sm text-charcoal dark:text-white truncate block group-hover:text-orange transition-colors mt-0.5">
                    {destination.name}, {destination.state}
                  </strong>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setDestModalError("");
                    setIsDestSelectorOpen(true);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-orange/15 hover:bg-orange/25 text-orange font-bold text-[10px] uppercase tracking-wider cursor-pointer transition-colors flex items-center gap-1"
                >
                  <span>✎</span>
                  <span>Change</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-2.5 sm:gap-3 w-full min-w-0">
            <div className="flex flex-col items-center shrink-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 flex items-center justify-center font-heading font-extrabold text-xs shrink-0">
                B
              </div>
              {(selectedStops.length > 0 || isAddingInlineStop || isDragOverZone) && (
                <div className="w-0.5 h-6 bg-slate-300 dark:bg-[#1E2E42] my-1" />
              )}
            </div>

            <div
              onClick={() => {
                setDestModalError("");
                setIsDestSelectorOpen(true);
              }}
              className="flex-1 min-w-0 p-3 rounded-2xl bg-slate-50 dark:bg-[#152436] hover:bg-orange/5 dark:hover:bg-orange/10 border border-dashed border-slate-300 dark:border-slate-700 hover:border-orange/50 flex items-center justify-between gap-2 shadow-xs cursor-pointer transition-all group"
            >
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-orange block transition-colors">
                  Primary Destination
                </span>
                <span className="text-xs text-orange font-bold flex items-center gap-1 mt-0.5">
                  <span>+ Select Destination</span>
                </span>
              </div>

              <span className="px-2.5 py-1 rounded-lg bg-orange/20 text-orange font-bold text-[10px] uppercase tracking-wider">
                Choose
              </span>
            </div>
          </div>
        )}

        {/* ADDED STOPS (Primary Destinations & Custom Spots with Drag & Drop & Inline Renaming) */}
        <AnimatePresence mode="popLayout">
          {selectedStops.map((stop, idx) => {
            const isLast = idx === selectedStops.length - 1 && !isAddingInlineStop;
            const stopLetter = getTimelineLetter(2 + idx); // Index 0 -> C, 1 -> D, etc.
            const isPrimary = stop.isPrimary;
            const isItemDragged = draggedItemIndex === idx;
            const isItemDragOver = dragOverItemIndex === idx;
            const isEditingThisStop = editingStopId === stop.id;

            return (
              <motion.div
                key={stop.id || `stop-${idx}`}
                layout
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                draggable={!isEditingThisStop}
                onDragStart={(e) => {
                  setDraggedItemIndex(idx);
                  e.dataTransfer.setData("text/plain", idx.toString());
                  e.dataTransfer.effectAllowed = "move";
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "move";
                  if (dragOverItemIndex !== idx) {
                    setDragOverItemIndex(idx);
                  }
                }}
                onDragLeave={() => {
                  if (dragOverItemIndex === idx) {
                    setDragOverItemIndex(null);
                  }
                }}
                onDragEnd={() => {
                  setDraggedItemIndex(null);
                  setDragOverItemIndex(null);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();

                  // Check if internal reordering
                  if (draggedItemIndex !== null && draggedItemIndex !== idx) {
                    handleReorder(draggedItemIndex, idx);
                  } else {
                    // Check if external card dropped
                    const jsonStr = e.dataTransfer.getData("application/json");
                    if (jsonStr) {
                      try {
                        const newStop = JSON.parse(jsonStr);
                        if (newStop && onAddStop) onAddStop(newStop);
                      } catch {}
                    }
                  }
                  setDraggedItemIndex(null);
                  setDragOverItemIndex(null);
                }}
                className={`flex items-start gap-2.5 sm:gap-3 w-full min-w-0 transition-opacity duration-150 ${
                  isItemDragged ? "opacity-40" : "opacity-100"
                }`}
              >
                <div className="flex flex-col items-center shrink-0">
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-heading font-extrabold text-xs shrink-0 ${
                      isPrimary
                        ? "bg-orange text-white shadow-xs shadow-orange/20"
                        : "bg-slate-100 dark:bg-[#152436] border border-[#E2E8F0] dark:border-[#1E2E42] text-charcoal dark:text-white"
                    }`}
                  >
                    {stopLetter}
                  </div>
                  {!isLast && (
                    <div className="w-0.5 h-6 bg-slate-300 dark:bg-[#1E2E42] my-1" />
                  )}
                </div>

                <div
                  className={`flex-1 min-w-0 p-2.5 sm:p-3 rounded-2xl border flex items-center justify-between gap-1.5 sm:gap-2 group transition-all overflow-hidden ${
                    isItemDragOver
                      ? "border-orange bg-orange/10 shadow-md ring-2 ring-orange/30"
                      : isPrimary
                      ? "bg-orange/5 dark:bg-orange/10 border-orange/20"
                      : "bg-[#F5F7FA] dark:bg-[#152436] border-[#E2E8F0] dark:border-white/5 hover:border-orange/30"
                  }`}
                >
                  {/* Drag Handle Grip */}
                  {!isEditingThisStop && (
                    <span
                      className="text-slate-400 group-hover:text-orange text-xs select-none cursor-grab shrink-0 px-0.5"
                      title="Drag to reorder stop"
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                        <circle cx="9" cy="6" r="1.5" />
                        <circle cx="15" cy="6" r="1.5" />
                        <circle cx="9" cy="12" r="1.5" />
                        <circle cx="15" cy="12" r="1.5" />
                        <circle cx="9" cy="18" r="1.5" />
                        <circle cx="15" cy="18" r="1.5" />
                      </svg>
                    </span>
                  )}

                  {isEditingThisStop ? (
                    <div className="flex-1 min-w-0 flex items-center gap-1.5">
                      <input
                        ref={stopEditInputRef}
                        type="text"
                        value={editingStopName}
                        onChange={(e) => setEditingStopName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleSaveStopName(stop.id);
                          } else if (e.key === "Escape") {
                            setEditingStopId(null);
                          }
                        }}
                        className="flex-1 py-1 px-2 rounded-lg bg-white dark:bg-[#07111F] border border-orange text-xs font-semibold text-charcoal dark:text-white focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveStopName(stop.id)}
                        className="px-2 py-1 rounded-lg bg-orange text-white font-bold text-xs"
                      >
                        ✓
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingStopId(null)}
                        className="px-2 py-1 rounded-lg bg-slate-200 dark:bg-[#0E1A29] text-slate-500 text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1 overflow-hidden">
                      {stop.image && (
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg overflow-hidden shrink-0 border border-slate-200 dark:border-white/10">
                          <DestinationImage
                            src={stop.image}
                            alt={stop.alt || stop.name}
                            aspectRatio="aspect-square"
                          />
                        </div>
                      )}
                      <div className="min-w-0 flex-1 overflow-hidden">
                        <span
                          className={`text-[10px] font-bold block truncate uppercase tracking-wider ${
                            isPrimary ? "text-orange" : "text-slate-400"
                          }`}
                        >
                          {isPrimary
                            ? "Primary Destination"
                            : stop.categoryName || "Custom Stop"}{" "}
                          {stop.distance && !isPrimary ? `· ${stop.distance}` : ""}
                        </span>
                        <strong
                          onClick={() => handleStartEditingStop(stop)}
                          className="font-heading font-bold text-xs sm:text-sm text-charcoal dark:text-white truncate block hover:text-orange cursor-pointer"
                          title="Click to rename stop"
                        >
                          {stop.name}
                        </strong>
                      </div>
                    </div>
                  )}

                  {/* Reorder, Rename & Remove Actions */}
                  {!isEditingThisStop && (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleStartEditingStop(stop)}
                        className="w-6 h-6 rounded-lg bg-slate-200/70 dark:bg-[#0E1A29] text-slate-500 hover:text-orange flex items-center justify-center text-[10px] sm:text-xs transition-colors cursor-pointer"
                        title="Rename Stop"
                      >
                        ✎
                      </button>

                      {idx > 0 && (
                        <button
                          type="button"
                          onClick={() =>
                            onMoveStopUp
                              ? onMoveStopUp(idx)
                              : handleReorder(idx, idx - 1)
                          }
                          className="w-6 h-6 rounded-lg bg-slate-200/70 dark:bg-[#0E1A29] text-slate-600 dark:text-slate-300 hover:text-orange flex items-center justify-center text-[10px] sm:text-xs transition-colors cursor-pointer"
                          title="Move Stop Up"
                        >
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
                          </svg>
                        </button>
                      )}

                      {idx < selectedStops.length - 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            onMoveStopDown
                              ? onMoveStopDown(idx)
                              : handleReorder(idx, idx + 1)
                          }
                          className="w-6 h-6 rounded-lg bg-slate-200/70 dark:bg-[#0E1A29] text-slate-600 dark:text-slate-300 hover:text-orange flex items-center justify-center text-[10px] sm:text-xs transition-colors cursor-pointer"
                          title="Move Stop Down"
                        >
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => onRemoveStop(stop.id)}
                        className="w-6 h-6 rounded-lg bg-slate-200/70 dark:bg-[#0E1A29] text-slate-400 hover:text-red-500 flex items-center justify-center text-[10px] sm:text-xs transition-colors cursor-pointer"
                        title="Remove Stop"
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* INLINE CUSTOM STOP CREATION SLOT */}
        <AnimatePresence>
          {isAddingInlineStop && (
            <InlineCustomStopInput
              slotLetter={getTimelineLetter(2 + selectedStops.length)}
              primaryWaypoints={
                primaryWaypoints.length > 0
                  ? primaryWaypoints
                  : [pickupLocation, destination?.name]
              }
              currentDestination={destination}
              pickupLocation={pickupLocation}
              existingStops={selectedStops}
              onSelectStop={(newStop) => {
                if (onAddStop) onAddStop(newStop);
                setIsAddingInlineStop(false);
              }}
              onCancel={() => setIsAddingInlineStop(false)}
            />
          )}
        </AnimatePresence>

        {/* Dynamic Drag & Drop Dropzone Box */}
        {(selectedStops.length === 0 || isDragOverZone) && !isAddingInlineStop && (
          <div
            className={`p-3.5 rounded-2xl border-2 border-dashed transition-all flex items-center justify-center gap-2.5 text-center w-full min-w-0 ${
              isDragOverZone
                ? "border-orange bg-orange/10 text-orange scale-[1.01]"
                : "border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#07111F] text-slate-400"
            }`}
          >
            <span className="text-xs font-heading font-semibold">
              {isDragOverZone
                ? "Release to drop stop into journey!"
                : "Drag & drop any nearby stop here"}
            </span>
          </div>
        )}
      </div>

      {/* Primary & Custom Stop Quick Action Row */}
      <div className="flex items-center gap-2 pt-1">
        {/* + Add Primary Destination / Major City Button */}
        <button
          type="button"
          onClick={() => setIsPrimaryModalOpen(true)}
          className="flex-1 py-2 px-2.5 rounded-xl bg-orange/10 hover:bg-orange/20 border border-orange/30 text-orange font-heading font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
        >
          <span>+ Add Major City</span>
        </button>

        {/* + Add Custom Stop Button */}
        <button
          type="button"
          onClick={() => setIsAddingInlineStop(true)}
          className={`flex-1 py-2 px-2.5 rounded-xl border font-heading font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs ${
            isAddingInlineStop
              ? "bg-orange text-white border-orange shadow-md shadow-orange/25"
              : "bg-slate-100 dark:bg-[#152436] hover:bg-slate-200 dark:hover:bg-[#1E2E42] border-[#E2E8F0] dark:border-[#1E2E42] text-slate-700 dark:text-slate-200"
          }`}
        >
          <span>{customStopsCount > 0 ? "+ Add Another Stop" : "+ Add Stop"}</span>
        </button>
      </div>

      {/* Route Summary */}
      <div className="p-3 rounded-2xl bg-[#F5F7FA] dark:bg-[#152436] border border-[#E2E8F0] dark:border-white/5">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>Stops in Itinerary:</span>
          <strong className="text-charcoal dark:text-white font-mono font-bold">
            {primaryStopsCount} Primary + {customStopsCount} Custom Stops
          </strong>
        </div>
      </div>

      {/* SELECTED FLEET CARD */}
      {selectedVehicle && (
        <div className="p-3.5 rounded-2xl bg-[#F5F7FA] dark:bg-[#07111F] border border-[#E2E8F0] dark:border-[#1E2E42] flex items-center justify-between gap-3 shadow-xs">
          <div className="min-w-0">
            <span className="text-[10px] text-slate-400 uppercase font-bold block tracking-wider">
              Selected Fleet
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="font-heading font-bold text-xs sm:text-sm text-charcoal dark:text-white truncate">
                {selectedVehicle.name}
              </span>
              <button
                type="button"
                onClick={scrollToFleets}
                className="text-[10px] text-orange hover:underline font-bold cursor-pointer"
              >
                (Change)
              </button>
            </div>
          </div>
          <span className="text-xs sm:text-sm font-heading font-extrabold text-orange shrink-0">
            {vehiclePriceDisplay}
          </span>
        </div>
      )}

      {/* ============================================================ */}
      {/* 1. SELECT / CHANGE PRIMARY DESTINATION MODAL (Point B)       */}
      {/* ============================================================ */}
      <AnimatePresence>
        {isDestSelectorOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-[#0E1A29] rounded-3xl border border-[#E2E8F0] dark:border-[#1E2E42] shadow-2xl w-full max-w-lg p-6 max-h-[85vh] flex flex-col space-y-4"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#1E2E42] pb-3">
                <div>
                  <span className="text-[10px] font-bold text-orange uppercase tracking-wider font-heading block">
                    Choose Destination (Point B)
                  </span>
                  <h4 className="font-heading font-extrabold text-lg text-charcoal dark:text-white">
                    Select Primary Destination
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsDestSelectorOpen(false);
                    setDestSearchQuery("");
                    setDestModalError("");
                  }}
                  className="w-8 h-8 rounded-full bg-slate-100 dark:bg-[#152436] text-slate-400 hover:text-charcoal dark:hover:text-white flex items-center justify-center font-bold text-sm cursor-pointer"
                  title="Close"
                >
                  ✕
                </button>
              </div>

              {destModalError && (
                <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold">
                  ⚠️ {destModalError}
                </div>
              )}

              {/* Destination Search Box */}
              <div className="relative">
                <input
                  type="text"
                  value={destSearchQuery}
                  onChange={(e) => {
                    setDestSearchQuery(e.target.value);
                    setDestModalError("");
                  }}
                  placeholder="Search destination (e.g. Coorg, Ooty, Gokarna, Mysore)..."
                  className="w-full pl-9 pr-8 py-2.5 rounded-2xl bg-[#F5F7FA] dark:bg-[#07111F] border border-[#E2E8F0] dark:border-[#1E2E42] text-xs font-semibold text-charcoal dark:text-white placeholder-slate-400 focus:outline-none focus:border-orange focus:ring-2 focus:ring-orange/20"
                />
                <svg
                  className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
                {destSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setDestSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-charcoal dark:hover:text-white text-xs cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Destinations List */}
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 max-h-[50vh]">
                {filteredAllDestinations.length > 0 ? (
                  filteredAllDestinations.map((dest) => {
                    const isCurrent = destination?.id === dest.id;
                    const isSameAsOrigin = pickupLocation && isSameLocation(dest, pickupLocation);

                    return (
                      <div
                        key={dest.id}
                        onClick={() => handleSelectNewPrimaryDestination(dest)}
                        className={`p-3 rounded-2xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                          isSameAsOrigin
                            ? "opacity-50 border-dashed border-rose-300 dark:border-rose-900 bg-rose-50/30 dark:bg-rose-950/10"
                            : isCurrent
                            ? "bg-orange/10 border-orange ring-1 ring-orange/30"
                            : "bg-[#F5F7FA] dark:bg-[#152436] border-[#E2E8F0] dark:border-white/5 hover:border-orange/50 hover:bg-orange/5"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-slate-900 border border-slate-200 dark:border-white/10">
                            <DestinationImage
                              src={dest.image}
                              alt={dest.alt || dest.name}
                              aspectRatio="aspect-square"
                            />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <strong className="font-heading font-bold text-sm text-charcoal dark:text-white truncate block">
                                {dest.name}
                              </strong>
                              {isCurrent && (
                                <span className="px-2 py-0.2 rounded-full bg-orange text-white text-[9px] font-bold uppercase">
                                  Current
                                </span>
                              )}
                              {isSameAsOrigin && (
                                <span className="px-2 py-0.2 rounded-full bg-rose-500 text-white text-[9px] font-bold uppercase">
                                  Same as Origin
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-slate-500 dark:text-slate-400 block truncate">
                              {dest.state || "South India"} · {dest.duration || "2-3 Days"} · {dest.distance || ""}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectNewPrimaryDestination(dest);
                          }}
                          className={`px-3.5 py-1.5 rounded-xl font-heading font-bold text-xs shadow-sm cursor-pointer shrink-0 transition-colors ${
                            isSameAsOrigin
                              ? "bg-slate-200 dark:bg-slate-700 text-slate-500 cursor-not-allowed"
                              : isCurrent
                              ? "bg-orange text-white"
                              : "bg-white dark:bg-[#0E1A29] text-charcoal dark:text-white border border-[#E2E8F0] dark:border-[#1E2E42] hover:bg-orange hover:text-white hover:border-orange"
                          }`}
                        >
                          {isSameAsOrigin ? "Origin" : isCurrent ? "Selected" : "Select"}
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-slate-400 text-center py-6">
                    No destinations found matching "{destSearchQuery}".
                  </p>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================================ */}
      {/* 2. ADD PRIMARY DESTINATION / MAJOR CITY MODAL (Waypoints)    */}
      {/* ============================================================ */}
      <AnimatePresence>
        {isPrimaryModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-[#0E1A29] rounded-3xl border border-[#E2E8F0] dark:border-[#1E2E42] shadow-2xl w-full max-w-lg p-6 max-h-[85vh] flex flex-col space-y-4"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#1E2E42] pb-3">
                <div>
                  <span className="text-[10px] font-bold text-orange uppercase tracking-wider font-heading block">
                    Expand Your Route
                  </span>
                  <h4 className="font-heading font-extrabold text-lg text-charcoal dark:text-white">
                    Add Major Primary Destination
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPrimaryModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 dark:bg-[#152436] text-slate-400 hover:text-charcoal dark:hover:text-white flex items-center justify-center font-bold text-sm cursor-pointer"
                  title="Close"
                >
                  ✕
                </button>
              </div>

              {/* Destinations List */}
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 max-h-[50vh]">
                {availablePrimaryDestinations.length > 0 ? (
                  availablePrimaryDestinations.map((dest) => {
                    const isSameAsOrigin = pickupLocation && isSameLocation(dest, pickupLocation);
                    return (
                      <div
                        key={dest.id}
                        className={`p-3 rounded-2xl border flex items-center justify-between gap-3 transition-colors ${
                          isSameAsOrigin
                            ? "opacity-50 border-dashed border-rose-300 dark:border-rose-900 bg-rose-50/20"
                            : "bg-[#F5F7FA] dark:bg-[#152436] border-[#E2E8F0] dark:border-white/5 hover:border-orange/40"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-slate-900 border border-slate-200 dark:border-white/10">
                            <DestinationImage
                              src={dest.image}
                              alt={dest.alt || dest.name}
                              aspectRatio="aspect-square"
                            />
                          </div>
                          <div className="min-w-0">
                            <strong className="font-heading font-bold text-sm text-charcoal dark:text-white truncate block">
                              {dest.name}
                            </strong>
                            <span className="text-xs text-slate-500 dark:text-slate-400 block truncate">
                              {dest.state || "South India"} · {dest.duration || "2-3 Days"} · {dest.distance || ""}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleAddPrimaryDestination(dest)}
                          disabled={isSameAsOrigin}
                          className={`px-3.5 py-1.5 rounded-xl font-heading font-bold text-xs shadow-sm cursor-pointer shrink-0 ${
                            isSameAsOrigin
                              ? "bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed"
                              : "bg-orange hover:bg-orangeLight text-white"
                          }`}
                        >
                          {isSameAsOrigin ? "Origin" : "+ Add Stop"}
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-slate-400 text-center py-6">
                    All major primary destinations have been added to your route!
                  </p>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
