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

        if (!response.ok) return res.status(502).json({ error: "Location search unavailable" });

        const places = await response.json();
        const results: SearchResult[] = Array.isArray(places)
            ? places.map((place: any) => ({
                id: String(place.place_id),
                name: place.name || place.display_name.split(",")[0],
                displayName: place.display_name,
                latitude: Number(place.lat),
                longitude: Number(place.lon),
            })).filter((place) => Number.isFinite(place.latitude) && Number.isFinite(place.longitude))
            : [];

        res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");
        return res.status(200).json(results);
    } catch (error) {
        console.error("Location search error:", error);
        return res.status(502).json({ error: "Location search unavailable" });
    }
}