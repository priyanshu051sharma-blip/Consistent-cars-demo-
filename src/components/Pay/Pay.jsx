"use client";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  FaMoneyBillAlt,
  FaUserAlt,
  FaEnvelope,
  FaPhoneAlt,
} from "react-icons/fa";
import jsPDF from "jspdf";

const Pay = ({ amount }) => {
  const [checkoutData, setCheckoutData] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const onSubmit = (data) => {
    setCheckoutData({ ...data, amount });
    processPayment({ ...data, amount });
  };

  const processPayment = (data) => {
    if (typeof window === "undefined" || !window.Razorpay) {
      alert("Razorpay SDK failed to load. Please refresh the page.");
      return;
    }

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: Math.round(data.amount * 100),
      currency: "INR",
      name: "Baywatch Resort",
      description: "Room Booking",
      image: "/image/logo.png",
      handler: function (response) {
        alert("Payment Successful!");
        console.log("Razorpay Response:", response);
        generatePDF(data, response);
      },

      prefill: {
        name: data.name,
        email: data.email,
        contact: data.phone,
      },
      theme: {
        color: "#00ffff",
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on("payment.failed", function (response) {
      alert("Payment failed. Please try again.");
      console.error(response.error);
    });

    rzp.open();
  };

  const generatePDF = (data, response) => {
    const doc = new jsPDF();

    const baseAmount = data.amount;
    const gst = 0;
    const discount = 0;
    const total = baseAmount + gst - discount;

    // Header
    doc.setFillColor(0, 191, 255);
    doc.rect(0, 0, 210, 40, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text("ConsistentCars Invoice", 105, 20, { align: "center" });

    // Customer Info
    doc.setTextColor(0);
    doc.setFontSize(14);
    doc.text("Customer Details", 14, 50);

    doc.setFontSize(12);
    let y = 58;
    doc.text(`Name: ${data.name}`, 14, y);
    y += 8;
    doc.text(`Email: ${data.email}`, 14, y);
    y += 8;
    doc.text(`Phone: ${data.phone}`, 14, y);
    y += 8;
    doc.text(
      `Razorpay Payment ID: ${response.razorpay_payment_id || "N/A"}`,
      14,
      y
    );

    y += 16;
    doc.setFontSize(14);
    doc.text("Payment Summary", 14, y);

    y += 8;
    doc.setFontSize(12);
    doc.text(`Base Amount: ₹${baseAmount.toFixed(2)}`, 14, y);
    y += 8;
    doc.text(`GST: ₹${gst.toFixed(2)}`, 14, y);
    y += 8;
    doc.text(`Discount: ₹${discount.toFixed(2)}`, 14, y);
    y += 8;
    doc.text(`Total Paid: ₹${total.toFixed(2)}`, 14, y);

    y += 20;
    doc.setFontSize(12);
    doc.text("Thank you for booking with ConsistentCars!", 105, y, {
      align: "center",
    });

    doc.save("ConsistentCars_Invoice.pdf");
  };

  return (
    <div className="bg-gray-100 py-6 px-4 rounded-lg">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-4">
          <label className="font-bold flex items-center text-black">
            <FaUserAlt className="mr-2 text-black" />
            Name
          </label>
          <input
            type="text"
            {...register("name", { required: "Name is required" })}
            className="text-black border border-gray-300 px-4 py-2 rounded-lg w-full"
            placeholder="Enter your name"
          />
          {errors.name && (
            <p className="text-red-500 text-sm">{errors.name.message}</p>
          )}
        </div>

        <div className="mb-4">
          <label className="font-bold flex items-center text-black">
            <FaEnvelope className="mr-2 text-black" />
            Email
          </label>
          <input
            type="email"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /\S+@\S+\.\S+/,
                message: "Invalid email",
              },
            })}
            className="border text-black border-gray-300 px-4 py-2 rounded-lg w-full"
            placeholder="Enter your email"
          />
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email.message}</p>
          )}
        </div>

        <div className="mb-4">
          <label className="font-bold flex items-center text-black">
            <FaPhoneAlt className="mr-2 text-black" />
            Phone
          </label>
          <input
            type="tel"
            {...register("phone", { required: "Phone is required" })}
            className="border border-gray-300 text-black px-4 py-2 rounded-lg w-full"
            placeholder="Enter your phone number"
          />
          {errors.phone && (
            <p className="text-red-500 text-sm">{errors.phone.message}</p>
          )}
        </div>

        {/* Show Grand Total */}
        <div className="mb-4">
          <label className="font-bold flex items-center text-black">
            <FaMoneyBillAlt className="mr-2 text-black" />
            Grand Total
          </label>
          <input
            type="text"
            value={`₹ ${amount.toFixed(2)}`}
            readOnly
            className="bg-gray-200 border text-black border-gray-300 px-4 py-2 rounded-lg w-full cursor-not-allowed"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 font-semibold"
        >
          Pay ₹ {amount.toFixed(2)}
        </button>
      </form>
    </div>
  );
};

export default Pay;
