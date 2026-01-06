import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        try {
            const locations = await prisma.location.findMany({
                orderBy: { name: 'asc' }
            });
            res.status(200).json(locations);
        } catch (error) {
            console.error("Failed to fetch locations:", error);
            res.status(500).json({ error: 'Failed to fetch locations' });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
