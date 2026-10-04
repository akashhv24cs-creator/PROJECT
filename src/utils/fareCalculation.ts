/**
 * ✅ CENTRAL FARE & GST CALCULATION
 * Used by all pages - ensures consistent calculation everywhere
 */

export interface FareDetails {
  baseCharges: number;
  driverAllowance?: number;
  platformFee: number;
  subtotal: number;
  gstRate: number;
  gst: number;
  totalFare: number;
  advance?: number;
}

/**
 * Main calculation function
 * Input: base charges, driver allowance
 * Output: complete fare breakdown with GST
 */
export const calculateFareWithGST = (
  baseCharges: number,
  driverAllowance: number = 0
): FareDetails => {
  try {
    // ✅ STEP 1: Fixed values
    const platformFee = 95;  // Always ₹95
    const gstRate = 0.05;    // Always 5%
    
    // ✅ STEP 2: Calculate subtotal (before GST)
    const subtotal = baseCharges + driverAllowance + platformFee;
    
    if (subtotal <= 0) {
      throw new Error('Invalid calculation: subtotal must be positive');
    }
    
    // ✅ STEP 3: Calculate GST (5% of subtotal)
    const gst = Math.round(subtotal * gstRate);
    
    // ✅ STEP 4: Calculate total with GST
    const totalFare = subtotal + gst;
    
    // ✅ STEP 5: Calculate advance (25% of total)
    const advance = Math.round(totalFare * 0.25);
    
    // ✅ STEP 6: Return complete breakdown
    const fareDetails: FareDetails = {
      baseCharges: baseCharges,
      driverAllowance: driverAllowance,
      platformFee: platformFee,
      subtotal: subtotal,
      gstRate: gstRate,
      gst: gst,
      totalFare: totalFare,
      advance: advance,
    };
    
    // ✅ LOG FOR DEBUGGING
    console.log('SAFE DIAGNOSTIC LOG — Fare Calculated:', {
      baseCharges: fareDetails.baseCharges,
      driverAllowance: fareDetails.driverAllowance,
      platformFee: fareDetails.platformFee,
      subtotal: fareDetails.subtotal,
      gstRate: `${fareDetails.gstRate * 100}%`,
      gst: fareDetails.gst,
      totalFare: fareDetails.totalFare,
      advance: fareDetails.advance,
    });
    
    return fareDetails;
    
  } catch (error) {
    console.error('SAFE DIAGNOSTIC LOG — Fare Calculation Error:', error);
    throw error;
  }
};

/**
 * Validate fare calculation
 */
export const validateFareDetails = (fare: FareDetails): boolean => {
  return (
    fare.baseCharges > 0 &&
    fare.platformFee === 95 &&
    fare.subtotal > 0 &&
    fare.gstRate === 0.05 &&
    fare.gst > 0 &&
    fare.totalFare > 0 &&
    fare.totalFare === fare.subtotal + fare.gst
  );
};
