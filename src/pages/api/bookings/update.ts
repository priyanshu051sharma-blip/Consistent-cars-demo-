import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'PUT') {
        try {
            const { id, status } = req.body;
            if (!id || !status) {
                return res.status(400).json({ error: 'Missing id or status' });
            }

            const booking = await prisma.booking.update({
                where: { id },
                data: { status }
            });

            return res.status(200).json(booking);
        } catch (error) {
            return res.status(500).json({ error: 'Failed to update booking' });
        }
    } else {
        res.setHeader('Allow', ['PUT']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
