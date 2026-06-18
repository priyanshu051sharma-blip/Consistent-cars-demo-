import React, { useState } from "react";
import ImageGallery from "@/components/Image Gallery/ImageGallery";
import { User, Mail, Phone, Calendar } from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import Script from "next/script";
import Pay from "@/components/Pay/Pay";
import AIChatBot from "../components/AIChabot/AIChatbot";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface jsPDFWithPlugin extends jsPDF {
  lastAutoTable?: {
    finalY: number;
  };
}

const roomTypes = [
  {
    name: "Deluxe Suite, Sea View",
    price: 8000,
    images: [
      "/image/baywatch/del1.jpg",
      "/image/baywatch/del2.jpg",
      "/image/baywatch/del3.jpg",
    ],
    description:
      "Experience the ultimate in comfort and luxury with our Deluxe Suite...",
    amenities: [
      "Private balcony with ocean views",
      "Air conditioning",
      "Flat-screen TV",
      "Mini bar",
      "Wifi",
      "Work desk",
    ],
    rules: {
      checkIn: ["Check-in from 1:00 PM - anytime", "Minimum check-in age - 18"],
      checkOut: ["Check-out 11:00 am"],
      specialInstructions: ["Front desk staff will greet guests on arrival."],
      childrenPolicy: ["Children are welcome", "Kids under 7 stay free"],
    },
  },
  {
    name: "Superior Suite, Sea View",
    price: 8000,
    images: [
      "/image/baywatch/sup1.jpg",
      "/image/baywatch/sup2.jpg",
      "/image/baywatch/sup3.jpg",
    ],
    description:
      "Elevate your stay in our premium sea view suite featuring elegant interiors...",
    amenities: [
      "Jacuzzi",
      "Butler Service",
      "Premium bedding",
      "Ocean view",
      "Bluetooth speaker system",
      "Smart lighting",
    ],
    rules: {
      checkIn: ["Check-in from 1:00 PM - anytime", "Minimum check-in age - 18"],
      checkOut: ["Check-out 11:00 am"],
      specialInstructions: ["Front desk staff will greet guests on arrival."],
      childrenPolicy: ["Children are welcome", "Kids under 7 stay free"],
    },
  },
];

export default function BaywatchResort() {
  const [selectedRoom, setSelectedRoom] = useState(roomTypes[0]);
  const [nights, setNights] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [userData, setUserData] = useState({ name: "", email: "", phone: "" });
  const [paymentComplete, setPaymentComplete] = useState(false);

  const isFormValid =
    userData.name && userData.email && userData.phone && startDate;

  const total = selectedRoom.price * nights;
  const gst = total * 0.12;
  const discount = total * 0.15;
  const grandTotal = total + gst - discount;

  const generatePDF = () => {
    const doc = new jsPDF() as jsPDFWithPlugin;
    doc.setFillColor(0, 191, 255);
    doc.rect(0, 0, 210, 40, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text("Baywatch Resort Invoice", 105, 22, { align: "center" });

    doc.setTextColor(0);
    doc.setFontSize(14);
    doc.text("Customer Details", 14, 50);
    autoTable(doc, {
      startY: 55,
      head: [["Field", "Details"]],
      body: [
        ["Name", userData.name],
        ["Email", userData.email],
        ["Phone", userData.phone],
        ["Hotel", "Baywatch Resort"],
        ["Room Type", selectedRoom.name],
        ["Check-In Date", startDate],
        ["No. of Nights", nights.toString()],
      ],
      styles: { fontSize: 12, cellPadding: 4 },
      headStyles: { fillColor: [0, 191, 255] },
    });

    const priceY = doc.lastAutoTable?.finalY
      ? doc.lastAutoTable.finalY + 10
      : 120;
    doc.setFontSize(16);
    doc.setTextColor(0, 102, 204);
    doc.text("Billing Summary", 14, priceY);
    autoTable(doc, {
      startY: priceY + 5,
      head: [["Description", "Amount (₹)"]],
      body: [
        ["Price per Night", selectedRoom.price.toFixed(2)],
        ["Nights", nights.toString()],
        ["Subtotal", total.toFixed(2)],
        ["GST (12%)", gst.toFixed(2)],
        ["Discount (5%)", `-${discount.toFixed(2)}`],
        ["Grand Total", grandTotal.toFixed(2)],
      ],
      styles: { fontSize: 12, cellPadding: 4 },
      headStyles: { fillColor: [0, 191, 255] },
    });

    doc.setFontSize(12);
    doc.text(
      "Thank you for booking Baywatch Resort!",
      105,
      doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 15 : 200,
      { align: "center" }
    );
    doc.save("baywatch_resort_invoice.pdf");
  };

  const handlePayment = async () => {
    if (!isFormValid) return;

    try {
      // Step 1: Create order on backend
      const orderResponse = await fetch('/api/razorpay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: grandTotal })
      });

      if (!orderResponse.ok) {
        throw new Error('Failed to create order');
      }

      const order = await orderResponse.json();

      // Step 2: Initialize Razorpay with order_id
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "Baywatch Resort",
        description: `Booking for ${selectedRoom.name}`,
        image: "/image/logo.png",
        order_id: order.id, // Required for proper payment flow
        handler: function (response: any) {
          setPaymentComplete(true);
          generatePDF();
          alert("Payment successful! Your invoice has been generated.");
        },
        prefill: {
          name: userData.name,
          email: userData.email,
          contact: userData.phone,
        },
        notes: {
          nights: nights.toString(),
          room_type: selectedRoom.name,
          check_in: startDate,
        },
        theme: {
          color: "#00ffff",
        },
      };

      if (!options.key) {
        alert("Razorpay key is missing. Please check your environment variables.");
        return;
      }

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        alert("Payment failed. Please try again.");
        console.error(response.error);
      });

      rzp.open();
    } catch (error: any) {
      alert(`Error: ${error.message}`);
      console.error("Payment error:", error);
    }
  };
      console.error(response.error);
    });
    rzp.open();
  };

  return (
    <div className="min-h-screen bg-[#111827] text-white p-10">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <h1 className="text-4xl font-bold mb-12 text-center text-[#00ffff]">
        Baywatch Resort
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-14">
        {roomTypes.map((room) => (
          <div
            key={room.name}
            className={`rounded-2xl p-6 shadow-xl border transition hover:shadow-2xl ${selectedRoom.name === room.name
                ? "border-[#00ffff]"
                : "border-gray-700"
              }`}
          >
            <ImageGallery images={room.images} />
            <h2 className="text-3xl font-bold mt-4 text-blue-300">
              {room.name}
            </h2>
            <p className="text-gray-300 my-3">{room.description}</p>

            <h4 className="text-xl font-semibold mt-4">Amenities:</h4>
            <ul className="list-disc pl-6 text-gray-300 mb-4">
              {room.amenities.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>

            <h3 className="text-2xl font-bold text-green-400">
              ₹ {room.price} / night
            </h3>

            <button
              className={`mt-4 py-2 px-4 rounded-lg font-semibold ${selectedRoom.name === room.name
                  ? "bg-[#00ffff] text-black"
                  : "bg-gray-800 text-white hover:bg-gray-700"
                }`}
              onClick={() => setSelectedRoom(room)}
            >
              {selectedRoom.name === room.name ? "Selected" : "Choose Room"}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-20">
        <h3 className="text-3xl font-bold mb-6 text-center text-blue-400">
          Booking Summary
        </h3>

        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/2">
            <label>Number of Nights:</label>
            <input
              type="number"
              min={1}
              value={nights}
              onChange={(e) => setNights(Number(e.target.value))}
              className="ml-4 w-24 p-2 rounded-lg text-white bg-gray-800 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <div className="bg-[#1f2937] p-4 rounded-xl text-lg mt-6">
              <div className="mb-2">Subtotal: ₹ {total}</div>
              <div className="mb-2">GST (12%): ₹ {gst.toFixed(2)}</div>
              <div className="mb-2">
                Discount (15%): -₹ {discount.toFixed(2)}
              </div>
              <div className="font-bold text-2xl text-green-400">
                Grand Total: ₹ {grandTotal.toFixed(2)}
              </div>
            </div>
          </div>

          <div className="md:w-1/2 bg-white p-6 rounded-2xl text-black">
            <h3 className="text-2xl font-bold mb-4 text-blue-600 text-center">
              <Calendar size={20} className="inline mr-2" /> Booking Form
            </h3>

            <div className="space-y-4 mb-6">
              <input
                placeholder="Full Name"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                value={userData.name}
                onChange={(e) => setUserData({ ...userData, name: e.target.value })}
              />
              <input
                placeholder="Email Address"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                value={userData.email}
                onChange={(e) => setUserData({ ...userData, email: e.target.value })}
              />
              <input
                placeholder="Phone Number"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                value={userData.phone}
                onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
              />
              <div>
                <label className="text-sm font-semibold text-gray-600 block mb-1">Check-in Date</label>
                <input
                  type="date"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
            </div>

            <Pay
              amount={grandTotal}
              name={userData.name}
              email={userData.email}
              phone={userData.phone}
              bookingDetails={{
                vehicle: 'Hotel Stay',
                route: `Baywatch Resort - ${selectedRoom.name}`,
                date: startDate,
                time: '13:00',
                duration: nights
              }}
            />
          </div>
        </div>
      </div>
      <AIChatBot />
    </div>
  );
}
