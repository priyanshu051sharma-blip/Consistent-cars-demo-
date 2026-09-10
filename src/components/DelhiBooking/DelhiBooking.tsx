import React, { useState, useEffect } from "react";
import { MapPin, Car, Zap, Calendar, Clock, User, Mail, Phone } from "lucide-react";
import { calculateDynamicPricing, getLocationExamples } from "../../utils/pricing";
import Pay from "../Pay/Pay";
import LiveRouteMap from "../LiveRouteMap/LiveRouteMap";

const getDemandMultiplier = (tripDate: string, tripTime: string) => {
    if (!tripDate) return 1;

    const [year, month, day] = tripDate.split('-').map(Number);
    const [hours = 0, minutes = 0] = (tripTime || "00:00").split(':').map(Number);
    const parsedDate = new Date(year, month - 1, day, hours, minutes);
    const dayOfWeek = parsedDate.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const rushHour = (hours >= 7 && hours <= 10) || (hours >= 17 && hours <= 20);

    if (isWeekend) return 1.2;
    if (rushHour) return 1.3;
    if (hours >= 22 || hours <= 5) return 1.2;
    return 1;
};

interface Pricing {
    id: string;
    location: string;
    pricePerKm: number;
    basePrice: number;
    baseKm: number;
    extraHourRate: number;
    driverAllowance: number;
    description: string;
    car: {
        id: string;
        name: string;
        type: string;
        seats: number;
    };
}

interface PricingCalculator {
    location: string;
    carId: string;
    kilometers?: number;
    hours?: number;
}

interface DelhiBookingProps {
    cityName?: string;
}

const DelhiBooking = ({ cityName = "Delhi" }: DelhiBookingProps) => {
    const [bookingType, setBookingType] = useState<"local" | "outstation">("local");
    const [selectedCar, setSelectedCar] = useState<string>("");
    const [kilometers, setKilometers] = useState<number>(80);
    const [pricing, setPricing] = useState<Pricing[]>([]);
    const [selectedPricing, setSelectedPricing] = useState<Pricing | null>(null);
    const [totalCost, setTotalCost] = useState<number>(0);
    const [advanceBookingRequired, setAdvanceBookingRequired] = useState(false);
    const [advanceBookingAmount, setAdvanceBookingAmount] = useState(0);
    const [paymentReady, setPaymentReady] = useState(false);

    const [contactDetails, setContactDetails] = useState({
        name: "",
        email: "",
        phone: "",
        date: "",
        time: "",
        pickupLocation: "",
        dropLocation: "",
    });

    const [distanceData, setDistanceData] = useState<{
        distance: number;
        duration: string;
        trafficMultiplier?: number;
        trafficAvailable?: boolean;
    } | null>(null);

    const [calculatingDistance, setCalculatingDistance] = useState(false);

    const locationExamples = getLocationExamples(cityName);

    useEffect(() => {
        fetchPricing();
    }, []);

    const calculateDistance = async () => {
        if (!contactDetails.pickupLocation || !contactDetails.dropLocation) {
            return;
        }

        setCalculatingDistance(true);
        try {
            const response = await fetch("/api/calculate-distance", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    origin: contactDetails.pickupLocation,
                    destination: contactDetails.dropLocation,
                    departureTime: contactDetails.date && contactDetails.time
                        ? `${contactDetails.date}T${contactDetails.time}:00+05:30`
                        : undefined,
                }),
            });

            const data = await response.json();
            if (data.distance && data.duration) {
                setDistanceData(data);
                const distanceInKm = Math.ceil(data.distance / 1000);
                handleKmChange(distanceInKm);
            }
        } catch (error) {
            console.error("Failed to calculate distance:", error);
            alert("Failed to calculate distance. Please enter kilometers manually.");
        } finally {
            setCalculatingDistance(false);
        }
    };

    useEffect(() => {
        if (contactDetails.pickupLocation && contactDetails.dropLocation) {
            const timeoutId = setTimeout(() => {
                calculateDistance();
            }, 1000);
            return () => clearTimeout(timeoutId);
        }
    }, [contactDetails.pickupLocation, contactDetails.dropLocation]);

    const fetchPricing = async () => {
        try {
            const res = await fetch("/api/pricing");
            const data = await res.json();
            setPricing(data);
        } catch (error) {
            console.error("Failed to fetch pricing:", error);
        }
    };

    const calculateCost = (pricingData: Pricing, km: number) => {
        const pricingBreakdown = calculateDynamicPricing({
            basePrice: pricingData.basePrice,
            kilometers: km,
            minutes: distanceData ? parseDurationToMinutes(distanceData.duration, km) : 60,
            vehicleType: pricingData.car?.type || pricingData.car?.name,
            pricePerKm: pricingData.pricePerKm,
            pricePerMinute: pricingData.extraHourRate ? pricingData.extraHourRate / 60 : undefined,
            baseKm: pricingData.baseKm,
            driverAllowance: pricingData.driverAllowance,
            surgeMultiplier: getDemandMultiplier(contactDetails.date, contactDetails.time) * (distanceData?.trafficMultiplier || 1),
            platformFee: 15,
            taxRate: 0.12,
            discounts: 0,
            advanceBookingThreshold: 25,
            advanceBookingPercent: 0,
            minAdvanceAmount: 300,
        });

        setAdvanceBookingRequired(pricingBreakdown.advanceBookingRequired);
        setAdvanceBookingAmount(pricingBreakdown.advanceBookingAmount);
        return pricingBreakdown.totalCost;
    };

    useEffect(() => {
        if (selectedPricing) {
            setTotalCost(calculateCost(selectedPricing, kilometers));
        }
    }, [selectedPricing, kilometers, distanceData, contactDetails.date, contactDetails.time]);

    const handleLocationChange = (location: string) => {
        const locationName = bookingType === "local" ? "Delhi Local" : "Delhi Outstation";
        const matchingPricing = pricing.find(
            (p) => p.location === locationName && p.car.id === selectedCar
        );
        if (matchingPricing) {
            setSelectedPricing(matchingPricing);
            const cost = calculateCost(matchingPricing, kilometers);
            setTotalCost(cost);
        }
    };

    const handleCarChange = (carId: string) => {
        setSelectedCar(carId);
        const locationName = bookingType === "local" ? "Delhi Local" : "Delhi Outstation";
        const matchingPricing = pricing.find(
            (p) => p.location === locationName && p.car.id === carId
        );
        if (matchingPricing) {
            setSelectedPricing(matchingPricing);
            const cost = calculateCost(matchingPricing, kilometers);
            setTotalCost(cost);
        }
    };

    const handleKmChange = (km: number) => {
        setKilometers(km);
        if (selectedPricing) {
            const cost = calculateCost(selectedPricing, km);
            setTotalCost(cost);
        }
    };

    const handleBookingTypeChange = (type: "local" | "outstation") => {
        setBookingType(type);
        if (selectedCar) {
            handleCarChange(selectedCar);
        }
    };

    const parseDurationToMinutes = (duration: string, distanceKm: number) => {
        const hoursMatch = duration.match(/(\d+)\s*hr/);
        const minutesMatch = duration.match(/(\d+)\s*min/);
        const hours = hoursMatch ? parseInt(hoursMatch[1], 10) : 0;
        const minutes = minutesMatch ? parseInt(minutesMatch[1], 10) : 0;

        if (hours > 0 || minutes > 0) {
            return hours * 60 + minutes;
        }

        if (distanceKm > 0) {
            return Math.max(30, Math.ceil(distanceKm * 1.5));
        }

        return 60;
    };

    const handlePayment = async () => {
        if (!selectedPricing || !contactDetails.name || !contactDetails.email || !contactDetails.phone) {
            alert("Please fill all details and select a vehicle");
            return;
        }

        setPaymentReady(true);
    };

    const paymentDetails = selectedPricing ? {
        vehicle: selectedPricing.car.name,
        route: `${contactDetails.pickupLocation} → ${contactDetails.dropLocation}`,
        date: contactDetails.date,
        time: contactDetails.time,
        duration: distanceData ? parseDurationToMinutes(distanceData.duration, kilometers) : 60,
        tripType: bookingType === "local" ? "Local" : "Outstation",
        kilometers,
        totalAmount: totalCost,
        remainingAmount: Math.max(0, totalCost - (advanceBookingRequired ? advanceBookingAmount : totalCost)),
    } : null;

    const uniqueCars = Array.from(
        new Map(
            pricing
                .filter((p) =>
                    bookingType === "local"
                        ? p.location === `${cityName} Local`
                        : p.location === `${cityName} Outstation`
                )
                .map((p) => [p.car.id, p.car])
        ).values()
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        {locationExamples.heading}
                    </h1>
                    <p className="text-gray-300 text-lg">
                        Distance-based pricing with advance booking for trips above 30 km.
                    </p>
                </div>

                {/* Booking Type Selection */}
                <div className="flex gap-4 justify-center mb-8">
                    <button
                        onClick={() => handleBookingTypeChange("local")}
                        className={`px-8 py-3 rounded-lg font-semibold transition-all ${
                            bookingType === "local"
                                ? "bg-cyan-500 text-white"
                                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                        }`}
                    >
                        <MapPin className="inline mr-2" size={20} />
                        Local (8 Hrs - 80 Km)
                    </button>
                    <button
                        onClick={() => handleBookingTypeChange("outstation")}
                        className={`px-8 py-3 rounded-lg font-semibold transition-all ${
                            bookingType === "outstation"
                                ? "bg-cyan-500 text-white"
                                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                        }`}
                    >
                        <Zap className="inline mr-2" size={20} />
                        Outstation (250 Km)
                    </button>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Left Side - Selection */}
                    <div className="space-y-6">
                        {/* Car Selection */}
                        <div className="bg-gray-800 p-6 rounded-xl border border-cyan-500/30">
                            <h3 className="text-xl font-bold text-cyan-400 mb-4">
                                <Car className="inline mr-2" size={20} />
                                Select Vehicle
                            </h3>
                            <div className="space-y-3">
                                {uniqueCars.map((car) => (
                                    <button
                                        key={car.id}
                                        onClick={() => handleCarChange(car.id)}
                                        className={`w-full p-4 rounded-lg text-left transition-all ${
                                            selectedCar === car.id
                                                ? "bg-cyan-500 text-white border-2 border-cyan-400"
                                                : "bg-gray-700 text-gray-300 border-2 border-transparent hover:border-cyan-400"
                                        }`}
                                    >
                                        <div className="font-semibold">{car.name}</div>
                                        <div className="text-sm opacity-80">{car.type} • {car.seats} Seats</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Kilometer Selection */}
                        <div className="bg-gray-800 p-6 rounded-xl border border-cyan-500/30">
                            <h3 className="text-xl font-bold text-cyan-400 mb-4">
                                <MapPin className="inline mr-2" size={20} />
                                Pickup & Drop Locations
                            </h3>
                            <div className="space-y-3">
                                <input
                                    type="text"
                                    placeholder={locationExamples.pickupPlaceholder}
                                    value={contactDetails.pickupLocation}
                                    onChange={(e) =>
                                        setContactDetails({ ...contactDetails, pickupLocation: e.target.value })
                                    }
                                    className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-cyan-500"
                                />
                                <input
                                    type="text"
                                    placeholder={locationExamples.dropPlaceholder}
                                    value={contactDetails.dropLocation}
                                    onChange={(e) =>
                                        setContactDetails({ ...contactDetails, dropLocation: e.target.value })
                                    }
                                    className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-cyan-500"
                                />
                                {calculatingDistance && (
                                    <p className="text-cyan-400 text-sm">Calculating distance...</p>
                                )}
                                {distanceData && (
                                    <div className="bg-gray-700 p-3 rounded-lg">
                                        <p className="text-white text-sm">
                                            📍 Distance: <span className="font-bold">{(distanceData.distance / 1000).toFixed(1)} km</span>
                                        </p>
                                        <p className="text-white text-sm">
                                            ⏱️ Duration: <span className="font-bold">{distanceData.duration}</span>
                                        </p>
                                    </div>
                                )}
                                <LiveRouteMap
                                    origin={contactDetails.pickupLocation}
                                    destination={contactDetails.dropLocation}
                                    city={cityName}
                                />
                            </div>
                        </div>

                        {/* Kilometer Adjustment */}
                        <div className="bg-gray-800 p-6 rounded-xl border border-cyan-500/30">
                            <h3 className="text-xl font-bold text-cyan-400 mb-4">
                                <Zap className="inline mr-2" size={20} />
                                Kilometers {distanceData && "(Auto-calculated)"}
                            </h3>
                            <input
                                type="number"
                                min={bookingType === "local" ? 80 : 250}
                                value={kilometers}
                                onChange={(e) => handleKmChange(parseInt(e.target.value))}
                                className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-cyan-500"
                            />
                            <p className="text-gray-400 text-sm mt-2">
                                Base: {selectedPricing?.baseKm} km • Extra Rate: ₹{selectedPricing?.pricePerKm}/km
                            </p>
                            {advanceBookingRequired && (
                                <div className="mt-3 rounded-lg border border-amber-400/40 bg-amber-500/10 p-3 text-sm text-amber-200">
                                    <p className="font-semibold">Advance booking required</p>
                                    <p>Trips above 25 km need a non-refundable advance of ₹{advanceBookingAmount}.</p>
                                </div>
                            )}
                        </div>

                        {/* Pickup Details */}
                        <div className="bg-gray-800 p-6 rounded-xl border border-cyan-500/30">
                            <h3 className="text-xl font-bold text-cyan-400 mb-4">
                                <Calendar className="inline mr-2" size={20} />
                                Pickup Details
                            </h3>
                            <div className="space-y-3">
                                <input
                                    type="date"
                                    value={contactDetails.date}
                                    onChange={(e) =>
                                        setContactDetails({ ...contactDetails, date: e.target.value })
                                    }
                                    className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600"
                                />
                                <input
                                    type="time"
                                    value={contactDetails.time}
                                    onChange={(e) =>
                                        setContactDetails({ ...contactDetails, time: e.target.value })
                                    }
                                    className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Summary & Contact */}
                    <div className="space-y-6">
                        {/* Cost Summary */}
                        {selectedPricing && (
                            <div className="bg-gradient-to-br from-cyan-600 to-blue-600 p-6 rounded-xl text-white">
                                <h3 className="text-2xl font-bold mb-6">Pricing Breakdown</h3>
                                <div className="space-y-3 mb-6">
                                    {(() => {
                                        const breakdown = calculateDynamicPricing({
                                            basePrice: selectedPricing.basePrice,
                                            kilometers,
                                            minutes: distanceData ? parseDurationToMinutes(distanceData.duration, kilometers) : 60,
                                            vehicleType: selectedPricing.car?.type || selectedPricing.car?.name,
                                            pricePerKm: selectedPricing.pricePerKm,
                                            pricePerMinute: selectedPricing.extraHourRate ? selectedPricing.extraHourRate / 60 : undefined,
                                            baseKm: selectedPricing.baseKm,
                                            driverAllowance: selectedPricing.driverAllowance,
                                            surgeMultiplier: getDemandMultiplier(contactDetails.date, contactDetails.time),
                                            platformFee: 15,
                                            taxRate: 0.12,
                                            discounts: 0,
                                        });
                                        return (
                                            <>
                                                {breakdown.breakdown.map((entry) => (
                                                    <div key={entry.label} className="flex justify-between text-sm">
                                                        <span>{entry.label}</span>
                                                        <span>₹{entry.amount.toFixed(2)}</span>
                                                    </div>
                                                ))}
                                                <div className="border-t border-white/30 pt-3 flex justify-between text-xl font-bold">
                                                    <span>Total Cost:</span>
                                                    <span>₹{breakdown.totalCost.toFixed(2)}</span>
                                                </div>
                                            </>
                                        );
                                    })()}
                                    {advanceBookingRequired && (
                                        <div className="flex justify-between text-sm text-amber-100">
                                            <span>Advance (non-refundable):</span>
                                            <span>₹{advanceBookingAmount}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Contact Details */}
                        <div className="bg-gray-800 p-6 rounded-xl border border-cyan-500/30">
                            <h3 className="text-xl font-bold text-cyan-400 mb-4">
                                <User className="inline mr-2" size={20} />
                                Your Details
                            </h3>
                            <div className="space-y-3">
                                <input
                                    type="text"
                                    placeholder="Full Name"
                                    value={contactDetails.name}
                                    onChange={(e) =>
                                        setContactDetails({ ...contactDetails, name: e.target.value })
                                    }
                                    className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600"
                                />
                                <input
                                    type="email"
                                    placeholder="Email"
                                    value={contactDetails.email}
                                    onChange={(e) =>
                                        setContactDetails({ ...contactDetails, email: e.target.value })
                                    }
                                    className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600"
                                />
                                <input
                                    type="tel"
                                    placeholder="Phone"
                                    value={contactDetails.phone}
                                    onChange={(e) =>
                                        setContactDetails({ ...contactDetails, phone: e.target.value })
                                    }
                                    className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600"
                                />
                            </div>
                        </div>

                        {/* Book Button */}
                        {paymentReady && paymentDetails ? (
                            <Pay
                                amount={advanceBookingRequired ? advanceBookingAmount : totalCost}
                                name={contactDetails.name}
                                email={contactDetails.email}
                                phone={contactDetails.phone}
                                bookingDetails={paymentDetails}
                            />
                        ) : (
                            <button
                                onClick={handlePayment}
                                disabled={!selectedCar || !selectedPricing || !contactDetails.name || !contactDetails.email || !contactDetails.phone || !contactDetails.date || !contactDetails.time || !distanceData}
                                className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                Proceed to Payment
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DelhiBooking;
