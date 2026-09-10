import "@/styles/globals.css";
import "leaflet/dist/leaflet.css";
import type { AppProps } from "next/app";
import Script from "next/script";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";

export default function App({ Component, pageProps }: AppProps) {
  const mapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const hasValidMapsKey = Boolean(
    mapsApiKey && !mapsApiKey.includes("YourGoogleMapsAPIKey") && !mapsApiKey.includes("your_google_maps")
  );

  return (
    <>
      {/* Load Google Maps JS (uses NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) */}
      {hasValidMapsKey && (
        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=${mapsApiKey}&libraries=places`}
          strategy="afterInteractive"
        />
      )}
      <Header />
      <Component {...pageProps} />
      <Footer />
    </>
  );
}
