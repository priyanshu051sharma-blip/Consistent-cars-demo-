import React from "react";
import Link from "next/link";

const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-to-r from-[#232526] via-[#2f2e2e] to-[#0f2027] text-white py-10 ">
      {/* Divider line at the top */}
      <div className="border-t border-gray-700 mb-8"></div>
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 sm:px-6 md:grid-cols-3">
        {/* Logo and Branding */}
        <div className="flex flex-col items-start space-y-3">
          <Link href="/" className="flex min-w-0 items-center">
            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
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
              <span className="whitespace-nowrap text-xl font-extrabold text-white tracking-tight drop-shadow-lg sm:text-3xl">
                Consistent
                <span className="text-[#00ffff] animate-gradient-x bg-gradient-to-r from-[#00ffff] via-[#00bfff] to-[#00ffff] bg-clip-text text-transparent">
                  Cars
                </span>
              </span>
            </div>
          </Link>
          <p className="text-sm text-gray-400">
            Clean and comfortable cabs for every journey.
          </p>
        </div>

        {/* Navigation Links */}
        <div className="flex flex-col space-y-2 text-sm md:text-base">
          <Link href="/hotels" className="hover:text-[#00ffff] transition">
            Hotels
          </Link>
          <Link href="/services" className="hover:text-[#00ffff] transition">
            Services
          </Link>
          <Link href="/about" className="hover:text-[#00ffff] transition">
            About Us
          </Link>
          <Link href="/contact" className="hover:text-[#00ffff] transition">
            Contact
          </Link>
          <Link href="/terms" className="hover:text-[#00ffff] transition">
            Terms & Conditions
          </Link>
        </div>

        {/* Footer Bottom */}
        <div className="flex flex-col items-start md:items-end text-sm text-gray-400">
          <p>
            &copy; {new Date().getFullYear()} ConsistentCars. All rights
            reserved.
          </p>
          <p className="mt-1">Crafted with passion and precision.</p>
        </div>
      </div>
      <style jsx>{`
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 3s ease-in-out infinite;
        }
        @keyframes gradient-x {
          0%,
          100% {
            background-position: left center;
          }
          50% {
            background-position: right center;
          }
        }
      `}</style>
    </footer>
  );
};

export default Footer;
