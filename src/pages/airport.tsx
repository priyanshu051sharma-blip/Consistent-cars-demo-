import React, { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock } from "lucide-react";
import Pay from "../components/Pay/Pay";

const locations = ["Mumbai", "Pune", "Sindhudurg", "Goa", "Mahabaleshwar", "Ratnagiri", "Aurangabad"];
const airports = [
  "Mumbai Airport",
  "Pune Airport",
  "Sindhudurg Airport (Chipi)",
  "Goa Airport (Dabolim)",
  "Goa Airport (Mopa)",
  "Aurangabad Airport",
  "Ratnagiri Airport"
];

const cars = [
  { name: "Toyota Innova Crysta", image: "/image/innova.png" },
  { name: "Swift Dzire", image: "/image/dzire.png" },
];

const Airport = () => {
  const [car, setCar] = useState("");
  const [location, setLocation] = useState("");
  const [airport, setAirport] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [showPay, setShowPay] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // Price calculation
  const getPrice = () => {
    if (!car || !airport || !location) return 0;

    let basePrice = 1000;
    if (car === "Toyota Innova Crysta") basePrice += 500;

    // Simple dynamic pricing simulation
    if (location === "Mumbai" || location === "Aurangabad" || location === "Ratnagiri") basePrice += 1500;
    if (airport.includes("Mumbai") || airport.includes("Goa")) basePrice += 1000;

    return basePrice;
  };

  const grandTotal = getPrice();

  return (
    <div className="min-h-screen bg-[#222f35] py-20 px-6 md:px-20">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center mb-14"
      >
        <h2 className="text-5xl font-extrabold text-[#00ffff] mb-4">
          Airport Drop Booking
        </h2>
        <p className="text-lg text-gray-400">
          Choose your car, pickup location, airport, and schedule.
        </p>
      </motion.div>

      {!showPay ? (
        <div className="bg-white rounded-3xl shadow-2xl p-8 w-full md:w-2/3 mx-auto space-y-8">
          {/* Car Selection */}
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Select Car:
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {cars.map((c, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setCar(c.name)}
                  className={`cursor-pointer border-2 rounded-2xl overflow-hidden shadow-md transition-all ${car === c.name
                    ? "border-blue-600 shadow-lg"
                    : "border-gray-300"
                    }`}
                >
                  <img
                    src={c.image}
                    alt={c.name}
                    className="w-full h-screen object-cover"
                  />
                  <div className="p-4 text-center bg-gray-50">
                    <p
                      className={`font-semibold text-lg ${car === c.name ? "text-blue-600" : "text-gray-800"
                        }`}
                    >
                      {c.name}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Location Selection */}
          {car && (
            <div>
              <label className="block text-gray-700 mb-2 font-semibold">
                Select Pickup City/Region:
              </label>
              <select
                className="border w-full px-4 py-2 rounded-lg text-black"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              >
                <option value="">Choose Location...</option>
                {locations.map((loc, i) => (
                  <option key={i} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Airport Selection */}
          {location && (
            <div>
              <label className="block text-gray-700 mb-2 font-semibold">
                Select Drop Airport:
              </label>
              <select
                className="border w-full px-4 py-2 rounded-lg text-black"
                value={airport}
                onChange={(e) => setAirport(e.target.value)}
              >
                <option value="">Choose Airport...</option>
                {airports.map((a, i) => (
                  <option key={i} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
          )}



          {/* Rate Table - Visible when choices are made */}
          {airport && location && (
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
              <h4 className="text-lg font-bold text-gray-800 mb-4">Rate Breakdown</h4>
              <div className="space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Base Fare ({car})</span>
                  <span>₹{car === "Toyota Innova Crysta" ? 1500 : 1000}</span>
                </div>
                {(location === "Mumbai" || location === "Aurangabad" || location === "Ratnagiri") && (
                  <div className="flex justify-between text-gray-600">
                    <span>Location Surcharge ({location})</span>
                    <span>₹1500</span>
                  </div>
                )}
                {(airport.includes("Mumbai") || airport.includes("Goa")) && (
                  <div className="flex justify-between text-gray-600">
                    <span>Airport Surcharge ({airport.split(' ')[0]})</span>
                    <span>₹1000</span>
                  </div>
                )}
                <div className="h-px bg-gray-300 my-2" />
                <div className="flex justify-between text-xl font-bold text-green-600">
                  <span>Total Estimate</span>
                  <span>₹{grandTotal.toLocaleString()}</span>
                </div>
              </div>
              {airport.includes("Mumbai") && (
                <p className="text-xs text-gray-500 mt-2 italic">* Includes Toll Taxes for Mumbai entry</p>
              )}
            </div>
          )}

          {/* Dates & Contact */}
          {airport && location && (
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2 font-semibold">Contact Details:</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input placeholder="Name" className="border w-full px-4 py-2 rounded-lg text-black" value={name} onChange={e => setName(e.target.value)} />
                  <input placeholder="Email" className="border w-full px-4 py-2 rounded-lg text-black" value={email} onChange={e => setEmail(e.target.value)} />
                  <input placeholder="Phone" className="border w-full px-4 py-2 rounded-lg text-black" value={phone} onChange={e => setPhone(e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-2 font-semibold">
                    <Calendar size={16} className="inline-block mr-2" /> Date
                  </label>
                  <input
                    type="date"
                    className="border w-full px-4 py-2 rounded-lg text-black"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2 font-semibold">
                    <Clock size={16} className="inline-block mr-2" /> Time
                  </label>
                  <input
                    type="time"
                    className="border w-full px-4 py-2 rounded-lg text-black"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Proceed Button */}
          {airport && location && (
            <button
              onClick={() => setShowPay(true)}
              className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50"
              disabled={!date || !time || !name || !email || !phone}
            >
              Proceed to Pay
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-2xl p-8 w-full md:w-1/2 mx-auto">
          <button onClick={() => setShowPay(false)} className="mb-4 text-blue-600 underline">Back</button>
          <Pay
            amount={grandTotal}
            name={name}
            email={email}
            phone={phone}
            bookingDetails={{
              vehicle: car,
              route: `Pickup: ${location} -> Drop: ${airport}`,
              date: date,
              time: time,
              duration: 1
            }}
          />
        </div>
      )
      }
    </div >
  );
};

export default Airport;
