import { NextApiRequest, NextApiResponse } from 'next';

interface DistanceResult {
    distance: number;
    duration: string;
    estimated: boolean;
    provider?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    const { origin, destination } = req.body;

    if (!origin || !destination) {
        return res.status(400).json({ error: 'Origin and destination are required' });
    }

    try {
        const apiKey = process.env.GOOGLE_MAPS_API_KEY;
        const hasValidGoogleKey = Boolean(apiKey && !apiKey.includes('YourGoogleMapsAPIKeyHere'));

        if (hasValidGoogleKey) {
            const googleResult = await getDistanceFromGoogleMaps(origin, destination, apiKey as string);
            if (googleResult) {
                return res.status(200).json(googleResult);
            }
        }

        const osmResult = await getDistanceFromOpenStreetMap(origin, destination);
        return res.status(200).json(osmResult);
    } catch (error) {
        console.error('Distance calculation error:', error);
        const approximateDistance = estimateDistance(origin, destination);
        return res.status(200).json({
            distance: approximateDistance * 1000,
            duration: `${Math.ceil(approximateDistance / 40)} hrs`,
            estimated: true,
            provider: 'fallback'
        });
    }
}

async function getDistanceFromGoogleMaps(origin: string, destination: string, apiKey: string): Promise<DistanceResult | null> {
    const encodedOrigin = encodeURIComponent(origin);
    const encodedDestination = encodeURIComponent(destination);

    const response = await fetch(
        `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodedOrigin}&destinations=${encodedDestination}&key=${apiKey}`
    );

    const data = await response.json();

    if (data.status === 'OK' && data.rows?.[0]?.elements?.[0]?.status === 'OK') {
        const element = data.rows[0].elements[0];
        return {
            distance: element.distance.value,
            duration: element.duration.text,
            estimated: false,
            provider: 'google-maps'
        };
    }

    return null;
}

async function getDistanceFromOpenStreetMap(origin: string, destination: string): Promise<DistanceResult> {
    const headers = { 'User-Agent': 'consistent-cars-app/1.0' };

    const [originResponse, destinationResponse] = await Promise.all([
        fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(origin)}`, { headers }),
        fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(destination)}`, { headers })
    ]);

    const [originData, destinationData] = await Promise.all([
        originResponse.json() as Promise<any[]>,
        destinationResponse.json() as Promise<any[]>
    ]);

    const originPoint = originData[0];
    const destinationPoint = destinationData[0];

    if (!originPoint || !destinationPoint) {
        throw new Error('Unable to geocode the provided locations');
    }

    const routeResponse = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${originPoint.lon},${originPoint.lat};${destinationPoint.lon},${destinationPoint.lat}?overview=false`,
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
        provider: 'openstreetmap'
    };
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
