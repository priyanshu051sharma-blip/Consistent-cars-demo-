import type { NextApiRequest, NextApiResponse } from "next";

type SearchResult = {
    id: string;
    name: string;
    displayName: string;
    latitude: number;
    longitude: number;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") {
        res.setHeader("Allow", "GET");
        return res.status(405).json({ error: "Method not allowed" });
    }

    const query = typeof req.query.q === "string" ? req.query.q.trim() : "";
    const city = typeof req.query.city === "string" ? req.query.city.trim() : "";

    if (query.length < 2) return res.status(200).json([]);

    const scopedQuery = city && !query.toLowerCase().includes(city.toLowerCase())
        ? `${query}, ${city}, India`
        : `${query}, India`;

    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=50&countrycodes=in&q=${encodeURIComponent(scopedQuery)}`,
            { headers: { "User-Agent": "consistent-cars/1.0 contact@consistentcars.com" } }
        );

        const places = response.ok ? await response.json() : [];
        const results = mapNominatimResults(places);
        const fallbackResults = results.length > 0 ? results : await searchWithPhoton(scopedQuery);

        res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");
        return res.status(200).json(fallbackResults);
    } catch (error) {
        console.warn("Nominatim location search failed, using fallback:", error);
        const fallbackResults = await searchWithPhoton(scopedQuery);
        if (fallbackResults.length > 0) return res.status(200).json(fallbackResults);
        return res.status(502).json({ error: "Location search unavailable" });
    }
}

function mapNominatimResults(places: any): SearchResult[] {
    return Array.isArray(places)
        ? places.map((place: any) => ({
            id: String(place.place_id),
            name: place.name || place.display_name.split(",")[0],
            displayName: place.display_name,
            latitude: Number(place.lat),
            longitude: Number(place.lon),
        })).filter((place) => Number.isFinite(place.latitude) && Number.isFinite(place.longitude))
        : [];
}

async function searchWithPhoton(query: string): Promise<SearchResult[]> {
    try {
        const response = await fetch(`https://photon.komoot.io/api/?limit=50&q=${encodeURIComponent(query)}`, {
            headers: { "User-Agent": "consistent-cars/1.0 contact@consistentcars.com" },
        });
        if (!response.ok) return [];

        const data = await response.json();
        return Array.isArray(data?.features)
            ? data.features.map((feature: any, index: number) => {
                const properties = feature.properties || {};
                const displayName = [properties.name, properties.city, properties.state, properties.country]
                    .filter(Boolean).join(", ");
                return {
                    id: String(properties.osm_id || `${query}-${index}`),
                    name: properties.name || displayName.split(",")[0],
                    displayName,
                    latitude: Number(feature.geometry?.coordinates?.[1]),
                    longitude: Number(feature.geometry?.coordinates?.[0]),
                };
            }).filter((place: SearchResult) => place.displayName && Number.isFinite(place.latitude) && Number.isFinite(place.longitude))
            : [];
    } catch (error) {
        console.warn("Photon location search failed:", error);
        return [];
    }
}