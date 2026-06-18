import React, { useEffect, useState } from "react";
import { Calendar, Phone, ArrowRight, Star, ShieldCheck, MapPin } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import WhyChooseUs from "@/components/Why Choose Us/whychooseus"; // Assuming this component exists or will be updated independently
import AIChatBot from "../components/AIChabot/AIChatbot";

const Home: React.FC = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className="w-full min-h-screen bg-[#0f172a] text-white font-sans overflow-x-hidden selection:bg-cyan-500/30">

      {/* Hero Section */}
      <section className="relative w-full h-screen flex items-center justify-center overflow-hidden">
        {isClient && (
          <div className="absolute inset-0 w-full h-full z-0">
            <video
              className="w-full h-full object-cover opacity-60"
              src="/vid/video.mp4"
              autoPlay
              loop
              muted
              playsInline
            ></video>
            <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a]/80 via-[#0f172a]/40 to-[#0f172a]" />
          </div>
        )}

        {/* Hero Content */}
        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto space-y-8">
          {/* Large Animated Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="mb-8"
          >
            <div className="inline-block">
              <h2 className="text-7xl md:text-9xl font-black text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-300 bg-clip-text drop-shadow-2xl" style={{textShadow: '0 0 60px rgba(0, 255, 255, 0.8), 0 0 120px rgba(0, 191, 255, 0.6)'}}>
                CONSISTENT
              </h2>
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <h2 className="text-6xl md:text-8xl font-black text-transparent bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text" style={{textShadow: '0 0 50px rgba(0, 255, 255, 0.9)'}}>
                  CARS
                </h2>
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="inline-block mb-4 px-4 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-2xl font-semibold tracking-wider uppercase">
              Consistent and Convenient
            </div>
            {/* Removed heading and description as requested */}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link href="/services">
              <button className="px-8 py-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-lg transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] flex items-center gap-2 group">
                Book a Ride <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
            <Link href="/about">
              <button className="px-8 py-4 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold text-lg border border-white/10 backdrop-blur-sm transition-all flex items-center gap-2">
                Learn More
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Overview */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent mb-4">Why Choose Consistent Cars?</h2>
            <p className="text-slate-400 text-lg">We prioritize your comfort and safety above all else.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                icon: Calendar,
                title: "Flexible Booking",
                desc: "Book by the hour, day, or week. Easy modifications and transparent pricing with no hidden fees."
              },
              {
                icon: ShieldCheck,
                title: "Reliable",
                desc: "Round-the-clock support and roadside assistance ensuring you never face a problem alone."
              }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.2 }}
                viewport={{ once: true }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-3xl hover:bg-white/10 transition-colors group"
              >
                <div className="w-14 h-14 bg-cyan-500/20 rounded-2xl flex items-center justify-center text-cyan-400 mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon size={28} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* External Component Integration */}
      <div className="max-w-7xl mx-auto px-6 pb-20">
        <WhyChooseUs />
      </div>

      <AIChatBot />
    </div>
  );
};

export default Home;
