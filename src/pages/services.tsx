import React, { useState } from "react";
import { GetServerSideProps } from "next";
import Image from "next/image";
import prisma from "../lib/prisma";
import { BadgeCheck, X, Calendar, Clock, MapPin, Car as CarIcon, ArrowRight, Download, CreditCard, ChevronLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import AIChatBot from "../components/AIChabot/AIChatbot";
import Pay from "../components/Pay/Pay";
import { useRouter } from "next/navigation";

/* const prisma = new PrismaClient(); REMOVED */

// --- Types ---
type Car = {
  id: string;
  name: string;
  baseDayPrice: number;
  image: string;
  type: string;
  seats: number;
  features: string; // Comma separated in DB
};

type Location = {
  id: string;
  name: string;
  image: string;
  description: string
};

interface ServiceProps {
  cars: Car[];
  locations: Location[];
}

export default function Service({ cars, locations }: ServiceProps) {
  const router = useRouter();

  // --- Handlers ---
  const handleLocationSelect = (loc: Location) => {
    router.push(`/booking?location=${encodeURIComponent(loc.name)}`);
  };

  const handleAirportSelect = () => {
    router.push(`/booking?location=Pune Airport`);
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
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-20"
        >
          <span className="text-cyan-400 font-semibold tracking-wider uppercase text-sm mb-2 block">Destinations & Services</span>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight bg-gradient-to-r from-white via-cyan-100 to-cyan-400 bg-clip-text text-transparent mb-6">
            Choose Your Journey
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Select a destination or service to begin your booking.
          </p>
        </motion.div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-32">

          {/* Airport Drop Card (Manual Entry) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -10 }}
            className="group relative h-[400px] rounded-[2rem] overflow-hidden cursor-pointer shadow-2xl border border-white/5 ring-1 ring-cyan-500/20"
            onClick={handleAirportSelect}
          >
            <Image
              src="/image/airport.jpg"
              alt="Airport Drop"
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent opacity-90 group-hover:opacity-100 transition-opacity" />

            <div className="absolute bottom-0 p-8 w-full translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
              <div className="w-12 h-12 bg-cyan-500/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4 text-cyan-400 border border-cyan-500/20 group-hover:bg-cyan-500 group-hover:text-white transition-colors">
                <CarIcon size={24} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">Airport Drop</h3>
              <p className="text-slate-300 text-sm leading-relaxed mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100 line-clamp-2">
                Reliable and timely airport transfers to ensure you never miss a flight.
              </p>
              <div className="flex items-center gap-2 text-cyan-400 text-sm font-semibold uppercase tracking-wider">
                Book Now <ArrowRight size={16} />
              </div>
            </div>
          </motion.div>

          {/* Dynamic Locations */}
          {locations.map((loc, index) => (
            <motion.div
              key={loc.id || index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -10 }}
              className="group relative h-[400px] rounded-[2rem] overflow-hidden cursor-pointer shadow-2xl border border-white/5"
              onClick={() => handleLocationSelect(loc)}
            >
              <Image
                src={loc.image}
                alt={loc.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent opacity-90 group-hover:opacity-100 transition-opacity" />

              <div className="absolute bottom-0 p-8 w-full translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4 text-cyan-400 border border-white/10 group-hover:bg-cyan-500 group-hover:text-white transition-colors">
                  <MapPin size={24} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">{loc.name}</h3>
                <p className="text-slate-300 text-sm leading-relaxed mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100 line-clamp-2">
                  {loc.description}
                </p>
                <div className="flex items-center gap-2 text-cyan-400 text-sm font-semibold uppercase tracking-wider">
                  Select Route <ArrowRight size={16} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    const locations = await prisma.location.findMany();
    const cars = await prisma.car.findMany();

    return {
      props: {
        locations: JSON.parse(JSON.stringify(locations)),
        cars: JSON.parse(JSON.stringify(cars)),
      },
    };
  } catch (error) {
    console.error("Error fetching data:", error);
    return {
      props: { locations: [], cars: [] }
    }
  }
};
