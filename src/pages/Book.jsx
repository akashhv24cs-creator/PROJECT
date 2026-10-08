import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../context/ThemeContext";
import { usePageSEO } from "../hooks/usePageSEO";
import { estimateTripCost, createBooking } from "../services/booking.service";
import {
  DESTINATIONS,
  searchDestinationsAndStops,
  getAllAvailableStops,
  getRecommendationsForJourney,
} from "../data/destinations";
import {
  validateCustomStopAgainstRoute,
  filterAllowedStopsForRoute,
  isSameLocation,
} from "../services/routeValidation.service";
import {
  buildOrderedItinerary,
  calculateAuthoritativeRoute,
  calculateRouteLegs,
} from "../services/route.service";
import DestinationImage from "../components/common/DestinationImage";
import VehicleCardImage from "../components/fleets/VehicleCardImage";
import LocationSearchInput from "../components/common/LocationSearchInput";
import CustomDatePicker from "../components/common/CustomDatePicker";
import CustomTimePicker from "../components/common/CustomTimePicker";
import CustomFleetSelect from "../components/common/CustomFleetSelect";
import PeopleAlsoVisit from "../components/tripBuilder/PeopleAlsoVisit";
import AddStopSearch from "../components/tripBuilder/AddStopSearch";
import FleetJourneyBuilder from "../components/tripBuilder/FleetJourneyBuilder";
import Navbar from "../../Navbar.jsx";
import { useFleetPricing, resolveVehicle, calculateTripDays, calculateAuthoritativeFare } from "../services/fleet.service";
import { calculateFareWithGST, validateFareDetails } from "../utils/fareCalculation";
import { LINKS } from "../../index.js";


export default function BookPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, isAuthenticated } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const {
    fleets,
    loading: fleetsLoading,
    error: fleetsError,
    refresh: refreshFleets,
    resolveVehicle: resolveFleetVehicle,
  } = useFleetPricing();

  usePageSEO({
    title: "Fleets & Outstation Trip Planner | Zenera Trips",
    description:
      "Choose your vehicle from our verified fleet, review real server-authoritative pricing, customize your journey, and book instantly.",
    robots: "index, follow",
    canonical: "https://zenera-trips.web.app/fleets",
  });

  // URL Query Parameters & State prefill
  const searchParams = new URLSearchParams(location.search);
  const initialPickup = searchParams.get("pickup") || location.state?.pickupLocation || "Bangalore, Karnataka";
  const initialDestination =
    searchParams.get("destination") || searchParams.get("route") || location.state?.destination || "";
  const initialStopsParam = searchParams.get("stops") || "";
  const initialStops = initialStopsParam
    ? initialStopsParam
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
    : location.state?.stops || [];

  // 1. Canonical Vehicle Selection State
  const initialVehicleParam =
    searchParams.get("vehicle") ||
    location.state?.selectedVehicleId ||
    location.state?.vehicleId ||
    location.state?.vehicleType;

  const [selectedVehicleId, setSelectedVehicleId] = useState(() => {
    const resolved = resolveFleetVehicle(initialVehicleParam) || resolveVehicle(initialVehicleParam);
    return resolved?.id || "innova-crysta";
  });

  // 2. Destination & Route Planning State
  const [pickupLocation, setPickupLocation] = useState(initialPickup);
  const [selectedDestId, setSelectedDestId] = useState(() => {
    if (!initialDestination) return "";
    const cleanDest = String(initialDestination).trim().toLowerCase();
    const match = DESTINATIONS.find(
      (d) =>
        d.id.toLowerCase() === cleanDest ||
        d.name.toLowerCase() === cleanDest ||
        cleanDest.includes(d.name.toLowerCase()) ||
        d.name.toLowerCase().includes(cleanDest)
    );
    return match ? match.id : "";
  });

  // Sync selectedDestId when navigating with destination params
  useEffect(() => {
    const destParam = searchParams.get("destination") || searchParams.get("route") || location.state?.destination;
    if (destParam) {
      const cleanDest = String(destParam).trim().toLowerCase();
      const match = DESTINATIONS.find(
        (d) =>
          d.id.toLowerCase() === cleanDest ||
          d.name.toLowerCase() === cleanDest ||
          cleanDest.includes(d.name.toLowerCase()) ||
          d.name.toLowerCase().includes(cleanDest)
      );
      if (match) {
        setSelectedDestId(match.id);
      }
    }
  }, [location.search, location.state?.destination]);

  const [userStops, setUserStops] = useState(() => {
    if (initialStops.length > 0) {
      const allStops = getAllAvailableStops();
      return initialStops.map((stopName, idx) => {
        const found = allStops.find(
          (s) =>
            s.name.toLowerCase() === stopName.toLowerCase() ||
            s.id.toLowerCase() === stopName.toLowerCase()
        );
        if (found) {
          return {
            id: found.id,
            name: found.name,
            image: found.image,
            distance: found.distance,
            category: found.category,
            categoryName: found.categoryName,
            isPrimary: found.type === "Major Destination" || false,
          };
        }
        return {
          id: `stop-${idx}-${stopName.toLowerCase().replace(/\s+/g, "-")}`,
          name: stopName,
          distance: "Custom Stop",
          category: "custom",
          categoryName: "Added by You",
        };
      });
    }
    return [];
  });

  // 3. Trip Date & Schedule State
  const getDefaultStartDate = () => {
    const raw =
      location.state?.startDate ||
      location.state?.tripStartDate ||
      searchParams.get("startDate") ||
      searchParams.get("start");
    if (raw) {
      const clean = String(raw).trim();
      if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) return clean;
      const d = new Date(clean);
      if (!isNaN(d.getTime())) return d.toISOString().split("T")[0];
    }
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  };

  const getDefaultEndDate = () => {
    const raw =
      location.state?.endDate ||
      location.state?.tripEndDate ||
      searchParams.get("endDate") ||
      searchParams.get("end");
    if (raw) {
      const clean = String(raw).trim();
      if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) return clean;
      const d = new Date(clean);
      if (!isNaN(d.getTime())) return d.toISOString().split("T")[0];
    }
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split("T")[0];
  };

  const getDefaultTripTime = () => {
    const raw =
      location.state?.startTime ||
      location.state?.tripTime ||
      searchParams.get("startTime") ||
      searchParams.get("time");
    if (raw) return String(raw).trim();
    return "06:30";
  };

  const [tripStartDate, setTripStartDate] = useState(getDefaultStartDate);
  const [tripEndDate, setTripEndDate] = useState(getDefaultEndDate);
  const [tripTime, setTripTime] = useState(getDefaultTripTime);

  // 4. Advance Percentage & Backend Pricing
  const [advancePercent, setAdvancePercent] = useState(25);
  const [backendEstimate, setBackendEstimate] = useState(null);
  const [isEstimating, setIsEstimating] = useState(false);

  // 5. Booking submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [routeNotice, setRouteNotice] = useState("");

  const selectedVehicle = useMemo(() => {
    return resolveFleetVehicle(selectedVehicleId);
  }, [selectedVehicleId, resolveFleetVehicle]);

  const currentDestination = useMemo(() => {
    if (!selectedDestId) return null;
    return DESTINATIONS.find((d) => d.id === selectedDestId) || null;
  }, [selectedDestId]);

  // Primary ordered route waypoints for corridor validation
  const primaryWaypoints = useMemo(() => {
    const waypoints = [pickupLocation || "Bangalore"];
    if (currentDestination?.name) {
      waypoints.push(currentDestination.name);
    }
    userStops.forEach((s) => {
      if (s.isPrimary && !waypoints.includes(s.name)) {
        waypoints.push(s.name);
      }
    });
    return waypoints;
  }, [pickupLocation, currentDestination, userStops]);

  // Dynamic recommendations for active destination and chosen stops
  const dynamicRecommendations = useMemo(() => {
    if (!selectedDestId || !currentDestination) return [];
    const recs = getRecommendationsForJourney(selectedDestId, userStops);
    return filterAllowedStopsForRoute(recs, [pickupLocation || "Bangalore", currentDestination.name]);
  }, [selectedDestId, userStops, pickupLocation, currentDestination]);

  // Revalidate existing stops automatically when primary destination changes
  useEffect(() => {
    if (!currentDestination) return;
    setUserStops((prevStops) => {
      if (prevStops.length === 0) return prevStops;

      const activeRoute = [pickupLocation || "Bangalore", currentDestination.name];
      const validStops = [];
      const removedStops = [];

      for (const stop of prevStops) {
        if (stop.isPrimary) {
          validStops.push(stop);
        } else {
          const check = validateCustomStopAgainstRoute(stop, activeRoute);
          if (check.isValid) {
            validStops.push(stop);
          } else {
            removedStops.push(stop.name);
          }
        }
      }

      if (removedStops.length > 0) {
        setRouteNotice(
          `Updated route to ${currentDestination.name}. Removed ${removedStops.join(", ")} (outside route corridor).`
        );
      }

      return validStops;
    });
  }, [selectedDestId, currentDestination?.name, pickupLocation]);

  const [showTermsModal, setShowTermsModal] = useState(false);

  const tripDaysCount = useMemo(() => {
    return calculateTripDays(tripStartDate, tripEndDate);
  }, [tripStartDate, tripEndDate]);

  // Authoritative Normalized Route Itinerary & Road Distance Calculation
  const authoritativeRoute = useMemo(() => {
    if (!currentDestination) {
      return {
        orderedItinerary: [
          {
            id: "origin-pickup",
            name: pickupLocation || "Bangalore, Karnataka",
            type: "pickup",
            distanceKm: 0,
            isPrimary: true,
          },
        ],
        legs: [],
        totalDistanceKm: 0,
        isCorridorValid: true,
      };
    }
    return calculateAuthoritativeRoute({
      origin: pickupLocation || "Bangalore, Karnataka",
      destination: currentDestination.name,
      userStops: userStops,
      tripType: "round-trip",
    });
  }, [pickupLocation, currentDestination, userStops]);

  // Calculate exact distances for destination and added stops
  const destinationDistanceKm = useMemo(() => {
    if (!currentDestination) return 0;
    if (typeof currentDestination.distanceKm === "number" && currentDestination.distanceKm > 0) {
      return currentDestination.distanceKm;
    }
    const match = String(currentDestination.distance || "").match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  }, [currentDestination]);

  const stopsDistanceKm = useMemo(() => {
    return userStops.reduce((sum, stop) => {
      if (typeof stop.distanceKm === "number" && stop.distanceKm > 0) {
        return sum + stop.distanceKm;
      }
      const match = String(stop.distance || "").match(/(\d+)/);
      return sum + (match ? parseInt(match[1], 10) : 0);
    }, 0);
  }, [userStops]);

  // Guards against a stale/out-of-order estimateTripCost response overwriting
  // the estimate for a newer trip selection (race condition fix).
  const estimateRequestIdRef = useRef(0);

  // Fetch Authoritative Backend Pricing
  const fetchBackendFareEstimate = useCallback(async () => {
    if (!selectedVehicle || !currentDestination || !tripStartDate || !tripEndDate) {
      setBackendEstimate(null);
      return;
    }

    const requestId = ++estimateRequestIdRef.current;
    setIsEstimating(true);

    try {
      const res = await estimateTripCost({
        vehicleId: selectedVehicle.id,
        vehicleType: selectedVehicle.vehicleType || selectedVehicle.name,
        vehicleName: selectedVehicle.name,
        origin: pickupLocation || "Bangalore, Karnataka",
        pickupLocation: pickupLocation || "Bangalore, Karnataka",
        destination: currentDestination.name,
        destinationId: currentDestination.id,
        destinations: [currentDestination.name],
        detailedDestinations: userStops.map((s) => s.name),
        secondaryStops: userStops,
        userStops: userStops,
        orderedItinerary: authoritativeRoute.orderedItinerary,
        routeDistanceKm: authoritativeRoute.totalDistanceKm,
        destinationDistanceKm: destinationDistanceKm,
        distanceKm: destinationDistanceKm,
        stopsDistanceKm: stopsDistanceKm,
        startDate: tripStartDate,
        endDate: tripEndDate,
        advancePercent: advancePercent,
      });

      // Only apply this response if no newer request has been fired since.
      if (requestId === estimateRequestIdRef.current && res && res.estimate) {
        setBackendEstimate(res.estimate);
      }
    } catch (err) {
      console.error("Backend estimate fetch error:", err);
    } finally {
      if (requestId === estimateRequestIdRef.current) {
        setIsEstimating(false);
      }
    }
  }, [selectedVehicle, currentDestination, destinationDistanceKm, stopsDistanceKm, authoritativeRoute, tripStartDate, tripEndDate, advancePercent, pickupLocation, userStops]);

  useEffect(() => {
    fetchBackendFareEstimate();
  }, [fetchBackendFareEstimate]);

  // Itinerary helper actions
  const handleAddStop = (stop) => {
    setErrorMessage("");
    const validation = validateCustomStopAgainstRoute(stop, primaryWaypoints);
    if (!validation.isValid) {
      setErrorMessage(
        validation.reason ||
        `"${stop.name || stop}" is too far from your selected route. Please choose a nearby stop or a location along your trip.`
      );
      return;
    }

    setUserStops((prev) => {
      if (
        prev.some(
          (s) =>
            s.id === stop.id ||
            s.name?.toLowerCase() === stop.name?.toLowerCase()
        )
      ) {
        return prev;
      }
      return [...prev, stop];
    });
  };

  const handleRemoveStop = (stopId) => {
    setUserStops((prev) =>
      prev.filter(
        (s) => s.id !== stopId && s.name?.toLowerCase() !== stopId?.toLowerCase()
      )
    );
  };

  const handleMoveStopUp = (index) => {
    if (index > 0) {
      setUserStops((prev) => {
        const next = [...prev];
        const temp = next[index];
        next[index] = next[index - 1];
        next[index - 1] = temp;
        return next;
      });
    }
  };

  const handleMoveStopDown = (index) => {
    if (index < userStops.length - 1) {
      setUserStops((prev) => {
        const next = [...prev];
        const temp = next[index];
        next[index] = next[index + 1];
        next[index + 1] = temp;
        return next;
      });
    }
  };

  const handleReorderStops = (newStops) => {
    setUserStops(newStops);
  };

  const handleEditStopName = (stopId, newName) => {
    if (!newName?.trim()) return;
    setUserStops((prev) =>
      prev.map((s) =>
        s.id === stopId || s.name?.toLowerCase() === stopId?.toLowerCase()
          ? { ...s, name: newName.trim() }
          : s
      )
    );
  };

  const handleClearAllStops = () => {
    setUserStops([]);
  };

  // Pure client authoritative fallback (for offline or immediate responsive state)
  const clientAuthoritativeFallback = useMemo(() => {
    if (!selectedVehicle) return null;
    return calculateAuthoritativeFare({
      vehicle: selectedVehicle,
      origin: pickupLocation || "Bangalore, Karnataka",
      destination: currentDestination ? currentDestination.name : undefined,
      userStops: userStops,
      orderedItinerary: authoritativeRoute.orderedItinerary,
      routeDistanceKm: authoritativeRoute.totalDistanceKm,
      destinationDistanceKm: destinationDistanceKm,
      distanceKm: destinationDistanceKm,
      stopsDistanceKm: stopsDistanceKm,
      startDate: tripStartDate,
      endDate: tripEndDate,
      advancePercent: advancePercent,
    });
  }, [selectedVehicle, destinationDistanceKm, stopsDistanceKm, authoritativeRoute, tripStartDate, tripEndDate, advancePercent, pickupLocation, currentDestination, userStops]);

  // Active authoritative fare ledger
  const activeFareLedger = backendEstimate || clientAuthoritativeFallback;

  // Central Fare & GST Calculation (Single Source of Truth)
  const fareDetails = useMemo(() => {
    const base = activeFareLedger?.baseFare || activeFareLedger?.baseVehicleFare || 0;
    const driver = activeFareLedger?.totalAllowance || activeFareLedger?.driverAllowance || 0;
    if (base > 0) {
      try {
        const details = calculateFareWithGST(base, driver);
        if (validateFareDetails(details)) {
          return details;
        }
      } catch (err) {
        console.error("SAFE DIAGNOSTIC LOG — Calculation Error:", err);
      }
    }
    return null;
  }, [activeFareLedger]);

  const totalAmount = typeof fareDetails?.totalFare === "number"
    ? fareDetails.totalFare
    : typeof activeFareLedger?.totalEstimate === "number"
      ? activeFareLedger.totalEstimate
      : 0;

  // Authoritative Advance & Remaining Balance derived directly from authoritative totalEstimate and selected advancePercent
  const calculatedAdvanceAmount = useMemo(() => {
    if (fareDetails?.advance && advancePercent === 25) return fareDetails.advance;
    if (!totalAmount || totalAmount <= 0) return 0;
    return Math.round((totalAmount * advancePercent) / 100);
  }, [fareDetails, totalAmount, advancePercent]);

  const calculatedBalanceDue = useMemo(() => {
    if (!totalAmount || totalAmount <= 0) return 0;
    return Math.max(0, totalAmount - calculatedAdvanceAmount);
  }, [totalAmount, calculatedAdvanceAmount]);

  const formatCurrency = (amt) => {
    if (typeof amt !== "number" || isNaN(amt) || amt < 0) return "₹0";
    return `₹${Math.round(amt).toLocaleString("en-IN")}`;
  };

  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return "—";
    try {
      const cleanStr = String(dateStr).trim();
      if (/^\d{4}-\d{2}-\d{2}$/.test(cleanStr)) {
        const parts = cleanStr.split("-").map(Number);
        const d = new Date(parts[0], parts[1] - 1, parts[2]);
        return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
      }
      const d = new Date(cleanStr);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
      }
    } catch (_) {}
    return dateStr;
  };

  const formatDisplayTime = (timeStr) => {
    if (!timeStr) return "—";
    try {
      const cleanStr = String(timeStr).trim();
      if (/am|pm/i.test(cleanStr)) return cleanStr;
      const [hours, minutes] = cleanStr.split(":");
      if (hours !== undefined && minutes !== undefined) {
        const h = parseInt(hours, 10);
        const m = minutes.slice(0, 2);
        const ampm = h >= 12 ? "PM" : "AM";
        const h12 = h % 12 || 12;
        return `${String(h12).padStart(2, "0")}:${m} ${ampm}`;
      }
    } catch (_) {}
    return timeStr;
  };

  // Helper to fetch backend price for a specific vehicle card
  const getVehiclePriceDisplay = (vehicle) => {
    const rate = vehicle.pricePerKm || vehicle.backendRatePerKm || 17;
    return `₹${rate}/km`;
  };

  // Continue to checkout handler
  const handleProceedToBooking = async () => {
    setErrorMessage("");

    if (!pickupLocation.trim()) {
      setErrorMessage("Please enter a pickup location in Bangalore.");
      return;
    }

    // Verify all stops against primary route corridor before booking
    for (const stop of userStops) {
      if (!stop.isPrimary) {
        const check = validateCustomStopAgainstRoute(stop, primaryWaypoints);
        if (!check.isValid) {
          setErrorMessage(
            check.reason ||
            `Stop "${stop.name}" is too far from your selected route. Please remove it to proceed.`
          );
          return;
        }
      }
    }

    if (!currentDestination) {
      setErrorMessage("Please select a destination above before proceeding to booking.");
      return;
    }

    if (isSameLocation(pickupLocation, currentDestination)) {
      setErrorMessage(
        "Pickup origin and destination cannot be the same location. Please select an outstation destination."
      );
      return;
    }

    if (!isAuthenticated || !currentUser) {
      const returnUrl = `/fleets?pickup=${encodeURIComponent(pickupLocation)}&destination=${encodeURIComponent(currentDestination.name)}&vehicle=${encodeURIComponent(selectedVehicle.id)}&start=${encodeURIComponent(tripStartDate)}`;
      navigate(`/login?redirect=${encodeURIComponent(returnUrl)}`);
      return;
    }

    setIsSubmitting(true);

    try {
      const startDateTime = new Date(`${tripStartDate}T${tripTime}:00`);
      const endDateTime = new Date(`${tripEndDate}T20:00:00`);

      if (import.meta.env.DEV) {
        console.log("SAFE DIAGNOSTIC LOG — Fare Calculated:", {
          distance: activeFareLedger.actualDistanceKm || authoritativeRoute.totalDistanceKm,
          baseFare: activeFareLedger.baseFare || activeFareLedger.baseVehicleFare,
          taxes: activeFareLedger.gst || activeFareLedger.gstAmount,
          discounts: 0,
          totalFare: totalAmount,
          advanceFare: calculatedAdvanceAmount,
        });

        console.log("SAFE DIAGNOSTIC LOG — Booking Created:", {
          baseFare: activeFareLedger.baseFare || activeFareLedger.baseVehicleFare,
          taxes: activeFareLedger.gst || activeFareLedger.gstAmount,
          totalFare: totalAmount,
          source: pickupLocation,
          destination: currentDestination.name,
        });
      }

      const bookingResult = await createBooking({
        vehicleId: selectedVehicle.id,
        selectedVehicleId: selectedVehicle.id,
        vehicleType: selectedVehicle.vehicleType || selectedVehicle.name,
        vehicleName: selectedVehicle.name,
        category: selectedVehicle.category,
        startLocation: pickupLocation,
        pickupLocation: pickupLocation,
        origin: pickupLocation,
        destination: currentDestination.name,
        majorDestinations: [currentDestination.name],
        detailedDestinations: userStops.map((s) => s.name),
        secondaryStops: userStops,
        orderedItinerary: authoritativeRoute.orderedItinerary,
        routeLegs: activeFareLedger.legs || authoritativeRoute.legs,
        legs: activeFareLedger.legs || authoritativeRoute.legs,
        actualDistanceKm: activeFareLedger.actualDistanceKm || authoritativeRoute.totalDistanceKm,
        routeDistanceKm: activeFareLedger.routeDistanceKm || authoritativeRoute.totalDistanceKm,
        minimumBillableKm: activeFareLedger.minimumBillableKm,
        billableDistanceKm: activeFareLedger.billableDistanceKm,
        destinationDistanceKm: destinationDistanceKm,
        distanceKm: destinationDistanceKm,
        stopsDistanceKm: stopsDistanceKm,
        startDate: tripStartDate,
        endDate: tripEndDate,
        requestedStartDate: tripStartDate,
        requestedEndDate: tripEndDate,
        startDateTime: startDateTime.toISOString(),
        endDateTime: endDateTime.toISOString(),
        time: tripTime,
        tripTime: tripTime,
        totalAmount: totalAmount,
        totalFare: totalAmount,
        estimatedFare: totalAmount,
        advancePercent: advancePercent,
        advanceAmount: calculatedAdvanceAmount,
        balanceDue: calculatedBalanceDue,
        remainingBalance: calculatedBalanceDue,
        baseFare: fareDetails?.baseCharges || activeFareLedger.baseFare || activeFareLedger.baseVehicleFare,
        baseVehicleFare: fareDetails?.baseCharges || activeFareLedger.baseVehicleFare || activeFareLedger.baseFare,
        driverAllowance: fareDetails?.driverAllowance ?? (activeFareLedger.totalAllowance || activeFareLedger.driverAllowance),
        totalAllowance: fareDetails?.driverAllowance ?? (activeFareLedger.totalAllowance || activeFareLedger.driverAllowance),
        platformFee: fareDetails?.platformFee || activeFareLedger.platformFee || 95,
        gst: fareDetails?.gst || activeFareLedger.gst || activeFareLedger.gstAmount,
        taxes: fareDetails?.gst || activeFareLedger.gst || activeFareLedger.gstAmount,
        discounts: 0,
        ratePerKm: activeFareLedger.vehicleRatePerKm || selectedVehicle.pricePerKm,
        pricePerKm: activeFareLedger.pricePerKm || selectedVehicle.pricePerKm,
        dailyAllowance: activeFareLedger.dailyAllowance || selectedVehicle.dailyAllowance,
        minKmPerDay: activeFareLedger.minKmPerDay || selectedVehicle.minKmPerDay,
        tripDays: activeFareLedger.tripDays,
      });

      if (bookingResult.error || !bookingResult.bookingId) {
        setErrorMessage(
          bookingResult.error || "Unable to create your trip reservation on server. Please check your connection and try again."
        );
        return;
      }

      if (import.meta.env.DEV) {
        console.log("SAFE DIAGNOSTIC LOG — Booking Saved:", {
          bookingId: bookingResult.bookingId,
          totalFare: totalAmount,
          advanceAmount: calculatedAdvanceAmount,
        });
      }


      const canonicalCheckoutData = {
        id: bookingResult.bookingId,
        bookingId: bookingResult.bookingId,
        vehicleId: selectedVehicle.id,
        selectedVehicleId: selectedVehicle.id,
        vehicleType: selectedVehicle.vehicleType || selectedVehicle.name,
        vehicleName: selectedVehicle.name,
        category: selectedVehicle.category,
        startLocation: pickupLocation,
        pickupLocation: pickupLocation,
        origin: pickupLocation,
        destination: currentDestination.name,
        majorDestinations: [currentDestination.name],
        detailedDestinations: userStops.map((s) => s.name),
        secondaryStops: userStops,
        orderedItinerary: authoritativeRoute.orderedItinerary,
        routeLegs: activeFareLedger.legs || authoritativeRoute.legs,
        legs: activeFareLedger.legs || authoritativeRoute.legs,
        startDate: tripStartDate,
        endDate: tripEndDate,
        requestedStartDate: tripStartDate,
        requestedEndDate: tripEndDate,
        startDateTime: startDateTime.toISOString(),
        endDateTime: endDateTime.toISOString(),
        time: tripTime,
        tripTime: tripTime,
        passengers: selectedVehicle.capacity || 4,
        passengersCount: selectedVehicle.capacity || 4,
        totalAmount: totalAmount,
        totalFare: totalAmount,
        estimatedFare: totalAmount,
        advancePercent: advancePercent,
        advanceAmount: calculatedAdvanceAmount,
        balanceDue: calculatedBalanceDue,
        remainingBalance: calculatedBalanceDue,
        baseFare: fareDetails?.baseCharges || activeFareLedger.baseFare || activeFareLedger.baseVehicleFare,
        baseVehicleFare: fareDetails?.baseCharges || activeFareLedger.baseVehicleFare || activeFareLedger.baseFare,
        driverAllowance: fareDetails?.driverAllowance ?? (activeFareLedger.totalAllowance || activeFareLedger.driverAllowance),
        totalAllowance: fareDetails?.driverAllowance ?? (activeFareLedger.totalAllowance || activeFareLedger.driverAllowance),
        platformFee: fareDetails?.platformFee || activeFareLedger.platformFee || 95,
        gst: fareDetails?.gst || activeFareLedger.gst || activeFareLedger.gstAmount,
        taxes: fareDetails?.gst || activeFareLedger.gst || activeFareLedger.gstAmount,
        discounts: 0,
        actualDistanceKm: activeFareLedger.actualDistanceKm || authoritativeRoute.totalDistanceKm,
        routeDistanceKm: activeFareLedger.routeDistanceKm || authoritativeRoute.totalDistanceKm,
        minimumBillableKm: activeFareLedger.minimumBillableKm,
        billableDistanceKm: activeFareLedger.billableDistanceKm,
        kmIncluded: activeFareLedger.kmIncluded,
        ratePerKm: activeFareLedger.vehicleRatePerKm || selectedVehicle.pricePerKm,
        pricePerKm: activeFareLedger.pricePerKm || selectedVehicle.pricePerKm,
        dailyAllowance: activeFareLedger.dailyAllowance || selectedVehicle.dailyAllowance,
        minKmPerDay: activeFareLedger.minKmPerDay || selectedVehicle.minKmPerDay,
        tripDays: activeFareLedger.tripDays,
      };

      if (import.meta.env.DEV) {
        console.log("FARE PAGE checkoutData:", canonicalCheckoutData);
      }

      // Persist in sessionStorage for immediate retrieval upon direct reload or refresh
      try {
        sessionStorage.setItem(`zenera_checkout_${bookingResult.bookingId}`, JSON.stringify(canonicalCheckoutData));
      } catch (_) {}

      navigate(`/checkout/${bookingResult.bookingId}`, {
        state: {
          bookingId: bookingResult.bookingId,
          checkoutData: canonicalCheckoutData,
          booking: canonicalCheckoutData,
        },
      });
    } catch (err) {
      console.error("Booking error:", err);
      setErrorMessage(err?.message || "Something went wrong while initiating booking. Please retry.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFBF7] dark:bg-[#07111F] text-charcoal dark:text-white font-sans selection:bg-orange selection:text-white flex flex-col justify-between transition-colors duration-200">

      {/* Standard Global Navbar */}
      <Navbar />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-12 space-y-12">

        {/* Global Error Banner */}
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

        {/* Route Modification Notice Banner */}
        {routeNotice && (
          <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-700 dark:text-blue-300 text-xs sm:text-sm flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="font-medium">{routeNotice}</p>
            </div>
            <button onClick={() => setRouteNotice("")} className="text-xs underline font-bold cursor-pointer">
              Dismiss
            </button>
          </div>
        )}


        {/* ========================================================
            CORE FLEETS SECTION (Clean, Simple & Premium)
           ======================================================== */}
        <section className="space-y-6">
          <div>
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-charcoal dark:text-white uppercase tracking-tight">
              CHOOSE YOUR FLEET
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-normal mt-1">
              Select the vehicle that fits your journey.
            </p>
          </div>

          {/* Dynamic Firestore Fleet Cards Grid */}
          {fleetsLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5 sm:gap-4.5">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="p-3 rounded-xl border border-[#E2E8F0] dark:border-[#1E2E42] bg-white dark:bg-[#0E1A29] animate-pulse space-y-2.5">
                  <div className="w-full aspect-[16/10] bg-slate-200 dark:bg-[#1E2E42] rounded-lg" />
                  <div className="space-y-1.5 pt-1">
                    <div className="h-3.5 bg-slate-200 dark:bg-[#1E2E42] rounded w-3/4 mx-auto" />
                    <div className="h-3 bg-slate-200 dark:bg-[#1E2E42] rounded w-1/2 mx-auto" />
                  </div>
                </div>
              ))}
            </div>
          ) : fleetsError ? (
            <div className="p-6 rounded-2xl border border-rose-500/25 bg-rose-500/10 text-center space-y-2">
              <p className="text-sm font-semibold text-rose-600 dark:text-rose-400">
                {fleetsError}
              </p>
              <button
                type="button"
                onClick={() => refreshFleets()}
                className="px-4 py-1.5 rounded-xl bg-orange hover:bg-orangeLight text-white text-xs font-bold transition-all cursor-pointer shadow-sm"
              >
                Retry Loading
              </button>
            </div>
          ) : fleets.length === 0 ? (
            <div className="p-6 rounded-2xl border border-[#E2E8F0] dark:border-[#1E2E42] bg-white dark:bg-[#0E1A29] text-center text-sm text-slate-500">
              No fleet options available.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5 sm:gap-4.5">
              {fleets.map((vehicle) => {
                const isSelected =
                  vehicle.id?.toLowerCase() === selectedVehicleId?.toLowerCase() ||
                  vehicle.name?.toLowerCase() === selectedVehicle?.name?.toLowerCase() ||
                  vehicle.id === selectedVehicle?.id;
                const priceDisplay = getVehiclePriceDisplay(vehicle);

                return (
                  <div
                    key={vehicle.id || vehicle.name}
                    role="button"
                    tabIndex={0}
                    aria-selected={isSelected}
                    onClick={() => setSelectedVehicleId(vehicle.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelectedVehicleId(vehicle.id);
                      }
                    }}
                    className={`p-3 rounded-xl border transition-all duration-150 flex flex-col justify-between cursor-pointer select-none ${isSelected
                        ? "bg-white dark:bg-[#0E1A29] border-orange ring-1 ring-orange/30 shadow-sm"
                        : "bg-white dark:bg-[#0E1A29] border-[#E2E8F0] dark:border-[#1E2E42] hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-sm"
                      }`}
                  >
                    {/* 1. Real Vehicle Image with Selected Full-Width Top Banner */}
                    <div className="relative w-full aspect-[16/10] mb-2.5 overflow-hidden rounded-lg bg-slate-100 dark:bg-[#152436]">
                      {isSelected && (
                        <div className="absolute inset-x-0 top-0 z-10 h-8 sm:h-9 bg-emerald-600 text-white flex items-center justify-center font-heading font-bold text-xs sm:text-[13px] uppercase tracking-wider shadow-sm pointer-events-none">
                          SELECTED
                        </div>
                      )}
                      <VehicleCardImage
                        vehicleId={vehicle.id}
                        vehicleName={vehicle.name}
                        className="w-full h-full object-cover transition-transform duration-200"
                      />
                    </div>

                    {/* 2. Vehicle Name & 3. Price */}
                    <div className="text-center pt-1 border-t border-slate-100 dark:border-[#1E2E42]">
                      <h3 className="font-heading font-semibold text-xs sm:text-sm text-charcoal dark:text-white truncate">
                        {vehicle.name}
                      </h3>
                      <p className="font-heading font-bold text-xs sm:text-sm text-orange mt-0.5">
                        {priceDisplay}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ========================================================
            DESTINATION SELECTION & PLANNER
           ======================================================== */}
        <section className="space-y-6">
          <div>
            <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-charcoal dark:text-white uppercase tracking-tight">
              CHOOSE YOUR DESTINATION
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-normal mt-1">
              Select your destination from Bangalore with dedicated chauffeur service.
            </p>
          </div>

          {/* Destinations Selection Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
            {DESTINATIONS.map((dest) => {
              const isSelected = dest.id === selectedDestId;
              const isSameAsPickup = pickupLocation && isSameLocation(dest, pickupLocation);

              return (
                <button
                  key={dest.id}
                  type="button"
                  onClick={() => {
                    setErrorMessage("");
                    if (isSameAsPickup) {
                      setErrorMessage(
                        `Cannot select ${dest.name} as destination because it matches your pickup origin (${pickupLocation.split(",")[0]}).`
                      );
                      return;
                    }
                    setSelectedDestId(dest.id);
                  }}
                  className={`px-4 py-2 rounded-2xl text-xs font-heading font-bold transition-all shrink-0 cursor-pointer flex items-center gap-2 ${
                    isSelected
                      ? "bg-orange text-white shadow-md shadow-orange/25"
                      : isSameAsPickup
                      ? "bg-slate-100 dark:bg-[#152436] text-slate-400 border border-dashed border-rose-300 dark:border-rose-900 opacity-60"
                      : "bg-white dark:bg-[#0E1A29] text-slate-600 dark:text-slate-300 border border-[#E2E8F0] dark:border-[#1E2E42] hover:border-orange/30"
                  }`}
                >
                  <span>{dest.name}</span>
                  {isSameAsPickup && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-500 font-bold uppercase">
                      Origin
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Active Destination Spotlight or Destination Placeholder */}
          {currentDestination ? (
            <div className="rounded-3xl bg-white dark:bg-[#0E1A29] border border-[#E2E8F0] dark:border-[#1E2E42] p-6 sm:p-8 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-5 rounded-2xl overflow-hidden aspect-[16/10] bg-slate-100 dark:bg-[#152436]">
                <DestinationImage
                  src={currentDestination.image}
                  alt={currentDestination.alt || currentDestination.name}
                  aspectRatio="aspect-auto"
                  className="w-full h-full"
                />
              </div>

              <div className="md:col-span-7 space-y-3">
                <div>
                  <span className="text-orange text-xs font-heading font-bold uppercase tracking-wider">
                    {currentDestination.tagline}
                  </span>
                  <h3 className="font-heading font-extrabold text-2xl sm:text-3xl text-charcoal dark:text-white uppercase tracking-tight mt-0.5">
                    {currentDestination.name}, {currentDestination.state}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mt-2">
                    {currentDestination.description || currentDestination.overview}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 text-xs text-slate-600 dark:text-slate-300 pt-2">
                  <span className="px-3 py-1 rounded-xl bg-[#F5F7FA] dark:bg-[#07111F] border border-[#E2E8F0] dark:border-[#1E2E42]">
                    <strong>{currentDestination.duration}</strong>
                  </span>
                  <span className="px-3 py-1 rounded-xl bg-[#F5F7FA] dark:bg-[#07111F] border border-[#E2E8F0] dark:border-[#1E2E42]">
                    <strong>{currentDestination.distance}</strong>
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl bg-white dark:bg-[#0E1A29] border border-dashed border-[#E2E8F0] dark:border-[#1E2E42] p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-orange/10 text-orange flex items-center justify-center mx-auto text-2xl">
                🧭
              </div>
              <h3 className="font-heading font-extrabold text-lg text-charcoal dark:text-white">
                Choose a Destination
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Select one of the destinations above to view route details, explore popular sightseeing spots, and calculate verified transparent pricing.
              </p>
            </div>
          )}
        </section>

        {/* ========================================================
            PEOPLE ALSO VISIT & YOUR JOURNEY TIMELINE
           ======================================================== */}
        <section className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">

            {/* Left 8 Columns: Recommendations & Add Stop Search */}
            <div className="lg:col-span-8 space-y-8">

              {/* People Also Visit */}
              {currentDestination && (
                <PeopleAlsoVisit
                  destination={currentDestination}
                  recommendations={dynamicRecommendations}
                  selectedStops={userStops}
                  onAddStop={handleAddStop}
                  onRemoveStop={handleRemoveStop}
                  title={`PEOPLE ALSO VISIT AROUND ${currentDestination.name.toUpperCase()}`}
                  subtitle={`Popular places travelers often explore while visiting ${currentDestination.name}. Suggestions only — customize as you like.`}
                />
              )}

              {/* Add Your Own Stop Search Bar */}
              <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0E1A29] border border-[#E2E8F0] dark:border-[#1E2E42] shadow-sm">
                <AddStopSearch
                  selectedStops={userStops}
                  onAddStop={handleAddStop}
                  onRemoveStop={handleRemoveStop}
                  currentDestinationId={currentDestination?.id || ""}
                  currentDestination={currentDestination}
                  pickupLocation={pickupLocation}
                  primaryWaypoints={primaryWaypoints}
                />
              </div>

            </div>

            {/* Right 4 Columns: YOUR JOURNEY Timeline with Drag & Drop */}
            <div className="lg:col-span-4 sticky top-24 space-y-6 w-full min-w-0">
              <FleetJourneyBuilder
                pickupLocation={pickupLocation}
                onChangePickupLocation={setPickupLocation}
                destination={currentDestination}
                onChangeDestination={(destId) => setSelectedDestId(destId)}
                selectedStops={userStops}
                selectedVehicle={selectedVehicle}
                vehiclePriceDisplay={getVehiclePriceDisplay(selectedVehicle)}
                primaryWaypoints={primaryWaypoints}
                onAddStop={handleAddStop}
                onRemoveStop={handleRemoveStop}
                onEditStopName={handleEditStopName}
                onMoveStopUp={handleMoveStopUp}
                onMoveStopDown={handleMoveStopDown}
                onReorderStops={handleReorderStops}
                onClearAllStops={handleClearAllStops}
              />
            </div>

          </div>
        </section>

        {/* ========================================================
            SCHEDULE & SERVER-AUTHORITATIVE TRIP ESTIMATE
           ======================================================== */}
        <section className="rounded-3xl bg-white dark:bg-[#0E1A29] border border-[#E2E8F0] dark:border-[#1E2E42] p-6 sm:p-8 shadow-sm space-y-8">
          <div>
            <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-charcoal dark:text-white uppercase tracking-tight">
              SCHEDULE & FARE ESTIMATE
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-normal mt-1">
              Authoritative pricing fetched from server.
            </p>
          </div>

          {/* Form Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <LocationSearchInput
                label="Pickup Origin"
                id="book-pickup-origin"
                value={pickupLocation}
                onChange={setPickupLocation}
                isPickup={true}
                placeholder="Enter pickup location (e.g. Bangalore)"
                inputClassName="py-2.5 rounded-2xl"
              />
            </div>

            <div>
              <CustomDatePicker
                id="book-start-date"
                label="Start Date"
                value={tripStartDate}
                onChange={(val) => {
                  setTripStartDate(val);
                  if (tripEndDate && val > tripEndDate) {
                    setTripEndDate(val);
                  }
                }}
                placeholder="Select start date"
              />
            </div>

            <div>
              <CustomDatePicker
                id="book-end-date"
                label="End Date"
                value={tripEndDate}
                minDate={tripStartDate}
                onChange={(val) => setTripEndDate(val)}
                placeholder="Select end date"
              />
            </div>

            <div>
              <CustomTimePicker
                id="book-pickup-time"
                label="Pickup Time"
                value={tripTime}
                onChange={(val) => setTripTime(val)}
                placeholder="Select time"
              />
            </div>
          </div>

          {/* Pricing & Advance Payment */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-6 border-t border-[#E2E8F0] dark:border-[#1E2E42] items-start">

            {/* Left 7 Cols: Transparent & Detailed Fare Ledger */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-[#1E2E42]">
                <span className="font-heading font-extrabold text-xs uppercase tracking-wider text-charcoal dark:text-white">
                  FARE BREAKDOWN & INCLUSIONS
                </span>
                {isEstimating ? (
                  <span className="text-[11px] font-semibold text-orange animate-pulse flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-orange animate-ping" />
                    Calculating Fare...
                  </span>
                ) : (
                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                    Zero Hidden Surge
                  </span>
                )}
              </div>

              {isEstimating && !backendEstimate ? (
                <div className="space-y-3 py-2 animate-pulse">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1 w-2/3">
                      <div className="h-3.5 bg-slate-200 dark:bg-slate-700/60 rounded w-3/4" />
                      <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded w-1/2" />
                    </div>
                    <div className="h-4 bg-slate-200 dark:bg-slate-700/60 rounded w-16" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1 w-2/3">
                      <div className="h-3.5 bg-slate-200 dark:bg-slate-700/60 rounded w-2/3" />
                      <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded w-1/2" />
                    </div>
                    <div className="h-4 bg-slate-200 dark:bg-slate-700/60 rounded w-14" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1 w-2/3">
                      <div className="h-3.5 bg-slate-200 dark:bg-slate-700/60 rounded w-1/2" />
                      <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded w-2/5" />
                    </div>
                    <div className="h-4 bg-slate-200 dark:bg-slate-700/60 rounded w-12" />
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-[#1E2E42]/60">
                    <div className="space-y-1 w-2/3">
                      <div className="h-3.5 bg-slate-200 dark:bg-slate-700/60 rounded w-1/2" />
                      <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded w-3/5" />
                    </div>
                    <div className="h-3.5 bg-slate-100 dark:bg-slate-800 rounded w-20" />
                  </div>
                </div>
              ) : (
                <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                  {/* 1. Base Vehicle Fare */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium text-charcoal dark:text-white block">
                        Base Vehicle Fare ({selectedVehicle.name} • {activeFareLedger.tripDays} Day{activeFareLedger.tripDays > 1 ? "s" : ""})
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Includes {activeFareLedger.kmIncluded || ((selectedVehicle.minKmPerDay || 300) * (activeFareLedger.tripDays || 1))} km package (₹{activeFareLedger.vehicleRatePerKm || selectedVehicle.backendRatePerKm || selectedVehicle.pricePerKm}/km beyond limit)
                      </span>
                    </div>
                    <span className="font-mono font-bold text-charcoal dark:text-white shrink-0">
                      {formatCurrency(activeFareLedger.baseFare || activeFareLedger.baseVehicleFare)}
                    </span>
                  </div>

                  {/* 2. Driver Day Allowance (Bata) */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium text-charcoal dark:text-white block">
                        Driver Day Allowance ({activeFareLedger.tripDays} Day{activeFareLedger.tripDays > 1 ? "s" : ""} @ ₹{selectedVehicle.dailyAllowance || 500}/day)
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Covers verified chauffeur meals & operational allowance
                      </span>
                    </div>
                    <span className="font-mono font-bold text-charcoal dark:text-white shrink-0">
                      {formatCurrency(activeFareLedger.totalAllowance || activeFareLedger.driverAllowance)}
                    </span>
                  </div>

                  {/* 3. Platform & Reservation Fee */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium text-charcoal dark:text-white block">
                        Platform & Reservation Fee
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Booking protection, verified fleet guarantee & 24x7 support
                      </span>
                    </div>
                    <span className="font-mono font-bold text-charcoal dark:text-white shrink-0">
                      {formatCurrency(activeFareLedger.platformFee || 95)}
                    </span>
                  </div>

                  {/* 4. Applicable Govt Taxes & GST */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium text-charcoal dark:text-white block">
                        Applicable Govt Taxes & GST ({`${(fareDetails?.gstRate ?? 0.05) * 100}%`})
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Official tour operator tax invoice provided with digital receipt
                      </span>
                    </div>
                    <span className="font-mono font-bold text-charcoal dark:text-white shrink-0">
                      {formatCurrency(fareDetails?.gst || activeFareLedger.gst || activeFareLedger.gstAmount)}
                    </span>
                  </div>

                  {/* 5. Tolls & State Permits */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-[#1E2E42]/60">
                    <div>
                      <span className="font-medium text-charcoal dark:text-white block">
                        Tolls, Parking & State Permits
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Pay directly as per actual FASTag / receipt (Zero platform markup)
                      </span>
                    </div>
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 shrink-0">
                      As per actuals
                    </span>
                  </div>
                </div>
              )}

              {/* Total Estimated Fare Highlight */}
              <div className="pt-3 border-t border-slate-200 dark:border-[#1E2E42] flex items-center justify-between">
                <div>
                  <span className="font-heading font-extrabold text-sm uppercase tracking-wider text-charcoal dark:text-white block">
                    Total Estimated Fare
                  </span>
                  {isEstimating && !backendEstimate ? (
                    <div className="h-3 bg-slate-200 dark:bg-slate-700/60 rounded w-36 mt-1 animate-pulse" />
                  ) : (
                    <div className="text-[11px] font-medium mt-0.5 space-y-0.5">
                      <span className="text-emerald-600 dark:text-emerald-400 block">
                        • {activeFareLedger.billableDistanceKm || activeFareLedger.kmIncluded || ((selectedVehicle.minKmPerDay || 300) * (activeFareLedger.tripDays || 1))} km total distance
                      </span>
                      <span className="text-slate-500 dark:text-slate-400 block">
                        • Dedicated Chauffeur ({activeFareLedger.kmIncluded || ((selectedVehicle.minKmPerDay || 300) * (activeFareLedger.tripDays || 1))} km package included)
                      </span>
                    </div>
                  )}
                </div>
                <div className="text-right">
                  {isEstimating && !backendEstimate ? (
                    <div className="h-8 bg-slate-200 dark:bg-slate-700/60 rounded w-28 animate-pulse ml-auto" />
                  ) : (
                    <span className="font-heading font-extrabold text-2xl sm:text-3xl text-orange">
                      {formatCurrency(totalAmount)}
                    </span>
                  )}
                </div>
              </div>


              {/* Terms & Conditions Reference Link */}
              <div className="pt-1 flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                <span>By booking, you agree to Zenera's</span>
                <button
                  type="button"
                  onClick={() => setShowTermsModal(true)}
                  className="text-orange hover:underline font-bold inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>Terms & Conditions / Fare Policy</span>
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Right 5 Cols: Advance Percentage Selector & Checkout CTA */}
            <div className="lg:col-span-5 p-5 sm:p-6 rounded-2xl bg-[#F5F7FA] dark:bg-[#07111F] border border-[#E2E8F0] dark:border-[#1E2E42] space-y-4">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Select Advance to Confirm
                </span>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {[25, 50, 100].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setAdvancePercent(pct)}
                      className={`py-2 rounded-xl font-heading font-bold text-xs transition-all cursor-pointer ${advancePercent === pct
                          ? "bg-orange text-white shadow-md shadow-orange/20"
                          : "bg-white dark:bg-[#0E1A29] text-slate-600 dark:text-slate-300 border border-[#E2E8F0] dark:border-[#1E2E42]"
                        }`}
                    >
                      {pct}% Advance
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200 dark:border-[#E2E8F0] dark:border-[#1E2E42]">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Payable today:</span>
                {isEstimating && !activeFareLedger ? (
                  <div className="h-6 bg-slate-200 dark:bg-slate-700/60 rounded w-20 animate-pulse" />
                ) : (
                  <span className="font-heading font-extrabold text-xl text-charcoal dark:text-white">
                    {formatCurrency(calculatedAdvanceAmount)}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Remaining balance:</span>
                {isEstimating && !activeFareLedger ? (
                  <div className="h-4 bg-slate-200 dark:bg-slate-700/60 rounded w-32 animate-pulse" />
                ) : (
                  <span className="font-mono font-medium">
                    {formatCurrency(calculatedBalanceDue)} (Pay to driver during trip)
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={handleProceedToBooking}
                disabled={isSubmitting || (isEstimating && !activeFareLedger)}
                className="w-full py-3.5 px-4 rounded-xl bg-orange hover:bg-orangeLight text-white font-heading font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-orange/25 transition-all cursor-pointer disabled:opacity-60"
              >
                {isSubmitting ? (
                  <span>Securing Vehicle...</span>
                ) : isEstimating ? (
                  <span>Calculating Fare...</span>
                ) : (
                  <>
                    <span>Proceed to Details & Checkout</span>
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M5 12h14" />
                      <path d="m12 5 7 7-7 7" />
                    </svg>
                  </>
                )}
              </button>
            </div>

          </div>
        </section>

      </main>

      {/* Terms & Conditions / Fare Policy Modal */}
      <AnimatePresence>
        {showTermsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowTermsModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-2xl bg-white dark:bg-[#0E1A29] rounded-3xl border border-[#E2E8F0] dark:border-[#1E2E42] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] z-10"
            >
              {/* Modal Header */}
              <div className="p-5 sm:p-6 border-b border-[#E2E8F0] dark:border-[#1E2E42] flex items-center justify-between bg-[#F5F7FA] dark:bg-[#0A1420]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-orange/10 text-orange flex items-center justify-center font-bold text-sm">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-heading font-extrabold text-base sm:text-lg text-charcoal dark:text-white">
                      Terms & Conditions & Fare Policy
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Transparent guidelines for outstation trips with Zenera Trips
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowTermsModal(false)}
                  className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 hover:bg-orange hover:text-white text-slate-500 dark:text-slate-300 flex items-center justify-center text-sm transition-colors cursor-pointer"
                  title="Close"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed divide-y divide-slate-100 dark:divide-slate-800">

                {/* Section 1 */}
                <div className="space-y-1.5 pt-1">
                  <h4 className="font-heading font-bold text-charcoal dark:text-white flex items-center gap-1.5">
                    <span>1. Distance & Kilometer Calculation</span>
                  </h4>
                  <p className="text-slate-500 dark:text-slate-400 text-xs">
                    • Distance is calculated on a round-trip basis starting and returning to Bangalore.
                    <br />
                    • Your package includes <strong>{backendEstimate?.kmIncluded ?? ((selectedVehicle.minKmPerDay || 300) * tripDaysCount)} km</strong>.
                    <br />
                    • Extra kilometers beyond the package limit are billed at <strong>₹{selectedVehicle.pricePerKm || selectedVehicle.backendRatePerKm || 17}/km</strong> at the end of the trip.
                  </p>
                </div>

                {/* Section 2 */}
                <div className="space-y-1.5 pt-3">
                  <h4 className="font-heading font-bold text-charcoal dark:text-white flex items-center gap-1.5">
                    <span>2. Driver Day Allowance (Bata)</span>
                  </h4>
                  <p className="text-slate-500 dark:text-slate-400 text-xs">
                    • Driver Day Allowance (₹{selectedVehicle.dailyAllowance || 500}/day) is included in the estimated fare to cover meals and accommodation.
                    <br />
                    • No extra or hidden night driving charges are levied during standard outstation holiday itineraries.
                  </p>
                </div>

                {/* Section 3 */}
                <div className="space-y-1.5 pt-3">
                  <h4 className="font-heading font-bold text-charcoal dark:text-white flex items-center gap-1.5">
                    <span>3. Tolls, Parking & Interstate Permits</span>
                  </h4>
                  <p className="text-slate-500 dark:text-slate-400 text-xs">
                    • Highway FASTag tolls, monument/airport parking fees, and interstate border entry taxes (if crossing state borders into TN, Kerala, Goa, etc.) are payable directly as per actual receipts.
                  </p>
                </div>

                {/* Section 4 */}
                <div className="space-y-1.5 pt-3">
                  <h4 className="font-heading font-bold text-charcoal dark:text-white flex items-center gap-1.5">
                    <span>4. 100% Refund & Cancellation Policy</span>
                  </h4>
                  <p className="text-slate-500 dark:text-slate-400 text-xs">
                    • <strong>100% Refund</strong> of advance deposit if cancelled at least 24 hours prior to scheduled departure.
                    <br />
                    • Free date rescheduling available up to 12 hours before pickup.
                  </p>
                </div>

                {/* Section 5 */}
                <div className="space-y-1.5 pt-3">
                  <h4 className="font-heading font-bold text-charcoal dark:text-white flex items-center gap-1.5">
                    <span>5. Fleet & Service Standards</span>
                  </h4>
                  <p className="text-slate-500 dark:text-slate-400 text-xs">
                    • Fully sanitized, AC-equipped commercial vehicles with commercial transport insurance.
                    <br />
                    • Experienced highway chauffeurs with verified background checks and route expertise.
                  </p>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="p-4 sm:p-5 border-t border-[#E2E8F0] dark:border-[#1E2E42] bg-[#F5F7FA] dark:bg-[#0A1420] flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Zenera Trips Official Outstation Policy
                </span>
                <button
                  type="button"
                  onClick={() => setShowTermsModal(false)}
                  className="px-5 py-2 rounded-xl bg-orange hover:bg-orangeLight text-white font-heading font-bold text-xs shadow-md transition-colors cursor-pointer"
                >
                  I Understand
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
