"use client";
import { useState } from "react";
import { MessageSquare, X, Send } from "lucide-react";

export default function AIChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { role: "bot", text: "Hi! How can I help you today?" },
  ]);

  const answers: Record<string, string> = {
    "how to book":
      "Click on any room, select dates and confirm payment to book.",
    "what are the check-in timings":
      "Check-in is from 1 PM. Checkout is at 11 AM.",
    "is breakfast included":
      "Yes, complimentary breakfast is included with every booking.",
    "are pets allowed": "Unfortunately, pets are not allowed at this property.",
    "can i cancel my booking":
      "Yes, cancellation is allowed up to 24 hours before check-in.",
  };

  const getBotReply = (msg: string) => {
    msg = msg.toLowerCase();
    const key = Object.keys(answers).find((q) => msg.includes(q));
    return key
      ? answers[key]
      : "I'm not sure about that. You can contact our support team for more help.";
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const userText = input.trim();
    setMessages((prev) => [...prev, { role: "user", text: userText }]);
    setInput("");

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: getBotReply(userText) },
      ]);
    }, 600);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <div className="w-80 h-[460px] bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden border border-gray-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-cyan-400 text-black p-4 flex justify-between items-center">
            <span className="font-semibold">AI Assistant</span>
            <button onClick={() => setIsOpen(false)}>
              <X size={20} />
            </button>
          </div>

          {/* Chat Body */}
          <div className="flex-1 px-3 py-2 overflow-y-auto bg-gray-100 space-y-2 text-black">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`max-w-[80%] px-4 py-2 rounded-xl text-sm whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-blue-100 ml-auto"
                    : "bg-white border border-gray-300"
                }`}
              >
                {msg.text}
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-2 border-t bg-white flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Ask something..."
            />
            <button
              onClick={handleSend}
              className="p-2 text-blue-600 hover:text-blue-800"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg hover:scale-105 transition"
        >
          <MessageSquare size={24} />
        </button>
      )}
    </div>
  );
}
