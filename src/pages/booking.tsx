import React, { useState, useEffect } from "react";
import { GetServerSideProps } from "next";
import Image from "next/image";
import prisma from "../lib/prisma";
import { BadgeCheck, Calendar, Clock, MapPin, Car as CarIcon, ArrowRight, Download, CreditCard, ChevronLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

// Extend jsPDF type to include autoTable
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    lastAutoTable?: any;
  }
}
import AIChatBot from "../components/AIChabot/AIChatbot";
import Pay from "../components/Pay/Pay";
import { useRouter } from "next/router";

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

    const [contactDetails, setContactDetails] = useState({
        name: "",
        email: "",
        phone: "",
    });

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

    // If no location selected (user browsed here directly), maybe redirect or show dropdown?
    // ideally redirect to services, but let's handle graceful fallback text

    const calculateTotal = (car: Car, hours: number) => {
        // Calculate days from hours (minimum 1 day charge)
        const days = Math.ceil(hours / 24);
        return car.baseDayPrice * days;
    };
    const grandTotal = selectedCar ? calculateTotal(selectedCar, hours) : 0;
    const isFormValid = contactDetails.name && contactDetails.email && contactDetails.phone && date && time;

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
                ["Taxes & Fees", "Rs. 0.00"],
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
                                            <div className="flex justify-between"><span>Duration</span><span>{hours} Hours</span></div>
                                            <div className="flex justify-between border-t border-white/20 pt-2 font-bold text-white"><span>Total</span><span>₹{grandTotal}</span></div>
                                        </div>

                                        <Pay
                                            amount={grandTotal}
                                            name={contactDetails.name}
                                            email={contactDetails.email}
                                            phone={contactDetails.phone}
                                            bookingDetails={{
                                                vehicle: selectedCar?.name || "Premium Car",
                                                route: selectedLocation?.name || "Trip",
                                                date: date,
                                                time: time,
                                                duration: hours
                                            }}
                                        />

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
