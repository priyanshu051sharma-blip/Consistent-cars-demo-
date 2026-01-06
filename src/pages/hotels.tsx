import React, { useState } from "react";
import Image from "next/image";
import { GetServerSideProps } from "next";
import prisma from "../lib/prisma";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ChevronLeft, MapPin, Star } from "lucide-react";
import AIChatBot from "../components/AIChabot/AIChatbot";

/* const prisma = new PrismaClient(); REMOVED */

type Hotel = {
  id: string;
  name: string;
  pricePerNight: number;
  image: string;
  rating: number;
  amenities: string; // Stored as comma-separated string in DB
  description: string
};

type Location = {
  id: string;
  name: string;
  image: string;
  description: string;
  hotels: Hotel[]
};

interface HotelBookingProps {
  locations: Location[];
}

export default function HotelBooking({ locations }: HotelBookingProps) {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

  // Helper to parse amenities string to array
  const getAmenitiesList = (str: string) => str ? str.split(',') : [];

  return (
    <div className="min-h-screen bg-[#0f172a] text-white font-sans selection:bg-cyan-500/30">
      {/* Background Gradient Blob */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 md:px-12">
        <AIChatBot />

        <AnimatePresence mode="wait">
          {!selectedLocation ? (
            <motion.div
              key="location-select"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-center mb-16 space-y-4">
                <h1 className="text-5xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                  Discover Your Stay
                </h1>
                <p className="text-lg text-slate-400 max-w-2xl mx-auto font-light">
                  Select a destination to explore our curated collection of luxury hotels and resorts.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {locations.map((loc, index) => (
                  <motion.div
                    key={loc.id || index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -10 }}
                    viewport={{ once: true }}
                    className="group relative h-[400px] rounded-[2rem] overflow-hidden cursor-pointer shadow-2xl shadow-black/50 border border-white/10"
                    onClick={() => setSelectedLocation(loc)}
                  >
                    <Image
                      src={loc.image}
                      alt={loc.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                    <div className="absolute bottom-0 p-8 w-full">
                      <div className="flex items-center gap-2 text-cyan-400 mb-2">
                        <MapPin size={18} />
                        <span className="text-sm font-semibold tracking-wider uppercase">Destination</span>
                      </div>
                      <h3 className="text-3xl font-bold text-white mb-2">{loc.name}</h3>
                      <p className="text-slate-300 text-sm line-clamp-2">{loc.description}</p>

                      <div className="mt-6 flex items-center gap-2 text-sm font-medium text-white/80 opacity-0 transform translate-y-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
                        <span>Explore Hotels</span>
                        <ChevronLeft className="rotate-180" size={16} />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="hotel-select"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.5 }}
            >
              <button
                onClick={() => setSelectedLocation(null)}
                className="group flex items-center gap-2 text-slate-400 hover:text-cyan-400 mb-8 transition-colors"
              >
                <div className="p-2 rounded-full bg-white/5 border border-white/10 group-hover:bg-cyan-500/10 group-hover:border-cyan-500/50 transition-all">
                  <ChevronLeft size={20} />
                </div>
                <span className="font-medium">Back to Destinations</span>
              </button>

              <div className="mb-12">
                <h2 className="text-4xl font-bold text-white mb-2">
                  Stays in <span className="text-cyan-400">{selectedLocation.name}</span>
                </h2>
                <p className="text-slate-400">Found {selectedLocation.hotels.length} luxury properties available for you.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {selectedLocation.hotels.map((hotel, index) => (
                  <motion.div
                    key={hotel.id || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden hover:border-cyan-500/30 transition-all duration-300 shadow-xl"
                  >
                    <div className="flex flex-col md:flex-row h-full">
                      <div className="relative w-full md:w-2/5 h-64 md:h-auto">
                        <Image
                          src={hotel.image}
                          alt={hotel.name}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1">
                          <Star size={14} className="text-yellow-400 fill-yellow-400" />
                          <span className="text-xs font-bold">{hotel.rating}</span>
                        </div>
                      </div>

                      <div className="p-6 md:p-8 flex flex-col justify-between flex-1">
                        <div>
                          <h3 className="text-2xl font-bold text-white mb-2">{hotel.name}</h3>
                          <p className="text-slate-400 text-sm mb-4 leading-relaxed">{hotel.description}</p>

                          <div className="flex flex-wrap gap-2 mb-6">
                            {getAmenitiesList(hotel.amenities).map((amenity, i) => (
                              <span key={i} className="px-3 py-1 bg-white/5 rounded-lg text-xs text-slate-300 border border-white/5">
                                {amenity}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-end justify-between mt-auto">
                          <div>
                            <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Price per night</p>
                            <div className="flex items-baseline gap-1">
                              <span className="text-2xl font-bold text-cyan-400">₹{hotel.pricePerNight.toLocaleString()}</span>
                            </div>
                          </div>

                          <Link href={`/hotels/${encodeURIComponent(hotel.name.toLowerCase().replace(/ /g, '-'))}`}>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-3 px-8 rounded-xl transition-colors shadow-lg shadow-cyan-500/20"
                            >
                              Details
                            </motion.button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    const locations = await prisma.location.findMany({
      where: {
        name: {
          contains: 'Sindhudurg'
        }
      },
      include: {
        hotels: true
      }
    });
    return {
      props: {
        locations: JSON.parse(JSON.stringify(locations)),
      },
    };
  } catch (error) {
    console.error(error);
    return {
      props: { locations: [] }
    }
  }
};
