import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Users, Award, Smile } from "lucide-react";
import AIChatBot from "../components/AIChabot/AIChatbot";

const stats = [
  { number: "18+", label: "Years Experience", icon: Award },
  { number: "200+", label: "Successful Rides", icon: Users },
  { number: "450+", label: "Happy Customers", icon: Smile },
];

const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0f172a] text-white font-sans selection:bg-cyan-500/30">
      {/* Background Elements */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-20 md:px-12">
        <AIChatBot />

        {/* Hero Section */}
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight">
              Driven by <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Service</span>
            </h1>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto">
              Since 2005, we have been redefining the travel experience with reliability, comfort, and a passion for the road.
            </p>
          </motion.div>
        </div>

        {/* Story Section */}
        <section className="mb-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h2 className="text-3xl font-bold text-white border-l-4 border-cyan-500 pl-4">Our Journey</h2>
            <div className="text-slate-300 space-y-4 leading-relaxed text-lg">
              <p>
                Consistent Cars (CC) was started in Pune in 2006 by Himaunshu Mandke, a professional from Travel industry. He had the experience of working in major companies like Cox&amp;Kings, Orix and Travel House. After gaining experience for about ten years, he started CC with one cab and one corporate customer.
              </p>
              <p>
                Over a period of 20 years, CC has served many corporate customers and has established a reputation for a safe and reliable auto rental company in Pune market. The Company has now expanded its service to individual customers and extended its market to Delhi.
              </p>
              <p>
                Pune and Delhi are the two hubs where CC operates and serves the customers for local and out-station travel from these two Metro cities.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative h-[400px] w-full rounded-3xl overflow-hidden shadow-2xl border border-white/10"
          >
            {/* About Image */}
            <div className="relative h-full w-full group">
              <Image
                src="/image/about-us.png"
                fill
                alt="Our Premium Fleet"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
            </div>
          </motion.div>
        </section>

        {/* Stats */}
        {/* <section className="mb-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-3xl text-center hover:bg-white/10 transition-all group"
              >
                <div className="flex justify-center mb-4">
                  <div className="p-4 rounded-full bg-cyan-500/20 text-cyan-400 group-hover:scale-110 transition-transform">
                    <stat.icon size={32} />
                  </div>
                </div>
                <h3 className="text-5xl font-bold text-white mb-2">{stat.number}</h3>
                <p className="text-slate-400 font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </section> */}

        {/* Customers Section */}
        <section className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Who We Serve</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                title: "Business Travelers",
                desc: "Timely airport transfers and corporate travel solutions for professionals who value punctuality.",
              },
              {
                title: "Tourists & Vacationers",
                desc: "Hassle-free journeys to Konkan, Goa, and Mahabaleshwar. Relax and enjoy the view.",
              },
              {
                title: "Families & Groups",
                desc: "Spacious SUVs and vans ensuring comfort for everyone on weekend getaways and family trips.",
              },
              {
                title: "Locals & Residents",
                desc: "Dependable intercity travel and special event transport for the people of Pune.",
              },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-white/10 p-8 rounded-2xl shadow-lg"
              >
                <h3 className="text-xl font-bold text-cyan-400 mb-3 block">
                  {item.title}
                </h3>
                <p className="text-slate-300 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>


        </section>

      </main>
    </div>
  );
};

export default About;
