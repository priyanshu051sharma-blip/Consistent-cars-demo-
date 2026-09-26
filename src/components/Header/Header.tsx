import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useRouter } from "next/router";
import { isAdminLoggedIn, clearAdminAuth } from "@/utils/auth";

const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsAdmin(isAdminLoggedIn());
  }, []);

  function handleLogout() {
    clearAdminAuth();
    setIsAdmin(false);
    router.push("/");
  }

  return (
    <header className="bg-gradient-to-r from-[#232526] via-[#2f2e2e] to-[#0f2027] shadow-lg relative z-10">
      <div className="h-1 w-full bg-gradient-to-r from-[#00ffff] via-[#00bfff] to-[#00ffff] animate-pulse" />
      <div className="relative mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
        <Link href="/" className="flex min-w-0 items-center">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <span className="relative">
              <svg
                className="h-8 w-8 shrink-0 text-[#00ffff] drop-shadow-lg sm:h-10 sm:w-10"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <rect x="3" y="11" width="18" height="6" rx="3" />
                <circle cx="7.5" cy="17.5" r="2.5" />
                <circle cx="16.5" cy="17.5" r="2.5" />
                <path d="M5 11V7a2 2 0 012-2h10a2 2 0 012 2v4" />
              </svg>
            </span>
            <span className="whitespace-nowrap text-xl font-extrabold text-white tracking-tight drop-shadow-lg sm:text-3xl">
              Consistent
              <span className="text-[#00ffff] animate-pulse bg-gradient-to-r from-[#00ffff] via-[#00bfff] to-[#00ffff] bg-clip-text text-transparent drop-shadow-lg shadow-cyan-500/50 animate-gradient-x" style={{textShadow: '0 0 20px rgba(0, 255, 255, 0.8), 0 0 40px rgba(0, 191, 255, 0.6)'}}>
                Cars
              </span>
            </span>
          </div>
        </Link>

        <div className="shrink-0 md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-11 w-11 items-center justify-center rounded-lg text-white hover:text-[#00ffff]"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        <nav className="space-x-8 flex-1 justify-center hidden md:flex">
          <Link
            href="/hotels"
            className="relative group text-gray-200 hover:text-[#00ffff] font-semibold transition text-lg"
          >
            Hotels
            <span className="block h-0.5 bg-[#00ffff] scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
          </Link>
          <Link
            href="/services"
            className="relative group text-gray-200 hover:text-[#00ffff] font-semibold transition text-lg"
          >
            Services
            <span className="block h-0.5 bg-[#00ffff] scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
          </Link>
          <Link
            href="/about"
            className="relative group text-gray-200 hover:text-[#00ffff] font-semibold transition text-lg"
          >
            About
            <span className="block h-0.5 bg-[#00ffff] scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
          </Link>
          <Link
            href="/contact"
            className="relative group text-gray-200 hover:text-[#00ffff] font-semibold transition text-lg"
          >
            Contact
            <span className="block h-0.5 bg-[#00ffff] scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
          </Link>
        </nav>

        <div className="hidden md:flex items-center flex-shrink-0 space-x-3">
          {!isAdmin ? (
            <Link href="/admin-login">
              <button className="flex items-center bg-gradient-to-r from-[#00ffff] to-[#00bfff] text-gray-900 px-4 py-2 rounded-full font-bold shadow-lg hover:from-[#00bfff] hover:to-[#00ffff] hover:text-gray-600 transition-all duration-200 border-2 border-[#00ffff]">
                Admin Login
              </button>
            </Link>
          ) : (
            <>
              <Link href="/admin-dashboard">
                <button className="px-5 py-2 rounded-full font-bold bg-gradient-to-r from-cyan-500/10 to-blue-500/10 text-cyan-400 border border-cyan-500/50 hover:bg-cyan-500 hover:text-white hover:border-cyan-400 transition-all shadow-[0_0_15px_rgba(6,182,212,0.15)] hover:shadow-[0_0_20px_rgba(6,182,212,0.4)]">
                  Dashboard
                </button>
              </Link>
              <button
                onClick={handleLogout}
                className="px-5 py-2 bg-red-500/10 text-red-400 rounded-full font-bold border border-red-500/30 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="px-4 pb-4 sm:px-6 md:hidden">
          <nav className="mt-3 flex flex-col gap-1">
            <Link
              href="/hotels"
              className="flex min-h-11 items-center text-lg font-medium text-gray-200 hover:text-[#00ffff]"
            >
              Hotels
            </Link>
            <Link
              href="/services"
              className="flex min-h-11 items-center text-lg font-medium text-gray-200 hover:text-[#00ffff]"
            >
              Services
            </Link>
            <Link
              href="/about"
              className="flex min-h-11 items-center text-lg font-medium text-gray-200 hover:text-[#00ffff]"
            >
              About
            </Link>
            <Link
              href="/contact"
              className="flex min-h-11 items-center text-lg font-medium text-gray-200 hover:text-[#00ffff]"
            >
              Contact
            </Link>
            {!isAdmin ? (
              <Link
                href="/admin-login"
                className="text-gray-900 bg-gradient-to-r from-[#00ffff] to-[#00bfff] px-4 py-2 rounded-full font-bold text-center shadow-md border border-[#00ffff]"
              >
                Admin Login
              </Link>
            ) : (
              <>
                <Link
                  href="/admin-dashboard"
                  className="text-gray-200 px-4 py-2 rounded-full font-bold text-center border border-[#00ffff]"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-white px-4 py-2 rounded-full bg-[#ff6b6b]"
                >
                  Logout
                </button>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
