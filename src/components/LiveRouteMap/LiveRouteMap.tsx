import { useEffect, useRef, useState } from "react";
import type * as Leaflet from "leaflet";

type LiveRouteMapProps = {
  origin?: string;
  destination?: string;
  city?: string;
  routeCoordinates?: [number, number][];
  originCoordinates?: [number, number];
  destinationCoordinates?: [number, number];
};

const DEFAULT_CENTER = { lat: 20.5937, lng: 78.9629 };

const CITY_MAPS: Record<string, { lat: number; lng: number; bbox: string }> = {
  delhi: { lat: 28.6139, lng: 77.209, bbox: "77.05,28.45,77.35,28.8" },
  pune: { lat: 18.5204, lng: 73.8567, bbox: "73.65,18.4,74.05,18.7" },
  goa: { lat: 15.4909, lng: 73.8278, bbox: "73.65,15.3,74.05,15.7" },
  mumbai: { lat: 19.076, lng: 72.8777, bbox: "72.7,18.85,73.05,19.3" },
};

export default function LiveRouteMap({ origin, destination, city, routeCoordinates, originCoordinates, destinationCoordinates }: LiveRouteMapProps) {
  const mapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const hasValidMapsKey = Boolean(
    mapsApiKey && !mapsApiKey.includes("YourGoogleMapsAPIKey") && !mapsApiKey.includes("your_google_maps")
  );
  const cityMap = CITY_MAPS[(city || "").toLowerCase()] || CITY_MAPS.pune;
  const mapElement = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const directionsRendererRef = useRef<any>(null);
  const leafletMapRef = useRef<Leaflet.Map | null>(null);
  const leafletLayersRef = useRef<Leaflet.LayerGroup | null>(null);
  const [mapsReady, setMapsReady] = useState(false);
  const [leafletReady, setLeafletReady] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<[number, number] | null>(null);

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
    if (hasValidMapsKey || !mapElement.current || leafletMapRef.current) return;

    let cancelled = false;
    import("leaflet").then(({ default: L }) => {
      if (cancelled || !mapElement.current) return;
      const map = L.map(mapElement.current, { zoomControl: true }).setView(
        [cityMap.lat, cityMap.lng],
        11,
      );
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(map);
      leafletMapRef.current = map;
      leafletLayersRef.current = L.layerGroup().addTo(map);
      setLeafletReady(true);

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => setCurrentLocation([position.coords.latitude, position.coords.longitude]),
          () => undefined,
          { enableHighAccuracy: true, timeout: 8000 },
        );
      }
    });

    return () => {
      cancelled = true;
      leafletMapRef.current?.remove();
      leafletMapRef.current = null;
      leafletLayersRef.current = null;
      setLeafletReady(false);
    };
  }, [hasValidMapsKey, cityMap.lat, cityMap.lng]);

  useEffect(() => {
    if (hasValidMapsKey || !leafletReady || !leafletMapRef.current || !leafletLayersRef.current) return;

    const map = leafletMapRef.current;
    const layers = leafletLayersRef.current;
    layers.clearLayers();
    const bounds: Leaflet.LatLngTuple[] = [];

    if (routeCoordinates?.length) {
      const route = routeCoordinates.map(([longitude, latitude]) => [latitude, longitude] as [number, number]);
      import("leaflet").then(({ default: L }) => {
        if (!leafletLayersRef.current || !leafletMapRef.current) return;
        L.polyline(route, { color: "#06b6d4", weight: 5, opacity: 0.9 }).addTo(layers);
      });
      bounds.push(...route);
    }
    if (originCoordinates) {
      import("leaflet").then(({ default: L }) => L.circleMarker(originCoordinates, { radius: 8, color: "#16a34a", fillColor: "#4ade80", fillOpacity: 1 }).bindPopup("Pickup").addTo(layers));
      bounds.push(originCoordinates);
    }
    if (destinationCoordinates) {
      import("leaflet").then(({ default: L }) => L.circleMarker(destinationCoordinates, { radius: 8, color: "#dc2626", fillColor: "#f87171", fillOpacity: 1 }).bindPopup("Drop").addTo(layers));
      bounds.push(destinationCoordinates);
    }
    if (currentLocation) {
      import("leaflet").then(({ default: L }) => L.circleMarker(currentLocation, { radius: 8, color: "#2563eb", fillColor: "#60a5fa", fillOpacity: 1 })
        .bindPopup("Your current location")
        .addTo(layers));
      bounds.push(currentLocation);
    }
    if (bounds.length) map.fitBounds(bounds, { padding: [24, 24] });
  }, [hasValidMapsKey, leafletReady, routeCoordinates, originCoordinates, destinationCoordinates, currentLocation]);

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
      {!hasValidMapsKey && !routeCoordinates?.length && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-slate-950/75 px-3 py-2 text-xs text-white">
          Enter pickup and drop locations to draw the route. Blue marker shows your current location when permission is granted.
        </div>
      )}
      {hasValidMapsKey && !mapsReady && (
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
