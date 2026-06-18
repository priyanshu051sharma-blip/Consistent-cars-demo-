"use client";
import { useEffect, useState } from "react";

const Checkout = ({ data }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Check if Razorpay is already loaded
    if (window.Razorpay) {
      openPayment();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    
    script.onload = () => {
      openPayment();
    };

    script.onerror = () => {
      console.error("Failed to load Razorpay");
      alert("Failed to load payment gateway. Please refresh the page.");
      setIsProcessing(false);
    };

    document.body.appendChild(script);

    const openPayment = () => {
      if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID) {
        alert("Razorpay key is missing. Check your environment variables.");
        return;
      }

      if (!data?.amount || !data?.name || !data?.email || !data?.phone) {
        alert("Incomplete payment data. Please fill in all required fields.");
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.amount * 100,
        currency: "INR",
        name: "Consistent Cars",
        description: "Car Rental Booking",
        image: "/donate.png",
        handler: function (response) {
          alert(
            "Payment Successful! Payment ID: " + response.razorpay_payment_id
          );
          // Store payment info before reload
          localStorage.setItem(
            "lastPayment",
            JSON.stringify({
              paymentId: response.razorpay_payment_id,
              amount: data.amount,
              timestamp: new Date().toISOString(),
            })
          );
          window.location.reload();
        },
        prefill: {
          name: data.name,
          email: data.email,
          contact: data.phone,
        },
        theme: {
          color: "#3e9c35",
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
          },
        },
      };

      try {
        const rzp = new window.Razorpay(options);
        rzp.open();
      } catch (error) {
        console.error("Razorpay error:", error);
        alert("Payment processing failed. Please try again.");
        setIsProcessing(false);
      }
    };

    return () => {
      // Cleanup
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [data]);

  return (
    <div className="flex justify-center items-center p-4">
      <div className="text-center">
        <div className="inline-block animate-spin">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-indigo-600 rounded-full"></div>
        </div>
        <p className="mt-4 text-gray-600">Processing payment...</p>
      </div>
    </div>
  );
};

export default Checkout;
