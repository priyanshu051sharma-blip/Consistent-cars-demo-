import React, { useState } from "react";
import Image from "next/image";
import { BadgeCheck, X, Calendar, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import AIChatBot from "../components/AIChabot/AIChatbot";
import Pay from "../components/Pay/Pay";
import { useRouter } from "next/navigation";

type Car = {
  name: string;
  baseDayPrice: number;
  dailyRate: number;
  image: string;
};

const cars: Car[] = [
  {
    name: "Toyota Innova",
    baseDayPrice: 5500,
    dailyRate: 5500,
    image: "/image/innova.png",
  },
  {
    name: "Sedan",
    baseDayPrice: 3750,
    dailyRate: 3750,
    image: "/image/dzire.png",
  },
];

type Location = { name: string; image: string };

const locations: Location[] = [
  { name: "Airport Drop", image: "/image/airport.jpg" },
  { name: "Lonavala", image: "/image/lonavala.jpg" },
  { name: "Goa", image: "/image/goa.jpg" },
  { name: "Mahabaleshwar", image: "/image/mahabaleshwar.jpg" },
  { name: "Sindhudurg", image: "/image/sindhudurg.jpeg" },
  { name: "Ganpatipule", image: "/image/ratnagiri.jpg" },
  { name: "Aurangabad", image: "/image/aurangabad.jpg" },
];

const Service = () => {
  const router = useRouter();

  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null
  );
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [hours, setHours] = useState<number>(1);
  const [date, setDate] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phone: "",
    time: "",
  });

  const isFormValid = userData.name && userData.email && userData.phone;

  // ✅ New total logic
  const calculateTotal = (car: Car, hours: number) => {
    if (hours <= 1) return car.baseDayPrice;
    return car.baseDayPrice + (hours - 1) * car.dailyRate;
  };

  const grandTotal = selectedCar ? calculateTotal(selectedCar, hours) : 0;

  const generatePDF = () => {
    if (!selectedCar || !selectedLocation || !isFormValid) return;

    const baseCost = selectedCar.baseDayPrice;
    const days = Math.ceil(hours / 24); // round up to nearest day
    const subtotal = baseCost * days;
    const gst = 0; // adjust if needed
    const discount = 0;
    const total = subtotal + gst - discount;

    const doc = new jsPDF();

    // Header
    doc.setFillColor(0, 191, 255);
    doc.rect(0, 0, 210, 40, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(26);
    doc.text("ConsistentCars Invoice", 105, 20, { align: "center" });

    // Customer & Booking Details
    doc.setTextColor(0);
    doc.setFontSize(14);
    doc.text("Customer Details", 14, 50);

    autoTable(doc, {
      startY: 55,
      head: [["Field", "Details"]],
      body: [
        ["Customer Name", userData.name],
        ["Email", userData.email],
        ["Phone", userData.phone],
        ["Location", selectedLocation.name],
        ["Car Selected", selectedCar.name],
        ["Booking Date", date],
        ["Total Hours", hours.toString()],
      ],
      styles: { fontSize: 12, cellPadding: 4 },
      headStyles: { fillColor: [0, 191, 255] },
    });

    const finalY = (doc as any).lastAutoTable.finalY + 10;

    doc.setFontSize(14);
    doc.text("Price Breakdown", 14, finalY);

    autoTable(doc, {
      startY: finalY + 5,
      head: [["Description", "Amount (Rs)"]],
      body: [
        [`Car (${days} day${days > 1 ? "s" : ""})`, subtotal.toFixed(2)],
        ["GST (0%)", gst.toFixed(2)],
        ["Discount (0%)", `-${discount.toFixed(2)}`],
        ["Grand Total", total.toFixed(2)],
      ],
      styles: { fontSize: 12, cellPadding: 4 },
      headStyles: { fillColor: [0, 191, 255] },
    });

    const afterPriceY = (doc as any).lastAutoTable.finalY + 20;

    doc.setFontSize(12);
    doc.text("Please keep this invoice for your reference.", 105, afterPriceY, {
      align: "center",
    });
    doc.text(
      "Thank you for booking with ConsistentCars!",
      105,
      afterPriceY + 10,
      {
        align: "center",
      }
    );

    doc.save("booking_invoice.pdf");
  };

  return (
    <div className="min-h-screen bg-[#222f35] py-20 px-6 md:px-20 relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="text-center mb-14"
      >
        <h2 className="text-5xl font-extrabold text-[#00ffff] mb-4 tracking-tight">
          Book Your Ride
        </h2>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto">
          Select your destination to begin your luxury experience.
        </p>
      </motion.div>

      {/* Location selection */}
      {!selectedLocation && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {locations.map((loc, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transition duration-300 overflow-hidden group relative cursor-pointer"
              onClick={() => {
                if (loc.name === "Airport Drop") {
                  router.push("/airport");
                } else {
                  setSelectedLocation(loc);
                }
              }}
            >
              <div className="relative w-full h-60">
                <Image
                  src={loc.image}
                  alt={loc.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500 ease-in-out"
                />
              </div>
              <div className="p-6 flex justify-center items-center">
                <h3 className="text-2xl font-bold text-gray-800">{loc.name}</h3>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Car selection */}
      {selectedLocation && !selectedCar && (
        <>
          <h3 className="text-3xl text-center text-white mb-8">
            Selected Location:{" "}
            <span className="text-[#00ffff]">{selectedLocation.name}</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {cars.map((car, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transition duration-300 overflow-hidden group relative"
              >
                <div className="relative w-full h-60">
                  <Image
                    src={car.image}
                    alt={car.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500 ease-in-out"
                  />
                </div>
                <div className="p-6 space-y-3">
                  <h3 className="text-2xl font-bold text-gray-800">
                    {car.name}
                  </h3>
                  <p className="text-md text-gray-600">
                    ₹{car.baseDayPrice} per day
                  </p>
                  <button
                    onClick={() => setSelectedCar(car)}
                    className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition duration-200 flex justify-center items-center gap-2"
                  >
                    <BadgeCheck size={18} /> Select Car
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}

      {/* Booking form */}
      {selectedCar && !showForm && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-3xl shadow-2xl p-8 w-full md:w-1/2 mx-auto"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-3xl font-bold text-blue-700">
              Booking Details
            </h3>
            <button
              onClick={() => setSelectedCar(null)}
              className="text-gray-500 hover:text-red-500"
            >
              <X size={1} />
            </button>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Image
                src={selectedCar.image}
                alt={selectedCar.name}
                width={100}
                height={60}
                className="rounded-lg"
              />
              <div>
                <h4 className="text-xl font-semibold text-gray-800">
                  {selectedCar.name}
                </h4>
                <div className="text-xl font-bold text-green-600">
                  Total: Rs {grandTotal}
                </div>
                <p className="text-sm text-gray-500">
                  ₹{selectedCar.baseDayPrice} per day
                </p>
                <p className="text-sm text-red-600">
                  * Toll charges (if any) will be additional.
                </p>
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="block text-gray-700 mb-2">
                <Calendar size={16} className="inline-block mr-2" /> Select
                Date:
              </label>
              <input
                type="date"
                className="border w-full px-4 py-2 rounded-lg text-black"
                value={date}
                min={new Date().toISOString().split("T")[0]} // disables past dates
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            {/* Time */}
            <div>
              <label className="block text-gray-700 mb-2">
                <Clock size={16} className="inline-block mr-2" /> Select Time:
              </label>
              <input
                type="time"
                className="border w-full px-4 py-2 rounded-lg text-black"
                onChange={(e) =>
                  setUserData({ ...userData, time: e.target.value })
                }
              />
            </div>

            {/* Hours */}
            <div>
              <label className="block text-gray-700 mb-2">
                <Clock size={16} className="inline-block mr-2" /> Number of
                Days:
              </label>
              <input
                type="number"
                className="border w-full px-4 py-2 rounded-lg text-black"
                value={hours}
                min={1}
                onChange={(e) => setHours(Number(e.target.value))}
              />
            </div>

            <button
              onClick={() => {
                if (!selectedCar || !selectedLocation || !hours) {
                  alert("Please select all fields before proceeding.");
                  return;
                }
                if (hours < 1) {
                  alert("Booking cannot be less than 24 hours.");
                  return;
                }
                setShowForm(true); // <-- use showForm, not showPay
              }}
              className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700"
            >
              Proceed
            </button>
          </div>
        </motion.div>
      )}

      {/* Payment form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-3xl shadow-2xl p-8 w-full md:w-1/2 mx-auto"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-3xl font-bold text-blue-700">
              Enter Your Details
            </h3>
            <button
              onClick={() => setShowForm(false)}
              className="text-gray-500 hover:text-red-500"
            >
              <X size={24} />
            </button>
          </div>
          <div className="space-y-6">
            <Pay amount={grandTotal} />
            <button
              onClick={generatePDF}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition duration-200"
            >
              Download Invoice
            </button>
          </div>
        </motion.div>
      )}

      <AIChatBot />
    </div>
  );
};

export default Service;
