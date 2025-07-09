import React from "react";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import AIChatBot from "../components/AIChabot/AIChatbot";

const Contact = () => {
  return (
    <div className="min-h-screen bg-[#222f35] py-20 px-6 md:px-20">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-[#00ffff] mb-4">Get in Touch</h2>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto">
          We'd love to hear from you! Whether you have a question about
          bookings, cars, pricing or anything else—our team is ready to answer
          all your questions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Contact Info */}
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Phone className="text-blue-600" />
            <div>
              <h4 className="text-lg font-semibold text-gray-200">Phone</h4>
              <p className="text-gray-400">+91 98765 43210</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Mail className="text-blue-600" />
            <div>
              <h4 className="text-lg font-semibold text-gray-200">Email</h4>
              <p className="text-gray-400">support@consistentcars.com</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <MapPin className="text-blue-600" />
            <div>
              <h4 className="text-lg font-semibold text-gray-400">
                Office Address
              </h4>
              <p className="text-gray-200">
                B-204, Business Plaza, FC Road, Pune, MH 411004
              </p>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <form className="bg-white rounded-3xl shadow-lg p-8 space-y-6">
          <div>
            <label className="block text-gray-700 mb-1 font-medium">Name</label>
            <input
              type="text"
              placeholder="Your Name"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1 font-medium">
              Email
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1 font-medium">
              Message
            </label>
            <textarea
              rows={5}
              placeholder="How can we help you?"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            ></textarea>
          </div>
          <button
            type="submit"
            className="flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 px-6 rounded-xl font-semibold hover:bg-blue-700 transition duration-200"
          >
            <Send size={18} /> Send Message
          </button>
        </form>
      </div>
      <AIChatBot />
    </div>
  );
};

export default Contact;
