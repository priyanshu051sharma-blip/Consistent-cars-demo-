"use client";
import { useEffect } from "react";

const Checkout = ({ data }) => {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data?.amount * 100,
        currency: "INR",
        name: "Demo App",
        description: "Test Transaction",
        image: "/donate.png",
        handler: function (response) {
          alert("Payment Successful");
          window.location.reload();
        },
        prefill: {
          name: data?.name,
          email: data?.email,
          contact: data?.phone,
        },
        theme: {
          color: "#3e9c35",
        },
      };

      if (!options.key) {
        alert("Razorpay key is missing. Check your environment variables.");
        return;
      }

      const rzp = new window.Razorpay(options);
      rzp.open();
    };
  }, [data]);

  return null;
};

export default Checkout;
