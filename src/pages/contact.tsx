import React from "react";
import { Mail, Phone, MapPin, Send, MessageSquare } from "lucide-react";
import AIChatBot from "../components/AIChabot/AIChatbot";
import { motion } from "framer-motion";

const Contact = () => {
  return (
    <div className="min-h-screen bg-[#0f172a] text-white font-sans selection:bg-cyan-500/30">
      {/* Background */}
      <div className="fixed top-[-20%] left-[-20%] w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-20 lg:px-20">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h2 className="mb-6 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-3xl font-bold text-transparent sm:text-5xl">Get in Touch</h2>
          <p className="mx-auto max-w-2xl text-base text-slate-400 sm:text-xl">
            Whether you have a question about bookings, pricing, or just want to say hello, our team is ready to answer all your questions.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-10"
          >
            <div className="space-y-8">
              <div className="group flex min-w-0 cursor-pointer items-start gap-4 rounded-2xl p-3 transition-all hover:bg-white/5 sm:gap-6 sm:p-4">
                <div className="shrink-0 rounded-xl bg-blue-600/20 p-3 text-blue-400 transition-transform group-hover:scale-110 sm:p-4">
                  <Phone size={24} />
                </div>
                <div className="min-w-0 [overflow-wrap:anywhere]">
                  <h4 className="mb-2 text-xl font-bold text-white sm:text-2xl">Call Us</h4>
                  <p className="text-base text-slate-400 sm:text-lg">+91 83088 06491, +91 86009 64138</p>
                  <p className="text-slate-500 text-sm">Mon-Fri, 9am - 6pm</p>
                </div>
              </div>

              <div className="group flex min-w-0 cursor-pointer items-start gap-4 rounded-2xl p-3 transition-all hover:bg-white/5 sm:gap-6 sm:p-4">
                <div className="shrink-0 rounded-xl bg-cyan-500/20 p-3 text-cyan-400 transition-transform group-hover:scale-110 sm:p-4">
                  <Mail size={24} />
                </div>
                <div className="min-w-0 [overflow-wrap:anywhere]">
                  <h4 className="mb-2 text-xl font-bold text-white sm:text-2xl">Email Us</h4>
                  <p className="text-base text-slate-400 sm:text-lg">consistent.car@rediffmail.com</p>
                  <p className="text-slate-500 text-sm">Online support 24/7</p>
                </div>
              </div>

              <div className="group flex min-w-0 cursor-pointer items-start gap-4 rounded-2xl p-3 transition-all hover:bg-white/5 sm:gap-6 sm:p-4">
                <div className="shrink-0 rounded-xl bg-purple-600/20 p-3 text-purple-400 transition-transform group-hover:scale-110 sm:p-4">
                  <MapPin size={24} />
                </div>
                <div className="min-w-0 [overflow-wrap:anywhere]">
                  <h4 className="mb-2 text-xl font-bold text-white sm:text-2xl">Visit Us</h4>
                  <p className="text-base text-slate-400 sm:text-lg">A2 Nikash Skies, Someshwar Wadi Pashan</p>
                  <p className="text-base text-slate-400 sm:text-lg">Pune, Maharashtra 411008</p>
                </div>
              </div>
            </div>

            {/* Map Placeholder */}
            <div className="w-full h-64 rounded-3xl overflow-hidden shadow-lg border border-white/10 relative bg-slate-800 flex items-center justify-center">
              <iframe
                src="https://maps.google.com/maps?q=A2+Nikash+Skies%2C+Someshwar+Wadi+Pashan%2C+Pune%2C+Maharashtra+411008&t=&z=15&ie=UTF8&iwloc=&output=embed"
                className="w-full h-full border-0 filter grayscale invert-[.1]"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur-md sm:rounded-[2.5rem] sm:p-8 md:p-12"
          >
            <h3 className="mb-8 flex items-center gap-3 text-2xl font-bold text-white sm:text-3xl">
              <MessageSquare className="text-cyan-400" /> Send a Message
            </h3>

            <form className="space-y-6">
              <div>
                <label className="block text-slate-400 mb-2 font-medium ml-1">Your Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-2 font-medium ml-1">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="john@example.com"
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-2 font-medium ml-1">
                  Message
                </label>
                <textarea
                  rows={4}
                  placeholder="How can we help you?"
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all resize-none"
                  required
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:from-cyan-500 hover:to-blue-500 transition-all shadow-lg shadow-cyan-900/20 transform hover:-translate-y-1"
              >
                <Send size={20} /> Send Message
              </button>
            </form>
          </motion.div>
        </div>
        <AIChatBot />
      </div>
    </div>
  );
};

export default Contact;
