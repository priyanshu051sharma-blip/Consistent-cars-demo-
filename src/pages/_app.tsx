import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Script from "next/script";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      {/* Load Google Maps JS (uses NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) */}
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
        strategy="afterInteractive"
      />
      <Header />
      <Component {...pageProps} />
      <Footer />
    </>
  );
}
