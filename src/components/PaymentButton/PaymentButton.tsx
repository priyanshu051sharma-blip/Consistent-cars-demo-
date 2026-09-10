"use client";
import { useState, useEffect } from "react";

const PaymentButton = () => {
  const [loading, setLoading] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  useEffect(() => {
    // Load Razorpay script on component mount
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => {
      setRazorpayLoaded(true);
    };
    script.onerror = () => {
      console.error("Failed to load Razorpay script");
      alert("Failed to load payment gateway. Please refresh and try again.");
    };
    document.body.appendChild(script);
  }, []);

  const handlePayment = async () => {
    if (!razorpayLoaded) {
      alert("Payment gateway is loading. Please wait a moment and try again.");
      return;
    }

    if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID) {
      alert("Razorpay key is not configured. Contact support.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: 50000, currency: "INR" }),
      });

      if (!res.ok) {
        throw new Error("Failed to create payment order");
      }

      const order = await res.json();

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "Consistent Cars",
        description: "Rental Payment",
        order_id: order.order_id,
        handler: async function (response: any) {
          try {
            const verificationResponse = await fetch("/api/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(response),
            });
            const verification = await verificationResponse.json();
            if (!verificationResponse.ok || !verification.success) {
              throw new Error(verification.error || "Payment verification failed");
            }
            alert("Payment Successful! Payment ID: " + response.razorpay_payment_id);
          } catch (error) {
            console.error("Payment verification error:", error);
            alert("Payment was received but could not be verified. Please contact support.");
          }
        },
        prefill: {
          name: "Customer",
          email: "customer@example.com",
          contact: "9999999999",
        },
        theme: {
          color: "#6366f1",
        },
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.on("payment.failed", () => {
        alert("Payment failed. Please try again.");
      });
      razorpay.open();
    } catch (error) {
      console.error("Payment error:", error);
      alert("Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={loading || !razorpayLoaded}
      className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? "Processing..." : razorpayLoaded ? "Pay with UPI" : "Loading..."}
    </button>
  );
};

export default PaymentButton;
