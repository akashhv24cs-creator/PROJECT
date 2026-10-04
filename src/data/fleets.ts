/**
 * Authoritative Fleet Module
 * Powered by Firestore `pricing_rules` single source of truth.
 */
export * from "../services/fleet.service";
import { fetchFleetPricing, resolveVehicle as dynamicResolveVehicle, calculateAuthoritativeFare as dynamicCalculateAuthoritativeFare, type FleetVehicle } from "../services/fleet.service";

/**
 * Fallback baseline fleet for SSR / immediate initialization before async network resolution.
 * Actual prices and metadata are dynamically populated from Firestore `pricing_rules` at runtime.
 */
export const FLEET_VEHICLES: FleetVehicle[] = [
  { id: "Sedan", name: "Sedan", vehicleType: "Sedan", pricePerKm: 17, backendRatePerKm: 17, dailyAllowance: 500, minKmPerDay: 300, baseRate: 5100, seats: "4 seats", category: "sedan", available: true, tag: "Best Value" },
  { id: "Ertiga", name: "Ertiga", vehicleType: "Ertiga", pricePerKm: 18, backendRatePerKm: 18, dailyAllowance: 500, minKmPerDay: 300, baseRate: 5400, seats: "6–7 seats", category: "suv", available: true, tag: null },
  { id: "Innova Crysta", name: "Innova Crysta", vehicleType: "Innova Crysta", pricePerKm: 19, backendRatePerKm: 19, dailyAllowance: 500, minKmPerDay: 300, baseRate: 5700, seats: "7 seats", category: "suv", available: true, tag: "Premium" },
  { id: "SUV", name: "SUV", vehicleType: "SUV", pricePerKm: 20, backendRatePerKm: 20, dailyAllowance: 500, minKmPerDay: 300, baseRate: 6000, seats: "6–7 seats", category: "suv", available: true, tag: null },
  { id: "Toyota", name: "Toyota", vehicleType: "Toyota", pricePerKm: 21, backendRatePerKm: 21, dailyAllowance: 500, minKmPerDay: 300, baseRate: 6300, seats: "7 seats", category: "suv", available: true, tag: null },
  { id: "Honda", name: "Honda", vehicleType: "Honda", pricePerKm: 23, backendRatePerKm: 23, dailyAllowance: 500, minKmPerDay: 300, baseRate: 6900, seats: "4–5 seats", category: "sedan", available: true, tag: null },
  { id: "TT", name: "TT", vehicleType: "TT", pricePerKm: 27, backendRatePerKm: 27, dailyAllowance: 500, minKmPerDay: 300, baseRate: 8100, seats: "12–17 seats", category: "tempo", available: true, tag: "Most Popular" },
  { id: "Mini Bus", name: "Mini Bus", vehicleType: "Mini Bus", pricePerKm: 29, backendRatePerKm: 29, dailyAllowance: 500, minKmPerDay: 300, baseRate: 8700, seats: "20–35 seats", category: "bus", available: true, tag: null },
  { id: "Bus", name: "Bus", vehicleType: "Bus", pricePerKm: 33, backendRatePerKm: 33, dailyAllowance: 500, minKmPerDay: 300, baseRate: 9900, seats: "40+ seats", category: "bus", available: true, tag: null },
  { id: "Hatchback", name: "Hatchback", vehicleType: "Hatchback", pricePerKm: 33, backendRatePerKm: 33, dailyAllowance: 500, minKmPerDay: 300, baseRate: 9900, seats: "4 seats", category: "hatchback", available: true, tag: null },
  { id: "Innova", name: "Innova", vehicleType: "Innova", pricePerKm: 17, backendRatePerKm: 17, dailyAllowance: 500, minKmPerDay: 300, baseRate: 5100, seats: "7 seats", category: "suv", available: true, tag: null },
];

export const resolveVehicle = dynamicResolveVehicle;
export const calculateAuthoritativeFare = dynamicCalculateAuthoritativeFare;
