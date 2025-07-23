import React, { useState } from "react";
import Image from "next/image";
import {
  BadgeCheck,
  X,
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
} from "lucide-react";
import { motion } from "framer-motion";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import AIChatBot from "../components/AIChabot/AIChatbot";
import Pay from "../components/Pay/Pay";

type Car = { name: string; price: number; image: string };
type Location = { name: string; image: string };

const cars: Car[] = [
  { name: "Toyota Innova", price: 500, image: "/image/innova.png" },
  { name: "Swift Dzire", price: 400, image: "/image/dzire.png" },
  { name: "Honda City", price: 450, image: "/image/city.png" },
];

const locations: Location[] = [
  { name: "Airport Drop", image: "/image/airport.jpg" },
  { name: "Lonavala", image: "/image/lonavala.jpg" },
  { name: "Goa", image: "/image/goa.jpg" },
  { name: "Mahabaleshwar", image: "/image/mahabaleshwar.jpg" },
  { name: "Sindhudurg", image: "/image/sindhudurg.jpeg" },
  { name: "Ratnagiri", image: "/image/ratnagiri.jpg" },
  { name: "Aurangabad", image: "/image/aurangabad.jpg" },
];

const Service = () => {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null
  );
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [hours, setHours] = useState<number>(1);
  const [date, setDate] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [userData, setUserData] = useState({ name: "", email: "", phone: "" });

  const isFormValid = userData.name && userData.email && userData.phone;

  const generatePDF = () => {
    if (!selectedCar || !selectedLocation || !isFormValid) return;

    const basePrice = selectedCar.price;
    const subtotal = basePrice * hours;
    const gst = subtotal * 1;
    const discount = subtotal * 1;
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
        ["Base Price (per hour)", basePrice.toFixed(2)],
        ["Total Hours", hours.toString()],
        ["Subtotal", subtotal.toFixed(2)],
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
      { align: "center" }
    );

    doc.save("booking_invoice.pdf");
  };

  const basePrice = selectedCar?.price || 0;
  const subtotal = basePrice * hours;
  const gst = subtotal * 1;
  const discount = subtotal * 1;
  const grandTotal = subtotal + gst - discount;

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
              onClick={() => setSelectedLocation(loc)}
            >
              <div className="relative w-full h-60">
                <Image
                  src={loc.image}
                  alt={loc.name}
                  layout="fill"
                  objectFit="cover"
                  className="group-hover:scale-105 transition-transform duration-500 ease-in-out"
                />
              </div>
              <div className="p-6 flex justify-center items-center">
                <h3 className="text-2xl font-bold text-gray-800">{loc.name}</h3>
              </div>
            </motion.div>
          ))}
        </div>
      )}

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
                    layout="fill"
                    objectFit="cover"
                    className="group-hover:scale-105 transition-transform duration-500 ease-in-out"
                  />
                </div>
                <div className="p-6 space-y-3">
                  <h3 className="text-2xl font-bold text-gray-800">
                    {car.name}
                  </h3>
                  <p className="text-md text-gray-600">
                    Starting at Rs {car.price}/hour
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
              <X size={24} />
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
                <p className="text-sm text-gray-500">
                  Rs {selectedCar.price} per hour
                </p>
              </div>
            </div>
            <div>
              <label className="block text-gray-700 mb-2">
                <Calendar size={16} className="inline-block mr-2" /> Select
                Date:
              </label>
              <input
                type="date"
                className="border w-full px-4 py-2 rounded-lg text-black"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">
                <Clock size={16} className="inline-block mr-2" /> Number of
                Hours:
              </label>
              <input
                type="number"
                min="1"
                className="border w-full px-4 py-2 rounded-lg text-black"
                value={hours}
                onChange={(e) => setHours(Number(e.target.value))}
              />
            </div>
            <div className="text-xl font-bold text-green-600">
              Total: Rs {selectedCar.price * hours}
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition duration-200"
            >
              Proceed
            </button>
          </div>
        </motion.div>
      )}

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
              className="text-white hover:text-red-500"
            >
              <X size={24} />
            </button>
          </div>
          <div className="space-y-6">
            <Pay amount={grandTotal} />
          </div>
        </motion.div>
      )}
      <AIChatBot />
    </div>
  );
};

export default Service;
