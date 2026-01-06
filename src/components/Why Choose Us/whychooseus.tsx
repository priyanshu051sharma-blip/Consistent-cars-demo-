import React from "react";
import { motion } from "framer-motion";
import {
  FaUserTie,
  FaFemale,
  FaCarSide,
  FaBalanceScale,
  FaLock,
  FaClock,
  FaBolt,
  FaCheckCircle,
} from "react-icons/fa";

const features = [
  {
    icon: FaBolt,
    title: "Hassle-Free Booking",
    description: "Book a ride in seconds in just 4 easy steps — at your fingertips.",
  },
  {
    icon: FaUserTie,
    title: "Professional Drivers",
    description: "Trained and courteous drivers for a safe journey.",
  },
  {
    icon: FaFemale,
    title: "Safe for Women",
    description: "We prioritize safety and comfort for every woman.",
  },
  {
    icon: FaCarSide,
    title: "Clean Cabs",
    description: "Hygienic and well-maintained cars for your comfort.",
  },
  {
    icon: FaBalanceScale,
    title: "Value for Money",
    description: "Affordable rides without compromising on quality.",
  },
  {
    icon: FaLock,
    title: "We Value Your Security",
    description: "Strong safety measures for every passenger.",
  },
  {
    icon: FaCheckCircle,
    title: "Drive your Way",
    description: "Choose your vehicle type for a personalized experience.",
  },
  {
    icon: FaClock,
    title: "We Value Time",
    description: "Punctual pickups and timely drop-offs guaranteed.",
  },
];

const WhyChooseUs: React.FC = () => {
  return (
    <section className="py-24 bg-[#0f172a] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-white mb-4"
          >
            Why Choose <span className="text-cyan-400">US?</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
            className="text-slate-400 text-lg tracking-wide uppercase"
          >
            OUR AIM IS TO MAKE YOUR TRAVEL SAFE AND MEMORABLE.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ y: -10 }}
              viewport={{ once: true }}
              className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-3xl text-center group transition-all hover:bg-white/10 hover:shadow-xl hover:shadow-cyan-900/20"
            >
              <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full text-white shadow-lg group-hover:scale-110 transition-transform">
                <feature.icon size={28} />
              </div>
              <h4 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-300 transition-colors">
                {feature.title}
              </h4>
              <p className="text-slate-400 leading-relaxed text-sm">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
