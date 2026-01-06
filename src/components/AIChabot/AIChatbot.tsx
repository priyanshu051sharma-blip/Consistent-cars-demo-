"use client";
import { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send, Bot, User, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Message = {
  role: "bot" | "user";
  text: string;
};

const KNOWLEDGE_BASE = [
  {
    keywords: ["book", "reservation", "booking"],
    answer: "You can book a hotel or car directly through our Services page. Select your location, choose a vehicle, and proceed to payment!",
  },
  {
    keywords: ["price", "cost", "rates", "tariff"],
    answer: "Our prices start from ₹2000/day for cars and ₹4500/night for luxury resorts like Baywatch within Sindhudurg.",
  },
  {
    keywords: ["baywatch", "features", "amenities"],
    answer: "Baywatch Resort offers a swimming pool, spa, beachfront access, and complimentary breakfast. It's a top-rated choice!",
  },
  {
    keywords: ["contact", "support", "help", "phone", "email"],
    answer: "You can reach us at +91 98765 43210 or email support@consistentcars.com. We are available 24/7.",
  },
  {
    keywords: ["cancel", "refund", "policy"],
    answer: "Cancellations made 24 hours before the trip/check-in are fully refundable. Late cancellations may incur a small fee.",
  },
  {
    keywords: ["location", "where", "sindhudurg", "goa", "pune"],
    answer: "We operate primarily in Pune, with destinations including Sindhudurg, Goa, and Mahabaleshwar.",
  },
];

export default function AIChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { role: "bot", text: "Hello! I'm your Consistent Assistant. Ask me about bookings, prices, or our destinations!" },
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getSmartReply = (query: string) => {
    const lowerQuery = query.toLowerCase();

    // Find best match based on keyword intersection
    let bestMatch = { score: 0, answer: "" };

    KNOWLEDGE_BASE.forEach((item) => {
      const matchCount = item.keywords.filter(k => lowerQuery.includes(k)).length;
      if (matchCount > bestMatch.score) {
        bestMatch = { score: matchCount, answer: item.answer };
      }
    });

    if (bestMatch.score > 0) return bestMatch.answer;

    return "I'm not quite sure about that. Try asking about 'bookings', 'prices', or specific places like 'Baywatch Resort'. You can also contact support directly.";
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const userText = input.trim();
    setMessages((prev) => [...prev, { role: "user", text: userText }]);
    setInput("");

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "bot", text: data.reply }]);
    } catch (e) {
      console.error(e);
      // Fallback logic
      setTimeout(() => {
        const reply = getSmartReply(userText);
        setMessages((prev) => [...prev, { role: "bot", text: reply }]);
      }, 800);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-[350px] h-[500px] bg-slate-900 border border-cyan-500/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden backdrop-blur-xl"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-4 flex justify-between items-center shadow-md">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-white/20 rounded-lg">
                  <Bot size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Consistent AI</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-xs text-cyan-100">Online</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white transition-colors bg-white/10 hover:bg-white/20 rounded-full p-1">
                <X size={18} />
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-900/50 scrollbar-thin scrollbar-thumb-cyan-900/50">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === "user" ? "bg-cyan-500/20 text-cyan-400" : "bg-blue-600/20 text-blue-400"
                    }`}>
                    {msg.role === "user" ? <User size={14} /> : <Bot size={14} />}
                  </div>

                  <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${msg.role === "user"
                    ? "bg-cyan-600 text-white rounded-tr-sm"
                    : "bg-slate-800 text-slate-200 border border-white/5 rounded-tl-sm"
                    }`}>
                    {msg.text}
                  </div>
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/10 bg-slate-900">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  className="w-full pl-4 pr-12 py-3 bg-slate-800 border-none rounded-xl text-white placeholder-slate-500 text-sm focus:ring-2 focus:ring-cyan-500/50 outline-none transition-all"
                  placeholder="Ask about hotels, cars..."
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="absolute right-2 p-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-cyan-500/20 transition-all"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trigger Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="group relative w-16 h-16 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.4)] hover:shadow-[0_0_50px_rgba(6,182,212,0.6)] transition-shadow"
          >
            <div className="absolute inset-0 rounded-full bg-white/20 animate-ping opacity-75" />
            <div className="relative">
              <Sparkles className="absolute -top-1 -right-1 text-yellow-300 w-4 h-4 animate-bounce" />
              <Bot size={28} />
            </div>

            {/* Tooltip */}
            <div className="absolute right-full mr-4 bg-white text-slate-900 text-xs font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl">
              Need Help?
              <div className="absolute top-1/2 -right-1 w-2 h-2 bg-white transform rotate-45 -translate-y-1/2" />
            </div>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
