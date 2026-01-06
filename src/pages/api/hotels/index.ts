import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        try {
            const hotels = await prisma.hotel.findMany({
                include: { location: true },
                orderBy: { createdAt: 'desc' }
            });
            res.status(200).json(hotels);
        } catch (error) {
            console.error("Failed to fetch hotels:", error);
            res.status(500).json({ error: 'Failed to fetch hotels' });
        }
    } else if (req.method === 'POST') {
        try {
            const { name, image, pricePerNight, rating, description, amenities, locationId } = req.body;

            if (!name || !image || !pricePerNight || !locationId) {
                return res.status(400).json({ error: 'Missing required fields' });
            }

            const hotel = await prisma.hotel.create({
                data: {
                    name,
                    image,
                    pricePerNight: Number(pricePerNight),
                    rating: Number(rating) || 0,
                    description: description || '',
                    amenities: amenities || '',
                    locationId
                }
            });
            res.status(201).json(hotel);
        } catch (error) {
            console.error("Failed to create hotel:", error);
            res.status(500).json({ error: 'Failed to create hotel' });
        }
    } else if (req.method === 'DELETE') {
        try {
            const { id } = req.query;
            if (!id || Array.isArray(id)) {
                return res.status(400).json({ error: 'Invalid ID' });
            }

            await prisma.hotel.delete({
                where: { id }
            });
            res.status(200).json({ message: 'Hotel deleted successfully' });
        } catch (error) {
            console.error("Failed to delete hotel:", error);
            res.status(500).json({ error: 'Failed to delete hotel' });
        }
    } else {
        res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
