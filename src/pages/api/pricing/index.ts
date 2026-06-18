import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        try {
            const { carId, location } = req.query;

            let whereClause: any = {};
            if (carId) whereClause.carId = carId;
            if (location) whereClause.location = location;

            const pricing = await prisma.pricing.findMany({
                where: whereClause,
                include: {
                    car: true,
                },
                orderBy: { location: 'asc' }
            });

            res.status(200).json(pricing);
        } catch (error) {
            console.error("Failed to fetch pricing:", error);
            res.status(500).json({ error: 'Failed to fetch pricing' });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
