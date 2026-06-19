import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    const { origin, destination } = req.body;

    if (!origin || !destination) {
        return res.status(400).json({ error: 'Origin and destination are required' });
    }

    // Google Maps API key from environment variables
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
        // Fallback: Calculate approximate distance based on keywords
        // This is a basic approximation for demo purposes
        const approximateDistance = estimateDistance(origin, destination);
        return res.status(200).json({
            distance: approximateDistance * 1000, // Convert to meters
            duration: `${Math.ceil(approximateDistance / 40)} hrs`,
            estimated: true
        });
    }

    try {
        const encodedOrigin = encodeURIComponent(origin);
        const encodedDestination = encodeURIComponent(destination);
        
        const response = await fetch(
            `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodedOrigin}&destinations=${encodedDestination}&key=${apiKey}`
        );

        const data = await response.json();

        if (data.status === 'OK' && data.rows[0]?.elements[0]?.status === 'OK') {
            const element = data.rows[0].elements[0];
            return res.status(200).json({
                distance: element.distance.value, // in meters
                duration: element.duration.text,
                estimated: false
            });
        } else {
            // Fallback to estimation
            const approximateDistance = estimateDistance(origin, destination);
            return res.status(200).json({
                distance: approximateDistance * 1000,
                duration: `${Math.ceil(approximateDistance / 40)} hrs`,
                estimated: true
            });
        }
    } catch (error) {
        console.error('Distance calculation error:', error);
        
        // Fallback estimation
        const approximateDistance = estimateDistance(origin, destination);
        return res.status(200).json({
            distance: approximateDistance * 1000,
            duration: `${Math.ceil(approximateDistance / 40)} hrs`,
            estimated: true
        });
    }
}

// Approximate distance estimation based on common routes
function estimateDistance(origin: string, destination: string): number {
    const o = origin.toLowerCase();
    const d = destination.toLowerCase();

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
