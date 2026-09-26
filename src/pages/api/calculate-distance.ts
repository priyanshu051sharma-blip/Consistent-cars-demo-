import { NextApiRequest, NextApiResponse } from 'next';

interface DistanceResult {
    distance: number;
    duration: string;
    estimated: boolean;
    provider?: string;
    trafficDuration?: string;
    trafficMultiplier?: number;
    trafficAvailable?: boolean;
    routeCoordinates?: [number, number][];
    originCoordinates?: [number, number];
    destinationCoordinates?: [number, number];
}

interface NormalizedLocation {
    origin: string;
    destination: string;
}

interface GoogleGeocodeResult {
    place_id: string;
    formatted_address: string;
    lat: number;
    lng: number;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    const { origin, destination, departureTime } = req.body;

    if (!origin || !destination) {
        return res.status(400).json({ error: 'Origin and destination are required' });
    }

    try {
        const configuredKey = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        const apiKey = configuredKey && !configuredKey.includes('YourGoogleMapsAPIKey') && !configuredKey.includes('your_google_maps')
            ? configuredKey
            : undefined;
        const hasValidGoogleKey = Boolean(apiKey && !apiKey.includes('YourGoogleMapsAPIKeyHere'));
        const normalizedLocations = await normalizeLocations(origin, destination);
        const finalOrigin = normalizedLocations?.origin ?? origin;
        const finalDestination = normalizedLocations?.destination ?? destination;

        if (hasValidGoogleKey) {
            const geocodedOrigin = await geocodeAddress(finalOrigin, apiKey as string);
            const geocodedDestination = await geocodeAddress(finalDestination, apiKey as string);
            const googleResult = await getDistanceFromGoogleDirections(geocodedOrigin, geocodedDestination, apiKey as string, departureTime);
            if (googleResult) {
                return res.status(200).json(googleResult);
            }
        }

        const osmResult = await getDistanceFromOpenStreetMap(finalOrigin, finalDestination);
        return res.status(200).json(osmResult);
    } catch (error) {
        console.error('Distance calculation error:', error);
        return res.status(422).json({ error: 'Unable to calculate an exact driving route for these locations.' });
    }
}

async function normalizeLocations(origin: string, destination: string): Promise<NormalizedLocation | null> {
    const hfKey = process.env.HUGGINGFACE_API_KEY;
    const openAiKey = process.env.OPENAI_API_KEY;

    if (hfKey && !hfKey.startsWith('your_')) {
        return normalizeWithHuggingFace(origin, destination, hfKey);
    }

    if (openAiKey && !openAiKey.startsWith('your_')) {
        return normalizeWithOpenAI(origin, destination, openAiKey);
    }

    return null;
}

function buildNormalizationPrompt(origin: string, destination: string) {
    return `You are an address normalization assistant for Indian ride-booking routes. Given an origin and destination, return a JSON object with keys \"origin\" and \"destination\". Use unambiguous, driver-friendly place names or full addresses in India. Do not add any extra text.\n\nOrigin: ${origin}\nDestination: ${destination}\n\nOutput example:\n{\n  \"origin\": \"Nizamuddin Railway Station, New Delhi, India\",\n  \"destination\": \"India Gate, New Delhi, India\"\n}`;
}

async function normalizeWithHuggingFace(origin: string, destination: string, apiKey: string): Promise<NormalizedLocation | null> {
    try {
        const model = process.env.HUGGINGFACE_MODEL || 'google/flan-t5-xl';
        const prompt = buildNormalizationPrompt(origin, destination);
        const response = await fetch('https://api-inference.huggingface.co/models/' + encodeURIComponent(model), {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ inputs: prompt, parameters: { max_new_tokens: 128 } })
        });
        const responseData = await response.json();
        const normalizedText = responseData?.generated_text || responseData?.[0]?.generated_text;
        if (!normalizedText) return null;
        return parseNormalizedLocation(normalizedText);
    } catch (error) {
        console.warn('Hugging Face normalization failed:', error);
        return null;
    }
}

async function normalizeWithOpenAI(origin: string, destination: string, apiKey: string): Promise<NormalizedLocation | null> {
    try {
        const prompt = buildNormalizationPrompt(origin, destination);
        const response = await fetch('https://api.openai.com/v1/responses', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
                input: prompt,
                max_output_tokens: 128
            })
        });
        const responseData = await response.json();
        const normalizedText = responseData.output_text ?? responseData.output?.[0]?.content?.[0]?.text;
        if (!normalizedText) return null;
        return parseNormalizedLocation(normalizedText);
    } catch (error) {
        console.warn('OpenAI normalization failed:', error);
        return null;
    }
}

async function geocodeAddress(address: string, apiKey: string): Promise<GoogleGeocodeResult> {
    const encodedAddress = encodeURIComponent(address);
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK' || !Array.isArray(data.results) || data.results.length === 0) {
        throw new Error(`Geocoding failed for address: ${address}`);
    }

    const bestResult = data.results[0];
    return {
        place_id: bestResult.place_id,
        formatted_address: bestResult.formatted_address,
        lat: bestResult.geometry.location.lat,
        lng: bestResult.geometry.location.lng
    };
}

function parseNormalizedLocation(text: string): NormalizedLocation | null {
    const trimmed = text.trim();
    try {
        const parsed = JSON.parse(trimmed);
        if (parsed?.origin && parsed?.destination) {
            return { origin: String(parsed.origin), destination: String(parsed.destination) };
        }
    } catch {
        // Try loose regex parsing if the model did not return valid JSON.
    }

    const originMatch = trimmed.match(/"origin"\s*:\s*"([^"]+)"/i);
    const destinationMatch = trimmed.match(/"destination"\s*:\s*"([^"]+)"/i);
    if (originMatch && destinationMatch) {
        return {
            origin: originMatch[1],
            destination: destinationMatch[1]
        };
    }

    return null;
}

// Use the Directions API for a route-aware driving distance and duration.
async function getDistanceFromGoogleDirections(origin: string | GoogleGeocodeResult, destination: string | GoogleGeocodeResult, apiKey: string, departureTime?: string): Promise<DistanceResult | null> {
    const originParam = typeof origin === 'string' ? encodeURIComponent(origin) : `place_id:${origin.place_id}`;
    const destinationParam = typeof destination === 'string' ? encodeURIComponent(destination) : `place_id:${destination.place_id}`;

    const departureTimestamp = getDepartureTimestamp(departureTime);
    const trafficParams = departureTimestamp ? `&departure_time=${departureTimestamp}&traffic_model=best_guess` : '';
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${originParam}&destination=${destinationParam}&mode=driving${trafficParams}&key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK' && Array.isArray(data.routes) && data.routes.length > 0) {
        // Sum up leg distances in case the route has multiple legs
        const route = data.routes[0];
        let distanceMeters = 0;
        let durationSeconds = 0;
        let trafficDurationSeconds = 0;
        let hasTrafficDuration = false;
        if (Array.isArray(route.legs)) {
            for (const leg of route.legs) {
                if (leg.distance && leg.distance.value) distanceMeters += leg.distance.value;
                if (leg.duration && leg.duration.value) durationSeconds += leg.duration.value;
                if (leg.duration_in_traffic && leg.duration_in_traffic.value) {
                    trafficDurationSeconds += leg.duration_in_traffic.value;
                    hasTrafficDuration = true;
                }
            }
        }

        const effectiveDurationSeconds = hasTrafficDuration ? trafficDurationSeconds : durationSeconds;
        return {
            distance: distanceMeters,
            duration: formatDuration(effectiveDurationSeconds),
            estimated: false,
            provider: 'google-directions',
            ...(hasTrafficDuration ? {
                trafficDuration: formatDuration(trafficDurationSeconds),
                trafficMultiplier: Math.min(1.75, Math.max(1, trafficDurationSeconds / Math.max(durationSeconds, 1))),
                trafficAvailable: true,
            } : { trafficAvailable: false }),
        };
    }

    return null;
}

async function getDistanceFromOpenStreetMap(origin: string, destination: string): Promise<DistanceResult> {
    const headers = { 'User-Agent': 'consistent-cars-app/1.0' };

    const originData = await fetchLocationCandidates(origin, headers);
    const destinationData = await fetchLocationCandidates(destination, headers);

    if (!originData.length || !destinationData.length) {
        throw new Error('Unable to geocode the provided locations');
    }

    const originCandidates = selectTopCandidates(originData, 3);
    const destinationCandidates = selectTopCandidates(destinationData, 3);

    let bestRoute: { distance: number; duration: number; provider: string; routeCoordinates?: [number, number][]; originCoordinates: [number, number]; destinationCoordinates: [number, number] } | null = null;

    for (const o of originCandidates) {
        for (const d of destinationCandidates) {
            try {
                const routeResponse = await fetch(
                    `https://router.project-osrm.org/route/v1/driving/${o.lon},${o.lat};${d.lon},${d.lat}?overview=full&geometries=geojson`,
                    { headers: { Accept: 'application/json' } }
                );
                const routeData = await routeResponse.json();
                const route = routeData.routes?.[0];
                if (route && route.distance > 0) {
                    if (!bestRoute || route.distance < bestRoute.distance) {
                        bestRoute = {
                            distance: route.distance,
                            duration: route.duration,
                            provider: 'openstreetmap',
                            routeCoordinates: route.geometry?.coordinates,
                            originCoordinates: [Number(o.lat), Number(o.lon)],
                            destinationCoordinates: [Number(d.lat), Number(d.lon)],
                        };
                    }
                }
            } catch (error) {
                // Ignore a single route failure and continue with other candidate pairs.
            }
        }
    }

    if (bestRoute) {
        return {
            distance: bestRoute.distance,
            duration: formatDuration(bestRoute.duration),
            estimated: false,
            provider: bestRoute.provider,
            trafficAvailable: false,
            trafficMultiplier: 1,
            routeCoordinates: bestRoute.routeCoordinates,
            originCoordinates: bestRoute.originCoordinates,
            destinationCoordinates: bestRoute.destinationCoordinates,
        };
    }

    // If actual routing fails for all candidate pairs, fall back to the closest pair by straight-line distance.
    let bestPair: { o: any; d: any; dist: number } | null = null;
    for (const o of originCandidates) {
        for (const d of destinationCandidates) {
            const dist = haversineDistance(Number(o.lat), Number(o.lon), Number(d.lat), Number(d.lon));
            if (!bestPair || dist < bestPair.dist) {
                bestPair = { o, d, dist };
            }
        }
    }

    if (!bestPair) throw new Error('No valid geocode pair found');

    const routeResponse = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${bestPair.o.lon},${bestPair.o.lat};${bestPair.d.lon},${bestPair.d.lat}?overview=full&geometries=geojson`,
        { headers: { Accept: 'application/json' } }
    );

    const routeData = await routeResponse.json();
    const route = routeData.routes?.[0];

    if (!route) {
        throw new Error('Unable to calculate route');
    }

    return {
        distance: route.distance,
        duration: formatDuration(route.duration),
        estimated: false,
        provider: 'openstreetmap',
        trafficAvailable: false,
        trafficMultiplier: 1,
        routeCoordinates: route.geometry?.coordinates,
        originCoordinates: [Number(bestPair.o.lat), Number(bestPair.o.lon)],
        destinationCoordinates: [Number(bestPair.d.lat), Number(bestPair.d.lon)],
    };
}

function getDepartureTimestamp(departureTime?: string): number | null {
    const parsed = departureTime ? Date.parse(departureTime) : Date.now();
    if (Number.isNaN(parsed)) return null;
    const now = Math.floor(Date.now() / 1000);
    return Math.max(now, Math.floor(parsed / 1000));
}

async function fetchLocationCandidates(location: string, headers: Record<string, string>): Promise<any[]> {
    const queries = buildLocationSearchVariants(location);
    for (const query of queries) {
        for (const useCountry of [true, false]) {
            try {
                const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=8&addressdetails=1${useCountry ? '&countrycodes=in' : ''}&q=${encodeURIComponent(query)}`;
                const response = await fetch(url, { headers });
                const data = (await response.json()) as any[];
                if (Array.isArray(data) && data.length > 0) {
                    return data;
                }
            } catch (error) {
                console.warn(`Geocoding query failed for '${query}' (country=${useCountry}):`, error);
            }
        }
    }

    for (const query of queries) {
        try {
            const response = await fetch(
                `https://photon.komoot.io/api/?limit=8&q=${encodeURIComponent(query)}`,
                { headers }
            );
            if (!response.ok) continue;
            const data = await response.json();
            const candidates = Array.isArray(data?.features)
                ? data.features.map((feature: any) => ({
                    display_name: [feature.properties?.name, feature.properties?.city, feature.properties?.state, feature.properties?.country]
                        .filter(Boolean).join(', '),
                    lat: feature.geometry?.coordinates?.[1],
                    lon: feature.geometry?.coordinates?.[0],
                    importance: feature.properties?.importance || 0,
                })).filter((place: any) => Number.isFinite(Number(place.lat)) && Number.isFinite(Number(place.lon)))
                : [];
            if (candidates.length > 0) return candidates;
        } catch (error) {
            console.warn(`Photon geocoding query failed for '${query}':`, error);
        }
    }

    return [];
}

function buildLocationSearchVariants(location: string): string[] {
    const normalized = location.trim();
    const lower = normalized.toLowerCase();
    const variants = [normalized];

    const commonRewrites: Array<[RegExp, string]> = [
        [/\bcp\b/, 'Connaught Place, New Delhi, India'],
        [/\bconnaught place\b/, 'Connaught Place, New Delhi, India'],
        [/\bspecific mall\b/, 'Pacific Mall'],
        [/\bmgf metro\b/, 'MGF Metropolitan Mall'],
        [/\bmgf metropolitan mall\b/, 'MGF Metropolitan Mall'],
        [/\bmega mall\b/, 'DLF Mega Mall'],
        [/\bpune airport\b/, 'Pune International Airport, Pune, India'],
        [/\bindira gandhi airport\b/, 'Indira Gandhi International Airport, New Delhi, India'],
        [/\bdelhi airport\b/, 'Indira Gandhi International Airport, New Delhi, India'],
    ];

    commonRewrites.forEach(([pattern, replacement]) => {
        if (pattern.test(lower)) {
            variants.unshift(replacement);
            variants.push(`${replacement}, India`);
        }
    });

    if (lower.includes('gurgaon') || lower.includes('gurugram')) {
        variants.push('Gurgaon, Haryana, India');
        variants.push('Gurugram, Haryana, India');
    }

    if (lower.includes('noida')) {
        variants.push('Noida, Uttar Pradesh, India');
    }

    if (lower.includes('delhi') || lower.includes('new delhi')) {
        variants.push('New Delhi, Delhi, India');
    }

    if (lower.includes('pune')) {
        variants.push('Pune, Maharashtra, India');
    }

    if (lower.includes('mall') && /(gurgaon|gurugram)/.test(lower)) {
        variants.push('Pacific Mall, Gurgaon, India');
        variants.push('MGF Metropolitan Mall, Gurgaon, India');
        variants.push('DLF Mega Mall, Gurgaon, India');
    }

    if (!lower.includes('india')) {
        variants.push(`${normalized}, India`);
    }

    return Array.from(new Set(variants)).slice(0, 8);
}

function selectTopCandidates(items: any[], limit = 3) {
    return items
        .slice()
        .sort((a, b) => (Number(b.importance) || 0) - (Number(a.importance) || 0))
        .slice(0, limit);
}

// Haversine distance returns kilometers between two lat/lon points
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const toRad = (v: number) => (v * Math.PI) / 180;
    const R = 6371; // km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function formatDuration(durationSeconds: number): string {
    const hours = Math.floor(durationSeconds / 3600);
    const minutes = Math.ceil((durationSeconds % 3600) / 60);
    if (hours > 0) {
        return `${hours} hr ${minutes} min`;
    }
    return `${minutes} min`;
}

// Approximate distance estimation based on common routes
function estimateDistance(origin: string, destination: string): number {
    const o = origin.toLowerCase();
    const d = destination.toLowerCase();

    const hasNizamuddin = o.includes('nizamuddin') || d.includes('nizamuddin');
    const hasIndiaGate = o.includes('india gate') || d.includes('india gate');
    const hasRailwayStation = o.includes('railway station') || d.includes('railway station');

    if (hasNizamuddin && hasIndiaGate) return 20;
    if ((hasNizamuddin || hasIndiaGate) && hasRailwayStation) return 20;

    // Delhi area distances (approximate in km)
    const distances: { [key: string]: number } = {
        'airport_city': 20,
        'airport_gurgaon': 15,
        'airport_noida': 25,
        'city_gurgaon': 30,
        'city_noida': 20,
        'gurgaon_noida': 40,
        'default_local': 80,
        'default_outstation': 250,
    };

    // Check for common locations
    const hasAirport = o.includes('airport') || d.includes('airport');
    const hasCity = o.includes('city') || o.includes('center') || d.includes('city') || d.includes('center');
    const hasGurgaon = o.includes('gurgaon') || d.includes('gurgaon');
    const hasNoida = o.includes('noida') || d.includes('noida');

    // Pune area distances
    const hasPune = o.includes('pune') || d.includes('pune');
    const hasMumbai = o.includes('mumbai') || d.includes('mumbai');

    if (hasPune && hasMumbai) return 150;
    if (hasPune && (o.includes('airport') || d.includes('airport'))) return 15;

    // Delhi combinations
    if (hasAirport && hasCity) return distances['airport_city'];
    if (hasAirport && hasGurgaon) return distances['airport_gurgaon'];
    if (hasAirport && hasNoida) return distances['airport_noida'];
    if (hasCity && hasGurgaon) return distances['city_gurgaon'];
    if (hasCity && hasNoida) return distances['city_noida'];
    if (hasGurgaon && hasNoida) return distances['gurgaon_noida'];

    // Check if it looks like outstation (mentions different cities)
    const cities = ['goa', 'jaipur', 'agra', 'shimla', 'manali', 'dehradun', 'haridwar', 'rishikesh', 'mussoorie'];
    const hasOutstationCity = cities.some(city => o.includes(city) || d.includes(city));

    if (hasOutstationCity) return distances['default_outstation'];

    // Default to local distance
    return distances['default_local'];
}
