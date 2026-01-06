// pages/admin-login.tsx
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { setAdminLoggedIn, isAdminLoggedIn } from "../utils/auth";
import { motion } from "framer-motion";
import { Lock, User } from "lucide-react";

export default function AdminLogin() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isAdminLoggedIn()) {
      router.replace("/admin-dashboard");
    }
  }, [router]);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (username === "admin" && password === "admin") {
      setAdminLoggedIn(true);
      router.push("/admin-dashboard");
    } else {
      setError("Invalid credentials.");
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0f172a] relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[100px]" />

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleLogin}
        className="relative z-10 bg-slate-800/50 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border border-white/10 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Admin Portal</h1>
          <p className="text-slate-400">Secure Access Required</p>
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-3 rounded-lg mb-6 text-center">{error}</div>}

        <div className="space-y-6">
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              type="text"
              placeholder="Username"
              className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:border-cyan-500 outline-none transition-colors placeholder:text-slate-500"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="Password"
              className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:border-cyan-500 outline-none transition-colors placeholder:text-slate-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold rounded-xl shadow-lg shadow-cyan-900/20 hover:scale-[1.02] transition-transform"
          >
            Access Dashboard
          </button>
        </div>
      </motion.form>
    </div>
  );
}
