import React, { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import AIChatBot from "../components/AIChabot/AIChatbot";

type Hotel = { name: string; pricePerNight: number; image: string };
type Location = { name: string; image: string; hotels: Hotel[] };

const locations: Location[] = [
  {
    name: "Sindhudurg",
    image: "/image/sindhudurg.jpg",
    hotels: [
      {
        name: "BaywatchResort",
        pricePerNight: 8500,
        image: "/image/baywatch/35.jpg",
      },
    ],
  },
  // {
  //   name: "Lonavala",
  //   image: "/image/lonavala.jpg",
  //   hotels: [
  //     {
  //       name: "Hilltop Resort",
  //       pricePerNight: 3000,
  //       image: "/image/hotel1.jpeg",
  //     },
  //     {
  //       name: "Valley View Inn",
  //       pricePerNight: 4500,
  //       image: "/image/hotel2.jpeg",
  //     },
  //   ],
  // },
  // {
  //   name: "Goa",
  //   image: "/image/goa.jpg",
  //   hotels: [
  //     {
  //       name: "Beach Paradise",
  //       pricePerNight: 5000,
  //       image: "/image/hotel3.jpeg",
  //     },
  //     {
  //       name: "Ocean Breeze",
  //       pricePerNight: 5500,
  //       image: "/image/hotel4.jpeg",
  //     },
  //   ],
  // },
  // {
  //   name: "Mahabaleshwar",
  //   image: "/image/mahabaleshwar.jpg",
  //   hotels: [
  //     {
  //       name: "Strawberry Hill Resort",
  //       pricePerNight: 3800,
  //       image: "/image/hotels/maha1.jpg",
  //     },
  //     {
  //       name: "Forest Valley",
  //       pricePerNight: 4200,
  //       image: "/image/hotels/maha2.jpg",
  //     },
  //   ],
  // },
  // {
  //   name: "Pune",
  //   image: "/image/pune-city.jpg",
  //   hotels: [
  //     {
  //       name: "City Comfort",
  //       pricePerNight: 2800,
  //       image: "/image/hotels/pune1.jpg",
  //     },
  //     {
  //       name: "Luxury Residency",
  //       pricePerNight: 3900,
  //       image: "/image/hotels/pune2.jpg",
  //     },
  //   ],
  // },
  // {
  //   name: "Ratnagiri",
  //   image: "/image/ratnagiri.jpg",
  //   hotels: [
  //     {
  //       name: "Sea Shore Inn",
  //       pricePerNight: 3200,
  //       image: "/image/hotels/rat1.jpg",
  //     },
  //     {
  //       name: "Palm Grove Resort",
  //       pricePerNight: 4100,
  //       image: "/image/hotels/rat2.jpg",
  //     },
  //   ],
  // },
];

export default function HotelBooking() {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null
  );

  return (
    <div className="min-h-screen bg-[#222f35] py-20 px-6 md:px-20">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="text-center mb-14"
      >
        <h2 className="text-5xl font-extrabold text-[#00ffff] mb-4 tracking-tight">
          Hotel Booking
        </h2>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto">
          Select your destination and book your luxury hotel stay.
        </p>
      </motion.div>

      {!selectedLocation && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {locations.map((loc, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transition duration-300 overflow-hidden cursor-pointer"
              onClick={() => setSelectedLocation(loc)}
            >
              <div className="relative w-full h-60">
                <Image
                  src={loc.image}
                  alt={loc.name}
                  layout="fill"
                  objectFit="cover"
                />
              </div>
              <div className="p-6 text-center">
                <h3 className="text-2xl font-bold text-gray-800">{loc.name}</h3>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {selectedLocation && (
        <>
          <button
            onClick={() => setSelectedLocation(null)}
            className="mb-4 text-white flex items-center text-lg hover:text-gray-300"
          >
            <ChevronLeft size={24} /> Back
          </button>
          <h3 className="text-3xl text-center text-white mb-8">
            Choose Hotel at{" "}
            <span className="text-[#00ffff]">{selectedLocation.name}</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
            {selectedLocation.hotels.map((hotel, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transition duration-300 overflow-hidden cursor-pointer"
              >
                <div className="relative w-full h-60">
                  <Image
                    src={hotel.image}
                    alt={hotel.name}
                    layout="fill"
                    objectFit="cover"
                  />
                </div>
                <div className="p-6 text-center">
                  <h3 className="text-2xl font-bold text-gray-800">
                    {hotel.name}
                  </h3>
                  <p className="text-lg text-gray-600">
                    ₹ {hotel.pricePerNight} / night
                  </p>
                  <Link href={`/${encodeURIComponent(hotel.name)}`}>
                    <button className="mt-4 bg-blue-600 text-white py-2 px-6 rounded-xl font-semibold hover:bg-blue-700">
                      Select
                    </button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}
      <AIChatBot />
    </div>
  );
}
