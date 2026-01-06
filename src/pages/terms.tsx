import React from "react";
import { motion } from "framer-motion";
import { Shield, FileText, AlertCircle, CheckCircle, CreditCard, Clock } from "lucide-react";
import AIChatBot from "../components/AIChabot/AIChatbot";

const Terms = () => {
    return (
        <div className="min-h-screen bg-[#0f172a] text-white font-sans selection:bg-cyan-500/30">
            {/* Background Elements */}
            <div className="fixed top-[-10%] left-[20%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="fixed bottom-0 right-0 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none" />

            <main className="relative z-10 max-w-4xl mx-auto px-6 py-20">
                <AIChatBot />

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <div className="inline-block p-4 rounded-2xl bg-white/5 border border-white/10 mb-6 shadow-xl">
                        <Shield size={48} className="text-cyan-400" />
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-6">
                        Terms & Conditions
                    </h1>
                    <p className="text-slate-400 text-lg">
                        Please read these terms carefully before using our services. Transparency is our policy.
                    </p>
                </motion.div>

                {/* Content Sections */}
                <div className="space-y-8">
                    {[
                        {
                            title: "Booking Policy",
                            icon: FileText,
                            content: [
                                "Bookings must be made at least 4 hours in advance for local trips and 24 hours for outstation trips.",
                                "A valid government-issued ID proof is mandatory for all passengers during the journey.",
                                "The booking is confirmed only after receiving the booking advance or full payment."
                            ]
                        },
                        {
                            title: "Payments & Pricing",
                            icon: CreditCard,
                            content: [
                                "Prices are inclusive of driver allowance and fuel. Tolls, parking, and interstate taxes (if applicable) are to be paid extra by the customer.",
                                "Any additional distance or time beyond the booked package will be charged on a pro-rata basis.",
                                "We accept payments via UPI, Credit/Debit Cards, and Net Banking."
                            ]
                        },
                        {
                            title: "Cancellations & Refunds",
                            icon: Clock,
                            content: [
                                "Free cancellation if cancelled 24 hours before the scheduled pickup time.",
                                "50% cancellation fee applies if cancelled between 12-24 hours of pickup.",
                                "No refund for cancellations made within 12 hours of the scheduled pickup or for no-shows.",
                                "Refunds will be processed within 5-7 business days to the original payment method."
                            ]
                        },
                        {
                            title: "Passenger Conduct & Safety",
                            icon: AlertCircle,
                            content: [
                                "Consumption of alcohol and smoking inside the vehicle is strictly prohibited.",
                                "Consistent Cars reserves the right to refuse service to anyone behaving aggressively or inappropriately towards our drivers.",
                                "Passengers are responsible for their personal belongings. We are not liable for any loss or damage to luggage."
                            ]
                        },
                        {
                            title: "Vehicle Usage",
                            icon: CheckCircle,
                            content: [
                                "Our vehicles are commercially licensed and insured.",
                                "The vehicle will strictly follow the route discussed or the most optimal route via GPS. Detours may incur extra charges.",
                                "AC may be switched off in hilly areas to prevent engine overheating and ensure safety."
                            ]
                        }
                    ].map((section, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-colors"
                        >
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-cyan-500/20 rounded-xl text-cyan-400 shrink-0">
                                    <section.icon size={24} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white mb-4">{section.title}</h2>
                                    <ul className="space-y-3">
                                        {section.content.map((item, idx) => (
                                            <li key={idx} className="flex items-start gap-3 text-slate-300">
                                                <span className="mt-2 w-1.5 h-1.5 bg-cyan-500 rounded-full shrink-0" />
                                                <span className="leading-relaxed">{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Footer Note */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    className="text-center mt-16 pb-10"
                >
                    <p className="text-slate-500 text-sm">
                        Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </p>
                </motion.div>

            </main>
        </div>
    );
};

export default Terms;
