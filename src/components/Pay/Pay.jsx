"use client";
import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import QRCode from "qrcode";

const Pay = ({ amount, name, email, phone, bookingDetails }) => {
  const [paymentQr, setPaymentQr] = useState("");

  useEffect(() => {
    const paymentLink = process.env.NEXT_PUBLIC_RAZORPAY_PAYMENT_LINK;
    const upiId = process.env.NEXT_PUBLIC_UPI_ID;
    if ((!paymentLink && !upiId) || !amount) return;

    const paymentUri = paymentLink
      ? `${paymentLink}${paymentLink.includes("?") ? "&" : "?"}amount=${encodeURIComponent(Number(amount).toFixed(2))}`
      : `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent("Consistent Cars")}&am=${encodeURIComponent(Number(amount).toFixed(2))}&cu=INR&tn=${encodeURIComponent(`Consistent Cars ${bookingDetails?.vehicle || "Cab booking"}`)}`;
    QRCode.toDataURL(paymentUri, { width: 240, margin: 2 })
      .then(setPaymentQr)
      .catch((error) => console.error("Payment QR generation failed:", error));
  }, [amount, bookingDetails?.vehicle]);

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const handlePayment = async () => {
    if (typeof window === "undefined") {
      alert("Please use a modern browser to process payments.");
      return;
    }

    if (!name || !email || !phone) {
      alert("Please fill in all contact details first.");
      return;
    }

    if (!amount || amount <= 0) {
      alert("Invalid booking amount. Please review the pricing details.");
      return;
    }

    try {
      // Load Razorpay script if not already loaded
      if (!window.Razorpay) {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        document.head.appendChild(script);
        
        // Wait for script to load
        await new Promise((resolve) => {
          script.onload = resolve;
        });
      }

      // Step 1: Create order on backend
      const orderResponse = await fetch('/api/razorpay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: amount })
      });

      if (!orderResponse.ok) {
        const errorBody = await orderResponse.json().catch(() => ({}));
        throw new Error(errorBody?.error || 'Failed to create order');
      }

      const order = await orderResponse.json();

      if (!order?.id || !order?.amount) {
        throw new Error('Invalid payment order returned from server');
      }

      // Step 2: Razorpay options with order_id
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "Consistent Cars",
        description: `Booking: ${bookingDetails?.vehicle || 'Vehicle'}`,
        image: "/image/logo.png",
        order_id: order.id, // This is required!
        handler: async function (response) {
          // Payment Success
          console.log("Razorpay Response:", response);

          try {
            const bookingResponse = await fetch('/api/bookings', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name,
                email,
                phone,
                type: bookingDetails?.vehicle === "Hotel Stay" ? "Hotel" : "Transport",
                details: bookingDetails,
                amount: amount,
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
                signature: response.razorpay_signature
              })
            });
            const bookingResult = await bookingResponse.json().catch(() => ({}));
            if (!bookingResponse.ok) {
              throw new Error(bookingResult?.error || 'Payment verification failed');
            }
          } catch (error) {
            console.error("Failed to save booking:", error);
            alert(`Payment received, but booking confirmation failed: ${error.message}`);
            return;
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
          color: "#0891b2", // Cyan-600
        },
      };

      if (!options.key) {
        alert("Razorpay key is missing. Please check your environment variables.");
        return;
      }

      // Open Razorpay modal
      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response) {
        alert("Payment failed. Please try again.");
        console.error(response.error);
      });

      rzp.open();
    } catch (error) {
      alert(`Error: ${error.message}`);
      console.error("Payment error:", error);
    }
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
    if (bookingDetails?.totalAmount && bookingDetails.totalAmount !== amount) {
      doc.text(`Booking Total: ₹${Number(bookingDetails.totalAmount).toFixed(2)}`, 14, 60);
      doc.text(`Balance Due: ₹${Number(bookingDetails.remainingAmount || 0).toFixed(2)}`, 14, 65);
    }

    // -- Customer Info --
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Billed To:", 14, bookingDetails?.totalAmount && bookingDetails.totalAmount !== amount ? 78 : 70);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const customerY = bookingDetails?.totalAmount && bookingDetails.totalAmount !== amount ? 84 : 76;
    doc.text(name, 14, customerY);
    doc.text(email, 14, customerY + 5);
    doc.text(phone, 14, customerY + 10);

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
      if (bookingDetails.totalAmount && bookingDetails.totalAmount !== amount) {
        doc.text(`Advance Paid: ₹${Number(amount).toFixed(2)}`, 110, 96);
        doc.text(`Balance Due: ₹${Number(bookingDetails.remainingAmount || 0).toFixed(2)}`, 110, 101);
      }
    }

    // -- Table --
    doc.autoTable({
      startY: 105,
      head: [["Description", "Details", "Amount"]],
      body: [
        [
          `Vehicle Rental (${bookingDetails?.duration || 1} hours)`,
          `Daily Rate: ₹${(amount / Math.ceil((bookingDetails?.duration || 1) / 24)).toFixed(0)}/day`,
          `₹${amount.toFixed(0)}`
        ],
        ["Taxes & Fees", "Included", "₹0.00"],
      ],
      foot: [["", "Total", `₹${amount.toFixed(0)}`]],
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
    <div className="space-y-3">
      {paymentQr && (
        <div className="rounded-xl bg-white p-4 text-center text-slate-900">
          <img src={paymentQr} alt="Scan to pay by UPI" className="mx-auto h-48 w-48" />
          <p className="mt-2 text-xs font-semibold">Scan to pay ₹{Number(amount).toLocaleString()} via Razorpay</p>
        </div>
      )}
      <button
        onClick={handlePayment}
        type="button"
        className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-cyan-900/20 transform transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
      >
        Confirm & Pay ₹{amount.toLocaleString()}
      </button>
    </div>
  );
};

export default Pay;
