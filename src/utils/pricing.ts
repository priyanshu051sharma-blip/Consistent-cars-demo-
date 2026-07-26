export interface DynamicPricingBreakdown {
  basePrice: number;
  extraKm: number;
  extraCharge: number;
  driverAllowance: number;
  totalCost: number;
  advanceBookingRequired: boolean;
  advanceBookingAmount: number;
}

export function calculateDynamicPricing({
  basePrice,
  kilometers,
  pricePerKm = 18,
  baseKm = 30,
  driverAllowance = 300,
  advanceBookingThreshold = 30,
  advanceBookingPercent = 0.3,
  minAdvanceAmount = 3000,
}: {
  basePrice: number;
  kilometers: number;
  pricePerKm?: number;
  baseKm?: number;
  driverAllowance?: number;
  advanceBookingThreshold?: number;
  advanceBookingPercent?: number;
  minAdvanceAmount?: number;
}): DynamicPricingBreakdown {
  const normalizedKm = Math.max(0, Math.round(kilometers || 0));
  const extraKm = Math.max(normalizedKm - baseKm, 0);
  const extraCharge = extraKm * pricePerKm;
  const totalCost = basePrice + extraCharge + driverAllowance;
  const advanceBookingRequired = normalizedKm > advanceBookingThreshold;
  const advanceBookingAmount = Math.round(
    Math.max(minAdvanceAmount, totalCost * advanceBookingPercent)
  );

  return {
    basePrice,
    extraKm,
    extraCharge,
    driverAllowance,
    totalCost,
    advanceBookingRequired,
    advanceBookingAmount,
  };
}

export function getLocationExamples(locationName?: string) {
  const normalized = (locationName || "").toLowerCase();

  if (normalized.includes("pune")) {
    return {
      pickupPlaceholder: "e.g., Pune Airport, Baner",
      dropPlaceholder: "e.g., Hinjewadi, Kharadi",
      heading: "Pune Car Rental",
    };
  }

  if (normalized.includes("delhi")) {
    return {
      pickupPlaceholder: "e.g., Delhi Airport, Connaught Place",
      dropPlaceholder: "e.g., Gurgaon, Noida",
      heading: "Delhi Car Rental",
    };
  }

  return {
    pickupPlaceholder: "e.g., Airport, City Center",
    dropPlaceholder: "e.g., Hotel, Office",
    heading: `${locationName || "City"} Car Rental`,
  };
}
