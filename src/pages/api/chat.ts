import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../lib/prisma';

/* const prisma = new PrismaClient(); REMOVED */

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { message } = req.body;
    const lowerMsg = message.toLowerCase();

    try {
        let reply = "I'm not sure about that. Try asking about 'bookings', 'prices', or specific places like 'Baywatch Resort'.";

        // Simple keyword matching enhanced with DB lookup
        if (lowerMsg.includes('hotel') || lowerMsg.includes('resort') || lowerMsg.includes('stay')) {
            const hotels = await prisma.hotel.findMany({ take: 3 });
            const hotelNames = hotels.map((h: any) => h.name).join(', ');
            reply = `We have some great options like ${hotelNames}. You can book them on our Hotels page!`;
        } else if (lowerMsg.includes('car') || lowerMsg.includes('cab') || lowerMsg.includes('vehicle')) {
            const cars = await prisma.car.findMany({ take: 3 });
            const carNames = cars.map((c: any) => c.name).join(', ');
            reply = `We offer comfortable rides including ${carNames}. Check out our Services page for more!`;
        } else if (lowerMsg.includes('baywatch')) {
            const hotel = await prisma.hotel.findFirst({ where: { name: { contains: 'Baywatch' } } });
            if (hotel) {
                reply = `${hotel.name} is a top-rated stay with ${hotel.rating} stars! It features ${hotel.amenities} and costs ₹${hotel.pricePerNight}/night.`;
            }
        } else if (lowerMsg.includes('price') || lowerMsg.includes('cost')) {
            reply = "Our hotel prices start from ₹4500 and car rentals from ₹2000/day. Best rates guaranteed!";
        }

        res.status(200).json({ reply });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong.' });
    }
}
