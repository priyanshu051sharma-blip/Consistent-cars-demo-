// pages/admin-login.tsx
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { setAdminLoggedIn, isAdminLoggedIn } from "../utils/auth";

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
      setError("Invalid username or password. Hint: admin / admin");
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0f2027]">
      <form
        onSubmit={handleLogin}
        className="bg-gray-900 p-8 rounded-xl shadow-xl space-y-4 w-full max-w-sm border border-[#00ffff]"
      >
        <h1 className="text-2xl font-bold text-white text-center">
          Admin Login
        </h1>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          type="text"
          placeholder="Username"
          className="w-full p-3 rounded bg-gray-800 text-white outline-none"
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="Password"
          className="w-full p-3 rounded bg-gray-800 text-white outline-none"
        />
        <button
          type="submit"
          className="w-full py-3 bg-[#00ffff] text-gray-900 font-bold rounded hover:bg-[#00bfff] transition"
        >
          Login
        </button>
        <p className="text-sm text-gray-400 text-center">
          Use <strong>admin</strong> / <strong>admin</strong> to log in
          (client-side demo).
        </p>
      </form>
    </div>
  );
}
