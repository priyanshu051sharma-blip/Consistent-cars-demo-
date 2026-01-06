import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        try {
            const { name, email, phone, type, details, amount } = req.body;

            const booking = await prisma.booking.create({
                data: {
                    customerName: name,
                    email,
                    phone,
                    type,
                    details: typeof details === 'string' ? details : JSON.stringify(details),
                    amount: parseFloat(amount),
                    status: 'Paid',
                }
            });

            return res.status(201).json(booking);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Failed to create booking' });
        }
    } else if (req.method === 'GET') {
        try {
            const bookings = await prisma.booking.findMany({
                orderBy: { createdAt: 'desc' }
            });
            return res.status(200).json(bookings);
        } catch (error) {
            return res.status(500).json({ error: 'Failed to fetch bookings' });
        }
    } else {
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
