import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useFleetPricing } from "../../services/fleet.service";
import { useAuth } from "../../hooks/useAuth";
import { estimateTripCost } from "../../services/booking.service";
import LocationSearchInput from "../common/LocationSearchInput.jsx";
import CustomDatePicker from "../common/CustomDatePicker.jsx";
import CustomTimePicker from "../common/CustomTimePicker.jsx";
import CustomFleetSelect from "../common/CustomFleetSelect.jsx";

export default function HomeFareEstimator() {
  const navigate = useNavigate();
  const { isAuthenticated, userProfile } = useAuth();
  const { fleets, loading: fleetsLoading, resolveVehicle } = useFleetPricing();

  // Form State: Bangalore as default pickup, empty destination & dates, default morning start time
  const [pickup, setPickup] = useState("Bangalore");
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("06:00");
  const [endDate, setEndDate] = useState("");

  const getTodayDate = () => {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  };

  const [selectedVehicle, setSelectedVehicle] = useState(() => {
    return resolveVehicle(userProfile?.preferences?.vehicle || "Innova Crysta");
  });

  useEffect(() => {
    if (fleets.length > 0) {
      if (userProfile?.preferences?.vehicle && userProfile.preferences.vehicle !== "Any") {
        const match = fleets.find(
          (v) => v.name.toLowerCase() === userProfile.preferences.vehicle.toLowerCase()
        );
        if (match) {
          setSelectedVehicle(match);
          return;
        }
      }
      setSelectedVehicle((prev) => resolveVehicle(prev?.name || fleets[0]?.name));
    }
  }, [fleets, userProfile?.preferences?.vehicle]);

  // Estimation & Action State
  const [isProcessing, setIsProcessing] = useState(false);
  const [estimateData, setEstimateData] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Currency Formatter
  const formatCurrency = (amt) => {
    if (typeof amt !== "number" || isNaN(amt)) return "₹0";
    return `₹${Math.round(amt).toLocaleString("en-IN")}`;
  };

  // Swap Locations
  const handleSwap = () => {
    const temp = pickup;
    setPickup(destination);
    setDestination(temp);
  };

  // Validation
  const validateInputs = () => {
    if (!pickup || !pickup.trim()) {
      return "Please enter a start location.";
    }
    if (!destination || !destination.trim()) {
      return "Please enter a destination.";
    }
    if (!selectedVehicle || (!selectedVehicle.id && !selectedVehicle.name)) {
      return "Please select a vehicle type.";
    }
    if (!startDate) {
      return "Please select a start date.";
    }
    if (!startTime) {
      return "Please select a start time.";
    }
    if (!endDate) {
      return "Please select an end date.";
    }
    if (endDate < startDate) {
      return "Trip end date cannot be earlier than start date.";
    }
    return null;
  };

  // Primary Action: Continue Booking
  const handleContinueBooking = async (e) => {
    if (e) e.preventDefault();
    setErrorMessage(null);

    const error = validateInputs();
    if (error) {
      setErrorMessage(error);
      return;
    }

    const canonicalVehicle = resolveVehicle(selectedVehicle?.name);
    const startDateTime = new Date(`${startDate}T${startTime}:00`);
    const endDateTime = new Date(`${endDate}T20:00:00`);
    const startISO = isNaN(startDateTime.getTime()) ? `${startDate}T06:00:00.000Z` : startDateTime.toISOString();
    const endISO = isNaN(endDateTime.getTime()) ? `${endDate}T20:00:00.000Z` : endDateTime.toISOString();

    setIsProcessing(true);
    try {
      // Calculate fare estimate for immediate visibility
      const res = await estimateTripCost({
        vehicleId: canonicalVehicle.id,
        vehicleType: selectedVehicle.name,
        vehicleName: selectedVehicle.name,
        origin: pickup.trim(),
        pickupLocation: pickup.trim(),
        destination: destination.trim(),
        startDate: startDate,
        endDate: endDate,
      });

      let calculatedEstimate = null;
      if (res && res.estimate) {
        calculatedEstimate = res.estimate;
        setEstimateData(res.estimate);
      }

      const queryParams = new URLSearchParams({
        pickup: pickup.trim(),
        route: destination.trim(),
        destination: destination.trim(),
        vehicle: canonicalVehicle.id,
        startDate: startDate,
        startTime: startTime,
        endDate: endDate,
        start: startDate,
        end: endDate,
        time: startTime,
      });

      // Seamless direct handoff to fleet booking flow
      navigate(`/fleets?${queryParams.toString()}`, {
        state: {
          pickupLocation: pickup.trim(),
          destination: destination.trim(),
          selectedVehicleId: canonicalVehicle.id,
          vehicleId: canonicalVehicle.id,
          vehicleType: selectedVehicle.name,
          startDate: startDate,
          startTime: startTime,
          endDate: endDate,
          tripStartDate: startDate,
          tripEndDate: endDate,
          tripTime: startTime,
          startDateTime: startISO,
          endDateTime: endISO,
          estimateData: calculatedEstimate,
          fromHomeBooking: true,
        },
      });
    } catch (err) {
      console.error("SAFE DIAGNOSTIC LOG — Booking handoff error:", err);
      const queryParams = new URLSearchParams({
        pickup: pickup.trim(),
        route: destination.trim(),
        destination: destination.trim(),
        vehicle: canonicalVehicle.id,
        startDate: startDate,
        startTime: startTime,
        endDate: endDate,
        start: startDate,
        end: endDate,
        time: startTime,
      });
      navigate(`/fleets?${queryParams.toString()}`, {
        state: {
          pickupLocation: pickup.trim(),
          destination: destination.trim(),
          selectedVehicleId: canonicalVehicle.id,
          vehicleId: canonicalVehicle.id,
          vehicleType: selectedVehicle.name,
          startDate: startDate,
          startTime: startTime,
          endDate: endDate,
          tripStartDate: startDate,
          tripEndDate: endDate,
          tripTime: startTime,
          startDateTime: startISO,
          endDateTime: endISO,
          fromHomeBooking: true,
        },
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const minDate = getTodayDate();

  return (
    <div className="w-full bg-white dark:bg-[#0E1A29] border border-[#E2E8F0] dark:border-[#1E2E42] rounded-3xl p-6 sm:p-8 lg:p-10 shadow-xl shadow-slate-900/5 dark:shadow-2xl relative overflow-visible transition-all duration-200">
      
      {/* Widget Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 sm:mb-8 pb-5 border-b border-[#E2E8F0] dark:border-[#1E2E42]">
        <div>
          <h2 className="font-extrabold text-xl sm:text-2xl text-charcoal dark:text-white tracking-tight">
            Book Your Journey
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Transparent pricing, sanitized fleet, and verified chauffeurs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Instant Confirmation</span>
          </span>
        </div>
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mb-5 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/25 text-red-600 dark:text-red-400 text-xs sm:text-sm font-semibold flex items-center gap-2.5"
          >
            <span>{errorMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Unified Form */}
      <form onSubmit={handleContinueBooking} className="space-y-6">
        
        {/* Row 1: Start Location, Swap, Destination, Vehicle */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-end">
          
          {/* From: Start Location (Interactive Maps Search) */}
          <div className="lg:col-span-4 space-y-1.5">
            <LocationSearchInput
              id="pickup-input"
              label="From (Start Location)"
              value={pickup}
              onChange={setPickup}
              isPickup={true}
              placeholder="Enter pickup location (e.g. Bangalore)"
              required
            />
          </div>

          {/* Swap Button */}
          <div className="hidden lg:flex lg:col-span-1 justify-center pb-1">
            <button
              type="button"
              onClick={handleSwap}
              title="Swap Locations"
              className="p-3.5 rounded-xl bg-[#F5F7FA] dark:bg-[#0A1420] border border-slate-200 dark:border-slate-800/80 text-slate-600 dark:text-slate-400 hover:text-orange dark:hover:text-orange hover:border-orange/50 transition-all cursor-pointer shadow-sm"
              aria-label="Swap Locations"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 3 4 7l4 4" />
                <path d="M4 7h16" />
                <path d="m16 21 4-4-4-4" />
                <path d="M20 17H4" />
              </svg>
            </button>
          </div>

          {/* To: Destination (Interactive Maps Search) */}
          <div className="lg:col-span-4 space-y-1.5">
            <LocationSearchInput
              id="destination-input"
              label="To (Destination)"
              value={destination}
              onChange={setDestination}
              isPickup={false}
              placeholder="Search destination (e.g. Coorg, Ooty, Mysore...)"
              required
            />
          </div>

          {/* Vehicle Selection */}
          <div className="lg:col-span-3">
            <CustomFleetSelect
              id="vehicle-type-select"
              label="Vehicle Type"
              fleets={fleets}
              selectedVehicle={selectedVehicle}
              onSelect={(v) => setSelectedVehicle(v)}
              placement="bottom"
              align="right"
            />
          </div>
        </div>

        {/* Row 2: Start Date, Start Time, End Date, Continue Booking Button */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3.5 items-end">
          
          {/* Start Date */}
          <div className="sm:col-span-1 lg:col-span-3">
            <CustomDatePicker
              id="home-start-date"
              label="Start Date"
              value={startDate}
              minDate={minDate}
              onChange={(val) => {
                setStartDate(val);
                if (endDate && val > endDate) {
                  setEndDate(val);
                }
              }}
              placeholder="Select start date"
              required
            />
          </div>

          {/* Start Time */}
          <div className="sm:col-span-1 lg:col-span-3">
            <CustomTimePicker
              id="home-start-time"
              label="Start Time"
              value={startTime}
              onChange={(val) => setStartTime(val)}
              placeholder="Select start time"
              required
            />
          </div>

          {/* End Date */}
          <div className="sm:col-span-1 lg:col-span-3">
            <CustomDatePicker
              id="home-end-date"
              label="End Date"
              value={endDate}
              minDate={startDate || minDate}
              onChange={(val) => setEndDate(val)}
              placeholder="Select end date"
              placement="top"
              align="right"
              required
            />
          </div>

          {/* Primary Action Button: Continue Booking */}
          <div className="sm:col-span-1 lg:col-span-3">
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-3.5 px-6 rounded-xl bg-orange hover:bg-orangeLight text-white font-bold text-sm transition-all duration-200 shadow-lg shadow-orange/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processing Booking...</span>
                </>
              ) : (
                <>
                  <span>Continue Booking</span>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Validation or API Error Message */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs flex items-center gap-2">
            <span>{errorMessage}</span>
          </div>
        )}
      </form>

      {/* Fare Estimate Breakdown Section (if available) */}
      <AnimatePresence>
        {estimateData && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-6 pt-6 border-t border-[#E2E8F0] dark:border-[#1E2E42]"
          >
            <div className="bg-[#F5F7FA] dark:bg-[#0A1420] border border-[#E2E8F0] dark:border-[#1E2E42] rounded-2xl p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base text-charcoal dark:text-white">
                  Estimated Fare ({pickup} → {destination})
                </h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-orange/10 text-orange font-semibold">
                  {selectedVehicle.name}
                </span>
              </div>

              {/* Items Breakdown */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs sm:text-sm">
                <div className="p-3 rounded-xl bg-white dark:bg-[#0E1A29] border border-[#E2E8F0] dark:border-[#1E2E42]">
                  <span className="text-slate-500 dark:text-slate-400 block text-xs">Base Fare</span>
                  <span className="font-semibold text-charcoal dark:text-white font-mono mt-0.5 block">
                    {formatCurrency(estimateData.baseFare)}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-[#0E1A29] border border-[#E2E8F0] dark:border-[#1E2E42]">
                  <span className="text-slate-500 dark:text-slate-400 block text-xs">Driver Allowance</span>
                  <span className="font-semibold text-charcoal dark:text-white font-mono mt-0.5 block">
                    {formatCurrency(estimateData.totalAllowance)}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-[#0E1A29] border border-[#E2E8F0] dark:border-[#1E2E42]">
                  <span className="text-slate-500 dark:text-slate-400 block text-xs">Platform Fee</span>
                  <span className="font-semibold text-charcoal dark:text-white font-mono mt-0.5 block">
                    {formatCurrency(estimateData.platformFee)}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-[#0E1A29] border border-[#E2E8F0] dark:border-[#1E2E42]">
                  <span className="text-slate-500 dark:text-slate-400 block text-xs">GST (5%)</span>
                  <span className="font-semibold text-charcoal dark:text-white font-mono mt-0.5 block">
                    {formatCurrency(estimateData.gst)}
                  </span>
                </div>
              </div>

              {/* Total & Action */}
              <div className="pt-3 border-t border-[#E2E8F0] dark:border-[#1E2E42] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <span className="text-xs text-slate-500 dark:text-slate-400">Total Estimated Fare</span>
                  <div className="flex items-baseline gap-2">
                    <span className="font-extrabold text-2xl text-orange">
                      {formatCurrency(estimateData.totalEstimate)}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      (Includes {estimateData.kmIncluded} KM)
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleContinueBooking}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-orange hover:bg-orangeLight text-white font-bold text-xs sm:text-sm shadow-md shadow-orange/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Continue Booking</span>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


