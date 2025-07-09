import React, { useEffect, useState } from "react";
import { CarFront, Calendar, Phone } from "lucide-react";
import WhyChooseUs from "@/components/Why Choose Us/whychooseus";
import AIChatBot from "../components/AIChabot/AIChatbot";

const Home: React.FC = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className="w-full min-h-screen overflow-hidden">
      {/* Hero Section */}
      <div className="relative w-full h-[93vh]">
        {isClient && (
          <video
            className="absolute top-0 left-0 w-full h-[93vh] object-cover z-0"
            src="/vid/video.mp4"
            autoPlay
            loop
            muted
            playsInline
          ></video>
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/60 z-10 flex flex-col justify-center items-center text-white text-center px-6">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 text-[#00ffff]">
            CONSISTENT CARS
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mb-6">
            Drive Your Dream Car Today
          </p>
          <button className="text-lg px-6 py-3 rounded-2xl bg-[#00ffff] hover:bg-white text-black mouse-pointer font-semibold transition duration-300">
            Getting Started
          </button>
        </div>
      </div>

      <WhyChooseUs />

      {/* Features Section */}
      <section className="py-16 bg-[#3a505b] text-white">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
          <div className="flex flex-col items-center">
            <CarFront size={40} className="text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Wide Range of Cars</h3>
            <p>Choose from economy to luxury vehicles at your convenience.</p>
          </div>

          <div className="flex flex-col items-center">
            <Calendar size={40} className="text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Flexible Booking</h3>
            <p>Rent cars by the day, week, or month with easy cancellation.</p>
          </div>

          <div className="flex flex-col items-center">
            <Phone size={40} className="text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">24/7 Support</h3>
            <p>We’re always here to help you with your travel needs.</p>
          </div>
        </div>
      </section>
      <AIChatBot />
    </div>
  );
};

export default Home;
