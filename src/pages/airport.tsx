import React, { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock } from "lucide-react";
import Pay from "../components/Pay/Pay";

const airports = ["Mumbai Airport", "Pune Airport"];

const cars = [
  { name: "Toyota Innova", image: "/image/innova.png" },
  { name: "Sedan", image: "/image/dzire.png" },
];

const Airport = () => {
  const [car, setCar] = useState("");
  const [airport, setAirport] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [showPay, setShowPay] = useState(false);

  // Toll tax for Mumbai
  //   const tollTax = 300;

  // Price calculation
  const getPrice = () => {
    if (!car || !airport) return 0;

    if (airport === "Pune Airport") {
      return car === "Toyota Innova" ? 1500 : 1000;
    }
    if (airport === "Mumbai Airport") {
      return car === "Toyota Innova" ? 5500 : 3500;
    }
    return 0;
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
          Choose your car, airport, and schedule.
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
                  className={`cursor-pointer border-2 rounded-2xl overflow-hidden shadow-md transition-all ${
                    car === c.name
                      ? "border-blue-600 shadow-lg"
                      : "border-gray-300"
                  }`}
                >
                  <img
                    src={c.image}
                    alt={c.name}
                    className="w-full h-70 object-cover"
                  />
                  <div className="p-4 text-center bg-gray-50">
                    <p
                      className={`font-semibold text-lg ${
                        car === c.name ? "text-blue-600" : "text-gray-800"
                      }`}
                    >
                      {c.name}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Airport Selection */}
          {car && (
            <div>
              <label className="block text-gray-700 mb-2 font-semibold">
                Select Airport:
              </label>
              <select
                className="border w-full px-4 py-2 rounded-lg text-black"
                value={airport}
                onChange={(e) => setAirport(e.target.value)}
              >
                <option value="">Choose...</option>
                {airports.map((a, i) => (
                  <option key={i} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Date & Time */}
          {airport && (
            <>
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

              {/* Price Preview */}
              <div className="text-xl font-bold text-green-600">
                Total: ₹ {grandTotal}
                {airport === "Mumbai Airport" && (
                  <p className="text-sm text-gray-600">(Additional Toll Tax)</p>
                )}
              </div>
            </>
          )}

          {/* Proceed Button */}
          {airport && (
            <button
              onClick={() => setShowPay(true)}
              className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700"
              disabled={!date || !time}
            >
              Proceed
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-2xl p-8 w-full md:w-1/2 mx-auto">
          <Pay amount={grandTotal} />
        </div>
      )}
    </div>
  );
};

export default Airport;
