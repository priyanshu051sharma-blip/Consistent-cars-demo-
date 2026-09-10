import { useEffect, useRef, useState } from "react";

type LiveRouteMapProps = {
  origin?: string;
  destination?: string;
  city?: string;
};

const DEFAULT_CENTER = { lat: 20.5937, lng: 78.9629 };

export default function LiveRouteMap({ origin, destination, city }: LiveRouteMapProps) {
  const mapElement = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const directionsRendererRef = useRef<any>(null);
  const [mapsReady, setMapsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let attempts = 0;

    const waitForGoogleMaps = () => {
      if (cancelled) return;
      if ((window as any).google?.maps) {
        setMapsReady(true);
        return;
      }
      attempts += 1;
      if (attempts < 50) window.setTimeout(waitForGoogleMaps, 200);
    };

    waitForGoogleMaps();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!mapsReady || !mapElement.current) return;

    const maps = (window as any).google.maps;
    mapRef.current = new maps.Map(mapElement.current, {
      center: DEFAULT_CENTER,
      zoom: city ? 11 : 5,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
      clickableIcons: true,
    });

    directionsRendererRef.current = new maps.DirectionsRenderer({
      map: mapRef.current,
      suppressMarkers: false,
      preserveViewport: false,
      polylineOptions: {
        strokeColor: "#06b6d4",
        strokeOpacity: 0.9,
        strokeWeight: 6,
      },
    });

    if (city) {
      new maps.Geocoder().geocode({ address: `${city}, India` }, (results: any[], status: string) => {
        if (status === "OK" && results?.[0] && mapRef.current) {
          mapRef.current.setCenter(results[0].geometry.location);
          mapRef.current.setZoom(11);
        }
      });
    }

    return () => {
      directionsRendererRef.current?.setMap(null);
      directionsRendererRef.current = null;
      mapRef.current = null;
    };
  }, [mapsReady, city]);

  useEffect(() => {
    if (!mapsReady || !origin || !destination || !directionsRendererRef.current) return;

    const maps = (window as any).google.maps;
    new maps.DirectionsService().route(
      {
        origin,
        destination,
        travelMode: maps.TravelMode.DRIVING,
        provideRouteAlternatives: false,
      },
      (result: any, status: string) => {
        if (status === "OK" && result) {
          directionsRendererRef.current?.setDirections(result);
        }
      },
    );
  }, [mapsReady, origin, destination]);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-cyan-500/30 bg-slate-900/70">
      <div ref={mapElement} className="h-64 w-full md:h-72" aria-label="Live route map" />
      {!mapsReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/90 text-sm text-cyan-300">
          Loading live map...
        </div>
      )}
      {mapsReady && (!origin || !destination) && (
        <div className="pointer-events-none absolute bottom-3 left-3 rounded-lg bg-slate-950/85 px-3 py-2 text-xs text-slate-200">
          Enter pickup and drop locations to see the live route.
        </div>
      )}
    </div>
  );
}
