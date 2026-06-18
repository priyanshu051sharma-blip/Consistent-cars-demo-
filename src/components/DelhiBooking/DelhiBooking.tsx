import React, { useState, useEffect } from "react";
import { MapPin, Car, Zap, Calendar, Clock, User, Mail, Phone } from "lucide-react";

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

const DelhiBooking = () => {
    const [bookingType, setBookingType] = useState<"local" | "outstation">("local");
    const [selectedCar, setSelectedCar] = useState<string>("");
    const [kilometers, setKilometers] = useState<number>(80);
    const [pricing, setPricing] = useState<Pricing[]>([]);
    const [selectedPricing, setSelectedPricing] = useState<Pricing | null>(null);
    const [totalCost, setTotalCost] = useState<number>(0);

    const [contactDetails, setContactDetails] = useState({
        name: "",
        email: "",
        phone: "",
        date: "",
        time: "",
    });

    const delhiLocations = [
        "Delhi Airport",
        "Delhi City Center",
        "Gurgaon",
        "Noida",
        "Delhi Station",
    ];

    useEffect(() => {
        fetchPricing();
    }, []);

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
        if (km <= pricingData.baseKm) {
            return pricingData.basePrice;
        }
        const extraKm = km - pricingData.baseKm;
        return pricingData.basePrice + extraKm * pricingData.pricePerKm;
    };

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

    const handlePayment = async () => {
        if (!selectedPricing || !contactDetails.name || !contactDetails.email || !contactDetails.phone) {
            alert("Please fill all details and select a vehicle");
            return;
        }

        // Trigger payment
        const bookingData = {
            amount: totalCost,
            name: contactDetails.name,
            email: contactDetails.email,
            phone: contactDetails.phone,
            bookingDetails: {
                vehicle: selectedPricing.car.name,
                location: selectedPricing.location,
                kilometers: kilometers,
                date: contactDetails.date,
                time: contactDetails.time,
            },
        };

        // Show payment modal (you would integrate Razorpay here)
        alert(`Booking for ₹${totalCost}\nCar: ${selectedPricing.car.name}\nKm: ${kilometers}\nLocation: ${selectedPricing.location}`);
    };

    const uniqueCars = Array.from(
        new Map(
            pricing
                .filter((p) =>
                    bookingType === "local"
                        ? p.location === "Delhi Local"
                        : p.location === "Delhi Outstation"
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
                        Delhi Car Rental
                    </h1>
                    <p className="text-gray-300 text-lg">
                        Premium cab service with transparent pricing based on kilometers
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
                                <Zap className="inline mr-2" size={20} />
                                Kilometers
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
                                    <div className="flex justify-between">
                                        <span>Base Price ({selectedPricing.baseKm} km):</span>
                                        <span>₹{selectedPricing.basePrice}</span>
                                    </div>
                                    {kilometers > selectedPricing.baseKm && (
                                        <div className="flex justify-between">
                                            <span>
                                                Extra Km ({kilometers - selectedPricing.baseKm} km @ ₹{selectedPricing.pricePerKm}/km):
                                            </span>
                                            <span>
                                                ₹{(kilometers - selectedPricing.baseKm) * selectedPricing.pricePerKm}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex justify-between">
                                        <span>Driver Allowance:</span>
                                        <span>₹{selectedPricing.driverAllowance}</span>
                                    </div>
                                    <div className="border-t border-white/30 pt-3 flex justify-between text-xl font-bold">
                                        <span>Total Cost:</span>
                                        <span>₹{totalCost + selectedPricing.driverAllowance}</span>
                                    </div>
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
                        <button
                            onClick={handlePayment}
                            disabled={!selectedCar || !contactDetails.name}
                            className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            Proceed to Payment
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DelhiBooking;
