export interface DynamicPricingBreakdown {
  baseFare: number;
  distanceCharge: number;
  timeCharge: number;
  surgeMultiplier: number;
  surgeAmount: number;
  tollCharges: number;
  airportParkingFee: number;
  platformFee: number;
  taxAmount: number;
  discountAmount: number;
  subtotal: number;
  totalCost: number;
  minimumFare: number;
  advanceBookingRequired: boolean;
  advanceBookingAmount: number;
  vehicleType: string;
  breakdown: Array<{ label: string; amount: number }>;
  basePrice: number;
  extraKm: number;
  extraCharge: number;
  driverAllowance: number;
}

export interface VehiclePricingTier {
  name: string;
  baseFare: number;
  pricePerKm: number;
  pricePerMinute: number;
  minimumFare: number;
}

export const vehiclePricingTiers: Record<string, VehiclePricingTier> = {
  bike: { name: "Bike", baseFare: 28, pricePerKm: 7.5, pricePerMinute: 0.9, minimumFare: 45 },
  mini: { name: "Mini", baseFare: 65, pricePerKm: 11, pricePerMinute: 1.8, minimumFare: 120 },
  sedan: { name: "Sedan", baseFare: 75, pricePerKm: 14, pricePerMinute: 2.2, minimumFare: 180 },
  suv: { name: "SUV", baseFare: 110, pricePerKm: 18, pricePerMinute: 2.8, minimumFare: 220 },
};

function roundCurrency(value: number) {
  return Math.round(value * 100) / 100;
}

function resolveVehicleTier(vehicleType?: string): VehiclePricingTier {
  const normalized = (vehicleType || "mini").toLowerCase();

  if (normalized.includes("bike")) return vehiclePricingTiers.bike;
  if (normalized.includes("sedan")) return vehiclePricingTiers.sedan;
  if (normalized.includes("suv") || normalized.includes("innova") || normalized.includes("xuv")) {
    return vehiclePricingTiers.suv;
  }

  return vehiclePricingTiers.mini;
}

export function calculateDynamicPricing({
  basePrice,
  kilometers,
  minutes = 0,
  vehicleType,
  pricePerKm,
  pricePerMinute,
  baseKm = 30,
  driverAllowance = 0,
  surgeMultiplier = 1,
  platformFee = 15,
  taxRate = 0.12,
  discounts = 0,
  tollCharges = 0,
  airportParkingFee = 0,
  advanceBookingThreshold = 25,
  advanceBookingPercent = 0,
  minAdvanceAmount = 300,
  tripMultiplier = 1,
  taxes = 0,
}: {
  basePrice?: number;
  kilometers: number;
  minutes?: number;
  vehicleType?: string;
  pricePerKm?: number;
  pricePerMinute?: number;
  baseKm?: number;
  driverAllowance?: number;
  surgeMultiplier?: number;
  platformFee?: number;
  taxRate?: number;
  taxes?: number;
  discounts?: number;
  tollCharges?: number;
  airportParkingFee?: number;
  advanceBookingThreshold?: number;
  advanceBookingPercent?: number;
  minAdvanceAmount?: number;
  tripMultiplier?: number;
}): DynamicPricingBreakdown {
  const vehicleTier = resolveVehicleTier(vehicleType);
  const normalizedKm = Math.max(0, Math.round(kilometers || 0));
  const normalizedMinutes = Math.max(0, Math.round(minutes || 0));
  const ratePerKm = pricePerKm ?? vehicleTier.pricePerKm;
  const ratePerMinute = pricePerMinute ?? vehicleTier.pricePerMinute;
  const packageDurationMinutes = 480; // 8 hours package assumption
  const isPackageTrip = normalizedKm > baseKm || normalizedMinutes > packageDurationMinutes;
  const localShortTrip = !isPackageTrip && normalizedKm <= 40 && normalizedMinutes <= 90;
  const packageBasePrice = basePrice ?? vehicleTier.baseFare;
  const baseFare = packageBasePrice;
  const distanceCharge = isPackageTrip
    ? Math.max(normalizedKm - baseKm, 0) * ratePerKm
    : normalizedKm * ratePerKm;
  const timeCharge = isPackageTrip
    ? Math.max(normalizedMinutes - packageDurationMinutes, 0) * ratePerMinute
    : normalizedMinutes * ratePerMinute;
  const extraKm = Math.max(normalizedKm - baseKm, 0);
  const extraCharge = extraKm * ratePerKm;
  const subtotal = baseFare + distanceCharge + timeCharge;
  const normalizedSurge = Math.max(1, surgeMultiplier || 1);
  const surgeAmount = subtotal * (normalizedSurge - 1);
  const driverAllowanceToUse = driverAllowance;
  const usedPlatformFee = platformFee;
  const totalBeforeTax = subtotal + surgeAmount + tollCharges + airportParkingFee + usedPlatformFee + driverAllowanceToUse;
  const effectiveTaxRate = taxRate ?? (taxes ?? 0);
  const taxAmount = totalBeforeTax * effectiveTaxRate;
  const discountAmount = Math.max(0, discounts || 0);
  const minimumFare = Math.max(vehicleTier.minimumFare, baseFare);
  const subtotalAfterTax = roundCurrency(totalBeforeTax + taxAmount - discountAmount);
  const preMultiplierCost = Math.max(minimumFare, subtotalAfterTax);
  const finalCost = roundCurrency(preMultiplierCost * tripMultiplier);
  const adjustmentAmount = roundCurrency(finalCost - preMultiplierCost);
  const advanceBookingRequired = normalizedKm > advanceBookingThreshold;
  const advanceBookingAmount = Math.round(
    Math.max(minAdvanceAmount, finalCost * advanceBookingPercent)
  );

  return {
    baseFare: roundCurrency(baseFare),
    distanceCharge: roundCurrency(distanceCharge),
    timeCharge: roundCurrency(timeCharge),
    surgeMultiplier: normalizedSurge,
    surgeAmount: roundCurrency(surgeAmount),
    tollCharges: roundCurrency(tollCharges),
    airportParkingFee: roundCurrency(airportParkingFee),
    platformFee: roundCurrency(platformFee),
    taxAmount: roundCurrency(taxAmount),
    discountAmount: roundCurrency(discountAmount),
    subtotal: roundCurrency(subtotal),
    totalCost: finalCost,
    minimumFare: roundCurrency(minimumFare),
    advanceBookingRequired,
    advanceBookingAmount,
    vehicleType: vehicleTier.name,
    breakdown: [
      { label: "Base Fare", amount: roundCurrency(baseFare) },
      { label: "Distance", amount: roundCurrency(distanceCharge) },
      { label: "Travel Time", amount: roundCurrency(timeCharge) },
      { label: "Surge", amount: roundCurrency(surgeAmount) },
      { label: "Platform Fee", amount: roundCurrency(usedPlatformFee) },
      { label: "Driver Allowance", amount: roundCurrency(driverAllowanceToUse) },
      { label: "Taxes", amount: roundCurrency(taxAmount) },
      { label: "Discounts", amount: roundCurrency(-discountAmount) },
      ...(tripMultiplier !== 1 ? [{ label: "Trip Adjustment", amount: adjustmentAmount }] : []),
    ],
    basePrice: roundCurrency(baseFare),
    extraKm,
    extraCharge: roundCurrency(extraCharge),
    driverAllowance: roundCurrency(driverAllowance),
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
