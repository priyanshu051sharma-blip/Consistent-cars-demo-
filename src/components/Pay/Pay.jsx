"use client";
import React, { useEffect } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const Pay = ({ amount, name, email, phone, bookingDetails }) => {
  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const handlePayment = () => {
    if (typeof window === "undefined" || !window.Razorpay) {
      alert("Razorpay SDK failed to load. Please refresh the page.");
      return;
    }

    if (!name || !email || !phone) {
      alert("Please fill in all contact details first.");
      return;
    }

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: Math.round(amount * 100),
      currency: "INR",
      name: "Consistent Cars",
      description: `Booking: ${bookingDetails?.vehicle || 'Vehicle'}`,
      image: "/image/logo.png",
      handler: async function (response) {
        // Payment Success
        console.log("Razorpay Response:", response);

        try {
          await fetch('/api/bookings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name,
              email,
              phone,
              type: bookingDetails?.vehicle === "Hotel Stay" ? "Hotel" : "Transport",
              details: bookingDetails,
              amount: amount
            })
          });
        } catch (error) {
          console.error("Failed to save booking:", error);
        }

        generatePDF(response);
        alert("Payment Successful! Invoice downloaded.");
      },
      prefill: {
        name: name,
        email: email,
        contact: phone,
      },
      theme: {
        color: "#0891b2", // Cyan-600 to match theme
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on("payment.failed", function (response) {
      alert("Payment failed. Please try again.");
      console.error(response.error);
    });

    rzp.open();
  };

  const generatePDF = (response) => {
    const doc = new jsPDF();

    // -- Brand Colors --
    const primaryColor = [8, 145, 178]; // Cyan-600
    const secondaryColor = [64, 64, 64]; // Gray-700

    // -- Header --
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 40, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(26);
    doc.setFont("helvetica", "bold");
    doc.text("INVOICE", 180, 25, { align: "right" });

    doc.setFontSize(16);
    doc.text("Consistent Cars", 14, 25);

    // -- Invoice Info --
    doc.setTextColor(0);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    const invoiceDate = new Date().toLocaleDateString();

    doc.text(`Date: ${invoiceDate}`, 14, 50);
    doc.text(`Payment ID: ${response.razorpay_payment_id}`, 14, 55);

    // -- Customer Info --
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Billed To:", 14, 70);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(name, 14, 76);
    doc.text(email, 14, 81);
    doc.text(phone, 14, 86);

    // -- Booking Details --
    if (bookingDetails) {
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Trip Details:", 110, 70);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(`Route: ${bookingDetails.route}`, 110, 76);
      doc.text(`Vehicle: ${bookingDetails.vehicle}`, 110, 81);
      doc.text(`Date: ${bookingDetails.date} at ${bookingDetails.time}`, 110, 86);
      doc.text(`Duration: ${bookingDetails.duration} Days`, 110, 91);
    }

    // -- Table --
    autoTable(doc, {
      startY: 105,
      head: [["Description", "Details", "Amount"]],
      body: [
        [
          `Vehicle Rental (${bookingDetails?.duration || 1} days)`,
          `Rate: ${amount / (bookingDetails?.duration || 1)}/day`,
          `Rs. ${amount.toFixed(2)}`
        ],
        ["Taxes & Fees", "Included", "Rs. 0.00"],
      ],
      foot: [["", "Total", `Rs. ${amount.toFixed(2)}`]],
      headStyles: { fillColor: primaryColor, textColor: 255, fontStyle: 'bold' },
      footStyles: { fillColor: secondaryColor, textColor: 255, fontStyle: 'bold' },
      theme: 'grid',
      columnStyles: {
        2: { halign: 'right' }
      }
    });

    // -- Footer --
    const finalY = doc.lastAutoTable.finalY + 30;
    doc.setTextColor(100);
    doc.setFontSize(10);
    doc.text("Thank you for choosing Consistent Cars! Safe travels.", 105, finalY, { align: "center" });

    doc.save("ConsistentCars_Receipt.pdf");
  };

  return (
    <button
      onClick={handlePayment}
      type="button"
      className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-cyan-900/20 transform transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
    >
      Confirm & Pay ₹{amount.toLocaleString()}
    </button>
  );
};

export default Pay;
