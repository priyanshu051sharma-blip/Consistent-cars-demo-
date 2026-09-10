import React, { useState, useEffect } from "react";
import { GetServerSideProps } from "next";
import Image from "next/image";
import prisma from "../lib/prisma";
import { BadgeCheck, Calendar, Clock, MapPin, Car as CarIcon, ArrowRight, Download, CreditCard, ChevronLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import AIChatBot from "../components/AIChabot/AIChatbot";
import Pay from "../components/Pay/Pay";
import LiveRouteMap from "../components/LiveRouteMap/LiveRouteMap";
import { useRouter } from "next/router";
import { calculateDynamicPricing, getLocationExamples } from "../utils/pricing";

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

type Car = {
    id: string;
    name: string;
    baseDayPrice: number;
    image: string;
    type: string;
    seats: number;
    features: string;
};

type Location = {
    id: string;
    name: string;
    image: string;
    description: string
};

interface BookingPageProps {
    cars: Car[];
    locations: Location[];
}

export default function BookingPage({ cars, locations }: BookingPageProps) {
    const router = useRouter();
    const { location: locationQuery } = router.query;

    // --- State ---
    const [step, setStep] = useState<1 | 2>(1); // 1: Vehicle, 2: Form/Pay (Skipping "Location" step as it's pre-selected)
    const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
    const [selectedCar, setSelectedCar] = useState<Car | null>(null);
    const [hours, setHours] = useState<number>(1);
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [showPayment, setShowPayment] = useState(false);
    const [pickupLocation, setPickupLocation] = useState("");
    const [dropLocation, setDropLocation] = useState("");
    const [tripType, setTripType] = useState<'one-way' | 'round-trip'>('one-way');
    const [pickupSuggestions, setPickupSuggestions] = useState<Location[]>([]);
    const [dropSuggestions, setDropSuggestions] = useState<Location[]>([]);
    const [showPickupSuggestions, setShowPickupSuggestions] = useState(false);
    const [showDropSuggestions, setShowDropSuggestions] = useState(false);
    const [kilometers, setKilometers] = useState<number>(0);
    const [calculatingDistance, setCalculatingDistance] = useState(false);
    const [distanceData, setDistanceData] = useState<{
        distance: number;
        duration: string;
        trafficMultiplier?: number;
        trafficAvailable?: boolean;
    } | null>(null);

    const [contactDetails, setContactDetails] = useState({
        name: "",
        email: "",
        phone: "",
    });

    const [pricingList, setPricingList] = useState<any[]>([]);
    const [matchedPricing, setMatchedPricing] = useState<any | null>(null);

    // Load location from query param
    useEffect(() => {
        if (router.isReady && locationQuery) {
            // Try to find by UUID first, then by approximate Name
            const loc = locations.find(l => l.id === locationQuery || l.name.toLowerCase() === (locationQuery as string).toLowerCase());

            if (loc) {
                setSelectedLocation(loc);
            } else if (locationQuery === "Pune Airport") {
                setSelectedLocation({
                    id: 'pune-airport',
                    name: 'Pune Airport',
                    image: '/image/airport.jpg',
                    description: 'Premium Airport Drop Service to Pune International Airport'
                });
            }
        }
    }, [router.isReady, locationQuery, locations]);

    // Calculate distance when both locations are entered
    useEffect(() => {
        if (pickupLocation && dropLocation) {
            const timeoutId = setTimeout(() => {
                calculateDistance();
            }, 1000);
            return () => clearTimeout(timeoutId);
        }
    }, [pickupLocation, dropLocation, date, time]);

    const commonPlaceSuggestions: string[] = [
        'Pune Airport',
        'Baner',
        'Kharadi',
        'Viman Nagar',
        'Hinjewadi',
        'Aundh',
        'Koregaon Park',
        'Shivaji Nagar',
        'Connaught Place',
        'India Gate',
        'Gurgaon',
        'Noida',
        'Indira Gandhi Airport',
        'Delhi Airport',
        'MGF Metropolitan Mall',
        'DLF Mega Mall',
        'Pacific Mall',
    ];

    const getMatchingSuggestions = (query: string, excludeName?: string) => {
        if (!query.trim()) return [] as Location[];
        const lower = query.toLowerCase();

        const locationMatches = locations
            .filter(loc => loc.name.toLowerCase().includes(lower) && loc.name.toLowerCase() !== excludeName?.toLowerCase())
            .slice(0, 5)
            .map(loc => ({ ...loc }));

        const extraMatches = commonPlaceSuggestions
            .filter(item => item.toLowerCase().includes(lower) && item.toLowerCase() !== excludeName?.toLowerCase())
            .slice(0, 5)
            .map((name, index) => ({ id: `common-${index}-${name}`, name, image: '', description: '' }));

        const combined = [...locationMatches, ...extraMatches];
        const unique = Array.from(new Map(combined.map(item => [item.name.toLowerCase(), item])).values());
        return unique.slice(0, 6);
    };

    const inferLocationNameFromInputs = (pickup: string, drop: string) => {
        const combined = `${pickup} ${drop}`.toLowerCase();
        if (/pune|baner|kharadi|viman nagar|hinjewadi|aundh|koregaon park|shivaji nagar/.test(combined)) return 'Pune';
        if (/delhi|new delhi|gurgaon|gurugram|noida|india gate|connaught place|indira gandhi airport|delhi airport/.test(combined)) return 'Delhi';
        if (/goa/.test(combined)) return 'Goa';
        if (/mahaba|ratnagiri|aurangabad|sindhudurg/.test(combined)) return 'Pune';
        return '';
    };

    const handlePickupLocationChange = (value: string) => {
        setPickupLocation(value);
        setShowPickupSuggestions(true);
        setPickupSuggestions(getMatchingSuggestions(value, dropLocation));
    };

    const handleDropLocationChange = (value: string) => {
        setDropLocation(value);
        setShowDropSuggestions(true);
        setDropSuggestions(getMatchingSuggestions(value, pickupLocation));
    };

    const selectPickupSuggestion = (suggestion: string) => {
        setPickupLocation(suggestion);
        setShowPickupSuggestions(false);
    };

    const selectDropSuggestion = (suggestion: string) => {
        setDropLocation(suggestion);
        setShowDropSuggestions(false);
    };

    const swapPickupAndDrop = () => {
        setPickupLocation(dropLocation);
        setDropLocation(pickupLocation);
        setShowPickupSuggestions(false);
        setShowDropSuggestions(false);
    };

    const calculateDistance = async () => {
        if (!pickupLocation || !dropLocation) return;

        setCalculatingDistance(true);
        try {
            const response = await fetch("/api/calculate-distance", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    origin: pickupLocation,
                    destination: dropLocation,
                    departureTime: date && time ? `${date}T${time}:00+05:30` : undefined,
                }),
            });

            const data = await response.json();
            if (data.distance && data.duration) {
                setDistanceData(data);
                const distanceInKm = Math.ceil(data.distance / 1000);
                setKilometers(distanceInKm);
                setHours(parseDurationToHours(data.duration, distanceInKm));

                if (data.provider === 'fallback') {
                    alert('Distance could not be calculated precisely. Please refine the pickup/drop location.');
                }
            }
        } catch (error) {
            console.error("Failed to calculate distance:", error);
            alert('Unable to calculate route distance right now. Please double-check the location names.');
        } finally {
            setCalculatingDistance(false);
        }
    };

    const parseDurationToHours = (duration: string, distanceInKm: number) => {
        const hoursMatch = duration.match(/(\d+)\s*hr/);
        const minutesMatch = duration.match(/(\d+)\s*min/);
        const hours = hoursMatch ? parseInt(hoursMatch[1], 10) : 0;
        const minutes = minutesMatch ? parseInt(minutesMatch[1], 10) : 0;

        if (hours > 0) {
            return hours + (minutes > 0 ? 1 : 0);
        }

        if (minutes > 0) {
            return 1;
        }

        if (distanceInKm > 0) {
            return Math.max(1, Math.ceil(distanceInKm / 40));
        }

        return 1;
    };

    const parseDurationToMinutes = (duration: string, distanceInKm: number) => {
        const hoursMatch = duration.match(/(\d+)\s*hr/);
        const minutesMatch = duration.match(/(\d+)\s*min/);
        const hours = hoursMatch ? parseInt(hoursMatch[1], 10) : 0;
        const minutes = minutesMatch ? parseInt(minutesMatch[1], 10) : 0;

        if (hours > 0 || minutes > 0) {
            return hours * 60 + minutes;
        }

        if (distanceInKm > 0) {
            return Math.max(30, Math.ceil(distanceInKm * 1.5));
        }

        return 60;
    };

    // If no location selected (user browsed here directly), maybe redirect or show dropdown?
    // ideally redirect to services, but let's handle graceful fallback text

    const locationExamples = getLocationExamples(selectedLocation?.name || "Pune");

    useEffect(() => {
        // fetch pricing catalog
        (async () => {
            try {
                const res = await fetch('/api/pricing');
                if (res.ok) setPricingList(await res.json());
            } catch (e) {
                console.error('Failed to load pricing list', e);
            }
        })();
    }, []);

    // Recompute matched pricing when selection changes
    useEffect(() => {
        const inferredLocationName = inferLocationNameFromInputs(pickupLocation, dropLocation);
        const effectiveLocationName = selectedLocation?.name || inferredLocationName;
        if (!selectedCar || !effectiveLocationName || !pricingList.length) return setMatchedPricing(null);

        // Try to find pricing entries for this car
        const carId = selectedCar.id;
        const cityName = effectiveLocationName.toLowerCase();

        const candidates = pricingList.filter(p => p.car?.id === carId);
        if (!candidates.length) return setMatchedPricing(null);

        // Prefer entries that include the city name in location text
        const cityCandidates = candidates.filter(p => p.location.toLowerCase().includes(cityName.split(' ')[0]));
        const useList = cityCandidates.length ? cityCandidates : candidates;

        // If kilometers is known, prefer Local vs Outstation
        let chosen = null;
        if (kilometers > 0) {
            const local = useList.find(p => p.location.toLowerCase().includes('local'));
            const out = useList.find(p => p.location.toLowerCase().includes('outstation'));
            if (local && out) {
                chosen = kilometers <= local.baseKm ? local : out;
            }
        }

        if (!chosen) chosen = useList[0];
        setMatchedPricing(chosen || null);
    }, [selectedCar, selectedLocation, pricingList, kilometers]);

    const pricingBreakdown = matchedPricing
        ? calculateDynamicPricing({
            basePrice: matchedPricing.basePrice,
            kilometers,
            minutes: distanceData ? parseDurationToMinutes(distanceData.duration, kilometers) : 60,
            vehicleType: selectedCar?.type || selectedCar?.name,
            pricePerKm: matchedPricing.pricePerKm,
            pricePerMinute: matchedPricing.extraHourRate ? matchedPricing.extraHourRate / 60 : undefined,
            baseKm: matchedPricing.baseKm,
            driverAllowance: matchedPricing.driverAllowance,
            surgeMultiplier: getDemandMultiplier(date, time) * (distanceData?.trafficMultiplier || 1),
            platformFee: 15,
            taxRate: 0.12,
            discounts: 0,
            advanceBookingThreshold: 25,
            advanceBookingPercent: 0,
            tripMultiplier: tripType === 'one-way' ? 1.15 : 1.0,
            minAdvanceAmount: 300,
        })
        : null;

    const grandTotal = pricingBreakdown ? pricingBreakdown.totalCost : 0;
    const advanceBookingRequired = pricingBreakdown?.advanceBookingRequired || false;
    const advanceBookingAmount = pricingBreakdown?.advanceBookingAmount || 0;
    const paymentAmount = advanceBookingRequired ? advanceBookingAmount : grandTotal;
    const isFormValid = Boolean(contactDetails.name && contactDetails.email && contactDetails.phone && date && time && pickupLocation && dropLocation);
    const canPay = Boolean(pricingBreakdown && paymentAmount > 0 && distanceData && isFormValid);

    const generatePDF = () => {
        if (!selectedCar || !selectedLocation || !isFormValid) return;
        const doc = new jsPDF();

        doc.setFillColor(6, 182, 212);
        doc.rect(0, 0, 210, 40, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(28);
        doc.setFont("helvetica", "bold");
        doc.text("Consistent Cars", 105, 20, { align: "center" });
        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        doc.text("Official Booking Invoice", 105, 30, { align: "center" });

        doc.setTextColor(0);
        doc.setFontSize(14);
        doc.text("Booking Summary", 14, 55);

        doc.autoTable({
            startY: 60,
            head: [["Item", "Details"]],
            body: [
                ["Customer Name", contactDetails.name],
                ["Phone", contactDetails.phone],
                ["Email", contactDetails.email],
                ["Trip Route", `${selectedLocation.name} Trip`],
                ["Vehicle", selectedCar.name],
                ["Trip Type", tripType === 'round-trip' ? 'Round-trip' : 'One-way'],
                ["Date & Time", `${date} at ${time}`],
                ["Duration", `${hours} Hours`],
            ],
            styles: { fontSize: 11, cellPadding: 6 },
            headStyles: { fillColor: [6, 182, 212], fontStyle: 'bold' },
            theme: 'grid',
        });

        const finalY = (doc as any).lastAutoTable.finalY + 15;
        doc.text("Payment Breakdown", 14, finalY);

        doc.autoTable({
            startY: finalY + 5,
            head: [["Description", "Amount"]],
            body: [
                [`Vehicle Rental (${hours} hours)`, `Rs. ${grandTotal.toFixed(2)}`],
                ["GST (12%)", `Rs. ${(grandTotal * 0.12 / 1.12).toFixed(2)}`],
                ["Total Amount Paid", `Rs. ${grandTotal.toFixed(2)}`],
            ],
            styles: { fontSize: 11, cellPadding: 6 },
            headStyles: { fillColor: [33, 33, 33], fontStyle: 'bold' },
            theme: 'striped',
        });

        const footerY = (doc as any).lastAutoTable.finalY + 30;
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text("Thank you for choosing Consistent Cars for your journey.", 105, footerY, { align: "center" });

        doc.save("ConsistentCars_Invoice.pdf");
    };

    const handleCarSelect = (car: Car) => {
        setSelectedCar(car);
        setStep(2);
    };

    if (!selectedLocation && router.isReady) {
        return (
            <div className="min-h-screen bg-[#0f172a] text-white flex items-center justify-center flex-col gap-4">
                <h1 className="text-3xl font-bold">No Destination Selected</h1>
                <p className="text-slate-400">Please go back to services and choose a destination.</p>
                <button onClick={() => router.push('/services')} className="px-6 py-2 bg-cyan-600 rounded-lg">Back to Services</button>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#0f172a] text-white font-sans selection:bg-cyan-500/30 pb-20">
            <AIChatBot />
            {/* Background Effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[800px] h-[800px] bg-cyan-500/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[20%] right-[-10%] w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[100px]" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-6 pt-20">

                {/* Header */}
                <div className="flex items-center gap-4 mb-4">
                    <button onClick={() => router.back()} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition">
                        <ChevronLeft className="text-white" />
                    </button>
                    <span className="text-slate-400 uppercase text-sm tracking-wider">Booking Process</span>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12"
                >
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                        Trip to <span className="text-cyan-400">{selectedLocation?.name}</span>
                    </h1>
                    <p className="text-slate-400">Complete your booking in just a few steps.</p>
                </motion.div>

                {/* Steps Indicator */}
                <div className="flex items-center gap-4 mb-12 text-sm font-medium text-slate-400">
                    <span className={step >= 1 ? "text-cyan-400" : ""}>1. Select Vehicle</span>
                    <ChevronLeft size={14} className="rotate-180" />
                    <span className={step >= 2 ? "text-cyan-400" : ""}>2. Details & Payment</span>
                </div>


                <AnimatePresence mode="wait">
                    {/* STEP 1: CARS */}
                    {step === 1 && (
                        <motion.div
                            key="step-1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="max-w-5xl mx-auto"
                        >
                            {/* Pickup & Drop Section */}
                            <div className="bg-slate-800/80 border border-white/10 rounded-3xl p-6 mb-8">
                                <h3 className="text-lg font-bold text-cyan-400 mb-4 flex items-center gap-2">
                                    <MapPin size={20} /> Enter Pickup & Drop Location
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4">
                                    <div className="relative">
                                        <label className="text-sm text-slate-400 mb-1 block">Pickup Location</label>
                                        <input
                                            type="text"
                                            placeholder={locationExamples.pickupPlaceholder}
                                            value={pickupLocation}
                                            onChange={(e) => handlePickupLocationChange(e.target.value)}
                                            onFocus={() => setShowPickupSuggestions(true)}
                                            onBlur={() => setTimeout(() => setShowPickupSuggestions(false), 150)}
                                            className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-cyan-500 outline-none"
                                        />
                                        {showPickupSuggestions && pickupSuggestions.length > 0 && (
                                            <div className="absolute z-20 top-full mt-2 w-full rounded-2xl bg-slate-950/95 border border-white/10 shadow-2xl overflow-hidden">
                                                {pickupSuggestions.map((suggestion) => (
                                                    <button
                                                        key={suggestion.id}
                                                        type="button"
                                                        onMouseDown={() => selectPickupSuggestion(suggestion.name)}
                                                        className="w-full text-left px-4 py-3 hover:bg-cyan-500/10 text-slate-100"
                                                    >
                                                        {suggestion.name}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-center">
                                        <button
                                            type="button"
                                            onClick={swapPickupAndDrop}
                                            className="rounded-full bg-slate-900/70 border border-white/10 w-12 h-12 flex items-center justify-center text-cyan-400 hover:bg-cyan-500/10 transition"
                                            aria-label="Swap pickup and drop locations"
                                        >
                                            <ArrowRight className="transform rotate-90" />
                                        </button>
                                    </div>
                                    <div className="relative">
                                        <label className="text-sm text-slate-400 mb-1 block">Drop Location</label>
                                        <input
                                            type="text"
                                            placeholder={locationExamples.dropPlaceholder}
                                            value={dropLocation}
                                            onChange={(e) => handleDropLocationChange(e.target.value)}
                                            onFocus={() => setShowDropSuggestions(true)}
                                            onBlur={() => setTimeout(() => setShowDropSuggestions(false), 150)}
                                            className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-cyan-500 outline-none"
                                        />
                                        {showDropSuggestions && dropSuggestions.length > 0 && (
                                            <div className="absolute z-20 top-full mt-2 w-full rounded-2xl bg-slate-950/95 border border-white/10 shadow-2xl overflow-hidden">
                                                {dropSuggestions.map((suggestion) => (
                                                    <button
                                                        key={suggestion.id}
                                                        type="button"
                                                        onMouseDown={() => selectDropSuggestion(suggestion.name)}
                                                        className="w-full text-left px-4 py-3 hover:bg-cyan-500/10 text-slate-100"
                                                    >
                                                        {suggestion.name}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {calculatingDistance && (
                                    <p className="text-cyan-400 text-sm mt-3">🔄 Calculating distance...</p>
                                )}
                                {distanceData && (
                                    <div className="flex gap-6 mt-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl px-4 py-3">
                                        <span className="text-white text-sm">📍 Distance: <strong>{(distanceData.distance / 1000).toFixed(1)} km</strong></span>
                                        <span className="text-white text-sm">⏱️ Duration: <strong>{distanceData.duration}</strong></span>
                                        {distanceData.trafficAvailable && <span className="text-white text-sm">🚦 Traffic pricing: <strong>{distanceData.trafficMultiplier?.toFixed(2)}x</strong></span>}
                                    </div>
                                )}
                                <LiveRouteMap
                                    origin={pickupLocation}
                                    destination={dropLocation}
                                    city={selectedLocation?.name}
                                />
                                <div className="mt-4">
                                    <label className="text-sm text-slate-400 mb-1 block">Estimated Distance (km)</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={kilometers}
                                        onChange={(e) => setKilometers(Math.max(1, parseInt(e.target.value) || 1))}
                                        className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-cyan-500 outline-none"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {cars.map((car, index) => (
                                    <motion.div
                                        key={car.id || index}
                                        whileHover={{ scale: 1.02 }}
                                        className="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
                                    >
                                        <div className="relative h-80 bg-slate-900/50 p-6 flex justify-center items-center overflow-hidden">
                                            <div className="absolute w-[200px] h-[200px] bg-cyan-500/20 blur-[60px] rounded-full" />
                                            <Image src={car.image} alt={car.name} width={300} height={200} className="object-contain relative z-10 drop-shadow-2xl max-h-[220px] w-auto" />
                                            <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-cyan-300 border border-white/10">
                                                {car.type}
                                            </div>
                                        </div>
                                        <div className="p-8 flex-1 flex flex-col">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h3 className="text-2xl font-bold text-white">{car.name}</h3>
                                                    <p className="text-slate-400 text-sm">{car.seats} Seater • {car.features?.split(',')[0]}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-2xl font-bold text-cyan-400">₹{car.baseDayPrice}</p>
                                                    <p className="text-xs text-slate-500">per day</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleCarSelect(car)}
                                                className="mt-auto w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-cyan-900/20 flex items-center justify-center gap-2 group"
                                            >
                                                Select Ride <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 2: DETAILS */}
                    {step === 2 && selectedCar && (
                        <motion.div
                            key="step-2"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="max-w-4xl mx-auto"
                        >
                            <div className="flex items-center gap-4 mb-8">
                                <button onClick={() => setStep(1)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                    <ChevronLeft className="text-white" />
                                </button>
                                <h2 className="text-3xl font-bold text-white">Trip Details</h2>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Form */}
                                <div className="bg-slate-800/80 backdrop-blur-md border border-white/10 rounded-3xl p-8 shadow-2xl">
                                    <div className="flex gap-4 p-4 bg-white/5 rounded-xl border border-white/5 mb-6">
                                        <div className="relative w-20 h-14 bg-white/5 rounded-lg overflow-hidden">
                                            <Image src={selectedCar.image} alt="car" fill className="object-contain p-1" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-slate-400">Selected Vehicle</p>
                                            <p className="font-semibold text-white">{selectedCar.name}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <input type="date" onChange={(e) => setDate(e.target.value)} min={new Date().toISOString().split("T")[0]} className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-cyan-500 outline-none" />
                                            <input type="time" onChange={(e) => setTime(e.target.value)} className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-cyan-500 outline-none" />
                                        </div>
                                        
                                        <div className="border-t border-white/10 my-2" />
                                        <div className="space-y-2">
                                            <label className="text-sm text-slate-300">Trip Type</label>
                                            <div className="flex gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => setTripType('one-way')}
                                                    className={`w-full rounded-xl px-4 py-3 text-sm font-semibold ${tripType === 'one-way' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-900/70 text-slate-200 hover:bg-slate-800'}`}
                                                >
                                                    One-way
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setTripType('round-trip')}
                                                    className={`w-full rounded-xl px-4 py-3 text-sm font-semibold ${tripType === 'round-trip' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-900/70 text-slate-200 hover:bg-slate-800'}`}
                                                >
                                                    Round-trip
                                                </button>
                                            </div>
                                        </div>
                                        <div className="space-y-2 relative">
                                            <label className="text-sm text-slate-300 flex items-center gap-2">
                                                <MapPin size={16} className="text-cyan-400" />
                                                Pickup Location
                                            </label>
                                            <input 
                                                type="text" 
                                                placeholder={locationExamples.pickupPlaceholder} 
                                                value={pickupLocation}
                                                onChange={(e) => handlePickupLocationChange(e.target.value)} 
                                                onFocus={() => setShowPickupSuggestions(true)}
                                                onBlur={() => setTimeout(() => setShowPickupSuggestions(false), 150)}
                                                className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-cyan-500 outline-none" 
                                            />
                                            {showPickupSuggestions && pickupSuggestions.length > 0 && (
                                                <div className="absolute z-20 top-full left-0 right-0 mt-2 rounded-2xl bg-slate-950/95 border border-white/10 shadow-2xl overflow-hidden">
                                                    {pickupSuggestions.map((suggestion) => (
                                                        <button
                                                            key={suggestion.id}
                                                            type="button"
                                                            onMouseDown={() => selectPickupSuggestion(suggestion.name)}
                                                            className="w-full text-left px-4 py-3 hover:bg-cyan-500/10 text-slate-100"
                                                        >
                                                            {suggestion.name}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <div className="space-y-2 relative">
                                            <label className="text-sm text-slate-300 flex items-center gap-2">
                                                <MapPin size={16} className="text-cyan-400" />
                                                Drop Location
                                            </label>
                                            <input 
                                                type="text" 
                                                placeholder={locationExamples.dropPlaceholder} 
                                                value={dropLocation}
                                                onChange={(e) => handleDropLocationChange(e.target.value)} 
                                                onFocus={() => setShowDropSuggestions(true)}
                                                onBlur={() => setTimeout(() => setShowDropSuggestions(false), 150)}
                                                className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-cyan-500 outline-none" 
                                            />
                                            {showDropSuggestions && dropSuggestions.length > 0 && (
                                                <div className="absolute z-20 top-full left-0 right-0 mt-2 rounded-2xl bg-slate-950/95 border border-white/10 shadow-2xl overflow-hidden">
                                                    {dropSuggestions.map((suggestion) => (
                                                        <button
                                                            key={suggestion.id}
                                                            type="button"
                                                            onMouseDown={() => selectDropSuggestion(suggestion.name)}
                                                            className="w-full text-left px-4 py-3 hover:bg-cyan-500/10 text-slate-100"
                                                        >
                                                            {suggestion.name}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {calculatingDistance && (
                                            <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-3 text-cyan-400 text-sm">
                                                🔄 Calculating distance...
                                            </div>
                                        )}
                                        
                                        {distanceData && (
                                            <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4 space-y-1">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-slate-300">📍 Distance:</span>
                                                    <span className="text-white font-bold">{(distanceData.distance / 1000).toFixed(1)} km</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-slate-300">⏱️ Duration:</span>
                                                    <span className="text-white font-bold">{distanceData.duration}</span>
                                                </div>
                                                {distanceData.trafficAvailable && (
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-slate-300">🚦 Traffic factor:</span>
                                                        <span className="text-white font-bold">{distanceData.trafficMultiplier?.toFixed(2)}x</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        <div className="space-y-2">
                                            <label className="text-sm text-slate-300">Estimated Distance (km)</label>
                                            <input
                                                type="number"
                                                min="1"
                                                value={kilometers}
                                                onChange={(e) => setKilometers(Math.max(1, parseInt(e.target.value) || 1))}
                                                className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-cyan-500 outline-none"
                                            />
                                        </div>

                                        <input type="number" min="1" value={hours} onChange={(e) => setHours(Math.max(1, parseInt(e.target.value) || 1))} className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-cyan-500 outline-none" placeholder="Duration (Hours)" />
                                        
                                        <div className="border-t border-white/10 my-2" />
                                        <input type="text" placeholder="Full Name" onChange={(e) => setContactDetails({ ...contactDetails, name: e.target.value })} className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-cyan-500 outline-none" />
                                        <input type="email" placeholder="Email" onChange={(e) => setContactDetails({ ...contactDetails, email: e.target.value })} className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-cyan-500 outline-none" />
                                        <input type="tel" placeholder="Phone" onChange={(e) => setContactDetails({ ...contactDetails, phone: e.target.value })} className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-cyan-500 outline-none" />
                                    </div>
                                </div>

                                {/* Summary */}
                                <div className="flex flex-col gap-6">
                                    <div className="bg-gradient-to-br from-cyan-600 to-blue-700 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
                                        <h4 className="text-lg font-medium text-cyan-100 mb-1">Total Estimated Cost</h4>
                                        <p className="text-4xl font-bold mb-6">₹{grandTotal.toLocaleString()}</p>

                                        <div className="space-y-2 text-sm text-cyan-100 mb-6">
                                            <div className="flex justify-between"><span>Distance</span><span>{kilometers} km</span></div>
                                            <div className="flex justify-between"><span>Duration</span><span>{hours} Hours</span></div>
                                            {pricingBreakdown?.breakdown.map((entry) => (
                                                <div key={entry.label} className="flex justify-between text-cyan-50/90">
                                                    <span>{entry.label}</span>
                                                    <span>₹{entry.amount.toFixed(2)}</span>
                                                </div>
                                            ))}
                                            {advanceBookingRequired && (
                                                <div className="flex justify-between text-amber-100"><span>Advance (non-refundable)</span><span>₹{advanceBookingAmount}</span></div>
                                            )}
                                            <div className="flex justify-between border-t border-white/20 pt-2 font-bold text-white"><span>Total</span><span>₹{grandTotal}</span></div>
                                        </div>

                                        {canPay ? (
                                            <Pay
                                                amount={paymentAmount}
                                                name={contactDetails.name}
                                                email={contactDetails.email}
                                                phone={contactDetails.phone}
                                                bookingDetails={{
                                                    vehicle: selectedCar?.name || "Premium Car",
                                                    route: pickupLocation && dropLocation ? `${pickupLocation} → ${dropLocation}` : selectedLocation?.name || "Trip",
                                                    date: date,
                                                    time: time,
                                                    duration: hours,
                                                    tripType,
                                                    taxAmount: pricingBreakdown?.taxAmount || 0,
                                                    isAdvance: advanceBookingRequired,
                                                    totalAmount: grandTotal,
                                                    remainingAmount: Math.max(0, grandTotal - paymentAmount),
                                                }}
                                            />
                                        ) : (
                                            <button
                                                type="button"
                                                disabled
                                                className="w-full rounded-xl bg-slate-700 px-6 py-4 text-white font-semibold opacity-50"
                                            >
                                                {pricingBreakdown ? `Confirm & Pay ₹${paymentAmount.toLocaleString()}` : 'Confirm & Pay ₹0'}
                                            </button>
                                        )}

                                        {!isFormValid && (
                                            <p className="text-xs text-yellow-300 mt-2 text-center">Please fill all details above to proceed.</p>
                                        )}
                                    </div>
                                    {/* Removed redundant showPayment state block, Pay component now handles the trigger */}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

export const getServerSideProps: GetServerSideProps = async () => {
    const locations = await prisma.location.findMany();
    const allCars = await prisma.car.findMany();
    
    // Show only first 2 cars
    const cars = allCars.slice(0, 2);

    return {
        props: {
            locations: JSON.parse(JSON.stringify(locations)),
            cars: JSON.parse(JSON.stringify(cars)),
        },
    };
};
