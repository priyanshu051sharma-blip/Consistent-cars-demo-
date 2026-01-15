import React, { useState } from "react";
import { useRouter } from "next/router";
import { GetServerSideProps } from "next";
import { Hotel } from "@prisma/client"; // Keep types if needed
import prisma from "../../lib/prisma";
import { Star, MapPin, Wifi, Coffee, HelpCircle, ArrowLeft, X, ChevronRight, ChevronLeft, CreditCard } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Pay from "../../components/Pay/Pay";

interface HotelDetailsProps {
    hotel: Hotel | null;
}

const HotelDetails: React.FC<HotelDetailsProps> = ({ hotel }) => {
    const router = useRouter();
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [showPayment, setShowPayment] = useState(false);
    const [guestDetails, setGuestDetails] = useState({ name: "", email: "", phone: "", checkIn: "", checkOut: "" });

    if (router.isFallback) {
        return <div className="text-white text-center py-20">Loading...</div>;
    }

    if (!hotel) {
        return (
            <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center text-white">
                <h1 className="text-4xl font-bold mb-4">Hotel Not Found</h1>
                <p className="text-slate-400 mb-8">The hotel you are looking for does not exist.</p>
                <Link href="/hotels">
                    <button className="px-6 py-3 bg-cyan-600 rounded-xl hover:bg-cyan-700 transition">Back to Hotels</button>
                </Link>
            </div>
        );
    }

    const amenitiesList = hotel.amenities ? hotel.amenities.split(",") : [];
    const galleryImages = hotel.name.includes("Baywatch") ? [
        '/image/baywatch/35.jpg',
        '/image/baywatch/del1.jpg',
        '/image/baywatch/del2.jpg',
        '/image/baywatch/del3.jpg',
        '/image/baywatch/sup1.jpg',
        '/image/baywatch/sup2.jpg',
        '/image/baywatch/sup3.jpg'
    ] : [hotel.image];

    const openLightbox = (index: number) => {
        setCurrentImageIndex(index);
        setLightboxOpen(true);
    };

    const nextImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length);
    };

    const prevImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
    };

    return (
        <div className="min-h-screen bg-[#0f172a] text-white font-sans selection:bg-cyan-500/30 pb-20 relative">

            {/* Lightbox Modal */}
            <AnimatePresence>
                {lightboxOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4"
                        onClick={() => setLightboxOpen(false)}
                    >
                        <button className="absolute top-6 right-6 text-white/50 hover:text-white transition p-2 bg-white/10 rounded-full">
                            <X size={24} />
                        </button>

                        <div className="relative w-full max-w-6xl h-[80vh] flex items-center justify-center">
                            <button onClick={prevImage} className="absolute left-4 z-10 p-3 bg-black/50 hover:bg-cyan-600 rounded-full text-white transition backdrop-blur-md border border-white/10">
                                <ChevronLeft size={32} />
                            </button>

                            <motion.img
                                key={currentImageIndex}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                src={galleryImages[currentImageIndex]}
                                alt="Gallery View"
                                className="max-h-full max-w-full object-contain rounded-lg shadow-2xl shadow-cyan-900/20"
                            />

                            <button onClick={nextImage} className="absolute right-4 z-10 p-3 bg-black/50 hover:bg-cyan-600 rounded-full text-white transition backdrop-blur-md border border-white/10">
                                <ChevronRight size={32} />
                            </button>
                        </div>

                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 overflow-x-auto max-w-full px-4 py-2">
                            {galleryImages.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(idx); }}
                                    className={`w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${currentImageIndex === idx ? 'border-cyan-500 scale-110' : 'border-transparent opacity-50 hover:opacity-100'}`}
                                >
                                    <img src={img} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>


            {/* Hero Image */}
            <div className="relative w-full h-[60vh]">
                <img
                    src={hotel.image}
                    alt={hotel.name}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent" />
                <Link href="/hotels" className="absolute top-8 left-8 p-3 bg-black/30 backdrop-blur-md rounded-full hover:bg-black/50 transition">
                    <ArrowLeft className="text-white" />
                </Link>
            </div>

            <div className="max-w-5xl mx-auto px-6 -mt-32 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl"
                >
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">{hotel.name}</h1>
                            <div className="flex items-center gap-2 text-cyan-400">
                                <MapPin size={20} />
                                <span className="text-lg">Sindhudurg</span>
                            </div>
                        </div>
                        <div className="flex flex-col items-end">
                            <div className="flex items-center gap-1 bg-yellow-500/20 px-3 py-1 rounded-lg text-yellow-500 mb-2 border border-yellow-500/20">
                                <Star fill="currentColor" size={18} />
                                <span className="font-bold">{hotel.rating}</span>
                            </div>
                            <p className="text-3xl font-bold text-white">₹{hotel.pricePerNight} <span className="text-sm text-slate-400 font-normal">/ night</span></p>
                        </div>
                    </div>

                    <div className="prose prose-invert max-w-none mb-10">
                        <h3 className="text-2xl font-bold text-white mb-4">About this stay</h3>
                        <p className="text-slate-300 text-lg leading-relaxed">{hotel.description}</p>
                    </div>

                    <div className="mb-12">
                        <h3 className="text-2xl font-bold text-white mb-6">Amenities</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {amenitiesList.map((amenity: string, idx: number) => (
                                <div key={idx} className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/5 hover:border-cyan-500/30 transition-colors">
                                    <div className="text-cyan-400">
                                        {amenity.toLowerCase().includes('wifi') ? <Wifi size={20} /> :
                                            amenity.toLowerCase().includes('pool') ? <HelpCircle size={20} /> :
                                                amenity.toLowerCase().includes('spa') ? <HelpCircle size={20} /> : <Coffee size={20} />}
                                    </div>
                                    <span className="text-slate-300 capitalize">{amenity}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Gallery Section */}
                    {galleryImages.length > 0 && (
                        <div className="mb-12">
                            <h3 className="text-2xl font-bold text-white mb-6">Gallery</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 h-80">
                                {/* First large image */}
                                <div
                                    className="col-span-2 row-span-2 relative rounded-2xl overflow-hidden cursor-pointer group"
                                    onClick={() => openLightbox(0)}
                                >
                                    <img src={galleryImages[0]} className="w-full h-full object-cover transition duration-500 group-hover:scale-110" />
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                                </div>
                                {/* Smaller images */}
                                {galleryImages.slice(1, 5).map((img, idx) => (
                                    <div
                                        key={idx}
                                        className="relative rounded-2xl overflow-hidden cursor-pointer group border border-white/10"
                                        onClick={() => openLightbox(idx + 1)}
                                    >
                                        <img src={img} className="w-full h-full object-cover transition duration-500 group-hover:scale-110" />
                                        {idx === 3 && galleryImages.length > 5 && (
                                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-bold text-xl backdrop-blur-sm">
                                                +{galleryImages.length - 5}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="mt-12 pt-8 border-t border-white/10">
                        {!showPayment ? (
                            <div className="flex justify-end">
                                <button
                                    onClick={() => setShowPayment(true)}
                                    className="px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl font-bold text-lg shadow-lg shadow-cyan-900/20 hover:scale-105 transition-transform flex items-center gap-2"
                                >
                                    <CreditCard className="inline" size={20} /> Book Now
                                </button>
                            </div>
                        ) : (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="overflow-hidden">
                                <div className="bg-slate-800/80 rounded-2xl p-6 border border-white/10 relative">
                                    <button onClick={() => setShowPayment(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X size={20} /></button>
                                    <h3 className="text-xl font-bold text-white mb-4">Guest & Payment Details</h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                        <div>
                                            <label className="block text-slate-400 text-sm mb-1">Check-in</label>
                                            <input type="date" className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-cyan-500 outline-none"
                                                onChange={(e) => {
                                                    const newDate = e.target.value;
                                                    setGuestDetails(prev => ({ ...prev, checkIn: newDate }));
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-slate-400 text-sm mb-1">Check-out</label>
                                            <input type="date" className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-cyan-500 outline-none"
                                                onChange={(e) => {
                                                    const newDate = e.target.value;
                                                    setGuestDetails(prev => ({ ...prev, checkOut: newDate }));
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {(() => {
                                        const start = guestDetails.checkIn ? new Date(guestDetails.checkIn) : null;
                                        const end = guestDetails.checkOut ? new Date(guestDetails.checkOut) : null;
                                        const nights = (start && end && end > start) ? Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) : 1;
                                        const totalBase = hotel.pricePerNight * nights;
                                        const gst = totalBase * 0.12;
                                        const totalPayable = totalBase + gst;

                                        return (
                                            <>
                                                <div className="bg-slate-800 p-4 rounded-xl border border-white/5 mb-6 space-y-2">
                                                    <div className="flex justify-between text-slate-400">
                                                        <span>Rate ({nights} Night{nights > 1 ? 's' : ''})</span>
                                                        <span>₹{totalBase.toLocaleString()}</span>
                                                    </div>
                                                    <div className="flex justify-between text-slate-400">
                                                        <span>GST (12%)</span>
                                                        <span>₹{gst.toLocaleString()}</span>
                                                    </div>
                                                    <div className="h-px bg-white/10 my-2" />
                                                    <div className="flex justify-between text-xl font-bold text-white">
                                                        <span>Total Payable</span>
                                                        <span>₹{totalPayable.toLocaleString()}</span>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                                    <input
                                                        type="text"
                                                        placeholder="Full Name"
                                                        value={guestDetails.name}
                                                        onChange={(e) => setGuestDetails({ ...guestDetails, name: e.target.value })}
                                                        className="bg-slate-900/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-cyan-500 outline-none"
                                                    />
                                                    <input
                                                        type="email"
                                                        placeholder="Email"
                                                        value={guestDetails.email}
                                                        onChange={(e) => setGuestDetails({ ...guestDetails, email: e.target.value })}
                                                        className="bg-slate-900/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-cyan-500 outline-none"
                                                    />
                                                    <input
                                                        type="tel"
                                                        placeholder="Phone"
                                                        value={guestDetails.phone}
                                                        onChange={(e) => setGuestDetails({ ...guestDetails, phone: e.target.value })}
                                                        className="bg-slate-900/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-cyan-500 outline-none"
                                                    />
                                                </div>

                                                <Pay
                                                    amount={totalPayable}
                                                    name={guestDetails.name}
                                                    email={guestDetails.email}
                                                    phone={guestDetails.phone}
                                                    bookingDetails={{
                                                        vehicle: "Hotel Stay",
                                                        route: hotel.name,
                                                        date: guestDetails.checkIn || new Date().toLocaleDateString(),
                                                        time: "Check-in 12:00 PM",
                                                        duration: nights,
                                                        basePrice: totalBase,
                                                        gstAmount: gst,
                                                        totalAmount: totalPayable
                                                    }}
                                                />
                                            </>
                                        );
                                    })()}
                                </div>
                            </motion.div>
                        )}
                    </div>
                </motion.div>
            </div >
        </div >
    );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
    const { id } = context.params!;

    try {
        const hotel = await prisma.hotel.findFirst({
            where: {
                OR: [
                    { id: id as string },
                    { name: { contains: (id as string).replace(/-/g, " "), mode: 'insensitive' } as any }
                ]
            }
        });
        return {
            props: {
                hotel: JSON.parse(JSON.stringify(hotel)),
            },
        };
    } catch (e) {
        return {
            props: { hotel: null }
        }
    }
};

export default HotelDetails;
