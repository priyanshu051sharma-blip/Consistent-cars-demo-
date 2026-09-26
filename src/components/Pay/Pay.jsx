"use client";
import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";

const Pay = ({ amount, name, email, phone, bookingDetails }) => {
  const [receiptUrl, setReceiptUrl] = useState("");
  const numericAmount = Number(amount);
  const isTestMode = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.startsWith("rzp_test_");

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  useEffect(() => () => {
    if (receiptUrl) URL.revokeObjectURL(receiptUrl);
  }, [receiptUrl]);

  const handlePayment = async () => {
    if (typeof window === "undefined") {
      alert("Please use a modern browser to process payments.");
      return;
    }

    if (!name || !email || !phone) {
      alert("Please fill in all contact details first.");
      return;
    }

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
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
      const orderResponse = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Math.round(numericAmount * 100),
          currency: 'INR',
          receipt: `cc_${Date.now()}`,
        })
      });

      if (!orderResponse.ok) {
        const errorBody = await orderResponse.json().catch(() => ({}));
        throw new Error(errorBody?.error || 'Failed to create order');
      }

      const order = await orderResponse.json();

      if (!order?.order_id || !order?.amount) {
        throw new Error('Invalid payment order returned from server');
      }

      // Step 2: Razorpay options with order_id
      const options = {
        key: order.key_id || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "Consistent Cars",
        description: `Booking: ${bookingDetails?.vehicle || 'Vehicle'}`,
        order_id: order.order_id,
        handler: async function (response) {
          try {
            const verificationResponse = await fetch('/api/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            const verificationResult = await verificationResponse.json().catch(() => ({}));
            if (!verificationResponse.ok || !verificationResult.success) {
              throw new Error(verificationResult?.error || 'Payment verification failed');
            }
          } catch (error) {
            console.error("Failed to verify payment:", error);
            alert(`Payment was received, but verification failed: ${error.message}`);
            return;
          }

          let bookingSaveError;
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
                amount: numericAmount,
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
                signature: response.razorpay_signature
              })
            });
            const bookingResult = await bookingResponse.json().catch(() => ({}));
            if (!bookingResponse.ok) {
              throw new Error(bookingResult?.error || 'Booking confirmation failed');
            }
          } catch (error) {
            bookingSaveError = error;
            console.error("Failed to save booking:", error);
          }

          generatePDF(response, numericAmount);
          alert(bookingSaveError
            ? `Payment received and receipt generated, but booking confirmation failed: ${bookingSaveError.message}`
            : "Payment successful! Your receipt is ready.");
        },
        prefill: {
          name: name,
          email: email,
          contact: phone,
        },
        ...(isTestMode ? {
          config: {
            display: {
              blocks: {
                card: {
                  name: "Pay using Razorpay test card",
                  instruments: [{ method: "card" }],
                },
              },
              sequence: ["block.card"],
              preferences: { show_default_blocks: false },
            },
          },
        } : {}),
        theme: {
          color: "#0891b2", // Cyan-600
        },
        modal: {
          ondismiss: function () {
            alert("Payment was cancelled. Your booking was not confirmed.");
          },
        },
      };

      if (!options.key) {
        alert("Razorpay key is missing. Please check your environment variables.");
        return;
      }

      // Open Razorpay modal
      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response) {
        const reason = response?.error?.description || response?.error?.reason || "Please try again.";
        alert(`Payment failed: ${reason}`);
        console.error(response.error);
      });

      rzp.open();
    } catch (error) {
      alert(`Error: ${error.message}`);
      console.error("Payment error:", error);
    }
  };

  const generatePDF = (response, paidAmount) => {
    const doc = new jsPDF();
    const isHotelBooking = bookingDetails?.vehicle === "Hotel Stay";
    const duration = Math.max(1, Number(bookingDetails?.duration) || 1);
    const hotelBasePrice = Number(bookingDetails?.basePrice ?? paidAmount);

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
    if (bookingDetails?.totalAmount && Number(bookingDetails.totalAmount) !== paidAmount) {
      doc.text(`Booking Total: ₹${Number(bookingDetails.totalAmount).toFixed(2)}`, 14, 60);
      doc.text(`Balance Due: ₹${Number(bookingDetails.remainingAmount || 0).toFixed(2)}`, 14, 65);
    }

    // -- Customer Info --
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Billed To:", 14, bookingDetails?.totalAmount && Number(bookingDetails.totalAmount) !== paidAmount ? 78 : 70);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const customerY = bookingDetails?.totalAmount && Number(bookingDetails.totalAmount) !== paidAmount ? 84 : 76;
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
      doc.text(`Duration: ${duration} ${isHotelBooking ? "Night(s)" : "Days"}`, 110, 91);
      if (bookingDetails.totalAmount && Number(bookingDetails.totalAmount) !== paidAmount) {
        const paymentLabel = bookingDetails.isAdvance ? "Advance Paid" : "Amount Paid";
        doc.text(`${paymentLabel}: ₹${paidAmount.toFixed(2)}`, 110, 96);
        doc.text(`Balance Due: ₹${Number(bookingDetails.remainingAmount || 0).toFixed(2)}`, 110, 101);
      }
    }

    // -- Table --
    doc.autoTable({
      startY: 105,
      head: [["Description", "Details", "Amount"]],
      body: [
        [
          isHotelBooking ? `Hotel Stay (${duration} night${duration > 1 ? "s" : ""})` : `Vehicle Rental (${bookingDetails?.duration || 1} hours)`,
          isHotelBooking ? `Rate: ₹${(hotelBasePrice / duration).toFixed(2)}/night` : `Daily Rate: ₹${(paidAmount / Math.ceil((bookingDetails?.duration || 1) / 24)).toFixed(0)}/day`,
          `₹${paidAmount.toFixed(0)}`
        ],
        ["Taxes & Fees", "Included", "₹0.00"],
      ],
      foot: [["", "Total", `₹${paidAmount.toFixed(0)}`]],
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

    const receiptBlob = doc.output("blob");
    const url = URL.createObjectURL(receiptBlob);
    setReceiptUrl(url);

    const downloadLink = document.createElement("a");
    downloadLink.href = url;
    downloadLink.download = `ConsistentCars_Receipt_${response.razorpay_payment_id}.pdf`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    downloadLink.remove();
  };

  return (
    <div className="w-full min-w-0 space-y-3">
      <button
        onClick={handlePayment}
        type="button"
        className="min-h-12 w-full min-w-0 whitespace-normal rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-4 py-3 text-center text-sm font-bold leading-tight text-white shadow-lg shadow-cyan-900/20 transition-all hover:from-cyan-500 hover:to-blue-500 hover:scale-[1.02] active:scale-[0.98] sm:text-base"
      >
        Confirm &amp; Pay ₹{numericAmount.toLocaleString("en-IN")}
      </button>
      {receiptUrl && (
        <div className="rounded-lg border border-emerald-300/30 bg-emerald-950/30 p-3 text-center text-sm text-emerald-100">
          <p className="mb-2">Payment complete. Your receipt is ready.</p>
          <a
            href={receiptUrl}
            download="ConsistentCars_Receipt.pdf"
            className="inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-white px-4 py-3 font-semibold text-emerald-900 sm:w-auto"
          >
            Download receipt
          </a>
        </div>
      )}
      {isTestMode && (
        <p className="text-center text-xs text-amber-200">
          Test mode: use Razorpay test card 4100 2800 0000 1007, CVV 123, expiry 12/26, or test UPI test@razorpay. Real Google Pay/UPI will not complete test payments.
        </p>
      )}
    </div>
  );
};

export default Pay;
